# PRODUCT.md

## Product

A complete career and project portfolio for Muhammad Enrizky Brillian, with optional live motion. It covers software engineering, AI, data engineering, analytics, healthcare research, applications, and teaching.

## Audience

Hiring managers, staff engineers, founders, and research collaborators who need evidence of production judgment, not a list of tools.

## Job To Be Done

Let readers understand the current work quickly, then explore the complete professional, academic, research, teaching, and project record. The portfolio is broader than a tailored CV.

The approved reading contract is:

> Keep it complete and long, but make it easy to navigate.

Improve access to the record without deleting or shortening it into a selected-work page.

## Positioning

I build the systems between AI research and production: agent runtimes, browser infrastructure, applied ML, and the data platforms around them.

## Coverage

- Preserve every historical role, project, and achievement when adding newer work.
- The current inventory is 11 role records, 30 project/system records, 2 course papers, and 27 credential and learning records. Preserve the 3 campus service roles as well.
- Retain original technical text, formal credential names, meaningful hash anchors, and public project, paper, and CV links. Plain-language summaries supplement the source record. They do not replace it.
- Keep finance data engineering separate from AI infrastructure.
- Explain each research study and project within its own methods, results, and scope.
- Include education, awards, admissions, certifications, and credentials when supported by the record.
- Keep private identities and nonpublic source material out of text, links, assets, and metadata.
- Remove records only at the user's explicit request. The summary metric strip was explicitly removed.

## Reading and Navigation

- Keep one long page in this order: Summary, Skills, Experience, Education, Research, My work, Credentials, Contact.
- Offer an independent Appearance disclosure in the fixed header as a nonmodal popover. Provide System, Light, and Dark themes and independent Red, Orange, Green, Blue, and Pink accents. Remember validated preferences on the device when storage is available. Keep System and Orange as defaults, provide readable variants in each theme, and preserve automatic system styling without JavaScript.
- Keep a full-width fixed header and a right-hand **Sections** drawer at every screen size. The drawer contains the complete section index and indicates the current section. Keep Appearance accessible without opening Sections. Opening either control closes the other.
- Keep Appearance controls reachable on short screens. Constrain its panel below the fixed header, with internal scrolling and contained overscroll.
- Keep the MTP table's headers and numeric values unbroken. At narrow widths, including 320px, use a named, keyboard-focusable local scroll region, not page overflow.
- Section links jump directly to their destination instead of animating through the long page. At every screen size, focus moves to the first section link once the drawer is fully visible.
- Links into skill panels must select the matching tab before scrolling. Keep Software as the initial default otherwise.
- Let readers jump directly to a role. Combine project highlights, systems work, and the original project catalog into one searchable work collection, without combining unrelated projects.
- Head the work collection with **Find a project** at the standard section-heading size. Offer project search and the categories All, AI and automation, Data and analysis, Web and mobile, and Research tools. Include the result count, an empty state, and a clear-search action.
- Lead with purpose and supported outcomes. Keep full technical records in native disclosure panels, with **Show all details** and **Hide extra details** controls.
- Use **View my work** for the primary work link and **How I built it** for project disclosures.
- Use the Geist editorial presentation: oversized two-line identity, existing introduction and actions, and one genuine OpenBrowser mark with its package-install command. Keep the full name accessible. Do not use the author's photograph. Retain the existing favicon, but no author image in page content, social-preview metadata, or image preloads. Preserve actual images within project records. The single project mark is not a separate preview gallery or carousel above project search. Skill panels support keyboard navigation.
- Keep all records and native disclosures available without JavaScript. In that mode, the header and section index enter document flow, and all skill panels remain available. Search, filters, Appearance controls, and other enhanced controls require JavaScript. Optional motion must not gate content access or force scroll distance. Detect JavaScript during the early head bootstrap to avoid a temporary in-flow index before initialization. Expose Sections only after its navigation handlers are bound. With JavaScript detected, reserve the header space for Appearance while its preference handlers connect. Reveal the control only when ready. Without JavaScript, hide Appearance entirely.

## Live motion

- Keep this a responsive website, not a film viewport. Preserve normal scrolling and the complete reading order. Never pin scrolling or gate records behind animation.
- Use Cinetic and motion-recreation as timing and depth references only. Do not copy their code or unlicensed media.
- Keep one OpenBrowser illustration inside its existing project link. A local 3D model adds Python, CDP, and MCP blocks to the existing mark. The original image remains the fallback. The canvas adds no separate content or portrait.
- Use the existing local GSAP and ScrollTrigger for name, heading, record, and rule arrivals. Keep prose fully opaque. Settle moving text immediately when motion stops or navigation or focus enters its target.
- Load the optional Three.js bundle and model only when policy permits motion and the hero scene is visible with positive dimensions. Do not start loading under saved pause, system reduction, `?noanim`, or `saveData`.
- Provide matching motion buttons beside the hero caption and inside Appearance. Show **Pause motion** in automatic mode and **Play motion** after a user pause. System reduction shows disabled **Motion reduced** controls. `?noanim` takes precedence and shows disabled **Motion off** controls.
- Store only the motion mode in the `portfolio-motion-v1` JSON envelope: `{"mode":"auto"}` or `{"mode":"paused"}`. Validate its object shape and primitive mode string. Invalid or removed values reset to automatic mode. Keep this preference independent of theme and accent. Support blocked storage, cross-tab changes, and live system reduction. A rejected write must preserve the current visit's choice even if storage reads succeed.
- Suspend continuous scene drawing when the hero leaves view, the document hides, or either header panel opens. These conditions do not change the saved pause. Resume only when current policy allows it.
- Permit one still redraw for an accepted load or resize/theme update when the scene is visible and no header panel is open. This exception also applies while paused or reduced. Defer that redraw while hidden, offscreen, or suspended. It must not restart continuous drawing.
- Restore the original poster after an asset, WebGL, runtime, or context-loss failure. Treat scene failure as terminal until a full reload. Keep reading, navigation, and DOM motion independent of the 3D fallback. Require the embedded logo to decode before accepting the scene. An undecodable logo must use the terminal asset fallback, not an unmarked 3D tile.
- Dispose resources on terminal page exit. Suspend rather than rebuild owners for a persisted `pagehide`. Recheck current preferences and visibility on `pageshow`. Event-handler coverage does not prove actual browser back/forward-cache restoration.
- Reserve responsive scene space before loading. Recompose the hero for narrow and short screens rather than crop it. Keep the project link, pause control, and primary actions accessible.

## Voice

Direct, specific, calm. Show evidence. No generic service marketing.

State practical outcomes in plain language, quantified only when the source supports them. Preserve units, comparison conditions, dates, and evaluation scope. Explain purpose and measured evaluation when there is no business metric. Do not invent a commercial benefit.

Keep research accuracy distinct from patient benefit, analyst efficiency distinct from time reduction, tokens distinct from words, and projected savings distinct from realized savings.

## Factual Boundaries

- University of Toronto CGPA is 3.87/4.00.
- STAD68 is a final course paper, 2026. STAD80 is a course paper, 2026, not a conference publication.
- Keep individual research studies, their datasets, methods, and findings separate.
- Distinguish degrees, graduate admissions, awards, certifications, partner credentials, applied skills, training badges, and coursework. Preserve formal credential names exactly.

## Non-Goals

No invented architecture connecting unrelated projects, skill percentages, or private identities. Do not filter the lifetime record down to a job-specific selection.

## Success

Readers can find every role and project from the earlier portfolio, alongside newer work. Methods and outcomes remain correctly attributed. Mobile and keyboard users receive the full record.

Readers can enter at a section or record link, search the complete work collection, and reveal the full evidence without losing access to navigation. The inventory and source links remain intact in both light and dark themes, with every selectable accent and with reduced motion.
