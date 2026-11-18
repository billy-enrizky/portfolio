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
  var enabled = false;
  var started = false;

  try { enabled = localStorage.getItem(KEY) === "on"; } catch (_) { /* Storage is optional. */ }

  function reflect() {
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(enabled));
      button.textContent = enabled ? "Sound on" : "Sound off";
    });
  }

  function startMusic() {
    if (!enabled || started) return;
    started = true;
    var played = music.play();
    if (played && played.catch) played.catch(function () { started = false; });
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
    reflect();
    if (on) startMusic();
    else { started = false; music.pause(); }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var turningOn = !enabled;
      if (enabled) clip(clickSound, 1);
      setEnabled(turningOn);
      if (turningOn) clip(clickSound, 1);
    });
  });

  document.addEventListener("pointerdown", function (event) {
    if (!enabled) return;
    startMusic();
    if (event.target.closest(".sound-toggle")) return;
    if (event.target.closest("a,button,summary,input,select,label")) clip(clickSound, 1);
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
    var once = function () { startMusic(); document.removeEventListener("pointerdown", once, true); };
    document.addEventListener("pointerdown", once, true);
  }
})();
