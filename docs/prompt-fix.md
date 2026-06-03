Read `docs/checkpoint.md` fully before writing a single line of code.

You are making targeted fixes and improvements to the dokanelbanat.com Astro project. Do not refactor anything outside the scope listed below. Do not touch campaign files, design system tokens, or WordPress API logic.

---

TASK 1 — Fix logo path (all pages, all components)

The logo is broken on all pages except `/` because `Header.astro` uses a relative path. Fix this once at the source so it works everywhere including `/blog/[slug]` routes.

In `src/components/Header.astro`: change every logo `src` attribute to use an absolute path starting with `/assets/logo/`. Do the same for `src/components/Footer.astro`. No relative paths anywhere — use `/assets/logo/dokanelbanatlogo-gradient.png` for the header and `/assets/logo/dokanelbanatlogo.png` for the footer.

---

TASK 2 — Unify Header as a single shared component

The Header component must be the single source of truth used by `BaseLayout.astro`. Verify that `src/pages/index.astro`, `src/pages/privacy.astro`, `src/pages/terms.astro`, and `src/pages/blog/[slug].astro` all use `BaseLayout.astro` and do not import or duplicate `Header.astro` directly. If any page is importing Header independently, remove the duplicate import and rely on the layout instead.

---

TASK 3 — Off-canvas mobile menu: fix background color and wire anchor links

In `src/components/Header.astro`, the off-canvas drawer currently has a dark background. Change the drawer background to `var(--color-light)` which is `#fff5fb`. Update all text and icon colors inside the drawer to remain readable against this light background — use `var(--color-primary)` for active or hover states and a dark neutral for default link text.

Wire each nav link inside the drawer to the correct section anchor on the landing page. The sections and their IDs are:

- المجلة → `#magazine`
- من نحن → `#about`
- رؤيتنا → `#vision`
- منتجاتنا → `#products`
- تواصلي معنا → `#cta`

Make sure each anchor link in both the desktop nav and the mobile drawer points to these IDs. Verify the corresponding sections in `src/pages/index.astro` or their component files actually have those `id` attributes set. If any section is missing its `id`, add it.

The close button for the drawer must remain functional after this change.

---

TASK 4 — Mobile: center `.ds-section-label` and section headings globally

In `src/styles/design-system/components.css` or wherever `.ds-section-label` is defined, add a mobile breakpoint rule that centers the label and the heading that follows it. Target screens under 768px. The rule should be:

At max-width 768px, `.ds-section-label` gets `text-align: center` and `margin-inline: auto`. Also add `text-align: center` to `.ds-section-title` and `.ds-section-subtitle` at the same breakpoint. This must apply globally across all sections without touching individual component files.

---

TASK 5 — Mobile Hero: force buttons on one row, no wrap

In `src/components/Hero.astro`, find the button group container (the element wrapping both CTA buttons). On mobile screens (max-width 768px), ensure the flex container has `flex-wrap: nowrap`, `gap` reduced to `0.5rem`, and both buttons have `flex: 1` with `min-width: 0` so they split the row evenly. If the button text is too long to fit, reduce the font-size to `0.85rem` on mobile only for those buttons. Do not change the desktop layout.

---

TASK 6 — Phase 1 cleanup: GTM placeholder notice

Do NOT replace GTM-XXXXXXX — the real container ID will be added manually. However, add an HTML comment directly above the GTM script block in `src/layouts/BaseLayout.astro` that reads: `<!-- TODO: Replace GTM-XXXXXXX with real container ID before running any ads -->`. This makes it impossible to miss during a code review.

---

TASK 7 — Create `src/pages/404.astro`

Create a branded Arabic 404 page that uses `BaseLayout.astro`. It must include the brand header, a centered Arabic message "الصفحة التي تبحثين عنها غير موجودة", a sub-message "ربما تم نقل الصفحة أو حذفها", and a button linking back to `/` with the text "العودة للرئيسية". Style it using existing design system classes. Keep it minimal — no new CSS beyond what the design system already provides.

---

After completing all tasks, do a final check:

- Run `npm run build` mentally — confirm no import errors, no broken paths, no missing IDs
- Confirm the logo path fix covers Header and Footer
- Confirm the mobile centering rule is in the global CSS, not scoped inside a single component
- Confirm the off-canvas close button still works after the background color change

Do not update `docs/checkpoint.md` — that will be done separately.