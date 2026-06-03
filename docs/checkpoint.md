# Project Checkpoint

_Generated: 2026-06-03_

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
| JavaScript | Vanilla JS (zero dependencies) — nav toggle, IntersectionObserver scroll reveals, smooth scroll |
| Data / CMS | WordPress Headless REST API at `blog.dokanelbanat.com` (live as of Phase 2) |
| Build tooling | Vite via Astro, LightningCSS (CSS optimization) |
| Campaign tooling | Python 3 + openpyxl (content calendar generation) |
| Planned sub-sites | WordPress + Tutor LMS (academy), WordPress + WooCommerce (stores), plain WordPress headless (blog/magazine) |

**Language:** Arabic (RTL) primary, English secondary. `<html lang="ar" dir="rtl">` at root.

---

## Current Status

**Phase 1 (landing page) is 100% complete and live.** The site is deployed at `dokanelbanat.com` via Hostinger Node.js Web App with GitHub auto-deploy from the `main` branch. Phase 2 (WordPress CMS) is partially complete — `blog.dokanelbanat.com` is live with 6 published blog articles. Phase 3 sub-sites (academy, stores) are not yet deployed.

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
- `src/layouts/BaseLayout.astro` — RTL HTML shell (`lang="ar"` `dir="rtl"`), CSS imported via frontmatter (Vite-processed), JS deferred; GTM snippet (head `<script>` + `<noscript>` body) — still uses placeholder `GTM-XXXXXXX`
- `src/pages/index.astro` — Assembles all 9 components in correct order with page-level styles
- `src/components/Header.astro` — Sticky nav, logo, off-canvas mobile drawer with ARIA attributes
- `src/components/Hero.astro` — 2-column layout with dual vertical infinite-scroll image sliders; currently uses 8 Unsplash CDN images (not owned photography)
- `src/components/About.astro` — "Reset Your Mindset" press-release block + 4 philosophy pillar cards (2×2 grid)
- `src/components/Vision.astro` — Vision & Mission 2-column with SVG icons; final Arabic copy
- `src/components/Numbers.astro` — 4-stat social proof showcase; Arabic-Indic numerals; grain overlay
- `src/components/ProductsGrid.astro` — 3 product cards (static placeholders, Phase 3)
- `src/components/CtaBanner.astro` — Final Arabic copy; `mailto:hello@dokanelbanat.com` CTA
- `src/components/Footer.astro` — 3-column layout; social icon links (Instagram, TikTok, YouTube, X); subdomain links
- `src/components/MagazineGrid.astro` — Redesigned with featured + 2×2 standard layout; wired to WordPress REST API via `getPosts(6)`; animated skeleton card fallback (pulsing shimmer) when API is unreachable; full scoped CSS
- `src/lib/wordpress.js` — WordPress REST API abstraction (`getPosts`, `getPostBySlug`, `getAllPostSlugs`, `getProducts`); uses `import.meta.env.WP_API_URL`; try/catch with null returns on failure
- `src/scripts/main.js` + `public/scripts/main.js` — Nav toggle (ARIA-complete), IntersectionObserver reveals, smooth scroll with header offset
- `.env` — `WP_API_URL=https://blog.dokanelbanat.com/wp-json/wp/v2`
- `.env.example` — Placeholder for other developers
- `.gitignore` — `.env` excluded

### Pages
- `src/pages/index.astro` — Main landing page
- `src/pages/privacy.astro` — Full Arabic Privacy Policy (`/privacy`); 6 sections covering data collection, usage, cookies, security, rights, and updates
- `src/pages/terms.astro` — Full Arabic Terms & Conditions (`/terms`); 8 sections; footer links now functional
- `src/pages/blog/[slug].astro` — Article detail page; uses `getStaticPaths()` + `getAllPostSlugs()`; renders featured image, category, author, date (Arabic locale), and full WordPress HTML prose; scoped CSS with responsive mobile breakpoints; redirects to `/404` on missing slug

### Design system (`src/styles/design-system/`)
- `tokens.css` — 248+ CSS custom properties: brand colors, semantic color tokens, typography scale (AR + EN), 4px-base spacing, radius, shadow, grid, z-index, gradients, motion, layout
- `globals.css` — Base resets and html/body defaults
- `fonts.css` — `@font-face` for Rubik, MarkaziText, **and Blabeloo** (all three fonts declared); all paths are absolute `/fonts/Filename.ttf` — fixed from prior relative paths
- `components.css` — Complete component library: atoms, molecules, organisms (~2,070 lines)
- `layouts.css` — 6 page-level layout patterns
- `motion.css` — Keyframes, easing tokens, staggered reveals, reduced-motion fallbacks; `[dir="ltr"] @keyframes` invalid combinator warning removed
- `utilities.css` — Atomic helper classes
- `src/styles/global.css` — Master entry point: imports Tailwind + all design-system files; exposes DS tokens to Tailwind `@theme`

### Static assets
- `public/fonts/` — Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf (static served)
- `public/assets/logo/` — `dokanelbanatlogo.png` + `dokanelbanatlogo-gradient.png`
- `public/assets/images/` — 8 SVG placeholder files (`hero-1.svg` through `hero-8.svg`); styled with brand gradient, Arabic numerals, and Rubik font; **not currently used by `Hero.astro`** (Hero.astro loads Unsplash CDN instead)
- `public/scripts/main.js` — Built copy of `src/scripts/main.js` (manually maintained, see Key Decision #9)

### Phase 2: WordPress CMS
- `blog.dokanelbanat.com` is live
- At least 6 campaign blog articles published (confirmed in `dist/blog/`):
  - الاقتصاد بيكسب لما تحسي بالنقص (`the-economy-thrives-when-you-feel-incomplete`)
  - أرقام لا تصدق عن حجم صناعة الجمال (`incredible-figures-about-the-size-of-the-beauty-and-advertising-industry`)
  - انستجرام وصورة الجسد (`instagram-and-body-image-what-researchs-say`)
  - من ربة المنزل إلى رائدة الأعمال (`from-housewife-to-entrepreneur-same-trick-different-ways`)
  - الإنفلونسر ماركتينج وآلية الشراء (`influencer-marketing-mechanism`)
  - الوعي كأداة تحرر (`consciousness-as-a-tool-of-liberation-why-knowledge-is-true-power`)
- Featured images served from `https://blog.dokanelbanat.com/wp-content/uploads/` with AI-generated WebP covers
- Category "Reset Your Mindset" confirmed in API response

### Production build (`dist/`)
- Current build artifact present in `dist/`
- CSS bundles: `_astro/index.CyulOq4c.css` (main) + `_astro/_slug_.By9tFgtn.css` (article page)
- All routes built: `/`, `/privacy`, `/terms`, `/blog/[6 published slugs]`

### Legacy / parallel files (pre-Astro, kept for reference)
- `index.html` — Original static landing page (~807 lines); source of truth for Astro migration
- `js/main.js` — Original vanilla JS
- `design-system/` root directory — Original design system source files (mirrored into `src/styles/design-system/`)

### Design system source assets
- `design-system/tokens.scss` — SCSS variables + 12 mixins for WordPress theme integration
- `design-system/tokens/tokens.json` — W3C Design Tokens format (Figma/Style Dictionary)
- `design-system/design-system.md` — Full design system documentation
- `assets/fonts/` — Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf

### Campaign content (`campaign/`)
- `README.md` + `CAMPAIGN_PROMPT.md` — Full campaign documentation and orchestration prompt
- `calendar.xlsx` — 46-row content calendar (Day, Date, Week, Theme, Platform, Content Type, Topic, Hook, Design Brief, Image Prompt, File Path, Status)
- `week-01-bold/` through `week-04-empower/` — 30-day social content (posts, stories, infographics, threads)
- `blog/` — 12 long-form SEO articles (800–2,200 words each, Arabic, with frontmatter and research citations)
- `generated-images/` — 6 AI-generated WebP blog cover images
- Python scripts: `bootstrap_and_build.py`, `runner.py`, `exec_calendar.py`, `verify_and_run.py`, `make_calendar.py`, `build_calendar.py`

### Documentation (`docs/`)
- `Foundational-Description.md` — Bilingual (AR/EN) brand bible: identity, vision, 6 pillars, revenue model, competitive edge
- `dokanelbanat-Web Ecosystem Architecture v1.0.md` — Subdomain map, stack decisions, launch phases, GTM/tracking architecture
- `Design System Generation Brief — dokanelbanat.com.md` — Full DS specification (used to generate design system)
- `Dokanelbanat.com-ar-text-content.md` — All landing page Arabic copy section by section
- `for images.md` — Image sourcing guide: keywords, aspect ratios, editing presets, performance notes
- `reset-your-mindset-core.md` — Research compilation with 30+ footnotes on consumerism, beauty industry, Arab-market psychology
- `brand-colors-fonts.md` — Quick reference for brand colors and font assignments
- `astro-building-prompt.md` — 12-step Astro migration specification
- `dokanelbanat-review-prompt.md` — Review/audit prompt template
- `checkpoint-report-5-5-2026.md` — Previous detailed checkpoint (pre-Astro migration state)
- `dokanelbanat_ecosystem_architecture.svg` — Visual architecture diagram

---

## What's In Progress 🔄

### Hero images use Unsplash CDN (not owned photography)
- **File:** `src/components/Hero.astro`
- **Current state:** 8 `<img>` elements load from `images.unsplash.com` directly. Real brand photography is still needed per `docs/for images.md` specs.
- **Local SVGs exist:** `public/assets/images/hero-1.svg` through `hero-8.svg` are styled placeholder files (gradient fills + Arabic numerals). They are NOT referenced in `Hero.astro` — they exist for future local asset replacement.
- **Fix needed:** Replace Unsplash URLs with owned photography placed in `public/assets/images/`.

### GTM container ID is still a placeholder
- **File:** `src/layouts/BaseLayout.astro` (lines 21–29, 34)
- **Problem:** Both the head `<script>` and `<noscript>` iframe use `GTM-XXXXXXX`. GTM is structurally wired but inactive.
- **Fix needed:** Replace `GTM-XXXXXXX` with the real Hostinger/Google Tag Manager container ID. Then verify GA4 pageview, CTA click events, and Meta Pixel via GTM.

### 6 of 12 blog articles not yet published
- **Published (in dist/):** Articles 01–06
- **Unpublished (content ready in `campaign/blog/`):** Articles 07–12 (minimalism, daily routine, women's community, business owner psychology, clean marketing, reset mindset guide)

---

## What's Missing / TODO ❌

### Post-launch fixes (Phase 1 cleanup)
- [ ] **Replace hero Unsplash URLs with owned photography** — 8 images at 4:5 ratio; specs in `docs/for images.md`. Update `Hero.astro` to reference local `/assets/images/` paths (or delete the SVG placeholders and use real photos directly).
- [ ] **Wire real GTM container ID** — Replace `GTM-XXXXXXX` in `BaseLayout.astro`. Without this, analytics and pixel tracking are inactive.
- [ ] **Create `/404` page** (`src/pages/404.astro`) — `blog/[slug].astro` redirects to `/404` on missing slugs, but no 404 page exists. Astro handles this natively with a `src/pages/404.astro` file.
- [ ] **Fix relative logo paths** — `Header.astro` uses `src="../assets/logo/dokanelbanatlogo-gradient.png"` (relative path — may break on blog sub-routes). `Footer.astro` uses `src="assets/logo/dokanelbanatlogo.png"` (missing leading slash). Both should be `/assets/logo/...`.
- [ ] **Number counter animation** — `.ds-counter` class exists on all 4 stats in `Numbers.astro` but no JS drives the count-up animation. The `main.js` IntersectionObserver only triggers `.is-visible` class; a separate counter loop is needed.
- [ ] **Inline styles migration** — `index.astro` has a large `<style is:global>` block (~235 lines) covering hero sliders, press-release overlay, pillars 2×2, magazine 5-card, and vision icon styles. These should move to `components.css` or `layouts.css`.

### Phase 2 completion
- [ ] **Publish remaining 6 blog articles** to WordPress (`campaign/blog/` articles 07–12 ready)
- [ ] **Rank Math SEO setup** — Architecture doc specifies Rank Math SEO plugin for WordPress meta fields, OG tags, and sitemap
- [ ] **Verify MagazineGrid live render** — Confirm 5-card featured+2×2 layout renders correctly with real WordPress data (the current dist/ build confirms the API is reachable, but visual QA of the live layout is still needed)

### Phase 3
- [ ] **Deploy `academy.dokanelbanat.com`** — WordPress + Tutor LMS + WooCommerce
- [ ] **Connect ProductsGrid** to WordPress custom post type via `getProducts()` (function exists in `wordpress.js`, not called in `ProductsGrid.astro`)
- [ ] **Deploy `stores.dokanelbanat.com`** — WordPress + WooCommerce + Fluent Forms

### Phase 4
- [ ] Mobile app (React Native / API-driven)
- [ ] Loyalty program

### Minor clean-up
- [ ] **`docs/Landing Page Visual Direction v2.md`** — file exists but is 1 blank line; populate or delete
- [ ] **`business.dokanelbanat.com`** — footer links to this subdomain (`العمل مع دكان البنات`); not mentioned in the architecture doc. Clarify whether this is a separate subdomain or the same as `stores.dokanelbanat.com`.
- [ ] **`public/scripts/main.js` sync** — This file is a manual copy of `src/scripts/main.js`. If the source is edited, the public copy must also be updated manually (see Key Decision #9).

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
│   │   ├── privacy.astro         /privacy — full Arabic Privacy Policy (6 sections)
│   │   ├── terms.astro           /terms — full Arabic Terms & Conditions (8 sections)
│   │   └── blog/
│   │       └── [slug].astro      /blog/[slug] — article detail page; getStaticPaths + WP API
│   ├── layouts/
│   │   └── BaseLayout.astro      HTML shell: RTL, imports global.css, defers main.js, GTM stub
│   ├── components/
│   │   ├── Header.astro          Sticky nav + mobile off-canvas drawer (⚠️ logo path relative)
│   │   ├── Hero.astro            2-col hero + dual vertical image sliders (Unsplash CDN)
│   │   ├── About.astro           Reset Your Mindset section + 4 philosophy pillars (2×2)
│   │   ├── MagazineGrid.astro    Magazine section; fetches WP posts; animated skeleton fallback
│   │   ├── Vision.astro          Vision & Mission 2-column with SVG icons
│   │   ├── Numbers.astro         4-stat social proof showcase (⚠️ counter animation missing)
│   │   ├── ProductsGrid.astro    3 digital product cards (static placeholders, Phase 3)
│   │   ├── CtaBanner.astro       Full-width CTA with mailto link
│   │   └── Footer.astro          3-column footer + social icons (⚠️ logo path relative)
│   ├── lib/
│   │   └── wordpress.js          WP REST API abstraction (getPosts, getPostBySlug, getAllPostSlugs, getProducts)
│   ├── scripts/
│   │   └── main.js               Source JS (nav, IntersectionObserver, smooth scroll)
│   └── styles/
│       ├── global.css            Master CSS entry: Tailwind + design system imports + @theme tokens
│       └── design-system/
│           ├── tokens.css        248+ CSS custom properties (colors, type, spacing, motion)
│           ├── globals.css       Base resets and html/body rules
│           ├── fonts.css         @font-face for Rubik, MarkaziText, Blabeloo (all 3; absolute paths)
│           ├── components.css    Full ds-* component library (~2,070 lines)
│           ├── layouts.css       6 page-level layout patterns
│           ├── motion.css        Keyframes, easing tokens, reduced-motion fallbacks (LightningCSS warning fixed)
│           └── utilities.css     Atomic helper classes
│
├── public/
│   ├── fonts/                    Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf (static served)
│   ├── assets/
│   │   ├── logo/                 dokanelbanatlogo.png + dokanelbanatlogo-gradient.png
│   │   └── images/               hero-1.svg through hero-8.svg (SVG placeholders; ⚠️ not used by Hero.astro)
│   └── scripts/
│       └── main.js               Manual copy of src/scripts/main.js (served at /scripts/main.js)
│
├── assets/                       Pre-Astro source assets (fonts, logos; mirrored to public/)
│
├── design-system/                Pre-Astro design system source (mirrored to src/styles/design-system/)
│   ├── index.css                 Master import file (legacy; not used by Astro build)
│   ├── tokens.css / tokens.scss  CSS + SCSS token variants
│   ├── tokens/tokens.json        W3C Design Tokens format (Figma sync)
│   ├── design-system.md          Full design system documentation
│   ├── components.css, layouts.css, motion.css, utilities.css, globals.css, fonts.css
│
├── js/
│   └── main.js                   Pre-Astro JS (identical to src/scripts/main.js)
│
├── campaign/
│   ├── README.md                 Full 30-day campaign documentation
│   ├── CAMPAIGN_PROMPT.md        Orchestrator prompt used to generate content
│   ├── calendar.xlsx             46-row content calendar spreadsheet
│   ├── RUN_ME.bat / run_calendar.ps1  Windows launchers for calendar scripts
│   ├── bootstrap_and_build.py + runner.py + exec_calendar.py + verify_and_run.py + make_calendar.py + build_calendar.py
│   ├── blog/                     12 SEO long-form articles (Arabic, with frontmatter) — 6 published, 6 pending
│   ├── generated-images/         6 AI-generated WebP cover images (Arabic filenames)
│   ├── week-01-bold/             Days 1–7 social content (posts, stories, infographics)
│   ├── week-02-educate/          Days 8–14 social content
│   ├── week-03-shift/            Days 15–21 social content
│   └── week-04-empower/          Days 22–30 social content
│
├── docs/
│   ├── checkpoint.md                            ← This file
│   ├── checkpoint-report-5-5-2026.md            Previous detailed checkpoint (pre-Astro migration)
│   ├── Foundational-Description.md              Bilingual brand bible (AR/EN)
│   ├── dokanelbanat-Web Ecosystem Architecture v1.0.md  Subdomain map + launch phases
│   ├── Design System Generation Brief — dokanelbanat.com.md  DS specification
│   ├── Dokanelbanat.com-ar-text-content.md      All landing page copy (Arabic)
│   ├── astro-building-prompt.md                 12-step Astro migration spec prompt
│   ├── dokanelbanat-review-prompt.md            Review/audit prompt template
│   ├── brand-colors-fonts.md                    Quick color/font reference
│   ├── for images.md                            Image sourcing strategy + editing presets
│   ├── reset-your-mindset-core.md               Research narrative with 30+ citations
│   ├── dokanelbanat_ecosystem_architecture.svg  Visual architecture diagram
│   └── Landing Page Visual Direction v2.md      ⚠️ EMPTY (1 blank line)
│
└── dist/                         Production build output (Astro static — deployed to Hostinger)
    ├── index.html                Main landing page
    ├── privacy/index.html        Privacy Policy page
    ├── terms/index.html          Terms & Conditions page
    ├── blog/                     6 published article pages (pre-rendered from WordPress API)
    │   ├── the-economy-thrives-when-you-feel-incomplete/
    │   ├── incredible-figures-about-the-size-of-the-beauty-and-advertising-industry/
    │   ├── instagram-and-body-image-what-researchs-say/
    │   ├── from-housewife-to-entrepreneur-same-trick-different-ways/
    │   ├── influencer-marketing-mechanism/
    │   └── consciousness-as-a-tool-of-liberation-why-knowledge-is-true-power/
    ├── _astro/
    │   ├── index.CyulOq4c.css    Main compiled CSS bundle
    │   └── _slug_.By9tFgtn.css   Blog article page CSS bundle
    ├── fonts/                    Copied from public/fonts/
    ├── scripts/main.js           Copied from public/scripts/
    └── assets/                   Copied from public/assets/
```

---

## Key Decisions & Notes

1. **Astro over plain HTML** — Migration from `index.html` to Astro 5 completed 2026-05-05. Motivation: component splitting for maintainability, server-side WordPress API fetching at build time (no client-side fetch waterfalls), Tailwind v4 processing via Vite.

2. **RTL-first design system** — All CSS uses logical properties (`margin-inline`, `padding-inline`, `border-inline-start`) with `[dir="ltr"]` overrides only where needed. `<html dir="rtl">` at root. Arabic is the primary language.

3. **Static output mode** — Astro is in `output: "static"` (default). Pages are pre-rendered at build time. The WordPress API is called during build, not at runtime. The site must be rebuilt (via a `git push` to trigger Hostinger auto-deploy) whenever CMS content changes. Adding Astro's SSR adapter for on-demand rendering would remove this constraint.

4. **No SSO across subdomains** — Each WordPress sub-site (academy, stores) has its own independent login. No multisite, no shared session.

5. **Single GTM container** — Per architecture doc: one container ID deployed across all four subdomains with `cookie_domain` set to `.dokanelbanat.com` for cross-domain tracking. GTM snippet is wired in `BaseLayout.astro` but the real container ID has not been substituted yet.

6. **Tailwind v4 (not v3)** — Uses `@tailwindcss/vite` plugin and CSS-first `@theme` block rather than `tailwind.config.js`. DS tokens are exposed via `@theme` in `global.css`.

7. **`blog.dokanelbanat.com` as headless CMS URL** — The `.env` points to `https://blog.dokanelbanat.com/wp-json/wp/v2`, matching the architecture doc. The CMS is confirmed live: 6 posts return from the API and are included in `dist/blog/`.

8. **Hostinger Git integration instead of SFTP** — The deployment model is a Hostinger Node.js Web App connected to the GitHub repo. Every push to `main` triggers a server-side `npm run build` and deploys `dist/`. This replaces the earlier approach of manual SFTP file uploads. The `.env` variable `WP_API_URL` must be set in Hostinger's environment settings panel (not committed to git).

9. **`public/scripts/main.js` is a manual copy** — Astro does not auto-process `src/scripts/` files as static assets. The file was manually duplicated to `public/scripts/main.js` so it is served at `/scripts/main.js` (the URL referenced in `BaseLayout.astro`). If `src/scripts/main.js` is edited, `public/scripts/main.js` must also be updated manually.

10. **Hero images use Unsplash CDN** — The 8 hero slider images are fetched at runtime from `images.unsplash.com`. This avoids storing large images in the repo, but creates a runtime dependency on an external CDN and means the images are not brand-owned photography. Eight local SVG placeholders exist at `public/assets/images/` but are not referenced by `Hero.astro`.

11. **Campaign content is partially published** — 6 of 12 blog articles are live on `blog.dokanelbanat.com`. The remaining 6 articles (07–12) and all 46 social posts exist as `.md` files in `campaign/` awaiting publication.

12. **MagazineGrid empty state is animated skeleton cards** — The fallback when the WordPress API is unreachable was upgraded from a plain text line to a full animated skeleton UI matching the live card layout (1 featured + 4 standard cards with pulse animation).

---

## Next Recommended Steps

1. **Wire real GTM container ID (critical, 5 min)** — Replace `GTM-XXXXXXX` in `src/layouts/BaseLayout.astro` with the real Google Tag Manager container ID. Set up GA4 pageview event, CTA click tracking (`mailto:` link), and Meta Pixel via GTM tags. Without this, all analytics and paid media attribution are inactive.

2. **Replace hero Unsplash images with owned photography (design milestone)** — Produce or source 8 photographs per `docs/for images.md` (4:5 aspect ratio, warm minimalist editorial style, unified Lightroom preset). Place in `public/assets/images/`. Update `Hero.astro` to use `/assets/images/hero-N.jpg` and remove Unsplash dependency. The existing SVG placeholders in `public/assets/images/` can be deleted once real images are in place.

3. **Fix relative logo paths (quick, ~5 min)** — In `Header.astro`, change `src="../assets/logo/dokanelbanatlogo-gradient.png"` to `src="/assets/logo/dokanelbanatlogo-gradient.png"`. In `Footer.astro`, change `src="assets/logo/dokanelbanatlogo.png"` to `src="/assets/logo/dokanelbanatlogo.png"`. The relative paths work on `/` but break on `/blog/[slug]` routes.

4. **Create `src/pages/404.astro`** — `blog/[slug].astro` already redirects to `/404` on missing slugs. Without this file, visitors get Hostinger's generic 404 instead of a branded one. A simple page with the brand header and "الصفحة غير موجودة" message is sufficient.

5. **Publish remaining 6 blog articles** — Content is ready in `campaign/blog/articles 07–12`. Post to WordPress, verify REST API returns them, then `git push` to trigger a rebuild and deploy the new `/blog/` pages.

6. **Add number counter animation** — The 4 stats in `Numbers.astro` have class `ds-counter` but `main.js` only triggers `is-visible`. Add a count-up function (triggered by IntersectionObserver) that animates from 0 to the displayed value. The Arabic-Indic numerals are static text; a JS counter would need to write them dynamically.

7. **Deploy `academy.dokanelbanat.com`** — WordPress + Tutor LMS. Once live, `ProductsGrid.astro` can call `getProducts()` from `wordpress.js` instead of showing static placeholders.

---

_Previous checkpoint: `docs/checkpoint-report-5-5-2026.md` (pre-Astro migration, 2026-05-05)_
