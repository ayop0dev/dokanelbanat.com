<?php
defined( 'ABSPATH' ) || exit;

class DCB_Rate_Limit {

    private const TRANSIENT_PREFIX = 'dcb_rl_';
    private const DEFAULT_WINDOW   = 60;
    private const DEFAULT_MAX      = 5;

    /**
     * @param string $key    Privacy-safe hash (never raw email or personal data).
     * @param int    $max    Maximum allowed hits per window.
     * @param int    $window Window size in seconds.
     */
    public static function check( string $key, int $max = self::DEFAULT_MAX, int $window = self::DEFAULT_WINDOW ): bool {
        $transient = self::TRANSIENT_PREFIX . $key;
        $hits      = (int) get_transient( $transient );

        if ( $hits >= $max ) {
            return false;
        }

        if ( 0 === $hits ) {
            set_transient( $transient, 1, $window );
        } else {
            set_transient( $transient, $hits + 1, $window );
        }

        return true;
    }

    public static function make_key( string ...$parts ): string {
        return hash( 'sha256', implode( '|', $parts ) );
    }

    /**
     * Build a privacy-safe key from email + order_number + IP without storing raw values.
     */
    public static function recovery_key( string $email, string $order_number, string $ip ): string {
        $ip_hash    = hash( 'sha256', $ip );
        $data_hash  = hash( 'sha256', strtolower( trim( $email ) ) . '|' . trim( $order_number ) );
        return self::make_key( 'recover', $data_hash, $ip_hash );
    }
}
