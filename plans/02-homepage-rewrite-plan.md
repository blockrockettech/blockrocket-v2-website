# 02 — Homepage Rewrite Plan (`content/pages/home.mdx`)

Layout stays (templates/index.njk untouched). This is a frontmatter-content rewrite only — same keys, new words. Run `npm run build` after editing.

## hero

| | Current | Direction |
|---|---|---|
| eyebrow | "Naturally curious about technology" | Keep the curiosity idea but make it theirs: e.g. "Curious since 2017" |
| heading | "Building at the frontier" | Fine, or sharpen to mission verb form: "We build things at the frontier" — first person from the first word |
| lead | "founder-led frontier technology consultancy…" | Replace category-speak with the spine: who they are, what they build, who with. One sentence about Andy & James, one about the mission. Name them in the hero — almost no consultancy dares. |
| cta | "Start a Conversation Today" | Too LinkedIn. Andy's Medium register: "Get in touch" / "Say hello" |

## about

Currently three paragraphs of positioning ("strategic advisory and engineering firm…"). Rewrite as compressed origin: met in Manchester's blockchain scene → started the meetup → built KO → eBay → back. 3 paragraphs max, first person, one concrete image per paragraph (basement, royalty standard, return). The existing `aboutHistory` block already half-does this — merge the best of both and stop saying the same thing twice on one page.

**Needs from interview:** how they actually met (Q1), why "BlockRocket" (Q4).

## aboutHistory

Repurpose as the *Manchester* block (eyebrow already "Made with love in Manchester"). Local texture: pubs where the meetup started, Frontier Fridays today. This is the community-roots paragraph, distinct from the company-arc paragraph above.

## approach

"Old school engineering, new school thinking" — keep, it's the best heading on the page. Rewrite the three step bodies to lose the brochure cadence ("No assumptions — just honest, experienced assessment") and gain specificity. Pattern per step: what we do + one real example in parentheses (e.g. Discovery: "sometimes the honest answer is you don't need a chain — we've said so", which they genuinely have, see the PoC-to-production post).

## services

Keep structure (4 cards). Rewrite `body` lines in their voice — currently fine but flavourless. Smallest job on the page; do last.

## team

- heading "This is not our first rodeo." — keep, sounds like them.
- Bios: currently CV-ish. Rewrite with personality split: Andy = community builder / "builds stuff with Blockchain" energy; James = standards engineer / "NFT nerd, crypto enthusiast, mostly found hacking web3" (his actual bio — use it nearly verbatim, it's already perfect).
- **Needs from interview:** one human detail each (Q8).

## caseStudies (updated after interview session 1)

Strong new candidate: **Art Blocks** — BlockRocket built the v1 smart contracts; the original contract still tracks Chromie Squiggles (founder-stated, verify scope/volume before publishing). Arguably a bigger proof point than anything currently on the page. Pair with the zombie-punk story post when it ships.

## blog / contact

- blog lead is good ("We write about the technology we use and the problems we solve") — keep.
- contact: keep heading, swap lead's "pressure-test the opportunity" consultant-speak for plain words. Email stays human@blockrocket.tech.

## SEO notes

- Hold the existing title/description until the new copy lands, then regenerate meta description from new about paragraph 1.
- Keep "frontier technology consultancy", "Web3", "Manchester", "blockchain consultancy" phrases present somewhere on the page (current ranking terms) — in body copy, not the hero.
- JSON-LD Organization schema already present; add `founder` entries for Andy + James (sameAs → LinkedIn/GitHub) when copy ships. Small build.js/head.njk task.
