# Muhammad Enrizky Brillian: Software and AI Infrastructure Portfolio

A static portfolio for software engineering, AI infrastructure, model serving, and data platform roles.

## Positioning

I build the systems between AI research and production: agent runtimes, browser infrastructure, applied ML, and the data platforms around them.

## Sections

- Summary: software engineering focus and selected proof points.
- Technical skills: model serving, data, backend, browser, cloud, and core concepts.
- Experience: IBM and Sanofi, with business impact next to the technical work.
- Education: University of Toronto and Georgia Tech, with GPA, coursework, and awards.
- Research: STAD68 and STAD80 course papers from 2026, with exact results.
- Selected work: OpenBrowser, Context Atlas, the MTP benchmark, and enterprise AI infrastructure.
- Systems lab: Baton and Muse Spark kernel work.
- Contact.

## Evidence

- OpenBrowser: 53,327 PyPI downloads from Pepy on November 10, 2026, 279 GitHub stars, 52 releases, and 7,007 test functions.
- Model serving: 10,410.60 tok/s at N=512, $0.77 per million tokens at N=512, and 172x lower cost than N=1.
- MTP benchmark: 144/144 runs, 8.9x to 26.8x vLLM versus Transformers, and 2.06x on A10 code prompts.
- Enterprise delivery: 1,400,883-row BigQuery fact table, 984 files to pre-production in 24 weeks, and January to September control totals within $0.11.

Each public metric states its scope. Projected metrics are not presented as achieved.

## Local Preview

```bash
uv run python -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

## Checks

```bash
npx html-validate index.html
"$HOME/.agents/skills/impeccable/scripts/impeccable" detect --json index.html css/style.css js/script.js
```

The site loads local Satoshi and JetBrains Mono files. It has no build step. GitHub Pages serves `main` at https://billy-enrizky.github.io/portfolio/.

## Deploy

```bash
git add .
git commit -m "Redesign portfolio around systems evidence"
git push origin main
```

## License

Content and personal assets belong to Muhammad Enrizky Brillian. See `LICENSE` for the template license.
