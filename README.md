# Muhammad Enrizky Brillian: Software and AI Infrastructure Portfolio

A complete portfolio with optional live motion. It covers professional work, academic and healthcare research, software projects, data analysis, teaching, education, and credentials. Keep it complete and long, but easy to navigate.

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

A full-width fixed header contains the name, desktop GitHub and CV links, an independent **Appearance** popover, and **Sections**. Sections opens a drawer from the right on every screen size. The hero pairs the introduction with one OpenBrowser illustration, its existing project mark, and `pip install openbrowser-ai`. A local 3D scene can replace the original poster after its first successful frame. It does not borrow the reference's imagery, identity, claims, or contact details. There is no author portrait in page content, social-preview metadata, or image preloads. The existing favicon remains.

The hero is not a preview gallery. The complete project collection stays below search. OpenBrowser, Context Atlas, and the MTP study receive larger record treatments without replacing the archive. Expanded OpenBrowser and MTP details use equal desktop columns with a 48px gap and stack at 900px and below. Technical paragraphs and ledger/fact lists have a 78ch maximum width. Project images remain genuine source assets.

The MTP table preserves its headers and numeric values without line breaks. A named, keyboard-focusable scroll region contains the table. At narrow widths, including 320px, the region scrolls horizontally instead of forcing page overflow. The whole table need not fit at once.

[PRODUCT.md](PRODUCT.md) records coverage and factual boundaries. [DESIGN.md](DESIGN.md) records the implemented typography, colors, dimensions, responsive rules, components, and motion.

The stylesheet order is `css/style.css`, `css/editorial.css`, then `css/motion.css`. The last layer owns the scene rectangle, poster, motion controls, and short-screen adjustments. Appearance bootstraps in the head before styles load. Deferred scripts load local GSAP, ScrollTrigger, `js/script.js`, then `js/motion.js`. The motion controller alone owns animation. It imports the optional scene bundle only when policy allows it.

## Appearance and navigation

Open **Appearance** directly in the header. Choose **System**, **Light**, or **Dark**, then **Red**, **Orange**, **Green**, **Blue**, or **Pink**. Theme and accent are independent. Defaults are System and Orange.

`js/appearance.js` adds the root `js` detection class and applies validated preferences before the stylesheets. Early detection prevents the no-JavaScript in-flow index from flashing while the later interaction script loads. The initial HTML theme-color matches the light paper. The controller updates it for the resolved theme. It stores `{theme, color}` under `portfolio-appearance` when storage is available. Invalid values fall back to defaults. The controls still work when the browser blocks storage. System mode follows OS changes. Explicit themes override them. Preferences synchronize across tabs, and initialization reconciles changes made while the page loads.

`js/script.js` adds `navigation-ready` after binding the navigation and content controls. Until then, CSS keeps the Sections button invisible. Appearance has its own `appearance-ready` signal after its preference handlers connect. With `js` present, its header slot uses `display: block` and `visibility: hidden` during startup, so the header reserves its space. `appearance-ready` changes visibility to visible. Without JavaScript, Appearance stays `display: none` and reserves no slot. These readiness states do not hide the source records.

Appearance is a native disclosure, not a modal. Outside clicks or focus dismiss it. Escape closes it and returns focus to its summary. Sections and Appearance do not stay open together. Sections moves focus to the first link once the drawer is visible. Escape and the backdrop close it and restore button focus. Focus can leave the drawer without a trap. The Appearance panel stays below the fixed header and scrolls internally within the available viewport height. It contains overscroll, including in short landscape views.

Section and record links jump immediately. Deep links open containing disclosures and clear project filters when needed to reveal a destination. Document scroll padding clears the fixed header. Links into skill panels activate the matching tab before scrolling. Software remains the default otherwise. All original anchors remain available.

Without JavaScript, the page follows the system theme. The header and section index enter document flow. All skill panels and project records remain available, and native disclosures still open. The original hero poster remains visible. Enhanced controls require JavaScript.

## Live motion

Cinetic and motion-recreation inform masked arrivals, bounded stagger, and layered depth. This site uses original website motion code and a locally authored model, not borrowed reference code or unlicensed media. It remains a responsive reading document, not a film viewport.

`js/motion.js` uses the existing GSAP runtime for name, heading, record, and rule arrivals. Text stays fully opaque. Paused, reduced, and `?noanim` states suppress decorative poster and project-image hover travel, including images nested in figures. Focus, navigation, and motion suspension settle owned transforms immediately. The former contact-word opacity scrub is gone. One non-pinning ScrollTrigger supplies hero progress without controlling document scroll.

The optional `js/motion-scene.bundle.js` contains Three.js and the scene renderer from `js/motion-scene.js`. It loads `assets/motion/openbrowser-scene.glb` only after the initial scene policy permits loading. The model uses the existing OpenBrowser mark with ceramic geometry and Python, CDP, and MCP blocks. The transparent canvas adds bounded autonomous movement, scroll composition, and damped pointer response. Touch does not require hover. Theme and accent changes update the existing scene. All runtime assets are local, with no new third-party requests or telemetry.

The project link reserves its scene rectangle before loading. The original poster stays visible until a real frame succeeds. Width and height overrides recompose the hero for phones and short landscape screens. The phone caption keeps the project link and pause control, while the install command hides visually. The command remains in source and project details. [DESIGN.md](DESIGN.md#layout) lists the exact responsive overrides.

### Pause and loading policy

The hero caption and Appearance contain matching native motion buttons. Their labels follow this precedence:

1. `?noanim`: **Motion off**, disabled.
2. System reduced motion: **Motion reduced**, disabled.
3. Saved user pause: **Play motion**.
4. Otherwise: **Pause motion**.

Buttons appear only after their handlers bind. Motion stores `{"mode":"auto"}` or `{"mode":"paused"}` under `portfolio-motion-v1`. The parser requires a non-null, non-array object and an exact primitive mode string. The parser ignores extra keys. Invalid data, key removal, or storage clear selects automatic mode. Blocked storage still permits a visit-local pause. A rejected write must preserve that choice even when reads succeed. Reconciliation must not replace it with stale stored data. Cross-tab updates and live OS reduction apply without changing the independent `portfolio-appearance` preference.

- DOM animation requires automatic mode, no reduction, no `?noanim`, a visible unfrozen document, and no open Appearance panel or Sections drawer.
- Initial 3D import and model fetch also require a visible, positive-sized hero and no `saveData` preference. Saved pause, reduction, `?noanim`, and offscreen deep links therefore avoid initial 3D requests.
- Continuous scene drawing also requires a ready scene. Leaving the hero, hiding the document, or opening either header panel stops the loop without changing the saved pause.
- An eligible load already in progress may finish while paused or reduced. A visible, unfrozen hero with no open panel may receive one still frame after acceptance or a resize/theme update. Hidden and offscreen updates defer that redraw. A still redraw does not restart continuous motion.

The scene lifecycle is `idle`, `loading`, `prepared`, then `ready`, with terminal `fallback` or `disposed` states. One initialization promise and a generation token prevent duplicate requests and stale canvas mounting. A missing WebGL2 context, failed asset, runtime error, or context loss restores the poster until full reload. Preference changes and context restoration do not retry the scene. Reading and navigation remain available. The asset contract also requires a decoded embedded logo before scene acceptance. Logo decode failure must restore the poster through terminal asset fallback.

Terminal `pagehide` aborts pending work, removes owned listeners and observers, settles text, and disposes GPU resources. Persisted `pagehide` suspends existing owners instead. `pageshow` rechecks current preferences, visibility, overlays, and dimensions before resuming. These handlers support suspension and restoration. Simulated lifecycle tests do not prove actual browser back/forward-cache admission or restoration.

`js/script.js` dispatches `portfolio:navigate` on `document` before scheduling its instant hash scroll. Motion settles the destination without scrolling. Initial deep links settle before reveal setup. Non-hero startup links defer scene eligibility until fonts and the scheduled navigation settle.

## Evidence

Each snapshot describes a fixed evaluation scope. These are not live counters:

- OpenBrowser: 53,327 PyPI downloads from Pepy on November 10, 2026, 279 GitHub stars, 52 releases, and 7,007 test functions.
- Model serving: 10,410.60 tok/s at N=512, $0.77 per million tokens at N=512, compared with $132.56 per million tokens at N=1.
- MTP benchmark: 144/144 runs, 8.9x to 26.8x vLLM versus Transformers, and 2.06x on A10 code prompts. Engine comparisons and speculative-decoding gains remain distinct.
- Financial reconciliation: a 1,400,883-row BigQuery fact table and January to September control totals within $0.11.
- Document platform: 984 files to pre-production in 24 weeks. This is separate from the finance pipeline.

Preserve source units, dates, methods, and comparison conditions. Do not turn research accuracy into patient benefit, analyst efficiency into time reduction, tokens into words, or projected savings into realized savings. Keep private identities and nonpublic source material out of published files.

## Preview locally

Run from the repository root:

```sh
uv run --no-project python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Add `?noanim` to disable owned motion and prevent initial 3D loading. Theme, navigation, search, and native disclosures remain available.

The static site needs no rebuild for preview. The local server serves HTML, three stylesheets, JavaScript, fonts, GSAP, ScrollTrigger, and optional 3D resources.

### Rebuild the optional scene module

The renderer uses build-only `three@0.187.0` and `esbuild@0.28.2`. Install the locked dependencies before changing `js/motion-scene.js`:

```sh
npm ci
npm run build:motion
```

The command generates `js/motion-scene.bundle.js` and its linked `.LEGAL.txt` notices. Publish both generated files with the source site and the full Three.js license. There is no runtime import map or production npm install. After changing the bundle or model, refresh the motion script's `data-scene-version` and `data-model-version` cache keys in `index.html`. Use the first 12 hexadecimal characters of each file's SHA-256.

### Rebuild the local model

[The model builder](tools/rebuild-openbrowser-model.py) creates the geometry and embeds a prepared copy of the existing logo. It reads the source logo without changing its bytes. Run it from the repository root with Blender and `uv` available:

```sh
blender --background --factory-startup --python-exit-code 1 --python tools/rebuild-openbrowser-model.py
```

The default output is `assets/motion/openbrowser-scene.glb`. The builder also accepts `-- --output <file.glb>` for a separate validation copy. It invokes `uv` for pinned Python/Pillow logo preparation. [Provenance](assets/motion/provenance.json) records the tested toolchain, current bytes, hashes, embedded texture, and local reproduction result. Do not infer byte identity under untested tool versions.

The release budgets are at most 512 KiB for the model, 1.5 MiB for the raw optional bundle, and 400 KiB for local gzip. These are limits, not measured network transfer or performance claims. Read current asset measurements from provenance and fresh build output rather than copying a fixed model size here.

## Check changes

Static checks:

```sh
npx html-validate index.html
node --check js/script.js
node --check js/appearance.js
node --check js/motion.js
```

The browser tests require Node.js and Playwright's Chromium. With the preview server running:

```sh
npm ci
npx playwright install chromium
npm test
```

`package.json` defines the aggregate `npm test` command. The release test set includes appearance, redesign, runtime, responsive-edge, motion-failure, and motion-containment checks. To run the independent real-WebGL verifier alone:

```sh
node tests/motion-runtime.cjs
```

The additional focused release commands are:

```sh
node tests/responsive-edges.cjs
node tests/motion-failures.cjs
node tests/motion-containment.cjs
```

The responsive-edge suite checks short-landscape settings and intact benchmark cells within their local scroll region. The motion-failure suite targets rejected storage writes and embedded-logo failures. Run the focused commands as well if the aggregate script does not yet include them.

These test dependencies are not production dependencies. Set `PORTFOLIO_URL` to use another preview URL. `TEST_OUTPUT_DIR` changes the output directory. The appearance, redesign, and runtime defaults are `local_docs/appearance-qa/`, `local_docs/redesign-qa/`, and `local_docs/motion-qa/`. Focused suites define their own default report directories. These generated reports do not ship with the site.

The appearance and redesign suites check theme/accent choices, contrast, storage, OS changes, and keyboard controls. They also check responsive layout, panel coordination, deep links, no-JavaScript reading, search, disclosures, and inventory.

`tests/motion-runtime.cjs` instruments actual WebGL draw calls and compares rendered pixels in headless Chromium with ANGLE SwiftShader software WebGL. It checks active frames, settled zero-draw windows, allowed paused redraws, loading races, terminal fallback, reversible progress, preference independence, and responsive reading. It also checks the direct Context Atlas article and OpenBrowser comparison links outside their disclosures. The verifier simulates visibility events, lifecycle events, and the `saveData` input. These checks do not establish physical-device FPS, actual back/forward-cache restoration, or production deployment status.

Coverage describes test intent. Fresh run reports establish results. Source record and original asset preservation also require their separate preservation check.

With Impeccable available, run `detect --json index.html css/style.css css/editorial.css css/motion.css js/script.js js/appearance.js js/motion.js js/motion-scene.js`. Review desktop, phone, tablet, and landscape rendering. Check active sections, anchor clearance, focus, paused/reduced states, fallback, and both themes with every accent. Verify full record text, original links, authorized additions, and original asset bytes before publishing.

## Deploy

Publish the static repository root through the configured GitHub Pages deployment, retaining `.nojekyll`. Site: https://billy-enrizky.github.io/portfolio/. Include the generated optional bundle, its legal notices, the local model, and vendor license. Deployment needs no separate build directory. Confirm deployment settings and files before publishing. Verify the deployed page separately from local preview.

## License

Content and personal assets belong to Muhammad Enrizky Brillian. [LICENSE](LICENSE) records the repository's MIT terms. [Model notes](assets/motion/README.md) apply those terms to the original geometry and builder. The existing mark remains the owner's project identity. [Provenance](assets/motion/provenance.json) records the inputs and local reproduction evidence, not a borrowed scene or texture archive.

Three.js retains its upstream MIT license in `assets/vendor/three-LICENSE.txt`. Keep the generated bundle's linked legal notices. Geist's font license is in `assets/geist-OFL.txt`. The existing GSAP and ScrollTrigger files retain their own license headers. Do not treat the repository license as a replacement for dependency terms.
