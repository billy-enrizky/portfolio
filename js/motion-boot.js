(function () {
  "use strict";

  var KEY = "portfolio-motion-v1";
  var root = document.documentElement;

  function storedMode() {
    var parsed;
    try { parsed = JSON.parse(localStorage.getItem(KEY)); } catch (_) { return "auto"; }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return "auto";
    return parsed.mode === "paused" ? "paused" : "auto";
  }

  function reason() {
    if (new URLSearchParams(location.search).has("noanim")) return "noanim";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
    if (storedMode() === "paused") return "paused";
    return "";
  }

  window.portfolioMotion = { key: KEY, storedMode: storedMode, reason: reason };

  if (!reason()) {
    root.classList.add("motion-on");
    // Nothing may stay hidden if the motion module is blocked or fails.
    window.setTimeout(function () {
      if (!window.portfolioMotion.ready) root.classList.remove("motion-on");
    }, 3000);
  }
})();
