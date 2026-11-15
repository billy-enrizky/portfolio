---
name: Geist editorial portfolio
description: Muhammad Enrizky Brillian's complete portfolio in a reference-led editorial system.
colors:
  paper: '#f1f1f1'
  surface: '#fafafa'
  ink: '#101010'
  muted: '#595959'
  rule: '#d6d6d6'
  dark-paper: '#101010'
  dark-surface: '#191919'
  dark-ink: '#f1f1f1'
  dark-muted: '#b4b4b4'
  dark-rule: '#373737'
  red-swatch: '#ec1839'
  red-light: '#c41635'
  red-dark: '#ff8297'
  red-soft-light: '#f0e2e0'
  red-soft-dark: '#291e22'
  orange-swatch: '#fa5b0f'
  orange-light: '#b83a1f'
  orange-dark: '#f08a67'
  orange-soft-light: '#efe5de'
  orange-soft-dark: '#271f1d'
  green-swatch: '#37b182'
  green-light: '#16754d'
  green-dark: '#60d5a7'
  green-soft-light: '#e2eae2'
  green-soft-dark: '#192624'
  blue-swatch: '#1854b4'
  blue-light: '#1854b4'
  blue-dark: '#8eb5ff'
  blue-soft-light: '#e2e7ea'
  blue-soft-dark: '#1e232c'
  pink-swatch: '#f021b2'
  pink-light: '#b31283'
  pink-dark: '#f88bd5'
  pink-soft-light: '#efe2e6'
  pink-soft-dark: '#281f28'
  tile-surface: '#fafafa'
  tile-edge: '#fff'
typography:
  display:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: clamp(7rem, 14.4vw, 15.5rem)
    fontWeight: 600
    lineHeight: 0.86
    letterSpacing: -0.04em
  headline:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: clamp(2.75rem, 6vw, 5.5rem)
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: -0.04em
  title:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.035em
  body:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
  button:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.01em
  navigation:
    fontFamily: Geist, 'Helvetica Neue', Arial, sans-serif
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.025em
  mono:
    fontFamily: '''JetBrains Mono'', monospace'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.7
  install:
    fontFamily: '''JetBrains Mono'', monospace'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.55
rounded:
  field: 12px
  popover: 16px
  image: 18px
  inline-image: 9px
  pill: 999px
spacing:
  inline-gap: 10px
  control-block: 12px
  control-inline: 20px
  mobile-gutter: 18px
  row: 24px
  record: 28px
  heading-bottom: 48px
  evidence-column: 64px
components:
  button-primary:
    backgroundColor: '{colors.orange-light}'
    textColor: '{colors.paper}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    padding: 12px 20px
  button-primary-hover:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    padding: 12px 20px
  input-search:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: 12px 16px
  nav-link:
    textColor: '{colors.muted}'
    typography: '{typography.navigation}'
    rounded: '{rounded.field}'
    padding: 6px 12px
  nav-link-current:
    backgroundColor: '{colors.orange-soft-light}'
    textColor: '{colors.orange-light}'
  filter-chip:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    rounded: '{rounded.pill}'
    padding: 10px 18px
  filter-chip-selected:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
  project-record:
    padding: 26px 0 0
  disclosure-summary:
    textColor: '{colors.orange-light}'
    padding: 17px 0
  install-pill:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    typography: '{typography.install}'
    rounded: '{rounded.pill}'
    padding: 9px 15px
---

# Design system: Geist editorial portfolio

## Overview

**Creative North Star: "Reference-led editorial portfolio"**

Oversized Geist identity text, a full-width header, rounded actions, and one sculptural OpenBrowser mark establish the reference-led editorial presentation. Neutral paper and ink frame a single selected accent. The visual reference supplies the composition and type language, not another author's identity, assets, contact details, or claims.

The complete portfolio remains a long document. Large section headings, flat record grids, searchable projects, and native disclosures keep the source evidence accessible. The hero introduces one real project artifact without a portrait, preview gallery, invented product scene, or summary metric strip.

**Key Characteristics:**
- Oversized two-line identity with the full name in accessible markup.
- Neutral light and dark themes with one independent selected accent.
- A fixed full-width header, right Sections drawer, and independent Appearance popover.
- Flat source-record grids and genuine project imagery.
- Optional movement with visible content before animation.

The observed sources are [the page](index.html), [base styles](css/style.css), [editorial overrides](css/editorial.css), [interaction code](js/script.js), and [appearance preferences](js/appearance.js). The page loads the base stylesheet before the editorial stylesheet. Later overrides define the active visual system; surviving base declarations still supply controls, accent variants, and technical evidence styles.

The frontmatter records actual authored values, not a proposed scale. Color variants are explicit, and component examples use the default Orange light theme. Runtime CSS variables select the active theme and accent. Responsive overrides below are part of the implementation. Shadows, motion, and breakpoints live in the sidecar's extensions.

## Colors

The active neutral palette is gray paper, near-black ink, and neutral supporting text. It is not the former warm-paper palette.

### Primary

Each of Red, Orange, Green, Blue, and Pink has an original swatch plus four authored variants: light and dark foregrounds, and light and dark washes. The frontmatter records these as `<color>-swatch`, `<color>-light`, `<color>-dark`, `<color>-soft-light`, and `<color>-soft-dark`. The washes are opaque fills, not extra category colors or a synthesized tonal ramp.

The selected accent colors links, disclosure summaries, dates, selection, focus outlines, the current navigation link, and primary actions. The current navigation row also uses the selected wash. Primary hover uses ink, not another accent.

**The Selected Accent Rule.** Use one selected accent across links, focus, dates, disclosures, and primary actions. Do not assign colors by project category.

### Neutral

- Paper is the page, header, and drawer background.
- Surface is the field, code, secondary-action, image-backplate, and popover background.
- Ink is primary text, selected controls, the Sections pill, and primary-action hover.
- Muted is supporting copy and metadata. Rule is the hairline separator and quiet control border.
- The OpenBrowser hero tile retains its literal light tile surface and white edge in either theme. Its grayscale image treatment does not follow the accent.

System and Orange remain the default preferences. Explicit themes override the OS. The early appearance script adds the root `js` detection class before stylesheets, validates stored strings, tolerates unavailable storage, reconciles delayed initialization, and synchronizes tabs. Initial HTML theme-color matches the light-paper token; runtime theme-color follows the resolved paper color. Without JavaScript, the neutral theme follows `prefers-color-scheme`; the appearance chooser remains hidden. These are implementation behaviors, not evidence that every color pairing has passed a browser contrast audit.

## Typography

Geist is the active display and body family, with Helvetica Neue, Arial, and sans-serif fallbacks. A local variable WOFF2 declares weights 100 through 900 with `font-display: swap`; its OFL license is shipped alongside it. Identity text uses weight 600. Most section, record, and action headings use weight 500. JetBrains Mono remains the local code face at weight 400.

The base stylesheet retains the original font declarations and files, but its Satoshi family is not the active page font. Do not infer the current type system from those declarations alone.

| Role | Observed use and overrides |
| :--- | :--- |
| Identity display | The frontmatter display role is the default. Each of Enrizky and Brillian occupies its own non-wrapping line. At 900px and below the size is `14vw`; at 700px and below it is `clamp(4rem,20vw,6.8rem)`, with line-height `0.9`. The full h1 also contains the visually hidden given name. |
| Hero message | `clamp(1.65rem,2.25vw,2.2rem)`, weight 500, line-height 1.12, tracking -0.035em, measure 16ch. At 700px and below it is 28px, line-height 1.1, measure 22ch. |
| Hero introduction | 17px with line-height 1.55 and measure 37ch. At 1100px and below it is 16px. At 700px and below it uses line-height 1.5 and measure 48ch. |
| Section headline | The frontmatter headline role has a 13ch measure. At 700px and below it uses `clamp(2.7rem,11vw,4.2rem)`, line-height 1.02, measure 16ch. Supporting section copy is 20px, then 18px at 900px, then 17px at 700px. |
| Role heading | `clamp(1.4rem,2.3vw,2rem)`, weight 500, line-height 1.12, tracking -0.03em, measure 25ch. It becomes 24px at 900px and 26px at 700px. This is an authored override, not a strictly descending scale. |
| Outcomes and technical copy | Outcome leads use 21px with line-height 1.45, then 20px at 900px. Supporting outcome text is 16px with line-height 1.65. Technical disclosure text is 15px with line-height 1.7. Technical paragraphs and ledger/fact lists have a 78ch maximum. Outcome blocks have a separate 70ch maximum. |
| Project title | The frontmatter title role describes ordinary records. They become 28px at 700px. The three full-width lead records use `clamp(2.4rem,5.6vw,5rem)` and become 38px at 700px. |
| Paper and education | Paper headings use `clamp(1.7rem,2.8vw,2.5rem)`, line-height 1.15, then 29px at 700px. Education headings are 28px with line-height 1.1. |
| Contact | The heading uses `clamp(3rem,7vw,7rem)`, then `clamp(2.9rem,12vw,4rem)` at 700px. The address uses `clamp(1.85rem,6.7vw,7.25rem)`, then `clamp(1.85rem,8.5vw,3.3rem)`, with line-height 1.08 and wrapping for long addresses. |
| Header and commands | Header identity and ordinary header controls are 14px; narrow-screen identity is 12px and controls 13px. The install command remains 12px at every breakpoint. The 12px evidence-code role retains line-height 1.7; the install pill inherits line-height 1.55. |

The tightest authored tracking in the current editorial layer is -0.04em. Body text has no negative tracking. Do not carry forward the earlier smaller mobile command, smaller actions, or tighter identity tracking.

## Layout

The main document has a maximum width of 1680px, centered with no left-index offset. Horizontal gutters are `clamp(20px,2.8vw,48px)`, replaced by 18px at 700px and below. The header spans the viewport independently of the main maximum width.

| Region | Default layout | Responsive implementation |
| :--- | :--- | :--- |
| Header | Fixed full width, 80px high, aligned with page gutters, 24px outer gap and 28px action gap. No bottom rule. | At 1100px action gap is 20px. At 900px desktop GitHub and CV links hide and action gap is 18px. At 700px header height is 76px, outer/action gaps are 12px, and the identity width uses `clamp(90px,calc(100vw - 215px),180px)`. |
| Sections | A right drawer below the header, `min(420px,100%)` wide, with 30px vertical padding and a left rule. | At 900px it is `min(380px,100%)` with 24px padding. It remains a drawer on desktop as well as mobile. |
| Appearance | A separate header disclosure; its panel is fixed below the header at `calc(var(--header-height) - 2px)`, right-aligned to the gutter. Width is `min(300px,calc(100vw - 36px))`; padding is 22px. | Placement is independent of the Sections drawer at every width. |
| Hero | Columns `minmax(0,1.65fr) minmax(280px,.85fr)`, gap `24px 5vw`, with identity and copy above one full-width artwork row. Padding is `32px 0 72px`. | At 1100px column gap is 32px. At 700px the order is identity, artwork, copy; row gap is 20px and padding is `24px 0 40px`. The hero has no fixed viewport height. |
| Artwork | A centered figure with 1200px perspective. The tile is 290px square with 62px corners. | At 1100px it is 260px square with 56px corners. At 700px it is 184px square with 40px corners, inside a 250px-high figure. Caption top gap becomes 16px instead of 28px. |
| Sections | Vertical padding is `clamp(60px,6.5vw,108px)`, with a top hairline. Heading rows have equal columns, 56px gap, and 48px bottom margin. | At 1100px the heading gap is 36px. At 700px section padding is 55px and the heading stacks with 32px bottom margin. |
| Role and paper rows | Columns `minmax(0,.85fr) minmax(0,1.15fr)`, gap 7vw, padding 38px vertically. Heading and metadata stay left; outcomes and disclosures stay right. The first-of-type base rule keeps the first row's top padding and border at zero. | At 1100px column gap is 42px. At 700px records become block layout with 28px vertical padding, subject to that first-row reset; outcomes begin 22px after the heading. |
| Work collection | Two columns, gap `52px 42px`, row flow rather than dense packing. OpenBrowser, Context Atlas, and the MTP study span both columns. The last visible odd project can also span both columns. | At 1100px the gap is `40px 30px`. At 700px records stack with a 36px gap. Search and filters remain before every project record. |
| Expanded project evidence | OpenBrowser and MTP native disclosures become two equal `minmax(0,1fr)` columns only when open, with a 48px column gap and a summary spanning both columns. | At 900px and below they return to block layout. Paragraphs and ledger/fact lists inside disclosures have a 78ch maximum. |
| Other record grids | Education gap is `40px 64px`; credentials have a 64px column gap. Campus service uses three columns within its full-width record. | Tools, education, credentials, projects, and campus service stack at 700px. |

Only document scroll padding clears the fixed header, using `calc(var(--header-height) + 24px)`. Do not add a second section offset. Original sections remain direct children of `main`, as required by active-section and deep-link code.

**The Single Artifact Rule.** The hero uses one genuine OpenBrowser mark. Keep the complete work collection under Find a project; do not turn the hero into a gallery.

JavaScript detection runs in the head bootstrap, before the deferred interaction script. This prevents the disabled-JavaScript in-flow index from flashing during startup. The interaction script adds `navigation-ready` after its handlers bind; `.js:not(.navigation-ready)` keeps the unbound Sections button invisible. Appearance uses its own `appearance-ready` signal after preference handlers bind. With `js` present, `.site-header .appearance-controls` is `display: block` and `visibility: hidden` until that signal makes it visible. This preserves its header space during startup without exposing unbound controls. Without JavaScript, Appearance is `display: none`, not an invisible reserved slot. These readiness classes do not gate the source record text or change the settled layout.

Without JavaScript, neither readiness signal is added, the header is static, Sections is an in-flow index, and main loses its header top padding. The index uses four columns, or two at 700px. The fixed-header clearance variable remains a document CSS setting; no-JavaScript mode does not implement a separate anchor-offset calculation.

## Elevation & Depth

The reading document is flat and rule-separated. Elevation is limited to the independent Appearance panel and the single hero project tile. This is not a shadow-free system and not a grid of elevated cards. The exact two-part tile shadows, mobile shadow, and popover shadow are recorded in the sidecar.

The tile rests at `rotateY(-13deg) rotateZ(-7deg)` and changes to `rotateY(-5deg) rotateZ(-3deg) translateY(-8px)` on hover or visible focus. This is a CSS state transition, not continuous cursor-following or a WebGL scene. The drawer backdrop is `rgba(0,0,0,.3)`. Layer order is backdrop 30, drawer 40, header with its popover 50, and focused skip link 60.

**The Visible By Default Rule, revised.** Content is visible whenever motion is off, and motion can never keep it hidden. Under `motion-on`, a record starts at opacity 0 with a short rise and is revealed as it nears the viewport. It is never hidden again, and a deep link, hash navigation, or keyboard focus reveals the target and its ancestors immediately, with no delay. A 3-second failsafe removes `motion-on` if the motion module does not run, and the static page has no hidden content.

Masked heading lines rise 108 percent over 820 ms with `cubic-bezier(.172,.687,.393,.943)`, inside a clip padded `.12em` above and `.16em` below so descenders stay whole. Reveals take 640 ms (520 ms at 700 px and narrower), 70 ms between elements revealed in the same 120 ms batch, in document order, capped at 800 ms. A navigation or focus target skips the transition and shows at once.

The contact heading is revealed with the other masked headings. There is no GSAP or ScrollTrigger in the page. Scroll-linked effects run from one passive scroll listener batched through `requestAnimationFrame`: the page progress bar, the career route stroke, and the hero sprite frame. The hero frame is `round(clamp(scrollY / heroHeight, 0, 1) * 23)`. They do not pin or extend scrolling. The listeners are attached once at start; the work is skipped unless `motion-on` is set. The career route is drawn in the page margin left of the role titles, not over them.

Reduced motion, a stored pause and `noanim` all remove `motion-on`, so the sprite is not requested and the original static tile is shown. Only the system reduced-motion setting also fixes that tile at `rotate(-5deg)` with no transition (`css/editorial.css:160`). With a stored pause or `noanim` on a system that allows motion, the tile keeps its editorial resting tilt and hover transform. The base stylesheet reduces other transition and animation durations. Native content and controls do not depend on JavaScript motion. Project-image hover still has its inherited 2px lift rules; do not claim a universal removal of every hover transform without checking the full cascade. Project cards also lift 4px on hover only where a fine pointer exists.

## Shapes

Actions and category/skill controls are pills. Fields use the field radius, and the separate Appearance panel uses the popover radius. Project image frames use the image radius; inline project marks have their own smaller corners. Records themselves are unfilled, top-ruled blocks, not rounded card shells.

The hero tile has its component-specific responsive corners and a 1px white edge. Its image occupies 85% of the tile in both dimensions, with `object-fit: cover` and `grayscale(1) contrast(1.35)`. Ordinary project images use containment. Do not generalize the hero's crop or image treatment to the archive.

## Components

### Buttons

Primary actions use the selected accent with paper text. Hover switches to ink with paper text. Secondary actions use surface fill, ink text, and surface-colored borders; hover changes their border to ink. The Sections control uses ink fill with paper text.

Standard action pills have a 48px minimum height and the frontmatter's button padding. At 700px they use a 44px minimum and `11px 18px` padding. Hero buttons retain the more-specific `11px 16px` compact override below 1100px. Action text remains 14px on phones. Sections and Appearance controls use 42px minimum heights at 700px, not a universal 44px floor.

Buttons translate down 1px while active. Under `motion-on` that press becomes `scale(.96)` over 180 ms. Ordinary button transforms transition over 0.2 seconds. Under `motion-on` the current section link in the Sections drawer is indented 20px over 240 ms; `aria-current=location` still marks it without motion. The global focus outline is 3px in the selected accent with 5px offset. Native appearance inputs draw their own span/swatch focus indicators with their authored offsets.

### Chips

Skill tabs and project category filters are outlined pills with 44px minimum height, `10px 18px` padding, and 14px text. At 700px they use `9px 14px` padding and 13px text. Selected controls use ink fill and paper text. Keep `aria-selected` for tabs and `aria-pressed` for filters; color is not their only state signal.

### Cards / Containers

Each project retains its own purpose, outcome, technical disclosure, links, and real imagery. Ordinary project images are 240px high, or 230px at 700px. The Context Atlas figure uses `clamp(240px,33vw,470px)` with 20px padding; at 700px it uses 220px height and 12px padding. The three full-width lead records retain their larger typography without a duplicate preview collection.

Native disclosure summaries use the accent, 14px text, and 17px vertical padding. Credential group summaries are larger, 21px at weight 400, reducing to 20px at 700px. Tables, code blocks, semantic result lists, and their units stay within the record that supports them. Expanded OpenBrowser and MTP disclosures separate technical copy and visual evidence into the two-column layout recorded above; this is a disclosure layout, not a new project or a merged evidence record.

### Inputs / Fields

Project search and role selection use surface fill, a 1px muted border, the field radius, 50px minimum height, `12px 16px` padding, and 15px text. Search is named by the visible Find a project heading. The clear button is a pill with 50px minimum height, reducing to 44px at 700px. It resets both the query and category and returns focus to search.

### Navigation

The header remains full width at every depth. Sections toggles the same right drawer at every screen size and exposes its state through `aria-expanded`. Drawer links use the navigation type role and a 47px minimum height. Current location uses accent text, its matching wash, and `aria-current="location"`; hover uses the surface background.

Opening the drawer closes Appearance. Opening Appearance closes the drawer. The drawer focuses the first section link once it is fully visible. Escape and backdrop dismissal restore the Sections button's focus. Moving focus outside dismisses it without a focus trap. Instant anchor navigation closes the drawer, opens containing disclosures, resets project filters when needed, and focuses the destination heading without a second scroll.

Appearance stays outside `main`, so Show all details does not open it. Its native radio groups retain System/Light/Dark and the five accents. Theme options and color targets are 44px high; swatches are 24px circles. Outside click or focus dismisses the popover. Escape restores its summary's focus. Its open state is not persisted.

### Source disclosures and skill panels

Use native disclosures for role detail, coursework, research methods, project implementations, and credential groups. Show all details and Hide extra details target the main-content disclosures together. Skill tabs use Left/Right arrows, Home, End, and roving tab stops. All skill panels remain readable without JavaScript. Search, filters, role jump, skill tabs, and show-all are progressive enhancements rather than prerequisites for reading the source record.

## Do's and Don'ts

### Do:
- **Do** use the active Geist and neutral-theme overrides from the editorial stylesheet.
- **Do** preserve all original records, source links, asset bytes, and meaningful anchors.
- **Do** keep Sections and Appearance independently reachable in the header.
- **Do** retain the one genuine OpenBrowser hero mark and actual project imagery.
- **Do** keep native disclosures, keyboard controls, visible focus, and no-JavaScript reading.
- **Do** treat responsive values as component-specific overrides rather than a single proportional scale.

### Don't:
- **Don't** restore the old fixed left index, compact identity type, or typography-only hero.
- **Don't** add a portrait, borrowed reference artwork, fabricated product scenes, or a preview carousel.
- **Don't** remove evidence or merge unrelated projects to shorten the page.
- **Don't** add category palettes, repeated elevated card shells, or invented tonal ramps.
- **Don't** leave any content hidden when motion is off, pin scrolling, or add cursor-tracking behavior that the implementation does not have.
- **Don't** present this source-derived specification as browser or accessibility certification.
