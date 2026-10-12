# BlockRocket v2 Website

Marketing and blog site for [BlockRocket](https://blockrocket.tech) — a founder-led frontier technology consultancy based in Manchester, UK. Co-founded by Andy Gray and James Morgan (KnownOrigin → eBay acquisition, 2022).

Built as a static site from a Webflow export. CSS/JS from the Webflow export is retained as-is; content, routing, and all CMS logic has been replaced with a Node.js build pipeline using gray-matter + Nunjucks.

## Stack

| Layer | Tool |
|---|---|
| Templating | [Nunjucks](https://mozilla.github.io/nunjucks/) |
| Content | Markdown files with YAML frontmatter ([gray-matter](https://github.com/jonschlinkert/gray-matter)) |
| Markdown → HTML | [marked](https://marked.js.org/) |
| Dev server | [lite-server](https://github.com/johnpapa/lite-server) (browser-sync) |
| File watching | [chokidar](https://github.com/paulmillr/chokidar) |
| Production server | `server.js` — zero-dependency Node server for `dist/` |
| Hosting | [Coolify](https://coolify.io) on [Hetzner](https://www.hetzner.com) |

## Getting started

```bash
npm install
npm run dev       # build + watch + live reload on http://localhost:3000
```

Or for a one-off build:

```bash
npm run build     # outputs to dist/
npm start         # serve dist/ with the production server on http://localhost:3000
```

## Current site shape

- Homepage content is driven from `content/pages/home.mdx`
- Company story page content is driven from `content/pages/story-so-far.mdx`
- Blog posts live in `content/blog/`
- Homepage contact form submits to Formspree using the CDN version of `@formspree/ajax`
- Vendor Webflow assets stay in place; local CSS fixes belong in `public/css/overrides.css`

## Project structure

```
blockrocket-v2-website/
├── content/
│   ├── blog/             ← blog posts as .md / .mdx files
│   └── pages/            ← structured homepage / story page content
├── templates/
│   ├── _partials/
│   │   ├── head.njk      ← <head> with SEO meta tags
│   │   ├── nav.njk       ← site navigation
│   │   ├── footer.njk    ← site footer
│   │   └── scripts.njk   ← JS includes + AOS init
│   ├── index.njk         ← landing page + Formspree contact form
│   ├── blog.njk          ← blog listing (/blog/index.html)
│   ├── post.njk          ← individual blog post
│   └── story-so-far.njk  ← company story page
├── public/               ← static assets copied verbatim to dist/
│   ├── css/
│   │   ├── normalize.css
│   │   ├── base.css      ← Webflow base styles
│   │   ├── blockrocket.css ← site-specific styles
│   │   └── overrides.css ← safe non-vendor overrides
│   ├── js/
│   │   └── site.js       ← interaction runtime (from Webflow export)
│   └── images/
├── scripts/
│   ├── build.js          ← main build pipeline
│   └── watch.js          ← chokidar watcher for dev
├── dist/                 ← generated output (gitignored)
├── .env                  ← local env vars (optional, gitignored)
├── bs-config.js          ← lite-server config (dev only)
└── server.js             ← production server: static files, clean URLs, /api/health
```

## Writing blog posts

Create a new `.md` file in `content/blog/`. The filename becomes the URL slug.

```
content/blog/my-new-post.md  →  /blog/my-new-post.html
```

### Frontmatter schema

```yaml
---
title: "Post Title"
excerpt: One or two sentences used on cards and in meta descriptions.
date: "2024-06-01"          # ISO format — used for sorting and display
thumbLabel: Consultancy      # eyebrow label on blog cards
readTime: 5 min read
tags:
  - label: Services
    highlight: true          # highlight: true renders the tag with emphasis
  - label: Smart Contracts
  - label: Product
coverImage: my-image.avif    # optional — filename relative to public/images/
---

Body content in Markdown here...
```

All `##` headings in the body are automatically extracted and wired to the "Jump To" sidebar on the post page.

### Date-prefixed filenames

Filenames like `2024-06-01-my-post.md` are supported — the date prefix is stripped from the slug automatically.

## Updating page copy

- Homepage: `content/pages/home.mdx`
- Story page: `content/pages/story-so-far.mdx`
- Layout / section order: `templates/index.njk`
- Footer copy: `templates/_partials/footer.njk`

The homepage is frontmatter-driven, so most copy changes should go through `home.mdx` rather than the template.

## Contact form

The homepage contact form lives in `templates/index.njk` and posts to:

`https://formspree.io/f/mbdbjzqz`

It uses the CDN build of `@formspree/ajax` for vanilla JS submission state, while still keeping a normal HTML `action`/`POST` fallback. Success and field-error styling is handled in `public/css/overrides.css`.

## Environment variables

Create `.env` if you need local overrides:

| Variable | Description | Example |
|---|---|---|
| `SITE_URL` | Canonical base URL (no trailing slash) | `https://blockrocket.tech` |
| `SITE_NAME` | Site name used in meta | `BlockRocket` |
| `GA_TRACKING_ID` | Google Analytics ID (optional) | `G-XXXXXXXXXX` |

Set these same variables in the Coolify application's environment variables for production. They're read at build time, so redeploy after changing them. `PORT` (default `3000`) controls the port `server.js` listens on.

## Deployment

The site runs on [Coolify](https://coolify.io) on a Hetzner server and redeploys on push to `main`. Configure the Coolify application as a Node app (Nixpacks), not a static site, so `server.js` runs:

- **Build command:** `npm run build`
- **Start command:** `npm start` (`node server.js`)
- **Port:** `3000`
- **Health check path:** `/api/health`

`server.js` serves `dist/`, resolves clean URLs (`/blog/my-post` → `dist/blog/my-post.html`), and returns 404 for anything else.

### Health check

`GET /api/health` returns:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "commit": "dcaa792…",
  "uptime": 3600,
  "startedAt": "2026-10-12T10:00:00.000Z",
  "timestamp": "2026-10-12T11:00:00.000Z"
}
```

It returns `200` when `dist/index.html` exists and `503` if the build output is missing. `commit` comes from Coolify's `SOURCE_COMMIT` env var (`null` locally).

## URLs

| Route | File |
|---|---|
| `/` | `dist/index.html` |
| `/blog/` or `/blog` | `dist/blog/index.html` |
| `/blog/:slug` | `dist/blog/:slug.html` |
| `/story-so-far` | `dist/story-so-far.html` |
| `/api/health` | health check JSON (from `server.js`) |

## Content workflow

Blog posts and page copy are produced using two Claude Code skills:

| Skill | Invoke | Purpose |
|---|---|---|
| `blockrocket-voice` | `/blockrocket-voice` | Write/edit in Andy & James's authentic voices (website, blog, LinkedIn, X) |
| `blockrocket-interview` | `/blockrocket-interview` | Run a structured founder interview; captures answers and generates draft blog skeletons |

Draft blog skeletons are saved to `content/blog/` with `draft: true` in frontmatter — the build pipeline excludes them from listings until `draft` is removed or set to `false`.

Run the voice linter after drafting to catch AI-tells:
```bash
node plans/lint-voice.js content/blog/<file>.mdx
```

Narrative strategy, interview Q&A log, and voice style guide live in `plans/` — see `plans/README.md`.

## Company context

**BlockRocket** was founded in 2018 by **Andy Gray** and **James Morgan**, emerging from the Manchester blockchain community they helped build. The duo co-created **Blockchain Manchester** and launched **KnownOrigin** — one of Ethereum's earliest digital art platforms — which was acquired by **eBay in 2022**.

BlockRocket now operates as a founder-led frontier technology consultancy serving enterprises, startups, and founders navigating decentralised systems, applied AI, and emerging infrastructure. Services include strategy, production-grade Web3 engineering, applied AI systems, and education.

Notable clients include MetaFactory, CUDO Compute, TokenLandia, BrewDog, and KnownOrigin.

Company registered in England & Wales — No. 11229039.
