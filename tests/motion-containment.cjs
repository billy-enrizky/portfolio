'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const BASE = new URL(process.env.PORTFOLIO_URL || 'http://127.0.0.1:8000/');
const OUT = path.resolve(process.env.TEST_OUTPUT_DIR || path.join(ROOT, 'local_docs/motion-containment-qa'));
const HOST = '.hero-project-tile';
const GROUPS = ['CoreTile', 'PythonNode', 'CDPNode', 'MCPNode'];
const TARGETS = [[320, 667], [360, 740], [390, 844], [768, 1024], [844, 390], [1024, 900], [1440, 1000], [1920, 1080]];
const TIMES = [0, Math.PI / 1.2, 3 * Math.PI / 1.2];
const POSES = TIMES.flatMap(time => [0, 1].flatMap(progress => [-1, 1].flatMap(x => [-1, 1].map(y => ({ time, progress, pointer: { x, y } })))));
const REVERSE = [0.2, 0.8, 0.2].map(progress => ({ time: 2.5, progress, pointer: { x: 0, y: 0 } }));
const LAUNCH = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function installProbe() {
  const contexts = new Map();
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...options) {
    const gl = original.call(this, kind, ...options);
    if (kind !== 'webgl2' || !gl || contexts.has(this)) return gl;
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const entry = { gl, calls: 0, frames: 0, queued: false, pending: null,
      renderer: gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER), version: gl.getParameter(gl.VERSION) };
    contexts.set(this, entry);
    for (const method of ['drawArrays', 'drawElements', 'drawRangeElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const draw = gl[method];
      gl[method] = function (...args) {
        const result = draw.apply(this, args);
        entry.calls += 1;
        if (!entry.queued) {
          entry.queued = true;
          queueMicrotask(() => {
            entry.queued = false;
            entry.frames += 1;
            if (entry.pending) {
              const { resolve, reject, timer } = entry.pending;
              entry.pending = null;
              clearTimeout(timer);
              read(gl.canvas).then(resolve, reject);
            }
          });
        }
        return result;
      };
    }
    return gl;
  };

  async function read(canvas, regions = [], png = false) {
    const entry = contexts.get(canvas);
    if (!entry) throw new Error('No previously acquired WebGL2 context for this exact canvas');
    const { gl } = entry;
    if (gl.isContextLost()) throw new Error('WebGL context lost');
    if (gl.getParameter(gl.READ_FRAMEBUFFER_BINDING) !== null) throw new Error('Expected the rendered default framebuffer');
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const bytes = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    const image = png ? canvas.toDataURL('image/png') : undefined;
    const error = gl.getError();
    let pixels = 0;
    let opaque = 0;
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    let minTone = 765;
    let maxTone = 0;
    const colors = new Set();
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = ((height - 1 - y) * width + x) * 4;
        if (bytes[i + 3] === 0) continue;
        pixels += 1;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        if (bytes[i + 3] < 240) continue;
        opaque += 1;
        const tone = bytes[i] + bytes[i + 1] + bytes[i + 2];
        minTone = Math.min(minTone, tone); maxTone = Math.max(maxTone, tone);
        colors.add(((bytes[i] >> 4) << 8) | ((bytes[i + 1] >> 4) << 4) | (bytes[i + 2] >> 4));
      }
    }
    const groups = regions.map(region => {
      let exclusiveArea = 0;
      let visiblePixels = 0;
      for (let y = Math.max(0, region.top); y < Math.min(height, region.bottom); y += 1) {
        for (let x = Math.max(0, region.left); x < Math.min(width, region.right); x += 1) {
          if (regions.some(other => other !== region && x >= other.left && x < other.right && y >= other.top && y < other.bottom)) continue;
          exclusiveArea += 1;
          if (bytes[((height - 1 - y) * width + x) * 4 + 3] >= 16) visiblePixels += 1;
        }
      }
      return { name: region.name, exclusiveArea, visiblePixels };
    });
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return { width, height, pixels, opaque, colorBins: colors.size, toneRange: maxTone - minTone,
      bounds: pixels ? { left: minX, top: minY, right: maxX, bottom: maxY } : null,
      margins: pixels ? [minX, minY, width - 1 - maxX, height - 1 - maxY] : null,
      groups, glError: error, calls: entry.calls, frames: entry.frames, renderer: entry.renderer,
      version: entry.version, contextAttributes: gl.getContextAttributes(),
      sha256: Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join(''), png: image };
  }
  window.__motionContainment = {
    read,
    snapshot(canvas) { const value = contexts.get(canvas); return value && { calls: value.calls, frames: value.frames }; },
    next(canvas) {
      const entry = contexts.get(canvas);
      if (!entry) return Promise.reject(new Error('The live canvas has no real WebGL2 context'));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { entry.pending = null; reject(new Error('No live WebGL draw within 10 seconds')); }, 10000);
        entry.pending = { resolve, reject, timer };
      });
    }
  };
}

function pixelFailures(frame, includeGroups = true) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const area = frame.width * frame.height;
  const margin = Math.max(2, Math.ceil(Math.min(frame.width, frame.height) * 0.01));
  check(frame.glError === 0, `WebGL error ${frame.glError}`);
  check(frame.calls > 0 && frame.version.includes('WebGL 2'), 'No actual WebGL2 draw activity');
  check(frame.contextAttributes?.alpha === true, 'Framebuffer must support transparency');
  check(frame.pixels >= area * 0.02 && frame.pixels <= area * 0.8, `Nontransparent coverage ${frame.pixels}/${area} outside 2%..80%`);
  check(frame.opaque >= Math.max(64, area * 0.01), `Insufficient opaque model pixels ${frame.opaque}`);
  check(frame.colorBins >= 8 && frame.toneRange >= 64, `Blank/flat frame, RGB bins ${frame.colorBins}, tone range ${frame.toneRange}`);
  check(frame.margins?.every(value => value >= margin), `Alpha bounds need ${margin}px clear margins, observed ${JSON.stringify(frame.margins)}`);
  if (includeGroups) {
    check(frame.groups.length === GROUPS.length, 'Every expected model group needs a projected region');
    for (const group of frame.groups) {
      check(group.exclusiveArea >= 16, `${group.name} has no meaningful exclusive projected region`);
      check(group.visiblePixels >= Math.max(4, group.exclusiveArea * 0.05), `${group.name} missing/blank in its exclusive region (${group.visiblePixels}/${group.exclusiveArea})`);
    }
  }
  return errors;
}

function projectionOracle(THREE, bytes) {
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Expected a real GLB');
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
  const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  assert.ok(!gltf.animations?.length && !gltf.skins?.length, 'Static accessor-bounds oracle does not support animations or skins');
  const root = new THREE.Object3D();
  const objects = gltf.nodes.map(node => {
    const object = new THREE.Object3D();
    object.name = node.name || '';
    if (node.matrix) new THREE.Matrix4().fromArray(node.matrix).decompose(object.position, object.quaternion, object.scale);
    else {
      if (node.translation) object.position.fromArray(node.translation);
      if (node.rotation) object.quaternion.fromArray(node.rotation);
      if (node.scale) object.scale.fromArray(node.scale);
    }
    return object;
  });
  gltf.nodes.forEach((node, index) => (node.children || []).forEach(child => objects[index].add(objects[child])));
  for (const index of gltf.scenes[gltf.scene ?? 0].nodes) root.add(objects[index]);
  root.updateMatrixWorld(true);
  const nodes = GROUPS.map(name => {
    const matches = []; root.traverse(node => { if (node.name === name) matches.push(node); });
    assert.equal(matches.length, 1, `GLB needs exactly one reachable ${name}`);
    return matches[0];
  });
  const primitives = [];
  objects.forEach((object, index) => {
    if (gltf.nodes[index].mesh === undefined || !root.getObjectById(object.id)) return;
    for (const primitive of gltf.meshes[gltf.nodes[index].mesh].primitives) {
      assert.ok(!primitive.targets, 'Morph targets are outside the static bounds oracle scope');
      const accessor = gltf.accessors[primitive.attributes.POSITION];
      assert.ok(accessor.type === 'VEC3' && accessor.count > 0 && accessor.min?.length === 3 && accessor.max?.length === 3, 'POSITION accessor needs actual min/max bounds');
      assert.ok([...accessor.min, ...accessor.max].every(Number.isFinite));
      let owner = object;
      while (owner && !GROUPS.includes(owner.name)) owner = owner.parent;
      assert.ok(owner, `Unowned mesh ${object.name}`);
      const corners = [];
      for (const x of [accessor.min[0], accessor.max[0]]) for (const y of [accessor.min[1], accessor.max[1]]) for (const z of [accessor.min[2], accessor.max[2]]) corners.push(new THREE.Vector3(x, y, z));
      primitives.push({ object, owner: owner.name, corners });
    }
  });
  for (const name of GROUPS) assert.ok(primitives.some(primitive => primitive.owner === name), `${name} must contain mesh geometry`);
  const bounds = new THREE.Box3();
  for (const primitive of primitives) for (const corner of primitive.corners) bounds.expandByPoint(corner.clone().applyMatrix4(primitive.object.matrixWorld));
  bounds.expandByVector(new THREE.Vector3(0.12, 0.175, 0.22));
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const bases = nodes.map(node => ({ position: node.position.clone(), rotation: node.rotation.clone() }));
  return function project(host, buffer, pose) {
    const { time: t, progress: p, pointer: { x, y } } = pose;
    nodes.forEach((node, index) => { node.position.copy(bases[index].position); node.rotation.copy(bases[index].rotation); });
    nodes[0].rotation.y += 0.12 * Math.sin(0.6 * t) + 0.1 * p + 0.12 * x;
    nodes[0].rotation.x += 0.05 * Math.sin(0.45 * t) - 0.07 * y;
    nodes[0].position.y += 0.055 * Math.sin(0.65 * t);
    nodes.slice(1).forEach((node, index) => {
      const phase = [0, 2.1, 4.2][index];
      node.position.x += 0.08 * Math.sin(0.4 * t + phase);
      node.position.y += 0.12 * Math.sin(0.7 * t + phase);
      node.position.z += 0.1 * Math.cos(0.5 * t + phase) - 0.12 * p;
    });
    root.updateMatrixWorld(true);
    const aspect = host.width / host.height;
    const tangent = Math.tan(THREE.MathUtils.degToRad(16));
    const distance = 1.18 * Math.max(size.y / (2 * tangent), size.x / (2 * tangent * aspect));
    const camera = new THREE.PerspectiveCamera(32, aspect, Math.max(0.01, distance / 100), distance + size.length() * 4);
    camera.position.set(distance * (0.08 * p + 0.025 * x), center.y + 0.2 + 0.25 * p + 0.08 * y, distance);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    const viewProjection = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const regions = GROUPS.map(name => ({ name, left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }));
    const errors = [];
    let minFrustumSlack = Infinity;
    for (const primitive of primitives) {
      const region = regions.find(value => value.name === primitive.owner);
      for (const corner of primitive.corners) {
        const world = corner.clone().applyMatrix4(primitive.object.matrixWorld);
        const clip = new THREE.Vector4(world.x, world.y, world.z, 1).applyMatrix4(viewProjection);
        const ndc = [clip.x / clip.w, clip.y / clip.w, clip.z / clip.w];
        const slack = Math.min(...ndc.map(value => 1 - Math.abs(value)));
        minFrustumSlack = Math.min(minFrustumSlack, slack);
        if (!(clip.w > 0 && slack > 0)) errors.push(`${primitive.owner}/${primitive.object.name} accessor corner outside frustum, NDC ${JSON.stringify(ndc)}`);
        const px = (ndc[0] + 1) * buffer.width / 2;
        const py = (1 - ndc[1]) * buffer.height / 2;
        region.left = Math.min(region.left, px); region.right = Math.max(region.right, px);
        region.top = Math.min(region.top, py); region.bottom = Math.max(region.bottom, py);
      }
    }
    return { errors, minFrustumSlack, regions: regions.map(region => ({ name: region.name, left: Math.floor(region.left), top: Math.floor(region.top), right: Math.ceil(region.right), bottom: Math.ceil(region.bottom) })) };
  };
}

async function renderPose(page, pose, regions, png = false) {
  return page.evaluate(async ({ pose, regions, png }) => {
    const scene = window.__motionContainmentScene;
    const before = window.__motionContainment.snapshot(scene.canvas).calls;
    scene.renderAt(pose.time, pose.progress, pose.pointer);
    const pending = window.__motionContainment.read(scene.canvas, regions, png);
    if (window.__motionContainment.snapshot(scene.canvas).calls <= before) throw new Error('renderAt did not draw in this same task');
    return pending;
  }, { pose, regions, png });
}

function savePNG(name, dataURL) {
  assert.ok(dataURL.startsWith('data:image/png;base64,'));
  fs.writeFileSync(path.join(OUT, name), Buffer.from(dataURL.split(',')[1], 'base64'));
}

async function viewportGate(browser, viewport, project, resources) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1.5, reducedMotion: 'no-preference', colorScheme: 'light', hasTouch: viewport.width <= 700 });
  const result = { viewport, errors: [], poses: [], resourceHashes: [], artifacts: [] };
  const page = await context.newPage();
  const responses = [];
  page.on('pageerror', error => result.errors.push(`Page exception: ${error.message}`));
  page.on('response', response => {
    const pathname = new URL(response.url()).pathname;
    const resource = resources.find(value => pathname.endsWith(`/${value.file}`));
    if (resource) responses.push(response.body().then(bytes => {
      const hash = sha256(bytes);
      result.resourceHashes.push({ file: resource.file, url: response.url(), status: response.status(), sha256: hash });
      assert.equal(hash, resource.sha256, `${resource.file} served bytes changed or differ from the working copy`);
    }));
  });
  await page.addInitScript(installProbe);
  try {
    const url = new URL(BASE); url.hash = ''; url.searchParams.delete('noanim');
    await page.goto(url.href, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.locator(HOST).scrollIntoViewIfNeeded();
    const host = await page.locator(HOST).evaluate(element => {
      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(document.documentElement);
      return { width: rect.width, height: rect.height, x: rect.x, y: rect.y, accent: styles.getPropertyValue('--accent').trim(), theme: document.documentElement.dataset.theme };
    });
    result.host = host;
    assert.ok(host.width > 0 && host.height > 0, 'Actual responsive host must have dimensions');
    try {
      await page.waitForFunction(selector => ['ready', 'fallback', 'disposed'].includes(document.querySelector(selector)?.dataset.sceneState), HOST, { timeout: 30000 });
      const state = await page.locator(HOST).evaluate(element => ({ state: element.dataset.sceneState, reason: element.dataset.sceneReason, readyClass: element.classList.contains('is-3d-ready'), posterVisibility: getComputedStyle(element.querySelector('.motion-poster')).visibility }));
      result.liveState = state;
      assert.equal(state.state, 'ready', `Fallback is not 3D: ${JSON.stringify(state)}`);
      assert.ok(state.readyClass && state.posterVisibility === 'hidden', 'Ready must display the model instead of the poster');
      const canvas = page.locator(`${HOST} canvas.motion-canvas`);
      assert.equal(await canvas.count(), 1);
      assert.equal(await canvas.isVisible(), true);
      const first = await canvas.evaluate(element => window.__motionContainment.next(element));
      await page.waitForFunction(({ selector, frames }) => window.__motionContainment.snapshot(document.querySelector(`${selector} canvas`)).frames >= frames + 2, { selector: HOST, frames: first.frames });
      const second = await canvas.evaluate(element => window.__motionContainment.next(element));
      result.live = { first, second };
      result.errors.push(...pixelFailures(first, false).map(error => `Live first frame: ${error}`), ...pixelFailures(second, false).map(error => `Live second frame: ${error}`));
      assert.ok(second.calls > first.calls && second.frames > first.frames, 'Live scene must continue actual WebGL drawing');
      assert.notEqual(first.sha256, second.sha256, 'Live model must change rendered pixels');
      const name = `${viewport.width}x${viewport.height}-app.png`;
      await page.screenshot({ path: path.join(OUT, name) }); result.artifacts.push(name);
    } catch (error) { result.errors.push(`Live gate: ${error.message}`); }

    await page.evaluate(() => document.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    const buffer = await page.evaluate(async ({ host }) => {
      const scratch = document.createElement('div');
      scratch.id = 'motion-containment-owned-scratch';
      scratch.style.cssText = `position:fixed;left:0;top:0;width:${host.width}px;height:${host.height}px;z-index:2147483647;pointer-events:none;background:transparent;border:0;padding:0;border-radius:0`;
      document.body.append(scratch);
      const script = document.querySelector('script[src*="js/motion.js"]');
      const bundle = new URL('motion-scene.bundle.js', script.src);
      const model = new URL('../assets/motion/openbrowser-scene.glb', script.src);
      if (script.dataset.sceneVersion) bundle.searchParams.set('v', script.dataset.sceneVersion);
      if (script.dataset.modelVersion) model.searchParams.set('v', script.dataset.modelVersion);
      const { createMotionScene } = await import(bundle.href);
      const scene = await createMotionScene(scratch, { modelUrl: model.href, palette: { accent: host.accent, theme: host.theme }, signal: new AbortController().signal, onContextLost: () => { throw new Error('Scratch WebGL context lost'); } });
      window.__motionContainmentScene = scene;
      if (scene.canvas.isConnected) throw new Error('The shipped factory must return a detached canvas');
      scratch.append(scene.canvas);
      const rect = scratch.getBoundingClientRect();
      if (rect.width !== host.width || rect.height !== host.height) throw new Error('Scratch must reproduce the actual host dimensions exactly');
      return { width: scene.canvas.width, height: scene.canvas.height };
    }, { host });
    result.buffer = buffer;
    let worst = null;
    for (const [index, pose] of [...POSES, ...REVERSE].entries()) {
      const projected = project(host, buffer, pose);
      const frame = await renderPose(page, pose, projected.regions);
      const errors = [...projected.errors, ...pixelFailures(frame)];
      const sample = { index, kind: index < POSES.length ? 'boundary' : 'reverse-progress', pose, frame, projected, errors };
      result.poses.push(sample);
      result.errors.push(...errors.map(error => `Pose ${index}: ${error}`));
      const margin = frame.margins ? Math.min(...frame.margins) : -1;
      if (!worst || margin < worst.margin) worst = { margin, sample };
    }
    const reversed = result.poses.slice(POSES.length).map(sample => sample.frame.sha256);
    if (reversed[0] !== reversed[2] || reversed[0] === reversed[1]) result.errors.push('Fixed-time p0.2/p0.8/p0.2 pixels must reverse exactly and differ in the middle');
    for (const [label, sample] of [['reference', result.poses[POSES.length]], ['minimum-margin', worst.sample]]) {
      const frame = await renderPose(page, sample.pose, sample.projected.regions, true);
      assert.equal(frame.sha256, sample.frame.sha256, 'Evidence image must reproduce the same-task sampled pixels');
      const name = `${viewport.width}x${viewport.height}-${label}.png`;
      savePNG(name, frame.png); result.artifacts.push(name);
    }
    result.minimumAlphaMarginPixels = worst.margin;
    result.minimumFrustumSlack = Math.min(...result.poses.map(sample => sample.projected.minFrustumSlack));
    const control = structuredClone(result.poses[0].frame);
    control.margins = [0, 0, 0, 0];
    assert.ok(pixelFailures(control).some(error => error.includes('clear margins')), 'Verifier must reject edge clipping');
    const satellite = structuredClone(result.poses[0].frame);
    satellite.groups.find(group => group.name === 'MCPNode').visiblePixels = 0;
    assert.ok(pixelFailures(satellite).some(error => error.includes('MCPNode missing')), 'Verifier must reject a wholly missing satellite region');
    const blank = await page.evaluate(async () => {
      const canvas = window.__motionContainmentScene.canvas;
      const gl = canvas.getContext('webgl2');
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return window.__motionContainment.read(canvas);
    });
    assert.ok(pixelFailures(blank, false).some(error => error.includes('coverage')), 'Verifier must reject an actual cleared WebGL framebuffer');
    result.negativeControls = { zeroMarginRejected: true, missingSatelliteRegionRejected: true, actualClearedFramebufferRejected: true };
  } catch (error) { result.errors.push(error.stack); }
  finally {
    await Promise.all(responses.map(response => response.catch(error => result.errors.push(error.message))));
    for (const resource of resources) if (!result.resourceHashes.some(value => value.file === resource.file)) result.errors.push(`Never observed shipped resource ${resource.file}`);
    await page.evaluate(() => { window.__motionContainmentScene?.dispose(); document.getElementById('motion-containment-owned-scratch')?.remove(); }).catch(() => {});
    await context.close();
  }
  result.status = result.errors.length === 0 && result.poses.length === POSES.length + REVERSE.length ? 'passed' : 'failed';
  return result;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {
    baseURL: BASE.href, launchArguments: LAUNCH, environment: 'Real headless Chromium, ANGLE SwiftShader software WebGL2, requested DPR 1.5. No hardware-GPU or real-device claim.',
    scope: { targets: TARGETS, times: TIMES, boundaryPosesPerViewport: POSES.length, reverseProgressPosesPerViewport: REVERSE.length, boundaryPoses: POSES,
      clearMarginRule: 'All alpha > 0 must be at least max(2, ceil(min(bufferWidth, bufferHeight)*0.01)) pixels from every edge.',
      expectedImageRule: '2%..80% nonzero-alpha coverage, >=1% opaque pixels, >=8 RGB bins, >=64 RGB-sum tone range, visible alpha in every exclusive projected group region.',
      projectionRule: 'Node uses installed THREE math, actual shipped GLB POSITION accessor min/max and hierarchical node transforms, and the plan camera/pose equations. All primitive AABB corners must be inside all six frustum planes.' },
    limitations: ['Bounded deterministic poses, not an exhaustive continuous-time or combined-extrema proof.',
      'GLB AABB corners are conservative. Projection duplicates the plan equations, not private renderer state. Actual alpha/group-region checks are the independent rendered-pixel gate.',
      'Exclusive projected-region occupancy catches absent groups but does not establish pixel-perfect logo/text fidelity, full surface visibility, or absence of partial occlusion.',
      'Live frames use a verifier-owned microtask after real draw calls. Scratch pixels and PNGs are read synchronously immediately after renderAt, before yielding to the browser.',
      'Scratch scenes never start an animation loop. A simulated pagehide suspends the already-proven live app while scratch scenes are sampled. This does not test BFCache.'],
    viewports: [], errors: []
  };
  let browser;
  try {
    const THREE = await import('three');
    report.threeRevision = THREE.REVISION;
    const resources = ['js/motion-scene.bundle.js', 'assets/motion/openbrowser-scene.glb'].map(file => {
      const bytes = fs.readFileSync(path.join(ROOT, file));
      return { file, bytes: bytes.length, sha256: sha256(bytes) };
    });
    report.resources = resources;
    report.sceneSourceSHA256 = sha256(fs.readFileSync(path.join(ROOT, 'js/motion-scene.js')));
    const project = projectionOracle(THREE, fs.readFileSync(path.join(ROOT, 'assets/motion/openbrowser-scene.glb')));
    browser = await chromium.launch({ headless: true, args: LAUNCH });
    report.browserVersion = browser.version();
    for (const [width, height] of TARGETS) {
      const result = await viewportGate(browser, { width, height }, project, resources);
      report.viewports.push(result);
      console.log(`${result.status.toUpperCase()} ${width}x${height} host=${JSON.stringify(result.host)} poses=${result.poses.length} minimumAlphaMarginPixels=${result.minimumAlphaMarginPixels}`);
      for (const error of result.errors) console.error(error);
    }
    for (const resource of resources) assert.equal(sha256(fs.readFileSync(path.join(ROOT, resource.file))), resource.sha256, `${resource.file} changed during verification. Rerun against a stable build.`);
    assert.equal(sha256(fs.readFileSync(path.join(ROOT, 'js/motion-scene.js'))), report.sceneSourceSHA256, 'Scene source changed during verification. Rerun against a stable build.');
  } catch (error) { report.errors.push(error.stack); console.error(error); }
  finally {
    if (browser) await browser.close();
    report.summary = { passedViewports: report.viewports.filter(value => value.status === 'passed').length,
      failedViewports: report.viewports.filter(value => value.status === 'failed').length,
      sampledPoses: report.viewports.reduce((sum, value) => sum + value.poses.length, 0), errors: report.errors.length };
    report.status = report.summary.passedViewports === TARGETS.length && report.errors.length === 0 ? 'passed' : 'failed';
    fs.writeFileSync(path.join(OUT, 'containment-results.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ status: report.status, ...report.summary, report: path.join(OUT, 'containment-results.json') }));
    if (report.status !== 'passed') process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
