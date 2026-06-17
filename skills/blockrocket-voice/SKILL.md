---
name: blockrocket-voice
description: Write in the authentic voices of Andy Gray and James Morgan (BlockRocket founders) for website copy, blog posts, LinkedIn posts, and X/Twitter content. Use this skill whenever writing or editing ANY content for BlockRocket, blockrocket.tech, KnownOrigin retrospectives, Blockchain Manchester, Frontier Fridays, or anything published under Andy's or James's name — including marketing copy, case studies, announcements, social posts, and bios. Also use when asked to "humanize", de-AI, or punch up existing BlockRocket content.
---

# BlockRocket Voice

Write as Andy Gray and James Morgan actually write — based on their published Medium corpus (2019–2025), not a generic "friendly tech founder" voice. The goal is copy that passes two tests:

1. **Pub test** — would they say this sentence out loud at Frontier Fridays? If not, rewrite it.
2. **Swap test** — could a competitor paste this sentence onto their site unchanged? If yes, it's filler; replace it with a fact only BlockRocket can claim.

## Picking the voice

- **Website copy / joint announcements** → blended "we" voice: Andy's warmth + James's structure
- **Byline content by Andy** → read `references/andy-voice.md` first
- **Byline content by James** → read `references/james-voice.md` first
- **Channel formats** (blog vs LinkedIn vs X) → read `references/channels.md`

## The shared DNA (always applies)

- **Manchester is named, not implied.** They sign off "Made with love in Manchester" energy. Place names, venue names, real dates.
- **Community before commerce.** They built a meetup before a company. Default framing: "come build with us", never "engage our services".
- **Write to peers, not prospects.** Assume the reader is smart and curious. No explaining what blockchain is unless the piece is explicitly educational.
- **Show numbers, cite sources.** "Total funds pledged: 881 DAI" as a heading is their actual style. Every claim a journalist could check should be checkable.
- **Honest about mess.** "It felt hacky 😳, but, all the tests passed" — they admit friction and move on. One line for failures, no wallowing, no spin.
- **UK English.** Tokenisation, organisations, colour, whilst (sparingly).
- **Slightly imperfect is correct.** A comma splice or a casual fragment is part of the texture. Do not polish to corporate smoothness — but never fake typos either.

## Facts discipline

Never invent anecdotes, quotes, numbers, or client details. If the piece needs a story detail you don't have (a venue, a date, a first-sale price), insert `[NEEDS: question for Andy/James]` rather than plausible filler. Verified history lives in the site repo at `docs/company-history.md` and `docs/founders.md` — check claims against it. Known trap: KO trade volume at acquisition is documented as ~$7.8M in the history doc but $40M GMV appears elsewhere on the site; flag rather than choose.

## Banned (the AI-tells)

These patterns mark text as machine-written. Avoid them; if editing existing copy, remove them:

- "isn't just X — it's Y" / "not just X, but Y" constructions
- Adjective triads for rhythm ("quiet, durable, everywhere")
- Fragment stacking for drama ("Ten years. One community. An exit.")
- Hype adjectives: battle-tested, world-class, cutting-edge, seamless, game-changing, revolutionary, transformative
- Consultant verbs: leverage, pressure-test, unlock (value/potential), supercharge, empower, synergise
- Empty intensifiers: genuinely, truly, deeply, actually (when not contrasting)
- AI openers: "In today's rapidly evolving landscape…", "delve"
- Humble-brag negations: "not innovation theatre, recycled decks, or second-hand conviction"
- More than ~1 em-dash per paragraph
- Uniform paragraph lengths; every section ending on an inspirational beat

If the site repo is available, run `node plans/lint-voice.js <file>` to check drafts mechanically.

## Workflow

1. Identify author (Andy / James / blended-we) and channel; read the matching reference files.
2. Gather the facts first — from the repo docs, interview answers, or published posts. List any gaps as `[NEEDS: …]`.
3. Draft. Lead with the concrete (a place, a number, a moment), not the positioning.
4. Self-edit pass: apply the banned list, then the pub test on every sentence, then the swap test on every paragraph.
5. End like a human: "Get in touch!", "watch this space 🚀", a question — never a slogan.
