<?php
defined( 'ABSPATH' ) || exit;

class DCB_Logger {

    private static function get_logger(): ?WC_Logger_Interface {
        if ( function_exists( 'wc_get_logger' ) ) {
            return wc_get_logger();
        }
        return null;
    }

    public static function info( string $context, string $message, array $data = [] ): void {
        self::log( 'info', $context, $message, $data );
    }

    public static function error( string $context, string $message, array $data = [] ): void {
        self::log( 'error', $context, $message, $data );
    }

    public static function warning( string $context, string $message, array $data = [] ): void {
        self::log( 'warning', $context, $message, $data );
    }

    private static function log( string $level, string $context, string $message, array $data ): void {
        $logger = self::get_logger();

        $safe_data = self::redact( $data );
        $payload   = empty( $safe_data ) ? $message : $message . ' ' . wp_json_encode( $safe_data );

        if ( $logger ) {
            $logger->log( $level, $payload, [ 'source' => 'dcb-' . $context ] );
        } else {
            error_log( '[DCB:' . $context . '] ' . $payload );
        }
    }

    /**
     * Remove any key whose name suggests personal or secret data.
     */
    private static function redact( array $data ): array {
        $forbidden = [ 'email', 'secret', 'password', 'phone', 'key', 'token' ];
        $clean     = [];
        foreach ( $data as $k => $v ) {
            $lower = strtolower( (string) $k );
            foreach ( $forbidden as $word ) {
                if ( str_contains( $lower, $word ) ) {
                    continue 2;
                }
            }
            $clean[ $k ] = is_scalar( $v ) ? $v : wp_json_encode( $v );
        }
        return $clean;
    }
}
