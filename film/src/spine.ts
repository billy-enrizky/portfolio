// The film's script: one sentence played as acts. Enrizky takes a request, builds the system, proves it in numbers,
// shows what it runs on and ends on his own line. Every word and number is read from his portfolio page
// (billy-enrizky.github.io/portfolio): $132.56 to $0.19 per million tokens at N=512, 93% text-to-SQL accuracy in eight
// weeks, 73% fewer API calls, 15+ manual steps replaced, 1,400,883 rows published, 984 files in 24 weeks.
// The scenes are dealt from the house bank (src/scenes); a slot is redrawn only with its reason (`why`). The film keeps
// one light ground; scenes designed on a dark ground are painted onto it (src/palette.ts paletteOn).
import type { Act, Form, HandoverKind, Line, Scene, Spine } from './lib/spine';

/** A scene as this template plays it: a state of the element, the house scene that draws it and its content. */
export type FilmScene = Scene & { form: Form; name: string; subject?: string; bank?: string; why?: string; own?: boolean; seconds?: number; props?: Record<string, unknown>; beats?: number; ui?: string[]; via?: HandoverKind | 'cut' };
export type FilmAct = Omit<Act, 'scenes' | 'line'> & { scenes: FilmScene[]; line?: Line };
export type FilmSpine = Omit<Spine, 'acts'> & { acts: FilmAct[] };

export const SPINE: FilmSpine = {
  sentence: 'Enrizky takes a request, builds the system, proves it in numbers, shows what it runs on and signs it.',
  element: 'request',
  case: {
    request: 'Cut our AI cost per million tokens.',
    result: 'Cost per million tokens falls from $132.56 to $0.19.',
    who: 'Enrizky',
    names: ['Enrizky'],
    numbers: ['$132.56', '$0.19', '93%', '73%', '15+'],
  },
  acts: [
    {
      verb: 'asks',
      scenes: [
        { form: 'word', name: 'promise' },
        { form: 'button', name: 'ask', bank: 'macro-type', why: 'the request is typed into a giant message field, the film\'s first picture beat', via: 'part', ui: ['Cut our AI cost per million tokens.', 'Ask Enrizky to build it'] },
      ],
      line: { text: 'Enrizky Brillian is a *software* engineer.', becomes: 'pill' },
      strings: ['Cut our AI cost per million tokens.'],
      devices: [{ id: 'macro-type' }],
      world: 'enter',
    },
    {
      verb: 'builds',
      scenes: [
        { form: 'word', name: 'problem' },
        { form: 'page', name: 'result', bank: 'page-fly', why: 'the result is a document: the cost table, $132.56 to $0.19', ui: ['Cost per million tokens'] },
        { form: 'button', name: 'press', bank: 'decode-title', via: 'same-surface', why: 'the build ends on a deploy press', ui: ['$0.19/million tokens', 'Deploy'] },
      ],
      line: { text: 'A million tokens cost *$132.56*.', becomes: 'pill', place: 'alone' },
      strings: ['$132.56', '$0.19'],
      devices: [{ id: 'page-fly' }],
      world: 'closer',
    },
    {
      verb: 'counts',
      scenes: [
        {
          form: 'notice',
          name: 'figures',
          bank: 'toast-stack',
          why: 'five measured results arrive as notices, each with its own number, and a total counts the steps replaced; no person on screen',
          props: {
            items: [
              { title: 'Cost per million tokens', body: 'Down from $132.56 to $0.19', ago: 'now', glyph: 'trend' },
              { title: 'Text-to-SQL', body: '93% accuracy in eight weeks', ago: '1m ago', glyph: 'database' },
              { title: 'Cross-cloud agents', body: '73% fewer API calls', ago: '2m ago', glyph: 'cloud' },
              { title: 'Finance pipeline', body: '1,400,883 rows published', ago: '3m ago', glyph: 'chart' },
              { title: 'Browser automation', body: '15+ manual steps replaced', ago: '4m ago', glyph: 'bolt' },
            ],
            total: { from: 0, to: 15, suffix: '+', label: 'manual steps replaced' },
          },
        },
        { form: 'card', name: 'results', bank: 'phone-pullback', via: 'converge', why: 'his shipped systems arrive as cards in an app pulled back into view', props: { name: 'Enrizky Brillian', search: 'What did he ship?', tabs: ['Systems', 'Research'], nav: ['Home', 'Work', 'Papers', 'Contact'], menu: ['New request', 'Import'], cards: [{ who: 'Text-to-SQL', meta: 'now', title: '93% accuracy in eight weeks' }, { who: 'Cross-cloud agents', meta: '1m ago', title: '73% fewer API calls' }, { who: 'Browser automation', meta: '2m ago', title: '15+ manual steps replaced' }] } },
      ],
      strings: ['$0.19', '93%', '73%', '15+'],
      devices: [{ id: 'glass-counter' }],
      world: 'light',
    },
    {
      verb: 'connects',
      scenes: [
        {
          form: 'card',
          name: 'stack',
          bank: 'orbit-chips',
          why: 'the tools his systems run on arrive as official marks orbiting one line',
          props: { line: 'Runs on your stack', chips: [{ logo: 'microsoft-azure', label: 'Azure' }, { logo: 'google-cloud', label: 'Google Cloud' }, { logo: 'terraform', label: 'Terraform' }, { logo: 'docker', label: 'Docker' }, { logo: 'python', label: 'Python' }], exit: 'hold' },
        },
        {
          form: 'pill',
          name: 'ask-about',
          bank: 'iris-input',
          via: 'grow',
          why: 'the viewer asks about his work: a frosted input opens onto the cloud sea and its questions swap faster and faster',
          props: { plate: 'assets/clouds-a.jpg', headline: 'Ask about his work', placeholders: ['What did Enrizky ship?', 'How did cost fall to $0.19?', 'Who builds AI that saves time?'] },
        },
        {
          form: 'world',
          name: 'product',
          bank: 'cloud-dome',
          via: 'fly',
          why: 'his open source product, Context Atlas, standing in the dome above the cloud sea with the tools it runs on',
          props: { line: 'Open source, built to ship', accent: 'ship', screen: 'photos/context-atlas.png', icons: ['microsoft-azure', 'google-cloud', 'terraform', 'docker', 'python'], gl: 'fallback' },
        },
      ],
      strings: ['Open source'],
      devices: [{ id: 'logo-orbit' }],
      world: 'pull-back',
    },
    {
      verb: 'shows',
      scenes: [
        { form: 'word', name: 'claim', bank: 'ribbon-ring', via: 'converge', why: 'the claim on a white ring of paper fins: what he builds, then the cost it reached, one calm beat before the name', props: { first: 'He builds AI systems.', second: '$0.19/million tokens.', accent: '$0.19' } },
        { form: 'mark', name: 'lockup', bank: 'line-to-wordmark', why: 'one scene carries the claim and the lockup on the light ground: his tagline builds, splits, and his name is born in the gap', via: 'fly', props: { line: 'Software that saves teams time', name: 'Enrizky Brillian' } },
      ],
      strings: ['teams time'],
      devices: [{ id: 'carousel' }],
      world: 'hold',
    },
  ],
  end: { via: 'converge' },
};

/** The brief's own pictures, public/ paths: his product's screen only. No photograph of a person is used anywhere in this film. */
export const PICTURES: string[] = ['photos/context-atlas.png'];
/** Unused by the bank's timing (each act takes the whole bars its scenes need); kept for older readers. */
export const BARS: number | undefined = undefined;
/** The act shares in bars; unset, each act is as long as its scenes. */
export const ACT_BARS: number[] | undefined = undefined;
/** The one fact under the lockup. */
export const CLOSE = 'billy-enrizky.github.io/portfolio';
