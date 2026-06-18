<?php
/**
 * Plugin Name: Dokanelbanat Commerce Bridge
 * Plugin URI:  https://dokanelbanat.com
 * Description: Private REST API bridge between the Astro frontend and WooCommerce.
 * Version:     1.0.0
 * Author:      Dokanelbanat
 * Text Domain: dokanelbanat-commerce-bridge
 * Domain Path: /languages
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * WC requires at least: 8.0
 * WC tested up to: 9.0
 */

defined( 'ABSPATH' ) || exit;

define( 'DCB_VERSION', '1.0.0' );
define( 'DCB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

add_action( 'before_woocommerce_init', function () {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
    }
} );

add_action( 'plugins_loaded', 'dcb_init' );

function dcb_init(): void {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="notice notice-warning"><p>'
                . esc_html__( 'Dokanelbanat Commerce Bridge requires WooCommerce to be active.', 'dokanelbanat-commerce-bridge' )
                . '</p></div>';
        } );
        return;
    }

    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-auth.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-rate-limit.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-logger.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-validator.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-url-sanitizer.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-idempotency.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-free-order.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-download-token.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-download-handler.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-email.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-recover.php';
    require_once DCB_PLUGIN_DIR . 'includes/class-dcb-routes.php';

    DCB_Email::register();
    DCB_Routes::register();
}

register_uninstall_hook( __FILE__, 'dcb_uninstall' );

function dcb_uninstall(): void {
    delete_option( 'dcb_idempotency_cache' );
    delete_option( 'dcb_download_tokens' );
}
