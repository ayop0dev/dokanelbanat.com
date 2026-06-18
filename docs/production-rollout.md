# Production Rollout Guide

## Pre-deployment checklist

- [ ] WordPress database and files backup taken
- [ ] Current Astro deployment (if any) noted for rollback
- [ ] All environment variables ready
- [ ] SMTP credentials configured

---

## 1. Hostinger Node.js Web App setup

1. Log in to Hostinger hPanel.
2. Go to **Websites → Manage → Node.js**.
3. Select Node.js version: **20 LTS** (or 18 LTS minimum).
4. Set **Application root**: `/public_html` (or your deployment folder).
5. Set **Start file**: `dist/server/entry.mjs`.
6. Set **Start command**: `node ./dist/server/entry.mjs`.

---

## 2. GitHub branch deployment

The branch to deploy is: `codex/digital-checkout`

Option A — Hostinger Git deployment:
1. In hPanel, go to **Git** and connect `ayop0dev/dokanelbanat.com`.
2. Select branch `codex/digital-checkout`.
3. Set build command: `npm run build`.
4. Deploy.

Option B — Manual SFTP:
1. Run `npm run build` locally.
2. Upload the entire `dist/` folder and `package.json` via SFTP to the application root.

---

## 3. Environment variables

Set in Hostinger **Node.js → Environment Variables** panel (never in Git):

| Variable | Description | Example |
|---|---|---|
| `WOO_BACKEND_URL` | Bridge API base URL | `https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1` |
| `DB_BRIDGE_SECRET` | Shared secret (generate with `openssl rand -base64 48`) | `<64+ chars>` |
| `PUBLIC_SITE_URL` | Canonical public URL | `https://dokanelbanat.com` |
| `WOO_API_URL` | WooCommerce REST API URL (for product listings) | `https://blog.dokanelbanat.com/wp-json/wc/v3` |
| `WOO_STORE_API_URL` | WooCommerce Store API URL (fallback) | `https://blog.dokanelbanat.com/wp-json/wc/store/v1` |
| `WOO_CONSUMER_KEY` | WooCommerce REST API consumer key | `ck_...` |
| `WOO_CONSUMER_SECRET` | WooCommerce REST API consumer secret | `cs_...` |
| `HOST` | Bind address | `0.0.0.0` |
| `PORT` | Port (Hostinger injects automatically) | (leave empty or use Hostinger's value) |

---

## 4. Temporary-domain smoke test

After deploying but **before** switching the production domain:

1. Open `https://your-temp.hostingersite.com/api/health` — expect `{"ok":true,"service":"dokanelbanat",...}`.
2. Open `https://your-temp.hostingersite.com/` — home page renders.
3. Open `https://your-temp.hostingersite.com/products` — product listing renders.
4. Open `https://your-temp.hostingersite.com/checkout?product=<id>` — checkout renders, form present.
5. Open `https://your-temp.hostingersite.com/recover-download` — recovery form renders.
6. In browser DevTools → Network tab: confirm no requests go to `blog.dokanelbanat.com`.
7. Submit the checkout form with a valid free product: verify order confirmation page.
8. Check email inbox: verify branded email from `Dokanelbanat <info@dokanelbanat.com>`.
9. Click download link in email: verify file downloads through `dokanelbanat.com/download/...`.

---

## 5. WordPress database/files backup

Before activating the plugin:
```bash
# Database backup
wp db export backup-$(date +%Y%m%d).sql --allow-root

# Files backup (uploads)
tar -czf uploads-$(date +%Y%m%d).tar.gz wp-content/uploads/
```

---

## 6. Plugin ZIP creation

From your local machine:
```bash
cd wordpress-plugin/
zip -r dokanelbanat-commerce-bridge.zip dokanelbanat-commerce-bridge/ \
  --exclude "*.git*" --exclude "*.DS_Store"
```

---

## 7. SFTP remote path

Upload the plugin folder to:
```
/public_html/wp-content/plugins/dokanelbanat-commerce-bridge/
```

Maintain the folder structure exactly as in the repository.

---

## 8. Plugin activation

1. Log in to WordPress admin at `https://blog.dokanelbanat.com/wp-admin`.
2. Go to **Plugins → Installed Plugins**.
3. Activate **Dokanelbanat Commerce Bridge**.
4. Verify at: `https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1/health`
   - Expected: `{"ok":true,"woocommerce":true,...}`

In `wp-config.php` (above `/* That's all, stop editing */`):
```php
define( 'DCB_BRIDGE_SECRET', 'your-generated-secret' );
define( 'DCB_PUBLIC_SITE_URL', 'https://dokanelbanat.com' );
```

---

## 9. SMTP / DNS checks

1. Configure SMTP via WP Mail SMTP or FluentSMTP with `info@dokanelbanat.com`.
2. Set SPF, DKIM, and DMARC records as specified in `docs/email-smtp-checklist.md`.
3. Send a test email from WooCommerce admin and verify:
   - From: `Dokanelbanat <info@dokanelbanat.com>`
   - Download link uses `https://dokanelbanat.com/download/...`
   - No `blog.dokanelbanat.com` appears in email source

---

## 10. Rollback — Astro

**Option A (Git):** In Hostinger Git panel, redeploy the previous branch or commit.

**Option B (Manual):** Upload the previous `dist/` build via SFTP.

The previous `main` branch remains untouched — rolling back is simply redeploying it.

---

## 11. Rollback — WordPress plugin

1. In WordPress admin, go to **Plugins → Installed Plugins**.
2. Deactivate **Dokanelbanat Commerce Bridge**.
3. (Optional) Delete via SFTP. Plugin uninstall removes only its own transient/option data — WooCommerce orders and products are never deleted.

---

## 12. Manual WooCommerce settings that code cannot configure

The following must be configured manually in WordPress admin:

| Setting | Location | Required value |
|---|---|---|
| WooCommerce order email "From" name | Overridden by plugin — verify after activation | `Dokanelbanat` |
| WooCommerce order email "From" address | Overridden by plugin — verify after activation | `info@dokanelbanat.com` |
| SMTP plugin configuration | WP admin → WP Mail SMTP | `info@dokanelbanat.com`, your SMTP host |
| Logo in WooCommerce emails | WP admin → WooCommerce → Settings → Emails | Use `https://dokanelbanat.com/logo.png` |
| Download expiry (WooCommerce) | Per product settings | Set to 7 days or appropriate |
| Maximum downloads per permission | Per product settings | Set to 3 or appropriate |
| HPOS enabled | WooCommerce → Settings → Advanced → Features | Enable "High-Performance Order Storage" |
| WooCommerce "New order" admin email | WooCommerce → Settings → Emails | Admin notification address |
