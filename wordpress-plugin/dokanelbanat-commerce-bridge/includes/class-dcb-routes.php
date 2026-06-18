<?php
defined( 'ABSPATH' ) || exit;

class DCB_Routes {

    private const NAMESPACE = 'dokanelbanat/v1';

    public static function register(): void {
        add_action( 'rest_api_init', [ self::class, 'register_routes' ] );
    }

    public static function register_routes(): void {
        register_rest_route(
            self::NAMESPACE,
            '/health',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ self::class, 'health' ],
                'permission_callback' => '__return_true',
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/free-order',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ self::class, 'free_order' ],
                'permission_callback' => [ DCB_Auth::class, 'permission_callback' ],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/recover',
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ self::class, 'recover' ],
                'permission_callback' => [ DCB_Auth::class, 'permission_callback' ],
            ]
        );

        register_rest_route(
            self::NAMESPACE,
            '/download/(?P<token>[a-f0-9]{64})',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ self::class, 'download' ],
                'permission_callback' => [ DCB_Auth::class, 'permission_callback' ],
                'args'                => [
                    'token' => [
                        'required'          => true,
                        'validate_callback' => fn( $v ) => is_string( $v ) && preg_match( '/^[a-f0-9]{64}$/', $v ),
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ]
        );
    }

    public static function health( WP_REST_Request $request ): WP_REST_Response {
        $wc_active = class_exists( 'WooCommerce' );
        return new WP_REST_Response(
            [
                'ok'          => true,
                'service'     => 'dokanelbanat-commerce-bridge',
                'version'     => DCB_VERSION,
                'timestamp'   => gmdate( 'c' ),
                'woocommerce' => $wc_active,
            ],
            200
        );
    }

    public static function free_order( WP_REST_Request $request ): WP_REST_Response {
        return DCB_Free_Order::handle( $request );
    }

    public static function recover( WP_REST_Request $request ): WP_REST_Response {
        return DCB_Recover::handle( $request );
    }

    public static function download( WP_REST_Request $request ): WP_REST_Response {
        return DCB_Download_Handler::handle( $request );
    }
}
