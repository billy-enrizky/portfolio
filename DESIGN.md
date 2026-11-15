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

Oversized Geist identity text, a full-width header, rounded actions, and one sculptural OpenBrowser scene define the editorial presentation. Neutral paper and ink frame a single selected accent. Visual references guide composition, timing, and depth, not identity, assets, contact details, or claims.

The complete portfolio remains a long document. Large section headings, flat record grids, searchable projects, and native disclosures keep the source evidence accessible. The hero illustrates one real project with an original local model and the existing mark as its poster. It adds no portrait, preview gallery, fabricated screen, or summary metric strip.

**Key Characteristics:**
- Oversized two-line identity with the full name in accessible markup.
- Neutral light and dark themes with one independent selected accent.
- A fixed full-width header, right Sections drawer, and independent Appearance popover.
- Flat source-record grids and genuine project imagery.
- Optional live 3D and DOM motion, with readable content and an original-image fallback.

The observed sources are [the page](index.html), [base styles](css/style.css), [editorial overrides](css/editorial.css), and [motion overrides](css/motion.css). Behavior comes from [navigation and content controls](js/script.js), [appearance preferences](js/appearance.js), [motion policy](js/motion.js), and [the scene renderer](js/motion-scene.js).

CSS loads in this order: base, editorial, motion. The last layer owns the scene rectangle, poster, motion controls, and short-screen overrides. Surviving base and editorial declarations still supply the record layouts, controls, accent variants, and technical evidence styles.

Appearance bootstraps in the head before CSS. Deferred scripts load GSAP, ScrollTrigger, the content controller, then the motion controller. The motion controller imports the optional local scene bundle only when eligible. That module fetches the local model. Neither resource blocks the reading document. Cinetic and motion-recreation inform motion direction only, with no borrowed code or unlicensed media.

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
- The OpenBrowser poster retains its literal light surface and white edge in either theme. Its grayscale image treatment does not follow the accent.
- The transparent 3D canvas uses the current accent on its Accent material. Its Ceramic material changes with the resolved theme. A root-attribute observer updates the existing scene rather than importing another copy.

System and Orange remain the default preferences. Explicit themes override the OS. The early appearance script adds the root `js` detection class before stylesheets, validates stored strings, tolerates unavailable storage, reconciles delayed initialization, and synchronizes tabs. Initial HTML theme-color matches the light-paper token. Runtime theme-color follows the resolved paper color. Without JavaScript, the neutral theme follows `prefers-color-scheme`. The appearance chooser remains hidden. These implementation behaviors do not establish a browser contrast-audit result for every color pairing.

## Typography

Geist is the active display and body family, with Helvetica Neue, Arial, and sans-serif fallbacks. A local variable WOFF2 declares weights 100 through 900 with `font-display: swap`. The repository includes its OFL license. Identity text uses weight 600. Most section, record, and action headings use weight 500. JetBrains Mono remains the local code face at weight 400.

The base stylesheet retains the original font declarations and files, but its Satoshi family is not the active page font. Do not infer the current type system from those declarations alone.

| Role | Observed use and overrides |
| :--- | :--- |
| Identity display | The frontmatter display role is the default. Each name line remains non-wrapping. At 900px and below the size is `14vw`. At 700px and below it is `clamp(4rem,20vw,6.8rem)`, with line-height `0.9`. Short phones use 56px and line-height `0.94`. Short wide screens use `clamp(70px,10vw,100px)`. The full h1 retains the visually hidden given name. |
| Hero message | `clamp(1.65rem,2.25vw,2.2rem)`, weight 500, line-height 1.12, tracking -0.035em, measure 16ch. At 700px and below it is 28px, line-height 1.1, measure 22ch. Both short-screen rules below reduce the size to 26px. |
| Hero introduction | 17px with line-height 1.55 and measure 37ch. At 1100px and below it is 16px. At 700px and below it uses line-height 1.5 and measure 48ch. |
| Section headline | The frontmatter headline role has a 13ch measure. At 700px and below it uses `clamp(2.7rem,11vw,4.2rem)`, line-height 1.02, measure 16ch. Supporting section copy is 20px, then 18px at 900px, then 17px at 700px. |
| Role heading | `clamp(1.4rem,2.3vw,2rem)`, weight 500, line-height 1.12, tracking -0.03em, measure 25ch. It becomes 24px at 900px and 26px at 700px. This is an authored override, not a strictly descending scale. |
| Outcomes and technical copy | Outcome leads use 21px with line-height 1.45, then 20px at 900px. Supporting outcome text is 16px with line-height 1.65. Technical disclosure text is 15px with line-height 1.7. Technical paragraphs and ledger/fact lists have a 78ch maximum. Outcome blocks have a separate 70ch maximum. |
| Project title | The frontmatter title role describes ordinary records. They become 28px at 700px. The three full-width lead records use `clamp(2.4rem,5.6vw,5rem)` and become 38px at 700px. |
| Paper and education | Paper headings use `clamp(1.7rem,2.8vw,2.5rem)`, line-height 1.15, then 29px at 700px. Education headings are 28px with line-height 1.1. |
| Contact | The heading uses `clamp(3rem,7vw,7rem)`, then `clamp(2.9rem,12vw,4rem)` at 700px. The address uses `clamp(1.85rem,6.7vw,7.25rem)`, then `clamp(1.85rem,8.5vw,3.3rem)`, with line-height 1.08 and wrapping for long addresses. |
| Header and commands | Header identity and ordinary header controls are 14px. Narrow-screen identity is 12px and controls 13px. The install command remains 12px at every breakpoint. The 12px evidence-code role retains line-height 1.7. The install pill inherits line-height 1.55. |

The tightest authored tracking in the current editorial layer is -0.04em. Body text has no negative tracking. The hero command hides on phones and short wide screens, but its source and project-detail version remain available. Do not introduce smaller action text or tighter identity tracking.

## Layout

The main document has a maximum width of 1680px, centered with no left-index offset. Horizontal gutters are `clamp(20px,2.8vw,48px)`, replaced by 18px at 700px and below. The header spans the viewport independently of the main maximum width.

| Region | Default layout | Responsive implementation |
| :--- | :--- | :--- |
| Header | Fixed full width, 80px high, aligned with page gutters, 24px outer gap and 28px action gap. No bottom rule. | At 1100px action gap is 20px. At 900px desktop GitHub and CV links hide and action gap is 18px. At 700px header height is 76px, outer/action gaps are 12px, and identity width uses `clamp(90px,calc(100vw - 215px),180px)`. Both short-screen rules below set header height to 68px. |
| Sections | A right drawer below the header, `min(420px,100%)` wide, with 30px vertical padding and a left rule. | At 900px it is `min(380px,100%)` with 24px padding. It remains a drawer on desktop as well as mobile. |
| Appearance | A separate header disclosure. Its panel sits fixed below the header at `calc(var(--header-height) - 2px)`, right-aligned to the gutter. Width is `min(300px,calc(100vw - 36px))`. Padding is 22px. | At every width, maximum height is `calc(100dvh - var(--header-height) - 16px)`. The panel uses `overflow-y:auto` and `overscroll-behavior:contain`, keeping controls reachable in short landscape views. Placement remains independent of Sections. |
| Hero | Columns `minmax(0,1.65fr) minmax(280px,.85fr)`, gap `24px 5vw`, with identity and copy above one full-width artwork row. Padding is `32px 0 72px`. | At 1100px column gap is 32px. At 700px the order is identity, artwork, copy. Row gap is 20px and padding is `24px 0 40px`. The hero has no fixed viewport height. |
| Artwork | The untransformed link reserves `min(100%,680px)` width and 360px height, with 16px corners. The poster is 268px square with 58px corners. The figure uses no perspective. Caption gap is 16px, with 18px top margin and 44px minimum height. | At 700px the link is full width and 210px high inside a 270px-high figure. The poster is 174px square with 38px corners. Caption gap is 12px, top margin is 16px, text is 13px, and the caption does not wrap. The hero command hides. |
| Sections | Vertical padding is `clamp(60px,6.5vw,108px)`, with a top hairline. Heading rows have equal columns, 56px gap, and 48px bottom margin. | At 1100px the heading gap is 36px. At 700px section padding is 55px and the heading stacks with 32px bottom margin. |
| Role and paper rows | Columns `minmax(0,.85fr) minmax(0,1.15fr)`, gap 7vw, padding 38px vertically. Heading and metadata stay left. Outcomes and disclosures stay right. The first-of-type base rule keeps the first row's top padding and border at zero. | At 1100px column gap is 42px. At 700px records become block layout with 28px vertical padding, subject to that first-row reset. Outcomes start 22px after the heading. |
| Work collection | Two columns, gap `52px 42px`, row flow rather than dense packing. OpenBrowser, Context Atlas, and the MTP study span both columns. The last visible odd project can also span both columns. | At 1100px the gap is `40px 30px`. At 700px records stack with a 36px gap. Search and filters remain before every project record. |
| Expanded project evidence | OpenBrowser and MTP native disclosures become two equal `minmax(0,1fr)` columns only when open, with a 48px column gap and a summary spanning both columns. | At 900px and below they return to block layout. Paragraphs and ledger/fact lists inside disclosures have a 78ch maximum. |
| Other record grids | Education gap is `40px 64px`. Credentials have a 64px column gap. Campus service uses three columns within its full-width record. | Tools, education, credentials, projects, and campus service stack at 700px. |

Motion overrides also respond to height. These rules apply after the width rules:

| Condition | Active overrides |
| :--- | :--- |
| Width at most 700px and height at most 740px | Header 68px. Hero top padding 16px and row gap 16px. Identity 56px with line-height 0.94. Artwork height/min-height 170px. Scene height 120px. Poster 106px square with 24px corners. Caption top margin 6px. Hero message 26px. Introduction top margin 12px. Action top margin 16px. |
| Width at least 701px and height at most 500px | Header 68px. Hero columns `minmax(0,1.25fr) minmax(280px,1fr)`, areas `'name copy' 'art copy'`, gap `16px 32px`, top/bottom padding `22px`/`40px`. Identity `clamp(70px,10vw,100px)`. Scene height 150px. Poster 130px square with 28px corners. Caption top margin 6px, gap 12px, text 13px, no wrapping. Hero command hides. Hero message 26px. |

These authored responsive rules do not establish physical-device performance.

Only document scroll padding clears the fixed header, using `calc(var(--header-height) + 24px)`. Do not add a second section offset. Original sections remain direct children of `main`, as required by active-section and deep-link code.

**The Single Artifact Rule.** The hero uses one genuine OpenBrowser mark. Keep the complete work collection under Find a project. Do not turn the hero into a gallery.

JavaScript detection runs in the head bootstrap, before the deferred interaction script. This prevents the disabled-JavaScript in-flow index from flashing during startup. The interaction script adds `navigation-ready` after its handlers bind. `.js:not(.navigation-ready)` keeps the unbound Sections button invisible. Appearance uses its own `appearance-ready` signal after preference handlers bind. With `js` present, `.site-header .appearance-controls` is `display: block` and `visibility: hidden` until that signal makes it visible. This preserves its header space during startup without exposing unbound controls. Without JavaScript, Appearance is `display: none`, not an invisible reserved slot. These readiness classes do not gate the source record text or change the settled layout.

Without JavaScript, neither readiness signal applies. The header is static, Sections is an in-flow index, and main loses its header top padding. The index uses four columns, or two at 700px. The fixed-header clearance variable remains a document CSS setting. No-JavaScript mode does not implement a separate anchor-offset calculation.

## Elevation & Depth

The reading document is flat and rule-separated. Elevation belongs to the independent Appearance panel, the fallback poster, and the locally lit 3D illustration. Records are not elevated cards. The sidecar retains the authored poster and popover shadows.

The link owns a stable, transparent scene rectangle. It has no outer tilt, border, shadow, or transform transition, including hover and focus. The poster child owns the former ceramic plate and its perspective. Its resting transform is `perspective(1200px) rotateY(-13deg) rotateZ(-7deg)`. Only active, unreduced motion permits its hover/focus transform: `rotateY(-5deg) rotateZ(-3deg) translateY(-6px)` under the same perspective. That transition lasts 0.6 seconds with `cubic-bezier(.16,1,.3,1)`. A ready canvas hides the poster. Paused and reduced states retain a static poster pose rather than the old reduced-motion angle.

The drawer backdrop is `rgba(0,0,0,.3)`. Layer order remains backdrop 30, drawer 40, header with its popover 50, and focused skip link 60.

**The Visible By Default Rule.** Keep prose fully opaque and readable before motion starts. Settle owned transforms and remove name masks when motion stops or focus/navigation enters a target.

### DOM arrivals

The motion controller is the sole animation owner. The content controller no longer runs the old hero entrance or contact-word opacity scrub. Contact uses the same section-heading arrival as other sections.

- Name lines rise from `y:135%` through padded masks over 0.6 seconds, staggered by 0.07 seconds. Masks use `inset(-.12em -.06em -.24em -.06em)` to protect letter extents.
- Section headings rise from 18px over 0.42 seconds.
- Visible records rise from 22px over 0.42 seconds. Each observed batch follows document order, with 0.07-second gaps and a maximum onset delay of 0.8 seconds.
- Section rules draw from scale 0 to 1 over 0.6 seconds. Their thickness remains 1px.
- All arrivals use `expo.out`. Completion clears transforms. None animates prose opacity.

One ScrollTrigger maps the summary from `top top` to `bottom top` into clamped scene progress. It does not pin, add scroll distance, or control scrolling. Disclosure, filter, and tab changes still refresh ScrollTrigger through the content controller. If GSAP or ScrollTrigger is absent, reading remains available. The optional scene remains a separate enhancement.

### Live scene

The lazy Three.js scene uses a transparent canvas, hemisphere and directional lighting, and a 32-degree perspective camera. It fits model bounds with room for bounded movement. The renderer caps pixel ratio at 1.5, or 1.25 at widths of 700px and below. These are rendering limits, not measured frame rates.

Poses derive from active elapsed time, clamped scroll progress, and damped pointer input. Every pose starts from saved node positions and rotations rather than accumulated offsets. Pointer axes clamp to -1 through 1. Touch input does not drive hover response. Coarse-pointer readers still receive autonomous motion when policy permits it.

The renderer clamps each elapsed-time step to 0 through 0.05 seconds and resets its timestamp on resume. Hidden time does not advance the composition. Its `renderAt(time, progress, pointer)` API supports fixed-time checks and reversible progress. Resize and palette setters update state without drawing. Only the controller authorizes a still draw or starts the continuous loop.

The implementation does not promise a physical-device frame rate. A software-WebGL test can check changed pixels and draw activity, not phone GPU performance.

## Shapes

Actions and category/skill controls are pills. Fields use the field radius, and the separate Appearance panel uses the popover radius. Project image frames use the image radius. Inline project marks have their own smaller corners. Records use unfilled, top-ruled blocks, not rounded card shells.

The scene link and canvas use 16px corners. The poster has its own responsive corners and a 1px white edge. Its image occupies 85% of the plate in both dimensions, with `object-fit: cover` and `grayscale(1) contrast(1.35)`. Ordinary project images use containment. Do not apply the poster crop or image treatment to the archive.

## Components

### Buttons

Primary actions use the selected accent with paper text. Hover switches to ink with paper text. Secondary actions use surface fill, ink text, and surface-colored borders. Hover changes their border to ink. The Sections control uses ink fill with paper text.

Standard action pills have a 48px minimum height and the frontmatter's button padding. At 700px they use a 44px minimum and `11px 18px` padding. Hero buttons retain the more-specific `11px 16px` compact override below 1100px. Action text is 14px except for the existing 12px hero-button override at widths of 360px and below. Sections and Appearance controls use 42px minimum heights at 700px, not a universal 44px floor.

Inactive motion states suppress poster travel and every descendant project-image hover transform, including images inside figures. Paused, reduced, and `?noanim` modes therefore do not retain nested cover travel.

Buttons translate down 1px while active. Ordinary button transforms transition over 0.2 seconds. The global focus outline is 3px in the selected accent with 5px offset. Native appearance inputs draw their own span/swatch focus indicators with their authored offsets.

### Chips

Skill tabs and project category filters use outlined pills with 44px minimum height, `10px 18px` padding, and 14px text. At 700px they use `9px 14px` padding and 13px text. Selected controls use ink fill and paper text. Keep `aria-selected` for tabs and `aria-pressed` for filters. Color is not their only state signal.

### Cards / Containers

Each project retains its own purpose, outcome, technical disclosure, links, and real imagery. Ordinary project images are 240px high, or 230px at 700px. The Context Atlas figure uses `clamp(240px,33vw,470px)` with 20px padding. At 700px it uses 220px height and 12px padding. The three full-width lead records retain their larger typography without a duplicate preview collection.

Native disclosure summaries use the accent and 14px text. They have 17px vertical padding. Credential group summaries use 21px text at weight 400. At 700px they use 20px. Tables, code blocks, semantic result lists, and their units stay within the record that supports them. Expanded OpenBrowser and MTP disclosures separate technical copy and visual evidence into the two-column layout recorded above. This is a disclosure layout, not a new project or a merged evidence record.

### Evidence tables

The MTP table keeps its original headers, body, and values. Header and data cells use `white-space:nowrap` and `overflow-wrap:normal`. Do not split numeric ratios to force a narrow fit.

A table-only `div.table-scroll` has `role="region"`, `aria-label="MTP benchmark results"`, and `tabindex="0"`. It uses `max-width:100%`, `overflow-x:auto`, and `overscroll-behavior-x:contain`. At narrow widths, including 320px, readers scroll that keyboard-focusable region horizontally. The table need not fit the viewport at once. Do not claim a whole-table fit or allow page-level horizontal overflow.

### Inputs / Fields

Project search and role selection use surface fill, a 1px muted border, the field radius, 50px minimum height, `12px 16px` padding, and 15px text. The visible Find a project heading names the search field. The clear button is a pill with 50px minimum height, reducing to 44px at 700px. It resets both the query and category and returns focus to search.

### Navigation

The header remains full width at every depth. Sections toggles the same right drawer at every screen size and exposes its state through `aria-expanded`. Drawer links use the navigation type role and a 47px minimum height. Current location uses accent text, its matching wash, and `aria-current="location"`. Hover uses the surface background.

Opening the drawer closes Appearance. Opening Appearance closes the drawer. The drawer focuses the first section link once it is fully visible. Escape and backdrop dismissal restore the Sections button's focus. Moving focus outside dismisses it without a focus trap. Instant anchor navigation closes the drawer, opens containing disclosures, resets project filters when needed, and focuses the destination heading without a second scroll.

Appearance stays outside `main`, so Show all details does not open it. Its viewport-constrained panel scrolls internally, including in short landscape layouts. Its native radio groups retain System/Light/Dark and the five accents. Theme options and color targets are 44px high. Swatches are 24px circles. Outside click or focus dismisses the popover. Escape restores its summary's focus. Its open state is not persisted.

### Motion controls and lifecycle

Two native buttons share `data-motion-toggle` and `aria-describedby="motion-note"`. One sits beside the hero caption, the other inside Appearance. They remain invisible until `motion-ready` follows handler binding. Each uses a 44px minimum height, `10px 16px` padding, 13px text, and a pill border. The hero button uses 14px horizontal padding at 700px and below. The Appearance button fills its panel and has an 18px top margin.

Label precedence is `?noanim`: **Motion off**, system reduction: **Motion reduced**, saved pause: **Play motion**, otherwise **Pause motion**. The first two conditions disable both buttons. An open panel suspends motion but does not change those labels or the saved preference.

Motion stores `{"mode":"auto"}` or `{"mode":"paused"}` at `portfolio-motion-v1`. The parser accepts only a non-null, non-array object. Its mode must be a primitive `auto` or `paused` string. It ignores extra keys. Missing, malformed, removed, or unsupported values select automatic mode. Storage requirement: preserve the current visit's choice after a rejected write, even when reads still succeed. Reconciliation must not replace that choice with stale stored data. Cross-tab removal and clear events reset automatic mode. Appearance uses its separate existing key. OS reduction and storage changes apply during the visit without overwriting the user's pause.

The central policy separates three capabilities:

- DOM animation requires automatic mode, no system reduction, no `?noanim`, a visible unfrozen document, and no open header panel.
- Initial scene loading also requires a visible hero scene, positive dimensions, and no `saveData` preference.
- Continuous drawing also requires a ready scene. Leaving the hero stops that loop, but does not stop eligible DOM arrivals elsewhere.

The root reports `active`, `paused`, `reduced`, `disabled`, `suspended`, or `disposed` through `data-motion-state`. Offscreen scene suspension alone need not change the root from `active`.

The scene host reports `idle`, `loading`, `prepared`, `ready`, `fallback`, or `disposed` through `data-scene-state`. A detached prepared result becomes ready only after an actual frame succeeds. The controller then mounts its canvas and adds `is-3d-ready`. The canvas is decorative, `aria-hidden`, and pointer-transparent. The existing link and caption retain the project identity and destination.

A visible, unfrozen hero with no open header panel can receive one still redraw after load acceptance, resize, or palette change. This includes paused or reduced states after loading already began. Hidden or offscreen changes queue a redraw until visibility returns. That redraw does not start a loop. Saved pause, reduction, `?noanim`, `saveData`, and an offscreen hero prevent initial import and model fetch.

One promise and a generation token prevent duplicate loads or stale mounting. The lifetime abort signal cancels model work. A failed import, asset, WebGL context, or runtime restores the poster. Context loss does the same. `data-scene-reason` records `webgl`, `asset`, `context-lost`, or `runtime`. Fallback is terminal until reload, with no retry from controls, visibility, or context restoration.

Asset requirement: accept the scene only if its embedded logo decodes. A missing or undecodable logo must use terminal asset fallback, not an unmarked 3D tile.

Terminal `pagehide` aborts work, disconnects observers and listeners, kills owned motion, and disposes GPU resources. Repeated disposal is safe. Persisted `pagehide` instead suspends existing owners and settles text. `pageshow` rereads current preferences, dimensions, overlays, and visibility before reconciliation. Simulated events test these handlers, not actual browser back/forward-cache admission or restoration.

Navigation dispatches `portfolio:navigate` on `document` before the content controller schedules its instant scroll. Motion settles the target synchronously without scrolling. Initial deep links settle before the controller creates masks. A non-hero initial target blocks early scene loading until fonts and two animation frames allow navigation to settle.

### Source disclosures and skill panels

Use native disclosures for role detail, coursework, research methods, project implementations, and credential groups. Show all details and Hide extra details target the main-content disclosures together. Skill tabs use Left/Right arrows, Home, End, and roving tab stops. A hash target inside a skill panel activates its matching tab before scrolling. Software remains the default when no hash targets a skill panel. All skill panels remain readable without JavaScript. Search, filters, role jump, skill tabs, and show-all are progressive enhancements rather than prerequisites for reading the source record.

## Do's and Don'ts

### Do:
- **Do** use the active Geist and neutral-theme tokens, followed by the final motion overrides.
- **Do** preserve all original records, source links, asset bytes, and meaningful anchors.
- **Do** keep Sections and Appearance independently reachable in the header.
- **Do** retain the one genuine OpenBrowser hero mark and actual project imagery.
- **Do** keep native disclosures, keyboard controls, visible focus, and no-JavaScript reading.
- **Do** keep both motion controls synchronized and respect live system reduction.
- **Do** retain the original poster through loading and restore it after terminal scene failure.
- **Do** treat responsive values as component-specific overrides rather than a single proportional scale.

### Don't:
- **Don't** restore the old fixed left index, compact identity type, or typography-only hero.
- **Don't** add a portrait, borrowed reference artwork, fabricated product scenes, or a preview carousel.
- **Don't** remove evidence or merge unrelated projects to shorten the page.
- **Don't** add category palettes, repeated elevated card shells, or invented tonal ramps.
- **Don't** animate prose opacity from zero, pin scrolling, or move the document with pointer input.
- **Don't** start an optional scene request under saved pause, system reduction, `?noanim`, `saveData`, or an offscreen hero.
- **Don't** present this source-derived specification as browser or accessibility certification.
