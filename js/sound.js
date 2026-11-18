(function () {
  "use strict";

  var KEY = "portfolio-sound";
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".sound-toggle"));
  var music = document.getElementById("ambient-music");
  if (!buttons.length || !music) return;

  var clickSound = new Audio("assets/sfx/click.ogg");
  var tickSound = new Audio("assets/sfx/tick.ogg");
  clickSound.preload = "auto";
  tickSound.preload = "auto";
  clickSound.volume = 0.3;
  tickSound.volume = 0.12;
  music.volume = 0.32;

  var finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var enabled = true;
  var started = false;
  var starting = false;
  var blocked = false;

  // Sound is on unless a visitor turned it off.
  try { var stored = localStorage.getItem(KEY); enabled = stored !== "off"; } catch (_) { /* Storage is optional. */ }

  function reflect() {
    // Three honest states: playing, enabled but waiting for the browser, and turned off.
    var state = !enabled ? "off" : (started ? "on" : (blocked ? "paused" : "starting"));
    var label = state === "off" ? "Sound off" : state === "paused" ? "Start sound" : "Sound on";
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("data-state", state);
      var text = button.querySelector(".sound-label");
      if (text) text.textContent = label;
      else button.textContent = label;
    });
  }

  // Browsers only allow audible playback after a gesture, or on a domain the visitor has used before. Try straight
  // away so a returning visitor hears the track on load, and fall back to the first activation event otherwise.
  var activations = ["pointerdown", "pointerup", "keydown", "touchend", "click"];
  function onActivation() { startMusic(); }

  function clearActivations() {
    activations.forEach(function (name) { document.removeEventListener(name, onActivation, true); });
  }

  function startMusic() {
    if (!enabled || started || starting) return;
    starting = true;
    var played = music.play();
    if (played && played.then) {
      played.then(function () {
        starting = false;
        started = true;
        blocked = false;
        clearActivations();
        reflect();
      }).catch(function () {
        starting = false;
        started = false;
        blocked = true;
        reflect();
      });
    } else {
      starting = false;
      started = true;
      blocked = false;
      clearActivations();
      reflect();
    }
  }

  function clip(sound, rate) {
    if (!enabled) return;
    try {
      var copy = sound.cloneNode();
      copy.volume = sound.volume;
      copy.playbackRate = rate || 1;
      var played = copy.play();
      if (played && played.catch) played.catch(function () { /* A blocked clip is not an error worth surfacing. */ });
    } catch (_) { /* Keep the page silent rather than throw. */ }
  }

  var lastTick = 0;
  function tick(rate) {
    var now = performance.now();
    if (now - lastTick < 90) return;
    lastTick = now;
    clip(tickSound, rate);
  }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (_) { /* Storage is optional. */ }
    if (on) { startMusic(); }
    else { started = false; blocked = false; music.pause(); clearActivations(); }
    reflect();
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var turningOn = !enabled;
      setEnabled(turningOn);
      if (turningOn) clip(clickSound, 1);
    });
  });

  // Every click makes a sound, including a click on section text that opens or closes a section. Capture runs before
  // the control's own handler, so turning sound off still plays the click that turned it off.
  document.addEventListener("click", function () {
    if (!enabled) return;
    clip(clickSound, 1);
  }, true);

  document.addEventListener("pointerdown", function () {
    startMusic();
  }, true);

  document.addEventListener("pointerover", function (event) {
    if (!enabled || !finePointer) return;
    if (event.target.closest("a,button,summary,input,select,label")) tick(1.06);
  }, true);

  document.addEventListener("pointermove", function () {
    if (!enabled || !finePointer) return;
    tick(0.92 + Math.random() * 0.16);
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { music.pause(); started = false; }
    else startMusic();
  });

  reflect();
  if (enabled) {
    activations.forEach(function (name) {
      document.addEventListener(name, onActivation, true);
    });
    // First attempt happens here, with no gesture: returning visitors and allowlisted browsers start immediately.
    startMusic();
  }
})();
