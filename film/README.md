# The introduction film

The thirty-second film that opens the portfolio. It is built with Remotion from the source in this folder; the
finished encode lives at `../assets/intro-film.mp4` and the site plays it from `index.html`.

## What the film is

Follows one sentence through five acts: a request is typed, the work it asks for is built, the result is counted,
and the film closes on the name. `BRIEF.md` holds the brief the film answers, `TREATMENT.md` the direction, and
`CREDITS.md` the record of every sound and its licence.

## Build

```sh
npm install
npm run check          # types, lint, cue export, grid check
npm run render         # out/film.mp4 at 1920x1080, 30 fps, about two minutes
npm run qa             # probe, forensics, audio audit, contact sheet
```

`scripts/forensics.py` is the picture gate: it reads motion, seams, sharpness, banding, empty frames and sync
against the cues. `earshot` measures the finished audio. A render also needs Python with numpy, scipy, soundfile and
cv2 for motion blur and the sync checks; set `PYTHON` to an interpreter that imports them.

## Audio is not in this repository

The music and several effects are Mixkit files. The Mixkit licences allow them inside a finished film but not as
files of their own, so `public/audio`, `audio/kit/*.wav`, `audio/sfx` and `audio/music` stay out of the repository.
The soundtrack inside `../assets/intro-film.mp4` is the licensed end product.

To rebuild the audio locally, place the licenced files back under `audio/music` and `audio/sfx` as `CREDITS.md`
names them, then:

```sh
npm run kit     # render the kit takes (needs earshot)
npm run audio   # plan and score the soundtrack from out/cues.json
```

`audio/score.json` keeps the film's sound plan: the typing style, the kit roles and their levels over the bed.

## Assets and licences

`assets/licences.json` records every photograph, logo and icon with its source and licence; the photographs are
CC0. The typefaces in `public/fonts` are SIL Open Font License 1.1 with their OFL files. The brand marks under
`public/logos` are the property of their owners and appear as references to the tools the work used.
