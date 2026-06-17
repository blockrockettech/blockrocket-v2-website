# 05 — Voice & Style Guide

Derived from the real corpus: Andy's Medium (@awaygray — ERC721 Commission Conundrum, DAOSaka, ThunderEgg, Nifty Football) and James's (@james.morgan — EIP-2981 posts, KnownOrigin joins eBay, Crypto Landscape 2025). This is how they already write; the job is to sound like *them on a good day*, not like a brand.

## The two voices

**Andy** — the storyteller. Conversational, self-deprecating, parenthetical asides ("don't try and read this paragraph while drunk…"). Admits when things were hacky ("It felt hacky 😳, but, all the tests passed"). Headlines stats ("Total funds pledged: 881 DAI"). Verdicts in four words or fewer ("It worked. 😏"). British colloquialisms and puns (the-dogs-molochs). Emoji as punctuation.

**James** — the analyst. Thesis-driven, structured, bold-for-emphasis. Earnest about mission ("When we started KO in 2018 our mission was simple"). Owns opinions in first person singular ("I am bullish on…", "I would not bet against the casino though"). Hedges the future honestly ("remains to be seen").

**Shared DNA:** Manchester always named; community before commerce; write to peers, not prospects; show numbers; link generously; never over-polished — the odd comma splice survives.

## Live samples from interview sessions

Session 1 (12 Jun 2026, Andy) — these are the voice, verbatim:
- "In crypto these things happen and we was just happy to building cool things." (pullquote-grade; do not correct the grammar)
- "Big mistake I think cryptopunk zombies went to about x million at one point."
- Trait confirmed: Andy tells stories *people-first* — Erick was "a guy from Texas with similar ideas" before he was Snowfro. Lead with the person, reveal the fame later.
- Trait confirmed: understatement on wins ("That first contract still tracks the famous Chromie Squiggles!") — exclamation mark does the bragging, not adjectives.

## Website register

The site is "we" — blend the voices: Andy's warmth and concreteness, James's structure and conviction. Blogs can split into individual bylines later.

## Do

- Name real places, people, dates, numbers (with sources)
- One idea per sentence; vary sentence length naturally
- Admit limits and failures briefly, then move on
- End sections with something a human would say ("Get in touch!", "watch this space")
- UK spelling (tokenisation, organisations, colour)

## Don't (AI-tells — the lint script flags these)

- "isn't just X — it's Y" constructions
- Triads everywhere ("quiet, durable, everywhere")
- Fragment stacking for drama ("Ten years. One community. An exit.")
- Hype adjectives: battle-tested, world-class, cutting-edge, seamless, game-changing, revolutionary
- Empty intensifiers: genuinely, actually (when not contrasting), truly, deeply
- Consultant verbs: leverage, pressure-test, unlock, supercharge, empower
- "We don't do X, we do Y" humble-brags ("not innovation theatre, recycled decks…")
- Em-dash density > ~1 per paragraph
- Every paragraph the same length

## The two tests

1. **Pub test:** read the sentence aloud. Would Andy or James say it at Frontier Fridays? If not, rewrite or delete.
2. **Swap test:** could a competitor paste this sentence onto their site unchanged? If yes, it's positioning filler — replace it with a fact only BlockRocket can claim.

## Mechanical check

```bash
node plans/lint-voice.js            # lints content/**/*.{md,mdx}
node plans/lint-voice.js path/to/file.mdx
```
Zero warnings isn't the goal — zero *unjustified* warnings is.
