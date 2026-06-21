<?php
defined( 'ABSPATH' ) || exit;

class DCB_SMTP {

	public static function register(): void {
		if ( ! defined( 'DCB_SMTP_ENABLED' ) || true !== DCB_SMTP_ENABLED ) {
			return;
		}

		if ( ! self::is_valid_config() ) {
			add_action( 'admin_notices', [ self::class, 'show_config_notice' ] );
			return;
		}

		add_action( 'phpmailer_init', [ self::class, 'configure' ] );
	}

	private static function is_valid_config(): bool {
		return self::valid_host()
			&& self::valid_port()
			&& self::valid_user()
			&& self::valid_pass()
			&& self::valid_secure();
	}

	private static function valid_host(): bool {
		return defined( 'DCB_SMTP_HOST' )
			&& is_string( DCB_SMTP_HOST )
			&& '' !== trim( DCB_SMTP_HOST );
	}

	private static function valid_port(): bool {
		return defined( 'DCB_SMTP_PORT' )
			&& is_int( DCB_SMTP_PORT )
			&& DCB_SMTP_PORT >= 1
			&& DCB_SMTP_PORT <= 65535;
	}

	private static function valid_user(): bool {
		return defined( 'DCB_SMTP_USER' )
			&& false !== filter_var( DCB_SMTP_USER, FILTER_VALIDATE_EMAIL );
	}

	private static function valid_pass(): bool {
		return defined( 'DCB_SMTP_PASS' )
			&& '' !== (string) DCB_SMTP_PASS;
	}

	private static function valid_secure(): bool {
		return defined( 'DCB_SMTP_SECURE' )
			&& in_array( DCB_SMTP_SECURE, [ 'tls', 'ssl' ], true );
	}

	public static function show_config_notice(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		echo '<div class="notice notice-error"><p>'
			. esc_html__(
				'Dokanelbanat Commerce Bridge: SMTP is enabled but one or more required constants are missing or invalid. Review wp-config.php.',
				'dokanelbanat-commerce-bridge'
			)
			. '</p></div>';
	}

	public static function configure( \PHPMailer\PHPMailer\PHPMailer $phpmailer ): void {
		$phpmailer->isSMTP();
		$phpmailer->Host        = (string) DCB_SMTP_HOST;
		$phpmailer->Port        = (int) DCB_SMTP_PORT;
		$phpmailer->SMTPAuth    = true;
		$phpmailer->Username    = (string) DCB_SMTP_USER;
		$phpmailer->Password    = (string) DCB_SMTP_PASS;
		$phpmailer->SMTPSecure  = (string) DCB_SMTP_SECURE;
		$phpmailer->Timeout     = 15;
		$phpmailer->SMTPAutoTLS = ( 'tls' === (string) DCB_SMTP_SECURE );
		$phpmailer->SMTPDebug   = 0;
	}
}
