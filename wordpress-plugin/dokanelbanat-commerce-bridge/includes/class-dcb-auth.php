<?php
defined( 'ABSPATH' ) || exit;

class DCB_Auth {

    public static function get_secret(): string {
        if ( defined( 'DCB_BRIDGE_SECRET' ) && is_string( DCB_BRIDGE_SECRET ) ) {
            return DCB_BRIDGE_SECRET;
        }
        if ( ! empty( $_ENV['DB_BRIDGE_SECRET'] ) ) {
            return (string) $_ENV['DB_BRIDGE_SECRET'];
        }
        return '';
    }

    public static function verify( WP_REST_Request $request ): bool {
        $secret = self::get_secret();
        if ( '' === $secret ) {
            DCB_Logger::error( 'dcb_auth', 'DCB_BRIDGE_SECRET is not configured' );
            return false;
        }

        $provided = (string) $request->get_header( 'X-DCB-Secret' );
        if ( '' === $provided ) {
            return false;
        }

        return hash_equals( $secret, $provided );
    }

    public static function permission_callback( WP_REST_Request $request ): bool|WP_Error {
        if ( ! self::verify( $request ) ) {
            return new WP_Error(
                'dcb_unauthorized',
                __( 'Unauthorized.', 'dokanelbanat-commerce-bridge' ),
                [ 'status' => 401 ]
            );
        }
        return true;
    }

    public static function generic_error( string $code = 'dcb_error', int $status = 500 ): WP_REST_Response {
        return new WP_REST_Response(
            [ 'success' => false, 'message' => __( 'An error occurred. Please try again.', 'dokanelbanat-commerce-bridge' ) ],
            $status
        );
    }
}
