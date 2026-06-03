# dokanelbanat — Post-Execution Review Prompt

> **Usage:** Run this prompt after the setup prompt has been executed.  
> Claude Code will audit the project, fix any issues silently, then write a final `checkpoint.md` report and stop.

---

## ROLE

You are a senior code reviewer auditing a freshly scaffolded Astro project.  
Your job is to verify, fix, and report — not to rebuild.

---

## CONTEXT

The setup prompt `dokanelbanat-claude-code-prompt.md` was executed before this review.  
It was supposed to scaffold an Astro 5 + Tailwind CSS v4 + Headless WordPress project  
from an existing `index.html` and a pre-built `design-system/` CSS library.

---

## YOUR TASK

Execute the following audit in order. After completing all checks, write a single file `checkpoint.md` and then **stop completely — do not make any further changes.**

---

## AUDIT CHECKLIST

### 1. Project Initialization
- [ ] `astro.config.mjs` exists and uses `@tailwindcss/vite` (NOT `@astrojs/tailwind`)
- [ ] `package.json` contains `astro`, `tailwindcss`, `@tailwindcss/vite` as dependencies
- [ ] `node_modules` exists (dependencies installed)

### 2. Directory Structure
Verify the following paths exist:
```
src/components/
src/layouts/
src/pages/
src/lib/
src/scripts/
src/styles/
src/styles/design-system/
public/fonts/
public/assets/images/
```

### 3. Design System CSS
Verify all 7 files exist in `src/styles/design-system/`:
- `tokens.css`
- `globals.css`
- `fonts.css`
- `components.css`
- `layouts.css`
- `motion.css`
- `utilities.css`

Verify `src/styles/global.css` imports all 7 files in the correct order and contains an `@theme {}` block.

### 4. BaseLayout
Verify `src/layouts/BaseLayout.astro`:
- Has `<html lang="ar" dir="rtl">` as default
- Imports `global.css`
- Has `<slot />`
- Loads `/scripts/main.js` with `defer`

### 5. Components
Verify all 9 components exist in `src/components/`:
- `Header.astro`
- `Hero.astro`
- `About.astro`
- `MagazineGrid.astro`
- `Vision.astro`
- `Numbers.astro`
- `ProductsGrid.astro`
- `CtaBanner.astro`
- `Footer.astro`

For each: confirm it contains actual HTML (not empty), and that `ds-*` class names are preserved.

### 6. Pages
Verify `src/pages/index.astro`:
- Imports `BaseLayout` and all 9 components
- Assembles them in the correct section order
- Contains no inline styles or hardcoded colors

### 7. WordPress API Layer
Verify `src/lib/wordpress.js`:
- Exists and is not empty
- Uses `import.meta.env.WP_API_URL` (no hardcoded URLs)
- Exports: `getPosts`, `getPostBySlug`, `getAllPostSlugs`, `getProducts`
- Has try/catch error handling in all functions

### 8. MagazineGrid Dynamic Integration
Verify `src/components/MagazineGrid.astro`:
- Imports `getPosts` from `../lib/wordpress.js`
- Calls `getPosts()` in the frontmatter
- Renders posts with a `.map()` loop
- Has a fallback for when the API returns no data

### 9. Environment Variables
- [ ] `.env` exists (content can be empty or have placeholder)
- [ ] `.env.example` exists with `WP_API_URL=https://your-wordpress-domain.com/wp-json/wp/v2`
- [ ] `.gitignore` contains `.env`

### 10. Static Assets
- [ ] `public/fonts/` contains at least one font file
- [ ] `public/assets/images/` contains `image-2.jpg`
- [ ] `src/scripts/main.js` exists and is not empty

### 11. Build Test
Run:
```bash
npm run build
```
- [ ] Build completes with no errors
- [ ] `dist/` directory is created

If the build fails, identify the root cause, fix it silently, re-run, and log what was fixed.

---

## FIX RULES

If any check fails:
1. Fix the issue silently (no explanation needed during fixing)
2. Log what was fixed in the report
3. Continue to the next check

Do NOT:
- Rename or replace any `ds-*` CSS class names
- Rewrite or modify any file inside `src/styles/design-system/`
- Install additional npm packages unless a required dependency is genuinely missing
- Refactor working code — only fix broken items

---

## OUTPUT — checkpoint.md

After all checks and fixes are complete, create `checkpoint.md` in the project root with this exact structure:

```markdown
# dokanelbanat — Setup Checkpoint
**Date:** [insert date]
**Astro version:** [from package.json]
**Tailwind version:** [from package.json]

---

## Summary

| Category | Status | Notes |
|----------|--------|-------|
| Project Init | ✅ / ❌ | |
| Directory Structure | ✅ / ❌ | |
| Design System CSS | ✅ / ❌ | |
| BaseLayout | ✅ / ❌ | |
| Components (9) | ✅ / ❌ | |
| index.astro | ✅ / ❌ | |
| WordPress API Layer | ✅ / ❌ | |
| MagazineGrid Integration | ✅ / ❌ | |
| Environment Variables | ✅ / ❌ | |
| Static Assets | ✅ / ❌ | |
| Build Test | ✅ / ❌ | |

---

## Issues Found & Fixed

<!-- List every issue that was fixed. If nothing was fixed, write "None." -->

### [Issue title]
- **Found in:** `file/path`
- **Problem:** what was wrong
- **Fix applied:** what was changed

---

## Issues Found & NOT Fixed

<!-- List issues that were detected but could not be auto-fixed (e.g. missing WP credentials, external service unavailable). -->

---

## Manual Actions Required

<!-- List anything the developer must do manually before going to production. -->

---

## Build Output

```
[paste the last 20 lines of npm run build output here]
```

---

## Next Steps

- [ ] Set real `WP_API_URL` in `.env`
- [ ] Verify fonts render correctly in browser
- [ ] Test nav drawer on mobile
- [ ] Connect ProductsGrid to WordPress CPT
- [ ] Create `src/pages/blog/[slug].astro` for article detail pages
```

---

## STOP INSTRUCTION

After writing `checkpoint.md`, **stop immediately.**  
Do not suggest further improvements.  
Do not open any files.  
Do not run any more commands.  
Write only: `✅ checkpoint.md written. Review complete.`
