const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:8000/';
const out = path.resolve(process.env.TEST_OUTPUT_DIR || 'local_docs/responsive-edge-qa');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const [width, height] of [[667, 320], [740, 360], [844, 390]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + '?noanim');
      await page.locator('.appearance-controls summary').click();
      const panel = await page.locator('.appearance-panel').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, height: innerHeight };
      });
      if (panel.bottom > panel.height) failures.push(`Appearance extends below ${width}x${height}`);
      await page.locator('#motion-note').evaluate(element => element.scrollIntoView({ block: 'nearest' }));
      const note = await page.locator('#motion-note').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: innerHeight };
      });
      if (note.top < 0 || note.bottom > note.height) failures.push(`Motion explanation cannot be revealed at ${width}x${height}`);
      await page.screenshot({ path: path.join(out, `appearance-${width}x${height}.png`) });
    }
    await page.setViewportSize({ width: 320, height: 667 });
    await page.goto(base + '?noanim#project-mtp');
    await page.locator('.appearance-controls').evaluate(element => { element.open = false; });
    await page.locator('#project-mtp > details').evaluate(element => { element.open = true; });
    await page.locator('.mtp-table').scrollIntoViewIfNeeded();
    const cells = await page.locator('.mtp-table :is(th,td)').evaluateAll(elements => elements.map(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return { text: element.textContent.trim(), lines: range.getClientRects().length };
    }));
    if (cells.some(cell => cell.lines !== 1)) failures.push('MTP headers or numeric values wrap inside a cell at 320px');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The page must not overflow horizontally');
    const tableRegion = page.getByRole('region', { name: 'MTP benchmark results', exact: true });
    await tableRegion.focus();
    if (await tableRegion.evaluate(element => element.scrollWidth > element.clientWidth)) {
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(() => document.querySelector('.table-scroll').scrollLeft > 0);
      await tableRegion.evaluate(element => { element.scrollLeft = 0; });
    }
    await page.screenshot({ path: path.join(out, 'mtp-320.png') });
    for (const id of ['skill-panel-ai', 'skill-panel-teaching']) {
      await page.goto(base + '?noanim#' + id);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      if (!await page.locator('#' + id).isVisible()) failures.push(`${id} fragment remains hidden`);
      if (await page.locator(`[role="tab"][aria-controls="${id}"]`).getAttribute('aria-selected') !== 'true') failures.push(`${id} fragment does not select its skill tab`);
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const mode of ['noanim', 'paused']) {
      if (mode === 'paused') await page.evaluate(() => localStorage.setItem('portfolio-motion-v1', JSON.stringify({ mode: 'paused' })));
      await page.goto(base + (mode === 'noanim' ? '?noanim' : '') + '#project-context-atlas');
      const image = page.locator('#project-context-atlas .project-image');
      await page.locator('#project-context-atlas .project-image-link').hover();
      if (await image.evaluate(element => getComputedStyle(element).transform) !== 'none') failures.push(`Nested project image moves under ${mode}`);
    }
    fs.writeFileSync(path.join(out, 'responsive-edges.json'), JSON.stringify({ failures, cells }, null, 2));
    assert.deepEqual(failures, []);
    process.stdout.write('PASS: short-landscape settings stay reachable and narrow-screen benchmark cells stay intact.\n');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
