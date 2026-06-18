<?php
defined( 'ABSPATH' ) || exit;

class DCB_Idempotency {

    private const OPTION_KEY = 'dcb_idempotency_cache';
    private const MAX_AGE    = 3600;
    private const MAX_ITEMS  = 500;

    public static function get( string $key ): array|null {
        $cache = get_option( self::OPTION_KEY, [] );
        if ( ! is_array( $cache ) || ! isset( $cache[ $key ] ) ) {
            return null;
        }
        $entry = $cache[ $key ];
        if ( ! is_array( $entry ) || empty( $entry['expires'] ) || time() > (int) $entry['expires'] ) {
            return null;
        }
        return $entry['payload'] ?? null;
    }

    public static function set( string $key, array $payload ): void {
        $cache = get_option( self::OPTION_KEY, [] );
        if ( ! is_array( $cache ) ) {
            $cache = [];
        }

        $now = time();

        foreach ( array_keys( $cache ) as $k ) {
            if ( isset( $cache[ $k ]['expires'] ) && $now > (int) $cache[ $k ]['expires'] ) {
                unset( $cache[ $k ] );
            }
        }

        if ( count( $cache ) >= self::MAX_ITEMS ) {
            array_shift( $cache );
        }

        $cache[ $key ] = [
            'payload' => $payload,
            'expires' => $now + self::MAX_AGE,
        ];

        update_option( self::OPTION_KEY, $cache, false );
    }
}
