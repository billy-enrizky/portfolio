// The sound of a launch played as a spine, computed from the timeline: scripts/export-cues.ts calls the default export
// and writes out/cues.json; scripts/audio/score.py voices each event with the film's kit on its exact frame over the
// licensed track (npm run sound). The track carries the film; the effects are cut to the picture by the reference
// grammar: a contact sounds on the contact, a word's sound lands once the line is whole, a whoosh starts 4 f before its
// cut and peaks 3 f after it, a swell rides a handover into its cut, a riser ends on its hit, nothing sounds on a start.
// One strong sound per gesture; micro-sounds (keys, ticks) come in cascades, quiet. Every handover sounds by its kind,
// the world's turn takes the sub drop (the film's colour event), the lockup ONE clean hit.
import { HANDOVERS } from './lib/spine';
import { ACT, b, BARS, type Declares, f60, FPS, HANDOVER_PLAN, LINES, type Salience, SCENES, type Seam, SPINE_PLAN, TOTAL } from './timeline';
import { ctxOf, defOf, specs } from './acts/stage';
import { handoverDeclares } from './lib/handover';
import { keyFrames } from './kit/screens/typing';
import { SPINE } from './spine';
import { stepsFromPlan, worldStepDeclares } from './fx/world/Step';

/** The sound action each of a scene's own cues voices (scripts/audio/actions.py): cue labels, never copy on screen. */
// lint-ok: sound action names (kinds to actions), never copy on screen
export const SCENE_ACTION: Record<string, string> = { tick: 'detent', tock: 'detent', key: 'type', click: 'press', whoosh: 'swipe', pop: 'appear', land: 'card-land', hit: 'reveal', swell: 'swell', riser: 'build', drop: 'thud', snap: 'lock', bell: 'chime', suck: 'shape', text: 'text' };

export type Kind = 'tick' | 'tock' | 'hit' | 'land' | 'pop' | 'whoosh' | 'riser' | 'drop' | 'key' | 'click' | 'snap' | 'swell' | 'bell' | 'suck' | 'text';
export type SoundEvent = {
  f: number;
  kind: Kind;
  weight?: number;
  pan?: number;
  pitch?: number | string;
  apexFrac?: number;
  dur?: number;
  variant?: string;
  action?: string; // what the picture does (scripts/audio/actions.py): kit.py cast voices each action with its own sound
  id?: string;
  structural?: true;
  force?: true;
  offset_ms?: number;
  salience?: Salience;
};

const actOf = (f: number) => Object.entries(ACT).find(([, a]) => f >= a.from && f < a.from + a.dur)?.[0] ?? 'tail';
const film = { fps: FPS };

/** What the picture declares on purpose: each drawn handover's box track (forensics --spine follows the element in it), the world's steps. */
export const declares = (): (Declares & { id?: string })[] => {
  const out: (Declares & { id?: string })[] = [];
  specs().forEach((s, i) => {
    if (!s) return;
    try {
      out.push({ id: `handover-${i + 1}`, ...handoverDeclares(s, film) });
    } catch {
      /* a scene whose boxes need the browser: its seam is still declared by the timeline */
    }
  });
  out.push({ id: 'world-steps', ...worldStepDeclares(stepsFromPlan(SPINE_PLAN), film), colour: [] });
  // the house scenes' own designed cuts (a poster jumping in, a colour flip): hard seams, never an undeclared swap
  const cuts: Seam[] = SCENES.flatMap((s) => (defOf(s.i).cuts?.() ?? []).map((f) => ({ at: s.from + f, kind: 'hard' as const, id: `scene-cut:${s.name}:${f}` }))).filter((x) => x.at < TOTAL);
  if (cuts.length) out.push({ id: 'scene-cuts', seams: cuts });
  return out;
};

export default function cues(): SoundEvent[] {
  const ev: SoundEvent[] = [];
  // each line once it is whole (one soft text sound); the product's own words sound through their scene
  for (const l of LINES) if (l.place !== 'inside') ev.push({ f: l.resolved + f60(4), kind: 'text', weight: l.claim ? 0.7 : 0.55, pan: 0, action: 'text', id: `${l.id}-whole` });
  // each scene's own moments (keys, the press, sections landing, notices, the count's ticks)
  SCENES.forEach((s) => {
    const d = defOf(s.i);
    if (!d.moments) return;
    const c = ctxOf(s.i, s.from);
    for (const m of d.moments({ dur: c.dur, fps: FPS, land: c.land, leadAt: c.leadAt, i: s.i, prev: c.prev })) {
      const f = s.from + m.f;
      if (f >= s.from && f < Math.min(TOTAL, s.to + f60(20))) ev.push({ f, kind: m.kind, weight: m.weight, pan: m.pan ?? 0, action: m.action, id: `s${s.i + 1}-${m.id}`, ...(m.dur ? { dur: m.dur } : {}), ...(m.apexFrac !== undefined ? { apexFrac: m.apexFrac } : {}) });
    }
  });
  // the typed request: one key per character on the frame it lands (the scene's own text, rate and seed), so the typing
  // plan shapes a real run; the scene itself declares a single key. The field click and the send click are the product's
  // two contacts: forced, so restraint never quiets them.
  const typing = SCENES.find((s) => s.name === 'ask');
  const typed = SPINE.acts.flatMap((a) => a.scenes).find((sc) => sc.bank === 'macro-type')?.ui?.[0];
  if (typing && typed) {
    const cps = Math.min(40, Math.max(24, typed.length / 1.05));
    const start = typing.from + 37; // MACRO_TYPE.type: 37 film frames after the scene starts (the scene doubles it for its 60 fps typing clock)
    keyFrames(typed, 60, cps, typed).forEach((k, n) => {
      const f = Math.round(start + k / 2);
      // the first key is forced: restraint keeps a whole action when any of its events is forced, so the typing run stays
      if (typed[n] !== ' ' && f < typing.to) ev.push({ f, kind: 'key', weight: 0.5, pan: 0, action: 'type', id: `type-${n}`, ...(n === 0 ? { force: true } : {}) });
    });
    // the field click lands on the track's quiet intro (bed near -42 LUFS), so the bed-relative level leaves it tiny: weight 1.5
    // lifts it by 5.5 dB; the send click lands on the groove and keeps its own weight
    for (const e of ev) if (e.kind === 'click' && e.f >= typing.from && e.f < typing.to) { e.force = true; if ((e.id ?? '').endsWith('-field')) e.weight = 1.5; }
  }
  // every handover by its kind, on the cut's own grammar
  for (const h of HANDOVER_PLAN) {
    if (h.kind === 'cut' || h.kind === 'entry') continue;
    const lead = h.at - h.span[0];
    const land = h.span[1] - h.at;
    const id = `${HANDOVERS[h.kind].id}-${h.kind}-${h.forms.join('-')}`;
    if (h.kind === 'fly' || h.kind === 'momentum') {
      ev.push({ f: h.at - f60(8), kind: 'whoosh', weight: 0.55, pan: h.dir === 'left' ? -0.3 : 0.3, dur: f60(30), apexFrac: 0.38, action: 'whip', id });
      ev.push({ f: h.span[1], kind: 'land', weight: 0.5, pan: 0, action: 'card-land', id: `${id}-lands` });
    } else if (h.kind === 'converge' || h.kind === 'shrink') {
      ev.push({ f: Math.max(0, h.span[0]), kind: 'suck', weight: 0.5, pan: 0, dur: lead + f60(4), apexFrac: 0.85, action: 'shape', id });
      ev.push({ f: h.at + f60(4), kind: 'pop', weight: 0.6, pan: 0, action: 'shape', id: `${id}-spark` });
    } else if (h.kind === 'swell' || h.kind === 'grow' || h.kind === 'press-open' || h.kind === 'iris') {
      ev.push({ f: Math.max(0, h.span[0]), kind: 'swell', weight: h.kind === 'grow' ? 0.5 : 0.42, pan: 0, dur: lead + land, apexFrac: lead / Math.max(1, lead + land), action: 'shape', id });
      if (h.kind === 'grow') ev.push({ f: h.span[1], kind: 'land', weight: 0.45, pan: 0, action: 'card-land', id: `${id}-lands` });
    } else if (h.kind === 'zoom-into' || h.kind === 'pull-out') {
      ev.push({ f: Math.max(0, h.span[0]), kind: 'whoosh', weight: 0.5, pan: 0, dur: lead + land, apexFrac: lead / Math.max(1, lead + land), action: 'swipe', id });
    }
  }
  // the world's turn (the film's biggest change): a sub drop as the flood leaves the element, at weight 1 so the music
  // steps down for a breath before it (plan.py stop-downs) and the turn lands clear
  const turn = SPINE_PLAN.world.find((w) => w.step === 'turn');
  if (turn) ev.push({ f: turn.at, kind: 'drop', weight: 1, pan: 0, action: 'thud', id: 'the-world-turns' });
  // the lockup: ONE clean hit, on the beat after the name is readable. The scene's own LOCKUP_AT (f527) sits 1.5 beats after
  // the track's downbeat and before the name shows (it resolves at f545), so the hit would sound over the tagline; it goes to
  // the beat that follows the name (beat 4 of the last bar), one beat before the track's own ring-out hit.
  const lockHit = b(BARS, 3);
  ev.push({ f: lockHit, kind: 'hit', weight: 2, pan: 0, action: 'logo-lock', id: 'lockup' });

  // one strong sound per gesture: a quiet event inside 2 f of a stronger one of the same kind goes
  ev.sort((a, b) => a.f - b.f || (b.weight ?? 0) - (a.weight ?? 0));
  const kept: SoundEvent[] = [];
  for (const e of ev) {
    if (!(e.f >= 0 && e.f < TOTAL)) continue;
    // the reveal resolves on ONE clean element: nothing else sounds within 5 f of the lockup hit
    if (e.id !== 'lockup' && Math.abs(e.f - lockHit) <= 5) continue;
    // the phone pull-back and the dome (about 10.6 to 16 s) sit on the track's loudest bars: the music carries them, and only
    // the dome's one cloud-rush whoosh and the product's own tap sound (a thud or a second whoosh there read as an explosion)
    const inScene = (name: string) => SCENES.some((s) => s.name === name && e.f >= s.from && e.f < s.to);
    // the dome keeps its one cloud-rush whoosh and the diorama's landing (a soft land, not a thud); its tilt riser, glass swell
    // and push-cut whoosh stay out
    if (inScene('product') && !['cloud-rush', 'diorama'].some((id) => (e.id ?? '').endsWith(id))) continue;
    if (inScene('results') && ['land', 'whoosh', 'swell', 'riser'].includes(e.kind)) continue;
    // the product's visible animations keep their sound whatever the density: restraint thins whole actions, and a forced event
    // keeps its action (the five achievement toasts arriving, the rows writing onto the page, the tagline's words, the phone's row)
    if (/toast-stack-(first|arrive)|page-fly-rows|phone-pullback-row|line-to-wordmark-word|line-to-wordmark-tag|cloud-dome-diorama/.test(e.id ?? '')) e.force = true;
    // the tagline's split whoosh lands on the track's loud entry (2 dB under it: inaudible), and the hit that follows carries the name
    if ((e.id ?? '').endsWith('line-to-wordmark-split')) continue;
    // the scene's own wordmark swell sits on the old lockup frame (f527) and would play the kit's trailer-style swell under the tagline
    if ((e.id ?? '').endsWith('line-to-wordmark-wordmark')) continue;
    if (kept.some((k) => k.kind === e.kind && e.kind !== 'key' && Math.abs(k.f - e.f) < 2)) continue;
    // one sound per visual beat: a weaker effect of another kind inside 4 f of a stronger body sound (a land, a hit) goes,
    // so a thud and a whoosh never sound as one blast. Ticks, keys and text are small UI sounds and stay.
    if (['swell', 'whoosh', 'suck', 'riser', 'pop'].includes(e.kind) && kept.some((k) => ['land', 'hit', 'click', 'whoosh'].includes(k.kind) && k.kind !== e.kind && Math.abs(k.f - e.f) <= 4 && (k.weight ?? 0) >= (e.weight ?? 0))) continue;
    // no two whooshes or swells closer than 0.5 s: a pass is one gesture, the second would be a hiss on top of it
    if (['whoosh', 'swell', 'suck'].includes(e.kind) && kept.some((k) => ['whoosh', 'swell', 'suck'].includes(k.kind) && e.f >= k.f && e.f - k.f < FPS / 2)) continue;
    kept.push({ ...e, id: `${actOf(e.f)}:${e.id}` });
  }
  return kept;
}
