<?php
defined( 'ABSPATH' ) || exit;

class DCB_Free_Order {

    public static function handle( WP_REST_Request $request ): WP_REST_Response {
        try {
            return self::process( $request );
        } catch ( Throwable $e ) {
            DCB_Logger::error( 'free_order', 'Unhandled exception: ' . $e->getMessage() );
            return DCB_Auth::generic_error();
        }
    }

    private static function process( WP_REST_Request $request ): WP_REST_Response {
        $body = $request->get_json_params();
        if ( ! is_array( $body ) ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Invalid request body.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        // --- Validate idempotency key ---
        $idempotency_key = DCB_Validator::idempotency_key( (string) ( $body['idempotency_key'] ?? '' ) );
        if ( false === $idempotency_key ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Missing or invalid idempotency key.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        // --- Check idempotency cache ---
        $cached = DCB_Idempotency::get( $idempotency_key );
        if ( null !== $cached ) {
            return new WP_REST_Response( $cached, 200 );
        }

        // --- Validate required customer fields ---
        $first_name = DCB_Validator::name( (string) ( $body['first_name'] ?? '' ) );
        if ( false === $first_name ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Invalid name.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        $email = DCB_Validator::email( (string) ( $body['email'] ?? '' ) );
        if ( false === $email ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Invalid email address.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        // --- Validate privacy policy acceptance ---
        if ( empty( $body['privacy_accepted'] ) || true !== $body['privacy_accepted'] ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Privacy policy acceptance is required.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        // --- 4-bucket rate limiting ---
        //
        // X-DCB-Client-IP is set by Astro before forwarding to this bridge. Astro uses
        // clientAddress (adapter-provided socket/proxy IP, validated as IPv4/IPv6) rather
        // than X-Forwarded-For, so the browser cannot forge it by manipulating request headers.
        //
        // When Astro cannot resolve a valid IP (no trustProxy config or loopback), Astro
        // sends 'unknown'. Per-IP and per-combo buckets are skipped for unknown IPs to
        // avoid over-blocking legitimate users who share the same proxy exit node.
        // Per-email and global buckets remain effective regardless of IP availability.
        //
        // Production validation required: see normalizeClientIp() in src/pages/api/checkout/free.ts.
        $client_ip  = trim( (string) ( $_SERVER['HTTP_X_DCB_CLIENT_IP'] ?? 'unknown' ) );
        if ( '' === $client_ip ) {
            $client_ip = 'unknown';
        }

        $email_hash = hash( 'sha256', strtolower( $email ) );
        $ip_known   = 'unknown' !== $client_ip;

        $rate_exceeded =
            ! DCB_Rate_Limit::check( DCB_Rate_Limit::make_key( 'fo_email',  $email_hash ), 10,  3600 ) ||
            ! DCB_Rate_Limit::check( DCB_Rate_Limit::make_key( 'fo_global', 'global' ),    200, 3600 );

        if ( ! $rate_exceeded && $ip_known ) {
            $ip_hash    = hash( 'sha256', $client_ip );
            $combo_hash = hash( 'sha256', strtolower( $email ) . '|' . $client_ip );
            $rate_exceeded =
                ! DCB_Rate_Limit::check( DCB_Rate_Limit::make_key( 'fo_ip',    $ip_hash ),    5, 900 ) ||
                ! DCB_Rate_Limit::check( DCB_Rate_Limit::make_key( 'fo_combo', $combo_hash ), 3, 900 );
        }

        if ( $rate_exceeded ) {
            DCB_Logger::warning( 'free_order', 'Rate limit exceeded' );
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Too many requests. Please try again later.', 'dokanelbanat-commerce-bridge' ) ],
                429
            );
        }

        // --- Validate optional fields ---
        $phone = '';
        if ( ! empty( $body['phone'] ) ) {
            $phone = DCB_Validator::phone( (string) $body['phone'] );
            if ( false === $phone ) {
                return new WP_REST_Response(
                    [ 'success' => false, 'message' => __( 'Invalid phone number.', 'dokanelbanat-commerce-bridge' ) ],
                    400
                );
            }
        }

        $marketing_consent = ! empty( $body['marketing_consent'] );

        // --- Validate product ID ---
        $product_id = DCB_Validator::product_id( $body['product_id'] ?? 0 );
        if ( false === $product_id ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Invalid product.', 'dokanelbanat-commerce-bridge' ) ],
                400
            );
        }

        // --- Load and validate product server-side ---
        $product = wc_get_product( $product_id );

        if ( ! $product || 'publish' !== $product->get_status() ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Product not available.', 'dokanelbanat-commerce-bridge' ) ],
                422
            );
        }

        if ( ! $product->is_virtual() ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Only virtual products are eligible.', 'dokanelbanat-commerce-bridge' ) ],
                422
            );
        }

        if ( ! $product->is_downloadable() ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Only downloadable products are eligible.', 'dokanelbanat-commerce-bridge' ) ],
                422
            );
        }

        if ( (float) $product->get_price() !== 0.0 ) {
            return new WP_REST_Response(
                [ 'success' => false, 'message' => __( 'Only free products are eligible.', 'dokanelbanat-commerce-bridge' ) ],
                422
            );
        }

        // --- Create WooCommerce guest order ---
        $order = wc_create_order(
            [
                'status'      => 'pending',
                'customer_id' => 0,
            ]
        );

        if ( is_wp_error( $order ) ) {
            DCB_Logger::error( 'free_order', 'wc_create_order failed', [ 'product_id' => $product_id ] );
            return DCB_Auth::generic_error();
        }

        // --- Add product ---
        $item_id = $order->add_product( $product, 1 );
        if ( ! $item_id ) {
            $order->delete( true );
            DCB_Logger::error( 'free_order', 'add_product failed', [ 'product_id' => $product_id ] );
            return DCB_Auth::generic_error();
        }

        // --- Set billing details ---
        $order->set_billing_first_name( $first_name );
        $order->set_billing_last_name( '' );
        $order->set_billing_email( $email );
        $order->set_billing_phone( $phone );
        $order->set_billing_company( '' );
        $order->set_billing_address_1( '' );
        $order->set_billing_address_2( '' );
        $order->set_billing_city( '' );
        $order->set_billing_state( '' );
        $order->set_billing_postcode( '' );
        $order->set_billing_country( '' );

        // --- Store marketing consent metadata ---
        $order->add_meta_data( '_dcb_marketing_consent', $marketing_consent ? 'yes' : 'no', true );
        $order->add_meta_data( '_dcb_marketing_consent_timestamp', gmdate( 'c' ), true );
        $order->add_meta_data( '_dcb_marketing_consent_source', 'checkout', true );

        // --- Store privacy acceptance metadata ---
        $order->add_meta_data( '_dcb_privacy_accepted', 'yes', true );
        $order->add_meta_data( '_dcb_privacy_accepted_timestamp', gmdate( 'c' ), true );
        $order->add_meta_data( '_dcb_privacy_source', 'checkout', true );
        $order->add_meta_data( '_dcb_privacy_policy_version', '1.0', true );

        // --- Hook: allow future paid-order support ---
        do_action( 'dcb_before_order_complete', $order, $product );

        // --- Calculate totals ---
        $order->calculate_totals();

        // Grant permissions BEFORE the status transition so the WC_Emails-generated customer
        // email (fired by woocommerce_order_status_pending_to_completed) already includes download
        // items. The subsequent woocommerce_order_status_completed hook calls
        // wc_downloadable_product_permissions again, which is idempotent (no-op) when
        // $force_regenerate is false (the default).
        wc_downloadable_product_permissions( $order->get_id() );

        // Transition to 'completed' via the WooCommerce API. This:
        //   1. Saves the order
        //   2. Fires woocommerce_order_status_pending_to_completed → WC_Emails sends customer email
        //   3. Fires woocommerce_order_status_completed → WC grants permissions (idempotent)
        // Using update_status() instead of payment_complete() + manual do_action avoids
        // duplicate status transitions and ensures the email is sent through the WC_Emails class.
        $order->update_status( 'completed', __( 'Free digital order.', 'dokanelbanat-commerce-bridge' ) );
        $order_number = $order->get_order_number();

        // --- Build safe response ---
        $masked_email = self::mask_email( $email );
        $payload = [
            'success'      => true,
            'order_number' => (string) $order_number,
            'masked_email' => $masked_email,
        ];

        DCB_Logger::info( 'free_order', 'Order created', [ 'order_id' => $order->get_id(), 'product_id' => $product_id ] );

        // --- Cache idempotency result ---
        DCB_Idempotency::set( $idempotency_key, $payload );

        return new WP_REST_Response( $payload, 201 );
    }

    private static function mask_email( string $email ): string {
        $parts  = explode( '@', $email, 2 );
        $local  = $parts[0] ?? '';
        $domain = $parts[1] ?? '';

        $visible = mb_substr( $local, 0, min( 2, mb_strlen( $local ) ) );
        return $visible . '***@' . $domain;
    }
}
