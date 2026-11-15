'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const BASE = new URL(process.env.PORTFOLIO_URL || 'http://127.0.0.1:8000/');
const OUT = path.resolve(process.env.TEST_OUTPUT_DIR || 'local_docs/motion-qa');
const FILTER = process.env.MOTION_RUNTIME_FILTER || '';
const MOTION = 'portfolio-motion-v1';
const APPEARANCE = 'portfolio-appearance';
const HOST = '.hero-project-tile';
const CANVAS = `${HOST} canvas.motion-canvas`;
const HERO_BUTTON = '#hero-motion-toggle';
const SETTINGS_BUTTON = '#appearance-motion-toggle';
const TARGETS = [[320, 667], [360, 740], [390, 844], [768, 1024], [844, 390], [1024, 900], [1440, 1000], [1920, 1080]];
const LINKS = [
  { project: 'project-context-atlas', wrapper: 'context-atlas-resources', id: 'context-atlas-article-link', href: 'https://openbrowser-landing.pages.dev/context-atlas-blog/', text: 'Read the Context Atlas article' },
  { project: 'project-openbrowser', wrapper: 'openbrowser-resources', id: 'openbrowser-comparison-link', href: 'https://docs.openbrowser.me/comparison', text: 'Compare CLI and MCP' }
];
const report = {
  environment: 'Headless Chromium with ANGLE SwiftShader software WebGL. No real-device performance claim.',
  launchArguments: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  originalRed: { observed: true, assertion: 'The live motion page needs bound pause controls in the hero and appearance settings', actual: 0, expected: 2, stage: 'Minimal verifier before HTML integration. Original red log is unchanged.' },
  limitations: ['Visibility and pagehide/pageshow events are simulated. This does not prove real BFCache admission or restoration.', 'saveData is a simulated Navigator connection input.', 'Record byte preservation and provenance belong to the separate preservation suite.'],
  cases: []
};

function instrumentWebGL({ unavailableGL = false, blockedStorage = false, saveData = false }) {
  const contexts = new Map();
  const batches = [];
  const metadata = [];
  const intersections = [];
  let intersectionObserver;
  let intersectionTarget;
  let total = 0;
  let attempts = 0;
  let batch = null;
  let currentRAF = null;
  let lastRAF = null;
  let frozenRAF = null;
  let visibility = 'visible';
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (callback) {
    return raf.call(this, timestamp => {
      const previous = currentRAF;
      currentRAF = timestamp;
      lastRAF = timestamp;
      try { return callback(frozenRAF === null ? timestamp : frozenRAF); }
      finally { currentRAF = previous; }
    });
  };
  function record(gl, method) {
    const entry = contexts.get(gl);
    if (!entry) return;
    total += 1;
    if (!batch || batch.canvas !== entry.id) {
      batch = { canvas: entry.id, raf: currentRAF, time: performance.now(), connected: gl.canvas.isConnected, calls: 0, methods: {} };
      if (intersectionTarget) Object.assign(batch, { rectangle: intersectionTarget.getBoundingClientRect().toJSON(), intersectionIndex: intersections.length - 1 });
      batches.push(batch);
      const owned = batch;
      queueMicrotask(() => { if (batch === owned) batch = null; });
    }
    batch.calls += 1;
    batch.methods[method] = (batch.methods[method] || 0) + 1;
  }
  for (const Type of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!Type) continue;
    for (const method of ['drawArrays', 'drawElements', 'drawRangeElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const descriptor = Object.getOwnPropertyDescriptor(Type.prototype, method);
      if (typeof descriptor?.value !== 'function') continue;
      const original = descriptor.value;
      Object.defineProperty(Type.prototype, method, { ...descriptor, value: function (...args) {
        record(this, method);
        return original.apply(this, args);
      } });
    }
  }
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
    const isGL = /^(webgl2?|experimental-webgl)$/.test(kind);
    if (isGL) attempts += 1;
    if (isGL && unavailableGL) return null;
    const gl = getContext.call(this, kind, ...args);
    if (!isGL || !gl || contexts.has(gl)) return gl;
    const id = contexts.size + 1;
    contexts.set(gl, { id, gl });
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    metadata.push({ id, version: gl.getParameter(gl.VERSION), renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) });
    const extension = gl.getExtension;
    const wrappedExtensions = new WeakSet();
    gl.getExtension = function (name) {
      const result = extension.call(this, name);
      if (name === 'ANGLE_instanced_arrays' && result && !wrappedExtensions.has(result)) {
        wrappedExtensions.add(result);
        for (const method of ['drawArraysInstancedANGLE', 'drawElementsInstancedANGLE']) {
          const original = result[method];
          result[method] = function (...values) { record(gl, method); return original.apply(this, values); };
        }
      }
      return result;
    };
    return gl;
  };
  if (blockedStorage) Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage unavailable', 'SecurityError'); } });
  if (saveData) {
    const connection = navigator.connection || new EventTarget();
    Object.defineProperty(connection, 'saveData', { configurable: true, get: () => true });
    if (!navigator.connection) Object.defineProperty(navigator, 'connection', { get: () => connection });
  }
  window.__motionRuntimeProbe = {
    snapshot: () => ({ now: performance.now(), rectangle: intersectionTarget?.getBoundingClientRect().toJSON(), intersections: intersections.slice(), total, attempts, batches: batches.map(value => ({ ...value, methods: { ...value.methods } })), contexts: metadata.slice() }),
    observeIntersection(selector) {
      intersectionObserver?.disconnect();
      intersections.length = 0;
      intersectionTarget = document.querySelector(selector);
      intersectionObserver = new IntersectionObserver(entries => {
        for (const entry of entries) intersections.push({ queuedAt: entry.time, deliveredAt: performance.now(), isIntersecting: entry.isIntersecting, rectangle: entry.boundingClientRect.toJSON(), currentRectangle: intersectionTarget.getBoundingClientRect().toJSON(), total, batchCount: batches.length });
      }, { threshold: 0 });
      intersectionObserver.observe(intersectionTarget);
    },
    freezeClock() { if (lastRAF === null) throw new Error('No observed animation frame'); frozenRAF = lastRAF; },
    unfreezeClock() { frozenRAF = null; },
    setVisibility(value) {
      visibility = value;
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => visibility === 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    },
    loseContext() {
      for (const { gl } of contexts.values()) {
        if (!gl.canvas.isConnected) continue;
        const extension = gl.getExtension('WEBGL_lose_context');
        if (!extension) return false;
        extension.loseContext();
        return true;
      }
      return false;
    }
  };
}

function url({ noanim = false, hash = '' } = {}) {
  const value = new URL(BASE);
  value.searchParams.delete('noanim');
  if (noanim) value.searchParams.set('noanim', '');
  value.hash = hash;
  return value.href;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sample = page => page.evaluate(() => window.__motionRuntimeProbe.snapshot());

async function settle(page, milliseconds = 100) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  if (milliseconds) await pause(milliseconds);
}
async function load(page, options) {
  await page.goto(url(options), { waitUntil: 'load' });
  await settle(page);
}
async function state(page, value) {
  await page.waitForFunction(expected => document.documentElement.dataset.motionState === expected, value);
}
async function labels(page, expected, disabled = false) {
  for (const selector of [HERO_BUTTON, SETTINGS_BUTTON]) {
    const button = page.locator(selector);
    assert.equal((await button.textContent()).trim(), expected, `${selector} must expose the current action`);
    assert.equal(await button.isDisabled(), disabled);
    assert.equal(await button.getAttribute('aria-describedby'), 'motion-note');
  }
}
async function ready(page) {
  await page.waitForFunction(selector => ['ready', 'fallback', 'disposed'].includes(document.querySelector(selector)?.dataset.sceneState), HOST);
  assert.equal(await page.locator(HOST).getAttribute('data-scene-state'), 'ready', 'A static fallback is not a successful 3D result');
  assert.equal(await page.locator(CANVAS).count(), 1);
  assert.equal(await page.locator(CANVAS).isVisible(), true);
  assert.equal(await page.locator(CANVAS).getAttribute('aria-hidden'), 'true');
  assert.equal(await page.locator(HOST).evaluate(el => el.classList.contains('is-3d-ready')), true);
  const observed = await sample(page);
  assert.ok(observed.total > 0, 'Ready must follow an actual WebGL draw, not a product state flag');
  assert.ok(observed.contexts.length > 0, 'A real WebGL context must exist');
}
async function positive(page, label) {
  const before = await sample(page);
  await page.waitForFunction(({ calls, batches }) => {
    const observed = window.__motionRuntimeProbe.snapshot();
    return observed.total > calls && observed.batches.slice(batches).filter(value => value.connected).length > 1;
  }, { calls: before.total, batches: before.batches.length });
  const after = await sample(page);
  assert.ok(after.total > before.total, `${label} must produce actual WebGL draw calls`);
  const observed = after.batches.slice(before.batches.length).filter(value => value.connected);
  assert.ok(observed.length > 1, `${label} must continue drawing beyond one still frame`);
  assert.equal(new Set(observed.map(value => value.canvas)).size, 1, `${label} must have one drawing canvas`);
  const ticks = new Set();
  for (const batch of observed) {
    if (batch.raf === null) continue;
    const tick = `${batch.canvas}:${batch.raf}`;
    assert.ok(!ticks.has(tick), `${label} must not run duplicate renderer callbacks in one browser frame`);
    ticks.add(tick);
  }
  return { calls: after.total - before.total, drawBatches: observed.length, contexts: after.contexts };
}
async function quiet(page, label, intersection = null) {
  if (!intersection) await pause(350);
  const before = await sample(page);
  await pause(450);
  const after = await sample(page);
  const baseline = intersection?.total ?? before.total;
  assert.equal(after.total, baseline, `${label} must not keep drawing in a settled window without a redraw action\n${JSON.stringify({ intersection, before: { now: before.now, total: before.total, rectangle: before.rectangle, intersections: before.intersections }, after: { now: after.now, total: after.total, rectangle: after.rectangle, intersections: after.intersections }, newBatches: after.batches.slice(intersection?.batchCount ?? before.batches.length) })}`);
  return { callsBefore: baseline, callsAfter: after.total, observationMilliseconds: 450, startedAt: before.now, endedAt: after.now, ...(intersection ? { intersection } : {}) };
}
async function oneShot(page, action, label) {
  await quiet(page, `${label} baseline`);
  const before = await sample(page);
  await action();
  await settle(page, 350);
  const after = await sample(page);
  assert.equal(after.batches.length - before.batches.length, 1, `${label} must render exactly one still frame`);
  assert.ok(after.total > before.total, `${label} must perform an actual redraw`);
  await quiet(page, `${label} after its one-shot redraw`);
}
async function poster(page) {
  assert.equal(await page.locator(`${HOST} .motion-poster`).isVisible(), true);
  assert.equal(await page.locator(`${HOST} .motion-poster img`).evaluate(el => el.complete && el.naturalWidth > 0), true);
  assert.equal(await page.locator(HOST).evaluate(el => el.classList.contains('is-3d-ready')), false);
  assert.equal(await page.locator(HOST).getAttribute('href'), '#project-openbrowser');
}
async function records(page) {
  for (const [selector, count] of [['.role-record', 11], ['.project-record', 30], ['.paper-record', 2], ['.credential-group li', 27], ['.education-entry:has(.ledger-meta)', 2], ['.education-entry > .ledger-list > li', 3]]) {
    assert.equal(await page.locator(selector).count(), count, `${selector} preserves the original record count`);
  }
  assert.equal((await page.locator('h1').textContent()).replace(/\s+/g, ' ').trim(), 'Muhammad Enrizky Brillian');
  assert.equal(await page.locator('main img[src*="portrait" i]').count(), 0);
  for (const link of LINKS) {
    assert.equal(await page.locator(`#${link.id}`).count(), 1);
    assert.equal(await page.locator(`#${link.wrapper}`).count(), 1);
    assert.deepEqual(await page.locator(`#${link.id}`).evaluate(el => ({ href: el.getAttribute('href'), text: el.textContent.trim(), attrs: el.getAttributeNames().sort() })), { href: link.href, text: link.text, attrs: ['href', 'id'] });
    assert.deepEqual(await page.locator(`#${link.wrapper}`).evaluate(el => ({ parent: el.parentElement.id, previous: el.previousElementSibling.className, next: el.nextElementSibling.tagName, children: el.children.length, attrs: el.getAttributeNames().sort(), inDetails: Boolean(el.closest('details')), text: el.textContent.trim() })), { parent: link.project, previous: 'project-outcome', next: 'DETAILS', children: 1, attrs: ['class', 'id'], inDetails: false, text: link.text });
  }
  assert.equal(await page.getByRole('link', { name: 'Read the comparison', exact: true, includeHidden: true }).count(), 1, 'The original comparison link remains');
}
async function readable(page, selector) {
  const problems = await page.locator(selector).evaluateAll(elements => {
    const errors = [];
    for (const el of elements) {
      if (el.closest('[hidden]') || el.closest('details:not([open])') || el.closest('.sr-only')) continue;
      for (let parent = el; parent && parent !== document.body; parent = parent.parentElement) {
        const css = getComputedStyle(parent);
        if (Number(css.opacity) !== 1 || css.visibility !== 'visible' || css.display === 'none') {
          errors.push(`${el.id || el.className || el.tagName} has hidden or faded text`);
          break;
        }
      }
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('.sr-only')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          if (rect.left < -1 || rect.right > innerWidth + 1) errors.push(`Text exceeds viewport in ${el.id || el.className || el.tagName}`);
          for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
            const css = getComputedStyle(parent);
            const bounds = parent.getBoundingClientRect();
            if (['hidden', 'clip'].includes(css.overflowX) && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) errors.push(`Horizontal text clip in ${el.id || el.className || el.tagName}`);
            if (['hidden', 'clip'].includes(css.overflowY) && (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)) errors.push(`Vertical text clip in ${el.id || el.className || el.tagName}`);
          }
        }
      }
    }
    return [...new Set(errors)];
  });
  assert.deepEqual(problems, [], 'Complete text must remain readable without a film viewport or frozen reveal masks');
}
const PROSE = '.hero-intro, .project-purpose, .project-outcome, .outcome-copy p';
const CONTENT = `h1, .section-heading h2, main h3, ${PROSE}, .hero-actions a, .hero-artwork figcaption a, main details[open] p, main details[open] li`;
const READING = `${CONTENT}, ${HERO_BUTTON}`;
async function clippedCanvasShot(page) {
  const box = await page.locator(CANVAS).boundingBox();
  const size = page.viewportSize();
  assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= size.width && box.y + box.height <= size.height, 'The real-app scroll comparison keeps the complete canvas in view');
  return page.screenshot({ clip: box });
}
async function bounded(promise, message) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 7000); })]); }
  finally { clearTimeout(timer); }
}
async function holdRequest(page, expression) {
  let release;
  let requested;
  const gate = new Promise(resolve => { release = resolve; });
  const opened = new Promise(resolve => { requested = resolve; });
  const handlers = [];
  const errors = [];
  await page.route(expression, route => {
    const handling = (async () => {
      requested();
      await gate;
      try { await route.continue(); } catch (error) { errors.push(error.message); }
    })();
    handlers.push(handling);
    return handling;
  });
  return { opened: () => bounded(opened, `The delayed resource was never requested (${expression})`), release, async finish() { release(); await Promise.all(handlers); }, count: () => handlers.length, errors };
}

let browser;
async function fixture(options, run) {
  const { seed = {}, unavailableGL = false, blockedStorage = false, saveData = false, ...contextOptions } = options;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', colorScheme: 'light', ...contextOptions,
    storageState: { cookies: [], origins: [{ origin: BASE.origin, localStorage: Object.entries(seed).map(([name, value]) => ({ name, value })) }] }
  });
  const errors = [];
  const sceneRequests = [];
  const remoteRequests = [];
  await context.addInitScript(instrumentWebGL, { unavailableGL, blockedStorage, saveData });
  context.on('page', page => {
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
  });
  context.on('request', request => {
    const resource = new URL(request.url());
    if (/\/(motion-scene\.bundle\.js|openbrowser-scene\.glb)$/.test(resource.pathname)) sceneRequests.push(resource.pathname);
    if (/^https?:$/.test(resource.protocol) && resource.origin !== BASE.origin) remoteRequests.push(resource.origin + resource.pathname);
  });
  const page = await context.newPage();
  try {
    const result = await run({ page, context, sceneRequests, errors });
    assert.deepEqual(errors, [], 'No unexpected application exceptions');
    assert.deepEqual(remoteRequests, [], 'The page must not add third-party runtime requests or telemetry');
    return result;
  } finally { await context.close(); }
}
const cases = [];
const test = (name, run, { requiresScene = true } = {}) => cases.push({ name, run, requiresScene });

test('Verifier-only software WebGL probe sees every core draw entry point', () => fixture({}, async ({ page }) => {
  await page.goto('about:blank');
  const observed = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('Software WebGL2 is unavailable. This is not a successful 3D verification environment.');
    const program = gl.createProgram();
    for (const [type, source] of [
      [gl.VERTEX_SHADER, '#version 300 es\nvoid main(){vec2 p[3]=vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));gl_Position=vec4(p[gl_VertexID],0.,1.);}'],
      [gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float;out vec4 color;void main(){color=vec4(1.,0.,0.,1.);}']
    ]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2]), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
    gl.drawElementsInstanced(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0, 1);
    gl.drawRangeElements(gl.TRIANGLES, 0, 2, 3, gl.UNSIGNED_SHORT, 0);
    return { error: gl.getError(), ...window.__motionRuntimeProbe.snapshot() };
  });
  assert.equal(observed.error, 0);
  assert.equal(observed.total, 5);
  assert.deepEqual(observed.batches[0].methods, { drawArrays: 1, drawArraysInstanced: 1, drawElements: 1, drawElementsInstanced: 1, drawRangeElements: 1 });
  await quiet(page, 'Verifier-only canary after its explicit calls');
  return { productionRendererProof: false, ...observed };
}), { requiresScene: false });

test('Real 3D frames, pause persistence, and permitted paused still redraws', () => fixture({}, async ({ page, sceneRequests }) => {
  await load(page);
  await ready(page);
  await labels(page, 'Pause motion');
  const activity = await positive(page, 'Active hero');
  const first = await page.locator(CANVAS).screenshot({ path: path.join(OUT, 'active-first.png') });
  await pause(320);
  const second = await page.locator(CANVAS).screenshot({ path: path.join(OUT, 'active-second.png') });
  assert.notEqual(hash(first), hash(second), 'Actual canvas pixels must change while the hero is active');
  await page.locator(HERO_BUTTON).click();
  await state(page, 'paused');
  await labels(page, 'Play motion');
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), MOTION), { mode: 'paused' });
  const stopped = await quiet(page, 'Explicit pause');
  const still = await page.locator(CANVAS).screenshot();
  await pause(300);
  assert.equal(hash(await page.locator(CANVAS).screenshot()), hash(still), 'Paused canvas pixels must remain still');
  await oneShot(page, () => page.setViewportSize({ width: 1400, height: 980 }), 'Paused viewport resize');
  await page.locator('.appearance-controls summary').click();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await quiet(page, 'A palette change queues its still frame while the popover is open');
  await oneShot(page, () => page.locator('.appearance-controls summary').click(), 'Deferred paused palette redraw');
  const requestedBeforeReload = sceneRequests.length;
  await page.reload();
  await settle(page, 450);
  await state(page, 'paused');
  await labels(page, 'Play motion');
  assert.equal(sceneRequests.length, requestedBeforeReload, 'A persisted pause must not initiate the scene import or model request on reload');
  await poster(page);
  await page.locator(HERO_BUTTON).click();
  await ready(page);
  await positive(page, 'Explicit resume after a paused reload');
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), MOTION), { mode: 'auto' });
  return { activity, stopped, frameSHA256: [hash(first), hash(second)] };
}));

for (const scenario of [
  { name: 'OS reduced motion', options: { reducedMotion: 'reduce' }, state: 'reduced', label: 'Motion reduced', disabled: true },
  { name: 'noanim overriding OS reduction', options: { reducedMotion: 'reduce' }, navigation: { noanim: true }, state: 'disabled', label: 'Motion off', disabled: true },
  { name: 'noanim', options: {}, navigation: { noanim: true }, state: 'disabled', label: 'Motion off', disabled: true },
  { name: 'persisted pause', options: { seed: { [MOTION]: '{"mode":"paused"}' } }, state: 'paused', label: 'Play motion', disabled: false },
  { name: 'simulated saveData', options: { saveData: true }, state: 'active', label: 'Pause motion', disabled: false },
  { name: 'offscreen deep link', options: {}, navigation: { hash: 'project-openbrowser' }, label: 'Pause motion', disabled: false }
]) test(`No initial 3D network under ${scenario.name}`, () => fixture(scenario.options, async ({ page, sceneRequests }) => {
  await load(page, scenario.navigation);
  await settle(page, 500);
  if (scenario.state) await state(page, scenario.state);
  await labels(page, scenario.label, scenario.disabled);
  assert.deepEqual(sceneRequests, [], 'Neither the optional bundle nor GLB may be requested during a gated startup');
  assert.equal((await sample(page)).total, 0);
  await poster(page);
  if (scenario.navigation?.hash) {
    assert.equal(new URL(page.url()).hash, '#project-openbrowser');
    await readable(page, '#project-openbrowser h3, #project-openbrowser > p');
    assert.ok(await page.locator(HOST).evaluate(el => el.getBoundingClientRect().bottom <= 0), 'The deep link must really leave the hero offscreen');
  } else await readable(page, READING);
}), { requiresScene: false });

test('Strict storage envelopes and primitive mode membership', () => fixture({ unavailableGL: true }, async ({ page, sceneRequests }) => {
  await load(page, { noanim: true });
  const invalid = [null, 'not json', 'null', '[]', '["paused"]', '"paused"', 'true', '7', '{}', '{"mode":"unknown"}', '{"mode":null}', '{"mode":true}', '{"mode":7}', '{"mode":["paused"]}', '{"mode":{"value":"paused"}}'];
  for (const raw of invalid) {
    await page.evaluate(({ key, raw }) => { if (raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw); }, { key: MOTION, raw });
    await load(page);
    await state(page, 'active');
    await labels(page, 'Pause motion');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), MOTION), raw, 'Invalid input defaults to auto without writing an unsolicited preference');
  }
  await page.evaluate(key => localStorage.setItem(key, '{"mode":"paused","extra":"ignored"}'), MOTION);
  const count = sceneRequests.length;
  await page.reload();
  await settle(page, 450);
  await state(page, 'paused');
  await labels(page, 'Play motion');
  assert.equal(sceneRequests.length, count, 'Valid paused envelopes may contain ignored extra fields');
  return { invalidEnvelopes: invalid.length };
}), { requiresScene: false });

test('Real cross-tab malformed mode updates default to auto without touching appearance storage', () => fixture({ unavailableGL: true }, async ({ page, context }) => {
  await load(page);
  const driver = await context.newPage();
  await load(driver, { noanim: true });
  await driver.evaluate(key => localStorage.setItem(key, '{"theme":"dark","color":"blue"}'), APPEARANCE);
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark' && document.documentElement.dataset.color === 'blue');
  for (const raw of ['not json', 'null', '[]', '"paused"', '{}', '{"mode":["paused"]}', '{"mode":{"value":"paused"}}']) {
    await driver.evaluate(key => localStorage.setItem(key, '{"mode":"paused"}'), MOTION);
    await state(page, 'paused');
    await driver.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: MOTION, raw });
    await state(page, 'active');
    await labels(page, 'Pause motion');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), APPEARANCE), '{"theme":"dark","color":"blue"}');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), MOTION), raw);
  }
}), { requiresScene: false });

test('Real cross-tab storage, removal, clear, and independent appearance preferences', () => fixture({}, async ({ page, context }) => {
  await load(page);
  await ready(page);
  const other = await context.newPage();
  await load(other);
  await ready(other);
  await page.locator(HERO_BUTTON).click();
  await state(other, 'paused');
  await labels(other, 'Play motion');
  const savedMotion = await page.evaluate(key => localStorage.getItem(key), MOTION);
  await page.locator('.appearance-controls summary').click();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.getByRole('radio', { name: 'Pink', exact: true }).check();
  await other.waitForFunction(() => document.documentElement.dataset.theme === 'dark' && document.documentElement.dataset.color === 'pink');
  assert.equal(await page.evaluate(key => localStorage.getItem(key), MOTION), savedMotion);
  await state(other, 'paused');
  const savedAppearance = await page.evaluate(key => localStorage.getItem(key), APPEARANCE);
  await page.locator(SETTINGS_BUTTON).click();
  await labels(page, 'Pause motion');
  await state(other, 'active');
  await labels(other, 'Pause motion');
  assert.equal(await page.evaluate(key => localStorage.getItem(key), APPEARANCE), savedAppearance);
  await page.locator('.appearance-controls summary').click();
  await page.locator(HERO_BUTTON).click();
  await state(other, 'paused');
  await other.evaluate(key => localStorage.removeItem(key), MOTION);
  await state(page, 'active');
  await labels(page, 'Pause motion');
  await positive(page, 'Cross-tab motion key removal');
  await other.evaluate(() => localStorage.setItem('unrelated-runtime-test', '{"mode":"paused"}'));
  await settle(page);
  await state(page, 'active');
  await page.locator(HERO_BUTTON).click();
  await state(other, 'paused');
  await other.evaluate(() => localStorage.clear());
  await state(page, 'active');
  await labels(page, 'Pause motion');
  await positive(page, 'Cross-tab storage.clear');
}));

test('Live OS reduction takes precedence without erasing the saved user pause', () => fixture({}, async ({ page }) => {
  await load(page);
  await ready(page);
  await positive(page, 'Before OS reduction');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await state(page, 'reduced');
  await labels(page, 'Motion reduced', true);
  await quiet(page, 'Live OS reduction');
  await readable(page, READING);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await state(page, 'active');
  await positive(page, 'OS reduction removed');
  await page.locator(HERO_BUTTON).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await state(page, 'reduced');
  await labels(page, 'Motion reduced', true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await state(page, 'paused');
  await labels(page, 'Play motion');
  await quiet(page, 'Saved pause after OS reduction is removed');
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), MOTION), { mode: 'paused' });
}));

test('Storage unavailable still permits a reversible visit-local pause', () => fixture({ blockedStorage: true }, async ({ page }) => {
  await load(page);
  await ready(page);
  await page.locator(HERO_BUTTON).click();
  await state(page, 'paused');
  await labels(page, 'Play motion');
  await quiet(page, 'Pause with blocked localStorage');
  await page.locator(HERO_BUTTON).focus();
  await page.keyboard.press('Enter');
  await state(page, 'active');
  await positive(page, 'Keyboard resume with blocked localStorage');
}));

test('Offscreen and overlay suspension, deferred palette updates, and repeated resume', () => fixture({}, async ({ page }) => {
  await load(page);
  await ready(page);
  await page.evaluate(selector => window.__motionRuntimeProbe.observeIntersection(selector), HOST);
  const initial = await sample(page);
  const offscreenWindows = [];
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const scrolledAt = await page.locator('#projects').evaluate(el => {
      const timestamp = performance.now();
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      return timestamp;
    });
    assert.ok(await page.locator(HOST).evaluate(el => el.getBoundingClientRect().bottom <= 0));
    // Geometry can change before the rendering update that delivers native IO.
    const delivery = await page.waitForFunction(since => window.__motionRuntimeProbe.snapshot().intersections.find(entry => entry.queuedAt >= since && !entry.isIntersecting && entry.rectangle.bottom <= 0), scrolledAt);
    const intersection = await delivery.jsonValue();
    await delivery.dispose();
    offscreenWindows.push(await quiet(page, `Offscreen cycle ${iteration + 1}`, intersection));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await settle(page);
    await positive(page, `Visible hero cycle ${iteration + 1}`);
    await page.locator('.appearance-controls summary').click();
    await quiet(page, `Appearance overlay cycle ${iteration + 1}`);
    await page.getByRole('radio', { name: iteration % 2 ? 'Light' : 'Dark', exact: true }).check();
    await quiet(page, 'Overlay theme updates do not draw while suspended');
    await page.locator('.appearance-controls summary').click();
    await positive(page, `Overlay dismissed cycle ${iteration + 1}`);
    await page.getByRole('button', { name: 'Sections', exact: true }).click();
    await quiet(page, 'Sections overlay');
    await page.keyboard.press('Escape');
    await positive(page, 'Sections dismissed');
    assert.equal(await page.locator(CANVAS).count(), 1);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), MOTION), null, 'Lifecycle suspension must not persist a user pause');
  }
  assert.equal((await sample(page)).contexts.length, initial.contexts.length, 'Repeated suspension must reuse the renderer');
  return { offscreenWindows };
}));

test('Paused offscreen resize and theme changes defer a single real redraw until the hero returns', () => fixture({}, async ({ page }) => {
  await load(page);
  await ready(page);
  await positive(page, 'Before paused offscreen updates');
  await page.locator(HERO_BUTTON).click();
  await state(page, 'paused');
  await page.locator('#projects').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await quiet(page, 'Paused offscreen before updates');
  const before = await sample(page);
  await page.setViewportSize({ width: 1400, height: 980 });
  await page.locator('.appearance-controls summary').click();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.locator('.appearance-controls summary').click();
  await quiet(page, 'Offscreen updates are queued, not drawn');
  assert.equal((await sample(page)).total, before.total);
  await oneShot(page, () => page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })), 'Paused hero return with deferred updates');
  await labels(page, 'Play motion');
}));

test('Simulated visibility and BFCache lifecycle events reconcile once under current policy', () => fixture({}, async ({ page, context }) => {
  await load(page);
  await ready(page);
  for (let iteration = 0; iteration < 3; iteration += 1) {
    await page.evaluate(() => window.__motionRuntimeProbe.setVisibility('hidden'));
    await quiet(page, `Simulated hidden document ${iteration + 1}`);
    await readable(page, READING);
    await page.evaluate(() => window.__motionRuntimeProbe.setVisibility('visible'));
    await positive(page, `Simulated document visible ${iteration + 1}`);
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    await quiet(page, `Simulated BFCache freeze ${iteration + 1}`);
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await positive(page, `Simulated BFCache thaw ${iteration + 1}`);
  }
  const driver = await context.newPage();
  await load(driver, { noanim: true });
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await driver.evaluate(key => localStorage.setItem(key, '{"mode":"paused"}'), MOTION);
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await state(page, 'paused');
  await labels(page, 'Play motion');
  await quiet(page, 'Simulated thaw rereads the current stored pause');
  await page.locator(HERO_BUTTON).click();
  await state(page, 'active');
  await labels(page, 'Pause motion');
  await positive(page, 'One click resumes once after repeated simulated lifecycle events');
  assert.equal(await page.locator(CANVAS).count(), 1);
  return { simulated: true, realBFCacheCoverage: false };
}));

for (const delayedResource of ['motion-scene.bundle.js', 'openbrowser-scene.glb']) {
  test(`Pause during delayed ${delayedResource} allows at most one acceptance frame`, () => fixture({}, async ({ page, sceneRequests }) => {
    const held = await holdRequest(page, `**/${delayedResource}*`);
    const navigation = page.goto(url()).then(() => null, error => error);
    try {
      await held.opened();
      await page.locator(HERO_BUTTON).click();
      await state(page, 'paused');
      await quiet(page, 'Paused pending initialization');
      const before = await sample(page);
      held.release();
      const failure = await navigation;
      if (failure) throw failure;
      await ready(page);
      await settle(page, 450);
      const after = await sample(page);
      assert.equal(after.batches.length - before.batches.length, 1, 'A paused accepted result may draw one still frame and must not restart an old loop');
      await quiet(page, 'Paused after delayed acceptance');
      await page.locator(HERO_BUTTON).click();
      await positive(page, 'Resume after delayed acceptance');
      assert.equal(held.count(), 1, 'Only one initialization request may be in flight');
      assert.equal(sceneRequests.filter(value => value.endsWith('/motion-scene.bundle.js')).length, 1);
      assert.equal(sceneRequests.filter(value => value.endsWith('/openbrowser-scene.glb')).length, 1);
    } finally { await held.finish(); await navigation; }
  }));
  test(`Simulated terminal teardown during delayed ${delayedResource} prevents late mounting`, () => fixture({}, async ({ page }) => {
    const held = await holdRequest(page, `**/${delayedResource}*`);
    const navigation = page.goto(url()).then(() => null, error => error);
    try {
      await held.opened();
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
      await state(page, 'disposed');
      held.release();
      await navigation;
      await settle(page, 600);
      assert.equal(await page.locator(HOST).getAttribute('data-scene-state'), 'disposed');
      assert.equal(await page.locator(CANVAS).count(), 0);
      await poster(page);
      await quiet(page, 'Late result after simulated terminal teardown');
      await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
      await settle(page);
      await state(page, 'disposed');
      assert.equal(await page.locator(CANVAS).count(), 0);
      await readable(page, CONTENT);
      return { simulated: true, heldRequests: held.count() };
    } finally { await held.finish(); await navigation; }
  }));
}

test('Rapid loading toggles reconcile the latest OS and offscreen policy', () => fixture({}, async ({ page }) => {
  const held = await holdRequest(page, '**/openbrowser-scene.glb*');
  const navigation = page.goto(url()).then(() => null, error => error);
  try {
    await held.opened();
    for (let index = 0; index < 4; index += 1) await page.locator(HERO_BUTTON).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#projects').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await settle(page);
    const before = await sample(page);
    held.release();
    const failure = await navigation;
    if (failure) throw failure;
    await page.waitForFunction(selector => ['prepared', 'ready', 'fallback'].includes(document.querySelector(selector).dataset.sceneState), HOST);
    assert.notEqual(await page.locator(HOST).getAttribute('data-scene-state'), 'fallback');
    await quiet(page, 'Late acceptance under current offscreen and reduced-motion policy');
    assert.equal((await sample(page)).total, before.total, 'An offscreen result must not render a stale eligible frame');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await quiet(page, 'Restoring OS motion while still offscreen');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await ready(page);
    await positive(page, 'Latest visible auto policy after delayed loading');
    assert.equal(held.count(), 1);
  } finally { await held.finish(); await navigation; }
}));

for (const change of ['stored-pause', 'OS-reduction']) test(`Deferred startup rereads ${change}`, () => fixture({}, async ({ page, context, sceneRequests }) => {
  const driver = await context.newPage();
  await load(driver, { noanim: true });
  const held = await holdRequest(page, '**/js/script.js*');
  const navigation = page.goto(url()).then(() => null, error => error);
  try {
    await held.opened();
    if (change === 'stored-pause') await driver.evaluate(key => localStorage.setItem(key, '{"mode":"paused"}'), MOTION);
    else await page.emulateMedia({ reducedMotion: 'reduce' });
    held.release();
    const failure = await navigation;
    if (failure) throw failure;
    await settle(page, 450);
    await state(page, change === 'stored-pause' ? 'paused' : 'reduced');
    await labels(page, change === 'stored-pause' ? 'Play motion' : 'Motion reduced', change !== 'stored-pause');
    assert.deepEqual(sceneRequests, []);
    await readable(page, READING);
  } finally { await held.finish(); await navigation; }
}), { requiresScene: false });

for (const failure of ['webgl', 'asset', 'runtime', 'context-lost']) test(`Terminal ${failure} fallback restores the poster and keeps navigation usable`, () => fixture({ unavailableGL: failure === 'webgl' }, async ({ page, sceneRequests }) => {
  if (failure === 'asset') await page.route('**/openbrowser-scene.glb*', route => route.fulfill({ status: 503, body: 'Intentional model-unavailable test' }));
  if (failure === 'runtime') await page.route('**/motion-scene.bundle.js*', route => route.abort('failed'));
  await load(page);
  if (failure === 'context-lost') {
    await ready(page);
    await positive(page, 'Before actual WEBGL_lose_context');
    assert.equal(await page.evaluate(() => window.__motionRuntimeProbe.loseContext()), true, 'The context-loss case requires a real lose-context extension, not a fabricated product flag');
  }
  await page.waitForFunction(selector => document.querySelector(selector).dataset.sceneState === 'fallback', HOST);
  assert.equal(await page.locator(HOST).getAttribute('data-scene-reason'), failure);
  await poster(page);
  await quiet(page, `${failure} fallback`);
  const before = await sample(page);
  const requests = sceneRequests.length;
  await page.locator(HERO_BUTTON).click();
  await labels(page, 'Play motion');
  await page.locator(HERO_BUTTON).click();
  await page.locator('.appearance-controls summary').click();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.locator('.appearance-controls summary').click();
  await page.setViewportSize({ width: 1400, height: 980 });
  await page.locator(HOST).evaluate(el => el.dispatchEvent(new Event('webglcontextrestored', { bubbles: true })));
  await quiet(page, 'Terminal fallback must never retry on controls, resize, theme, or a simulated context-restored notification');
  assert.equal(sceneRequests.length, requests);
  assert.equal((await sample(page)).attempts, before.attempts);
  await page.locator(HOST).click();
  assert.equal(new URL(page.url()).hash, '#project-openbrowser');
  await readable(page, '#project-openbrowser h3, #project-openbrowser > p');
}), { requiresScene: failure !== 'runtime' });

test('Actual context loss during a simulated BFCache freeze remains terminal after thaw', () => fixture({}, async ({ page, sceneRequests }) => {
  await load(page);
  await ready(page);
  await positive(page, 'Before a simulated freeze with actual context loss');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await quiet(page, 'Simulated frozen scene before actual context loss');
  assert.equal(await page.evaluate(() => window.__motionRuntimeProbe.loseContext()), true);
  await page.waitForFunction(selector => document.querySelector(selector).dataset.sceneState === 'fallback', HOST);
  assert.equal(await page.locator(HOST).getAttribute('data-scene-reason'), 'context-lost');
  const requests = sceneRequests.length;
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await poster(page);
  await quiet(page, 'Simulated thaw cannot retry a genuinely lost context');
  assert.equal(sceneRequests.length, requests);
  return { simulatedLifecycleEvents: true, actualContextLoss: true, realBFCacheCoverage: false };
}));

test('Real-app scroll changes the rendered pose and reverse scroll restores it at fixed active time', () => fixture({}, async ({ page }) => {
  await load(page);
  await ready(page);
  await settle(page, 1400);
  await page.evaluate(() => window.__motionRuntimeProbe.freezeClock());
  try {
    await settle(page, 200);
    const first = await clippedCanvasShot(page);
    await page.evaluate(() => scrollTo({ top: 120, behavior: 'instant' }));
    await settle(page, 250);
    assert.equal(await page.evaluate(() => scrollY), 120, 'The page retains native scroll ownership');
    const next = await clippedCanvasShot(page);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await settle(page, 250);
    const reversed = await clippedCanvasShot(page);
    assert.notEqual(hash(first), hash(next), 'Actual app scroll must reach the shipped renderer and change its pixels at fixed time');
    assert.equal(hash(first), hash(reversed), 'Reverse app scroll must not accumulate pose offsets');
    return { testControlledRAFTime: true, frameSHA256: [hash(first), hash(next), hash(reversed)] };
  } finally { await page.evaluate(() => window.__motionRuntimeProbe.unfreezeClock()); }
}));

test('Shipped renderer API produces deterministic fixed-time reverse-progress pixels in an owned scratch div', () => fixture({}, async ({ page, sceneRequests }) => {
  await load(page, { noanim: true });
  await settle(page, 450);
  assert.deepEqual(sceneRequests, [], 'The noanim network assertion must precede the explicit renderer test import');
  await page.evaluate(async () => {
    const scratch = document.createElement('div');
    scratch.id = 'motion-runtime-owned-scratch';
    scratch.style.cssText = 'position:fixed;inset:100px auto auto 50px;width:640px;height:360px;z-index:9999;background:#f1f1f1';
    document.body.append(scratch);
    const script = document.querySelector('script[src*="js/motion.js"]');
    const bundle = new URL('motion-scene.bundle.js', script.src);
    const model = new URL('../assets/motion/openbrowser-scene.glb', script.src);
    if (script.dataset.sceneVersion) bundle.searchParams.set('v', script.dataset.sceneVersion);
    if (script.dataset.modelVersion) model.searchParams.set('v', script.dataset.modelVersion);
    const { createMotionScene } = await import(bundle.href);
    const scene = await createMotionScene(scratch, { modelUrl: model.href, palette: { accent: '#1854b4', theme: 'light' }, signal: new AbortController().signal, onContextLost: () => { throw new Error('Unexpected renderer API context loss'); } });
    if (scene.canvas.isConnected) { scene.dispose(); scratch.remove(); throw new Error('The scene factory must return a detached canvas'); }
    scratch.append(scene.canvas);
    window.__motionRuntimeOwnedScene = scene;
  });
  try {
    const frames = [];
    for (const progress of [0.2, 0.8, 0.2]) {
      await page.evaluate(p => window.__motionRuntimeOwnedScene.renderAt(2.5, p, { x: 0, y: 0 }), progress);
      frames.push(await page.locator('#motion-runtime-owned-scratch canvas').screenshot());
    }
    assert.notEqual(hash(frames[0]), hash(frames[1]), 'The shipped renderer output must respond to explicit progress');
    assert.equal(hash(frames[0]), hash(frames[2]), 'Fixed time, progress, and pointer must reproduce exactly the same pixels');
    for (let index = 0; index < frames.length; index += 1) fs.writeFileSync(path.join(OUT, `renderer-progress-${index}.png`), frames[index]);
    await quiet(page, 'An explicitly rendered scene does not start an ambient loop on its own');
    await page.evaluate(() => { window.__motionRuntimeOwnedScene.start(); window.__motionRuntimeOwnedScene.start(); });
    await positive(page, 'Idempotent renderer API start');
    await page.evaluate(() => { window.__motionRuntimeOwnedScene.stop(); window.__motionRuntimeOwnedScene.stop(); });
    await quiet(page, 'Idempotent renderer API stop');
    const beforeDispose = await sample(page);
    await page.evaluate(() => {
      const scene = window.__motionRuntimeOwnedScene;
      scene.dispose(); scene.dispose(); scene.start(); scene.stop(); scene.resize(); scene.setPalette({ accent: '#f00' }); scene.setProgress(0.8); scene.setPointer(1, 1); scene.renderAt(9, 0.8, { x: 1, y: 1 });
    });
    await quiet(page, 'All renderer methods are inert after disposal');
    assert.equal((await sample(page)).total, beforeDispose.total);
    assert.equal(await page.locator('#motion-runtime-owned-scratch canvas').count(), 0);
    return { explicitHarnessImport: true, separateFromAppScrollTest: true, frameSHA256: frames.map(hash) };
  } finally {
    await page.evaluate(() => { window.__motionRuntimeOwnedScene?.dispose(); delete window.__motionRuntimeOwnedScene; document.getElementById('motion-runtime-owned-scratch')?.remove(); });
  }
}));

test('Responsive intermediate, settled, paused, and fully expanded reading at every target', () => fixture({}, async ({ page }) => {
  const sizes = [];
  for (const [width, height] of TARGETS) {
    await page.setViewportSize({ width, height });
    await load(page);
    await readable(page, PROSE);
    await page.screenshot({ path: path.join(OUT, `${width}x${height}-intermediate.png`) });
    await settle(page, 1250);
    await records(page);
    await readable(page, READING);
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, actionsBottom: document.querySelector('.hero-actions').getBoundingClientRect().bottom }));
    assert.ok(layout.scrollWidth <= width, JSON.stringify(layout));
    if ((width <= 700 && height <= 740) || height <= 500) assert.ok(layout.actionsBottom <= height + 1, 'Primary hero actions fit the short viewport');
    await page.screenshot({ path: path.join(OUT, `${width}x${height}-settled.png`) });
    await page.locator(HERO_BUTTON).click();
    await state(page, 'paused');
    await quiet(page, `${width}x${height} paused`);
    await readable(page, READING);
    await page.screenshot({ path: path.join(OUT, `${width}x${height}-paused.png`) });
    await page.getByRole('button', { name: 'Sections', exact: true }).click();
    await page.getByRole('button', { name: 'Show all details', exact: true }).click();
    await page.keyboard.press('Escape');
    await settle(page);
    assert.equal(await page.locator('main details:not([open])').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Fully expanded records must not create page overflow');
    await readable(page, READING);
    await page.locator(HERO_BUTTON).click();
    await state(page, 'active');
    sizes.push(layout);
  }
  return { sizes };
}), { requiresScene: false });

test('All ten theme and accent pairs preserve motion preference and legible controls', () => fixture({ seed: { [MOTION]: '{"mode":"paused"}' } }, async ({ page, sceneRequests }) => {
  await load(page);
  await page.locator('.appearance-controls summary').click();
  for (const theme of ['Light', 'Dark']) {
    await page.getByRole('radio', { name: theme, exact: true }).check();
    for (const color of ['Red', 'Orange', 'Green', 'Blue', 'Pink']) {
      await page.getByRole('radio', { name: color, exact: true }).check();
      await settle(page);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme.toLowerCase());
      assert.equal(await page.locator('html').getAttribute('data-color'), color.toLowerCase());
      await labels(page, 'Play motion');
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), MOTION), { mode: 'paused' });
      await readable(page, SETTINGS_BUTTON);
    }
  }
  assert.deepEqual(sceneRequests, [], 'Changing appearance must not override the stored motion pause');
}), { requiresScene: false });

test('Coarse-pointer touch controls, keyboard settings, direct records, search, and native history', () => fixture({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, async ({ page }) => {
  await load(page);
  await ready(page);
  assert.equal(await page.evaluate(() => matchMedia('(pointer: coarse)').matches), true);
  await positive(page, 'Coarse-pointer autonomous scene without hover');
  await page.locator(HERO_BUTTON).tap();
  await state(page, 'paused');
  await page.locator('.appearance-controls summary').tap();
  await page.locator(SETTINGS_BUTTON).focus();
  await page.keyboard.press('Space');
  await labels(page, 'Pause motion');
  await quiet(page, 'Settings remain an overlay after keyboard resume');
  await page.keyboard.press('Escape');
  await positive(page, 'Keyboard settings dismiss resumes the same scene');
  await page.getByRole('button', { name: 'Sections', exact: true }).tap();
  await page.locator('.nav-links a[href="#projects"]').tap();
  assert.equal(new URL(page.url()).hash, '#projects');
  await page.locator('#project-search').fill('context atlas');
  assert.equal(await page.locator('.project-record:not([hidden])').count(), 1);
  await page.evaluate(() => { location.hash = 'project-openbrowser'; });
  await page.waitForFunction(() => !document.getElementById('project-openbrowser').hidden);
  await settle(page);
  await readable(page, '#project-openbrowser h3, #project-openbrowser > p');
  const rect = await page.locator('#project-openbrowser').boundingBox();
  assert.ok(rect.y >= 68 && rect.y < 200, 'The direct record is visible below the fixed header');
  await page.locator('#role-jump').selectOption('experience-sanofi');
  await page.waitForFunction(() => location.hash === '#experience-sanofi');
  await settle(page);
  await readable(page, '#experience-sanofi h3, #experience-sanofi .outcome-copy p');
  await page.goBack();
  await page.waitForFunction(() => location.hash === '#project-openbrowser');
  await records(page);
}));

test('Document navigation settles target text synchronously without taking scroll ownership', () => fixture({}, async ({ page }) => {
  await load(page);
  const result = await page.evaluate(() => {
    const target = document.getElementById('project-context-atlas');
    const before = { hash: location.hash, x: scrollX, y: scrollY };
    document.dispatchEvent(new CustomEvent('portfolio:navigate', { detail: { id: target.id } }));
    const transformed = [target, ...target.querySelectorAll('h3, p')].filter(el => getComputedStyle(el).transform !== 'none').map(el => el.id || el.tagName);
    return { before, after: { hash: location.hash, x: scrollX, y: scrollY }, transformed };
  });
  assert.deepEqual(result.after, result.before, 'The motion navigation event must not navigate or scroll');
  assert.deepEqual(result.transformed, [], 'The target is already settled before the next animation frame');
}), { requiresScene: false });

test('No-JavaScript and failed-GSAP reading preserve the complete record', async () => {
  await fixture({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }, async ({ page }) => {
    await page.goto(url());
    await records(page);
    assert.equal(await page.locator('[data-motion-toggle]:visible').count(), 0);
    assert.equal(await page.locator('.site-index').isVisible(), true);
    await page.locator('#experience-ibm summary').click();
    assert.equal(await page.locator('#experience-ibm details').getAttribute('open'), '');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  });
  await fixture({ seed: { [MOTION]: '{"mode":"paused"}' } }, async ({ page }) => {
    await page.route('**/js/vendor/gsap.min.js*', route => route.abort('failed'));
    await load(page, { hash: 'experience-sanofi' });
    await labels(page, 'Play motion');
    await records(page);
    await readable(page, READING);
    await page.locator('#experience-sanofi summary').click();
    assert.equal(await page.locator('#experience-sanofi details').getAttribute('open'), '');
  });
}, { requiresScene: false });

async function main() {
  const selected = cases.filter(entry => entry.name.includes(FILTER));
  assert.ok(selected.length, `No runtime cases match MOTION_RUNTIME_FILTER=${JSON.stringify(FILTER)}`);
  report.selection = { filter: FILTER || null, registeredCases: cases.length + 2, selectedCases: selected.length + 2 };
  fs.mkdirSync(OUT, { recursive: true });
  browser = await chromium.launch({ headless: true, args: report.launchArguments });
  report.browserVersion = browser.version();
  let integrated = false;
  let sceneAvailable = false;
  try {
    try {
      await fixture({}, async ({ page }) => {
        await load(page);
        assert.equal(await page.locator('[data-motion-toggle]').count(), 2, 'The live motion page needs bound pause controls in the hero and appearance settings');
        assert.equal(await page.locator(`button${HERO_BUTTON}[data-motion-toggle]`).count(), 1);
        assert.equal(await page.locator(`button${SETTINGS_BUTTON}[data-motion-toggle]`).count(), 1);
        await page.waitForFunction(() => document.documentElement.dataset.motionState && document.documentElement.dataset.motionState !== 'disposed');
        assert.equal(await page.locator(HERO_BUTTON).isVisible(), true, 'Controls must be bound before they become visible');
      });
      integrated = true;
      report.cases.push({ name: 'Original minimal red assertion and bound control gate', status: 'passed' });
    } catch (error) {
      report.cases.push({ name: 'Original minimal red assertion and bound control gate', status: 'failed', error: error.message });
      console.error(error);
    }
    if (integrated) {
      const resourceContext = await browser.newContext();
      try {
        report.integrationResources = [];
        for (const resource of ['js/motion-scene.bundle.js', 'assets/motion/openbrowser-scene.glb']) {
          const response = await resourceContext.request.get(new URL(resource, BASE).href);
          report.integrationResources.push({ resource, status: response.status(), available: response.ok() });
        }
        sceneAvailable = report.integrationResources.every(resource => resource.available);
        report.cases.push({ name: 'Generated runtime resources available', status: sceneAvailable ? 'passed' : 'failed', evidence: report.integrationResources });
      } finally { await resourceContext.close(); }
    }
    for (const entry of selected) {
      if (!integrated) { report.cases.push({ name: entry.name, status: 'deferred', reason: 'HTML/controller integration gate has not passed. No product verdict for this case.' }); continue; }
      if (entry.requiresScene && !sceneAvailable) { report.cases.push({ name: entry.name, status: 'deferred', reason: 'Generated runtime resources are not integrated yet. This is not a successful 3D or fallback result.' }); continue; }
      try {
        const evidence = await entry.run();
        report.cases.push({ name: entry.name, status: 'passed', evidence });
        console.log(`PASS ${entry.name}`);
      } catch (error) {
        report.cases.push({ name: entry.name, status: 'failed', error: error.message });
        console.error(`FAIL ${entry.name}\n${error.stack}`);
      }
    }
  } finally {
    await browser.close();
    report.summary = Object.fromEntries(['passed', 'failed', 'deferred'].map(status => [status, report.cases.filter(entry => entry.status === status).length]));
    fs.writeFileSync(path.join(OUT, 'runtime-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report.summary));
    if (report.summary.failed || report.summary.deferred) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
