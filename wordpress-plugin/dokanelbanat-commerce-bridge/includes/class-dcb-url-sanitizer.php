<?php
defined( 'ABSPATH' ) || exit;

class DCB_URL_Sanitizer {

    /**
     * Allow only the public Dokanelbanat domain — never WordPress or internal hosts.
     *
     * @param string $url    URL to validate.
     * @param string $public Allowed public host, e.g. dokanelbanat.com.
     */
    public static function assert_public_domain( string $url, string $public = 'dokanelbanat.com' ): string|false {
        $parsed = wp_parse_url( $url );
        if ( empty( $parsed['host'] ) ) {
            return false;
        }

        $host = strtolower( $parsed['host'] );

        if ( $host !== $public && ! str_ends_with( $host, '.' . $public ) ) {
            return false;
        }

        return esc_url_raw( $url );
    }

    /**
     * Strip path traversal sequences from a file path segment.
     */
    public static function safe_path_segment( string $segment ): string|false {
        $clean = preg_replace( '/[^a-zA-Z0-9\-_\.]/', '', $segment );
        if ( null === $clean || '' === $clean ) {
            return false;
        }
        if ( str_contains( $clean, '..' ) ) {
            return false;
        }
        return $clean;
    }

    /**
     * Ensure a URL uses HTTPS and belongs to the allowed host.
     */
    public static function safe_internal_url( string $url, string $allowed_host ): string|false {
        $parsed = wp_parse_url( $url );
        if ( empty( $parsed['scheme'] ) || 'https' !== $parsed['scheme'] ) {
            return false;
        }
        if ( empty( $parsed['host'] ) ) {
            return false;
        }
        if ( strtolower( $parsed['host'] ) !== strtolower( $allowed_host ) ) {
            return false;
        }
        return esc_url_raw( $url );
    }
}
