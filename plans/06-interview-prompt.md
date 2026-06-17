# 06 — Interview kick-off prompt

Paste this (or words to this effect) into a Cowork session in this project to start a story session. The `blockrocket-interview` skill picks it up and runs the whole loop.

---

> **Start the founder interview.** I'm [Andy / James / both]. Before you ask anything: check our LinkedIn for recent posts and load what's already been answered. Today I want to focus on [origin stories / what we're into now / a specific moment: ______]. One question at a time, push me for specifics, and capture my exact words. At the end: update the interview answers, create or update draft blog skeletons for anything with enough material, and refresh the plans, voice guides, and your memory of us.

---

## What happens automatically (per the skill)

1. **Pre-flight** — LinkedIn check (linkedin.com/in/andrewmgray, linkedin.com/in/jamesemorgan), load `plans/04-interview-questions.md` + story backlog + memory
2. **Interview** — 6–10 questions, conversational, verbatim capture, publishability checks
3. **Assets** — answers recorded, `skills/blockrocket-interview/references/story-moments.md` updated, blog skeletons created/updated in `content/blog/` with `draft: true`
4. **Always at the end** — voice guides, history docs, plans, and memory updated

## Draft → publish flow

Skeletons sit in `content/blog/` with `draft: true` (invisible on the site, safe to commit). When a post is ready: fill the `[NEEDS]` gaps, set `draft: false`, set the real `date`, run `node plans/lint-voice.js` then `npm run build`, push to main.

## Currently drafted

- `the-cryptopunk-zombie-we-turned-down.mdx` — needs the interview (era, work, reasoning, Erick's blessing)
- `x402-agents-paying-for-things.mdx` — facts verified June 2026; needs your hands-on take
