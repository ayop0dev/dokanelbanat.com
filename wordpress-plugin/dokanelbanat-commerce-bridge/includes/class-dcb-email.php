<?php
defined( 'ABSPATH' ) || exit;

class DCB_Email {

    private const FROM_NAME  = 'Dokanelbanat';
    private const FROM_EMAIL = 'info@dokanelbanat.com';

    /**
     * Customise WooCommerce "from" headers so all transactional emails
     * come from Dokanelbanat — not WordPress/WooCommerce defaults.
     */
    public static function register(): void {
        add_filter( 'woocommerce_email_from_name', [ self::class, 'from_name' ], 20 );
        add_filter( 'woocommerce_email_from_address', [ self::class, 'from_email' ], 20 );
        add_filter( 'woocommerce_email_headers', [ self::class, 'headers' ], 20, 3 );

        add_action( 'woocommerce_email_order_details', [ self::class, 'remove_order_view_link' ], 5, 4 );

        add_filter( 'woocommerce_get_order_item_totals', [ self::class, 'filter_totals' ], 10, 3 );

        // Replace native WC download URLs with first-party tokens in all contexts (email, My Account).
        add_filter( 'woocommerce_order_get_downloadable_items', [ self::class, 'replace_download_urls' ], 10, 2 );

        // Replace the WC "View your order" URL with the recovery URL for guest orders.
        // Guest customers have no WP account and cannot access My Account order pages.
        // woocommerce_get_view_order_url is a supported WC filter applied at the data layer,
        // so both HTML and plain-text email templates receive the correct URL.
        add_filter( 'woocommerce_get_view_order_url', [ self::class, 'replace_view_order_url' ], 10, 2 );
    }

    public static function from_name( string $name ): string {
        return self::FROM_NAME;
    }

    public static function from_email( string $email ): string {
        return self::FROM_EMAIL;
    }

    public static function headers( string $headers, string $email_id, WC_Order|bool $order ): string {
        $headers .= 'Reply-To: ' . self::FROM_NAME . ' <' . self::FROM_EMAIL . ">\r\n";
        return $headers;
    }

    /**
     * Replace WooCommerce order email details with a branded first-party version.
     */
    public static function remove_order_view_link( WC_Order $order, bool $sent_to_admin, bool $plain_text, WC_Email $email ): void {
        if ( ! in_array( $email->id, [ 'customer_completed_order', 'customer_processing_order' ], true ) ) {
            return;
        }

        $public_url = defined( 'DCB_PUBLIC_SITE_URL' )
            ? (string) DCB_PUBLIC_SITE_URL
            : ( (string) ( $_ENV['PUBLIC_SITE_URL'] ?? 'https://dokanelbanat.com' ) );

        $recovery_url = rtrim( $public_url, '/' ) . '/recover-download';

        if ( $plain_text ) {
            echo esc_html__( 'إذا لم يُفتح رابط التحميل، يمكنك استعادته من:', 'dokanelbanat-commerce-bridge' )
                . ' ' . esc_url( $recovery_url ) . "\n";
        } else {
            echo '<p style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin:0 0 12px;">'
                . esc_html__( 'إذا لم يُفتح رابط التحميل، يمكنك استعادته من:', 'dokanelbanat-commerce-bridge' )
                . ' <a href="' . esc_url( $recovery_url ) . '" style="color:#c4753b;">'
                . esc_html( $recovery_url )
                . '</a></p>';
        }
    }

    public static function filter_totals( array $totals, WC_Order $order, bool $plain_text ): array {
        unset( $totals['payment_method'] );
        return $totals;
    }

    /**
     * Generate a first-party download URL for a WooCommerce download permission.
     *
     * @param int    $order_id    WooCommerce order ID.
     * @param int    $product_id  Product ID.
     * @param string $download_id Download permission ID.
     */
    public static function first_party_download_url( int $order_id, int $product_id, string $download_id ): string {
        $token      = DCB_Download_Token::create( $order_id, $product_id, $download_id );
        $public_url = defined( 'DCB_PUBLIC_SITE_URL' )
            ? (string) DCB_PUBLIC_SITE_URL
            : ( (string) ( $_ENV['PUBLIC_SITE_URL'] ?? 'https://dokanelbanat.com' ) );

        return rtrim( $public_url, '/' ) . '/download/' . rawurlencode( $token );
    }

    /**
     * Replace native WooCommerce download URLs with first-party opaque token URLs.
     * Hooked to woocommerce_order_get_downloadable_items (WC 3.0+).
     *
     * @param array    $downloads Array of download item arrays, each with download_url key.
     * @param WC_Order $order     The parent order.
     */
    public static function replace_download_urls( array $downloads, WC_Order $order ): array {
        foreach ( $downloads as &$dl ) {
            $order_id    = (int) ( $dl['order_id'] ?? $order->get_id() );
            $product_id  = (int) ( $dl['product_id'] ?? 0 );
            $download_id = (string) ( $dl['download_id'] ?? '' );

            if ( $order_id > 0 && $product_id > 0 && '' !== $download_id ) {
                $dl['download_url'] = self::first_party_download_url( $order_id, $product_id, $download_id );
            }
        }
        unset( $dl );
        return $downloads;
    }

    /**
     * Replace the WooCommerce "View your order" URL with the first-party recovery URL.
     *
     * Applied via the woocommerce_get_view_order_url filter at the data layer.
     * Guest customers (customer_id = 0) have no WP account, so the My Account
     * view-order page requires login they cannot complete. The recovery page is
     * the correct first-party destination. Registered customers (customer_id > 0)
     * retain the standard URL unchanged.
     *
     * Because this operates on the URL value before template rendering, both HTML
     * and plain-text email templates receive the correct URL automatically.
     *
     * @param string   $url   The default view-order URL.
     * @param WC_Order $order The order.
     */
    public static function replace_view_order_url( string $url, WC_Order $order ): string {
        if ( 0 !== $order->get_customer_id() ) {
            return $url;
        }

        $public_url = defined( 'DCB_PUBLIC_SITE_URL' )
            ? (string) DCB_PUBLIC_SITE_URL
            : ( (string) ( $_ENV['PUBLIC_SITE_URL'] ?? 'https://dokanelbanat.com' ) );

        return rtrim( $public_url, '/' ) . '/recover-download';
    }
}
