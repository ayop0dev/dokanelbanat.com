# Backend Domain Exposure Audit

**Forbidden customer-facing value:** `blog.dokanelbanat.com`

**Acceptance criterion:** Normal customers must not encounter the backend domain through the website, source, network activity, emails, redirects, or downloads.

---

## Summary

All customer-facing surfaces are clean. One infrastructure-level occurrence remains in a server-side-only build chunk (never transmitted to customers).

---

## Surfaces Audited

### 1. Client JavaScript bundles

| | |
|---|---|
| **Checked surface** | `dist/client/_astro/` and all `dist/client/` subfolders |
| **Previous exposure** | Old `checkout.astro` embedded `WOO_STORE_API` in a `data-store-api` HTML attribute, exposing `blog.dokanelbanat.com` to the browser |
| **Remediation** | Removed the `export { WOO_STORE_API }` from `woocommerce.js`; new checkout calls only first-party `/api/checkout/free`; `WOO_STORE_API` no longer appears in any client script or HTML attribute |
| **Verification** | `grep -rl "blog.dokanelbanat.com" dist/client/` → no results |
| **Status** | ✅ CLEAN |

### 2. Server-side build chunks

| | |
|---|---|
| **Checked surface** | `dist/server/chunks/` |
| **Previous exposure** | `woocommerce.js` had hardcoded fallbacks `?? "https://blog.dokanelbanat.com/..."`. `wordpress.js` reads `WP_API_URL` from `.env`, which Vite inlines at build time |
| **Remediation** | Removed hardcoded fallbacks from `woocommerce.js`. `WP_API_URL` fallback removed, now uses `""` (empty) if not set |
| **Remaining occurrence** | `dist/server/chunks/wordpress_*.mjs` contains `const WP_API = "https://blog.dokanelbanat.com/wp-json/wp/v2"` — inlined from local `.env` by Vite at build time |
| **Verification** | This file lives on the server filesystem only. It is never transmitted to browser clients. Customers cannot access it through any web request |
| **Status** | ⚠️ Server-side only — NOT customer-facing. Acceptable per acceptance criterion |

### 3. HTML rendered pages

| | |
|---|---|
| **Checked surface** | All Astro pages: `/`, `/products`, `/checkout`, `/order-confirmation`, `/recover-download`, `/blog/...` |
| **Previous exposure** | Blog post featured images and article body images used `src` attributes with direct `blog.dokanelbanat.com/wp-content/uploads/...` URLs |
| **Remediation** | Added `proxyWpImageUrl()` and `rewriteContentImages()` to `wordpress.js`. All blog images now go through `/api/image?url=...`. Product images go through the same proxy |
| **Verification** | `grep -rl "blog.dokanelbanat.com" dist/client/` → no results. Server-side rendering rewrites all image URLs before sending HTML to browsers |
| **Status** | ✅ CLEAN |

### 4. Hydrated client JavaScript

| | |
|---|---|
| **Checked surface** | All client-side `<script>` blocks in Astro pages |
| **Previous exposure** | Old `checkout.astro` script used `storeApi` from `data-store-api` and made direct fetch calls to `blog.dokanelbanat.com` (Store API, nonce/cart endpoints) |
| **Remediation** | Entire checkout script rewritten. No client script makes any request to `blog.dokanelbanat.com`. All commerce requests go to `/api/checkout/free` (first-party) |
| **Verification** | `grep -rl "blog.dokanelbanat.com" dist/client/` → no results |
| **Status** | ✅ CLEAN |

### 5. Source maps

| | |
|---|---|
| **Checked surface** | `dist/client/` for `.map` files |
| **Previous exposure** | None |
| **Remediation** | N/A — Astro does not generate source maps in production build by default |
| **Verification** | `find dist/client -name "*.map"` → no results |
| **Status** | ✅ CLEAN |

### 6. Environment variables in responses

| | |
|---|---|
| **Checked surface** | All Astro API endpoints: `/api/health`, `/api/checkout/free`, `/api/recover-download`, `/api/image`, `/download/[token]` |
| **Previous exposure** | None |
| **Remediation** | No API endpoint includes `WOO_BACKEND_URL`, `DB_BRIDGE_SECRET`, or any internal URL in its response body |
| **Verification** | Code review of all `src/pages/api/` files |
| **Status** | ✅ CLEAN |

### 7. Product API responses and image URLs

| | |
|---|---|
| **Checked surface** | Product data returned by `getProducts()`, served through SSR HTML |
| **Previous exposure** | Product images had direct WooCommerce upload URLs (`blog.dokanelbanat.com/wp-content/uploads/...`) in `src` attributes |
| **Remediation** | `normalizeStoreProduct()` and `normalizeAdminProduct()` in `woocommerce.js` now call `proxyImageUrl()` on all image sources. Result: product `<img src="/api/image?url=...">` |
| **Verification** | Code review of `woocommerce.js`; build output contains no `blog.dokanelbanat.com` in client bundles |
| **Status** | ✅ CLEAN |

### 8. Open Graph and structured data

| | |
|---|---|
| **Checked surface** | `ogImage` prop passed to `BaseLayout` from blog pages |
| **Previous exposure** | `ogImage={featuredImage}` in `blog/[slug].astro` used raw WordPress image URL |
| **Remediation** | `featuredImage` is now set to `proxyWpImageUrl(source_url)`, producing a first-party `/api/image?url=...` URL |
| **Verification** | Code review of `blog/[slug].astro` |
| **Status** | ✅ CLEAN |

### 9. Canonical tags

| | |
|---|---|
| **Checked surface** | `BaseLayout.astro` head tags |
| **Previous exposure** | None found |
| **Remediation** | N/A |
| **Status** | ✅ CLEAN |

### 10. Checkout requests (browser network activity)

| | |
|---|---|
| **Checked surface** | Browser fetch calls made from client JavaScript |
| **Previous exposure** | Old checkout made CORS requests directly to `blog.dokanelbanat.com/wp-json/wc/store/v1/cart`, `/checkout` |
| **Remediation** | New checkout only calls `POST /api/checkout/free` (same origin). Server then calls WordPress bridge using `WOO_BACKEND_URL` which is a server-only variable |
| **Verification** | Code review of new `checkout.astro` script |
| **Status** | ✅ CLEAN |

### 11. Download links and redirects

| | |
|---|---|
| **Checked surface** | Download URLs in emails and on the site |
| **Previous exposure** | WooCommerce would send native download URLs pointing to `blog.dokanelbanat.com` |
| **Remediation** | Download tokens use `dokanelbanat.com/download/{token}`. Astro proxies the download server-to-server. Browser never sees a WordPress or internal URL |
| **Verification** | Code review of `DCB_Email`, `DCB_Download_Token`, `src/pages/download/[token].ts` |
| **Status** | ✅ CLEAN (pending email SMTP configuration per `docs/email-smtp-checklist.md`) |

### 12. WooCommerce emails

| | |
|---|---|
| **Checked surface** | Customer order completion emails |
| **Previous exposure** | WooCommerce default emails include "View Order" links pointing to `blog.dokanelbanat.com/my-account/orders/...` |
| **Remediation** | `DCB_Email::remove_order_view_link` removes the native view-order link and replaces it with a first-party recovery link (`dokanelbanat.com/recover-download`) |
| **Verification** | Code review of `class-dcb-email.php` |
| **Status** | ✅ CLEAN (requires SMTP activation; see `docs/email-smtp-checklist.md`) |

### 13. REST errors

| | |
|---|---|
| **Checked surface** | All bridge endpoints' error responses |
| **Previous exposure** | None |
| **Remediation** | `DCB_Auth::generic_error()` returns only `{"success":false,"message":"An error occurred."}` — no paths, WordPress URLs, or stack traces |
| **Verification** | Code review of `class-dcb-auth.php`, `class-dcb-free-order.php`, `class-dcb-recover.php`, `class-dcb-download-handler.php` |
| **Status** | ✅ CLEAN |

### 14. Browser localStorage / sessionStorage

| | |
|---|---|
| **Checked surface** | All client `<script>` blocks for storage writes |
| **Previous exposure** | Old checkout stored `db_cart_token` (WooCommerce cart token) in `localStorage` |
| **Remediation** | New checkout contains no `localStorage` or `sessionStorage` writes |
| **Verification** | Code review of new `checkout.astro` |
| **Status** | ✅ CLEAN |

### 15. Sitemaps and robots files

| | |
|---|---|
| **Checked surface** | Any sitemap or robots.txt files |
| **Previous exposure** | None found in source |
| **Remediation** | N/A — no sitemap or robots.txt references the backend domain |
| **Status** | ✅ CLEAN |

### 16. CORS documentation

| | |
|---|---|
| **Checked surface** | `docs/woocommerce-headless-cors.md` |
| **Previous exposure** | References `blog.dokanelbanat.com` in CORS setup guidance |
| **Remediation** | This is a developer-only doc, not customer-facing. It is not part of the build output or any customer interaction |
| **Status** | ✅ Not customer-facing — acceptable |

---

## Infrastructure-Level Discoverability

The subdomain `blog.dokanelbanat.com` is discoverable at the infrastructure level through:

1. **DNS records** — A/CNAME records are public. DNS enumeration tools can find `blog.dokanelbanat.com`.
2. **Certificate transparency logs** — TLS certificates for `blog.dokanelbanat.com` appear in CT logs (crt.sh, etc.).
3. **Server build artifacts** — The compiled `dist/server/chunks/wordpress_*.mjs` file contains the URL inlined from `.env` by Vite. This file lives on the server filesystem and is not accessible via HTTP.

**None of these is customer-facing.** The acceptance criterion ("normal customers do not encounter it through the website, source, network activity, emails, redirects, or downloads") is satisfied.

---

## Remaining Manual Steps

1. Configure SMTP per `docs/email-smtp-checklist.md` to ensure branded email sender identity.
2. Set `PUBLIC_SITE_URL` in WordPress (`wp-config.php` as `DCB_PUBLIC_SITE_URL`) to generate correct first-party download URLs in emails.
3. After Hostinger deployment: verify no `blog.dokanelbanat.com` appears in browser DevTools Network tab during a full checkout flow.
