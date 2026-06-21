# dokanelbanat — Current Checkpoint

**Date:** 2026-06-19  
**Production:** https://dokanelbanat.com  
**Backend:** WordPress + WooCommerce on `blog.dokanelbanat.com`  
**Repository:** `ayop0dev/dokanelbanat.com`

---

## Current Status

| Area | Status | Notes |
|---|---:|---|
| Astro frontend | ✅ Live | Astro 5 runs as a Hostinger Node.js Web App using SSR. |
| SSR health check | ✅ Verified | `https://dokanelbanat.com/api/health` returns `ok: true` in production. |
| GitHub deployment | ✅ Connected | Production deploys from `main`; checkout work was merged in PR #1 (`a00cdd2`). |
| WordPress/WooCommerce | ✅ Connected | WooCommerce remains the private commerce backend. |
| Commerce Bridge plugin | ✅ Uploaded and active | `Dokanelbanat Commerce Bridge` is installed on WordPress. |
| Free guest checkout | ✅ Integration-tested | A real free product order completed successfully. |
| WooCommerce order creation | ✅ Verified | The live checkout created the order successfully. |
| Transactional email delivery | ✅ Verified | The purchase email arrived from the configured `info@dokanelbanat.com` identity. |
| Email design/content | ⚠️ Pending | WooCommerce email layout, copy, RTL presentation, and final branding still need refinement. |
| Download flow | ⚠️ Needs live verification | First-party token URL code exists; complete live download/count/expiry testing is still required. |
| Recovery flow | ⚠️ Needs live verification | Recovery by order number + billing email is implemented but still needs full production testing. |
| Backend-domain masking | ⚠️ Needs final audit | Browser Network, raw email source, redirects, images, and downloads must be checked for backend-domain leakage. |

---

## Production Architecture

```text
Customer browser
    ↓
https://dokanelbanat.com (Astro SSR / Hostinger Node.js)
    ↓ private server-to-server requests
Dokanelbanat Commerce Bridge (WordPress plugin)
    ↓
WooCommerce orders, download permissions, and email delivery
```

The browser must not call the WooCommerce backend directly. Customer-facing checkout, confirmation, recovery, images, and download routes use the main domain.

---

## Hostinger Node.js Configuration

The working deployment uses custom Node.js settings rather than Hostinger's default static Astro preset:

```text
Framework: Other
Root directory: ./
Node version: 22.x
Build command: npm run build
Output directory: dist
Entry file: dist/server/entry.mjs
Branch: main
```

Using Hostinger's default Astro output configuration caused a production `403 Forbidden` because the SSR build was treated as a static site. Selecting `Other` and starting `dist/server/entry.mjs` resolved it.

---

## Hostinger Environment Variables

The Node.js application requires these variables in hPanel. Secret values must never be committed:

```text
WP_API_URL
WOO_STORE_API_URL
WOO_API_URL
WOO_CONSUMER_KEY
WOO_CONSUMER_SECRET
WOO_BACKEND_URL
DB_BRIDGE_SECRET
PUBLIC_SITE_URL
```

Expected URL shapes:

```text
WP_API_URL=https://blog.dokanelbanat.com/wp-json/wp/v2
WOO_STORE_API_URL=https://blog.dokanelbanat.com/wp-json/wc/store/v1
WOO_API_URL=https://blog.dokanelbanat.com/wp-json/wc/v3
WOO_BACKEND_URL=https://blog.dokanelbanat.com/wp-json/dokanelbanat/v1
PUBLIC_SITE_URL=https://dokanelbanat.com
```

`DB_BRIDGE_SECRET` must exactly match `DCB_BRIDGE_SECRET` in WordPress.

---

## WordPress Configuration

The following constants are required above the `That's all, stop editing` line in `wp-config.php`:

```php
define( 'DCB_BRIDGE_SECRET', 'PRIVATE_RANDOM_SECRET' );
define( 'DCB_PUBLIC_SITE_URL', 'https://dokanelbanat.com' );
```

### SMTP Configuration

Authenticated SMTP support has been added locally to the existing Commerce Bridge plugin without adding a separate SMTP plugin.

Required `wp-config.php` constants:

```php
define( 'DCB_SMTP_ENABLED', true );
define( 'DCB_SMTP_HOST', 'smtp.hostinger.com' );
define( 'DCB_SMTP_PORT', 587 );
define( 'DCB_SMTP_USER', 'info@dokanelbanat.com' );
define( 'DCB_SMTP_PASS', 'PRIVATE_MAILBOX_PASSWORD' );
define( 'DCB_SMTP_SECURE', 'tls' );
```

The SMTP password must remain only on the server. The local SMTP class and related documentation/tests are currently uncommitted and must be uploaded, configured, tested, and later committed through the normal Git workflow.

---

## Commerce Bridge Features

- Private authenticated WordPress REST bridge.
- Free products only in the current phase.
- Guest checkout only.
- Exactly one product per order.
- Required name and email; phone optional.
- No billing address or shipping address fields.
- Product must be published, free, virtual, and downloadable.
- Server-side privacy acceptance validation and order metadata.
- Optional marketing consent stored separately.
- Idempotent order creation.
- Layered rate limiting.
- First-party download tokens.
- Atomic WooCommerce download accounting.
- Download expiry and remaining-count enforcement.
- Recovery using order number + original billing email.
- Recovery email is sent only to the original address.
- WooCommerce download and guest view-order URLs are rewritten to first-party routes.
- Arabic HTML and plain-text recovery messaging.
- SMTP configuration through WordPress's bundled PHPMailer.

---

## Local Verification

Latest reported plugin verification:

```text
99 passed, 0 failed
```

Coverage includes checkout correctness, privacy acceptance, rate limiting, download accounting, email URL rewriting, HTML/plain-text output, and SMTP configuration guards.

Static tests do not replace live WordPress/WooCommerce integration tests.

---

## Confirmed Live Behavior

- Astro SSR starts successfully on Hostinger.
- `/api/health` responds from the Astro server runtime.
- A real free product checkout completed successfully.
- WooCommerce processed the order.
- A transactional purchase email was delivered.
- The message used the configured Dokanelbanat sender identity.

---

## Remaining Work

1. Upload the latest SMTP-enabled Commerce Bridge files and add the SMTP constants to `wp-config.php`.
2. Send an SMTP test and verify raw headers show SPF, DKIM, and DMARC as `PASS`.
3. Redesign and rewrite the WooCommerce customer email templates:
   - Arabic RTL layout
   - Dokanelbanat branding and logo
   - subject and preheader
   - order number
   - product name
   - primary download button
   - recovery instructions
   - support and footer copy
   - clean plain-text version
4. Inspect raw purchase-email source and confirm `blog.dokanelbanat.com` is absent.
5. Test a live first-party download and verify the WooCommerce download counter changes correctly.
6. Test expired, exhausted, and invalid download tokens.
7. Test recovery with the correct order/email pair and with incorrect data.
8. Verify recovery always returns a generic public response and sends only one email when eligible.
9. Audit browser DevTools Network during product browsing, checkout, confirmation, images, and download.
10. Commit the pending SMTP plugin changes through a new branch/PR after live verification.

---

## Git / Working Tree Notes

Current checked-out branch: `codex/digital-checkout`.

Known local changes at this checkpoint:

```text
M  .claude/settings.local.json                         (local user setting; do not commit)
M  wordpress-plugin/dokanelbanat-commerce-bridge/README.md
M  wordpress-plugin/dokanelbanat-commerce-bridge/dokanelbanat-commerce-bridge.php
M  wordpress-plugin/dokanelbanat-commerce-bridge/tests/verify.php
?? wordpress-plugin/dokanelbanat-commerce-bridge/includes/class-dcb-smtp.php
```

Do not include `.claude/settings.local.json` in a product commit.
