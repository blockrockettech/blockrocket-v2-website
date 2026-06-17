# CLAUDE.md — BlockRocket v2 Website

This file provides context for Claude Code agents and engineers working on this codebase.

## What this is

Static marketing + blog site for BlockRocket (blockrocket.tech). Exported from Webflow, then re-platformed onto a Node.js build pipeline. The CSS and JS from the Webflow export are kept intact — **do not regenerate or replace them**. Only templates, content, and build tooling are managed here.

## Stack

- **Nunjucks** — HTML templating (`templates/`)
- **gray-matter** — YAML frontmatter parsing from `.md` / `.mdx` files
- **marked** — markdown → HTML conversion
- **lite-server** — dev server (browser-sync wrapper)
- **chokidar** — file watcher for dev mode
- **Vercel** — deployment (static, `dist/` folder)
- **Formspree AJAX** — homepage contact form submission via CDN-loaded vanilla JS

## Build pipeline (`scripts/build.js`)

1. Cleans and recreates `dist/`
2. Copies `public/` → `dist/` (all CSS, JS, images)
3. Loads page data from `content/pages/home.mdx` and `content/pages/story-so-far.mdx`
4. Reads all `.md`/`.mdx` files from `content/blog/`
5. Parses frontmatter with gray-matter, converts post body with marked
6. Extracts `##` headings for the sidebar "Jump To" links
7. Adds `id` attributes to `<h2>` tags in rendered HTML
8. Computes slug from filename (strips optional `YYYY-MM-DD-` prefix)
9. Renders each post → `dist/blog/{slug}.html`
10. Renders blog listing → `dist/blog/index.html`
11. Renders landing page → `dist/index.html`
12. Renders story page → `dist/story-so-far.html`

Run it: `npm run build` or `npm run dev` (build + watch + live reload).

## Directory structure

```
content/pages/       ← structured page content as frontmatter-only .mdx files
content/blog/        ← .md/.mdx blog posts (frontmatter + markdown body)
templates/
  _partials/
    head.njk         ← <head>: SEO meta, CSS links, fonts. NO Webflow scripts.
    nav.njk          ← navigation. Uses isHome variable to show/hide section links.
    footer.njk       ← footer links + brand line
    scripts.njk      ← JS includes (jQuery, site.js, AOS init + marquee setup)
  index.njk          ← landing page (page-content driven + dynamic blog preview + Formspree contact form)
  blog.njk           ← blog listing (featured post + card grid + tag filter)
  post.njk           ← individual post (header, rich text, jump-to, related posts)
  story-so-far.njk   ← timeline / company story page
public/
  css/
    normalize.css    ← browser reset
    base.css         ← Webflow base styles (DO NOT EDIT — treat as vendor)
    blockrocket.css  ← site-specific styles (DO NOT EDIT — treat as vendor)
    overrides.css    ← safe place for non-vendor CSS overrides
  js/
    site.js          ← Webflow interaction runtime (DO NOT EDIT — treat as vendor)
  images/            ← all site images
scripts/
  build.js           ← full build pipeline
  watch.js           ← chokidar watcher (calls build.js on any change)
dist/                ← generated output (gitignored)
```

## Frontmatter schema (content/blog/*.md)

```yaml
draft: true             # optional — excludes the post from all listings and skips HTML generation
title: string           # required — used in <title>, OG, card
excerpt: string         # required — used in meta description, card body, post lead
date: "YYYY-MM-DD"      # required — ISO string; used for sorting and display
thumbLabel: string      # eyebrow text on blog cards
readTime: "N min read"  # displayed in post header
tags:
  - label: string       # tag display name (used for filter buttons)
    highlight: true     # optional — renders tag with emphasis styling
coverImage: string          # optional — filename in public/images/ (e.g. my-post.avif)
coverImagePosition: string  # optional — CSS background-position (e.g. top, bottom, center). Default: center
coverImageFit: string       # optional — CSS background-size (e.g. cover, contain, auto). Default: cover
coverImageBg: string        # optional — CSS background-color shown behind the image (e.g. "#000", "#1a1a2e"). Useful with contain or auto fit.
coverImageOverlay: boolean  # optional — adds green brand tint overlay over the cover image
```

**Important:** `date` is parsed by gray-matter as a JavaScript Date object when formatted as `YYYY-MM-DD`. The build script handles both Date objects and strings with `formatDate` filter.

## Template variables

### All templates receive:
- `site.url` — base URL from `SITE_URL` env var (e.g. `https://blockrocket.tech`)
- `site.name` — from `SITE_NAME`
- `site.gaId` — from `GA_TRACKING_ID`
- `pageUrl` — current page path (used in canonical + OG URL)

### `index.njk` also receives:
- `latestPosts[]` — 3 most recent posts (full post objects)
- `home` — parsed frontmatter object from `content/pages/home.mdx`

### `blog.njk` also receives:
- `posts[]` — all posts sorted by date desc
- `featuredPost` — `posts[0]`
- `allTags[]` — unique tag labels across all posts (for filter buttons)

### `story-so-far.njk` also receives:
- `story` — parsed frontmatter object from `content/pages/story-so-far.mdx`

### `post.njk` also receives:
- `post` — full post object including `post.content` (rendered HTML) and `post.headings[]`
- `relatedPosts[]` — up to 3 other posts (for "Read More" section)
- `ogType` — `'article'`
- `ogArticlePublishedTime` — ISO timestamp

### Post object shape:
```js
{
  title, excerpt, date, thumbLabel, readTime, tags, coverImage,  // from frontmatter
  slug,        // derived from filename
  url,         // e.g. "/blog/my-post.html"
  content,     // rendered HTML from markdown body
  headings,    // [{ text, id }] — extracted ## headings for jump-to sidebar
  tagsCsv,     // e.g. "services,smart contracts" — used for client-side tag filter
}
```

## CSS class conventions (from Webflow export — do not rename)

These are defined in `blockrocket.css` and must not be changed:

| Class | Purpose |
|---|---|
| `w-inline-block` | `display: inline-block` |
| `w-button` | button reset/base styles |
| `w-richtext` | rich text container styles (typography) |
| `w-form`, `w-form-done`, `w-form-fail` | contact form states |
| `w-list-unstyled` | unstyled list |
| `blog-card dark` | dark-variant blog card (listing page) |
| `blog-card` (no dark) | light-variant blog card (homepage preview) |

## Adding a new page

1. Create `templates/my-page.njk`
2. Create a matching `content/pages/my-page.mdx` file if the page content should be frontmatter-driven
3. Add a render call in `scripts/build.js` (follow the pattern for `index.njk` / `story-so-far.njk`)
4. Add a rewrite in `vercel.json` if you want a clean URL

## Adding/changing navigation links

Edit `templates/_partials/nav.njk`. The nav has two states controlled by `isHome`:
- `isHome = true` — shows the full link bar (`#about`, `#services`, etc.)
- `isHome = false` — simplified nav (logo only + Contact Us CTA)

Set `{% set isHome = true %}` only in `index.njk`.

## SEO checklist (already implemented)

- [x] Unique `<title>` per page
- [x] `meta description` from frontmatter `excerpt` (posts) or hardcoded (listing/home)
- [x] `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- [x] `article:published_time` on blog posts
- [x] `twitter:card`, `twitter:site` (@blockrockettech)
- [x] `<link rel="canonical">` on every page
- [x] JSON-LD Organization schema on homepage
- [x] `id` attributes on `<h2>` headings (jump-to + anchor links)

## Content creation skills

Two Claude Code skills in `skills/` handle all content work:

### `blockrocket-voice` (`/blockrocket-voice`)
Write or edit any BlockRocket content — website copy, blog posts, LinkedIn, X — in the authentic voices of Andy Gray and James Morgan. Voice reference files: `skills/blockrocket-voice/references/`. Run the linter after drafting:
```bash
node plans/lint-voice.js content/blog/<file>.mdx
```

### `blockrocket-interview` (`/blockrocket-interview`)
Run a structured founder interview session: captures answers into `plans/04-interview-questions.md`, updates the story backlog at `skills/blockrocket-interview/references/story-moments.md`, and generates draft blog skeletons in `content/blog/` (always with `draft: true`). Narrative strategy docs: `plans/` — see `plans/README.md`.

## Do NOT do

- **Do not edit** `public/css/base.css`, `public/css/blockrocket.css`, or `public/js/site.js` — treat as vendor files from the Webflow export
- **Do not re-import** into Webflow — this site is now fully decoupled
- **Do not add** `data-wf-*` attributes or `w-mod-*` classes — Webflow runtime is not active
- **Do not commit** `dist/` or `.env` — both are gitignored
- **Do not use** `npm run build` output as the source for edits — always edit `templates/` and `content/`

## Common tasks

### Rebuild after changes
Changes to `templates/` or `content/` require a rebuild. With `npm run dev` running this is automatic. Otherwise: `npm run build`.

### Update homepage copy or section content
Edit `content/pages/home.mdx`. The homepage layout lives in `templates/index.njk`, but the section copy, service titles, contact copy, and team text come from the `home` frontmatter object.

### Update the homepage contact form
The contact form markup lives in `templates/index.njk`. It posts to Formspree endpoint `https://formspree.io/f/mbdbjzqz` using the CDN version of `@formspree/ajax`, with the init script embedded near the bottom of the page template. Inline success / error styling lives in `public/css/overrides.css`.

### Change the featured post
The featured post on `/blog/index.html` is always `posts[0]` — the most recent by `date`. Update the `date` field in frontmatter to promote a post.

### Add a cover image to a post
1. Place the image in `public/images/`
2. Add `coverImage: my-image.avif` to the post's frontmatter

### Update production env vars
Set `SITE_URL=https://blockrocket.tech` in Vercel project settings. This controls canonical URLs and OG image absolute paths.

### Deploy
Push to `main` — Vercel auto-deploys via `npm run build` + `dist/` as configured in `vercel.json`.
