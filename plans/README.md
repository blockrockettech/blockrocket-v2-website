# BlockRocket v2 — Narrative Rewrite Plans

Working folder for the website narrative project (June 2026). Goal: retell the site as Andy & James's origin story — two engineers who've been curious about frontier tech since 2017 — so visitors instantly get the mission: **building innovative things with curious partners in frontier tech, including blockchain**.

The two Claude Code skills that power this workflow live in `skills/`:
- `skills/blockrocket-interview/` — structured founder interview sessions (`/blockrocket-interview`)
- `skills/blockrocket-voice/` — writing in Andy & James's voices (`/blockrocket-voice`)

## Decisions made (11 June 2026)

| Decision | Choice |
|---|---|
| Voice | First-person "we" — Andy & James narrating |
| Honesty level | Full arc, brief on the lows (eBay layoffs / KO wind-down get a line, not a chapter) |
| Phase 1 scope | Homepage copy + Story So Far page |
| Deferred | Existing blog rewrites, new origin-blog series, social calendar |
| Sourcing | Interview Andy in chat — real anecdotes only, nothing invented |
| Anti-AI-slop | Voice guide + `lint-voice.js` script + `blockrocket-voice` skill (no third-party "humanize" tools) |

## Files

1. `01-narrative-strategy.md` — the story spine, mission framing, message architecture
2. `02-homepage-rewrite-plan.md` — section-by-section plan for `content/pages/home.mdx`
3. `03-story-so-far-rewrite-plan.md` — restructure plan for `content/pages/story-so-far.mdx`
4. `04-interview-questions.md` — the anecdote questions for Andy & James (session log lives here)
5. `05-voice-style-guide.md` — how Andy and James actually write (from their Medium corpus)
6. `06-interview-prompt.md` — kick-off template for starting interview sessions
7. `lint-voice.js` — AI-tell linter; run `node plans/lint-voice.js` against `content/`

## Process

1. Andy/James answer interview questions (chat or directly in `04-interview-questions.md`)
2. Draft new `home.mdx` + `story-so-far.mdx` frontmatter using the `blockrocket-voice` skill
3. Run `node plans/lint-voice.js` — fix anything it flags
4. Founders read it aloud — if a sentence doesn't sound like something you'd say in the pub at Frontier Fridays, cut it
5. `npm run build`, review, ship

## Open fact to reconcile

The story page stats section claims **$40M GMV** at acquisition; `docs/company-history.md` says **~$7.8M trade volume**. Pick one (with source) before the rewrite ships.
