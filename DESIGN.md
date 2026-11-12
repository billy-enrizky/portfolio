# DESIGN.md

## Direction

The Evidence Ledger. Every major element states a claim, proves a claim, or helps inspect the proof.

## Mode

Experience. The work leads. The interface recedes.

## Tokens

- Paper: `#F4F4EF`
- Surface: `#FBFBF7`
- Ink: `#111315`
- Steel: `#5D6568`
- Rule: `#D6D8D1`
- Accent: `#B83A1F`
- Dark paper: `#111315`
- Dark surface: `#181B1A`
- Dark text: `#F2F1EA`
- Dark accent: `#F08A67`

## Type

- Display and body: Satoshi Variable, weights 400, 500, 700.
- Technical metadata and metrics: JetBrains Mono, weights 400, 500.
- Display scale: `clamp(3.5rem, 7vw, 7rem)`, line-height `0.94`, tracking `-0.035em`.
- Body: `18px / 1.6`, maximum `64ch`.
- Mono: `12px` to `13px`, tabular numerals.

## Layout

- One-line top navigation, maximum 72px.
- Responsive grid, maximum width 1280px.
- Normal document flow. No fixed-height panels or internal page scrolling.
- Hairline rules organize content.
- One accent. Two-pixel corner radius. One neutral shadow.

## Motion

- One entrance: 12px rise plus opacity, 320ms to 460ms.
- One work-row preview interaction.
- Respect `prefers-reduced-motion`.
- No typewriter, marquee, scroll hijack, or perpetual animation.

## Components

- Work plate: one coherent project, its methods, outcome, and links. Finance data engineering is separate from model-serving infrastructure.
- Metric table: exact benchmark values with scope.
- Research entry: title, status, result, link.
- Experience ledger: every historical role, company, dates, and full achievements. No job-specific deletion of the career record.
- Capability matrix: independent skill areas, not a fabricated pipeline across unrelated projects.
- Project portfolio: all original projects retained as visible rows with their own summaries, evidence, and assets.
- Credentials: actual credential names and issuers, distinct from education and awards.
