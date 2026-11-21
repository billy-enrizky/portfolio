# TREATMENT: Enrizky Brillian

**Spec:** `1920x1080@30, 40s, format: launch, audio: licensed track "Golem Dance" (Mixkit Stock Music Free License, 125.0 BPM, grid from 1.448 s) + launch kit, own ending` · **Engine:** Remotion · **Template:** launch-simple
**Name:** Enrizky Brillian · **Product:** a software engineer who builds AI and data systems that save teams time and money · **Viewer:** hiring managers, engineers and founders, muted in a feed first
**Assumptions:** the film speaks as the engineer's own introduction ("I build ..."), every number is read from the live portfolio page; the track's source and licence are recorded in `audio/music`. · **Supplied:** the portfolio's colours, fingerprint mark and Geist type

## 0. Direction
`<!-- deck.py --seed 736970839 --direction statement -->`
- **Direction:** `statement` (the line is the shot, the product answers it full frame) · **Palette and type:** the portfolio's own: paper `#F1F1F1`, ink `#101010`, accent `#1854B4`, Geist.
- **Idea sentence:** In this film, the $132.56 an AI model cost per million tokens becomes the $0.77 it costs after he rebuilt how it is served.
- **Competitor test:** with a generic "AI engineer" in the sentence it fails: nobody else's page holds this figure, 132.56 to 0.77 at N=512 on eight A100 GPUs.
- **Core action:** a request typed into a prompt box becomes a cost counter falling, shown literally in the first picture beat.

## 0b. Script
| # | Role | Line | Words | At |
|---|---|---|---|---|
| 1 | what it is | Enrizky Brillian is a software engineer. | 6 | 0.4 |
| 2 | does | He cut AI cost to $0.77. | 6 | 7.0 |
| 3 | does | He turned questions into answers. | 5 | 16.0 |
| 4 | does | He replaced 15 manual steps. | 5 | 24.0 |
| 5 | close | Enrizky Brillian saves teams time. | 5 | 33.0 |

Checks: `python3 scripts/copy-check.py TREATMENT.md` passes. Every figure is on the portfolio page: $0.77 per million tokens at N=512, 15+ manual steps replaced, 93% text-to-SQL accuracy.

## 1. Picks
| Slot | Pick | Why |
|---|---|---|
| Text voice | `build` (each word whole on its beat) | the references swap words in place; build keeps every word legible |
| Emphasis | colour on the key word, two lines | no box, no marker |
| Moves | `push`, `counter`, `scale-contrast` | the cost counter is the film's one number |
| Signature | the counter falls from $132.56 to $0.77 per million tokens and the field floods blue on the payoff beat | the proof in one frame |
| Ground family | `nearWhite`, one accent flood | the portfolio is light and blue |
| End card | `element`: the fingerprint assembles from its eight strokes | the page's own mark |

## 2. Beat plan
See `src/spine.ts`: four acts (asks, makes, fills, sends), 11 scenes, every change handed on.
