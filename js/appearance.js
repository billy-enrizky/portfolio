(function () {
  "use strict";

  const storageKey = "portfolio-appearance";
  const themes = ["system", "light", "dark"];
  const colors = { red: "Red", orange: "Orange", green: "Green", blue: "Blue", pink: "Pink" };
  const root = document.documentElement;
  root.classList.add("js");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function readPreferences(value) {
    let saved;
    try { saved = JSON.parse(value); } catch (_) { saved = null; }
    return {
      theme: themes.includes(saved?.theme) ? saved.theme : "light",
      color: typeof saved?.color === "string" && Object.hasOwn(colors, saved.color) ? saved.color : "blue"
    };
  }

  let stored;
  try { stored = localStorage.getItem(storageKey); } catch (_) { /* Storage is optional. */ }
  let preferences = readPreferences(stored);

  function applyAppearance() {
    const theme = preferences.theme === "system" ? (systemTheme.matches ? "dark" : "light") : preferences.theme;
    root.dataset.theme = theme;
    root.dataset.color = preferences.color;
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#101010" : "#f1f1f1";
  }

  // This script precedes the stylesheet so the first paint uses the saved appearance.
  applyAppearance();

  function connectControls() {
    // Reconcile changes from the OS or another tab while the document was loading.
    try { preferences = readPreferences(localStorage.getItem(storageKey)); } catch (_) { /* Keep the early preference. */ }
    applyAppearance();
    const controls = document.querySelector(".appearance-controls");
    const inputs = controls.querySelectorAll("input");
    const colorName = document.getElementById("appearance-color-name");

    function syncControls() {
      inputs.forEach(function (input) {
        input.checked = input.value === preferences[input.name === "appearance-theme" ? "theme" : "color"];
      });
      colorName.textContent = colors[preferences.color];
    }

    controls.addEventListener("change", function (event) {
      const input = event.target;
      if (input.name === "appearance-theme" && themes.includes(input.value)) preferences.theme = input.value;
      else if (input.name === "appearance-color" && Object.hasOwn(colors, input.value)) preferences.color = input.value;
      else return;
      applyAppearance();
      syncControls();
      try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) { /* Keep working for this visit. */ }
    });

    document.addEventListener("click", function (event) {
      if (controls.open && !controls.contains(event.target)) controls.open = false;
    });
    document.addEventListener("focusin", function (event) {
      if (controls.open && !controls.contains(event.target)) controls.open = false;
    });

    controls.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && controls.open) {
        event.preventDefault();
        event.stopPropagation();
        controls.open = false;
        controls.querySelector("summary").focus();
      }
    });

    systemTheme.addEventListener("change", function () {
      if (preferences.theme === "system") applyAppearance();
    });
    window.addEventListener("storage", function (event) {
      if (event.key !== storageKey && event.key !== null) return;
      preferences = readPreferences(event.newValue);
      applyAppearance();
      syncControls();
    });
    syncControls();
    root.classList.add("appearance-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", connectControls, { once: true });
  else connectControls();
})();
