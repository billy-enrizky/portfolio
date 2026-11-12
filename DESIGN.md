---
name: "The Evidence Ledger"
description: "Muhammad Enrizky Brillian's complete, navigable portfolio."
colors:
  paper: "#f4f4ef"
  surface: "#fbfbf7"
  ink: "#111315"
  muted: "#5d6568"
  rule: "#d6d8d1"
  accent: "#b83a1f"
  accent-soft: "#b83a1f12"
  dark-paper: "#111315"
  dark-surface: "#1b1f20"
  dark-ink: "#f2f1ea"
  dark-muted: "#b2b9b7"
  dark-rule: "#383e3c"
  dark-accent: "#f08a67"
  dark-accent-soft: "#f08a6717"
typography:
  display:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2rem, 3.55vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.8rem, 2.7vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.65
  button:
    fontFamily: "Satoshi, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.3
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  control: "4px"
spacing:
  compact: "8px"
  control: "12px"
  record: "20px"
  grid: "24px"
  group: "28px"
  section: "54px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  nav-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  nav-link-current:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  filter-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  project-record:
    padding: "20px 0 0"
  disclosure-summary:
    textColor: "{colors.accent}"
    padding: "15px 0"
---

# Design System: The Evidence Ledger

## Overview

**Creative North Star: "The Evidence Ledger"**

Every major element states a claim, proves a claim, or helps inspect the proof. The established paper-and-ink palette, Satoshi typography, single rust accent, and hairline rules remain the identity. A typography-only introduction and actual project images bring the work into view without invented product scenes.

The complete record stays long. A persistent index and native controls make it easy to enter at any depth. Plain-language purpose and supported outcomes lead; full technical evidence stays available in disclosures. Motion supports orientation and hierarchy without pinning or adding forced scroll distance.

**Key Characteristics:**
- Calm paper-and-ink surfaces with one rust accent.
- Flat, rule-separated records rather than elevated card shells.
- Persistent navigation and complete, progressively disclosed evidence.
- Real project imagery, direct search, and restrained text motion.

Observed sources: [stylesheet](css/style.css), [page](index.html), and [behavior](js/script.js). The frontmatter records implemented tokens, not a replacement identity. Light values are the default; `prefers-color-scheme: dark` swaps all seven semantic color properties to their `dark-` counterparts. Breakpoints, motion, and component snippets are sidecar extensions rather than unsupported frontmatter groups.

## Colors

Warm paper, near-black ink, steel supporting text, and a restrained rust accent organize evidence in both system themes.

### Primary
- **Rust**, `accent`: links, disclosure summaries, dates, the current section, selection, and focus outlines. The primary button is ink-filled at rest and rust-filled on hover.
- **Rust wash**, `accent-soft`: the current navigation row's translucent background, not an additional accent hue.

### Neutral
- **Paper**, `paper`: page and persistent navigation background.
- **Surface**, `surface`: fields, image backplates, code blocks, and quiet hover surfaces.
- **Ink**, `ink`: headings, primary text, selected controls, and primary button fill.
- **Steel**, `muted`: supporting copy, descriptions, and metadata.
- **Rule**, `rule`: hairline separators and control borders.

The dark palette preserves these roles across the entire page. There are no independently themed sections, synthetic tonal ramps, or manual theme switch.

**The One Accent Rule.** Use the existing rust role for emphasis and interaction; do not introduce category-specific palettes.

## Typography

**Display Font:** Satoshi, with Helvetica Neue, Arial, and sans-serif fallbacks.
**Body Font:** The same Satoshi stack.
**Label/Mono Font:** Satoshi for interface labels; JetBrains Mono with a monospace fallback for code.

Locally hosted Satoshi files supply weights 400, 500, and 700. The local JetBrains Mono file supplies weight 400. Do not describe these files as a variable-font setup or assume an additional mono weight is loaded.

### Hierarchy
- **Display:** The frontmatter's compact hero scale, balanced text, and a desktop measure of 17ch. At 901px to 1100px the hero is 40px; at 900px and below it uses `clamp(2rem, 5vw, 3rem)`; at 700px and below, `clamp(1.9rem, 6.7vw, 2.5rem)`; at 360px and below, 28px. Keep the introduction compact and the actions visible.
- **Headline:** Section headings use the headline role. The contact heading uses `clamp(2rem, 3.5vw, 3rem)` with a 20ch measure.
- **Title:** Project and role headings use the title role, with contextual overrides for papers, education, and narrow screens.
- **Body:** The base role is 16px with 1.65 line-height. Role outcome leads are 18px, weight 500, reducing to 17px at 700px and below; supporting outcome paragraphs are 15px with 1.7 line-height. Technical disclosure copy is 14px with 1.75 line-height.
- **Measure:** Hero introduction 52ch, skill panels 72ch, outcome blocks 76ch. Do not impose the superseded single 64ch measure on every content type.
- **Labels and code:** Field labels use the label role. Navigation and filters use 14px text; metadata spans 12px to 14px. Code uses the mono role. There are no skill percentages or decorative metric labels.

## Layout

- The fixed desktop index is 234px wide. Main content is offset by that width, has 40px horizontal gutters, and a maximum width of 1450px. The index may scroll independently when needed; the main reading surface remains in normal document flow.
- At 1600px and above, index width becomes 260px and gutters 56px. Between 901px and 1100px, they are 202px and 28px.
- At 900px and below, a fixed 64px mobile header replaces the visible desktop index. **Sections** opens the same index as a drawer, up to `min(320px, 86vw)` wide. Main content loses its left offset; gutters are 26px. At 700px and below, gutters are 18px.
- Only `html` scroll-padding handles anchor clearance: 28px on desktop and 82px on mobile, clearing the fixed header. Individual section, record, and hash-anchor scroll margins stay at 0; do not add a second offset and create a double gap. Keep section and record links meaningful after navigation changes.
- The hero contains only the heading, introduction, and actions, with no author photograph. The existing favicon is retained; author-image social metadata and preload references are absent. Genuine project images remain in the work collection and use containment rather than invented replacement artwork.
- Sections use 54px vertical padding, reducing to 42px below the navigation breakpoint. Rules, headings, and compact record spacing create hierarchy instead of giant empty sections.
- Education, credentials, tools, and projects use two columns before collapsing to one at 700px. Project flow is dense; the final visible project spans both columns when a filter leaves an odd count.
- The work collection starts with **Find a project**, using the standard h2 size and the search input’s accessible name. There is no separate My work introduction, preview gallery, or Previous/Next control. All project records remain below search and filters. Code overflow is local, not horizontal page scrolling.
- Without JavaScript, all project records remain available, all skill panels are shown, and mobile section navigation becomes an in-flow list. Enhanced search, filter, jump, tab, and show-all controls are hidden; native disclosures still work.

**The Complete Record Rule.** Improve entry points and disclosure, not by deleting historical work or turning the page into a short selection.

## Elevation & Depth

There are no box shadows in the current stylesheet. Depth comes from paper/surface contrast, hairline rules, image backplates, and state changes. The mobile backdrop is `rgba(17,19,21,.4)`. Layer order is index 20, backdrop 30, drawer 40, mobile header 50, and focused skip link 60. Do not restore the obsolete neutral shadow or add floating card shells.

## Shapes

Controls and image frames share the implemented control radius. Records are flat, top-ruled blocks, not rounded containers. Borders are 1px. Application and project images remain contained; there is no hero image frame. Preserve native disclosure markers and recognizable search, select, tab, and button affordances.

## Components

### Buttons
Compact, direct actions. **View my work**, **Download CV**, and **Contact** use the existing primary/secondary variants. Desktop actions have a 46px minimum height; at 700px and below they use 44px, 13px text, and `11px 14px` padding. Primary hover switches ink fill to rust; secondary hover adds the surface fill. Button transitions are 0.2s ease; active state moves down 1px.

### Chips
Category filters and skill tabs are outlined rectangular controls, not pills. They use a 42px minimum height. Selected filters use `aria-pressed`; selected tabs use `aria-selected`. Both receive ink fill and paper text. Keep the source category names.

### Cards / Containers
Each work record keeps its own title, purpose, supported outcome, links, and **How I built it** disclosure. Work plates, benchmark tables, research entries, the full experience ledger, independent capability areas, and issuer-grouped credentials remain distinct evidence patterns. Finance data engineering stays separate from model-serving infrastructure. Retain all prior technical copy and source links inside the record.

Project images lift 2px on record hover over 0.45s. These are small image interactions, not card elevation or automatic playback.

### Inputs / Fields
Search and the role-jump select use the surface background, rule border, shared radius, 46px minimum height, and `10px 12px` padding. Search is labeled by the visible Find a project h2 heading and has a purpose/tool placeholder, clear action, polite live result count, and empty-state message. Search matches every entered word against the full project text, including disclosure content, within the selected category. Clear search resets both the query and category.

### Navigation
The section order is Summary, Skills, Experience, Education, Research, My work, Credentials, Contact. Desktop rows have a 42px minimum height, muted default text, surface hover, and rust current state with a soft wash and `aria-current="location"`.

The mobile control changes from **Sections** to **Close** and maintains `aria-expanded`. After the opening transition finishes, focus moves to the first section link with `preventScroll`, provided the menu is still open. Escape or the backdrop closes it and restores control focus. Moving focus outside the open drawer closes it rather than trapping focus. The skip link remains available.

Persistent section links jump directly with `behavior: "instant"`, rather than animating through the whole long page. Document scrolling defaults to `auto`. This avoids navigation timing races and keeps distant sections immediately reachable. Choosing an anchor closes the menu and focuses the target's first heading, or the target itself when no heading exists, without a second scroll. The role select uses the same direct hash navigation. Hash navigation opens containing disclosures and clears project filters if they hide the target.

### Disclosures and skill panels
Use native `details`/`summary` for full role details, research methods, coursework, project implementations, and issuer groups. **Show all details** opens every main-content disclosure; **Hide extra details** closes them. Neither action deletes records or clears project filters. Preserve exact formal credential names, even when their wording is more technical than surrounding copy.

Skill tabs expose one area at a time with roving tab stops, Left/Right arrows, Home, and End. All panels are readable without JavaScript. Do not recast independent skills as a fabricated unified architecture.

### Focus and motion
The shared focus treatment is a 3px accent outline with a 4px offset. Keep visible focus on links, controls, summaries, and tabs.

Locally hosted GSAP and ScrollTrigger animate the contact heading without pinning. The removed gallery has no observers, event handlers, or motion targets. Contact words scrub from opacity 0.65 to 1 with 0.06 stagger, between `top 90%` and `top 58%`. No animated content starts fully hidden. Disclosures, filters, and tabs refresh ScrollTrigger after layout changes. There is no author-image animation.

Reduced motion excludes or reverts the GSAP animations through the system preference, removes image transforms, and keeps document navigation is instant in either motion mode. Contact text is restored when the motion context is cleaned up. `?noanim` skips GSAP only, useful for repeatable inspection. Core reading and navigation do not depend on the animation libraries. There is no typewriter, marquee, perpetual animation, scroll hijack, pinned sequence, or automatic carousel.

**The Evidence First Rule.** Lead with plain purpose and source-backed outcomes; keep the complete methods, qualifications, units, and links available underneath.

## Do's and Don'ts

### Do:
- **Do** preserve the established paper, ink, steel, rust, and Satoshi identity across both system themes.
- **Do** keep persistent section access, direct record links, and the complete long-form record.
- **Do** put plain purpose and supported outcomes before full technical evidence.
- **Do** keep the hero typography-only, retain the existing favicon, and use actual images within project records.
- **Do** preserve visible focus, native disclosures, keyboard skill tabs, and no-JavaScript reading.
- **Do** respect reduced motion and keep animation independent of content access.

### Don't:
- **Don't** add category palettes, elevated card shells, or fabricated tonal scales.
- **Don't** replace the lifetime portfolio with selected work or restore the removed summary metric strip.
- **Don't** invent business outcomes, client identities, testimonials, product screenshots, or a combined architecture for unrelated projects.
- **Don't** rename formal credentials or relabel course papers as conference publications.
- **Don't** turn projected savings into realized savings, accuracy into patient benefit, or efficiency into time reduction.
- **Don't** add pinned scrolling, automatic carousels, or decorative animation that obstructs navigation.
