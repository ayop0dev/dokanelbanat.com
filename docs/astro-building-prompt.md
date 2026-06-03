# dokanelbanat — Astro Project Bootstrap Prompt

## ROLE & CONTEXT

You are a senior full-stack engineer setting up a production-ready frontend project.

**Project:** dokanelbanat.com — Arab women's lifestyle & business platform  
**Stack:** Astro 5 · Tailwind CSS v4 · Headless WordPress (REST API)  
**Design language:** Editorial Conscious Femininity — RTL-first, Arabic primary  
**Design system:** Pre-built. CSS files already exist in `design-system/` folder. Do NOT redesign anything. Respect all existing `ds-*` class names and CSS custom properties.

---

## WHAT ALREADY EXISTS

The following files are already present in the working directory:

```
index.html                    ← Full landing page markup (single file)
design-system/
├── tokens.css                ← All CSS custom properties (colors, spacing, type, motion)
├── globals.css               ← Base resets and html/body rules
├── fonts.css                 ← @font-face declarations (local fonts)
├── components.css            ← All ds-* atoms, molecules, organisms
├── layouts.css               ← Page-level layout patterns
├── motion.css                ← Animation keyframes and reduced-motion rules
└── utilities.css             ← Helper classes
assets/
├── fonts/                    ← MarkaziText, Rubik, Blabeloo (.woff2)
└── images/
main.js                       ← Existing JS (nav toggle, counter animations, scroll reveals)
image-2.jpg                   ← Hero image
```

---

## TASK

Scaffold a complete Astro 5 project by executing the following steps in order. After each step, confirm it works before moving to the next.

---

## STEP 1 — Initialize Astro Project

Run this command and use these exact answers:

```bash
npm create astro@latest . --yes
```

If interactive prompts appear, choose:
- Template: **Empty**
- TypeScript: **No**
- Install dependencies: **Yes**
- Git repository: **Yes**

Verify dev server starts:
```bash
npm run dev
```
Expected: `http://localhost:4321` responds with a blank page. ✓

---

## STEP 2 — Install Tailwind CSS v4

```bash
npx astro add tailwind
```

This must add `@tailwindcss/vite` as a Vite plugin to `astro.config.mjs`.

Verify `astro.config.mjs` looks like this:
```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

> ⚠️ Do NOT use `@astrojs/tailwind` — that is the deprecated Tailwind v3 integration.

---

## STEP 3 — Set Up Directory Structure

Create the following empty directories and files:

```
src/
├── components/
├── layouts/
├── pages/
├── lib/
├── scripts/
└── styles/
    └── design-system/
public/
├── fonts/
└── assets/
    └── images/
.env
.env.example
```

Run:
```bash
mkdir -p src/components src/layouts src/pages src/lib src/scripts src/styles/design-system
mkdir -p public/fonts public/assets/images
touch .env .env.example
```

---

## STEP 4 — Migrate Design System Files

Copy all existing design system CSS files into `src/styles/design-system/`:

```bash
cp design-system/tokens.css     src/styles/design-system/
cp design-system/globals.css    src/styles/design-system/
cp design-system/fonts.css      src/styles/design-system/
cp design-system/components.css src/styles/design-system/
cp design-system/layouts.css    src/styles/design-system/
cp design-system/motion.css     src/styles/design-system/
cp design-system/utilities.css  src/styles/design-system/
```

Copy static assets:
```bash
cp -r assets/fonts/*  public/fonts/
cp -r assets/images/* public/assets/images/
cp image-2.jpg        public/assets/images/
```

Copy JS:
```bash
cp main.js src/scripts/main.js
```

---

## STEP 5 — Create Global CSS Entry Point

Create `src/styles/global.css`:

```css
@import "tailwindcss";

/* Design System — order matters */
@import "./design-system/tokens.css";
@import "./design-system/globals.css";
@import "./design-system/fonts.css";
@import "./design-system/components.css";
@import "./design-system/layouts.css";
@import "./design-system/motion.css";
@import "./design-system/utilities.css";

/* Expose DS tokens to Tailwind's theme engine */
@theme {
  --color-primary:        var(--color-primary);
  --color-secondary:      var(--color-secondary);
  --color-bg-base:        var(--color-bg-base);
  --color-bg-canvas:      var(--color-bg-canvas);
  --color-bg-inverse:     var(--color-bg-inverse);
  --color-text-primary:   var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-muted:     var(--color-text-muted);
  --color-border-default: var(--color-border-default);

  --font-headline: var(--font-headline);
  --font-body:     var(--font-body);

  --spacing-1:  var(--space-1);
  --spacing-2:  var(--space-2);
  --spacing-3:  var(--space-3);
  --spacing-4:  var(--space-4);
  --spacing-6:  var(--space-6);
  --spacing-8:  var(--space-8);
  --spacing-12: var(--space-12);
  --spacing-16: var(--space-16);
  --spacing-24: var(--space-24);

  --radius-sm:   var(--radius-sm);
  --radius-md:   var(--radius-md);
  --radius-lg:   var(--radius-lg);
  --radius-pill: var(--radius-pill);
}
```

---

## STEP 6 — Create BaseLayout

Create `src/layouts/BaseLayout.astro`:

```astro
---
const {
  title = "دكان البنات",
  description = "مجتمع نسائي متكامل للمرأة العربية العصرية",
  lang = "ar",
  dir = "rtl",
} = Astro.props;
---
<!DOCTYPE html>
<html lang={lang} dir={dir}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/global.css" />
  </head>
  <body>
    <slot />
    <script src="/scripts/main.js" defer></script>
  </body>
</html>
```

---

## STEP 7 — Split index.html Into Components

Open `index.html` and split it into the following Astro components.
**Do not rewrite the HTML.** Copy each section as-is and wrap it in an `.astro` file.

| File | HTML section to extract |
|------|------------------------|
| `src/components/Header.astro` | `<header class="ds-header">` block |
| `src/components/Hero.astro` | `<section class="ds-hero">` block |
| `src/components/About.astro` | Reset Your Mindset / pillars section |
| `src/components/MagazineGrid.astro` | Magazine / articles grid section |
| `src/components/Vision.astro` | Vision & Mission 2-column section |
| `src/components/Numbers.astro` | Numbers showcase section |
| `src/components/ProductsGrid.astro` | Digital products grid section |
| `src/components/CtaBanner.astro` | CTA banner section |
| `src/components/Footer.astro` | `<footer>` block |

Each component file must follow this structure:
```astro
---
// props go here if needed (leave empty for now)
---

<!-- paste the HTML section here exactly as-is -->
```

---

## STEP 8 — Assemble index.astro

Create `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import MagazineGrid from '../components/MagazineGrid.astro';
import Vision from '../components/Vision.astro';
import Numbers from '../components/Numbers.astro';
import ProductsGrid from '../components/ProductsGrid.astro';
import CtaBanner from '../components/CtaBanner.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout>
  <Header />
  <main>
    <Hero />
    <About />
    <MagazineGrid />
    <Vision />
    <Numbers />
    <ProductsGrid />
    <CtaBanner />
  </main>
  <Footer />
</BaseLayout>
```

Run `npm run dev` and verify the page renders identically to the original `index.html`. ✓

---

## STEP 9 — WordPress API Layer

Create `src/lib/wordpress.js`:

```js
const WP_API = import.meta.env.WP_API_URL;

async function wpFetch(endpoint) {
  try {
    const res = await fetch(`${WP_API}${endpoint}`);
    if (!res.ok) throw new Error(`WP REST API ${res.status}: ${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error("[wordpress.js]", err.message);
    return null;
  }
}

/** Latest posts — used in MagazineGrid */
export async function getPosts(perPage = 6) {
  const data = await wpFetch(`/posts?per_page=${perPage}&_embed`);
  return data ?? [];
}

/** Single post by slug — used in blog/[slug].astro */
export async function getPostBySlug(slug) {
  const data = await wpFetch(`/posts?slug=${slug}&_embed`);
  return data?.[0] ?? null;
}

/** All post slugs — used for getStaticPaths */
export async function getAllPostSlugs() {
  const data = await wpFetch(`/posts?per_page=100&fields=slug`);
  return (data ?? []).map((p) => ({ params: { slug: p.slug } }));
}

/** Digital products (custom post type) */
export async function getProducts(perPage = 3) {
  const data = await wpFetch(`/products?per_page=${perPage}&_embed`);
  return data ?? [];
}
```

---

## STEP 10 — Environment Variables

Populate `.env`:
```env
WP_API_URL=https://cms.dokanelbanat.com/wp-json/wp/v2
```

Populate `.env.example`:
```env
WP_API_URL=https://your-wordpress-domain.com/wp-json/wp/v2
```

Add `.env` to `.gitignore`:
```bash
echo ".env" >> .gitignore
```

---

## STEP 11 — Connect MagazineGrid to WordPress

Update `src/components/MagazineGrid.astro` to pull live posts:

```astro
---
import { getPosts } from '../lib/wordpress.js';

const posts = await getPosts(6);
---

<section class="ds-section">
  <div class="ds-container">
    <!-- Keep existing section label and heading from original HTML -->
    <!-- Replace hardcoded article cards with this loop: -->
    <div class="ds-magazine-grid">
      {posts.length > 0 ? (
        posts.map((post) => (
          <article class="ds-card">
            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <img
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || ''}
                loading="lazy"
              />
            )}
            <div class="ds-card__body">
              <a
                href={`/blog/${post.slug}`}
                class="ds-card__title"
                set:html={post.title.rendered}
              />
              <div class="ds-card__excerpt" set:html={post.excerpt.rendered} />
            </div>
          </article>
        ))
      ) : (
        <!-- Fallback: keep original static cards if API is unavailable -->
        <p class="ds-text-muted">المحتوى غير متاح حالياً</p>
      )}
    </div>
  </div>
</section>
```

---

## STEP 12 — Final Verification

Run the following checks:

```bash
# 1. Dev build — no errors
npm run dev

# 2. Production build — no errors
npm run build

# 3. Preview production build
npm run preview
```

**Visual checklist:**
- [ ] Page renders identically to original `index.html`
- [ ] RTL direction applied correctly (`dir="rtl"` on `<html>`)
- [ ] Fonts loading from `/fonts/` (check Network tab)
- [ ] Nav drawer opens/closes (JS working)
- [ ] Counter animations trigger on scroll
- [ ] No console errors
- [ ] Magazine grid pulls live data from WordPress (if API is configured)

---

## RULES FOR CLAUDE CODE

- **Never rename or replace `ds-*` CSS classes.** They are part of a locked design system.
- **Never rewrite existing CSS files.** Only create new ones if absolutely necessary.
- **Do not install React, Vue, or any UI framework.** This project uses plain Astro components only.
- **Do not use CDN links for fonts.** All fonts load from `public/fonts/`.
- **Use `import.meta.env` for all environment variables,** never hardcode URLs.
- **All data fetching happens in component frontmatter** (`---` block), not in browser scripts.
- If a step fails, report the exact error and stop. Do not skip steps.

---

*Prompt version: 1.0 — May 2026*  
*Target: Astro 5.x · Tailwind CSS v4 · WordPress REST API*
