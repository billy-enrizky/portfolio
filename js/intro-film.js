(function () {
  "use strict";

  // The page ships a poster and one play control instead of a video element, so nothing is fetched or decoded until a
  // visitor asks for the film, and playback never starts on its own.
  var stage = document.getElementById("film-stage");
  if (!stage) return;
  var play = stage.querySelector(".film-play");
  if (!play) return;
  var music = document.getElementById("ambient-music");
  var resume = false;

  function pauseBed() {
    if (!music || music.paused) return;
    resume = true;
    music.pause();
  }

  function returnBed() {
    if (!music || !resume) return;
    resume = false;
    var played = music.play();
    if (played && played.catch) played.catch(function () { /* The sound toggle or the browser can refuse; the page stays as it is. */ });
  }

  play.addEventListener("click", function (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    var poster = stage.querySelector(".film-poster");
    var video = document.createElement("video");
    video.id = "intro-film";
    video.controls = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("width", "1920");
    video.setAttribute("height", "1080");
    if (poster) video.poster = poster.getAttribute("src");
    video.src = play.getAttribute("href");
    video.addEventListener("play", pauseBed);
    video.addEventListener("pause", returnBed);
    video.addEventListener("ended", returnBed);
    stage.replaceChildren(video);
    var started = video.play();
    if (started && started.catch) started.catch(function () { /* Controls stay, so the visitor can start it. */ });
    video.focus();
  });
})();
