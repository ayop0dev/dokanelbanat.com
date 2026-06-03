# Project Checkpoint

_Generated: 2026-05-06_

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
| Data / CMS | WordPress Headless REST API at `blog.dokanelbanat.com` (Phase 2) |
| Build tooling | Vite via Astro, LightningCSS (CSS optimization) |
| Campaign tooling | Python 3 + openpyxl (content calendar generation) |
| Planned sub-sites | WordPress + Tutor LMS (academy), WordPress + WooCommerce (stores), plain WordPress headless (blog/magazine) |

**Language:** Arabic (RTL) primary, English secondary. `<html lang="ar" dir="rtl">` at root.

---

## Current Status

**Phase 1 (landing page) is ~90% complete.** The Astro 5 migration from the original static `index.html` was completed 2026-05-05. The project builds cleanly with two known non-fatal warnings. WordPress backend and all sub-sites are not yet deployed.

---

## What's Done ✅

### Core site (Astro)
- `package.json` — Astro 5.18.1 + Tailwind CSS v4 configured; all deps installed
- `astro.config.mjs` — Vite plugin wired for Tailwind v4 (not legacy `@astrojs/tailwind`)
- `src/layouts/BaseLayout.astro` — RTL HTML shell (`lang="ar"` `dir="rtl"`), CSS imported via frontmatter (Vite-processed), JS deferred
- `src/pages/index.astro` — Assembles all 9 components in correct order with page-level styles
- `src/components/Header.astro` — Sticky nav, logo, off-canvas mobile drawer with ARIA attributes
- `src/components/Hero.astro` — 2-column layout with dual vertical infinite-scroll image sliders (CSS animation)
- `src/components/About.astro` — "Reset Your Mindset" press-release block + 4 philosophy pillar cards (2×2 grid)
- `src/components/Vision.astro` — Vision & Mission 2-column with SVG icons; final Arabic copy
- `src/components/Numbers.astro` — 4-stat social proof showcase; Arabic-Indic numerals; grain overlay
- `src/components/ProductsGrid.astro` — 3 product cards (static placeholders, Phase 3)
- `src/components/CtaBanner.astro` — Final Arabic copy; `mailto:hello@dokanelbanat.com` CTA
- `src/components/Footer.astro` — 3-column layout; social icon links (Instagram, TikTok, YouTube, X); subdomain links
- `src/components/MagazineGrid.astro` — Wired to WordPress REST API via `getPosts(6)`; graceful empty-state fallback
- `src/lib/wordpress.js` — WordPress REST API abstraction (`getPosts`, `getPostBySlug`, `getAllPostSlugs`, `getProducts`); uses `import.meta.env.WP_API_URL`; try/catch with null returns on failure
- `src/scripts/main.js` + `public/scripts/main.js` — Nav toggle (ARIA-complete), IntersectionObserver reveals, smooth scroll with header offset
- `.env` — `WP_API_URL=https://blog.dokanelbanat.com/wp-json/wp/v2`
- `.env.example` — Placeholder for other developers
- `.gitignore` — `.env` excluded

### Design system (`src/styles/design-system/`)
- `tokens.css` — 248+ CSS custom properties: brand colors, semantic color tokens, typography scale (AR + EN), 4px-base spacing, radius, shadow, grid, z-index, gradients, motion, layout
- `globals.css` — Base resets and html/body defaults
- `fonts.css` — `@font-face` for Rubik and MarkaziText (Blabeloo missing — see issues)
- `components.css` — Complete component library: atoms, molecules, organisms (~2,070 lines)
- `layouts.css` — 6 page-level layout patterns
- `motion.css` — Keyframes, easing tokens, staggered reveals, reduced-motion fallbacks
- `utilities.css` — Atomic helper classes
- `src/styles/global.css` — Master entry point: imports Tailwind + all design-system files; exposes DS tokens to Tailwind `@theme`

### Legacy / parallel files (pre-Astro, kept for reference)
- `index.html` — Original static landing page (~807 lines); source of truth for Astro migration
- `js/main.js` — Original vanilla JS (identical to `src/scripts/main.js`)
- `design-system/` root directory — Original design system source files (mirrored into `src/styles/design-system/`)

### Design system source assets
- `design-system/tokens.scss` — SCSS variables + 12 mixins for WordPress theme integration
- `design-system/tokens/tokens.json` — W3C Design Tokens format (Figma/Style Dictionary)
- `design-system/design-system.md` — Full design system documentation
- `assets/fonts/` — Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf
- `public/fonts/` — Same fonts, served as static assets
- `assets/logo/` + `public/assets/logo/` — `dokanelbanatlogo.png` + `dokanelbanatlogo-gradient.png`

### Campaign content (`campaign/`)
- `README.md` + `CAMPAIGN_PROMPT.md` — Full campaign documentation and orchestration prompt
- `calendar.xlsx` — 46-row content calendar (Day, Date, Week, Theme, Platform, Content Type, Topic, Hook, Design Brief, Image Prompt, File Path, Status)
- `week-01-bold/` — Days 1–7: Bold & Provocative (3 posts, 2 stories, 2 infographics, 2 blog posts, 2 carousels, 2 threads)
- `week-02-educate/` — Days 8–14: Educate & Data (7 posts, 2 stories, 1 infographic)
- `week-03-shift/` — Days 15–21: Mindset Shift (6 posts, 2 stories, 1 infographic)
- `week-04-empower/` — Days 22–30: Empowerment (6 posts, 3 stories, 2 infographics)
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
- `astro-building-prompt.md` — 12-step Astro migration specification (the prompt that drove Phase 1 migration)
- `checkpoint-report-5-5-2026.md` — Previous detailed checkpoint (pre-Astro Astro-migration state)
- `dokanelbanat_ecosystem_architecture.svg` — Visual architecture diagram

---

## What's In Progress 🔄

### Font loading broken in production
- **File:** `src/styles/design-system/fonts.css`
- **Problem:** `@font-face` declarations use relative paths (`url('../assets/fonts/Rubik.ttf')`). After Astro's Vite build, the CSS bundle moves to `/_astro/index.[hash].css`, making the runtime-resolved path `/_astro/assets/fonts/...` which does not exist. Fonts should load from `/fonts/Rubik.ttf` (the `public/fonts/` copy). The build emits a warning: _"didn't resolve at build time, it will remain unchanged to be resolved at runtime."_
- **Fix needed:** Change font URLs in `fonts.css` to absolute paths (`url('/fonts/Rubik.ttf')`).

### LightningCSS warning on motion.css
- **File:** `src/styles/design-system/motion.css`
- **Problem:** Selector `[dir="ltr"] @keyframes ds-toast-in` is flagged as an "Invalid dangling combinator" by LightningCSS. Does not fail the build.
- **Fix needed:** Remove or restructure the `[dir="ltr"]` scoping around that `@keyframes` block.

### Hero images are placeholders
- **File:** `src/components/Hero.astro`
- **Problem:** All 8 hero slider images are placeholder `<div>` elements labeled "صورة 1" through "صورة 8". Real photography is needed per `docs/for images.md` (4:5 aspect ratio, unified Lightroom preset: Sat -10-15%, Contrast +5%, Warmth +10, Grain 5-8%).
- **Assets directory:** `public/assets/images/` exists but is empty.

### MagazineGrid is API-ready but CMS not deployed
- **File:** `src/components/MagazineGrid.astro`
- **Problem:** The component calls `getPosts(6)` but `blog.dokanelbanat.com` does not exist yet. The build log shows: `[wordpress.js] fetch failed`. The empty-state fallback renders "المحتوى غير متاح حالياً" (a single text line, not styled cards).
- **Improvement needed:** Replace the plain-text fallback with static skeleton cards matching the live post layout.

### ProductsGrid uses static placeholders
- **File:** `src/components/ProductsGrid.astro`
- **Problem:** Has an HTML comment noting Phase 3 API integration. Currently shows 3 hardcoded product stubs. The `getProducts()` function exists in `wordpress.js` but is not called.

---

## What's Missing / TODO ❌

### Blocking for Phase 1 launch
- [ ] **Fix font paths** in `src/styles/design-system/fonts.css` (critical: text likely rendering in system fallback font in production)
- [ ] **Add Blabeloo `@font-face`** — font file exists at `public/fonts/Blabeloo.ttf` but is never declared; referenced in `tokens.json` as the button font
- [ ] **Source and place hero images** — 8 images needed in `public/assets/images/`; specs in `docs/for images.md`
- [ ] **GTM container** — `BaseLayout.astro` has no GTM script; architecture doc specifies GTM container ID, GA4, and Meta Pixel
- [ ] **Privacy Policy page** (`/privacy`) — footer link is a dead `href="#"`
- [ ] **Terms & Conditions page** (`/terms`) — footer link is a dead `href="#"`

### Phase 2
- [ ] **Deploy WordPress headless CMS** at `blog.dokanelbanat.com`
- [ ] **Configure WordPress REST API** — install Rank Math SEO, ACF, verify `/wp-json/wp/v2/posts` returns posts with `_embed`
- [ ] **Create `src/pages/blog/[slug].astro`** — `wordpress.js` has `getPostBySlug()` and `getAllPostSlugs()` ready; page template is missing
- [ ] **Publish 12 campaign blog articles** to WordPress (content ready in `campaign/blog/`)
- [ ] **Magazine fallback UI** — replace "المحتوى غير متاح حالياً" text with styled placeholder cards

### Phase 3
- [ ] **Deploy academy.dokanelbanat.com** — WordPress + Tutor LMS + WooCommerce
- [ ] **Connect ProductsGrid** to WordPress custom post type via `getProducts()`
- [ ] **Deploy stores.dokanelbanat.com** — WordPress + WooCommerce + Fluent Forms
- [ ] **Number counter animation** — `.ds-counter` class exists in CSS and HTML but no JS drives the count-up animation

### Phase 4
- [ ] Mobile app (React Native / API-driven)
- [ ] Loyalty program

### Minor clean-up
- [ ] **`docs/Landing Page Visual Direction v2.md`** — file exists but is 0 bytes (1 blank line); populate or delete
- [ ] **Inline styles in `index.astro`** — Hero slider, press-release overlay, pillars 2×2, and magazine 5-card layout styles are scoped in `<style is:global>` in `index.astro`; should migrate to `components.css` or `layouts.css`
- [ ] **`footer` links** — `business.dokanelbanat.com` subdomain mentioned in footer but not in the architecture doc; clarify if this is the same as `stores.dokanelbanat.com`

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
├── checkpoint.md                 Quick setup checkpoint (2026-05-05, from Astro migration)
│
├── src/
│   ├── pages/
│   │   └── index.astro           Main page; assembles 9 components; holds page-level styles
│   ├── layouts/
│   │   └── BaseLayout.astro      HTML shell: RTL, imports global.css, defers main.js
│   ├── components/
│   │   ├── Header.astro          Sticky nav + mobile off-canvas drawer
│   │   ├── Hero.astro            2-col hero + dual vertical image sliders (placeholders)
│   │   ├── About.astro           Reset Your Mindset section + 4 philosophy pillars
│   │   ├── MagazineGrid.astro    Magazine section; fetches WP posts; fallback text
│   │   ├── Vision.astro          Vision & Mission 2-column with SVG icons
│   │   ├── Numbers.astro         4-stat social proof showcase
│   │   ├── ProductsGrid.astro    3 digital product cards (static placeholders)
│   │   ├── CtaBanner.astro       Full-width CTA with mailto link
│   │   └── Footer.astro          3-column footer + social icons
│   ├── lib/
│   │   └── wordpress.js          WP REST API abstraction (getPosts, getPostBySlug, getAllPostSlugs, getProducts)
│   ├── scripts/
│   │   └── main.js               Source JS (nav, IntersectionObserver, smooth scroll)
│   └── styles/
│       ├── global.css            Master CSS entry: Tailwind + design system imports + @theme tokens
│       └── design-system/
│           ├── tokens.css        248+ CSS custom properties (colors, type, spacing, motion)
│           ├── globals.css       Base resets and html/body rules
│           ├── fonts.css         @font-face for Rubik + MarkaziText (⚠️ paths broken in prod)
│           ├── components.css    Full ds-* component library (~2,070 lines)
│           ├── layouts.css       6 page-level layout patterns
│           ├── motion.css        Keyframes, easing tokens, reduced-motion fallbacks
│           └── utilities.css     Atomic helper classes
│
├── public/
│   ├── fonts/                    Rubik.ttf, MarkaziText.ttf, Blabeloo.ttf (static served)
│   ├── assets/
│   │   ├── logo/                 dokanelbanatlogo.png + dokanelbanatlogo-gradient.png
│   │   └── images/               ⚠️ EMPTY — no hero or product images yet
│   └── scripts/
│       └── main.js               Built copy of src/scripts/main.js (served at /scripts/main.js)
│
├── assets/                       Pre-Astro source assets (fonts, logos; mirrored to public/)
│
├── design-system/                Pre-Astro design system source (mirrored to src/styles/design-system/)
│   ├── index.css                 Master import file (legacy; not used by Astro build)
│   ├── tokens.css / tokens.scss  CSS + SCSS token variants
│   ├── tokens/tokens.json        W3C Design Tokens format (Figma sync)
│   ├── design-system.md          Full design system documentation
│   ├── components.css
│   ├── layouts.css
│   ├── motion.css
│   ├── utilities.css
│   ├── globals.css
│   └── fonts.css
│
├── js/
│   └── main.js                   Pre-Astro JS (identical to src/scripts/main.js)
│
├── campaign/
│   ├── README.md                 Full 30-day campaign documentation
│   ├── CAMPAIGN_PROMPT.md        Orchestrator prompt used to generate content
│   ├── calendar.xlsx             46-row content calendar spreadsheet
│   ├── RUN_ME.bat / run_calendar.ps1  Windows launchers for calendar scripts
│   ├── bootstrap_and_build.py    Auto-installs openpyxl; generates calendar.xlsx
│   ├── runner.py / exec_calendar.py / verify_and_run.py / make_calendar.py / build_calendar.py
│   ├── blog/                     12 SEO long-form articles (Arabic, with frontmatter)
│   │   ├── article-01 through article-12
│   ├── generated-images/         6 AI-generated WebP cover images (Arabic filenames)
│   ├── week-01-bold/             Days 1–7 social content (posts, stories, infographics)
│   ├── week-02-educate/          Days 8–14 social content
│   ├── week-03-shift/            Days 15–21 social content
│   └── week-04-empower/          Days 22–30 social content
│
├── docs/
│   ├── checkpoint.md                            ← This file
│   ├── checkpoint-report-5-5-2026.md            Previous detailed checkpoint (pre-Astro migration state)
│   ├── Foundational-Description.md              Bilingual brand bible (AR/EN)
│   ├── dokanelbanat-Web Ecosystem Architecture v1.0.md  Subdomain map + launch phases
│   ├── Design System Generation Brief — dokanelbanat.com.md  DS specification
│   ├── Dokanelbanat.com-ar-text-content.md      All landing page copy (Arabic)
│   ├── astro-building-prompt.md                 12-step Astro migration spec prompt
│   ├── brand-colors-fonts.md                    Quick color/font reference
│   ├── for images.md                            Image sourcing strategy + editing presets
│   ├── reset-your-mindset-core.md               Research narrative with 30+ citations
│   ├── dokanelbanat-review-prompt.md            Review/audit prompt template
│   ├── dokanelbanat_ecosystem_architecture.svg  Visual architecture diagram
│   └── Landing Page Visual Direction v2.md      ⚠️ EMPTY (1 blank line)
│
└── dist/                         Last production build output (Astro static)
    ├── index.html
    ├── _astro/index.[hash].css   Compiled + optimized CSS bundle
    ├── scripts/main.js
    └── assets/ + fonts/          Copied from public/
```

---

## Key Decisions & Notes

1. **Astro over plain HTML** — Migration from `index.html` to Astro 5 was completed 2026-05-05. Motivation: component splitting for maintainability, server-side WordPress API fetching at build time (no client-side fetch waterfalls), Tailwind v4 processing via Vite.

2. **RTL-first design system** — All CSS uses logical properties (`margin-inline`, `padding-inline`, `border-inline-start`) with `[dir="ltr"]` overrides only where needed. `<html dir="rtl">` at root. Arabic is the primary language.

3. **Static output mode** — Astro is in `output: "static"` (default). Pages are pre-rendered at build time. The WordPress API is called during build, not at runtime. This means the site must be rebuilt when CMS content changes (or Astro's SSR adapter + on-demand rendering must be added later).

4. **No SSO across subdomains** — Each WordPress sub-site (academy, stores) has its own independent login. No multisite, no shared session.

5. **Single GTM container** — Per architecture doc: one container ID deployed across all four subdomains with `cookie_domain` set to `.dokanelbanat.com` for cross-domain tracking. Not yet implemented.

6. **Tailwind v4 (not v3)** — Uses `@tailwindcss/vite` plugin and CSS-first `@theme` block rather than `tailwind.config.js`. DS tokens are exposed via `@theme` in `global.css`.

7. **`blog.dokanelbanat.com` as headless CMS URL** — The `.env` points to `https://blog.dokanelbanat.com/wp-json/wp/v2`, matching the architecture doc.

8. **Blabeloo font** — Three fonts ship with the project. Rubik and MarkaziText have `@font-face` declarations. Blabeloo (accent/logo font) does not, despite the file existing at `public/fonts/Blabeloo.ttf` and being referenced in `tokens.json` as the button font.

9. **`public/scripts/main.js` is a manual copy** — Astro does not auto-process `src/scripts/` files as static assets. The file was manually duplicated to `public/scripts/main.js` so it is served at `/scripts/main.js` (the URL referenced in `BaseLayout.astro`). If `src/scripts/main.js` is edited, `public/scripts/main.js` must also be updated.

10. **Campaign content is complete but unpublished** — All 12 blog articles and 46 social posts exist as `.md` files in `campaign/`. None have been published. The 6 WebP cover images are generated. Publishing requires the WordPress CMS to be live.

---

## Next Recommended Steps

1. **Fix font loading (critical, 10 min)** — In `src/styles/design-system/fonts.css`, change all `url('../assets/fonts/Filename.ttf')` to `url('/fonts/Filename.ttf')`. Also add a `@font-face` block for Blabeloo. Verify all three fonts render in `npm run preview`.

2. **Source and place hero images (design milestone)** — Create 8 real photographs per `docs/for images.md` specs (4:5 ratio, warm minimalist editorial style). Place in `public/assets/images/`. Update `Hero.astro` to use `<img>` tags replacing placeholder `<div>` elements.

3. **Deploy WordPress CMS and publish content** — Install WordPress at `blog.dokanelbanat.com`, configure REST API, add Rank Math SEO. Publish the 12 blog articles from `campaign/blog/`. Verify `MagazineGrid` fetches and renders posts correctly. Rebuild Astro site to pick up content.

4. **Create `src/pages/blog/[slug].astro`** — The `wordpress.js` library already has `getPostBySlug()` and `getAllPostSlugs()`. Build the article detail page template using design-system layout classes (`ds-article-detail` in `layouts.css`).

5. **Wire GTM + Analytics** — Add GTM script block to `BaseLayout.astro` with real container ID. Verify GA4 pageview and CTA click events. Add Meta Pixel via GTM. Test cross-domain tracking to `blog.dokanelbanat.com` before paid media begins.

---

_Previous checkpoint: `docs/checkpoint-report-5-5-2026.md` (pre-Astro migration, 2026-05-05)_
