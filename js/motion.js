(function () {
  'use strict';

  const savedScript = document.currentScript;
  const lifetime = new AbortController();
  const root = document.documentElement;
  const host = document.querySelector('.hero-project-tile');
  const hero = document.getElementById('summary');
  const buttons = Array.from(document.querySelectorAll('[data-motion-toggle]'));
  const appearance = document.querySelector('.appearance-controls');
  const storageKey = 'portfolio-motion-v1';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const cleanups = [];
  const scheduledFrames = new Set();
  const entries = new Map();
  const settledTargets = new Set();
  const masks = [];
  const gsap = window.gsap;
  let revealObserver;
  let progressTrigger;
  let heroObserver;
  let resizeObserver;
  let attributeObserver;
  let bodyObserver;
  let pointerRect;
  let navigationGeneration = 0;
  let visitMode = null;

  function readMode(value) {
    try {
      const saved = JSON.parse(value);
      if (saved && typeof saved === 'object' && !Array.isArray(saved) &&
          typeof saved.mode === 'string' && ['auto', 'paused'].includes(saved.mode)) return saved.mode;
    } catch (_) { /* Storage is optional. */ }
    return 'auto';
  }

  function storedMode(fallback = 'auto') {
    if (visitMode !== null) return visitMode;
    try { return readMode(localStorage.getItem(storageKey)); } catch (_) { return fallback; }
  }

  function hashTarget() {
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (_) { return null; }
  }

  const initialTarget = hashTarget();
  const state = {
    mode: storedMode(),
    reduced: reduced.matches,
    noanim: new URLSearchParams(location.search).has('noanim'),
    visible: document.visibilityState !== 'hidden',
    frozen: false,
    disposed: false,
    heroVisible: false,
    navigationGate: Boolean(initialTarget && !['summary', 'top', 'hero-heading'].includes(initialTarget.id)),
    overlay: false,
    saveData: Boolean(connection?.saveData),
    viewport: { width: 0, height: 0 },
    progress: 0,
    scene: { phase: 'idle', generation: 0, promise: null, instance: null, redraw: false }
  };

  function policy() {
    const available = !state.disposed && !state.frozen && state.visible && !state.overlay;
    const canAnimate = available && state.mode === 'auto' && !state.reduced && !state.noanim;
    const sceneVisible = state.heroVisible && !state.navigationGate && state.viewport.width > 0 && state.viewport.height > 0;
    const canLoadScene = canAnimate && sceneVisible && !state.saveData;
    return {
      canAnimate,
      canLoadScene,
      canLoopScene: canLoadScene && state.scene.phase === 'ready',
      canDrawStill: available && sceneVisible,
      label: state.noanim ? 'Motion off' : state.reduced ? 'Motion reduced' : state.mode === 'paused' ? 'Play motion' : 'Pause motion',
      disabled: state.noanim || state.reduced || state.disposed,
      motionState: state.disposed ? 'disposed' : state.noanim ? 'disabled' : state.reduced ? 'reduced' : state.mode === 'paused' ? 'paused' : !available ? 'suspended' : 'active'
    };
  }

  function listen(target, type, handler, options) {
    if (!target) return;
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  }

  function nextFrame(callback) {
    const id = requestAnimationFrame(() => {
      scheduledFrames.delete(id);
      if (!state.disposed) callback();
    });
    scheduledFrames.add(id);
  }

  function phase(value, reason) {
    state.scene.phase = value;
    if (!host) return;
    host.dataset.sceneState = value;
    if (reason) host.dataset.sceneReason = reason;
    else delete host.dataset.sceneReason;
    if (value !== 'ready') host.classList.remove('is-3d-ready');
  }

  function settleEntry(entry) {
    entry.animation?.kill();
    entry.animation = null;
    entry.status = 'settled';
    entry.element.style.removeProperty('transform');
    entry.element.style.removeProperty('will-change');
    if (entry.kind === 'rule') entry.element.style.setProperty('--motion-rule-progress', '1');
    if (entry.kind === 'name') entry.owner.classList.remove('motion-name-masked');
    revealObserver?.unobserve(entry.owner);
  }

  function settle(target) {
    if (!target) return;
    settledTargets.add(target);
    for (const entry of entries.values()) {
      if (target === document || target === entry.owner || target.contains(entry.owner) || entry.owner.contains(target)) settleEntry(entry);
    }
  }

  function destroy() {
    if (state.disposed) return;
    state.disposed = true;
    state.scene.generation += 1;
    lifetime.abort();
    state.scene.instance?.dispose();
    state.scene.instance = null;
    for (const frame of scheduledFrames) cancelAnimationFrame(frame);
    scheduledFrames.clear();
    revealObserver?.disconnect();
    heroObserver?.disconnect();
    resizeObserver?.disconnect();
    attributeObserver?.disconnect();
    bodyObserver?.disconnect();
    progressTrigger?.kill();
    for (const remove of cleanups.splice(0)) remove();
    settle(document);
    for (const { owner, inner } of masks) {
      inner.replaceWith(...inner.childNodes);
      owner.classList.remove('motion-name-masked');
    }
    for (const entry of entries.values()) {
      if (entry.kind === 'rule') {
        entry.owner.classList.remove('motion-rule');
        entry.owner.style.removeProperty('--motion-rule-progress');
      }
    }
    entries.clear();
    root.classList.remove('motion-ready');
    root.dataset.motionState = 'disposed';
    buttons.forEach((button) => { button.disabled = true; });
    phase('disposed');
  }

  if (!savedScript?.src || !host?.querySelector('.motion-poster') || !hero || buttons.length !== 2) {
    destroy();
    return;
  }

  const bundleUrl = new URL('motion-scene.bundle.js', savedScript.src);
  const modelUrl = new URL('../assets/motion/openbrowser-scene.glb', savedScript.src);
  if (savedScript.dataset.sceneVersion) bundleUrl.searchParams.set('v', savedScript.dataset.sceneVersion);
  if (savedScript.dataset.modelVersion) modelUrl.searchParams.set('v', savedScript.dataset.modelVersion);

  function readPalette() {
    const style = getComputedStyle(root);
    return { accent: style.getPropertyValue('--accent').trim(), theme: root.dataset.theme || 'light' };
  }

  function measure() {
    pointerRect = host.getBoundingClientRect();
    state.viewport = { width: pointerRect.width, height: pointerRect.height };
  }

  function readHeroVisibility() {
    const rect = host.getBoundingClientRect();
    state.heroVisible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  }

  function readOverlay() {
    state.overlay = document.body.classList.contains('nav-open') || Boolean(appearance?.open);
  }

  function fallback(reason) {
    if (state.disposed || state.scene.phase === 'fallback') return;
    state.scene.generation += 1;
    state.scene.instance?.dispose();
    state.scene.instance = null;
    state.scene.redraw = false;
    phase('fallback', ['webgl', 'asset', 'context-lost', 'runtime'].includes(reason) ? reason : 'runtime');
  }

  function loadScene() {
    if (state.scene.phase !== 'idle' || state.scene.promise || !policy().canLoadScene) return;
    const generation = ++state.scene.generation;
    phase('loading');
    state.scene.promise = (async () => {
      let instance;
      try {
        const module = await import(bundleUrl.href);
        if (state.disposed || generation !== state.scene.generation) return;
        instance = await module.createMotionScene(host, {
          modelUrl: modelUrl.href,
          palette: readPalette(),
          signal: lifetime.signal,
          onContextLost: (reason) => {
            if (generation === state.scene.generation) fallback(reason || 'context-lost');
          }
        });
        if (state.disposed || generation !== state.scene.generation) {
          instance.dispose();
          return;
        }
        state.scene.instance = instance;
        phase('prepared');
        state.scene.redraw = true;
        instance.setPalette(readPalette());
        instance.setProgress(state.progress);
        reconcile();
      } catch (error) {
        instance?.dispose();
        if (!state.disposed && generation === state.scene.generation) fallback(error.reason || 'runtime');
      } finally {
        state.scene.promise = null;
      }
    })();
  }

  function reconcile() {
    if (state.disposed) return;
    const current = policy();
    root.dataset.motionState = current.motionState;
    buttons.forEach((button) => {
      button.textContent = current.label;
      button.disabled = current.disabled;
      button.setAttribute('aria-describedby', 'motion-note');
    });
    if (!current.canAnimate) settle(document);
    const instance = state.scene.instance;
    if (instance) {
      if (!current.canLoopScene) instance.stop();
      if (state.scene.redraw && current.canDrawStill) {
        state.scene.redraw = false;
        try {
          instance.resize();
          instance.setProgress(state.progress);
          instance.renderAt(undefined, state.progress);
          if (state.disposed || state.scene.instance !== instance || state.scene.phase === 'fallback') return;
          if (state.scene.phase === 'prepared') {
            host.appendChild(instance.canvas);
            phase('ready');
            host.classList.add('is-3d-ready');
          }
        } catch (error) {
          fallback(error.reason || 'runtime');
          return;
        }
      }
      if (policy().canLoopScene) instance.start();
    } else if (current.canLoadScene) loadScene();
  }

  function requestRedraw() {
    if (state.scene.instance) state.scene.redraw = true;
    reconcile();
  }

  function refreshLayout() {
    measure();
    readHeroVisibility();
    state.scene.instance?.resize();
    requestRedraw();
  }

  function settleNavigation(target) {
    if (!target || state.disposed) return;
    settle(target);
    const record = target.closest('.role-record, .project-record, .paper-record, .education-entry, .credential-group');
    if (record) settle(record);
    const version = ++navigationGeneration;
    state.navigationGate = true;
    reconcile();
    nextFrame(() => nextFrame(() => {
      if (version !== navigationGeneration) return;
      state.navigationGate = false;
      readHeroVisibility();
      reconcile();
    }));
  }

  listen(document, 'portfolio:navigate', (event) => {
    const id = event.detail?.id;
    if (typeof id === 'string') settleNavigation(document.getElementById(id));
  });
  listen(document, 'focusin', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    settle(target.closest('.role-record, .project-record, .paper-record, .education-entry, .credential-group, .hero-name, .section-heading') || target);
  });
  listen(window, 'hashchange', () => settleNavigation(hashTarget()));
  listen(window, 'popstate', () => settleNavigation(hashTarget()));
  listen(window, 'storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    // A cross-tab motion change supersedes this visit's unpersisted choice.
    visitMode = null;
    state.mode = readMode(event.newValue);
    reconcile();
  });
  listen(reduced, 'change', () => {
    state.reduced = reduced.matches;
    reconcile();
  });
  listen(connection, 'change', () => {
    state.saveData = Boolean(connection.saveData);
    reconcile();
  });
  listen(document, 'visibilitychange', () => {
    state.visible = document.visibilityState !== 'hidden';
    reconcile();
  });
  listen(window, 'pagehide', (event) => {
    if (!event.persisted) destroy();
    else {
      state.frozen = true;
      reconcile();
    }
  });
  listen(window, 'pageshow', () => {
    state.frozen = false;
    state.visible = document.visibilityState !== 'hidden';
    state.mode = storedMode(state.mode);
    state.reduced = reduced.matches;
    state.saveData = Boolean(connection?.saveData);
    readOverlay();
    measure();
    readHeroVisibility();
    reconcile();
  });
  buttons.forEach((button) => {
    listen(button, 'click', () => {
      if (policy().disabled) return;
      state.mode = state.mode === 'paused' ? 'auto' : 'paused';
      visitMode = state.mode;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ mode: state.mode }));
        visitMode = null;
      } catch (_) { /* Keep this visit's choice. */ }
      reconcile();
    });
  });
  listen(appearance, 'toggle', () => {
    readOverlay();
    reconcile();
  });
  bodyObserver = new MutationObserver(() => {
    readOverlay();
    reconcile();
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  attributeObserver = new MutationObserver(() => {
    if (state.disposed) return;
    try { state.scene.instance?.setPalette(readPalette()); } catch (_) { fallback('runtime'); }
    requestRedraw();
  });
  attributeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-color'] });
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      if (rect.width !== state.viewport.width || rect.height !== state.viewport.height) refreshLayout();
    });
    resizeObserver.observe(host);
  }
  listen(window, 'resize', refreshLayout);
  listen(host, 'pointerenter', () => { pointerRect = host.getBoundingClientRect(); });
  listen(host, 'pointermove', (event) => {
    if (event.pointerType === 'touch' || !policy().canLoopScene || !pointerRect?.width || !pointerRect.height) return;
    const x = Math.max(-1, Math.min(1, 2 * (event.clientX - pointerRect.left) / pointerRect.width - 1));
    const y = Math.max(-1, Math.min(1, 1 - 2 * (event.clientY - pointerRect.top) / pointerRect.height));
    state.scene.instance.setPointer(x, y);
  });
  listen(host, 'pointerleave', () => state.scene.instance?.setPointer(0, 0));

  function addEntry(owner, element, kind) {
    const entry = { owner, element, kind, status: 'pending', animation: null };
    entries.set(element, entry);
    if (Array.from(settledTargets).some((target) => target === document || target.contains(owner) || owner.contains(target))) settleEntry(entry);
    return entry;
  }

  function animateEntry(entry, delay = 0) {
    if (entry.status !== 'pending') return;
    if (!policy().canAnimate) { settleEntry(entry); return; }
    entry.status = 'animating';
    if (entry.kind === 'name') entry.owner.classList.add('motion-name-masked');
    const from = entry.kind === 'rule' ? { '--motion-rule-progress': 0 } : { y: entry.kind === 'name' ? '135%' : entry.kind === 'heading' ? 18 : 22 };
    const to = entry.kind === 'rule' ? { '--motion-rule-progress': 1 } : { y: 0 };
    entry.animation = gsap.fromTo(entry.element, from, {
      ...to,
      duration: entry.kind === 'name' ? 0.6 : entry.kind === 'rule' ? 0.6 : 0.42,
      delay,
      ease: 'expo.out',
      onComplete: () => settleEntry(entry)
    });
  }

  function setupReadingMotion() {
    if (!gsap || !window.ScrollTrigger || state.disposed) return;
    try {
      gsap.registerPlugin(window.ScrollTrigger);
      document.querySelectorAll('.hero-name-line').forEach((owner) => {
        const inner = document.createElement('span');
        inner.className = 'motion-name-content';
        inner.append(...owner.childNodes);
        owner.appendChild(inner);
        masks.push({ owner, inner });
        addEntry(owner, inner, 'name');
      });
      document.querySelectorAll('.section-heading h2').forEach((owner) => addEntry(owner, owner, 'heading'));
      document.querySelectorAll('.role-record, .paper-record, .project-record, .education-entry, .credential-group').forEach((owner) => addEntry(owner, owner, 'record'));
      document.querySelectorAll('main > .content-section').forEach((owner) => {
        owner.classList.add('motion-rule');
        addEntry(owner, owner, 'rule');
      });
      progressTrigger = window.ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (trigger) => {
          state.progress = Math.max(0, Math.min(1, trigger.progress));
          state.scene.instance?.setProgress(state.progress);
        }
      });
      state.progress = Math.max(0, Math.min(1, progressTrigger.progress));
      state.scene.instance?.setProgress(state.progress);
      if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((observed) => {
          if (!policy().canAnimate) return;
          const visible = observed.filter((item) => item.isIntersecting).map((item) => item.target);
          visible.sort((a, b) => a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
          let recordIndex = 0;
          for (const owner of visible) {
            for (const entry of entries.values()) {
              if (entry.owner !== owner || entry.status !== 'pending') continue;
              const delay = entry.kind === 'record' ? Math.min(0.07 * recordIndex++, 0.8) : 0;
              animateEntry(entry, delay);
            }
            revealObserver.unobserve(owner);
          }
        }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
        for (const entry of entries.values()) if (entry.kind !== 'name' && entry.status === 'pending') revealObserver.observe(entry.owner);
      } else {
        for (const entry of entries.values()) if (entry.kind !== 'name') settleEntry(entry);
      }
      let nameIndex = 0;
      for (const entry of entries.values()) if (entry.kind === 'name') animateEntry(entry, nameIndex++ * 0.07);
      if (!policy().canAnimate) settle(document);
    } catch (_) {
      progressTrigger?.kill();
      revealObserver?.disconnect();
      settle(document);
    }
  }

  if (initialTarget) settle(initialTarget);
  if (document.activeElement && document.activeElement !== document.body) settle(document.activeElement);
  measure();
  readHeroVisibility();
  readOverlay();
  phase('idle');
  root.classList.add('motion-ready');
  if ('IntersectionObserver' in window) {
    heroObserver = new IntersectionObserver((observed) => {
      const item = observed[observed.length - 1];
      state.heroVisible = item.isIntersecting;
      reconcile();
    }, { threshold: 0 });
    heroObserver.observe(host);
  } else {
    listen(window, 'scroll', () => { readHeroVisibility(); reconcile(); }, { passive: true });
  }
  reconcile();
  const fontsReady = document.fonts?.ready || Promise.resolve();
  Promise.resolve(fontsReady).catch(() => {}).then(() => {
    if (state.disposed) return;
    nextFrame(() => nextFrame(() => {
      state.mode = storedMode(state.mode);
      state.reduced = reduced.matches;
      state.navigationGate = false;
      const target = hashTarget();
      if (target) settle(target);
      measure();
      readHeroVisibility();
      setupReadingMotion();
      reconcile();
    }));
  });
})();
