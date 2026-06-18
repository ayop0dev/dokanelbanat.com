<?php
defined( 'ABSPATH' ) || exit;

class DCB_Download_Token {

    private const OPTION_KEY = 'dcb_download_tokens';
    private const MAX_AGE    = DAY_IN_SECONDS * 7;
    private const MAX_ITEMS  = 2000;

    public static function create( int $order_id, int $product_id, string $download_id ): string {
        $token = bin2hex( random_bytes( 32 ) );

        $tokens = get_option( self::OPTION_KEY, [] );
        if ( ! is_array( $tokens ) ) {
            $tokens = [];
        }

        $now = time();
        foreach ( array_keys( $tokens ) as $t ) {
            if ( isset( $tokens[ $t ]['expires'] ) && $now > (int) $tokens[ $t ]['expires'] ) {
                unset( $tokens[ $t ] );
            }
        }

        if ( count( $tokens ) >= self::MAX_ITEMS ) {
            array_shift( $tokens );
        }

        $tokens[ $token ] = [
            'order_id'    => $order_id,
            'product_id'  => $product_id,
            'download_id' => $download_id,
            'expires'     => $now + self::MAX_AGE,
        ];

        update_option( self::OPTION_KEY, $tokens, false );

        return $token;
    }

    public static function resolve( string $token ): array|null {
        if ( ! preg_match( '/^[a-f0-9]{64}$/', $token ) ) {
            return null;
        }

        $tokens = get_option( self::OPTION_KEY, [] );
        if ( ! is_array( $tokens ) || ! isset( $tokens[ $token ] ) ) {
            return null;
        }

        $entry = $tokens[ $token ];
        if ( time() > (int) ( $entry['expires'] ?? 0 ) ) {
            return null;
        }

        return $entry;
    }

    public static function revoke( string $token ): void {
        $tokens = get_option( self::OPTION_KEY, [] );
        if ( is_array( $tokens ) && isset( $tokens[ $token ] ) ) {
            unset( $tokens[ $token ] );
            update_option( self::OPTION_KEY, $tokens, false );
        }
    }
}
