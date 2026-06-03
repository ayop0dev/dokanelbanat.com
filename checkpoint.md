# dokanelbanat — Setup Checkpoint
**Date:** 2026-05-05
**Astro version:** 5.18.1
**Tailwind version:** 4.2.4

---

## Summary

| Category | Status | Notes |
|----------|--------|-------|
| Project Init | ✅ | astro.config.mjs uses @tailwindcss/vite; all deps present; node_modules installed |
| Directory Structure | ✅ | All required paths exist |
| Design System CSS | ✅ | All 7 files present; global.css imports in correct order with @theme block |
| BaseLayout | ✅ | Fixed: CSS now imported via frontmatter; html[lang=ar][dir=rtl]; slot present; main.js deferred |
| Components (9) | ✅ | All 9 present with HTML and ds-* classes; fixed mismatched tags in About.astro |
| index.astro | ✅ | All 9 components imported and assembled in order |
| WordPress API Layer | ✅ | Uses import.meta.env.WP_API_URL; all 4 exports present; try/catch via wpFetch helper |
| MagazineGrid Integration | ✅ | Imports getPosts; calls it; maps posts; has fallback for empty API response |
| Environment Variables | ✅ | .env present; .env.example with placeholder; .gitignore includes .env |
| Static Assets | ⚠️ | 3 fonts present; image-2.jpg missing from public/assets/images/; main.js fixed (see issues) |
| Build Test | ✅ | Builds clean with no errors; dist/ created; WP fetch gracefully degraded |

---

## Issues Found & Fixed

### 1. BaseLayout: CSS not processed by Vite
- **Found in:** `src/layouts/BaseLayout.astro`
- **Problem:** Global CSS was linked via `<link rel="stylesheet" href="/styles/global.css" />`. In Astro, a `/`-prefixed href in `<link>` tags resolves to `public/styles/global.css`, which does not exist. The file lives in `src/styles/global.css` and must be imported through Vite so Tailwind and design-system tokens are processed.
- **Fix applied:** Replaced the `<link>` tag with `import '../styles/global.css'` in the Astro frontmatter.

### 2. About.astro: Mismatched heading closing tags
- **Found in:** `src/components/About.astro` — all 4 pillar cards
- **Problem:** Each pillar card opened with `<h3 class="ds-pillar-card__title">` but was closed with `</h4>`. This produces invalid HTML and causes unpredictable DOM structure in browsers.
- **Fix applied:** Changed all 4 `</h4>` closing tags to `</h3>`.

### 3. main.js not served at /scripts/main.js
- **Found in:** `src/layouts/BaseLayout.astro` + project structure
- **Problem:** BaseLayout loads `<script src="/scripts/main.js" defer></script>`. In Astro, paths starting with `/` are served from the `public/` directory. The file only existed at `src/scripts/main.js`, which is not served as a static asset — meaning the nav toggle, scroll animations, and smooth scroll would all silently fail at runtime.
- **Fix applied:** Copied `src/scripts/main.js` to `public/scripts/main.js` so the file is served correctly at `/scripts/main.js`.

---

## Issues Found & NOT Fixed

### Font paths produce a broken @font-face URL in production
- **Found in:** `src/styles/design-system/fonts.css`
- **Problem:** The `@font-face` declarations use relative paths (`url('../assets/fonts/Rubik.ttf')`). After Astro's Vite build, the CSS bundle lands at `/_astro/index.[hash].css`, making the resolved runtime URL `/_astro/assets/fonts/Rubik.ttf`. The actual font files are served at `/fonts/Rubik.ttf` (copied from `public/fonts/`). This mismatch means Rubik and MarkaziText will not load in production. (Build warning: "didn't resolve at build time, it will remain unchanged to be resolved at runtime.")
- **Why not fixed:** The fix requires changing `fonts.css`, which is inside `src/styles/design-system/` — a protected directory per audit rules.

### CSS dangling combinator warning in design-system
- **Found in:** `src/styles/design-system/motion.css` (selector `[dir="ltr"] @keyframes ds-toast-in`)
- **Problem:** LightningCSS reports "Invalid dangling combinator in selector" for this rule during the build optimisation pass. Does not cause a build failure but may indicate a CSS authoring issue.
- **Why not fixed:** Inside the protected `src/styles/design-system/` directory.

### public/assets/images/image-2.jpg is missing
- **Found in:** `public/assets/images/` (directory exists, but empty)
- **Problem:** The required placeholder image is absent. It is not referenced anywhere in the current source code so the build is unaffected, but the directory is otherwise empty.
- **Why not fixed:** No source image is available to copy; this requires a real asset to be added manually.

---

## Manual Actions Required

- [ ] **Fix font loading (critical):** Update `src/styles/design-system/fonts.css` — change `url('../assets/fonts/Rubik.ttf')` to `url('/fonts/Rubik.ttf')` and `url('../assets/fonts/MarkaziText.ttf')` to `url('/fonts/MarkaziText.ttf')` so the paths resolve correctly from the built CSS bundle.
- [ ] **Add Blabeloo @font-face:** `public/fonts/Blabeloo.ttf` exists but has no `@font-face` declaration in `fonts.css`. Add one if this font is intended to be used.
- [ ] **Add image-2.jpg:** Place the required placeholder image at `public/assets/images/image-2.jpg`.
- [ ] **Set real `WP_API_URL` in `.env`** and verify the WordPress REST API is reachable (current value: `https://cms.dokanelbanat.com/wp-json/wp/v2`).
- [ ] **Verify fonts render in browser** after fixing font paths above.
- [ ] **Test nav drawer on mobile** (hamburger toggle + overlay dismiss + Escape key).
- [ ] **Connect ProductsGrid to WordPress CPT** — currently renders static placeholder data.
- [ ] **Create `src/pages/blog/[slug].astro`** for individual article detail pages.

---

## Build Output

```
> dokanelbanat@0.0.1 build
> astro build

[content] Syncing content
[content] Synced content
[types] Generated 119ms
[build] output: "static"
[build] mode: "static"
[build] directory: D:\claude-Projects\dokanelbanat\dist\
[build] Collecting build info...
[build] ✓ Completed in 166ms.
[build] Building static entrypoints...
[WARN] [vite] ./assets/fonts/Rubik.ttf referenced in ./assets/fonts/Rubik.ttf didn't resolve at build time, it will remain unchanged to be resolved at runtime
[WARN] [vite] ./assets/fonts/MarkaziText.ttf referenced in ./assets/fonts/MarkaziText.ttf didn't resolve at build time, it will remain unchanged to be resolved at runtime
Found 1 warning while optimizing generated CSS:
  [dir="ltr"] @keyframes ds-toast-in { ^-- Invalid dangling combinator in selector
[vite] ✓ built in 1.84s
[build] ✓ Completed in 1.93s.
generating static routes
▶ src/pages/index.astro
  └─ /index.html [wordpress.js] fetch failed (+70ms)
✓ Completed in 123ms.
[build] 1 page(s) built in 2.26s
[build] Complete!
```

---

## Next Steps

- [ ] Set real `WP_API_URL` in `.env`
- [ ] Fix font paths in `src/styles/design-system/fonts.css` (see Manual Actions above)
- [ ] Verify fonts render correctly in browser
- [ ] Test nav drawer on mobile
- [ ] Connect ProductsGrid to WordPress CPT
- [ ] Create `src/pages/blog/[slug].astro` for article detail pages
