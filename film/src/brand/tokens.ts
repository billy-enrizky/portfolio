// Brand tokens: the only place a colour, face or type size is written down. Acts import these;
// scripts/lint-film.mjs fails any hex colour that is not declared here.
//
// The brand's own palette and type, written by scripts/brand.py from brand/brand.json.
import type React from 'react';
import type { TypeFamily } from '../lib/look';
import { safeInsets } from '../lib/safe';
import { H, W } from '../timeline';

export const C = {
  ink: '#101010',         // type, marks, dark stages; cinetic:brand-supplied the kit colour ink
  ink2: '#1B1B1B',        // raised surfaces on ink; derived on the kit's greys (house recipe)
  paper: '#F1F1F1',       // the light stage; cinetic:brand-supplied the kit colour paper
  mist: '#E7E7E7',        // soft panels on paper; derived on the kit's greys (house recipe)
  line: '#CACACA',        // hairlines, >= 1.5 px on screen; derived on the kit's greys (house recipe)
  mute: '#595959',        // secondary text, >= 4.5:1 on paper; cinetic:brand-supplied the kit colour mute
  white: '#FFFFFF',       // pure white, only where a white world or a product surface needs it; house recipe
  accent: '#1854B4',      // the one accent; cinetic:brand-supplied the kit colour --accent
  slate: '#595959',       // the dark stage: a mid slate; cinetic:brand-supplied the kit colour mute
  slateRaised: '#484848', // raised surfaces on the slate; derived on the kit's greys (house recipe)
  accentLift: '#98BFFE',  // the accent lifted to L .80 for the slate stage (the accent itself when it holds 3:1 there); cinetic:brand-supplied derived from the kit colour --accent (lifted for the slate)
};

/**
 * Mask black: the zero of a luminance mask, a multiply or a screen-blend base, and a contact shade at an alpha.
 * Never a surface, a ground or ink (ink is C.ink, tinted). It stays black whatever the brand: fx/ reads it.
 */
export const MASK = '#000000';

// type pair: expressive (Expressive display): voice Bricolage Grotesque Variable, text Inter Variable, mono Geist Mono Variable; scripts/type-deal.ts
/**
 * FONT.text is the film's voice (every statement, the claim, the wordmark: typeStyle's line, display, hero and giant
 * roles and every act that sets FONT.text); FONT.ui is the pairing's text face (product UI in the kit, captions, the
 * tagline: typeStyle's ui and caption roles); a single-family film gives both the same stack (fx/TypePairs).
 */
export const FONT = {
  text: '"Geist Variable", system-ui, sans-serif', // the film's voice; typeStyle and measure.ts read it
  ui: '"Inter Variable", system-ui, sans-serif', // the text face: kit UI, captions (fx/TypePairs)
  mono: '"Geist Mono Variable", ui-monospace, monospace',
};

/** Faces the FontGate waits for before anything renders or measures (one entry per weight in use). */
export const FACES = ['620 16px "Geist Variable"', '660 16px "Geist Variable"', '680 16px "Geist Variable"', '700 16px "Geist Variable"', '500 16px "Inter Variable"', '600 16px "Inter Variable"', '400 16px "Geist Mono Variable"'];

/** Layout unit: 1 at 1080p, scales every size with the short side of the frame (16:9, 9:16, 1:1). */
export const U = Math.min(W, H) / 1080;

/**
 * The film's type family, the director's pick (lib/look.ts TYPE_LOOK, references/copy-and-type.md §7): 'calm', the
 * default (small airy sentence lines at the face's own letter fit), or 'bold' (big, semibold, tight lines). TYPE below holds that family's numbers, written out because the scripts read them
 * (lint-film, add-font, brand.py): switch with node scripts/type-family.mjs bold (new-film.sh --type, or a template's
 * type_family, runs it), which writes TYPE_FAMILY, the six roles and the FACES weights; never paste them by hand.
 */
export const TYPE_FAMILY: TypeFamily = 'bold';

// One token per role, reused everywhere, so nothing is "almost matched" (size in px at 1080p; the cap height is about
// 0.727 em in Inter, given below as a share of the frame height). Film sizes, the house numbers: a sentence line
// is 84 px (cap 5.7 %), a statement 160, and the one giant word of a film (400 px and up) is the set the camera
// travels, never a faint watermark behind the copy. Tracking is the letter fit measured in this face (Inter at its
// display cut): another face adds its offsets from scripts/faces.json, or font-match.mjs fits it to a target frame.
export const TYPE = {
  ui: { size: 40, weight: 500, track: 0.01, lead: 1.3 }, // product strings, labels: cap 2.7 % FH, the smallest size held in focus (TEXT_MIN)
  caption: { size: 46, weight: 500, track: 0.008, lead: 1.25 }, // descriptor lines, URLs, the end card's tagline: cap 3.1 %
  line: { size: 120, weight: 620, track: -0.0375, lead: 1.03 }, // the sentence line, chains (fx/Chain) and build lines: cap 8.1 %
  display: { size: 200, weight: 660, track: -0.0444, lead: 0.98 }, // short statements and the end card's name: cap 13.5 %
  hero: { size: 240, weight: 680, track: -0.0464, lead: 0.93 }, // the payoff word: cap 16.2 %
  giant: { size: 900, weight: 700, track: -0.052, lead: 0.88 }, // the set: one word at 400 px or more (cap 60.6 %, up to 90 % cropped), once per film
  secondary: { size: 48, weight: 450, track: -0.02, lead: 1.15 }, // 1.1 role, kept for old acts: use caption
};

/** The smallest text held in focus for more than 6 frames at 60 fps (px at 1080p): anything smaller is mush on a phone. */
export const TEXT_MIN = 36;
/** The giant role starts here (px at 1080p): below it a big word is a hero, not the set. */
export const GIANT_MIN = 400;
/**
 * Product UI is rebuilt for film, not screenshotted at page size: every size of the web design times
 * 1.8-2 (house 1.9), never under TEXT_MIN. A 16 px label becomes 36, a 20 px body 38, a 32 px figure 61.
 */
export const UI_FILM = 1.9;
/** A web UI size (px) rebuilt for film: x UI_FILM, floored at TEXT_MIN for text. */
export const uiFilm = (webPx: number, text = true) => (text ? Math.max(TEXT_MIN, webPx * UI_FILM) : webPx * UI_FILM);

/** Type roles that replace a 1.1 role. */
export const TYPE_DEPRECATED: Partial<Record<keyof typeof TYPE, keyof typeof TYPE>> = { secondary: 'caption' };

/**
 * CSS for a type role at a size (px): the voice (FONT.text) for statements, the text face (FONT.ui) for ui and
 * caption. Tabular lining figures always, so numbers never jitter in width; kerning and contextual forms on.
 */
export const typeStyle = (role: keyof typeof TYPE, size = TYPE[role].size * U): React.CSSProperties => ({
  fontFamily: role === 'ui' || role === 'caption' || role === 'secondary' ? FONT.ui ?? FONT.text : FONT.text,
  fontSize: size,
  fontWeight: TYPE[role].weight,
  letterSpacing: `${TYPE[role].track}em`,
  lineHeight: TYPE[role].lead,
  fontVariantNumeric: 'tabular-nums lining-nums',
  fontKerning: 'normal',
  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
  fontSynthesis: 'none',
  whiteSpace: 'pre',
});

/**
 * Safe margins for a w x h frame as a symmetric envelope: the larger inset of each pair from the
 * frame's safe-zone preset (src/lib/safe.ts), so a centred layout that fits inside clears every
 * side. 96 x 64 px at 1920x1080; 120 x 420 at 1080x1920, where the feed zones are asymmetric
 * (use safeBox() from lib/safe.ts there to centre on the clear band instead of the frame).
 */
export const safeArea = (w: number, h: number) => {
  const i = safeInsets(undefined, w, h);
  return { x: Math.max(i.left, i.right), y: Math.max(i.top, i.bottom) };
};
/** The film's safe margins; text stays inside them (scripts/layout-audit.sh checks). */
export const SAFE = safeArea(W, H);
