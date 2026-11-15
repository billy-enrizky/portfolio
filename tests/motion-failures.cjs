'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BASE = new URL(process.env.PORTFOLIO_URL || process.env.BASE || 'http://127.0.0.1:8000/');
const OUT = process.env.TEST_OUTPUT_DIR || 'local_docs/motion-failure-qa';
const SOURCE = process.argv.includes('--source');
const ROOT = path.resolve(__dirname, '..');
const KEY = 'portfolio-motion-v1';
const HOST = '.hero-project-tile';
const BUTTON = '#hero-motion-toggle';
const report = {
  base: BASE.href,
  runtime: SOURCE ? 'Test-routed in-memory esbuild bundle and source controller' : 'Server controller and generated bundle',
  environment: 'Headless Chromium with ANGLE SwiftShader software WebGL',
  limitations: ['Synthetic persisted pagehide/pageshow events do not establish real BFCache admission.'],
  cases: []
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function instrument({ failWrites = false, delayFonts = false, failDecode = false, saveData = false }) {
  const probe = { failedWrites: [], storageReads: 0, decodeAttempts: [], created: [], revoked: [], draws: 0, contexts: 0, textureUploads: [] };
  const getItem = Storage.prototype.getItem;
  const setItem = Storage.prototype.setItem;
  Storage.prototype.getItem = function (key) {
    if (key === 'portfolio-motion-v1') probe.storageReads += 1;
    return getItem.call(this, key);
  };
  probe.failWrites = failWrites;
  Storage.prototype.setItem = function (key, value) {
    if (key === 'portfolio-motion-v1' && probe.failWrites) {
      probe.failedWrites.push(value);
      throw new DOMException('Injected write-only quota failure', 'QuotaExceededError');
    }
    return setItem.call(this, key, value);
  };
  if (delayFonts) {
    const actualReady = document.fonts.ready;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const ready = Promise.all([actualReady, gate]).then(() => document.fonts);
    Object.defineProperty(document.fonts, 'ready', { configurable: true, get: () => ready });
    probe.releaseFonts = release;
  }
  if (saveData) {
    Object.defineProperty(navigator.connection, 'saveData', { configurable: true, get: () => true });
  }
  const createURL = URL.createObjectURL;
  const revokeURL = URL.revokeObjectURL;
  probe.foreignURL = createURL.call(URL, new Blob(['not owned by the scene']));
  URL.createObjectURL = function (blob) {
    const url = createURL.call(this, blob);
    probe.created.push(url);
    return url;
  };
  URL.revokeObjectURL = function (url) {
    probe.revoked.push(url);
    return revokeURL.call(this, url);
  };
  const decode = window.createImageBitmap;
  window.createImageBitmap = function (blob, ...args) {
    probe.decodeAttempts.push({ type: blob.type, bytes: blob.size });
    if (failDecode) return Promise.reject(new DOMException('Injected texture decode rejection', 'InvalidStateError'));
    return decode.call(this, blob, ...args);
  };
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
    const context = getContext.call(this, kind, ...args);
    if (kind === 'webgl2' && context) probe.contexts += 1;
    return context;
  };
  for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Type) continue;
    for (const name of ['drawArrays', 'drawElements', 'drawRangeElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const descriptor = Object.getOwnPropertyDescriptor(Type.prototype, name);
      if (typeof descriptor?.value !== 'function') continue;
      Object.defineProperty(Type.prototype, name, { ...descriptor, value: function (...args) {
        if (this.canvas.classList.contains('motion-canvas')) probe.draws += 1;
        return descriptor.value.apply(this, args);
      } });
    }
    for (const name of ['texImage2D', 'texSubImage2D']) {
      const descriptor = Object.getOwnPropertyDescriptor(Type.prototype, name);
      if (!descriptor) continue;
      Object.defineProperty(Type.prototype, name, { ...descriptor, value: function (...args) {
        const image = args.find(value => value instanceof ImageBitmap);
        if (image && this.canvas.classList.contains('motion-canvas')) probe.textureUploads.push({ width: image.width, height: image.height });
        return descriptor.value.apply(this, args);
      } });
    }
  }
  probe.checkGPU = () => {
    const canvas = document.createElement('canvas');
    const gl = getContext.call(canvas, 'webgl2');
    if (!gl) throw new Error('Software WebGL2 unavailable. GPU coverage cannot pass.');
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const info = { version: gl.getParameter(gl.VERSION), renderer: gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER) };
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return info;
  };
  window.__motionFailureProbe = probe;
}

async function frames(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function mode(page, expected) {
  assert.equal(await page.locator('html').getAttribute('data-motion-state'), expected);
  for (const selector of [BUTTON, '#appearance-motion-toggle']) {
    assert.equal(await page.locator(selector).textContent(), expected === 'paused' ? 'Play motion' : 'Pause motion');
    assert.equal(await page.locator(selector).isDisabled(), false);
  }
}

async function terminal(page) {
  await page.waitForFunction(selector => ['ready', 'fallback'].includes(document.querySelector(selector)?.dataset.sceneState), HOST);
}

async function quiet(page) {
  await pause(200);
  const before = await page.evaluate(() => window.__motionFailureProbe.draws);
  await pause(350);
  const after = await page.evaluate(() => window.__motionFailureProbe.draws);
  assert.equal(after, before, 'Terminal fallback must not continue drawing');
  return { before, after };
}

async function allRevoked(page) {
  const urls = await page.evaluate(() => ({ created: window.__motionFailureProbe.created, revoked: window.__motionFailureProbe.revoked }));
  assert.ok(urls.created.length > 0, 'The real loader must create an embedded texture Blob URL');
  assert.deepEqual(urls.created.filter(url => !urls.revoked.includes(url)), [], 'Every loader-owned Blob URL must be revoked, including on decode rejection');
  assert.equal(await page.evaluate(async () => (await fetch(window.__motionFailureProbe.foreignURL)).text()), 'not owned by the scene', 'Scene cleanup must not revoke unrelated Blob URLs');
  return urls;
}

let browser;
let bundle;
async function fixture(options, run) {
  const { seed = null, ...instrumentation } = options;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference',
    storageState: { cookies: [], origins: [{ origin: BASE.origin, localStorage: seed === null ? [] : [{ name: KEY, value: seed }] }] }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/\/(motion-scene\.bundle\.js|openbrowser-scene\.glb)(\?|$)/.test(request.url())) requests.push(request.url());
  });
  if (SOURCE) {
    await page.route(/\/js\/motion-scene\.bundle\.js(?:\?|$)/, route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
    await page.route(/\/js\/motion\.js(?:\?|$)/, route => route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'js/motion.js'), 'utf8') }));
  }
  await page.addInitScript(instrument, instrumentation);
  try {
    await page.goto(BASE.href, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    const evidence = await run({ page, context, requests });
    assert.deepEqual(errors, [], 'No unexpected application exceptions');
    return evidence;
  } finally { await context.close(); }
}

const cases = [];
const test = (name, run) => cases.push({ name, run });

for (const seed of [null, '{"mode":"auto"}']) {
  test(`Write-only quota failure preserves visit choice through late fonts and persisted lifecycle, ${seed === null ? 'missing' : 'old'} storage`, () => fixture({ seed, failWrites: true, delayFonts: true, saveData: true }, async ({ page, requests }) => {
    await mode(page, 'active');
    assert.equal(await page.locator('.motion-name-content').count(), 0, 'Fonts-ready startup must still be held before the click');
    await page.locator(BUTTON).click();
    await mode(page, 'paused');
    const stored = await page.evaluate(key => ({ value: localStorage.getItem(key), reads: window.__motionFailureProbe.storageReads, failures: window.__motionFailureProbe.failedWrites }), KEY);
    assert.equal(stored.value, seed, 'Storage reads still succeed and return the missing or stale value');
    assert.ok(stored.reads > 0);
    assert.deepEqual(stored.failures, ['{"mode":"paused"}']);
    await page.evaluate(() => window.__motionFailureProbe.releaseFonts());
    await page.waitForFunction(() => document.querySelector('.motion-name-content'));
    await frames(page);
    await mode(page, 'paused');
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      await frames(page);
      await mode(page, 'paused');
    }
    await page.locator(BUTTON).click();
    await mode(page, 'active');
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await mode(page, 'active');
    await page.locator(BUTTON).click();
    await mode(page, 'paused');
    assert.deepEqual(requests, [], 'saveData isolates preference behavior from optional scene loading');
    return stored;
  }));
}

test('Failed-write visit pause survives pageshow without a delayed-font dependency', () => fixture({ failWrites: true, saveData: true }, async ({ page }) => {
  await page.waitForFunction(() => document.querySelector('.motion-name-content'));
  await page.locator(BUTTON).click();
  await mode(page, 'paused');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await mode(page, 'paused');
}));

test('A genuine cross-tab motion update, removal or clear supersedes the failed-write visit choice', () => fixture({ failWrites: true, saveData: true }, async ({ page, context }) => {
  await page.waitForFunction(() => document.querySelector('.motion-name-content'));
  const driver = await context.newPage();
  const url = new URL(BASE);
  url.searchParams.set('noanim', '');
  await driver.goto(url.href, { waitUntil: 'load' });
  for (const action of ['update', 'remove', 'clear']) {
    if (action !== 'update') {
      await driver.evaluate(key => localStorage.setItem(key, '{"mode":"auto"}'), KEY);
      await frames(page);
    }
    await page.locator(BUTTON).click();
    await mode(page, 'paused');
    await driver.evaluate(() => localStorage.setItem('unrelated-motion-test', String(Math.random())));
    await frames(page);
    await mode(page, 'paused');
    await driver.evaluate(({ key, action }) => {
      if (action === 'update') localStorage.setItem(key, '{"mode":"auto","source":"other-tab"}');
      if (action === 'remove') localStorage.removeItem(key);
      if (action === 'clear') localStorage.clear();
    }, { key: KEY, action });
    await page.waitForFunction(() => document.documentElement.dataset.motionState === 'active');
    await mode(page, 'active');
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await mode(page, 'active');
  }
}));

test('A later successful write replaces the visit override and survives reload', () => fixture({ failWrites: true, saveData: true }, async ({ page }) => {
  await page.waitForFunction(() => document.querySelector('.motion-name-content'));
  await page.locator(BUTTON).click();
  await mode(page, 'paused');
  await page.evaluate(() => { window.__motionFailureProbe.failWrites = false; });
  await page.locator(BUTTON).click();
  await mode(page, 'active');
  assert.equal(await page.evaluate(key => localStorage.getItem(key), KEY), '{"mode":"auto"}');
  await page.reload({ waitUntil: 'load' });
  await mode(page, 'active');
}));

test('Healthy embedded texture decodes, uploads and draws continuously with all Blob URLs released', () => fixture({}, async ({ page, requests }) => {
  const gpu = await page.evaluate(() => window.__motionFailureProbe.checkGPU());
  await terminal(page);
  assert.equal(await page.locator(HOST).getAttribute('data-scene-state'), 'ready', 'GPU unavailability or fallback is not a rendering pass');
  const before = await page.evaluate(() => window.__motionFailureProbe.draws);
  await page.waitForFunction(count => window.__motionFailureProbe.draws > count, before);
  const observed = await page.evaluate(() => ({ contexts: window.__motionFailureProbe.contexts, decodeAttempts: window.__motionFailureProbe.decodeAttempts, uploads: window.__motionFailureProbe.textureUploads, draws: window.__motionFailureProbe.draws }));
  assert.ok(observed.contexts > 0);
  assert.ok(observed.decodeAttempts.some(value => value.type === 'image/png' && value.bytes > 0));
  assert.ok(observed.uploads.some(value => value.width > 0 && value.height > 0), 'The real decoded logo must be uploaded to WebGL');
  assert.equal(requests.length, 2);
  return { gpu, observed, urls: await allRevoked(page) };
}));

for (const check of ['fallback', 'cleanup']) {
  test(`Real texture decode rejection restores terminal asset fallback and releases Blob URLs, ${check}`, () => fixture({ failDecode: true }, async ({ page, requests }) => {
    const gpu = await page.evaluate(() => window.__motionFailureProbe.checkGPU());
    await terminal(page);
    const decodes = await page.evaluate(() => window.__motionFailureProbe.decodeAttempts);
    assert.ok(decodes.some(value => value.type === 'image/png' && value.bytes > 0), 'The real loader must attempt to decode the embedded PNG');
    assert.equal(requests.filter(url => url.includes('openbrowser-scene.glb')).length, 1);
    if (check === 'cleanup') await allRevoked(page);
    assert.equal(await page.locator(HOST).getAttribute('data-scene-state'), 'fallback', 'An untextured Logo must never replace the intact poster');
    assert.equal(await page.locator(HOST).getAttribute('data-scene-reason'), 'asset');
    assert.equal(await page.locator(`${HOST} canvas`).count(), 0);
    assert.equal(await page.locator(HOST).evaluate(el => el.classList.contains('is-3d-ready')), false);
    const poster = page.locator(`${HOST} .motion-poster`);
    assert.equal(await poster.isVisible(), true);
    assert.equal(await poster.evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await poster.locator('img').evaluate(el => el.complete && el.naturalWidth > 0), true);
    const stopped = await quiet(page);
    const requestCount = requests.length;
    await page.locator(BUTTON).click();
    await mode(page, 'paused');
    await page.locator(BUTTON).click();
    await mode(page, 'active');
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
      dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      dispatchEvent(new Event('resize'));
    });
    await quiet(page);
    assert.equal(requests.length, requestCount, 'Terminal decode failure must not retry on controls or lifecycle changes');
    assert.equal(await page.locator(HOST).getAttribute('data-scene-state'), 'fallback');
    return { gpu, decodes, stopped, urls: await allRevoked(page) };
  }));
}

async function main() {
  if (SOURCE) {
    const result = require('esbuild').buildSync({ absWorkingDir: ROOT, entryPoints: ['js/motion-scene.js'], bundle: true, format: 'esm', minify: true, legalComments: 'inline', write: false });
    bundle = result.outputFiles[0].text;
  }
  browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  report.browser = browser.version();
  try {
    for (const entry of cases) {
      try {
        const evidence = await entry.run();
        report.cases.push({ name: entry.name, status: 'passed', evidence });
        console.log(`PASS ${entry.name}`);
      } catch (error) {
        report.cases.push({ name: entry.name, status: 'failed', error: error.stack });
        console.error(`FAIL ${entry.name}\n${error.stack}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
    report.summary = { passed: report.cases.filter(entry => entry.status === 'passed').length, failed: report.cases.filter(entry => entry.status === 'failed').length };
    if (OUT !== '-') {
      fs.mkdirSync(path.resolve(OUT), { recursive: true });
      fs.writeFileSync(path.resolve(OUT, 'failure-results.json'), JSON.stringify(report, null, 2) + '\n');
    }
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
