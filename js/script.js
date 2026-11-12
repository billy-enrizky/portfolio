(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const noAnimation = new URLSearchParams(window.location.search).has("noanim");
  const menuButton = document.querySelector(".nav-toggle");
  const sidebar = document.getElementById("site-index");
  const backdrop = document.querySelector(".nav-backdrop");
  const menuMedia = window.matchMedia("(max-width: 900px)");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const detailPanels = Array.from(document.querySelectorAll("main details"));
  const detailButton = document.getElementById("details-toggle");
  let refreshTimer;

  function refreshMotion() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 100);
  }

  function setMenu(open, restoreFocus) {
    document.body.classList.toggle("nav-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Close" : "Sections";
    if (!open && restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener("click", function () {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMenu(open, false);
    if (open) {
      const started = performance.now();
      function focusVisibleMenu() {
        if (!document.body.classList.contains("nav-open")) return;
        const first = navLinks[0];
        const visible = getComputedStyle(first).visibility === "visible";
        if (visible && sidebar.getBoundingClientRect().left >= 0) {
          first.focus({ preventScroll: true });
          if (document.activeElement === first) return;
        }
        if (performance.now() - started < 1000) requestAnimationFrame(focusVisibleMenu);
      }
      requestAnimationFrame(focusVisibleMenu);
    }
  });
  backdrop.addEventListener("click", function () { setMenu(false, true); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) setMenu(false, true);
  });
  document.addEventListener("focusin", function (event) {
    if (menuMedia.matches && document.body.classList.contains("nav-open") &&
        !sidebar.contains(event.target) && event.target !== menuButton && event.target !== backdrop) setMenu(false, false);
  });
  menuMedia.addEventListener("change", function () { setMenu(false, false); });

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (link.hash === "#" + id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(function () {
      const line = innerHeight * 0.3;
      const current = sections.find(function (section) {
        const r = section.getBoundingClientRect();
        return r.top <= line && r.bottom > line;
      });
      if (current) setCurrent(current.id);
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
  setCurrent("summary");

  function syncDetailsButton() {
    const allOpen = detailPanels.every(function (panel) { return panel.open; });
    detailButton.textContent = allOpen ? "Hide extra details" : "Show all details";
    detailButton.setAttribute("aria-pressed", String(allOpen));
  }
  detailButton.addEventListener("click", function () {
    const open = !detailPanels.every(function (panel) { return panel.open; });
    detailPanels.forEach(function (panel) { panel.open = open; });
    syncDetailsButton();
    refreshMotion();
  });
  document.addEventListener("toggle", function (event) {
    if (event.target instanceof HTMLDetailsElement) {
      syncDetailsButton();
      refreshMotion();
    }
  }, true);

  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function activateTab(tab, focus) {
    tabs.forEach(function (item) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    });
    if (focus) tab.focus();
    refreshMotion();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (event) {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activateTab(tabs[next], true); }
    });
  });

  const search = document.getElementById("project-search");
  const clearSearch = document.getElementById("clear-project-search");
  const filters = Array.from(document.querySelectorAll(".project-filters button"));
  const projectCards = Array.from(document.querySelectorAll(".project-record"));
  const searchText = new Map(projectCards.map(function (card) {
    return [card, card.textContent.toLowerCase()];
  }));
  let category = "All";

  function applyFilters() {
    const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const visible = [];
    projectCards.forEach(function (card) {
      const match = (category === "All" || card.dataset.category === category) &&
        words.every(function (word) { return searchText.get(card).includes(word); });
      card.hidden = !match;
      card.classList.remove("is-last-odd");
      if (match) visible.push(card);
    });
    if (visible.length % 2) visible[visible.length - 1].classList.add("is-last-odd");
    document.getElementById("project-count").textContent = visible.length === projectCards.length ?
      projectCards.length + " projects" : visible.length + " of " + projectCards.length + " projects";
    document.getElementById("project-empty").hidden = visible.length > 0;
    clearSearch.disabled = !search.value && category === "All";
    filters.forEach(function (filter) { filter.setAttribute("aria-pressed", String(filter.dataset.category === category)); });
    refreshMotion();
  }
  search.addEventListener("input", applyFilters);
  search.addEventListener("search", applyFilters);
  filters.forEach(function (filter) {
    filter.addEventListener("click", function () { category = filter.dataset.category; applyFilters(); });
  });
  clearSearch.addEventListener("click", function () {
    category = "All"; search.value = ""; applyFilters(); search.focus();
  });
  applyFilters();

  function showHash(focus) {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const card = target.closest(".project-record");
    if (card && card.hidden) { search.value = ""; category = "All"; applyFilters(); }
    let parent = target.closest("details");
    while (parent) { parent.open = true; parent = parent.parentElement.closest("details"); }
    const section = target.closest("main > section[id]");
    if (section) setCurrent(section.id);
    requestAnimationFrame(function () {
      target.scrollIntoView({ block: "start", behavior: "instant" });
      if (focus) {
        const heading = target.querySelector("h1, h2, h3");
        const focusTarget = heading || target;
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
      }
    });
  }
  document.addEventListener("click", function (event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !document.getElementById(link.hash.slice(1))) return;
    event.preventDefault();
    setMenu(false, false);
    history.pushState(null, "", link.hash);
    showHash(true);
  });
  window.addEventListener("hashchange", function () { showHash(false); });
  window.addEventListener("popstate", function () { showHash(false); });
  document.getElementById("role-jump").addEventListener("change", function (event) {
    if (!event.target.value) return;
    history.pushState(null, "", "#" + event.target.value);
    showHash(true);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { showHash(false); });
  else showHash(false);

  // Motion supports orientation and hierarchy. It adds no pinned scrolling or hidden content.
  if (!noAnimation && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const motion = window.gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", function () {
    const heading = document.querySelector(".contact-reveal");
    const originalHeading = heading.textContent;
    const words = originalHeading.trim().split(/\s+/);
    heading.textContent = "";
    words.forEach(function (word, index) {
      const span = document.createElement("span");
      span.textContent = word;
      span.style.display = "inline-block";
      heading.appendChild(span);
      if (index < words.length - 1) heading.appendChild(document.createTextNode(" "));
    });
    window.gsap.fromTo(heading.querySelectorAll("span"), { opacity: 0.65 }, {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: { trigger: heading, start: "top 90%", end: "top 58%", scrub: true }
    });
    return function () { heading.textContent = originalHeading; };
    });
  }
})();
