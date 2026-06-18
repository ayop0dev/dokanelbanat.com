<?php
defined( 'ABSPATH' ) || exit;

class DCB_Recover {

    private const COOLDOWN_SECONDS = 300;
    private const MAX_ATTEMPTS     = 3;
    private const WINDOW_SECONDS   = 600;

    public static function handle( WP_REST_Request $request ): WP_REST_Response {
        try {
            return self::process( $request );
        } catch ( Throwable $e ) {
            DCB_Logger::error( 'recover', 'Unhandled exception: ' . $e->getMessage() );
            return self::public_response();
        }
    }

    private static function process( WP_REST_Request $request ): WP_REST_Response {
        $body = $request->get_json_params();
        if ( ! is_array( $body ) ) {
            return self::public_response();
        }

        if ( ! empty( $body['website'] ) ) {
            return self::public_response();
        }

        $email = DCB_Validator::email( (string) ( $body['email'] ?? '' ) );
        if ( false === $email ) {
            return self::public_response();
        }

        $order_number = DCB_Validator::order_number( (string) ( $body['order_number'] ?? '' ) );
        if ( false === $order_number ) {
            return self::public_response();
        }

        $client_ip = self::get_client_ip( $request );

        $rate_key = DCB_Rate_Limit::recovery_key( $email, $order_number, $client_ip );

        if ( ! DCB_Rate_Limit::check( $rate_key, self::MAX_ATTEMPTS, self::WINDOW_SECONDS ) ) {
            DCB_Logger::warning( 'recover', 'Rate limit exceeded' );
            return self::public_response();
        }

        $cooldown_key = 'dcb_cooldown_' . $rate_key;
        if ( get_transient( $cooldown_key ) ) {
            return self::public_response();
        }

        set_transient( $cooldown_key, 1, self::COOLDOWN_SECONDS );

        self::attempt_recovery( $email, $order_number );

        return self::public_response();
    }

    private static function attempt_recovery( string $email, string $order_number ): void {
        // Fast path: when the order number equals the WC order ID (the common case),
        // wc_get_order() is an O(1) indexed primary-key lookup.
        $matched = null;
        if ( ctype_digit( $order_number ) ) {
            $candidate = wc_get_order( (int) $order_number );
            if (
                $candidate instanceof WC_Order &&
                strtolower( (string) $candidate->get_billing_email() ) === strtolower( $email )
            ) {
                $matched = $candidate;
            }
        }

        // Fallback: search all orders for this email. limit=-1 is required because the 5-order
        // cap silently excludes older purchases. HPOS indexes wc_orders.billing_email so this
        // is efficient even for customers with many orders.
        if ( null === $matched ) {
            $orders = wc_get_orders(
                [
                    'billing_email' => $email,
                    'limit'         => -1,
                    'type'          => 'shop_order',
                ]
            );

            if ( empty( $orders ) ) {
                DCB_Logger::info( 'recover', 'No orders for email hash', [ 'hash' => hash( 'sha256', $email ) ] );
                return;
            }

            foreach ( $orders as $order ) {
                if ( (string) $order->get_order_number() === $order_number ) {
                    $matched = $order;
                    break;
                }
            }
        }

        if ( null === $matched ) {
            DCB_Logger::info( 'recover', 'Order number mismatch' );
            return;
        }

        if ( $matched->get_customer_id() !== 0 ) {
            DCB_Logger::info( 'recover', 'Order is not a guest order' );
            return;
        }

        if ( 'completed' !== $matched->get_status() ) {
            DCB_Logger::info( 'recover', 'Order not completed', [ 'status' => $matched->get_status() ] );
            return;
        }

        $has_downloadable = false;
        foreach ( $matched->get_items() as $item ) {
            $product = $item->get_product();
            if ( $product && $product->is_downloadable() ) {
                $has_downloadable = true;
                break;
            }
        }

        if ( ! $has_downloadable ) {
            DCB_Logger::info( 'recover', 'Order has no downloadable items' );
            return;
        }

        DCB_Logger::info( 'recover', 'Recovery email triggered', [ 'order_id' => $matched->get_id() ] );

        // Resend the customer completed-order email directly, without changing order status or
        // re-granting download permissions. wc_downloadable_product_permissions($id, true) would
        // reset download counts; do_action(woocommerce_order_status_completed) fires all status
        // hooks, causing unintended side effects. WC_Email::trigger() sends exactly one email.
        $mailer = WC()->mailer();
        if ( isset( $mailer->emails['WC_Email_Customer_Completed_Order'] ) ) {
            $mailer->emails['WC_Email_Customer_Completed_Order']->trigger( $matched->get_id(), $matched );
        } else {
            DCB_Logger::error( 'recover', 'WC_Email_Customer_Completed_Order not available' );
        }
    }

    private static function public_response(): WP_REST_Response {
        return new WP_REST_Response(
            [
                'success' => true,
                'message' => __( 'If the information matches an eligible order, a new email will arrive within a few minutes.', 'dokanelbanat-commerce-bridge' ),
            ],
            200
        );
    }

    private static function get_client_ip( WP_REST_Request $request ): string {
        // X-DCB-Client-IP is set by Astro (trusted proxy boundary) before forwarding to this bridge.
        // X-Forwarded-For is NOT used: browsers never touch the bridge, so this header is safe.
        $ip = trim( (string) ( $_SERVER['HTTP_X_DCB_CLIENT_IP'] ?? '' ) );
        return '' !== $ip ? $ip : 'unknown';
    }
}
