# Muhammad Enrizky Brillian: Software and AI Infrastructure Portfolio

A complete static portfolio covering professional work, academic and healthcare research, software projects, data analysis, teaching, education, and credentials.

## Positioning

I build the systems between AI research and production: agent runtimes, browser infrastructure, applied ML, and the data platforms around them.

## Sections

- Summary: career scope and independent technical-focus categories.
- Technical skills: model serving, data, backend, browser, cloud, and core concepts.
- Experience: eleven professional and research records recovered from Git history, with newer IBM delivery, the original achievements, and teaching restored.
- Education: University of Toronto and Georgia Tech, with the corrected GPA, coursework, awards, co-op distinction, graduate admissions, and three campus service roles.
- Research: expanded STAD68 and STAD80 paper summaries, with methods, findings, and evaluation scope.
- Certifications and credentials: Anthropic, OpenAI, Google, IBM, Microsoft, and AWS records, with training distinguished from certifications.
- Case studies: OpenBrowser, Context Atlas, the MTP benchmark, AI infrastructure, and a separate finance data-engineering case.
- Systems lab: Baton and Muse Spark kernel work.
- Project portfolio: all 24 original projects accounted for, including OpenBrowser in the current case studies and 23 additional project records.
- Contact.

## Evidence

- OpenBrowser: 53,327 PyPI downloads from Pepy on November 10, 2026, 279 GitHub stars, 52 releases, and 7,007 test functions.
- Model serving: 10,410.60 tok/s at N=512, $0.77 per million tokens at N=512, compared with $132.56 per million tokens at N=1.
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
git commit -m "Update the complete portfolio record"
git push origin main
```

## License

Content and personal assets belong to Muhammad Enrizky Brillian. See `LICENSE` for the template license.
