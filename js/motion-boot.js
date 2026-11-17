(function () {
  "use strict";

  var root = document.documentElement;

  function reason() {
    if (new URLSearchParams(location.search).has("noanim")) return "noanim";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
    return "";
  }

  window.portfolioMotion = { reason: reason };

  if (!reason()) {
    root.classList.add("motion-on");
    // Nothing may stay hidden if the motion module is blocked or fails.
    window.setTimeout(function () {
      if (!window.portfolioMotion.ready) root.classList.remove("motion-on");
    }, 3000);
  }
})();
