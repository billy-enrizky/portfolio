(function () {
  "use strict";

  var boot = window.portfolioMotion;
  if (!boot) return;

  var root = document.documentElement;
  var STAGGER_MS = 70;
  var STAGGER_CAP_MS = 800;
  var REVEAL_MS = 900;
  var SPRITE = { url: "images/motion/openbrowser-turn.webp", cols: 6, rows: 4, frames: 24 };
  var MASKED = [".hero-name-line", ".section-heading h2"];

  var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var toggles = [];
  var observer;
  var pending = new Set();
  var spriteRequested = false;
  var frame = 0;
  var scrollQueued = false;
  var batchStart = 0;
  var batchCount = 0;

  function mask(el) {
    if (el.querySelector(".mask-line")) return;
    var outer = document.createElement("span");
    var inner = document.createElement("span");
    outer.className = "mask-line";
    while (el.firstChild) inner.appendChild(el.firstChild);
    outer.appendChild(inner);
    el.appendChild(outer);
  }

  function reveal(el) {
    if (el.classList.contains("is-revealed")) return;
    var now = performance.now();
    if (now - batchStart > 120) { batchStart = now; batchCount = 0; }
    el.style.setProperty("--delay", Math.min(batchCount * STAGGER_MS, STAGGER_CAP_MS) + "ms");
    batchCount += 1;
    el.classList.add("is-revealed");
    var cleanup = function () { el.style.removeProperty("--delay"); };
    window.setTimeout(cleanup, STAGGER_CAP_MS + REVEAL_MS);
  }

  function settle(el) {
    if (!el) return;
    var nodes = [];
    for (var node = el; node && node !== document.body; node = node.parentElement) nodes.push(node);
    nodes = nodes.concat(Array.from(el.querySelectorAll("[data-reveal], .mask-line")));
    nodes.forEach(function (n) {
      if (n.matches("[data-reveal], .mask-line")) {
        n.classList.add("is-revealed", "is-settled");
      }
    });
  }

  function settleAll() {
    document.querySelectorAll("[data-reveal], .mask-line").forEach(function (n) { n.classList.add("is-revealed"); });
    pending.clear();
  }

  function startObserving() {
    if (observer) observer.disconnect();
    if (!("IntersectionObserver" in window)) { settleAll(); return; }
    pending.clear();
    observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting || e.boundingClientRect.top < 0; });
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      visible.forEach(function (e) { reveal(e.target); pending.delete(e.target); observer.unobserve(e.target); });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    pending.clear();
    document.querySelectorAll("[data-reveal], .mask-line").forEach(function (el) {
      if (el.classList.contains("is-revealed")) return;
      pending.add(el);
      observer.observe(el);
    });
  }

  function setFrame(index) {
    var tile = document.querySelector(".hero-turn");
    if (!tile) return;
    var col = index % SPRITE.cols;
    var row = Math.floor(index / SPRITE.cols);
    tile.style.backgroundPosition = (col * 100 / (SPRITE.cols - 1)) + "% " + (row * 100 / (SPRITE.rows - 1)) + "%";
  }

  function revealPassed() {
    pending.forEach(function (el) {
      if (el.getBoundingClientRect().bottom < 0) {
        el.style.setProperty("--delay", "0ms");
        el.classList.add("is-revealed");
        pending.delete(el);
        if (observer) observer.unobserve(el);
      }
    });
  }

  function updateScroll() {
    scrollQueued = false;
    if (!root.classList.contains("motion-on")) return;
    revealPassed();
    revealBottom();
    var max = document.documentElement.scrollHeight - innerHeight;
    var bar = document.querySelector(".scroll-progress span");
    if (bar && max > 0) bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, scrollY / max)) + ")";
    var hero = document.getElementById("summary");
    if (hero) {
      var span = Math.max(1, hero.offsetHeight);
      var t = Math.min(1, Math.max(0, scrollY / span));
      var next = Math.round(t * (SPRITE.frames - 1));
      if (next !== frame) { frame = next; setFrame(frame); }
    }
    updateRoute();
  }

  function revealBottom() {
    if (scrollY + innerHeight < document.documentElement.scrollHeight - 2) return;
    pending.forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight) {
        el.style.setProperty("--delay", "0ms");
        el.classList.add("is-revealed");
        pending.delete(el);
        if (observer) observer.unobserve(el);
      }
    });
  }

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }

  function loadSprite() {
    if (spriteRequested || root.classList.contains("sprite-ready")) return;
    var conn = navigator.connection;
    if (conn && conn.saveData) return;
    spriteRequested = true;
    var img = new Image();
    img.onload = function () {
      setFrame(frame);
      root.classList.add("sprite-ready");
    };
    img.src = SPRITE.url;
  }

  var route;
  function buildRoute() {
    var section = document.getElementById("experience");
    if (!section || route) return;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "career-route");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    svg.appendChild(path);
    section.insertBefore(svg, section.firstChild);
    route = { svg: svg, path: path, dots: [] };
    layoutRoute();
  }

  function offsetWithin(el, ancestor) {
    var top = 0;
    for (var node = el; node && node !== ancestor; node = node.offsetParent) top += node.offsetTop;
    return top;
  }

  var routeFrame = 0;
  function scheduleRoute() {
    if (routeFrame || !root.classList.contains("motion-on")) return;
    routeFrame = requestAnimationFrame(function () { routeFrame = 0; layoutRoute(); });
  }

  function layoutRoute() {
    if (!route) return;
    var section = document.getElementById("experience");
    var records = Array.from(section.querySelectorAll(".role-record"));
    if (!records.length || section.offsetHeight === 0) return;
    var gutter = parseFloat(getComputedStyle(section.parentElement).paddingLeft) || 20;
    var x = -gutter / 2;
    var points = records.map(function (r) {
      return { y: offsetWithin(r, section) + 40 };
    });
    var d = "M" + x + " " + points[0].y;
    points.forEach(function (p, i) { if (i) d += " L" + x + " " + p.y; });
    route.path.setAttribute("d", d);
    route.length = route.path.getTotalLength();
    route.path.style.strokeDasharray = route.length;
    route.points = points;
    route.dots.forEach(function (n) { n.remove(); });
    route.dots = points.map(function (p) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "route-dot");
      c.setAttribute("cx", x);
      c.setAttribute("cy", p.y);
      c.setAttribute("r", 5);
      route.svg.appendChild(c);
      return c;
    });
    updateRoute();
  }

  function updateRoute() {
    if (!route || !route.points || !root.classList.contains("motion-on")) return;
    var section = document.getElementById("experience");
    var box = section.getBoundingClientRect();
    var reading = innerHeight * 0.6 - box.top;
    var last = route.points[route.points.length - 1].y;
    var first = route.points[0].y;
    var progress = Math.min(1, Math.max(0, (reading - first) / Math.max(1, last - first)));
    route.path.style.strokeDashoffset = route.length * (1 - progress);
    route.points.forEach(function (p, i) {
      route.dots[i].classList.toggle("on", reading >= p.y);
    });
  }

  function syncToggles() {
    var reason = boot.reason();
    toggles.forEach(function (btn) {
      btn.hidden = false;
      if (reason === "noanim") { btn.textContent = "Motion off for this view"; btn.disabled = true; }
      else if (reason === "reduced") { btn.textContent = "Motion reduced by system setting"; btn.disabled = true; }
      else { btn.disabled = false; btn.textContent = reason === "paused" ? "Play motion" : "Pause motion"; }
    });
  }

  function apply() {
    var reason = boot.reason();
    var on = !reason && !boot.failed;
    root.classList.toggle("motion-on", on);
    if (on) {
      scheduleRoute();
      startObserving();
      loadSprite();
      onScroll();
    } else {
      if (observer) observer.disconnect();
      settleAll();
    }
    syncToggles();
  }

  function store(mode) {
    boot.remember(mode);
    try { localStorage.setItem(boot.key, JSON.stringify({ mode: mode })); } catch (_) { /* Keep working for this visit. */ }
  }

  function bindToggle(btn) {
    toggles.push(btn);
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      var paused = boot.reason() === "paused";
      store(paused ? "auto" : "paused");
      apply();
    });
  }

  function init() {
    MASKED.forEach(function (selector) { document.querySelectorAll(selector).forEach(mask); });
    document.querySelectorAll("[data-motion-toggle]").forEach(bindToggle);
    buildRoute();

    document.addEventListener("portfolio:navigate", function (event) {
      var id = event.detail && event.detail.id;
      if (id && id !== "main") settle(document.getElementById(id));
    });
    document.addEventListener("focusin", function (event) {
      var node = event.target.closest && event.target.closest("[data-reveal]");
      if (node) settle(node);
    });
    window.addEventListener("storage", function (event) {
      if (event.key === null || event.key === boot.key) { boot.remember(null); apply(); }
    });
    reducedQuery.addEventListener("change", apply);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { scheduleRoute(); onScroll(); });
    document.addEventListener("toggle", scheduleRoute, true);
    window.addEventListener("hashchange", function () {
      var id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      if (id && id !== "main") settle(document.getElementById(id));
    });

    // A deep link must be readable before anything animates.
    if (location.hash) {
      try { settle(document.getElementById(decodeURIComponent(location.hash.slice(1)))); } catch (_) { /* Ignore a malformed hash. */ }
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutRoute);
    boot.ready = true;
    apply();
  }

  init();
})();
