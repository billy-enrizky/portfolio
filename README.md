# Muhammad Enrizky Brillian: Software and AI Infrastructure Portfolio

A complete static portfolio covering professional work, academic and healthcare research, software projects, data analysis, teaching, education, and credentials. Keep it complete and long, but easy to navigate.

## Positioning

I build the systems between AI research and production: agent runtimes, browser infrastructure, applied ML, and the data platforms around them.

## Complete record

The page follows Summary, Skills, Experience, Education, Research, My work, Credentials, Contact.

- 11 role records, 30 project records, 2 course papers, and 27 credential and learning entries. The collection retains all 24 original projects alongside newer projects and systems work. Finance data engineering stays separate from AI infrastructure.
- Education includes University of Toronto, with CGPA 3.87/4.00, Georgia Tech, coursework, awards, co-op distinction, graduate admissions, and 3 campus service roles. Admissions are not additional earned degrees.
- STAD68 is a final course paper, 2026. STAD80 is a course paper, 2026. Neither is a conference publication. Certifications, partner credentials, applied skills, training badges, and coursework retain their original classifications and formal names.
- Original record text, anchors, source links, images, and public CV bytes remain intact. Plain-language purpose and supported outcomes precede the full technical evidence in native disclosures.

**View my work** leads to the complete **Find a project** collection. Search matches every entered word against a project's full text, including its disclosure. Category filters, result counts, an empty state, and Clear search support the full collection. Clear search resets both query and category. A role selector, keyboard skill tabs, and **Show all details** provide other entry points.

## Visual system

The presentation follows the editorial direction of [leonlin.de](https://leonlin.de/), with this portfolio's own identity, projects, and evidence. It uses locally hosted variable Geist, large two-line identity type, neutral light and dark palettes, rounded actions, and flat source-record grids. JetBrains Mono remains the code face.

A full-width fixed header contains the name, desktop GitHub and CV links, an independent **Appearance** popover, and **Sections**. Sections opens a drawer from the right on every screen size. The hero is the name, the introduction and two actions, with no artwork. It does not borrow the reference's imagery, identity, claims, or contact details. There is no author portrait in page content, social-preview metadata, or image preloads. The existing favicon remains.

The hero is not a preview gallery. The complete project collection stays below search; OpenBrowser, Context Atlas, and the MTP study receive larger record treatments without replacing the archive. Expanded OpenBrowser and MTP details use equal desktop columns with a 48px gap and stack at 900px and below. Technical paragraphs and ledger/fact lists have a 78ch maximum width. Project images remain genuine source assets.

[PRODUCT.md](PRODUCT.md) records coverage and factual boundaries. [DESIGN.md](DESIGN.md) records the implemented typography, colors, dimensions, responsive rules, components, and motion. The source cascade loads `css/style.css` first and `css/editorial.css` second. Read them together; the editorial layer replaces the old visual geometry.

## Appearance and navigation

Open **Appearance** directly in the header. Choose **System**, **Light**, or **Dark**, then **Red**, **Orange**, **Green**, **Blue**, or **Pink**. Theme and accent are independent. Defaults are System and Orange.

`js/appearance.js` adds the root `js` detection class and applies validated preferences before the stylesheets. Early detection prevents the no-JavaScript in-flow index from flashing while the later interaction script loads. The initial HTML theme-color matches the light paper; the controller updates it for the resolved theme. It stores `{theme, color}` under `portfolio-appearance` when storage is available. Invalid values fall back to defaults. The controls still work when storage is blocked. System mode follows OS changes; explicit themes override them. Preferences synchronize across tabs, and initialization reconciles changes made while the page loads.

`js/script.js` adds `navigation-ready` after binding the navigation and content controls. Until then, CSS keeps the Sections button invisible. Appearance has its own `appearance-ready` signal after its preference handlers connect. With `js` present, its header slot uses `display: block` and `visibility: hidden` during startup, so the header reserves its space. `appearance-ready` changes visibility to visible. Without JavaScript, Appearance stays `display: none` and reserves no slot. These readiness states do not hide the source records.

Appearance is a native disclosure, not a modal. Outside clicks or focus dismiss it. Escape closes it and returns focus to its summary. Sections and Appearance do not stay open together. Sections moves focus to the first link once the drawer is visible; Escape and the backdrop close it and restore button focus. Focus can leave the drawer without a trap.

Section and record links jump immediately. Deep links open containing disclosures and clear project filters when needed to reveal a destination. The fixed header is cleared through document scroll padding. All original anchors remain available.

Without JavaScript, the page follows the system theme, the header and section index enter document flow, all skill panels and project records remain available, and native disclosures still open. Enhanced controls require JavaScript.

Motion is a layer over the complete page. One class, `motion-on` on the root element, gates every effect (the career route, progress bar and reveals all require it), and it is set only when the reader has not paused motion, the system does not request reduced motion, and the URL has no `noanim` flag. Without it, every record is visible immediately. A 3-second failsafe removes the class if `js/motion.js` never runs. The stored value is `{"mode":"auto"}` or `{"mode":"paused"}`; Play writes `auto`. The control reads Pause motion, Play motion, Motion reduced by system setting, or Motion off for this view, and it follows changes made in another tab. Effects: masked heading arrivals, short bounded reveals as records enter view (70 ms between siblings, 800 ms cap), a decorative career route that draws as roles are read, a page progress bar under the header, press feedback on controls, and a 4px lift on project cards where a fine pointer exists. Nothing pins scrolling, forces scroll distance, or hides a record the reader has linked to or focused. **Pause motion** in Appearance is saved on the device under `portfolio-motion-v1` and is independent of the saved theme and color.

## Evidence

These are scoped snapshots, not live counters:

- OpenBrowser: 53,327 PyPI downloads from Pepy on November 10, 2026, 279 GitHub stars, 52 releases, and 7,007 test functions.
- Model serving: 10,410.60 tok/s at N=512, $0.77 per million tokens at N=512, compared with $132.56 per million tokens at N=1.
- MTP benchmark: 144/144 runs, 8.9x to 26.8x vLLM versus Transformers, and 2.06x on A10 code prompts. Engine comparisons and speculative-decoding gains remain distinct.
- Financial reconciliation: a 1,400,883-row BigQuery fact table and January to September control totals within $0.11.
- Document platform: 984 files to pre-production in 24 weeks. This is separate from the finance pipeline.

Preserve source units, dates, methods, and comparison conditions. Do not turn research accuracy into patient benefit, analyst efficiency into time reduction, tokens into words, or projected savings into realized savings. Do not expose client identities or confidential document terminology.

## Preview locally

Run from the repository root:

```sh
uv run --no-project python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Add `?noanim` to inspect the page without motion. There is no build step. HTML, the three stylesheets (`css/style.css`, `css/editorial.css`, `css/motion.css`), JavaScript, and fonts are served locally, with no third-party runtime. Geist's license is in `assets/geist-OFL.txt`; original assets remain available.

## Check changes

Static checks:

```sh
npx html-validate index.html
node --check js/script.js
node --check js/appearance.js
```

The browser tests require Node.js and Playwright's Chromium. With the preview server running:

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` runs `tests/appearance.cjs`, `tests/redesign.cjs` and `tests/motion.cjs`. These test dependencies are not production dependencies. Set `PORTFOLIO_URL` to use another preview URL. `TEST_OUTPUT_DIR` changes the output directory for all three suites; the motion suite writes screenshots to `local_docs/motion-qa` by default. Default outputs are ignored directories `local_docs/appearance-qa/`, `local_docs/redesign-qa/` and `local_docs/motion-qa/`.

The suites cover appearance choices and contrast, independent preference persistence, malformed and blocked storage, OS and cross-tab changes, keyboard controls, responsive overflow and hero actions, drawer and popover coordination, deep links, no-JavaScript access, search, disclosures, and record counts. Run results, not this documentation, establish whether a revision passes.

When Impeccable is installed, run its `detect --json index.html css/style.css css/editorial.css css/motion.css js/script.js js/appearance.js js/motion-boot.js js/motion.js` command. Review desktop and phone rendering, active sections, anchor clearance, focus behavior, reduced motion, and both themes with every accent. Verify full record text, link parity, and original asset bytes before publishing.

## Deploy

Publish the static repository root through the configured GitHub Pages deployment, retaining `.nojekyll`. Site: https://billy-enrizky.github.io/portfolio/. Confirm the intended deployment settings and files before publishing. No generated build directory is needed. Verify the deployed page separately from local preview.

## License

Content and personal assets belong to Muhammad Enrizky Brillian. See `LICENSE` for the template license and `assets/geist-OFL.txt` for Geist's font license.
