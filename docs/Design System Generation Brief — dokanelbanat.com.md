# Design System Generation Brief — dokanelbanat.com

## Role
You are a Senior Design System Architect. Your task is to generate a complete, production-ready design system for dokanelbanat.com — a women's lifestyle and business ecosystem platform launching its new era in 2026.

## Project Context
dokanelbanat.com is an Arab women's ecosystem (founded 2018, relaunching 2026) covering: conscious lifestyle, business academy, suppliers hub, digital stores, magazine & podcast, and on-ground events. The brand philosophy is "Reset Your Mindset" — anti-consumerist, awareness-driven, minimalist, and editorial in tone. The audience is Arabic-speaking women, primarily 22–40, interested in conscious living and entrepreneurship.

The design system must support a multi-site ecosystem:
- Static landing page (HTML/CSS/JS) — primary use case
- WordPress headless blog/magazine
- WordPress + Tutor LMS academy
- WordPress + WooCommerce stores

The design language is **Editorial Conscious Femininity** — a contemporary print-magazine feel, not a typical commercial template. Typography is the protagonist; color is used as calculated statement, not decoration.

## Brand Tokens (Locked — Do Not Change)

### Colors
- Primary: #ff009f
- Secondary: #ff2d55
- Orange: #ff6b4a
- Yellow: #ffbe3d
- Green: #3db5aa
- Light/Canvas: #fff5fb
- Border: #ffbfe8
- Primary Dark (hover/active): #cc007f
- Primary Light: #ff66c4
- Green Dark: #2a9088

### Fonts
- Rubik — headlines (English, eyebrow labels, UI metadata)
- MarkaziText — body and titles (Arabic-first, primary editorial voice)
- Blabeloo — buttons only (playful, youthful character)

### Approved Gradient Moments (Only Three)
1. Soft hero gradient: 135deg, #fff5fb → #ffe5f4 (whisper background)
2. Press release statement: 135deg, #ff009f → #cc007f (printed-ink feel)
3. Numbers showcase: 120deg, #ff009f → #ff2d55 (poster impact, with low-opacity grain overlay)

## Deliverables Required

Produce the following as a single comprehensive design system document:

## 1. Foundations
Complete color system: extend the brand palette into semantic tokens (background, surface, text-primary, text-secondary, text-inverse, border-default, border-strong, accent, success, warning, danger, info). Define light-mode tokens only. Document opacity scale (4, 8, 16, 32, 64, 80).
Typography scale: define a modular type scale for Arabic and English separately. Include display, h1–h6, body-lg, body, body-sm, caption, label, button, and mono. For each: font-family, weight, size (rem and px), line-height, letter-spacing, and language direction.
Spacing scale: 4px base unit — tokens named space-0 through space-32 (values: 0, 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96, 128px).
Radius scale: none, sm (4px), md (8px), lg (16px), pill (9999px). Brand direction favors sharp, structured UI — radii applied selectively.
Shadow scale: minimal by design. Tokens: shadow-none, shadow-card (subtle elevation for content panels), shadow-dropdown (floating menus), shadow-modal (reserved for dialogs and overlays only).
Grid system: 12-column desktop (max-width 1280px, gutter 24px), 8-column tablet, 4-column mobile. RTL-first.
Breakpoints: mobile (≤640px), tablet (641–1024px), desktop (1025–1440px), wide (≥1441px).
Z-index scale: base (0), dropdown (100), sticky (200), overlay (300), modal (400), toast (500).

## 2. Brand UI Components 
Define these as first-class system elements:
Section Label (eyebrow-style tag with leading rule ⎯ — used for section titles and category identifiers)
Index Number (large outlined numerals 01–99 for numbered sections and process steps)
Highlight Marker (brand-colored underline for key terms — restrained, not decorative)
Announcement Block (structured banner for press releases and official statements — includes tag, date, title, and body)
Callout Card (surface-elevated card for pull quotes, stats, or key messages — no decorative marks)
Divider Rule (thin vertical or horizontal separator for multi-column layouts)
Brand Accent Detail (subtle corner or edge mark using brand color — applied sparingly per layout guidelines)
Sticky Note (optional / brand-voice contexts only) — retain only if the brand identity explicitly supports informal tone in specific touchpoints



### 3. Component Library
For each component below, provide: anatomy, all states (default, hover, active, focus, disabled, loading where relevant), variants, sizes, RTL behavior, accessibility notes, and usage do's/don'ts.

**Atoms**
- Button (variants: primary-solid, secondary-outline, ghost, link-as-signature; sizes: sm, md, lg; pill and standard radii)
- Input field (text, email, password, textarea, search)
- Select / Dropdown
- Checkbox & Radio
- Toggle / Switch
- Tag / Badge / Category Pill
- Tooltip
- Avatar
- Icon set guidance (style: thin outline, 1.5px stroke, 24px default)
- Divider (horizontal, vertical, with optional center dot)
- Loading spinner (subtle, brand-aligned)

**Molecules**
- Article Card (featured + standard variants for the magazine grid)
- Product Card (digital product with mockup, price/free tag)
- Pillar Card (the four-pillar editorial layout with index number and accent color)
- Stat Block (large number + label + description for the numbers section)
- Form Group (label + input + helper + error)
- Pagination
- Breadcrumb (RTL-aware)
- Social Icon Row

**Organisms**
- Header / Navigation (sticky behavior, backdrop blur, mobile menu)
- Hero Block (issue-cover layout)
- Press Release Block (full anatomy)
- Magazine Grid (asymmetric featured layout)
- Vision/Mission Two-Column
- Numbers Showcase (gradient section with grain texture)
- Digital Products Grid
- CTA Banner Section
- Footer (three-column)
- Newsletter / Subscribe Block
- Modal / Dialog
- Toast / Notification

### 4. Layout Patterns
Document at least 6 page-level patterns the system supports:
- Editorial landing page
- Article detail page (magazine)
- Product detail page (digital products)
- Course detail page (academy)
- Listing/archive page
- Contact / partnership inquiry page

### 5. Motion & Interaction
- Easing curves: editorial-default (cubic-bezier(0.32, 0.72, 0, 1)), editorial-quick, editorial-emphasis
- Duration scale: instant (100ms), quick (200ms), default (300ms), slow (500ms)
- Allowed motion patterns: subtle fades, slight scale on hover (max 1.02), counter animations for numbers, marker-style underline draw-in. Forbid: bounce, spring, parallax-heavy effects, glassmorphism transitions.
- Reduced-motion fallbacks for every animated component.

### 6. Imagery & Iconography Guidelines
- Photography treatment: warm tone, 10–15% desaturation, light film grain (subtle), 4:5 portrait or 16:9 editorial aspect ratios preferred. Reject glossy stock, smiling commercial photography, oversaturated colors.
- Illustration style: hand-drawn marker accents only — used sparingly as margin annotations. Not full illustrations.
- Icon style: thin outline, 1.5px stroke, rounded line caps, 24px default.
- Sticker/stamp elements: hand-lettered Blabeloo, slight rotation, used as page corners or beside key statements.

### 7. Accessibility Standards
- WCAG 2.2 AA minimum across all components
- Color contrast verified for every text/background pair in the system
- Full RTL support — verify direction-dependent components (arrows, breadcrumbs, drawer, navigation)
- Focus-visible states on every interactive element (use a 2px primary-pink outline with 2px offset)
- Keyboard navigation order documented for complex components
- Screen reader labels for icon-only buttons and decorative elements

### 8. Token Output Format
Deliver tokens in three formats:
- CSS custom properties (`:root` block, ready to drop into the static landing page)
- SCSS variables and mixins (for the WordPress theme work)
- JSON token file (W3C Design Tokens format) for future tooling and Figma sync

### 9. Documentation Structure
Organize the final output as:
1. Introduction & Philosophy
2. Foundations (tokens)
3. Editorial Devices
4. Components (atoms → molecules → organisms)
5. Layout Patterns
6. Motion
7. Imagery & Icons
8. Accessibility
9. Token Exports
10. Implementation Notes (for static HTML, WordPress headless, and WooCommerce contexts)

## Constraints & Non-Negotiables
- Arabic (RTL) is the primary language. English is secondary. Every component must work in both directions without compromise.
- The system must feel editorial, not commercial. If a pattern reads as "typical SaaS landing page," reject it.
- Pink (#ff009f) is a statement color. Limit its presence to: primary CTAs, the press release block, the numbers section, accent details, and one hand-drawn underline per page max.
- Gradients are restricted to the three approved moments above. Do not introduce additional gradient surfaces.
- No glassmorphism, no neumorphism, no faux-3D, no heavy shadows, no overdesigned cards with multiple borders/shadows/gradients stacked.
- Every decision must be defensible against the brand philosophy "Reset Your Mindset" — minimalism, awareness, knowledge-first, sufficiency.

## Output Expectations
Produce the document in clean Markdown, structured for direct handoff to a frontend developer (me). Include code-ready token blocks. Where visual examples would help, describe them precisely in prose so I can render them. Do not produce throwaway placeholder content — every component spec must be complete enough to build from.

Begin with the Foundations section and work systematically through the structure.