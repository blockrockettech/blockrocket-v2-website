---
name: blockrocket-interview
description: Run a founder interview session with Andy Gray and James Morgan to capture the BlockRocket origin story, turn the answers into draft blog skeletons, and keep the project's plans and voice guides up to date. Use this skill whenever Andy or James says "start the interview", "Q&A", "story session", mentions capturing company history, founder stories, anecdotes (e.g. the CryptoPunk zombie story), or asks to generate blog skeletons from past moments or current interests (x402, agent payments, frontier tech). Also use when asked to "update the plans/voice after our chat".
---

# BlockRocket Founder Interview

Interview Andy & James, get the story right, and turn every session into shippable assets: answered question banks, draft blog skeletons, and refreshed plans/memory. The interview is a conversation, not a form — one question at a time, chase the concrete detail (venue, date, price, name), and capture verbatim phrases because they ARE the voice.

Companion skill: `blockrocket-voice` (use it for all drafting). Repo context: `docs/company-history.md`, `docs/founders.md`, `plans/`.

## Phase 0 — Pre-flight (every session, before the first question)

1. **Check LinkedIn for fresh material.** Try `web_fetch` on:
   - https://www.linkedin.com/in/andrewmgray/recent-activity/all/
   - https://www.linkedin.com/in/jamesemorgan/recent-activity/all/
   LinkedIn usually auth-walls plain fetches. If blocked or empty, fall back to Claude in Chrome (`navigate` + `get_page_text`) where the user's logged-in session works. If neither works, just ask: "Posted anything on LinkedIn lately I should fold in?" Recent posts are pre-validated voice samples and may already answer open questions — note anything quotable.
2. **Load context.** Read `references/question-bank.md`, `references/story-moments.md`, `plans/04-interview-questions.md` (for already-answered questions — never re-ask), and the memory files on founders history and writing styles if available.
3. **Pick the session focus.** Ask which mode they fancy today: *origin stories* (the past), *forward interests* (what excites them now — x402, agents, whatever's current), or *a specific moment* from the story backlog.

## Phase 1 — The interview

- One question at a time, in chat. Follow the thread before moving on — a good follow-up ("what did the room smell like?", "how much was it worth that day?") beats the next scripted question.
- **Chase specifics relentlessly but kindly.** Every anecdote needs: when, where, who, the number if there is one, and how it felt. "2021ish in Discord" is fine; press once for better, then move on.
- **Capture verbatim.** When they phrase something well, save the exact words — flag it as a pullquote candidate.
- **Check publishability** on anything involving named third parties, money, or eBay-era events: "happy for this to go on the site?" Record the answer next to the material.
- **Both voices.** If only one founder is present, mark questions the other should answer and leave them open.
- 6–10 questions per session is plenty. Stop while it's still fun.

## Phase 2 — Turn answers into assets (same session)

1. **Record answers** in `plans/04-interview-questions.md` (append new Q&As; keep verbatim quotes quoted).
2. **Update the story backlog** — `references/story-moments.md`: mark moments as `captured`, add any new moments mentioned in passing (these are often the best ones).
3. **Create/update blog skeletons** for any moment or interest with enough material. Use `references/blog-skeleton-template.md` + the `blockrocket-voice` skill. Rules:
   - Save to `content/blog/<slug>.mdx` with **`draft: true`** — the build pipeline excludes drafts from listings and skips HTML generation, so drafts are safe to commit. Publishing = flip to `draft: false` (or delete the line) and rebuild.
   - Real facts and verbatim quotes go in; every gap gets `[NEEDS: specific question]` — never plausible filler.
   - Forward-looking topics (x402 etc.): verify current facts with a web search before writing; cite sources inline like James does.
4. Run `node plans/lint-voice.js content/blog/<new-file>.mdx` and fix flags.

## Phase 3 — Update plans & memory (ALWAYS, end of every session)

Never skip this — it's the compounding value of the system:

- **Voice guides:** if the session surfaced new phrases, verbal tics, or opinions, update `plans/05-voice-style-guide.md`, the `blockrocket-voice` skill references, and the writing-styles memory file.
- **History:** new verified facts → `docs/company-history.md` / `docs/founders.md` and the founders-history memory. Resolve flagged discrepancies (e.g. the $7.8M vs $40M GMV question) the moment a founder settles them.
- **Plans:** if answers change the homepage or story-page direction, update `plans/01`–`03` accordingly.
- **Memory index:** keep MEMORY.md pointers current.

Close the session by listing what was captured, what was created (with draft status), and the top 3 open questions for next time.

## Failure modes to avoid

- Interrogation pacing — ten questions fired at once. It kills the anecdotes.
- Polishing their words. A founder's comma splice is worth more than your perfect sentence.
- Inventing connective tissue between facts. `[NEEDS: …]` exists precisely so the skeleton can be honest about gaps.
- Skipping Phase 3 because the session ran long. Do an abbreviated pass rather than none.
