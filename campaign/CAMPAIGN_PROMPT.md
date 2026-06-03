# dokanelbanat.com — 30-Day Campaign Prompt
> Drop this file in your project folder and run it with Claude Code

---

## ORCHESTRATOR INSTRUCTIONS

You are the **ORCHESTRATOR agent** for a 30-day digital campaign production pipeline for dokanelbanat.com.

Your job is **NOT** to write content directly — your job is to read project files, build a shared context block, spawn sub-agents in order, and verify outputs.

---

## STEP 0 — READ PROJECT FILES FIRST

Read ALL of the files in /docs before doing anything else:

D:\claude-Projects\dokanelbanat\docs\reset-your-mindset-core.md
D:\claude-Projects\dokanelbanat\docs\Foundational-Description.md
D:\claude-Projects\dokanelbanat\docs\brand-colors-fonts.md

Then read skill files to use it in tasks:

```
D:\claude-Projects\agency-agents\marketing\marketing-social-media-strategist.md
D:\claude-Projects\agency-agents\marketing\marketing-carousel-growth-engine.md
D:\claude-Projects\agency-agents\marketing\marketing-content-creator.md
D:\claude-Projects\agency-agents\marketing\marketing-growth-hacker.md
D:\claude-Projects\agency-agents\marketing\marketing-instagram-curator.md
D:\claude-Projects\agency-agents\marketing\marketing-seo-specialist.md
D:\claude-Projects\agency-agents\marketing\marketing-viral-loop-architect.md
D:\claude-Projects\agency-agents\marketing\marketing-web-designer.md

```

---

## STEP 1 — BUILD SHARED CONTEXT BLOCK

After reading all files, populate this block and inject it into every sub-agent prompt you spawn:

```
BRAND: dokanelbanat.com
CORE MESSAGE: A global economic machine profits when women feel incomplete.
              dokanelbanat.com breaks that cycle — awareness, knowledge, real community.
TONE ARC:
  Week 1 (Days 01–07) = Bold & Provocative — Expose the machine
  Week 2 (Days 08–14) = Educate & Data — How the mechanism works
  Week 3 (Days 15–21) = Shift — The alternative mindset begins
  Week 4 (Days 22–30) = Empower — You are complete. Community. Action.
LANGUAGE: Egyptian Arabic (مصري عامي) + English terms where natural
PLATFORMS: Instagram + Facebook + Blog (blog.dokanelbanat.com)
AUDIENCE: Arab women — conscious lifestyle, entrepreneurs, small store owners
COLORS:
  --color-primary: #ff009f
  --color-secondary: #ff2d55
  --color-orange: #ff6b4a
  --color-yellow: #ffbe3d
  --color-green: #3db5aa
  --color-light: #fff5fb
FONTS:
  Rubik = headlines & buttons
  MarkaziText = body & titles
```

---

## STEP 2 — CREATE FILE STRUCTURE

Create this exact directory structure before spawning any sub-agent:

```
campaign/
├── week-01-bold/
│   ├── posts/
│   ├── stories/
│   └── infographics/
├── week-02-educate/
│   ├── posts/
│   ├── stories/
│   └── infographics/
├── week-03-shift/
│   ├── posts/
│   ├── stories/
│   └── infographics/
├── week-04-empower/
│   ├── posts/
│   ├── stories/
│   └── infographics/
└── blog/
```

---

## STEP 3 — EXECUTION ORDER

```
[1] Spawn SUB-AGENT 1 (marketing-social-media-strategist.md)         → wait for: CALENDAR DONE
[2] Spawn SUB-AGENT 2 (marketing-carousel-growth-engine.md)           → wait for: WEEK1 DONE
    Spawn SUB-AGENT 6 ( marketing-seo-specialist.md )             → run in parallel with Week writers
[3] After WEEK1 DONE → Spawn SUB-AGENT 3 (Week 2)
[4] After WEEK2 DONE → Spawn SUB-AGENT 4 (Week 3)
[5] After WEEK3 DONE → Spawn SUB-AGENT 5 (Week 4)
[6] After ALL DONE   → Spawn SUB-AGENT 7 (QA & Package)
[7] Move campaign/ to /mnt/user-data/outputs/campaign/
```

---

## SUB-AGENT 1 — marketing-social-media-strategist.md & marketing-growth-hacker.md

**Trigger:** After file structure is created
**Output:** `campaign/calendar.xlsx`

```
[INJECT CONTEXT BLOCK]

Read /mnt/skills/public/xlsx/SKILL.md before writing any code.

Build a complete 30-day content calendar saved as campaign/calendar.xlsx

COLUMNS:
Day | Date | Week | Theme | Platform | Content Type | Topic (Arabic) | Hook Line | Design Brief Summary | Image Prompt Summary | File Path | Status

DISTRIBUTION RULES:
- 30 rows minimum (some days = 2 rows for multi-platform)
- Carousels: 12 | Single Posts: 8 | Story Sequences: 12 | Infographics: 6 | Threads: 8 | Blog Articles: 12
- Blog articles: 3 per week, spread across all 4 weeks
- Every row must have a unique topic — zero repetition
- Week 1 topics: expose the consumer machine, Instagram & body image, $677B beauty industry
- Week 2 topics: research & data, influencer mechanisms, historical advertising patterns
- Week 3 topics: mindset shift, minimalism, daily aware routine, self-sufficiency
- Week 4 topics: empowerment, community, women entrepreneurs, dokanelbanat.com ecosystem

When done, print exactly: CALENDAR DONE
```

---

## SUB-AGENT 2 — marketing-content-creator.md & marketing-instagram-curator.md

**Trigger:** After CALENDAR DONE
**Output:** All files in `campaign/week-01-bold/`

```
[INJECT CONTEXT BLOCK]

WEEK 1 THEME: Bold & Provocative — Expose the machine. Challenge the system. Provoke.
DAYS: 1–7

Read campaign/calendar.xlsx → get exact topics assigned to Week 1.
Read /mnt/project/reset-your-mindset-core.md → use statistics and research.

For EACH content piece create a separate .md file using this EXACT template:

---
day:
date:
week: 1
theme: Bold & Provocative
platform: [Instagram / Facebook / Instagram+Facebook]
content_type: [Carousel / Single Post / Story Sequence / Infographic / Thread]
topic:
---

## 📝 ARABIC COPY

### Hook — السطر الأول:
[One punch line in Egyptian Arabic that stops the scroll]

### Body:
[Full caption or carousel slides copy — Egyptian Arabic — مصري عامي]
[For Carousel: label each slide → Slide 1: / Slide 2: / etc.]
[For Story Sequence: label each frame → Frame 1: / Frame 2: / etc.]

### CTA:
[Call to action in Egyptian Arabic]

---

## 🎨 DESIGN BRIEF

Layout: [describe composition and grid]
Mood: [describe the visual mood and energy]
Colors: [reference by CSS variable name — e.g. --color-primary for dominant color]
Typography: [which font for which element — Rubik/MarkaziText/Blabeloo]
Visual Metaphor: [the central visual idea or concept to illustrate]
Slide Breakdown: [if Carousel — what visual goes on each slide]

---

## 🖼️ IMAGE GENERATION PROMPT

[English only]
[Detailed prompt: style, composition, lighting, colors matching brand palette]
[No faces unless essential. No text inside the image.]
[End with one of: --style photorealistic | --style flat illustration | --style bold graphic]

---

FILE NAMING CONVENTION:
campaign/week-01-bold/posts/day-01-carousel.md
campaign/week-01-bold/posts/day-02-single.md
campaign/week-01-bold/stories/day-03-story-sequence.md
campaign/week-01-bold/infographics/day-04-infographic.md
campaign/week-01-bold/posts/day-05-thread.md

When all Week 1 files are created, print exactly: WEEK1 DONE
```

---

## SUB-AGENT 3 — WEEK 2 marketing-content-creator.md & marketing-instagram-curator.md

**Trigger:** After WEEK1 DONE
**Output:** All files in `campaign/week-02-educate/`

```
[INJECT CONTEXT BLOCK]

WEEK 2 THEME: Educate & Data — How the mechanism works. Research. Numbers. Real talk.
DAYS: 8–14

Read campaign/calendar.xlsx → get exact topics for Week 2.
Read /mnt/project/reset-your-mindset-core.md → use statistics, studies, footnoted sources.

Tone: Still bold but now more analytical. Data is the weapon.
Every post should have at least one concrete statistic from the core file.

Use EXACT same file template as SUB-AGENT 2.

FILE NAMING: campaign/week-02-educate/posts/day-08-[type].md ... day-14-[type].md

When all Week 2 files are created, print exactly: WEEK2 DONE
```

---

## SUB-AGENT 4 — WEEK 3 marketing-content-creator.md & marketing-instagram-curator.md

**Trigger:** After WEEK2 DONE
**Output:** All files in `campaign/week-03-shift/`

```
[INJECT CONTEXT BLOCK]

WEEK 3 THEME: Shift — The alternative mindset. The Reset begins. Bridge from problem to solution.
DAYS: 15–21

Read campaign/calendar.xlsx → get exact topics for Week 3.

Tone: Shifting here. Less provocative. More reflective, inviting, and warm.
The audience has been exposed to the problem — now show them the door out.
Reference the 4 pillars from Foundational-Description.md:
Self-Sufficiency / Conscious Awareness / Routine / Empowering Community

Use EXACT same file template as SUB-AGENT 2.

FILE NAMING: campaign/week-03-shift/posts/day-15-[type].md ... day-21-[type].md

When all Week 3 files are created, print exactly: WEEK3 DONE
```

---

## SUB-AGENT 5 — WEEK 4 marketing-content-creator.md & marketing-instagram-curator.md

**Trigger:** After WEEK3 DONE
**Output:** All files in `campaign/week-04-empower/`

```
[INJECT CONTEXT BLOCK]

WEEK 4 THEME: Empower — You are complete. Community. Real action. dokanelbanat.com as the destination.
DAYS: 22–30

Read campaign/calendar.xlsx → get exact topics for Week 4.

Tone: Fully warm, sisterhood energy, celebratory. CTAs point to dokanelbanat.com ecosystem.
The journey ends with the audience feeling seen, empowered, and invited to belong.

Use EXACT same file template as SUB-AGENT 2.

FILE NAMING: campaign/week-04-empower/posts/day-22-[type].md ... day-30-[type].md

When all Week 4 files are created, print exactly: WEEK4 DONE
```

---

## SUB-AGENT 6 — marketing-seo-specialist.md

**Trigger:** Run IN PARALLEL starting with SUB-AGENT 2
**Output:** 12 files in `campaign/blog/`

```
[INJECT CONTEXT BLOCK]

Read /mnt/project/reset-your-mindset-core.md fully — this is your primary source material.
All statistics, research references, and footnoted data must come from this file.

Write 12 blog articles in Markdown. Each article = one file.

ARTICLE ASSIGNMENTS:
01 → الاقتصاد بيكسب لما تحسي بالنقص — expose the full machine
02 → أرقام لا تصدق: حجم صناعة الجمال والإعلانات — data & statistics
03 → انستجرام وصورة الجسد — الأبحاث بتقول إيه؟ — research-backed
04 → من الهاوسوايف للسوبروومان — نفس الخدعة بشكل مختلف — historical analysis
05 → الإنفلونسر ماركتينج وآلية دفعك للشراء — mechanism breakdown
06 → الوعي كأداة تحرر — ليه المعرفة هي القوة الحقيقية — solution pivot
07 → Minimalism والجمال الحقيقي — lifestyle philosophy
08 → كيف تبني روتين يومي قائم على الوعي لا الاستهلاك — practical guide
09 → مجتمع النساء كقوة — لماذا لا أحد ينجح وحده — community pillar
10 → صاحبة المشروع الواعية — من الفكرة للبراند — entrepreneur focus
11 → Clean Marketing — التسويق النظيف والثقة الحقيقية — business education
12 → Reset Your Mindset — الدليل الكامل لإعادة ضبط العقلية — flagship pillar article

EACH FILE TEMPLATE:

```markdown
---
title:
slug:
date:
category:
tags: []
seo_title:
meta_description:
focus_keyword:
secondary_keywords: []
reading_time:
cover_image_prompt: [English AI image generation prompt for article cover — no text, no faces]
---

## المقدمة
[Hook paragraph — Egyptian Arabic — pulls the reader in immediately]

## [H2 Section]
[Body content — 800 to 1200 words total per article]
[Egyptian Arabic with English terms where natural]
[Use at least 2 statistics or research references from reset-your-mindset-core.md]

## خلاصة
[Closing paragraph + soft CTA toward dokanelbanat.com]
```

SEO KEYWORDS — distribute smartly across all 12 articles:
وعي الجمال، صورة الجسم، الاستهلاك والمرأة، تطوير الذات للمرأة، ريادة الأعمال النسائية،
بناء البراند، روتين يومي واعي، مجتمع نسائي عربي، Reset Mindset، Clean Beauty،
إعادة ضبط العقلية، صاحبة مشروع، دكان البنات

FILE NAMING:
campaign/blog/article-01-al-iqtisad-wel-nuqsan.md
campaign/blog/article-02-arqam-sinaat-el-gamal.md
campaign/blog/article-03-instagram-wel-gosm.md
... and so on with meaningful Arabic slugs

When all 12 articles are written, print exactly: BLOG DONE
```

---

## SUB-AGENT 7 — QA & FINAL PACKAGER

**Trigger:** After ALL of WEEK1 DONE + WEEK2 DONE + WEEK3 DONE + WEEK4 DONE + BLOG DONE
**Output:** Verified campaign + `campaign/README.md`

```
[INJECT CONTEXT BLOCK]

Run these verification checks:

CHECK 1 — FILE COUNT:
- Count .md files per week folder → must match calendar rows
- Count blog articles → must be exactly 12
- Verify calendar.xlsx exists and has 30+ rows

CHECK 2 — CONTENT QUALITY (sample 3 files per week):
- Has Arabic copy ✓
- Has Design Brief ✓
- Has Image Generation Prompt ✓
- No placeholder text like [ADD CONTENT HERE] or [TBD] ✓
- Hook line is punchy and in Egyptian Arabic ✓

CHECK 3 — FIX any missing sections found above

CHECK 4 — CREATE campaign/README.md with:
  - Campaign overview (one paragraph)
  - Narrative arc summary per week
  - Full file structure map
  - Publishing schedule summary (which day = which file)
  - Complete index of all Image Generation Prompts with file path reference
  - How to import calendar.xlsx to scheduling tools
  - How to publish blog articles to WordPress

When complete, print exactly: CAMPAIGN COMPLETE ✅
```

---

## FINAL STEP

After CAMPAIGN COMPLETE ✅ — move entire `campaign/` folder to:
```
/mnt/user-data/outputs/campaign/
```

---

> **Do not summarize. Do not ask for confirmation. Start executing from STEP 0 immediately.**
