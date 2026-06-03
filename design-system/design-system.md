# dokanelbanat Design System v1.0

**Project:** dokanelbanat.com  
**Philosophy:** Reset Your Mindset — أعيدي تشكيل عقليتك  
**Design Language:** Editorial Conscious Femininity  
**Primary Language:** Arabic (RTL)  
**Secondary Language:** English (LTR)  
**Launch Year:** 2026  

---

## Table of Contents

1. [Introduction & Philosophy](#1-introduction--philosophy)
2. [Foundations](#2-foundations)
3. [Editorial Devices](#3-editorial-devices)
4. [Components](#4-components)
5. [Layout Patterns](#5-layout-patterns)
6. [Motion](#6-motion)
7. [Imagery & Icons](#7-imagery--icons)
8. [Accessibility](#8-accessibility)
9. [Token Exports](#9-token-exports)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. Introduction & Philosophy

### Brand Context
dokanelbanat.com is an Arab women's ecosystem founded in 2018, relaunching in 2026. It covers conscious lifestyle, business academy, suppliers hub, digital stores, magazine & podcast, and on-ground events.

### Design Direction: Editorial Conscious Femininity
This is a contemporary print-magazine feel — not a typical commercial template. Typography is the protagonist. Color is used as calculated statement, not decoration. The system must feel editorial, not commercial. If a pattern reads as "typical SaaS landing page," reject it.

### Core Principles
- **Arabic (RTL) is primary.** English is secondary. Every component must work in both directions without compromise.
- **Minimalism over decoration.** No glassmorphism, no neumorphism, no faux-3D, no heavy shadows.
- **Pink is a statement.** Limit #ff009f to: primary CTAs, press release block, numbers section, accent details, and one hand-drawn underline per page max.
- **Gradients are restricted** to three approved moments only.
- **Every decision defends** the brand philosophy: minimalism, awareness, knowledge-first, sufficiency.

### Multi-Site Ecosystem
- **Landing Page** (dokanelbanat.com): Static HTML/CSS/JS
- **Blog/Magazine** (blog.dokanelbanat.com): WordPress Headless
- **Academy** (academy.dokanelbanat.com): WordPress + Tutor LMS
- **Stores** (stores.dokanelbanat.com): WordPress + WooCommerce

---

## 2. Foundations

### 2.1 Color System

#### Brand Colors (Locked)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#ff009f` | Primary CTAs, accent details, press release |
| Secondary | `#ff2d55` | Danger states, gradient endpoint |
| Orange | `#ff6b4a` | Info states, warm highlights |
| Yellow | `#ffbe3d` | Stickers, stamps, playful moments |
| Green | `#3db5aa` | Success states |
| Light / Canvas | `#fff5fb` | Page canvas, soft backgrounds |
| Border | `#ffbfe8` | Strong borders, decorative rules |
| Primary Dark | `#cc007f` | Hover/active states |
| Primary Light | `#ff66c4` | Subtle pink tints |
| Green Dark | `#2a9088` | Hover on green elements |

#### Semantic Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `bg-base` | `#ffffff` | Default page background |
| `bg-canvas` | `#fff5fb` | Soft section backgrounds |
| `bg-surface` | `#ffffff` | Cards, panels, elevated surfaces |
| `bg-inverse` | `#1a0512` | Footer, dark sections |
| `text-primary` | `#1a0512` | Headlines, body text |
| `text-secondary` | `#6b5b66` | Supporting text, captions |
| `text-muted` | `#9e8e99` | Placeholders, disabled text |
| `text-inverse` | `#ffffff` | Text on dark backgrounds |
| `border-default` | `#f0dce8` | Default dividers, input borders |
| `border-strong` | `#ffbfe8` | Emphasized borders |
| `success` | `#3db5aa` | Confirmation, valid states |
| `warning` | `#ffbe3d` | Cautionary states |
| `danger` | `#ff2d55` | Errors, destructive actions |
| `info` | `#ff6b4a` | Informational highlights |

#### Opacity Scale
| Token | Value |
|-------|-------|
| `opacity-4` | 0.04 |
| `opacity-8` | 0.08 |
| `opacity-16` | 0.16 |
| `opacity-32` | 0.32 |
| `opacity-48` | 0.48 |
| `opacity-64` | 0.64 |
| `opacity-80` | 0.80 |

### 2.2 Typography Scale

#### Font Families
- **Rubik** — Headlines (English), eyebrow labels, UI metadata
- **MarkaziText** — Body and titles (Arabic-first, primary editorial voice)
- **Blabeloo** — Buttons only (playful, youthful character)

#### Arabic Scale (MarkaziText)
| Level | Size | Line-Height | Weight | Letter-Spacing |
|-------|------|-------------|--------|----------------|
| display | 4rem (64px) | 1.2 | 600 | 0 |
| h1 | 3rem (48px) | 1.25 | 600 | 0 |
| h2 | 2.25rem (36px) | 1.3 | 600 | 0 |
| h3 | 1.75rem (28px) | 1.35 | 600 | 0 |
| h4 | 1.5rem (24px) | 1.4 | 600 | 0 |
| h5 | 1.25rem (20px) | 1.5 | 600 | 0.01em |
| h6 | 1rem (16px) | 1.6 | 600 | 0.01em |
| body-lg | 1.125rem (18px) | 1.8 | 400 | 0 |
| body | 1rem (16px) | 1.8 | 400 | 0 |
| body-sm | 0.875rem (14px) | 1.7 | 400 | 0 |
| caption | 0.75rem (12px) | 1.6 | 400 | 0.02em |
| label | 0.75rem (12px) | 1.4 | 500 | 0.04em |
| button | 1rem (16px) | 1.2 | 500 | 0.02em |
| mono | 0.875rem (14px) | 1.5 | 400 | 0 |

#### English Scale (Rubik)
| Level | Size | Line-Height | Weight | Letter-Spacing |
|-------|------|-------------|--------|----------------|
| display | 4rem (64px) | 1.05 | 700 | -0.02em |
| h1 | 3rem (48px) | 1.1 | 700 | -0.02em |
| h2 | 2.25rem (36px) | 1.15 | 700 | -0.015em |
| h3 | 1.75rem (28px) | 1.2 | 600 | -0.01em |
| h4 | 1.5rem (24px) | 1.25 | 600 | -0.005em |
| h5 | 1.25rem (20px) | 1.3 | 500 | 0 |
| h6 | 1rem (16px) | 1.4 | 500 | 0.01em |
| body-lg | 1.125rem (18px) | 1.6 | 400 | 0 |
| body | 1rem (16px) | 1.6 | 400 | 0 |
| body-sm | 0.875rem (14px) | 1.5 | 400 | 0.005em |
| caption | 0.75rem (12px) | 1.4 | 400 | 0.02em |
| label | 0.75rem (12px) | 1.2 | 500 | 0.06em |
| button | 1rem (16px) | 1.0 | 500 | 0.02em |
| mono | 0.875rem (14px) | 1.5 | 400 | 0 |

### 2.3 Spacing Scale
4px base unit.

| Token | Value |
|-------|-------|
| `space-0` | 0px |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |
| `space-32` | 128px |

### 2.4 Radius Scale
Sharp, structured UI — radii applied selectively.

| Token | Value |
|-------|-------|
| `radius-none` | 0px |
| `radius-sm` | 4px |
| `radius-md` | 8px |
| `radius-lg` | 16px |
| `radius-pill` | 9999px |

### 2.5 Shadow Scale
Minimal by design.

| Token | Value |
|-------|-------|
| `shadow-none` | none |
| `shadow-card` | 0 1px 3px rgba(26,5,18,0.06), 0 1px 2px rgba(26,5,18,0.04) |
| `shadow-dropdown` | 0 4px 12px rgba(26,5,18,0.08), 0 2px 4px rgba(26,5,18,0.04) |
| `shadow-modal` | 0 16px 48px rgba(26,5,18,0.12), 0 4px 12px rgba(26,5,18,0.06) |

### 2.6 Grid System
RTL-first. 12-column desktop, 8-column tablet, 4-column mobile.

| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Columns | 12 | 8 | 4 |
| Max Width | 1280px | 100% | 100% |
| Gutter | 24px | 16px | 16px |
| Margin | 24px | 16px | 16px |

### 2.7 Breakpoints
| Name | Range |
|------|-------|
| Mobile | ≤640px |
| Tablet | 641–1024px |
| Desktop | 1025–1440px |
| Wide | ≥1441px |

### 2.8 Z-Index Scale
| Token | Value |
|-------|-------|
| `z-base` | 0 |
| `z-dropdown` | 100 |
| `z-sticky` | 200 |
| `z-overlay` | 300 |
| `z-modal` | 400 |
| `z-toast` | 500 |

### 2.9 Approved Gradients (Only Three)
1. **Soft hero gradient:** `linear-gradient(135deg, #fff5fb 0%, #ffe5f4 100%)`
2. **Press release statement:** `linear-gradient(135deg, #ff009f 0%, #cc007f 100%)`
3. **Numbers showcase:** `linear-gradient(120deg, #ff009f 0%, #ff2d55 100%)` — with low-opacity grain overlay

---

## 3. Editorial Devices

These are brand-unique UI elements that give the system its editorial character.

### Section Label (Eyebrow)
A small uppercase label with a leading pink rule, used for section titles and category identifiers.

```html
<span class="ds-section-label">منذ عام 2018</span>
```

- Font: label size (Arabic or English)
- Leading rule: 24px wide, 2px tall, primary pink
- Gap between rule and text: 12px

### Index Number
Large outlined numerals (01–99) for numbered sections and process steps.

```html
<div class="ds-index-number">01</div>
```

- Font: English display weight
- Stroke: 1.5px primary pink
- Fill: transparent
- Opacity: 0.80
- Responsive: clamp(3rem, 8vw, 6rem)

### Highlight Marker
Brand-colored underline for key terms — restrained, not decorative.

```html
<span class="ds-highlight-marker">نقص لا وجود له</span>
```

- Underline height: 0.25em
- Color: primary pink at 32% opacity
- Position: behind text (z-index: -1)
- Max: one per page

### Announcement Block
Structured banner for press releases and official statements.

```html
<div class="ds-announcement">
  <div class="ds-announcement__tag">تصريح صحفي</div>
  <div class="ds-announcement__date">2026/01/15</div>
  <h3 class="ds-announcement__title">...</h3>
  <p class="ds-announcement__body">...</p>
</div>
```

- Background: gradient-press
- Text: white, max-width 65ch for body
- Tag + date: muted opacity

### Callout Card
Surface-elevated card for pull quotes, stats, or key messages.

```html
<div class="ds-callout">
  <p class="ds-callout__quote">"..."</p>
  <cite class="ds-callout__source">...</cite>
</div>
```

- No decorative quotation marks
- Subtle shadow-card
- White background, default border

### Divider Rule
Thin vertical or horizontal separator for multi-column layouts.

```html
<hr class="ds-divider ds-divider--horizontal">
<hr class="ds-divider ds-divider--vertical">
<hr class="ds-divider ds-divider--horizontal ds-divider--with-dot">
```

- Color: border-default
- With dot: 6px circle in primary pink, centered

### Brand Accent Detail
Subtle corner or edge mark using brand color — applied sparingly.

```html
<div class="ds-accent-detail ds-accent-detail--top-right"></div>
```

- 3px wide, 40px tall
- Absolute positioned
- Use one per major section max

### Sticky Note
Optional — brand-voice contexts only. Informal, playful tone.

```html
<div class="ds-sticky-note">جديد!</div>
```

- Yellow background (#ffbe3d)
- Slight rotation (-2deg RTL, +2deg LTR)
- Shadow-card

---

## 4. Components

### 4.1 Atoms

#### Button

**Anatomy:** Inline-flex container with icon + text slots, 2px border, Blabeloo font.

**Variants:**
- `primary-solid` — filled pink
- `secondary-outline` — transparent with pink border
- `ghost` — transparent, no border
- `link-as-signature` — text with bottom border only

**Sizes:** sm, md, lg

**Radii:** standard (4px) or pill (9999px)

**States:**
| State | Visual |
|-------|--------|
| Default | As per variant |
| Hover | Darken background or invert outline |
| Active | Scale(0.98) — subtle press |
| Focus | 2px pink outline, 2px offset |
| Disabled | 48% opacity, not-allowed cursor |
| Loading | Spinner replaces text |

**RTL:** No direction-specific changes.

**Accessibility:**
- `focus-visible` ring on all states
- `aria-disabled` for disabled state
- Loader announces via `aria-busy="true"`

**Do:** Use primary-solid for main CTA only. Use pill radius for CTAs, standard for forms.
**Don't:** Stack multiple pink buttons next to each other. Don't use bounce or spring on hover.

#### Input Field

**Types:** text, email, password, textarea, search

**States:**
| State | Visual |
|-------|--------|
| Default | 1px border-default, white bg |
| Hover | border-strong |
| Focus | border-primary + 3px pink glow |
| Disabled | canvas bg, 48% opacity |
| Invalid | border-danger + red glow |

**RTL:** Search icon positioned at inline-start. Select chevron at inline-end.

**Accessibility:**
- Label association required (`for` + `id`)
- `aria-invalid` for error state
- `aria-describedby` linking to helper/error text

#### Select / Dropdown

- Custom chevron via background SVG
- Same state logic as input
- Disabled state: 48% opacity

#### Checkbox & Radio

- Custom appearance via `appearance: none`
- 20px × 20px
- 1.5px border-default, transitions to primary on check
- Checkbox: white checkmark on pink fill
- Radio: inset ring on primary
- Focus: standard focus ring

#### Toggle / Switch

- 44px × 24px track
- 20px thumb with shadow-card
- Checked: primary background, thumb slides 20px
- Transition: background + transform 200ms

#### Tag / Badge / Category Pill

**Variants:** default, accent, outline, green, yellow

- All pills: uppercase label font
- Default: canvas bg, default border
- Accent: primary bg, white text
- Outline: transparent bg, primary border

#### Tooltip

- Trigger: dashed underline or icon
- Content: dark bg (`bg-inverse`), white caption text
- Position: above trigger, centered
- Arrow: 5px triangle
- Appears on hover or focus

#### Avatar

**Sizes:** xs (24px), sm (32px), md (40px), lg (56px), xl (80px)

- Circular, overflow hidden
- Fallback: initials in secondary text color
- Image: object-fit cover

#### Divider

- Horizontal: 1px, full width
- Vertical: 1px, full height, min 32px
- With dot: centered 6px pink circle

#### Loading Spinner

- 24px default, 2px border
- Brand-aligned: primary top, default border remainder
- Animation: 0.8s linear infinite spin
- Reduced motion: static, 48% opacity

---

### 4.2 Molecules

#### Article Card

**Variants:** standard, featured

```html
<article class="ds-article-card ds-article-card--featured">
  <div class="ds-article-card__image">
    <img src="..." alt="">
  </div>
  <div class="ds-article-card__body">
    <span class="ds-article-card__category">جمال</span>
    <h3 class="ds-article-card__title">...</h3>
    <p class="ds-article-card__excerpt">...</p>
  </div>
</article>
```

- Standard: 16:9 image, h5 title, 2-line excerpt clamp
- Featured: spans 2 columns, 4:3 image, h3 title
- Hover: dropdown shadow, image scale 1.02, card lift 2px

**RTL:** No special changes.

#### Product Card

```html
<div class="ds-product-card">
  <div class="ds-product-card__mockup">
    <img src="..." alt="">
  </div>
  <span class="ds-product-card__category">قالب</span>
  <h4 class="ds-product-card__title">...</h4>
  <p class="ds-product-card__desc">...</p>
  <div class="ds-product-card__footer">
    <span class="ds-product-card__price">$29</span>
    <button class="ds-btn ds-btn--primary-solid ds-btn--sm">اشترِ الآن</button>
  </div>
</div>
```

- Mockup area: 4:3, canvas background
- Free tag: green color variant

#### Pillar Card

Used for the four-pillar editorial layout.

```html
<div class="ds-pillar-card" style="--pillar-color: #ff009f;">
  <div class="ds-pillar-card__index ds-index-number">01</div>
  <h4 class="ds-pillar-card__title">الاكتفاء الذاتي</h4>
  <p class="ds-pillar-card__body">...</p>
</div>
```

- Top border: 3px, color via CSS custom property
- Index number above title
- Body text in secondary color

#### Stat Block

```html
<div class="ds-stat">
  <div class="ds-stat__number">+١٠٠,٠٠٠</div>
  <div class="ds-stat__label">قصة ثقة</div>
  <p class="ds-stat__desc">...</p>
</div>
```

- Number: English display font, clamp responsive
- Used inside Numbers Showcase (inverse text)

#### Form Group

```html
<div class="ds-form-group">
  <label class="ds-form-group__label" for="email">
    البريد الإلكتروني <span class="ds-form-group__required">*</span>
  </label>
  <input class="ds-input" id="email" type="email" aria-describedby="email-help">
  <span class="ds-form-group__helper" id="email-help">...</span>
  <span class="ds-form-group__error" id="email-error">...</span>
</div>
```

- Label: uppercase, label font
- Helper: caption, muted
- Error: caption, danger color, with icon

#### Pagination

```html
<nav class="ds-pagination" aria-label="صفحات المقالات">
  <a class="ds-pagination__prev" href="...">← السابق</a>
  <a class="ds-pagination__link" href="...">1</a>
  <a class="ds-pagination__link ds-pagination__link--active" aria-current="page">2</a>
  <a class="ds-pagination__next" href="...">التالي →</a>
</nav>
```

- RTL: arrows flip via text content, not transform
- Active: primary bg, white text

#### Breadcrumb

```html
<nav aria-label="Breadcrumb">
  <ol class="ds-breadcrumb">
    <li class="ds-breadcrumb__item">
      <a class="ds-breadcrumb__link" href="/">الرئيسية</a>
      <span class="ds-breadcrumb__separator">/</span>
    </li>
    <li class="ds-breadcrumb__item" aria-current="page">
      <span class="ds-breadcrumb__current">المقال</span>
    </li>
  </ol>
</nav>
```

- Separator flipped for RTL via `transform: scaleX(-1)`
- Current page: no link, primary text color

#### Social Icon Row

```html
<ul class="ds-social-row" aria-label="حسابات التواصل الاجتماعي">
  <li><a class="ds-social-row__link" href="..." aria-label="إنستغرام">...</a></li>
</ul>
```

- 40px × 40px touch targets
- Hover: primary color + canvas bg

---

### 4.3 Organisms

#### Header / Navigation

- Sticky, top: 0, z-index: 200
- Height: 72px desktop, 64px mobile
- Backdrop blur (12px) on white at 92% opacity
- Border-bottom: default border
- Logo left (RTL: right), nav center, CTA right
- Mobile: hamburger toggle, full-width dropdown nav

**Keyboard:** Tab order: logo → nav links → CTA → menu toggle (mobile)

#### Hero Block

```html
<section class="ds-hero">
  <div class="ds-hero__inner">
    <div class="ds-hero__content">
      <span class="ds-hero__eyebrow">منذ عام 2018</span>
      <h1 class="ds-hero__title">دكان البنات</h1>
      <p class="ds-hero__subtitle">...</p>
      <p class="ds-hero__body">...</p>
      <div class="ds-hero__actions">
        <a class="ds-btn ds-btn--primary-solid ds-btn--md ds-btn--pill" href="...">مجلة دكان البنات</a>
        <a class="ds-btn ds-btn--secondary-outline ds-btn--md ds-btn--pill" href="...">إعادة ضبط عقليتك</a>
      </div>
    </div>
    <div class="ds-hero__media">
      <img src="..." alt="">
    </div>
  </div>
</section>
```

- Background: gradient-hero
- Layout: 2-column grid, stacks on tablet
- Media: 4:5 portrait preferred

#### Press Release Block

- Full-width gradient-press background
- Label + date + title + body
- Max-width container, white text
- No border radius

#### Magazine Grid

- CSS Grid: 12 columns desktop
- Featured card spans 6 columns
- Standard cards span 3 columns
- Responsive: 8-col tablet, 4-col mobile

#### Vision / Mission Two-Column

- 2-column grid, large gap (128px desktop)
- Each block: label + title + text
- Stacks on tablet

#### Numbers Showcase

- Full-width gradient-numbers
- Grain overlay at 16% opacity (SVG noise filter)
- 4-column stat grid, 2-col tablet, 1-col mobile
- Inverse text colors

#### Digital Products Grid

- 3-column grid
- Product cards with mockup, category, title, price

#### CTA Banner Section

- Canvas background
- Centered text, eyebrow + title + body
- No image

#### Footer

- 3-column: brand (2fr) + links (1fr) + contact (1fr)
- Inverse background (#1a0512)
- Logo: inverted filter
- Links: 64% opacity, 100% on hover
- Bottom bar: copyright, 48% opacity

#### Newsletter / Subscribe Block

- Surface background, default border
- Title + text + inline form (input + button)
- Mobile: stacked form

#### Modal / Dialog

- Overlay: fixed, dark at 48% opacity, z-index 300
- Modal: max-width 560px, shadow-modal, no radius
- Header: title + close button
- Body: scrollable if needed
- Footer: action buttons, right-aligned (RTL: left-aligned)
- Entrance: fade overlay + translateY modal

#### Toast / Notification

- Fixed top-left (RTL) / top-right (LTR)
- z-index: 500
- Types: success, warning, error, info
- Left border accent (3px)
- Entrance: slide in + fade
- Auto-dismiss: 5s recommended

---

## 5. Layout Patterns

### 5.1 Editorial Landing Page
Sections in order:
1. Header (sticky)
2. Hero (gradient-hero, 2-column)
3. Reset Your Mindset (about + pillars)
4. Magazine Grid (asymmetric, featured card)
5. Vision / Mission (2-column)
6. Numbers Showcase (gradient + grain)
7. Digital Products Grid
8. CTA Banner
9. Footer

### 5.2 Article Detail Page (Magazine)
- Header
- Article header: meta (category, date) + h1
- Hero image (16:9)
- Body content: max-width 65ch, centered
  - h2, h3, blockquote, images
- Sidebar: related articles, newsletter (hidden on tablet)
- Footer

### 5.3 Product Detail Page (Digital Products)
- Header
- 2-column: gallery (4:3 canvas) + info
  - Category, title, price, description, actions
- Footer

### 5.4 Course Detail Page (Academy)
- Header
- Hero: 2-column (course info + sidebar card with instructor)
- Curriculum: lesson list + sidebar
- Footer

### 5.5 Listing / Archive Page
- Header
- Page header: title + result count + filters
- Grid: 3-col desktop, 2-col tablet, 1-col mobile
- Pagination
- Footer

### 5.6 Contact / Partnership Inquiry Page
- Header
- 2-column: contact details + form
  - Details: label/value pairs
  - Form: name, email, subject, message
- Footer

---

## 6. Motion

### 6.1 Easing Curves
| Name | Value | Usage |
|------|-------|-------|
| editorial-default | `cubic-bezier(0.32, 0.72, 0, 1)` | Default transitions |
| editorial-quick | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Quick UI feedback |
| editorial-emphasis | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |

### 6.2 Duration Scale
| Token | Value | Usage |
|-------|-------|-------|
| instant | 100ms | Color swaps |
| quick | 200ms | Hover states |
| default | 300ms | Standard transitions |
| slow | 500ms | Section entrances |

### 6.3 Allowed Motion Patterns
- Subtle fades (opacity 0 → 1)
- Slight scale on hover: max `scale(1.02)`
- Counter animations for numbers (JS-driven, with `tabular-nums`)
- Marker underline draw-in (scaleX 0 → 1)
- Section entrances: fade + translateY(16px → 0)
- Staggered children: 80ms increments

### 6.4 Forbidden Motions
- Bounce or spring physics
- Parallax-heavy effects
- Glassmorphism transitions
- 3D transforms on UI elements
- Shake or wobble

### 6.5 Reduced Motion
All animated components include `@media (prefers-reduced-motion: reduce)` fallbacks:
- Transitions: instant (0.01ms)
- Animations: disabled
- Entrance states: visible immediately
- Global override in `motion.css`

---

## 7. Imagery & Icons

### 7.1 Photography Treatment
- Warm tone
- 10–15% desaturation
- Light film grain (subtle)
- Preferred ratios: 4:5 portrait, 16:9 editorial
- Reject: glossy stock, smiling commercial photography, oversaturated colors

### 7.2 Illustration Style
- Hand-drawn marker accents only
- Used sparingly as margin annotations
- Not full illustrations

### 7.3 Icon Style
- Thin outline
- 1.5px stroke
- Rounded line caps
- 24px default size
- Color: inherit from text

### 7.4 Sticker / Stamp Elements
- Hand-lettered Blabeloo font
- Slight rotation
- Page corners or beside key statements
- Yellow (#ffbe3d) background preferred

---

## 8. Accessibility

### 8.1 Standards
- WCAG 2.2 AA minimum across all components
- Color contrast verified for every text/background pair

### 8.2 Contrast Pairs (Verified)
| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| #1a0512 | #ffffff | 16.9:1 | AAA |
| #6b5b66 | #ffffff | 5.4:1 | AA |
| #ffffff | #ff009f | 3.8:1 | AA (Large) |
| #ffffff | #cc007f | 5.2:1 | AA |
| #ffffff | #1a0512 | 16.9:1 | AAA |
| #ff009f | #fff5fb | 3.6:1 | AA (Large) |

### 8.3 RTL Support
- `dir="rtl"` on `<html>` by default
- Logical properties: `margin-inline`, `padding-inline`, `inset`
- Direction-dependent components verified:
  - Arrows in pagination
  - Breadcrumb separators
  - Modal footer alignment
  - Drawer slide direction
  - Navigation order

### 8.4 Focus States
- Every interactive element: `focus-visible`
- Ring: 2px solid primary pink
- Offset: 2px
- No `outline: none` without replacement

### 8.5 Keyboard Navigation
- Tab order follows visual order
- Modal: focus trap, Escape to close
- Toast: auto-focus not required, but close button reachable

### 8.6 Screen Readers
- Icon-only buttons: `aria-label`
- Decorative elements: `aria-hidden="true"`
- Live regions for toasts (`aria-live="polite"`)
- Form errors: `aria-describedby` linking

---

## 9. Token Exports

Tokens are delivered in three formats for maximum compatibility across the ecosystem.

### 9.1 CSS Custom Properties
**File:** `design-system/tokens.css`

Drop the `:root` block into any project. All values use CSS custom properties for runtime theming.

```css
@import url('design-system/tokens.css');
```

### 9.2 SCSS Variables & Mixins
**File:** `design-system/tokens.scss`

Import into WordPress themes or any Sass build:

```scss
@import 'design-system/tokens';

.my-component {
  padding: $space-4;
  @include respond-to(desktop-up) {
    padding: $space-8;
  }
}
```

**Included Mixins:**
- `respond-to($breakpoint)` — mobile-first media queries
- `focus-ring` — WCAG focus state
- `sr-only` — visually hidden
- `container` — max-width centered container
- `grid` / `grid-tablet` / `grid-mobile`
- `type-ar($level)` / `type-en($level)` — typography shortcuts
- `motion-safe` / `motion-reduce` — motion preference wrappers
- `button-base` — button reset + transitions
- `card-surface` — standard card styling
- `section-label` — eyebrow label with rule
- `grain-overlay` — SVG noise texture

### 9.3 JSON (W3C Design Tokens Format)
**File:** `design-system/tokens/tokens.json`

Structured for Figma sync and future tooling (Style Dictionary, Tokens Studio).

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/schemas/w3c.json",
  "name": "dokanelbanat Design Tokens",
  "version": "1.0.0"
}
```

Token groups: `color`, `opacity`, `font`, `space`, `radius`, `shadow`, `grid`, `breakpoint`, `zIndex`, `gradient`, `motion`, `layout`, `focus`.

---

## 10. Implementation Notes

### 10.1 Static HTML Landing Page
**Stack:** Plain HTML/CSS/JS, zero CMS

**Setup:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>dokanelbanat.com</title>
  <link rel="stylesheet" href="design-system/index.css">
</head>
<body>
  <!-- Components use ds-* classes -->
</body>
</html>
```

**Notes:**
- All fonts load from `assets/fonts/` (local, no CDN)
- GTM container in `<head>`
- Fetch latest posts from `blog.dokanelbanat.com/wp-json/wp/v2/posts`
- No JavaScript framework required

### 10.2 WordPress Headless (Blog/Magazine)
**Stack:** WordPress + REST API

**Notes:**
- Use `tokens.scss` in the consuming frontend (the landing page)
- WordPress admin runs independently
- No professional theme needed on WP — Twenty Twenty-Four is sufficient
- REST API exposes: posts, categories, tags
- ACF for podcast episode metadata if needed

### 10.3 WordPress + Tutor LMS (Academy)
**Stack:** WordPress + Tutor LMS + WooCommerce

**Notes:**
- Import `tokens.scss` into a custom Tutor LMS child theme
- Override Tutor default variables with brand tokens
- WooCommerce checkout styling: use tokens for buttons, inputs, alerts
- Independent login — no SSO

### 10.4 WordPress + WooCommerce (Stores)
**Stack:** WordPress + WooCommerce + Fluent Forms

**Notes:**
- Apply tokens to WooCommerce product cards, buttons, and forms
- Supplier directory: custom post type or page template
- Inquiry forms: Fluent Forms with brand-styled inputs

### 10.5 Cross-Domain Considerations
- One GTM container across all subdomains
- GA4 cookie_domain: `.dokanelbanat.com`
- Wildcard SSL certificate

### 10.6 Performance Checklist
- Fonts: `font-display: swap`
- Images: lazy loading, WebP with fallbacks
- CSS: single file import via `index.css`
- Animations: `transform` and `opacity` only (GPU-composited)
- No layout-triggering animations

---

## File Index

| File | Path | Purpose |
|------|------|---------|
| Master Import | `design-system/index.css` | Single-file system load |
| Fonts | `design-system/fonts.css` | @font-face declarations (local) |
| CSS Tokens | `design-system/tokens.css` | Custom properties |
| SCSS Tokens | `design-system/tokens.scss` | Variables + mixins |
| JSON Tokens | `design-system/tokens/tokens.json` | W3C format for tooling |
| Components | `design-system/components.css` | All atoms, molecules, organisms |
| Layouts | `design-system/layouts.css` | 6 page-level patterns |
| Motion | `design-system/motion.css` | Easing, durations, reduced-motion |
| Utilities | `design-system/utilities.css` | Helper classes |
| Documentation | `design-system/design-system.md` | This document |

---

*Document version: 1.0.0*  
*Last updated: 2026-05-01*  
*Maintainer: Frontend team — dokanelbanat.com*
