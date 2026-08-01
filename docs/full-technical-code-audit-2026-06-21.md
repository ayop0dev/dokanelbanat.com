# Full Technical Code Audit — dokanelbanat
**Date:** 2026-06-21  
**Auditor:** Claude Sonnet 4.6 (automated static analysis — code-only)  
**Repository:** `D:\claude-Projects\dokanelbanat`  
**Branch:** `main`  
**Commit hash (HEAD):** `5e7c69d`

---

## 1. Audit Metadata

| Field | Value |
|---|---|
| Project | dokanelbanat — Arabic women's digital commerce platform |
| Stack | Astro 5.18 (SSR/Node), Tailwind CSS 4, TypeScript, PHP 8.1+ WordPress plugin |
| Node version (build) | As found on host |
| PHP version | 8.2.30 (Windows CLI, used for linting) |
| Audit method | Static code analysis, file reads, grep searches, build run, PHP lint, test suite execution |
| No browser used | Confirmed |
| No source files modified | Confirmed |
| No commits or pushes made | Confirmed |

---

## 2. Scope

All files examined:

- `astro.config.mjs`, `package.json`, `.env`, `.env.example`
- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`, `Footer.astro`, `ProductsGrid.astro`, `MagazineGrid.astro`, `Hero.astro`
- `src/pages/index.astro`, `404.astro`, `privacy.astro`, `terms.astro`
- `src/pages/checkout.astro`, `order-confirmation.astro`, `recover-download.astro`
- `src/pages/products/index.astro`, `products/[slug].astro`
- `src/pages/blog/index.astro`, `blog/[slug].astro`
- `src/pages/api/checkout/free.ts`, `api/image.ts`, `api/recover-download.ts`, `api/health.ts`
- `src/lib/woocommerce.js`, `src/lib/wordpress.js`
- `src/scripts/main.js`, `public/scripts/main.js`
- `src/styles/design-system/tokens.css`, `components.css`, `globals.css`, `layouts.css`, `motion.css`, `utilities.css`, `fonts.css`
- `src/styles/global.css`
- `wordpress-plugin/dokanelbanat-commerce-bridge/` — all 14 PHP files
- `scripts/verify-checkout-url.mjs`

---

## 3. Executive Summary

### Health Score: 14.5 / 20

| Dimension | Score | Notes |
|---|---|---|
| Accessibility | 3 / 4 | Strong ARIA, focus management, RTL; missing skip-nav, image alt weaknesses |
| Performance | 2.5 / 4 | Good lazy-load, LCP not optimised, 16 external images in hero, no preload hints |
| Responsive Design | 3.5 / 4 | Mobile-first, RTL-first, systematic breakpoints, one logo width="auto" issue |
| Theming / Design-System Hygiene | 3 / 4 | Solid token system; inline styles scattered; hardcoded domain strings |
| Anti-Patterns | 2.5 / 4 | Placeholder GTM ID in production, WooCommerce credentials in URL, getStaticPaths warnings, unsafe `set:html` on WP content |

### Release Recommendation

**CONDITIONAL — resolve P0 and P1 findings before public traffic. P0 is pre-release blocking.**

### Finding Counts

| Severity | Count |
|---|---|
| P0 | 2 |
| P1 | 5 |
| P2 | 7 |
| P3 | 6 |

### Top 5 Findings (Critical to Serious)

1. **P0-001** — Placeholder GTM container ID (`GTM-XXXXXXX`) ships in production HTML, injecting a non-functional analytics tag on every page load and exposing the site to GTM container hijacking if `GTM-XXXXXXX` is ever claimed by a third party.
2. **P0-002** — WooCommerce REST API credentials (`consumer_key`, `consumer_secret`) are appended to HTTP GET query parameters in `woocommerce.js`. These appear in server-side request logs on the WooCommerce host and violate the WooCommerce REST API security guidance which requires OAuth or Basic Auth headers, not URL parameters for non-HTTPS fallback paths.
3. **P1-001** — `set:html` is used on raw WordPress post titles, excerpts, and full content in three separate components/pages. Astro's `set:html` disables output escaping. If the WordPress site is ever compromised, injected scripts execute on the Astro origin (stored XSS).
4. **P1-002** — `product.description` from WooCommerce REST API (HTML string) is rendered via `set:html` in `products/[slug].astro` without sanitization. WooCommerce product descriptions accept arbitrary HTML from admin, so this is an admin-content XSS vector into the front-end origin.
5. **P1-003** — The `.env.example` file is missing `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET`, `WOO_API_URL`, and `WOO_STORE_API_URL`, which are all actively consumed in `src/lib/woocommerce.js`. A developer following `.env.example` will silently fall back to the Store API path without authentication, potentially fetching an incomplete or wrong product list without any indication of misconfiguration.

### Top 5 Positives

1. **PHP plugin verification suite passes 99/99 tests** — extremely thorough behavioral test coverage for download accounting, rate limiting, idempotency, SMTP configuration, and email template handling.
2. **Atomic SQL download accounting** — the race-condition-proof `UPDATE … WHERE downloads_remaining > 0` pattern in `class-dcb-download-handler.php` is exemplary for concurrency safety.
3. **Focus-trap + `inert` attribute on mobile drawer** — correct ARIA dialog pattern with Escape key support, breakpoint-driven closure, and `restoreFocus` logic.
4. **Multi-bucket rate limiting** — four independent rate-limit buckets (per-email, per-IP, per-combo, global) with privacy-safe SHA-256 hashing of personal data is a sophisticated and correct implementation.
5. **Image proxy with MIME allowlist and redirect rejection** — `api/image.ts` correctly blocks SVGs (XSS risk), rejects redirects to prevent SSRF, and restricts fetches to a single allowed hostname.

---

## 4. Health Score Table

| Dimension | 0 (Broken) | 1 (Poor) | 2 (Fair) | 3 (Good) | 4 (Excellent) | Score |
|---|---|---|---|---|---|---|
| Accessibility | | | | ✓ | | 3 |
| Performance | | | | ✓ (half) | | 2.5 |
| Responsive Design | | | | | ✓ (half) | 3.5 |
| Theming / DS Hygiene | | | | ✓ | | 3 |
| Anti-Patterns | | | | ✓ (half) | | 2.5 |
| **Total** | | | | | | **14.5 / 20** |

---

## 5. Build and Verification Results

### `npm run build`

**Result: SUCCESS** (2.51 s)

Build output: `dist/` created with server and client bundles. No errors.

**Warnings (2):**

```
[WARN] [router] getStaticPaths() ignored in dynamic page /src/pages/blog/[slug].astro.
       Add `export const prerender = true;` to prerender the page as static HTML during the build process.
[WARN] [router] getStaticPaths() ignored in dynamic page /src/pages/products/[slug].astro.
       Add `export const prerender = true;` to prerender the page as static HTML during the build process.
```

These are P2 issues. Because the site uses `output: 'server'` (SSR mode), `getStaticPaths()` is silently ignored. These functions do nothing at build time and would need `export const prerender = true` on those pages to take effect, or they should be removed to avoid misleading future maintainers.

### PHP Lint (`php -l` on all 14 plugin files)

**Result: PASS** — No syntax errors detected in any file.

### WordPress Plugin Test Suite (`php tests/verify.php`)

**Result: PASS — 99/99 tests passed, 0 failed**

### JS Verification Script (`node scripts/verify-checkout-url.mjs`)

**Result: PASS — 19/19 tests passed, 0 failed**

### `git diff --check`

**Result: WARNINGS** (not errors) — LF→CRLF line ending warnings for 10 files on Windows. Not a code issue but a `.gitattributes` hygiene item.

### Source/Public Script Parity

`diff src/scripts/main.js public/scripts/main.js` → **Files are identical**. Correct.

### `npm ls --depth=0`

Extraneous packages detected:

```
@emnapi/core@1.10.0 extraneous
@emnapi/runtime@1.10.0 extraneous
@emnapi/wasi-threads@1.2.1 extraneous
@napi-rs/wasm-runtime@1.1.4 extraneous
@tybys/wasm-util@0.10.2 extraneous
tslib@2.8.1 extraneous
```

These are transitive dependencies of `lightningcss` not declared in `package.json` and not used directly. Low risk but creates noise in audit tools.

---

## 6. Findings by Severity

### P0 — Blocking

---

#### P0-001: Placeholder GTM Container ID Shipping in Production

| Field | Value |
|---|---|
| ID | P0-001 |
| Severity | P0 — Blocking |
| Status | Open |
| Category | Security / Correctness |
| File | `src/layouts/BaseLayout.astro` |
| Lines | 21–37 |

**Evidence:**

```html
<!-- TODO: Replace GTM-XXXXXXX with real container ID before running any ads -->
...
})(window,document,'script','dataLayer','GTM-XXXXXXX');
...
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" ...
```

**Impact:**

- Every page load requests `https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX` from Google's CDN. This is an unnecessary third-party request that slows page load.
- `GTM-XXXXXXX` is a publicly documented placeholder. If any malicious actor registers this container ID in Google Tag Manager (which is free to create), they gain the ability to inject arbitrary JavaScript into every visitor's browser on the dokanelbanat.com origin — including keyloggers, session hijackers, and exfiltration scripts.
- The TODO comment confirms this is a known placeholder that has not been resolved before code reached the main branch.

**Recommended Fix:**

Replace `GTM-XXXXXXX` with the real GTM container ID before any production deployment. Until the container is set up, remove the GTM snippet entirely (comment it out or gate it behind an environment variable check).

```js
const GTM_ID = import.meta.env.GTM_CONTAINER_ID;
if (GTM_ID && GTM_ID !== 'GTM-XXXXXXX') {
  // inject GTM snippet
}
```

**Verification Steps:** Confirm `GTM-XXXXXXX` does not appear in the built HTML files under `dist/`.

---

#### P0-002: WooCommerce API Credentials in HTTP GET Query Parameters

| Field | Value |
|---|---|
| ID | P0-002 |
| Severity | P0 — Blocking |
| Status | Open |
| Category | Security — Credential Exposure |
| File | `src/lib/woocommerce.js` |
| Lines | 140–149 |

**Evidence:**

```js
const params = new URLSearchParams({
  per_page: String(perPage),
  status: "publish",
  orderby: "date",
  order: "desc",
  consumer_key: WOO_CONSUMER_KEY,
  consumer_secret: WOO_CONSUMER_SECRET,
});
const data = await wooFetch(`${WOO_API}/products?${params}`, "WooCommerce REST API");
```

**Impact:**

- WooCommerce `consumer_key` and `consumer_secret` appear in the full request URL including query string. These will be logged in:
  - WooCommerce/WordPress/Nginx server access logs on the backend host
  - Any CDN or reverse proxy access logs between Astro and WooCommerce
  - Browser network inspector if this path were ever called from client code (it is currently server-side only — but that boundary is fragile)
- WooCommerce's own security documentation notes that URL parameter authentication is provided only for HTTP/non-HTTPS fallback; for production HTTPS the recommended approach is Basic Auth headers or OAuth.
- If logs are not rotated/encrypted and an attacker gains log access, full API write access to WooCommerce (orders, products, customers) is exposed.

**Recommended Fix:**

Move credentials to the `Authorization` header using HTTP Basic Auth:

```js
const credentials = Buffer.from(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`).toString('base64');
const res = await fetch(`${WOO_API}/products?${params}`, {
  headers: { 'Authorization': `Basic ${credentials}` }
});
```

**Verification Steps:** Confirm no `consumer_key` or `consumer_secret` appear in server access logs after the fix. Verify the WooCommerce API still responds correctly.

---

### P1 — Major

---

#### P1-001: `set:html` on Unescaped WordPress Title/Excerpt Content

| Field | Value |
|---|---|
| ID | P1-001 |
| Severity | P1 — Major |
| Status | Open |
| Category | Security — XSS |
| Files | `src/components/MagazineGrid.astro` (lines 53–54, 82, 84), `src/pages/blog/index.astro` (line 64), `src/pages/blog/[slug].astro` (lines 50, 62) |

**Evidence:**

```astro
<h3 class="mag-featured__title" set:html={featuredPost.title.rendered} />
<p class="mag-featured__excerpt" set:html={featExcerpt} />
<a href={`/blog/${post.slug}`} set:html={post.title.rendered} />
<h1 class="article-title" set:html={post.title.rendered} />
<div class="article-prose" set:html={rewriteContentImages(post.content.rendered)} />
```

**Impact:**

Astro's `set:html` directive injects content without escaping. The WordPress REST API returns `title.rendered` and `excerpt.rendered` as already-rendered HTML. While WordPress itself escapes most values, a compromised WordPress instance or a plugin that stores unescaped content could inject `<script>` tags, `<img onerror=…>`, or event handler attributes that execute on the Astro origin.

The blog post `content.rendered` in particular is full free-form HTML from the WordPress editor, representing the highest XSS risk surface. The `rewriteContentImages` function modifies `src` attributes only and does not sanitise event handlers or script tags.

**Recommended Fix:**

For titles and excerpts, strip HTML tags server-side before rendering. A `stripHtml()` function already exists in both `blog/index.astro` and `MagazineGrid.astro`. Use it consistently for title and excerpt rendering, and use standard Astro interpolation (`{post.title.rendered}` after stripping) instead of `set:html`.

For full article body (`content.rendered`), integrate a server-side HTML sanitiser such as `isomorphic-dompurify` that explicitly allows a safe allowlist (p, h2, h3, ul, ol, li, a, img, strong, em, blockquote) and strips script, style, and event handler attributes.

**Verification Steps:** Inject `<img src=x onerror=alert(1)>` into a WordPress post title via the API and confirm it is not executed on the Astro blog page after the fix.

---

#### P1-002: `set:html` on WooCommerce Product Description (Raw HTML from Admin)

| Field | Value |
|---|---|
| ID | P1-002 |
| Severity | P1 — Major |
| Status | Open |
| Category | Security — XSS |
| File | `src/pages/products/[slug].astro` |
| Lines | 92 |

**Evidence:**

```astro
<div class="product-story__prose" set:html={product.description} />
```

`product.description` is set in `woocommerce.js` as:

```js
description: product.description || "",
```

This is the raw `description` field from the WooCommerce REST API response, which contains full HTML as entered in the WordPress product editor including any embedded shortcodes that may have been expanded to HTML by WooCommerce plugins.

**Impact:**

WooCommerce admin users can include arbitrary HTML in product descriptions. Injected JavaScript would execute on the dokanelbanat.com origin in all visitors' browsers. While this requires admin access, it represents an insider threat and post-compromise escalation path.

**Recommended Fix:**

Sanitise `product.description` with an allowlist HTML sanitiser (e.g. `isomorphic-dompurify`) before storing it in the normalised product object in `woocommerce.js`. Only allow: `p`, `h2`, `h3`, `h4`, `ul`, `ol`, `li`, `a[href]`, `img[src][alt]`, `strong`, `em`, `br`, `blockquote`. Strip all event handlers and `javascript:` hrefs.

**Verification Steps:** Add a product description containing `<script>alert(1)</script>` in WooCommerce admin and confirm the Astro product page does not execute it after the fix.

---

#### P1-003: `.env.example` Missing Active Environment Variables

| Field | Value |
|---|---|
| ID | P1-003 |
| Severity | P1 — Major |
| Status | Open |
| Category | Correctness / Developer Experience |
| File | `.env.example` |
| Lines | 1–4 |

**Evidence:**

`.env.example` contains:

```
WOO_BACKEND_URL=
DB_BRIDGE_SECRET=
PUBLIC_SITE_URL=
```

But `src/lib/woocommerce.js` also reads:

```js
const WOO_STORE_API = import.meta.env.WOO_STORE_API_URL ?? "";
const WOO_API = import.meta.env.WOO_API_URL ?? "";
const WOO_CONSUMER_KEY = import.meta.env.WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = import.meta.env.WOO_CONSUMER_SECRET;
```

And `src/lib/wordpress.js` reads:

```js
const WP_API = import.meta.env.WP_API_URL ?? "";
```

The actual `.env` file only contains `WP_API_URL`. The Admin API path (`WOO_API_URL`, `WOO_CONSUMER_KEY`, `WOO_CONSUMER_SECRET`) and Store API path (`WOO_STORE_API_URL`) are entirely absent from both `.env` and `.env.example`.

**Impact:**

A new developer deploying from `.env.example` will get no product data with no clear error message. The `woocommerce.js` fallback chain returns `[]` silently. The checkout page will silently fail to identify products. There is no startup warning or health-check assertion for missing required configuration.

**Recommended Fix:**

Update `.env.example` to document all consumed environment variables:

```
# WooCommerce Admin REST API (preferred — enables full product data)
WOO_API_URL=https://your-wordpress.com/wp-json/wc/v3
WOO_CONSUMER_KEY=ck_xxx
WOO_CONSUMER_SECRET=cs_xxx

# WooCommerce Store API (fallback, no credentials needed)
WOO_STORE_API_URL=https://your-wordpress.com/wp-json/wc/store/v1

# WordPress REST API (for blog posts)
WP_API_URL=https://your-wordpress.com/wp-json/wp/v2

# Bridge (server-to-server between Astro and WordPress plugin)
WOO_BACKEND_URL=https://your-wordpress.com/wp-json/dokanelbanat/v1
DB_BRIDGE_SECRET=strong-random-secret

# Public site URL (used in download and recovery emails)
PUBLIC_SITE_URL=https://dokanelbanat.com
```

**Verification Steps:** Clone the repository, copy `.env.example` to `.env`, and confirm the health check and product listing work correctly after filling in values.

---

#### P1-004: Hero Section Images Reference External Unsplash URLs Without CDN Proxy

| Field | Value |
|---|---|
| ID | P1-004 |
| Severity | P1 — Major |
| Status | Open |
| Category | Performance / Privacy |
| File | `src/components/Hero.astro` |
| Lines | 34–87 |

**Evidence:**

```astro
<img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&q=80" ... />
```

There are 16 such direct external Unsplash image references (8 originals + 8 duplicates for loop). All are marked `loading="lazy"` including duplicated content.

**Impact:**

- 16 cross-origin image requests to `images.unsplash.com` on every hero render. These add DNS resolution, TCP handshake, and TLS overhead.
- All hero images are `loading="lazy"`, which is incorrect for above-the-fold LCP images. The first visible images in the hero slider should use `loading="eager"` or `fetchpriority="high"`.
- Unsplash's CDN may have rate limits or availability SLAs lower than a first-party CDN.
- Browser privacy protections (Firefox Enhanced Tracking Protection, Safari ITP) may block or delay these third-party image loads, causing blank hero panels.
- Visitors' IP addresses are sent to Unsplash on every page view, which may have GDPR implications under the EU DSA/GDPR if this site serves EU visitors. The Privacy Policy mentions Google Analytics tracking but does not mention Unsplash.

**Recommended Fix:**

Download the Unsplash images, store them in `public/assets/hero/`, and reference them locally. Or route them through the existing `/api/image` proxy (which already caches with `Cache-Control: public, max-age=86400`). Add `loading="eager"` to the first visible image pair and `fetchpriority="high"` to LCP candidates.

**Verification Steps:** Load the homepage with DevTools Network panel open. Confirm zero requests to `images.unsplash.com`.

---

#### P1-005: `getStaticPaths()` Functions Silently Ignored in SSR Mode

| Field | Value |
|---|---|
| ID | P1-005 |
| Severity | P1 — Major |
| Status | Open |
| Category | Correctness / Build |
| Files | `src/pages/blog/[slug].astro` (lines 5–7), `src/pages/products/[slug].astro` (lines 5–7) |

**Evidence:**

Both pages define `export async function getStaticPaths()` which fetches all slugs at build time. The build emits:

```
[WARN] [router] getStaticPaths() ignored in dynamic page /src/pages/blog/[slug].astro.
```

With `output: 'server'` in `astro.config.mjs`, these pages are rendered on-demand by the Node adapter. `getStaticPaths()` is a static-build concept and is silently discarded.

**Impact:**

- The intent of pre-populating all slug paths for 404-free SSR is not achieved. Instead, every slug hit triggers a live fetch to the WordPress/WooCommerce API.
- If either API is down or rate-limits the server, visitors get 500 errors instead of cached static pages.
- Wasted code complexity and developer confusion — future maintainers may mistakenly believe pre-rendering is happening.
- As a secondary issue: `getProductBySlug()` in `woocommerce.js` (line 175–178) fetches all 100 products to find one by slug (linear scan). At SSR time this is a per-request overhead that does not exist in static-build mode.

**Recommended Fix (Option A — keep SSR, remove dead code):**

Remove the `getStaticPaths` export from both pages and add a comment explaining the SSR-driven approach.

**Recommended Fix (Option B — partial prerender):**

Add `export const prerender = true;` to both pages to enable static generation for slug pages while keeping the rest of the site as SSR. This requires the Astro hybrid output mode or explicit prerender flags. Also add a direct-by-slug API endpoint in WooCommerce/WordPress rather than fetching all records for a linear search.

**Verification Steps:** Confirm build output emits no `getStaticPaths() ignored` warnings. Verify blog and product slug pages still resolve correctly.

---

### P2 — Minor

---

#### P2-001: Social Share Links Use Hardcoded `https://dokanelbanat.com` Domain

| Field | Value |
|---|---|
| ID | P2-001 |
| Severity | P2 — Minor |
| Status | Open |
| Category | Maintainability / Correctness |
| Files | `src/components/ProductsGrid.astro` (lines 52, 55, 58), `src/pages/products/index.astro` (lines 59, 62, 65) |

**Evidence:**

```astro
<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dokanelbanat.com' + product.productUrl)}`}>
```

This hardcoded domain string is duplicated identically across two files. The share code exists in both `ProductsGrid.astro` and `products/index.astro` as a copy-paste duplicate.

**Impact:** If the domain changes, or during staging/preview environments, share URLs will point to the wrong domain. During testing, Facebook/Twitter shared URLs will be production URLs even on staging.

**Recommended Fix:**

Use `PUBLIC_SITE_URL` from the environment (already defined in `.env.example`):

```js
const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? 'https://dokanelbanat.com';
```

Extract the share button row into a dedicated `<ShareRow>` component to eliminate the duplication.

---

#### P2-002: Missing Open Graph and Twitter Card Meta Tags

| Field | Value |
|---|---|
| ID | P2-002 |
| Severity | P2 — Minor |
| Status | Open |
| Category | SEO / Social Sharing |
| File | `src/layouts/BaseLayout.astro` |
| Lines | 15–19 |

**Evidence:**

The `<head>` section has only:

```html
<meta name="description" content={description} />
{ogImage && <meta property="og:image" content={ogImage} />}
<title>{title}</title>
```

Missing: `og:title`, `og:type`, `og:url`, `og:description`, `twitter:card`, `twitter:title`, `twitter:description`, `<link rel="canonical">`.

**Impact:** When shared on social platforms (Facebook, Twitter/X, WhatsApp), the site will display without a rich preview card (no title or description box, possibly just an image). This is particularly impactful because the product pages generate dynamic og:image but the social card won't have a title or description to accompany it. SEO: without `<link rel="canonical">`, search engines may index multiple URL variants as duplicate content.

**Recommended Fix:**

Add complete Open Graph and Twitter Card meta tags to `BaseLayout.astro`. Derive the canonical URL from `Astro.url.href` or `PUBLIC_SITE_URL`.

---

#### P2-003: `src/pages/products/[slug].astro` — `getProductBySlug` Does Full Product Scan

| Field | Value |
|---|---|
| ID | P2-003 |
| Severity | P2 — Minor |
| Status | Open |
| Category | Performance |
| Files | `src/lib/woocommerce.js` (lines 175–183), `src/pages/products/[slug].astro` |

**Evidence:**

```js
export async function getProductBySlug(slug) {
  const products = await getProducts(100);
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id) {
  const products = await getProducts(100);
  return products.find((product) => product.id === id) ?? null;
}
```

Every SSR render of a product detail page fetches all 100 products from the WooCommerce API, then performs a linear JavaScript `find()` to locate one item.

**Impact:** Adds ~100-product API fetch latency on every product page request. If WooCommerce has 100+ products, older products will silently never be found (hard capped at `perPage=100`). The checkout page (`getProductById`) has the same issue.

**Recommended Fix:** Implement a dedicated slug/ID endpoint in the WooCommerce bridge or use WooCommerce's built-in `/products?slug=xxx` API parameter. Cache the product list at the Astro layer (in-memory or Redis) with a short TTL.

---

#### P2-004: Cookie Consent / GDPR Notice Missing for GTM and Analytics

| Field | Value |
|---|---|
| ID | P2-004 |
| Severity | P2 — Minor |
| Status | Open |
| Category | Legal Compliance |
| Files | `src/layouts/BaseLayout.astro`, `src/pages/privacy.astro` |

**Evidence:**

GTM snippet is injected on every page on first load with no cookie consent banner or prior opt-in mechanism. The Privacy Policy mentions cookies but provides no opt-out mechanism in the UI. The policy was last updated May 2026 and mentions "analytics tools" but does not name Google (GTM/GA4).

**Impact:** Under GDPR (if serving EU users) and similar regulations (LGPD, PECR), setting marketing/analytics cookies without prior user consent is a legal violation. The GDPR fine for this is up to 4% of global annual turnover or €20M, whichever is higher.

**Recommended Fix:** Implement a cookie consent banner (CMP) that conditionally loads GTM only after user consent. Several lightweight open-source CMPs exist (CookieConsent v3, Klaro). Also update the Privacy Policy to name specific analytics providers.

---

#### P2-005: No `<link rel="icon">` in BaseLayout

| Field | Value |
|---|---|
| ID | P2-005 |
| Severity | P2 — Minor |
| Status | Open |
| Category | UX / SEO |
| File | `src/layouts/BaseLayout.astro` |

**Evidence:** The `<head>` section has no `<link rel="icon">`, `<link rel="apple-touch-icon">`, or `<link rel="manifest">`. While the browser may auto-discover a favicon at `/favicon.ico`, there is no explicit declaration.

**Impact:** Browser tabs will show a generic icon. Bookmarks and home-screen shortcuts will use a default placeholder icon. This also affects PWA and app-like installation on iOS.

**Recommended Fix:** Add favicon meta tags pointing to the existing logo assets or a purpose-built favicon set generated from the brand logo.

---

#### P2-006: `Hero.astro` Has Two `<h1>` Elements

| Field | Value |
|---|---|
| ID | P2-006 |
| Severity | P2 — Minor |
| Status | Open |
| Category | Accessibility / SEO |
| File | `src/components/Hero.astro` |
| Lines | 11–16 |

**Evidence:**

```astro
<h1 class="ds-section-label" style="margin-block:0;">منذ عام 2018</h1>
...
<h1 class="hero-brand__arabic" style="margin:0;">دكان البنات</h1>
```

The component contains two `<h1>` elements. Combined with the `<h2>` for the English brand name, the heading hierarchy in the hero section is `h1 > h1 > h2`.

**Impact:** Multiple `<h1>` elements are a WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) concern. Screen readers and search engines use the single `<h1>` to identify the primary page topic. Having two `<h1>` elements creates ambiguity. It also conflicts with SEO best practice of one `<h1>` per page.

**Recommended Fix:** Change the "منذ عام 2018" heading to a `<p>` or `<span>` with the `ds-section-label` class. Keep `<h1>` only for the brand name "دكان البنات".

---

#### P2-007: `download` Route in WordPress Plugin Requires Bridge Secret (Server-to-Server Only) But May Be Exposed in Email Links

| Field | Value |
|---|---|
| ID | P2-007 |
| Severity | P2 — Minor |
| Status | Open |
| Category | Architecture / Security Design |
| Files | `wordpress-plugin/dokanelbanat-commerce-bridge/includes/class-dcb-routes.php` (line 46–57), `class-dcb-email.php` (line 89) |

**Evidence:**

The `/download/{token}` route uses `DCB_Auth::permission_callback` which requires the `X-DCB-Secret` header. The email sends a URL to `https://dokanelbanat.com/download/{token}` (the Astro frontend domain). There is no `/download/[token].astro` page or API route in the Astro project.

**Impact:** The download URL in emails would resolve to a 404 on the Astro frontend unless an Astro `/download/[token]` page or proxy is present (not found in the codebase). If the intent is for the Astro server to forward the request to the WordPress bridge (with the secret), that proxying layer is missing. Customers who receive the download email will receive a broken download link.

**Recommended Fix:** Add `src/pages/api/download/[token].ts` to the Astro project that authenticates with the bridge secret and proxies the file download, streaming the response to the browser. This is the same pattern as the existing checkout and recover-download API routes.

**Verification Steps:** Place a test order, check the confirmation email link, and verify the download works end-to-end.

---

### P3 — Polish

---

#### P3-001: `width="auto"` on Logo Image in Header

| Field | Value |
|---|---|
| ID | P3-001 |
| Severity | P3 — Polish |
| Status | Open |
| Category | HTML Correctness |
| File | `src/components/Header.astro` |
| Line | 29 |

**Evidence:** `<img src="..." height="44" width="auto">` — `width="auto"` is not a valid HTML attribute value; the `width` attribute only accepts integer values. In practice browsers ignore it, but it causes an HTML validation warning. The correct approach for fixed-height with auto-width is to set `height="44"` and omit `width` entirely, controlling the width via CSS `width: auto`.

---

#### P3-002: Inline Styles Scattered Across Multiple Components

| Field | Value |
|---|---|
| ID | P3-002 |
| Severity | P3 — Polish |
| Status | Open |
| Category | Design-System Hygiene |
| Files | `src/pages/404.astro` (5 instances), `src/pages/index.astro` (multiple), `src/components/MagazineGrid.astro` (line 24), `src/pages/products/index.astro` |

**Evidence:** Multiple `style="..."` attribute strings scattered across page and component files, e.g.:

```astro
<div class="ds-hero__title" style="display:flex;flex-direction:column;gap:var(--space-2);">
<div ... style="text-align:center;margin-bottom:var(--space-12);">
```

**Impact:** Inline styles bypass the design system's component classes, duplicate values that belong in CSS, and make theming changes harder. Each instance should be a design-system utility class or a component-scoped style block.

---

#### P3-003: `rel="noopener"` Missing `noreferrer` on Several Social Links

| Field | Value |
|---|---|
| ID | P3-003 |
| Severity | P3 — Polish |
| Status | Open |
| Category | Security / Privacy |
| File | `src/components/Footer.astro`, `src/components/Header.astro` |

**Evidence:** Social links in Header and Footer use `rel="noopener"` without `noreferrer`. The product share links correctly use `rel="noopener noreferrer"`. Best practice for third-party `target="_blank"` links is to include both `noopener` (prevents opener access) and `noreferrer` (prevents Referer header leakage to third parties).

---

#### P3-004: No `<link rel=".gitattributes">` for Line Ending Normalisation

| Field | Value |
|---|---|
| ID | P3-004 |
| Severity | P3 — Polish |
| Status | Open |
| Category | Repository Hygiene |
| File | Repository root |

**Evidence:** `git diff --check` emits 10 LF→CRLF warnings for modified files. No `.gitattributes` file exists to enforce consistent line endings across Windows and Linux/macOS contributors.

**Recommended Fix:** Add a `.gitattributes` file with `* text=auto` and explicit `*.astro text eol=lf`, `*.ts text eol=lf`, `*.js text eol=lf`, `*.css text eol=lf`, `*.php text eol=lf`.

---

#### P3-005: `MagazineGrid.astro` — Featured Post Is Last Array Item, Not First

| Field | Value |
|---|---|
| ID | P3-005 |
| Severity | P3 — Polish |
| Status | Open |
| Category | Logic / UX |
| File | `src/components/MagazineGrid.astro` |
| Lines | 15–16 |

**Evidence:**

```js
const featuredPost = allPosts[allPosts.length - 1] ?? null;
const standardPosts = allPosts.slice(1, -1);
```

The WordPress API is called with `orderby=date&order=desc`, meaning `allPosts[0]` is the most recent post. Selecting `allPosts[allPosts.length - 1]` (the last item) as "featured" means the oldest of the 6 fetched posts is displayed as the featured article. `standardPosts.slice(1, -1)` removes both the first and last post, leaving only posts 1–4 (indices 1 to 4).

**Impact:** The most recent post (index 0) is silently dropped from the homepage magazine section entirely. The featured post is the oldest, not the most relevant.

**Recommended Fix:**

```js
const featuredPost = allPosts[0] ?? null;          // most recent
const standardPosts = allPosts.slice(1, 5);         // next 4
```

---

#### P3-006: Health API Endpoint Exposes `environment` (MODE) Value Publicly

| Field | Value |
|---|---|
| ID | P3-006 |
| Severity | P3 — Polish |
| Status | Open |
| Category | Information Disclosure |
| File | `src/pages/api/health.ts` |
| Lines | 8–9 |

**Evidence:**

```ts
environment: import.meta.env.MODE,
```

The `/api/health` endpoint is publicly accessible (no authentication) and returns `{"ok":true,"service":"dokanelbanat","timestamp":"...","environment":"production"}`. While low-risk individually, environment disclosure is a reconnaissance aid for attackers looking for staging/dev instances with reduced security settings.

**Recommended Fix:** Remove the `environment` field from the public health endpoint. If it is needed for internal monitoring, gate it behind the `DB_BRIDGE_SECRET` or restrict it to internal network access only.

---

## 7. Architecture and Maintainability

### Overall Architecture

The system is a well-thought-out three-tier architecture:

1. **Astro SSR Frontend** — handles routing, product/blog fetching, form submission, and proxying
2. **WooCommerce REST API** — product data source (Admin API or Store API with graceful fallback)
3. **WordPress Commerce Bridge Plugin** — server-side order processing, rate limiting, email, and file downloads

The separation of concerns between Astro (request validation at edge) and the WordPress plugin (business logic and data persistence) is clean and appropriate. The bridge secret pattern is correct for service-to-service authentication.

### Positive Patterns

- Idempotency key on checkout prevents double-order on network retry
- `normalizeClientIp()` validates IP before forwarding (prevents header injection into rate-limit buckets)
- `DCB_Logger::redact()` strips sensitive keys from log data
- `wooFetch()` catches all errors and returns `null` cleanly
- `getProducts()` fallback chain (Admin API → Store API) is resilient

### Maintainability Concerns

- `woocommerce.js` has two near-identical normalizer functions (`normalizeStoreProduct` and `normalizeAdminProduct`) that diverge only in price formatting. A single normalizer with a format-price strategy parameter would reduce duplication.
- `getProductBySlug` and `getProductById` both fetch all 100 products for a linear search (P2-003).
- The social share button block is copy-pasted identically between `ProductsGrid.astro` and `products/index.astro` (P2-001).
- `product-card__placeholder` CSS class is defined in both `ProductsGrid.astro` (line 92) and `products/index.astro` (line 139) — duplicate scoped style blocks.

---

## 8. Security Review

### Strengths

- **Bridge secret authentication** using `hash_equals()` (timing-safe comparison) — correct.
- **No X-Forwarded-For trust** — `clientAddress` from Astro adapter used for IP derivation; XFF not trusted (prevents IP spoofing).
- **SSRF mitigation in image proxy** — hostname allowlist, redirect rejection, MIME allowlist (no SVG), path traversal check.
- **SQL injection prevention** — all raw SQL in download handler uses `$wpdb->prepare()`.
- **Path traversal prevention** — `realpath()` + `str_starts_with($real_path, $real_uploads)` in download handler.
- **Honeypot fields** in checkout and recover-download forms prevent naive bot submissions.
- **Privacy-safe rate limiting** — SHA-256 hashed keys; raw email/IP never stored in transient keys.

### Vulnerabilities and Risks

| ID | Issue |
|---|---|
| P0-001 | GTM placeholder in production — third-party JS injection risk |
| P0-002 | WooCommerce credentials in URL query parameters |
| P1-001 | `set:html` on WordPress titles/excerpts — stored XSS via compromised WP |
| P1-002 | `set:html` on WooCommerce product description — admin XSS |
| P2-004 | No cookie consent for GTM — potential GDPR violation |

### Additional Security Observations

- The `DCB_Download_Token` class stores tokens in the `wp_options` table as a serialized PHP array (via `update_option`). With up to 2,000 tokens, each with a 64-character hex key, this option row can grow to ~200 KB. Very high order volume could degrade `get_option` performance. Consider migrating to a custom database table or WordPress transients (which use `wp_options` but with automatic expiry handled by WP cron).
- The `DCB_Idempotency` class has a similar `wp_options` serialization pattern with a 500-item cap. Both classes use `array_shift()` as an eviction strategy, which discards oldest entries in insertion order — this is acceptable but note that `array_shift()` on large PHP arrays has O(n) reindex cost.
- `normalizeClientIp()` is duplicated identically in both `free.ts` and `recover-download.ts`. It should be extracted to a shared utility module.

---

## 9. Accessibility Review

### Strengths

- Mobile navigation uses correct ARIA dialog pattern: `role="dialog"`, `aria-modal="true"`, `aria-label`, `aria-hidden`, `inert` attribute.
- Focus is correctly returned to the hamburger trigger on drawer close.
- Focus trap (Tab/Shift-Tab cycling) with Escape key support implemented correctly in the inline drawer script.
- All interactive elements have `focus-visible` outline styles respecting the design-system `--focus-ring` token.
- `prefers-reduced-motion` media query honoured for all CSS animations and transitions.
- `aria-current="page"` set correctly on active nav items in both desktop and mobile nav.
- Form fields use `aria-required`, `aria-describedby` (pointing to error spans), and `role="alert"` on error regions.
- `aria-hidden="true"` on decorative SVGs throughout.

### Issues Found

| ID | Issue |
|---|---|
| P2-006 | Two `<h1>` elements in Hero component — accessibility and SEO concern |
| P3-005 | Featured post selection bug means most-recent content is silently hidden |

### Additional Observations

- No skip-navigation link (`<a class="skip-link" href="#main-content">`) is present. Users navigating by keyboard must Tab through the full header on every page. Add one as the first child of `<body>`.
- The hero slider images (`aria-hidden="true"` on the container) are correctly hidden from screen readers. The `alt` text of all 16 slider images is `"صورة بنت"` (literally "a girl's picture") — while not exposed to screen readers, if `aria-hidden` were ever removed, this undifferentiated alt text would be uninformative.
- Social share link `aria-label` values are in English ("Share on Facebook", "Share on X") while the site is entirely Arabic RTL. These should be localised to Arabic.

---

## 10. Performance Review

### Strengths

- Astro SSR with Node adapter is appropriate for a server-rendered dynamic product catalogue.
- CSS `components.css` uses CSS custom properties extensively — no large JavaScript style recalculation.
- Product and blog images use `loading="lazy"` consistently on non-above-fold content.
- The image proxy adds `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`.
- Design system uses `clamp()` for fluid typography — no media-query-based font size jumps.
- `prefers-reduced-motion` disables all CSS animations at the OS level.

### Issues Found

| ID | Issue |
|---|---|
| P1-004 | 16 Unsplash external images in hero — cross-origin requests, lazy-loaded LCP images |
| P2-003 | `getProductBySlug`/`getProductById` — full 100-product fetch for each SSR request |
| P1-005 | `getStaticPaths()` silently ignored — no static caching, full API fetch per SSR |

### Additional Observations

- There are no `<link rel="preload">` or `fetchpriority="high"` hints for LCP images or critical fonts.
- The design system imports Tailwind CSS via `@import "tailwindcss"` in `global.css`. In Tailwind v4, this is the new CSS-first approach — no configuration file is needed. However, combined with the large design-system CSS (7 imported files), bundle size should be audited after build.
- `will-change: transform` on `.hero-slider__track` (in `index.astro` line 83) promotes the element to its own compositor layer. With 16 large images and two independent animation timelines, GPU memory usage on lower-end mobile devices may be significant.

---

## 11. Responsive and RTL Review

### Strengths

- All layout uses CSS logical properties (`padding-inline`, `margin-inline`, `inset-inline-start`) consistently — RTL is handled at the CSS level with no JavaScript direction switching.
- `direction: rtl` set on `<html>` in both `BaseLayout.astro` and `components.css`.
- Breakpoints are consistent: 1024px (desktop nav), 768px (grid changes), 640px (mobile typography), 480px (grid single-column), 900px (checkout layout).
- Mobile drawer is positioned using `inset-inline-start: 0` (right edge in RTL) — correct and explicit.
- All min-touch-target sizes for interactive elements are 44×44px (hamburger, close button, social icons).

### Issues Found

| ID | Issue |
|---|---|
| P3-001 | `width="auto"` on logo img — invalid HTML attribute value |

### Additional Observations

- The `products-grid` uses `grid-template-columns: repeat(3, 1fr)` at desktop, `repeat(2, 1fr)` at 1024px, and `1fr` at 640px. This is a sensible RTL-compatible grid that flows correctly with direction changes.
- The `ds-mobile-nav` uses `transform: translateX(100%)` to hide off-screen right (in RTL, `inset-inline-start: 0` maps to the right side). This is correct for a right-entry drawer but relies on the drawer being `position: fixed` and the transform direction being physically right — which works but could be expressed more explicitly using `translateX(-100%)` with `inset-inline-end: 0` for a more semantic approach.

---

## 12. Design-System and CSS Hygiene

### Strengths

- Token system in `tokens.css` is comprehensive: colors, opacity scale, typography scale (Arabic and English), letter-spacing, layout, border-radius, shadow, motion.
- No hardcoded pixel colors in component files — all values reference CSS custom properties.
- Component variants follow a consistent BEM-like naming: `ds-btn`, `ds-btn--primary-solid`, `ds-btn--lg`, `ds-btn--pill`.
- `@media (prefers-reduced-motion: reduce)` blocks are co-located with each animated component rule — excellent maintainability practice.
- The Tailwind `@theme` block in `global.css` correctly aliases design-system tokens into Tailwind's theme engine without duplicating values.

### Issues Found

| ID | Issue |
|---|---|
| P3-002 | Inline styles scattered in page components instead of design-system utility classes |
| P3-003 | `rel="noopener"` without `noreferrer` on some external links |

### Additional Observations

- `product-card__placeholder` (without `ds-` prefix) and `product-skel` classes appear in two separate scoped style blocks in different files. If these components are ever extracted into a standalone component, the styles should move with them.
- The `ds-checkbox` class in `checkout.astro` overrides the design-system checkbox pattern — the scoped styles in `checkout.astro` define `.ds-checkbox` locally rather than reusing the design-system `.ds-check__input`. This creates a disconnect: visual inconsistency between the checkout checkbox and any future checkbox elsewhere using `.ds-check__input`.
- `color: var(--color-danger)` and `color: var(--color-error, #ef4444)` are used inconsistently for error states. The token `--color-error` is referenced with a fallback in component styles but is not defined in `tokens.css` — only `--color-danger` is defined. This means error states silently fall back to the hardcoded `#ef4444` red rather than the brand danger token.

---

## 13. SEO Review

| Check | Status | Notes |
|---|---|---|
| `<title>` tag | Pass | Unique per page, Arabic text |
| `<meta name="description">` | Pass | Present on all pages |
| `og:image` | Partial | Present but conditional; missing `og:title`, `og:type`, `og:url` |
| Twitter Card | Fail | No `twitter:card` meta tag |
| Canonical URL | Fail | No `<link rel="canonical">` |
| Structured data (JSON-LD) | Fail | No schema.org markup for products, articles, or organization |
| Heading hierarchy | Partial | Two `<h1>` in Hero (P2-006), otherwise consistent |
| `robots.txt` | Unknown | Not found in `public/` directory |
| `sitemap.xml` | Unknown | Not found; Astro's sitemap integration not enabled |
| Image alt text | Partial | Product images use API-provided alt; hero slider has generic "صورة بنت" for all images |
| Page speed (LCP) | At risk | Hero images are lazy-loaded; no `fetchpriority` hints |

### Recommendations

1. Add `og:title`, `og:type`, `og:url`, `og:description`, `twitter:card` to `BaseLayout.astro`.
2. Add `<link rel="canonical">` using `Astro.url.href` or a configured base URL.
3. Add `@astrojs/sitemap` integration for automated sitemap generation.
4. Add `public/robots.txt` with appropriate crawl directives.
5. Add JSON-LD `Product` schema to product pages and `Article` schema to blog pages.

---

## 14. Testing and Observability

### Test Coverage

| Suite | Status | Notes |
|---|---|---|
| PHP plugin verify.php | 99/99 PASS | Excellent behavioral coverage |
| JS verify-checkout-url.mjs | 19/19 PASS | Good contract testing |
| Unit tests (JS/TS) | None | No unit tests for `woocommerce.js`, `wordpress.js`, or API routes |
| E2E tests | None | No Playwright or similar tests in the codebase |
| Type coverage | Partial | `woocommerce.js` and `wordpress.js` are plain JS; API routes are TypeScript |

### Observability

- `DCB_Logger` wraps WC_Logger — logs to WooCommerce log channel `dcb-*`. Appropriate.
- PII redaction in `DCB_Logger::redact()` is correct for keys containing `email`, `secret`, `password`, `phone`, `key`, `token`.
- The Astro frontend has no structured logging. Errors in `wooFetch()` and `wpFetch()` use `console.error()` which will appear in Node.js server stderr. No structured logging format, no request ID propagation.
- The health endpoint at `/api/health` provides basic liveness; no readiness probe (WooCommerce reachability check).

### Recommendations

1. Add TypeScript JSDoc types or convert `woocommerce.js` and `wordpress.js` to `.ts` files.
2. Add a readiness probe to `/api/health` that pings the WordPress API and returns 503 if unreachable.
3. Add Playwright E2E tests for the checkout flow (submit form, verify order confirmation redirect).
4. Consider adding `console.error` structured output in Astro API routes for monitoring systems.

---

## 15. Positive Findings

### POS-001: PHP Plugin Test Suite — 99/99 Passing

The `wordpress-plugin/dokanelbanat-commerce-bridge/tests/verify.php` file contains 99 behavioral assertions covering download URL replacement, atomic SQL accounting, rate limiting, IP validation, email template rendering (plain-text vs. HTML), view-order URL override, SMTP configuration validation, and PHP syntax. This level of test coverage for a custom WordPress plugin is exceptional and demonstrates disciplined development practice.

### POS-002: Atomic SQL Download Accounting

The download handler uses a single `UPDATE … WHERE downloads_remaining > 0` SQL statement to atomically decrement the download counter and deny concurrent duplicate downloads. This eliminates the TOCTOU (Time-Of-Check-Time-Of-Use) race condition that would allow two simultaneous requests to serve the same last download slot.

### POS-003: Correct ARIA Dialog Pattern on Mobile Navigation

The mobile navigation drawer implements a textbook ARIA dialog pattern:
- `role="dialog"`, `aria-modal="true"` on the drawer
- `inert` attribute on the drawer when closed (prevents keyboard focus from reaching hidden content)
- Focus moved to close button on open via `requestAnimationFrame`
- Focus returned to trigger button on close
- Full focus trap (Tab/Shift-Tab cycling)
- Escape key handler
- Breakpoint-triggered close
- `prefers-reduced-motion` respected for the slide animation

### POS-004: Multi-Bucket Rate Limiting with Privacy-Safe Keys

The four-bucket rate limiting scheme (per-email, per-IP, per-email+IP combination, and global emergency cap) uses SHA-256 hashes of all personal data before storing in WordPress transients. Raw email addresses and IP addresses are never persisted in rate-limit keys.

### POS-005: Image Proxy with Defense-in-Depth

The `/api/image` proxy correctly implements:
- Single allowed hostname (derived from environment variables, not hardcoded)
- SVG exclusion (prevents embedded script execution on first-party origin)
- Redirect rejection (prevents SSRF via redirect chain)
- Path traversal prevention (`..` check)
- MIME type allowlist enforcement via Content-Type header
- `X-Content-Type-Options: nosniff` response header

---

## 16. Prioritized Remediation Plan

### Sprint 1 — Before any production traffic (P0)

| # | Finding | Action | Effort |
|---|---|---|---|
| 1 | P0-001 | Replace `GTM-XXXXXXX` with real GTM ID or gate GTM behind env var | 30 min |
| 2 | P0-002 | Move WooCommerce credentials to `Authorization: Basic` header | 1 hr |

### Sprint 2 — Before marketing campaigns (P1)

| # | Finding | Action | Effort |
|---|---|---|---|
| 3 | P1-001 | Add `isomorphic-dompurify` sanitisation for WP title/excerpt/content | 3 hr |
| 4 | P1-002 | Sanitise `product.description` before `set:html` | 1 hr |
| 5 | P1-003 | Update `.env.example` with all required variables | 30 min |
| 6 | P1-004 | Download Unsplash images locally; fix `loading="lazy"` on LCP images | 2 hr |
| 7 | P1-005 | Remove dead `getStaticPaths()` exports or add `prerender = true` | 1 hr |
| 8 | P2-007 | Add Astro `/api/download/[token].ts` proxy route | 4 hr |

### Sprint 3 — Quality hardening (P2)

| # | Finding | Action | Effort |
|---|---|---|---|
| 9 | P2-001 | Extract share URLs to env variable + deduplicate ShareRow component | 2 hr |
| 10 | P2-002 | Add complete Open Graph + Twitter Card + canonical to BaseLayout | 1 hr |
| 11 | P2-003 | Implement direct product-by-slug API endpoint in WooCommerce | 4 hr |
| 12 | P2-004 | Implement cookie consent banner; gate GTM behind consent | 4 hr |
| 13 | P2-005 | Add favicon/apple-touch-icon/manifest meta tags | 30 min |
| 14 | P2-006 | Fix duplicate `<h1>` in Hero; change "منذ عام 2018" to `<p>` | 15 min |

### Sprint 4 — Polish (P3)

| # | Finding | Action | Effort |
|---|---|---|---|
| 15 | P3-001 | Remove invalid `width="auto"` from logo `<img>` | 5 min |
| 16 | P3-002 | Replace inline styles with design-system utility classes | 3 hr |
| 17 | P3-003 | Add `noreferrer` to social `target="_blank"` links | 15 min |
| 18 | P3-004 | Add `.gitattributes` for LF normalisation | 15 min |
| 19 | P3-005 | Fix featured post selection bug (use index 0, not last) | 15 min |
| 20 | P3-006 | Remove `environment` from public health endpoint | 15 min |

---

## 17. Audit Limitations

1. **No runtime testing** — all findings are based on static code analysis. Some issues (e.g., the download URL 404 in P2-007) could not be confirmed without a running instance against a real WordPress/WooCommerce backend.
2. **No browser opened** — responsive design, visual rendering, animation timing, and real-world Lighthouse scores were not measured.
3. **No penetration testing** — this audit identifies code-visible security patterns. Active exploitation attempts, SSRF probing, or fuzzing of API endpoints were not performed.
4. **No WordPress/WooCommerce backend access** — the WordPress plugin was analyzed in isolation. Its interaction with actual WooCommerce data, WP_Options growth, and email delivery in a live environment were not tested.
5. **Environment variables** — the actual `.env` file in the repository only contains `WP_API_URL`. The presence or correctness of other environment variables in the deployment environment is unknown.
6. **Extraneous npm packages** — the 6 extraneous packages flagged by `npm ls` are likely indirect dependencies of `lightningcss` and were not individually audited for vulnerabilities.
7. **Audit date** — conducted 2026-06-21. Vulnerability status of dependencies reflects packages available at that date.

---

## 18. Final Release Recommendation

### Status: CONDITIONAL — DO NOT RELEASE until P0 items are resolved

**P0-001 (GTM placeholder)** must be resolved before production deployment. A placeholder GTM container ID `GTM-XXXXXXX` in production HTML is both non-functional (analytics data will not be collected) and a potential third-party script injection risk if that container ID is ever claimed externally.

**P0-002 (WooCommerce credentials in URL)** must be resolved before production deployment. API credentials in GET query parameters will appear in server access logs on the WooCommerce host, representing credential exposure at rest.

Once P0 items are resolved, the site can launch at limited traffic with a commitment to address P1 items (particularly P1-001/P1-002 XSS risks and P2-007 broken download links) within the first sprint post-launch.

The codebase is otherwise well-structured, the security architecture is thoughtful, and the PHP plugin test suite demonstrates commendable engineering discipline. The architecture is sound for a digital commerce platform of this scale.

**Overall Verdict: This is a professionally written codebase with specific, actionable issues — not systemic quality problems. It is close to production-ready with targeted fixes.**
