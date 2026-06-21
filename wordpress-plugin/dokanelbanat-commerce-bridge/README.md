# Dokanelbanat Commerce Bridge

A private WordPress plugin that acts as the secure REST API backend for the dokanelbanat.com Astro frontend.

## Requirements

- WordPress 6.4+
- PHP 8.1+
- WooCommerce 8.0+

## Installation

Upload the plugin folder via SFTP:

**SFTP remote path:**
```
/public_html/wp-content/plugins/dokanelbanat-commerce-bridge/
```

The folder structure on the server must match:
```
wp-content/plugins/
  dokanelbanat-commerce-bridge/
    dokanelbanat-commerce-bridge.php
    includes/
      class-dcb-auth.php
      class-dcb-logger.php
      class-dcb-rate-limit.php
      class-dcb-routes.php
      class-dcb-url-sanitizer.php
      class-dcb-validator.php
    README.md
```

## Secret setup

In `wp-config.php`, above the `/* That's all, stop editing */` line, add:

```php
define( 'DCB_BRIDGE_SECRET', 'your-long-random-secret-here' );
```

Generate a secret with:
```bash
openssl rand -base64 48
```

The same secret must be set as the `DB_BRIDGE_SECRET` environment variable in Hostinger for the Astro application.

## SMTP configuration

Dokanelbanat Commerce Bridge can route outgoing mail through an authenticated SMTP server by adding constants to `wp-config.php`. No SMTP plugin is required.

Add the following to `wp-config.php`, above the `/* That's all, stop editing */` line:

```php
define( 'DCB_SMTP_ENABLED', true );
define( 'DCB_SMTP_HOST',    'smtp.hostinger.com' );
define( 'DCB_SMTP_PORT',    587 );
define( 'DCB_SMTP_USER',    'info@dokanelbanat.com' );
define( 'DCB_SMTP_PASS',    'REPLACE_WITH_MAILBOX_PASSWORD' );
define( 'DCB_SMTP_SECURE',  'tls' );
```

### Constants reference

| Constant | Type | Description |
|---|---|---|
| `DCB_SMTP_ENABLED` | `bool` | Must be `true` (strict) to enable SMTP. Omitting or setting any other value leaves WordPress mail unchanged. |
| `DCB_SMTP_HOST` | `string` | SMTP server hostname. Must be non-empty. |
| `DCB_SMTP_PORT` | `int` | SMTP port (1–65535). Use `587` for STARTTLS (`tls`), `465` for implicit SSL (`ssl`). |
| `DCB_SMTP_USER` | `string` | SMTP account address. Must be a valid e-mail address. |
| `DCB_SMTP_PASS` | `string` | SMTP password. Must be non-empty. Never committed to the repository. |
| `DCB_SMTP_SECURE` | `string` | Encryption mode. Must be exactly `tls` (STARTTLS) or `ssl` (implicit SSL). |

If `DCB_SMTP_ENABLED` is `true` but any constant is missing or invalid, the plugin will not fall back silently. A generic error notice is shown in the WordPress admin to administrators only. No configuration details or credentials appear in the notice.

### Manual send test (WP-CLI)

```bash
wp eval "var_dump(wp_mail('RECIPIENT_EMAIL', 'Dokanelbanat SMTP Test', 'SMTP is working.'));"
```

A `true` result means WordPress accepted the send request and handed it to PHPMailer — it does **not** confirm delivery. Final verification requires:

1. Receiving the message in the target mailbox.
2. Opening the raw email source and confirming all three authentication results are **PASS**:
   - **SPF**: `PASS`
   - **DKIM**: `PASS`
   - **DMARC**: `PASS`

If any of these fail, the message may be rejected or delivered to spam regardless of the `wp_mail()` return value.

## Activation

1. Log in to WordPress admin.
2. Go to **Plugins → Installed Plugins**.
3. Find **Dokanelbanat Commerce Bridge** and click **Activate**.
4. Verify at: `https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1/health`
   - Expected response: `{"ok":true,"service":"dokanelbanat-commerce-bridge","version":"1.0.0","woocommerce":true,...}`

## Testing

Test the health endpoint (no auth required):
```bash
curl https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1/health
```

Test an authenticated endpoint (requires the secret):
```bash
curl -X POST \
  -H "X-DCB-Secret: your-secret" \
  -H "Content-Type: application/json" \
  https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1/free-order
```
Should return `{"success":false,"code":"not_implemented",...}` until Phase 3 is deployed.

## Rollback

1. In WordPress admin, deactivate the plugin.
2. Delete via SFTP if needed.
3. The plugin's uninstall routine removes only its own transient/option data — WooCommerce orders and products are never touched.

## Deployment — packaging as a ZIP

To create a ZIP for manual upload or backup:
```bash
cd wordpress-plugin/
zip -r dokanelbanat-commerce-bridge.zip dokanelbanat-commerce-bridge/
```

Do not include `.git/`, `node_modules/`, or development-only files in the ZIP.
