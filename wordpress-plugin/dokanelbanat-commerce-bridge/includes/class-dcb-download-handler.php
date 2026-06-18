<?php
defined( 'ABSPATH' ) || exit;

class DCB_Download_Handler {

    /**
     * Authenticate with the bridge secret (server-to-server only — not for browser).
     * Returns a streaming WP_REST_Response by sending headers+body manually and dying.
     */
    public static function handle( WP_REST_Request $request ): WP_REST_Response {
        $token = DCB_URL_Sanitizer::safe_path_segment( (string) $request->get_param( 'token' ) );
        if ( false === $token ) {
            return self::invalid_response();
        }

        $entry = DCB_Download_Token::resolve( $token );
        if ( null === $entry ) {
            DCB_Logger::warning( 'download', 'Invalid or expired token' );
            return self::invalid_response();
        }

        $order_id   = (int) $entry['order_id'];
        $product_id = (int) $entry['product_id'];

        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return self::invalid_response();
        }

        $download_id = (string) $entry['download_id'];

        $permissions = wc_get_customer_download_permissions( $order->get_billing_email() );
        $permission  = null;

        foreach ( $permissions as $perm ) {
            if (
                (int) $perm->order_id === $order_id &&
                (int) $perm->product_id === $product_id &&
                (string) $perm->download_id === $download_id
            ) {
                $permission = $perm;
                break;
            }
        }

        if ( null === $permission ) {
            DCB_Logger::warning( 'download', 'Download permission not found', [ 'order_id' => $order_id ] );
            return self::invalid_response();
        }

        // Check access expiry before serving.
        if ( ! empty( $permission->access_expires ) ) {
            $expires_ts = strtotime( (string) $permission->access_expires );
            if ( false !== $expires_ts && $expires_ts < time() ) {
                DCB_Logger::info( 'download', 'Download permission expired', [ 'order_id' => $order_id ] );
                return self::expired_response();
            }
        }

        // WooCommerce uses NULL or '' (empty string) to represent unlimited downloads.
        // Casting either value to (int) yields 0 and incorrectly exhausts the permission.
        $raw_remaining = $permission->downloads_remaining ?? null;
        $is_unlimited  = ( null === $raw_remaining || '' === (string) $raw_remaining );

        if ( ! $is_unlimited && (int) $raw_remaining <= 0 ) {
            DCB_Logger::info( 'download', 'Download limit exhausted', [ 'order_id' => $order_id ] );
            return self::expired_response();
        }

        $product = wc_get_product( $product_id );
        if ( ! $product || ! $product->is_downloadable() ) {
            return self::invalid_response();
        }

        $file_url = '';
        foreach ( $product->get_downloads() as $dl ) {
            if ( $dl->get_id() === $download_id ) {
                $file_url = $dl->get_file();
                break;
            }
        }

        if ( '' === $file_url ) {
            DCB_Logger::error( 'download', 'File URL not found', [ 'product_id' => $product_id ] );
            return self::invalid_response();
        }

        $upload_dir  = wp_upload_dir();
        $uploads_url = trailingslashit( $upload_dir['baseurl'] );
        $uploads_dir = trailingslashit( $upload_dir['basedir'] );

        if ( ! str_starts_with( $file_url, $uploads_url ) ) {
            DCB_Logger::error( 'download', 'File is outside uploads directory', [ 'product_id' => $product_id ] );
            return self::invalid_response();
        }

        $relative    = substr( $file_url, strlen( $uploads_url ) );
        $file_path   = $uploads_dir . $relative;

        $real_path   = realpath( $file_path );
        $real_uploads = realpath( $uploads_dir );
        if (
            false === $real_path ||
            false === $real_uploads ||
            ! str_starts_with( $real_path, $real_uploads )
        ) {
            DCB_Logger::error( 'download', 'Path traversal attempt blocked', [ 'product_id' => $product_id ] );
            return self::invalid_response();
        }

        if ( ! is_readable( $real_path ) ) {
            DCB_Logger::error( 'download', 'File not readable', [ 'product_id' => $product_id ] );
            return self::invalid_response();
        }

        // Atomic download accounting via a single conditional SQL UPDATE.
        //
        // A PHP read-modify-save sequence (WC_Customer_Download CRUD) has a TOCTOU race:
        // two concurrent requests can both read "1 remaining", both decrement, and both serve.
        // MySQL/InnoDB executes a single UPDATE atomically under a row lock, so only the
        // first concurrent writer wins; all others find 0 rows affected and are denied.
        //
        // The WHERE clause also confirms the permission belongs to the expected
        // order, product, download_id, and customer — preventing permission_id spoofing.
        global $wpdb;
        $perm_table = $wpdb->prefix . 'woocommerce_downloadable_product_permissions';

        if ( $is_unlimited ) {
            // Unlimited: increment count only; verify context ownership in WHERE.
            // $wpdb->query() returns int (rows affected) or false on SQL error.
            // Serve only when exactly 1 row was updated. Any other result — including
            // false (DB error) or 0 (context mismatch) — denies the download.
            $rows = $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$perm_table}
                     SET download_count = download_count + 1
                     WHERE permission_id = %d
                       AND order_id      = %d
                       AND product_id    = %d
                       AND download_id   = %s
                       AND user_email    = %s
                       AND (downloads_remaining IS NULL OR downloads_remaining = '')",
                    (int) $permission->permission_id,
                    $order_id,
                    $product_id,
                    $download_id,
                    $order->get_billing_email()
                )
            );
            if ( false === $rows ) {
                DCB_Logger::error( 'download', 'Database failure during unlimited download accounting' );
                return self::expired_response();
            }
            if ( 1 !== $rows ) {
                DCB_Logger::warning( 'download', 'Unlimited permission context mismatch', [ 'permission_id' => (int) $permission->permission_id ] );
                return self::expired_response();
            }
        } else {
            // Limited: WHERE downloads_remaining > 0 ensures only one concurrent request
            // can consume the last slot. Any request that finds 0 rows affected is denied.
            // false → SQL error; 0 → no slots or context mismatch; both deny.
            $rows = $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$perm_table}
                     SET downloads_remaining = downloads_remaining - 1,
                         download_count = download_count + 1
                     WHERE permission_id = %d
                       AND order_id      = %d
                       AND product_id    = %d
                       AND download_id   = %s
                       AND user_email    = %s
                       AND downloads_remaining > 0",
                    (int) $permission->permission_id,
                    $order_id,
                    $product_id,
                    $download_id,
                    $order->get_billing_email()
                )
            );
            if ( false === $rows ) {
                DCB_Logger::error( 'download', 'Database failure during limited download accounting' );
                return self::expired_response();
            }
            if ( 1 !== $rows ) {
                DCB_Logger::info( 'download', 'Concurrent download denied: no slots remain (atomic)', [ 'order_id' => $order_id ] );
                return self::expired_response();
            }
        }

        $filename  = basename( $real_path );
        $mime_type = mime_content_type( $real_path ) ?: 'application/octet-stream';
        $file_size = filesize( $real_path );

        DCB_Logger::info( 'download', 'File served', [ 'order_id' => $order_id, 'product_id' => $product_id ] );

        status_header( 200 );
        header( 'Content-Type: ' . $mime_type );
        header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $filename ) . '"' );
        if ( false !== $file_size ) {
            header( 'Content-Length: ' . $file_size );
        }
        header( 'Cache-Control: no-store, no-cache, must-revalidate' );
        header( 'Pragma: no-cache' );
        header( 'X-Robots-Tag: noindex' );

        readfile( $real_path );
        exit;
    }

    private static function invalid_response(): WP_REST_Response {
        return new WP_REST_Response(
            [ 'success' => false, 'message' => __( 'This link is invalid or has expired.', 'dokanelbanat-commerce-bridge' ) ],
            404
        );
    }

    private static function expired_response(): WP_REST_Response {
        return new WP_REST_Response(
            [ 'success' => false, 'message' => __( 'This link has reached its download limit.', 'dokanelbanat-commerce-bridge' ) ],
            410
        );
    }
}
