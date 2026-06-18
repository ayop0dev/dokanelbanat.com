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
