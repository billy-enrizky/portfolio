# Muhammad Enrizky Brillian: Software and AI Infrastructure Portfolio

A complete static portfolio covering professional work, academic and healthcare research, software projects, data analysis, teaching, education, and credentials. Keep it complete and long, but easy to navigate.

## Positioning

I build the systems between AI research and production: agent runtimes, browser infrastructure, applied ML, and the data platforms around them.

## Sections

Summary, Skills, Experience, Education, Research, My work, Credentials, Contact.

- 11 role records, 30 project/system records, 2 course papers, and 27 credential/learning records. The work collection includes all 24 original projects, newer cases, and systems work. Finance data engineering stays separate from AI infrastructure.
- Education includes University of Toronto (CGPA 3.87/4.00), Georgia Tech, coursework, awards, co-op distinction, graduate admissions, and 3 campus service roles. STAD68 and STAD80 are course papers, not conference publications. Formal credential names remain unchanged; training is distinct from certification.
- Fixed desktop index and mobile **Sections** menu with instant section jumps; role jump; project search/category filters; native disclosures and show-all; manual real-image gallery; keyboard skill tabs; system light/dark and reduced-motion support.

The hero is typography-only. The author's image is absent from page content, social-preview metadata, and image preloads; the favicon is retained. Genuine project images remain, with image motion applied to the gallery slides.

**View my work** leads to the full collection. **How I built it** opens preserved technical evidence. Original record text and public links remain available. See [PRODUCT.md](PRODUCT.md) for coverage and factual boundaries, and [DESIGN.md](DESIGN.md) for the observed design system.

## Evidence

- OpenBrowser: 53,327 PyPI downloads from Pepy on November 10, 2026, 279 GitHub stars, 52 releases, and 7,007 test functions.
- Model serving: 10,410.60 tok/s at N=512, $0.77 per million tokens at N=512, compared with $132.56 per million tokens at N=1.
- MTP benchmark: 144/144 runs, 8.9x to 26.8x vLLM versus Transformers, and 2.06x on A10 code prompts.
- Enterprise delivery: 1,400,883-row BigQuery fact table, 984 files to pre-production in 24 weeks, and January to September control totals within $0.11.

These are scoped snapshots, not live counters. Preserve source units and conditions. Do not invent business outcomes or present projected savings as achieved. Do not expose client identities or confidential terminology.

## Local Preview

```bash
uv run python -m http.server 8000
```

Run from the repository root, then open `http://127.0.0.1:8000/`. Add `?noanim` to skip GSAP during inspection.

There is no build step. HTML, CSS, JavaScript, Satoshi/JetBrains Mono fonts, GSAP, and ScrollTrigger are served locally. Native disclosures and all records remain readable without JavaScript; enhanced controls require it.

## Checks

```bash
npx html-validate index.html
node --check js/script.js
```

When Impeccable is installed, also run its `detect --json index.html css/style.css js/script.js` command. Manually check instant navigation, focus after the mobile menu opens, anchor clearance without a double gap, active section, deep links, search/reset/empty state, filters, disclosures/show-all, gallery, keyboard controls, both themes, reduced motion, and no-JavaScript reading. Check inventory and source-link parity before publishing.

## Deploy

Publish the static repository root from `main` through GitHub Pages, retaining `.nojekyll`. Site: https://billy-enrizky.github.io/portfolio/. Review the intended files before publishing; no generated build directory is needed. Verify the deployed page separately from local preview.

## License

Content and personal assets belong to Muhammad Enrizky Brillian. See `LICENSE` for the template license.
