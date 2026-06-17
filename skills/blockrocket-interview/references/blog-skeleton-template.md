# Blog skeleton template

Skeletons live in `content/blog/<slug>.mdx` with `draft: true`. The build (`npm run build`) skips drafts entirely — no HTML, no listing — so they're safe to commit. To publish: set `draft: false` (or remove the line), confirm `date`, rebuild. Newest date becomes the featured post on /blog.

## Frontmatter (full schema in repo CLAUDE.md)

```yaml
---
draft: true
title: 'Human title — would they say it in the pub?'
excerpt: One-sentence hook; becomes meta description on publish.
date: 'YYYY-MM-DD'        # set to intended publish date when flipping draft off
thumbLabel: Story | Frontier | Case Study | Community
readTime: 'N min read'    # estimate at publish time
tags:
  - label: Primary Tag
    highlight: true
  - label: Secondary
coverImage: blog/<file>   # optional; add when asset exists
---
```

## Body structure for STORY pieces (past moments)

1. **Cold open on the moment** — drop the reader into the scene, no throat-clearing. Verbatim founder quote early if one exists.
2. **The context** — what BlockRocket/KO was at the time, one paragraph, numbers included.
3. **What happened** — the substance. `[NEEDS: …]` markers for every unverified detail.
4. **What it cost / what it taught** — honest accounting. Andy-style stat heading if there's a number ("## What a zombie punk is worth today: [NEEDS]").
5. **What still holds** — one paragraph max connecting to today's advisory work. No moral-of-the-story voice.
6. **Sign-off** — human, with links. "Get in touch!" register.

## Body structure for FRONTIER pieces (current interests)

1. **Thesis up top** — James register: state of the world in two sentences.
2. **What it actually is** — technical, linked, peer-level. Code if useful (JS).
3. **Why we're paying attention** — first-person, opinionated, hedged honestly.
4. **What we're doing about it** — experiments, [NEEDS: founder hands-on detail].
5. **The open questions** — "remains to be seen" energy.
6. **Sign-off + sources.**

## Rules

- Write through the `blockrocket-voice` skill; run `node plans/lint-voice.js` after.
- `[NEEDS: …]` must be a *specific askable question*, not "add detail here".
- Every external claim gets a link. Every internal claim gets checked against `docs/company-history.md`.
