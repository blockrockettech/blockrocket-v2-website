# BlockRocket v2 Website

Marketing and blog site for [BlockRocket](https://blockrocket.tech) — expert-led Web3 consultancy based in Manchester, UK. Co-founded by Andy Gray and James Morgan (KnownOrigin → eBay acquisition, 2022).

Built as a static site from a Webflow export. CSS/JS from the Webflow export is retained as-is; content, routing, and all CMS logic has been replaced with a Node.js build pipeline using gray-matter + Nunjucks.

## Stack

| Layer | Tool |
|---|---|
| Templating | [Nunjucks](https://mozilla.github.io/nunjucks/) |
| Content | Markdown files with YAML frontmatter ([gray-matter](https://github.com/jonschlinkert/gray-matter)) |
| Markdown → HTML | [marked](https://marked.js.org/) |
| Dev server | [lite-server](https://github.com/johnpapa/lite-server) (browser-sync) |
| File watching | [chokidar](https://github.com/paulmillr/chokidar) |
| Deployment | [Vercel](https://vercel.com) (static, `dist/` output) |

## Getting started

```bash
npm install
npm run dev       # build + watch + live reload on http://localhost:3000
```

Or for a one-off build:

```bash
npm run build     # outputs to dist/
```

## Project structure

```
blockrocket-v2-website/
├── content/
│   └── blog/             ← blog posts as .md / .mdx files
├── templates/
│   ├── _partials/
│   │   ├── head.njk      ← <head> with SEO meta tags
│   │   ├── nav.njk       ← site navigation
│   │   ├── footer.njk    ← site footer
│   │   └── scripts.njk   ← JS includes + AOS init
│   ├── index.njk         ← landing page
│   ├── blog.njk          ← blog listing (/blog/index.html)
│   └── post.njk          ← individual blog post
├── public/               ← static assets copied verbatim to dist/
│   ├── css/
│   │   ├── normalize.css
│   │   ├── base.css      ← Webflow base styles
│   │   └── blockrocket.css ← site-specific styles
│   ├── js/
│   │   └── site.js       ← interaction runtime (from Webflow export)
│   └── images/
├── scripts/
│   ├── build.js          ← main build pipeline
│   └── watch.js          ← chokidar watcher for dev
├── dist/                 ← generated output (gitignored, Vercel deploys this)
├── .env                  ← local env vars (gitignored)
├── .env.example          ← env var reference
├── bs-config.js          ← lite-server config
└── vercel.json           ← build + rewrite config
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

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Description | Example |
|---|---|---|
| `SITE_URL` | Canonical base URL (no trailing slash) | `https://blockrocket.tech` |
| `SITE_NAME` | Site name used in meta | `BlockRocket` |
| `GA_TRACKING_ID` | Google Analytics ID (optional) | `G-XXXXXXXXXX` |
| `CONTACT_FORM_ENDPOINT` | Form POST endpoint (optional) | `https://...` |

Set these same variables in your Vercel project settings for production builds.

## Deployment

The repo auto-deploys to Vercel on push to `main`. `vercel.json` configures:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Rewrites:** `/blog` and `/blog/:slug` → clean URLs without `.html`

For a manual deploy:

```bash
npm run build
# then push — Vercel picks it up automatically
```

## URLs

| Route | File |
|---|---|
| `/` | `dist/index.html` |
| `/blog/` or `/blog` | `dist/blog/index.html` |
| `/blog/:slug` | `dist/blog/:slug.html` |

## Company context

**BlockRocket** was founded in 2018 by **Andy Gray** and **James Morgan**, emerging from the Manchester blockchain community they helped build. The duo co-created **Blockchain Manchester** and launched **KnownOrigin** — a decentralised NFT art marketplace on Ethereum — which was acquired by **eBay in 2022**.

BlockRocket now operates as a veteran Web3 consultancy serving enterprises, startups, and founders navigating decentralised systems. Services include strategy & advisory, smart contract engineering, DeFi/self-custody onboarding, and education.

Notable clients include MetaFactory, CUDO Compute, TokenLandia, BrewDog, and KnownOrigin.

Company registered in England & Wales — No. 11229039.
