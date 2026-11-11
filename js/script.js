(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const noAnimation = new URLSearchParams(window.location.search).has("noanim");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
        navToggle.focus();
      }
    });
  }

  const atlasButtons = Array.from(document.querySelectorAll(".atlas-mode"));
  const atlasResult = document.getElementById("atlas-result");
  const atlasCopy = {
    local: "Laya ranks the page on this device. The page text stays in the browser.",
    cloud: "Jev ranks bounded passages on the server. The page still supplies the exact words."
  };

  atlasButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const mode = button.dataset.mode;
      atlasButtons.forEach(function (item) {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      if (atlasResult && atlasCopy[mode]) {
        atlasResult.textContent = atlasCopy[mode];
      }
    });
  });

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));

  if ("IntersectionObserver" in window && sections.length && navAnchors.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchors.forEach(function (anchor) {
          if (anchor.getAttribute("href") === "#" + id) {
            anchor.setAttribute("aria-current", "page");
          } else {
            anchor.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  if (reduceMotion || noAnimation || !window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);

  const items = window.gsap.utils.toArray("[data-reveal]");
  if (!items.length) return;

  window.gsap.set(items, { opacity: 0, y: 14 });
  window.ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      window.gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.08,
        ease: "power2.out",
        overwrite: true
      });
    }
  });
})();
