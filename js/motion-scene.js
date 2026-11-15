import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

function sceneError(reason, cause) {
  const error = new Error(`Motion scene unavailable (${reason})`, { cause });
  error.reason = reason;
  return error;
}

function releaseModel(model) {
  if (!model) return;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  model.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    for (const material of [].concat(node.material || [])) materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value?.isTexture) textures.add(value);
    }
    material.dispose();
  }
  for (const texture of textures) {
    texture.dispose();
    const images = [].concat(texture.source?.data || []);
    for (const image of images) image?.close?.();
  }
  for (const geometry of geometries) geometry.dispose();
  model.removeFromParent();
}

export async function createMotionScene(host, { modelUrl, palette, onContextLost, signal }) {
  let model;
  let renderer;
  let canvas;
  let context;
  let lifecycle = 'preparing';
  let frame = null;
  let lastTimestamp = null;
  let elapsed = 0;
  let progress = 0;
  const pointer = { x: 0, y: 0 };
  const targetPointer = { x: 0, y: 0 };
  let fittedDistance = 1;

  function checkAbort() {
    if (signal?.aborted) throw new DOMException('Motion scene aborted', 'AbortError');
  }

  function stop() {
    if (lifecycle === 'disposed') return;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTimestamp = null;
    if (lifecycle === 'running') lifecycle = 'stopped';
  }

  function dispose() {
    if (lifecycle === 'disposed') return;
    stop();
    lifecycle = 'disposed';
    signal?.removeEventListener('abort', dispose);
    canvas?.removeEventListener('webglcontextlost', contextLost);
    canvas?.remove();
    releaseModel(model);
    model = null;
    renderer?.renderLists?.dispose();
    renderer?.dispose();
    if (renderer) renderer.forceContextLoss();
    else context?.getExtension('WEBGL_lose_context')?.loseContext();
    renderer = null;
    context = null;
  }

  function contextLost(event) {
    event.preventDefault();
    if (lifecycle === 'disposed') return;
    dispose();
    onContextLost?.('context-lost');
  }

  try {
    checkAbort();
    let data;
    try {
      const response = await fetch(modelUrl, { signal, credentials: 'same-origin' });
      checkAbort();
      if (!response.ok) throw new Error(`Model response ${response.status}`);
      data = await response.arrayBuffer();
      checkAbort();
      const objectURLs = new Set();
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => {
        if (url.startsWith('blob:')) objectURLs.add(url);
        return url;
      });
      try {
        const gltf = await new GLTFLoader(manager).parseAsync(data, new URL('.', modelUrl).href);
        model = gltf.scene;
      } finally {
        // GLTFLoader only revokes embedded image URLs after successful decode.
        for (const url of objectURLs) URL.revokeObjectURL(url);
      }
      checkAbort();
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw sceneError('asset', error);
    }

    const materials = new Set();
    model.traverse((node) => {
      for (const material of [].concat(node.material || [])) materials.add(material);
    });
    const logos = Array.from(materials).filter((material) => material.name === 'Logo');
    if (!logos.length || logos.some((material) => {
      const image = material.map?.image;
      return !(image?.width > 0 && image?.height > 0);
    })) throw sceneError('asset');

    const names = ['CoreTile', 'PythonNode', 'CDPNode', 'MCPNode'];
    const nodes = names.map((name) => model.getObjectByName(name));
    if (nodes.some((node) => !node)) throw sceneError('asset');
    const [core, ...satellites] = nodes;
    const bases = nodes.map((node) => ({ position: node.position.clone(), rotation: node.rotation.clone() }));
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    if (bounds.isEmpty()) throw sceneError('asset');
    bounds.expandByVector(new THREE.Vector3(0.12, 0.175, 0.22));
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    if (![size.x, size.y, size.z].every(Number.isFinite)) throw sceneError('asset');
    checkAbort();
    canvas = document.createElement('canvas');
    canvas.className = 'motion-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', contextLost);
    context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!context) throw sceneError('webgl');
    checkAbort();
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new THREE.Scene();
    scene.add(model);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6c7081, 2.3));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-3, 5, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd5e1ff, 1.5);
    rim.position.set(4, 1, -2);
    scene.add(rim);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    function resize() {
      if (lifecycle === 'disposed') return;
      const rect = host.getBoundingClientRect();
      if (!(rect.width > 0 && rect.height > 0)) return;
      const aspect = rect.width / rect.height;
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      fittedDistance = 1.18 * Math.max(size.y / (2 * tangent), size.x / (2 * tangent * aspect));
      camera.aspect = aspect;
      camera.near = Math.max(0.01, fittedDistance / 100);
      camera.far = fittedDistance + size.length() * 4;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 700 ? 1.25 : 1.5));
      renderer.setSize(rect.width, rect.height, false);
    }

    function setPalette(next) {
      if (lifecycle === 'disposed' || !next) return;
      for (const material of materials) {
        if (material.name === 'Accent' && next.accent) material.color.set(next.accent);
        if (material.name === 'Ceramic') material.color.set(next.theme === 'dark' ? '#dddcd7' : '#f7f6f2');
      }
    }

    function setProgress(value) {
      if (lifecycle !== 'disposed') progress = clamp(value, 0, 1);
    }

    function setPointer(x, y) {
      if (lifecycle === 'disposed') return;
      targetPointer.x = clamp(x, -1, 1);
      targetPointer.y = clamp(y, -1, 1);
    }

    function renderAt(time = elapsed, nextProgress = progress, nextPointer = pointer) {
      if (lifecycle === 'disposed') return;
      const t = Math.max(0, Number(time) || 0);
      const p = clamp(nextProgress, 0, 1);
      const x = clamp(nextPointer?.x, -1, 1);
      const y = clamp(nextPointer?.y, -1, 1);
      core.rotation.copy(bases[0].rotation);
      core.rotation.y += 0.12 * Math.sin(0.6 * t) + 0.1 * p + 0.12 * x;
      core.rotation.x += 0.05 * Math.sin(0.45 * t) - 0.07 * y;
      core.position.copy(bases[0].position);
      core.position.y += 0.055 * Math.sin(0.65 * t);
      satellites.forEach((node, index) => {
        const phase = [0, 2.1, 4.2][index];
        node.position.copy(bases[index + 1].position);
        node.position.x += 0.08 * Math.sin(0.4 * t + phase);
        node.position.y += 0.12 * Math.sin(0.7 * t + phase);
        node.position.z += 0.1 * Math.cos(0.5 * t + phase) - 0.12 * p;
      });
      camera.position.set(fittedDistance * (0.08 * p + 0.025 * x), center.y + 0.2 + 0.25 * p + 0.08 * y, fittedDistance);
      camera.lookAt(center);
      if (context.isContextLost()) throw sceneError('context-lost');
      renderer.render(scene, camera);
      if (context.isContextLost()) throw sceneError('context-lost');
    }

    function tick(timestamp) {
      frame = null;
      if (lifecycle !== 'running') return;
      const dt = lastTimestamp === null ? 0 : clamp((timestamp - lastTimestamp) / 1000, 0, 0.05);
      lastTimestamp = timestamp;
      elapsed += dt;
      const damping = 1 - Math.exp(-8 * dt);
      pointer.x += (targetPointer.x - pointer.x) * damping;
      pointer.y += (targetPointer.y - pointer.y) * damping;
      try {
        renderAt(elapsed, progress, pointer);
      } catch (error) {
        dispose();
        onContextLost?.(error.reason || 'runtime');
        return;
      }
      if (lifecycle === 'running') frame = requestAnimationFrame(tick);
    }

    function start() {
      if (lifecycle === 'disposed' || lifecycle === 'running') return;
      lifecycle = 'running';
      lastTimestamp = null;
      frame = requestAnimationFrame(tick);
    }

    resize();
    setPalette(palette);
    checkAbort();
    lifecycle = 'stopped';
    signal?.addEventListener('abort', dispose, { once: true });
    return { canvas, start, stop, resize, setPalette, setProgress, setPointer, renderAt, dispose };
  } catch (error) {
    dispose();
    if (error.name === 'AbortError' || error.reason) throw error;
    throw sceneError('runtime', error);
  }
}
