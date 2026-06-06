# Project Checkpoint

_Generated: 2026-06-03 (updated 2026-06-06 — session 3)_

---

## Project Overview

**dokanelbanat.com** (دكان البنات) is an Arab women's lifestyle and business ecosystem — founded 2018, re-launched 2026 under the "Reset Your Mindset" brand. The platform's goal is to become the first complete women's ecosystem in the Arab world, combining a digital magazine, business academy, supplier hub, digital product store, and community events. The current effort is building the landing page at `dokanelbanat.com` as the ecosystem gateway that funnels visitors to four sub-sites.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5.18.1 (static output mode) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + custom design system (CSS custom properties + SCSS + W3C JSON tokens) |
| Fonts | Local: Rubik (headlines/buttons), MarkaziText (body), Blabeloo (accent) — served from `public/fonts/` |
| JavaScript | Vanilla JS (zero dependencies) — side-canvas nav, IntersectionObserver scroll reveals, smooth scroll |
| Data / CMS | WordPress Headless REST API at `blog.dokanelbanat.com` (live as of Phase 2) |
| Build tooling | Vite via Astro, LightningCSS (CSS optimization) |
| Campaign tooling | Python 3 + openpyxl (content calendar generation) |
| Planned sub-sites | WordPress + Tutor LMS (academy), WordPress + WooCommerce (stores), plain WordPress headless (blog/magazine) |

**Language:** Arabic (RTL) primary, English secondary. `<html lang="ar" dir="rtl">` at root.

---

## Current Status

**Phase 1 (landing page) is 100% complete and live.** The site is deployed at `dokanelbanat.com` via Hostinger Node.js Web App with GitHub auto-deploy from the `main` branch. Phase 2 (WordPress CMS) is partially complete — `blog.dokanelbanat.com` is live with 6 published blog articles. Phase 3 sub-sites (academy, stores) are not yet deployed.

**Navigation was fully rebuilt in session 2** — the off-canvas drawer was replaced with a clean left-side canvas implementation using new IDs (`canvas-trigger`, `side-canvas`, `canvas-overlay`, `canvas-close`). All old drawer IDs are gone.

**Session 3 (2026-06-06):** Three mobile/UX fixes and the blog archive page were added — see "Commits this session" below.

---

## Deployment Architecture

| Setting | Value |
|---------|-------|
| Hosting | Hostinger Business Plan — Node.js Web App |
| GitHub repo | https://github.com/ayop0dev/dokanelbanat.com |
| Branch | `main` |
| Framework preset | Astro (auto-detected by Hostinger) |
| Node version | 22.x |
| Build command | `npm run build` |
| Output directory | `dist/` |
| Deploy trigger | Every `git push` to `main` |
| Environment variable | `WP_API_URL = https://blog.dokanelbanat.com/wp-json/wp/v2` |

Hostinger's Git integration replaced the SFTP workflow — pushing to `main` triggers a full Astro build on the server and deploys the `dist/` output automatically. No manual file transfers needed.

---

## What's Done ✅

### Core site (Astro)
- `package.json` — Astro 5.18.1 + Tailwind CSS v4 configured; all deps installed
- `astro.config.mjs` — Vite plugin wired for Tailwind v4 (not legacy `@astrojs/tailwind`)
- `src/layouts/BaseLayout.astro` — RTL HTML shell (`lang="ar"` `dir="rtl"`), CSS imported via frontmatter, JS deferred, Header imported via component; GTM snippet (head `<script>` + `<noscript>` body) — still uses placeholder `GTM-XXXXXXX`
- `src/pages/index.astro` — Assembles all 9 components in correct order with page-level styles
- `src/components/Header.astro` — **Rebuilt (2026-06-03):** Logo + hamburger trigger in header; left-side canvas panel (`#side-canvas`) with three sections: (1) logo + close button, (2) five nav links, (3) social icons row (Instagram, TikTok, YouTube, X). Self-contained `<style is:global>` block. All CSS lives in Header.astro only — `components.css` untouched. Old drawer IDs (`menu-toggle`, `main-nav`, `nav-overlay`, `drawer-close`) completely removed.
- `src/components/Hero.astro` — 2-column layout with dual vertical infinite-scroll image sliders; `منذ عام 2018` label fixed for mobile centering (`margin:0` → `margin-block:0`); currently uses 8 Unsplash CDN images (not owned photography)
- `src/components/About.astro` — "Reset Your Mindset" press-release block + 4 philosophy pillar cards (2×2 grid)
- `src/components/Vision.astro` — Vision & Mission 2-column with SVG icons; final Arabic copy
- `src/components/Numbers.astro` — 4-stat social proof showcase; Arabic-Indic numerals; grain overlay
- `src/components/ProductsGrid.astro` — 3 product cards (static placeholders, Phase 3)
- `src/components/CtaBanner.astro` — Final Arabic copy; `mailto:hello@dokanelbanat.com` CTA; section `id="cta"`
- `src/components/Footer.astro` — 3-column layout; social icon links (Instagram, TikTok, YouTube, X); subdomain links; logo path fixed to absolute `/assets/logo/dokanelbanatlogo.png`
- `src/components/MagazineGrid.astro` — Featured + 2×2 standard layout; wired to WordPress REST API via `getPosts(6)`; animated skeleton card fallback (pulsing shimmer) when API is unreachable
- `src/lib/wordpress.js` — WordPress REST API abstraction (`getPosts`, `getPostBySlug`, `getAllPostSlugs`, `getAllPosts`, `getProducts`); uses `import.meta.env.WP_API_URL`; try/catch with null returns on failure
- `src/scripts/main.js` + `public/scripts/main.js` — **Rewritten (2026-06-03):** Side-canvas logic in `DOMContentLoaded` (`openCanvas`/`closeCanvas` wired to trigger, close button, overlay); IntersectionObserver reveals; smooth scroll with header offset (canvas links excluded via `anchor.closest('#side-canvas')`). Both files byte-for-byte identical.
- `.env` — `WP_API_URL=https://blog.dokanelbanat.com/wp-json/wp/v2`
- `.env.example` — Placeholder env template
- `.gitignore` — `.env` excluded

### Pages
- `src/pages/index.astro` — Main landing page
- `src/pages/privacy.astro` — Full Arabic Privacy Policy (`/privacy`); 6 sections
- `src/pages/terms.astro` — Full Arabic Terms & Conditions (`/terms`); 8 sections
- `src/pages/blog/[slug].astro` — Article detail page; `getStaticPaths()` + `getAllPostSlugs()`; redirects to `/404` on missing slug
- `src/pages/blog/index.astro` — **New (2026-06-06):** Blog archive at `/blog`; 3-col card grid (2-col tablet, 1-col mobile); fetches up to 100 posts via `getAllPosts()`; hero-gradient header with post count; animated skeleton fallback
- `src/pages/404.astro` — Branded Arabic 404 page; uses BaseLayout; "الصفحة التي تبحثين عنها غير موجودة" + back-to-home button

### Design system (`src/styles/design-system/`)
- `tokens.css` — 248+ CSS custom properties: brand colors, semantic color tokens, typography scale (AR + EN), 4px-base spacing, radius, shadow, grid, z-index, gradients, motion, layout
- `globals.css` — Base resets and html/body defaults
- `fonts.css` — `@font-face` for Rubik, MarkaziText, Blabeloo; all paths absolute `/fonts/Filename.ttf`
- `components.css` — Complete component library: atoms, molecules, organisms (~2,070 lines). **Not modified in current session.**
- `layouts.css` — 6 page-level layout patterns
- `motion.css` — Keyframes, easing tokens, staggered reveals, reduced-motion fallbacks
- `utilities.css` — Atomic helper classes
- `src/styles/global.css` — Master entry point: imports Tailwind + all design-system files; exposes DS tokens to Tailwind `@theme`

### Static assets
- `public/fonts/` — Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf (static served)
- `public/assets/logo/` — `dokanelbanatlogo.png` + `dokanelbanatlogo-gradient.png`
- `public/assets/images/` — 8 SVG placeholder files (`hero-1.svg` through `hero-8.svg`); **not currently used by `Hero.astro`** (Hero.astro loads Unsplash CDN instead)
- `public/scripts/main.js` — Manually maintained copy of `src/scripts/main.js`

### Phase 2: WordPress CMS
- `blog.dokanelbanat.com` is live
- 6 campaign blog articles published (confirmed in `dist/blog/`):
  - الاقتصاد بيكسب لما تحسي بالنقص
  - أرقام لا تصدق عن حجم صناعة الجمال
  - انستجرام وصورة الجسد
  - من ربة المنزل إلى رائدة الأعمال
  - الإنفلونسر ماركتينج وآلية الشراء
  - الوعي كأداة تحرر
- Featured images served from `https://blog.dokanelbanat.com/wp-content/uploads/` with AI-generated WebP covers

### Commits session 2 (2026-06-03)
- `9ea0b38` — rebuild off-canvas navigation and fix hero label centering

### Commits session 3 (2026-06-06)
- `20fa015` — fix: hero buttons z-index above images on mobile (`ds-hero__content` z-index:2, `ds-hero__media` z-index:1 at ≤1024px)
- `53b8b4f` — fix: semi-transparent background on secondary outline button on mobile so it's readable over sliding images; primary hero button href changed from `https://blog.dokanelbanat.com` to internal `/blog`
- `a25d735` — feat: blog archive page at `/blog` (3-col grid, skeleton, hero header, `getAllPosts()` helper)

---

## What's In Progress 🔄

### Hero images use Unsplash CDN (not owned photography)
- **File:** `src/components/Hero.astro`
- 8 `<img>` elements load from `images.unsplash.com` directly. Real brand photography still needed per `docs/for images.md` specs.
- Local SVGs exist at `public/assets/images/hero-1.svg` through `hero-8.svg` but are not referenced.

### GTM container ID is still a placeholder
- **File:** `src/layouts/BaseLayout.astro`
- Both head `<script>` and `<noscript>` iframe use `GTM-XXXXXXX`. GTM is structurally wired but inactive.

### 6 of 12 blog articles not yet published
- Published (in dist/): Articles 01–06
- Unpublished (content ready in `campaign/blog/`): Articles 07–12

---

## What's Missing / TODO ❌

### Post-launch fixes (Phase 1 cleanup)
- [ ] **Replace hero Unsplash URLs with owned photography** — 8 images at 4:5 ratio; specs in `docs/for images.md`
- [ ] **Wire real GTM container ID** — Replace `GTM-XXXXXXX` in `BaseLayout.astro`
- [ ] **Number counter animation** — `.ds-counter` class exists on 4 stats in `Numbers.astro` but no JS drives count-up. `main.js` only triggers `.is-visible`; a count-up function triggered by IntersectionObserver is needed.
- [ ] **Inline styles migration** — `index.astro` has a large `<style is:global>` block (~235 lines) covering hero sliders, press-release overlay, pillars 2×2, magazine 5-card, and vision icon styles. These should move to `components.css` or `layouts.css`.

### Phase 2 completion
- [ ] **Publish remaining 6 blog articles** to WordPress (`campaign/blog/` articles 07–12 ready)
- [ ] **Rank Math SEO setup** — Architecture doc specifies Rank Math SEO plugin for WordPress meta fields, OG tags, and sitemap
- [ ] **Verify MagazineGrid live render** — Visual QA of the 5-card layout with real WordPress data on the live site

### Phase 3
- [ ] **Deploy `academy.dokanelbanat.com`** — WordPress + Tutor LMS + WooCommerce
- [ ] **Connect ProductsGrid** to WordPress custom post type via `getProducts()` (function exists in `wordpress.js`, not called in `ProductsGrid.astro`)
- [ ] **Deploy `stores.dokanelbanat.com`** — WordPress + WooCommerce + Fluent Forms

### Phase 4
- [ ] Mobile app (React Native / API-driven)
- [ ] Loyalty program

### Minor clean-up
- [ ] **`docs/Landing Page Visual Direction v2.md`** — file exists but is 1 blank line; populate or delete
- [ ] **`business.dokanelbanat.com`** — footer links to this subdomain; not in architecture doc. Clarify if separate from `stores.dokanelbanat.com`.
- [ ] **`public/scripts/main.js` sync** — Manual copy of `src/scripts/main.js`. Both are in sync as of 2026-06-03 (confirmed byte-for-byte identical via diff). Must be kept in sync manually whenever `src/scripts/main.js` changes.

---

## File Map

```
dokanelbanat/
│
├── astro.config.mjs              Astro config; Tailwind v4 via @tailwindcss/vite Vite plugin
├── package.json                  Project manifest; astro 5.18.1, tailwindcss 4.2.4
├── .env                          WP_API_URL=https://blog.dokanelbanat.com/wp-json/wp/v2
├── .env.example                  Placeholder env template
├── .gitignore                    Excludes .env and standard build artifacts
├── index.html                    Original static landing page (pre-Astro; kept for reference)
│
├── src/
│   ├── pages/
│   │   ├── index.astro           Main landing page; assembles 9 components; page-level styles
│   │   ├── 404.astro             Branded Arabic 404 page
│   │   ├── privacy.astro         /privacy — full Arabic Privacy Policy (6 sections)
│   │   ├── terms.astro           /terms — full Arabic Terms & Conditions (8 sections)
│   │   └── blog/
│   │       ├── index.astro       /blog — archive page; 3-col card grid; getAllPosts(100); skeleton fallback
│   │       └── [slug].astro      /blog/[slug] — article detail page; getStaticPaths + WP API
│   ├── layouts/
│   │   └── BaseLayout.astro      HTML shell: RTL, imports global.css, Header component, defers main.js, GTM stub
│   ├── components/
│   │   ├── Header.astro          Logo + canvas-trigger in header; #side-canvas panel (left-slide, 280px);
│   │   │                         3 canvas sections: logo+close, nav links, social icons; self-contained CSS
│   │   ├── Hero.astro            2-col hero + dual vertical image sliders (Unsplash CDN); label centering fixed
│   │   ├── About.astro           Reset Your Mindset section + 4 philosophy pillars (2×2)
│   │   ├── MagazineGrid.astro    Magazine section; fetches WP posts; animated skeleton fallback
│   │   ├── Vision.astro          Vision & Mission 2-column with SVG icons
│   │   ├── Numbers.astro         4-stat social proof showcase (⚠️ counter animation missing)
│   │   ├── ProductsGrid.astro    3 digital product cards (static placeholders, Phase 3)
│   │   ├── CtaBanner.astro       Full-width CTA with mailto link; id="cta"
│   │   └── Footer.astro          3-column footer + social icons; logo path absolute
│   ├── lib/
│   │   └── wordpress.js          WP REST API abstraction (getPosts, getPostBySlug, getAllPostSlugs, getAllPosts, getProducts)
│   ├── scripts/
│   │   └── main.js               Source JS: canvas logic (DOMContentLoaded), IntersectionObserver, smooth scroll
│   └── styles/
│       ├── global.css            Master CSS entry: Tailwind + design system imports + @theme tokens
│       └── design-system/
│           ├── tokens.css        248+ CSS custom properties (colors, type, spacing, motion)
│           ├── globals.css       Base resets and html/body rules
│           ├── fonts.css         @font-face for Rubik, MarkaziText, Blabeloo (all 3; absolute paths)
│           ├── components.css    Full ds-* component library (~2,070 lines)
│           ├── layouts.css       6 page-level layout patterns
│           ├── motion.css        Keyframes, easing tokens, reduced-motion fallbacks
│           └── utilities.css     Atomic helper classes
│
├── public/
│   ├── fonts/                    Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf (static served)
│   ├── assets/
│   │   ├── logo/                 dokanelbanatlogo.png + dokanelbanatlogo-gradient.png
│   │   └── images/               hero-1.svg through hero-8.svg (SVG placeholders; ⚠️ not used by Hero.astro)
│   └── scripts/
│       └── main.js               Manual copy of src/scripts/main.js (byte-for-byte identical as of 2026-06-03)
│
├── assets/                       Pre-Astro source assets (fonts, logos; mirrored to public/)
│
├── design-system/                Pre-Astro design system source (mirrored to src/styles/design-system/)
│
├── js/
│   └── main.js                   Pre-Astro JS (legacy; not used by Astro build)
│
├── campaign/
│   ├── blog/                     12 SEO articles — 6 published, 6 pending
│   ├── generated-images/         6 AI-generated WebP cover images
│   ├── week-01-bold/ through week-04-empower/   30-day social content
│   └── *.py / *.xlsx             Content calendar scripts and spreadsheet
│
├── docs/
│   ├── checkpoint.md                            ← This file
│   ├── checkpoint-report-5-5-2026.md            Previous checkpoint (pre-Astro migration)
│   ├── Foundational-Description.md              Bilingual brand bible (AR/EN)
│   ├── dokanelbanat-Web Ecosystem Architecture v1.0.md
│   ├── Design System Generation Brief — dokanelbanat.com.md
│   ├── Dokanelbanat.com-ar-text-content.md      All landing page copy (Arabic)
│   ├── astro-building-prompt.md
│   ├── dokanelbanat-review-prompt.md
│   ├── brand-colors-fonts.md
│   ├── for images.md
│   ├── reset-your-mindset-core.md
│   ├── dokanelbanat_ecosystem_architecture.svg
│   └── Landing Page Visual Direction v2.md      ⚠️ EMPTY (1 blank line)
│
└── dist/                         Production build output (deployed to Hostinger)
    ├── index.html
    ├── 404.html
    ├── privacy/index.html
    ├── terms/index.html
    └── blog/                     6 pre-rendered article pages
```

---

## Key Decisions & Notes

1. **Astro over plain HTML** — Migration from `index.html` to Astro 5 completed 2026-05-05. Component splitting, server-side WP API fetch at build time, Tailwind v4 via Vite.

2. **RTL-first design system** — All CSS uses logical properties with `[dir="ltr"]` overrides only where needed. `<html dir="rtl">` at root.

3. **Static output mode** — `output: "static"`. Pages pre-rendered at build time. WP API called during build, not at runtime. Rebuild required on CMS content changes.

4. **No SSO across subdomains** — Each WordPress sub-site has its own independent login. No multisite.

5. **Single GTM container** — One container ID across all four subdomains with `cookie_domain: .dokanelbanat.com`. GTM snippet wired in `BaseLayout.astro`; real ID not yet substituted.

6. **Tailwind v4 (not v3)** — Uses `@tailwindcss/vite` plugin and CSS-first `@theme` block. No `tailwind.config.js`.

7. **`blog.dokanelbanat.com` as headless CMS** — `.env` points to `https://blog.dokanelbanat.com/wp-json/wp/v2`. 6 posts confirmed live from API.

8. **Hostinger Git integration instead of SFTP** — Push to `main` triggers server-side `npm run build` and deploys `dist/`. `.env` variable `WP_API_URL` must be set in Hostinger's environment settings panel (not committed to git).

9. **`public/scripts/main.js` is a manual copy** — Astro does not auto-process `src/scripts/` files as static assets. The file is manually duplicated to `public/scripts/main.js` so it is served at `/scripts/main.js`. Both are in sync as of 2026-06-03. Must be kept in sync manually.

10. **Hero images use Unsplash CDN** — 8 hero slider images fetched at runtime from `images.unsplash.com`. Not brand-owned photography. Eight local SVG placeholders exist but are not referenced.

11. **Campaign content is partially published** — 6 of 12 blog articles are live. The remaining 6 and all 46 social posts exist as `.md` files in `campaign/` awaiting publication.

12. **MagazineGrid empty state is animated skeleton** — Fallback when WP API is unreachable is a pulsing skeleton UI matching the live card layout (1 featured + 4 standard).

13. **Off-canvas navigation rebuilt from scratch (2026-06-03)** — The original `ds-nav` drawer (using design-system classes, old IDs, left-from-right slide) was replaced with a self-contained implementation. New IDs: `canvas-trigger` (hamburger in header), `side-canvas` (panel), `canvas-overlay` (backdrop), `canvas-close` (× button inside panel). Canvas slides in from the left (`left:0; transform: translateX(-100%)`), 280px wide, `z-index:9999`. All canvas CSS lives in `Header.astro <style is:global>` only — `components.css` was not modified. Canvas nav links skip the smooth-scroll handler via `anchor.closest('#side-canvas')`.

---

## Next Recommended Steps

1. **Wire real GTM container ID (critical, 5 min)** — Replace `GTM-XXXXXXX` in `src/layouts/BaseLayout.astro`. Without this, all analytics and paid media attribution are inactive.

2. **Replace hero Unsplash images with owned photography** — 8 photographs at 4:5 ratio per `docs/for images.md`. Place in `public/assets/images/`. Update `Hero.astro` src paths.

3. **Publish remaining 6 blog articles** — Content ready in `campaign/blog/` articles 07–12. Post to WordPress, then `git push` to trigger rebuild.

4. **Add number counter animation** — 4 stats in `Numbers.astro` have `.ds-counter` class. Add count-up JS triggered by IntersectionObserver `is-visible` event.

5. **Deploy `academy.dokanelbanat.com`** — WordPress + Tutor LMS. Once live, `ProductsGrid.astro` can call `getProducts()` instead of static placeholders.

---

_Previous checkpoint: `docs/checkpoint-report-5-5-2026.md` (pre-Astro migration, 2026-05-05)_
