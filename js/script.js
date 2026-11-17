(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const menuButton = document.querySelector(".nav-toggle");
  const sidebar = document.getElementById("site-index");
  const backdrop = document.querySelector(".nav-backdrop");
  const appearanceControl = document.querySelector(".appearance-controls");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const detailPanels = Array.from(document.querySelectorAll("main details"));
  const detailButton = document.getElementById("details-toggle");
  const foldButtons = Array.from(document.querySelectorAll(".section-toggle"));

  function setSection(button, open) {
    const body = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(open));
    if (body) body.hidden = !open;
  }
  foldButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setSection(button, button.getAttribute("aria-expanded") !== "true");
    });
  });
  function expandSection(node) {
    const section = node.closest("main > section[id]");
    const button = section && section.querySelector(".section-toggle");
    if (button) setSection(button, true);
  }

  function setMenu(open, restoreFocus) {
    if (open) appearanceControl.open = false;
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
        if (visible && sidebar.getBoundingClientRect().left >= -1 && sidebar.getBoundingClientRect().right <= innerWidth + 1) {
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
    if (document.body.classList.contains("nav-open") &&
        !sidebar.contains(event.target) && event.target !== menuButton && event.target !== backdrop) setMenu(false, false);
  });
  appearanceControl.addEventListener("toggle", function () {
    if (appearanceControl.open && document.body.classList.contains("nav-open")) setMenu(false, false);
  });

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
    if (open) foldButtons.forEach(function (button) { setSection(button, true); });
    syncDetailsButton();
  });
  document.addEventListener("toggle", function (event) {
    if (event.target instanceof HTMLDetailsElement) {
      syncDetailsButton();
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
    expandSection(target);
    if (target.matches("article")) target.querySelectorAll(":scope > details").forEach(function (d) { d.open = true; });
    const section = target.closest("main > section[id]");
    if (section) setCurrent(section.id);
    document.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: { id: id } }));
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

  let printState = null;
  let printSections = null;
  window.addEventListener("beforeprint", function () {
    printState = detailPanels.map(function (panel) { return panel.open; });
    printSections = foldButtons.map(function (button) { return button.getAttribute("aria-expanded") === "true"; });
    detailPanels.forEach(function (panel) { panel.open = true; });
    foldButtons.forEach(function (button) { setSection(button, true); });
  });
  window.addEventListener("afterprint", function () {
    if (!printState) return;
    detailPanels.forEach(function (panel, i) { panel.open = printState[i]; });
    foldButtons.forEach(function (button, i) { setSection(button, printSections[i]); });
    printState = null;
    printSections = null;
  });
  document.documentElement.classList.add("navigation-ready");

})();
