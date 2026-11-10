'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const nunjucks = require('nunjucks');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const PAGES_DIR = path.join(ROOT, 'content', 'pages');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');

// Configure Nunjucks
const env = nunjucks.configure(TEMPLATES_DIR, { autoescape: true, throwOnUndefined: false });

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// **bold** → <span class="text-bold">; rest in <span class="text-regular"> (hero lead text)
env.addFilter('spanBold', (str) => {
  if (!str) return '';
  return escHtml(str)
    .split(/(\*\*[^*]+\*\*)/g)
    .map(part => {
      if (part.startsWith('**') && part.endsWith('**'))
        return `<span class="text-bold">${part.slice(2, -2)}</span>`;
      return part ? `<span class="text-regular">${part}</span>` : '';
    })
    .join('');
});

// **bold** → <span class="body-bold"> (body paragraphs; rest inherits body-regular from parent)
env.addFilter('bodyBold', (str) => {
  if (!str) return '';
  return escHtml(str).replace(/\*\*([^*]+)\*\*/g, '<span class="body-bold">$1</span>');
});

// **bold** → <strong>, *italic* → <em> (timeline bodies, pull quote)
env.addFilter('mdInline', (str) => {
  if (!str) return '';
  let s = escHtml(str);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
});

// formatDate: "2024-05-30" → "May 30, 2024"
env.addFilter('formatDate', (dateInput) => {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(String(dateInput) + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

function slugify(filename) {
  return path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // strip optional YYYY-MM-DD- prefix
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// One source of truth for heading ids. The renderer assigns each <h2> a unique id and
// records it for the "Jump To" sidebar, so links can never drift from the rendered ids
// (e.g. headings containing links or inline code, or two headings with the same text).
function headingSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function renderMarkdown(markdown) {
  const headings = [];
  const used = new Set();
  const renderer = new marked.Renderer();
  // marked v12 passes (renderedInlineHtml, level, plainText)
  renderer.heading = (text, level, raw) => {
    if (level !== 2) return `<h${level}>${text}</h${level}>\n`;
    const base = headingSlug(raw) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    headings.push({ text: raw, id });
    return `<h2 id="${id}">${text}</h2>\n`;
  };
  return { html: marked.parse(markdown, { renderer }), headings };
}

function loadPageContent(name) {
  const file = fs.readFileSync(path.join(PAGES_DIR, `${name}.mdx`), 'utf8');
  return matter(file).data;
}

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8');
      const { data, content } = matter(raw);
      for (const key of ['title', 'excerpt', 'date']) {
        if (!data[key]) throw new Error(`content/blog/${filename}: missing required frontmatter "${key}"`);
      }
      const slug = slugify(filename);
      const { html: htmlContent, headings } = renderMarkdown(content);
      return {
        ...data,
        slug,
        content: htmlContent,
        headings,
        tagsCsv: (data.tags || []).map(t => t.label.toLowerCase()).join(','),
        url: `/blog/${slug}`, // clean URL; the file is written to dist/blog/${slug}.html
      };
    })
    .filter(post => !post.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function build() {
  console.log('[build] Starting…');

  // Clean and recreate dist/
  if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy public/ assets → dist/
  if (fs.existsSync(PUBLIC_DIR)) {
    copyDirSync(PUBLIC_DIR, DIST_DIR);
    console.log('[build] Copied public assets');
  }

  // Load page content from content/pages/
  const home = loadPageContent('home');
  const story = loadPageContent('story-so-far');

  // Load posts
  const posts = loadPosts();
  const featuredPost = posts[0] || null;
  // Posts shown on /blog/ grid: exclude the featured one so it isn't rendered twice
  const blogGridPosts = posts.slice(1);
  // Posts shown on homepage "Latest Insights" strip: top 3 by date (includes featured)
  const latestPosts = posts.slice(0, 3);
  const allTags = [...new Set(posts.flatMap(p => (p.tags || []).map(t => t.label)))];

  // Cache-busting token for CSS/JS links. server.js caches static assets for a
  // day, so changing ?v= whenever any stylesheet or script changes forces
  // browsers to fetch the new file.
  const assetVersion = (() => {
    const hash = require('crypto').createHash('sha1');
    for (const dir of ['css', 'js']) {
      const abs = path.join(PUBLIC_DIR, dir);
      if (!fs.existsSync(abs)) continue;
      for (const f of fs.readdirSync(abs).sort()) {
        hash.update(f);
        hash.update(fs.readFileSync(path.join(abs, f)));
      }
    }
    return hash.digest('hex').slice(0, 10);
  })();

  const siteConfig = {
    url: process.env.SITE_URL || 'http://localhost:3000',
    name: process.env.SITE_NAME || 'BlockRocket',
    gaId: process.env.GA_TRACKING_ID || '',
    assetVersion,
  };

  // Production builds must never ship localhost canonicals / OG URLs. Coolify injects
  // SOURCE_COMMIT; NODE_ENV=production also counts. Set SITE_URL as a *build* variable.
  const isProdBuild = Boolean(process.env.SOURCE_COMMIT) || process.env.NODE_ENV === 'production';
  if (isProdBuild && /localhost|127\.0\.0\.1/.test(siteConfig.url)) {
    throw new Error(
      `SITE_URL is "${siteConfig.url}". Set SITE_URL=https://blockrocket.tech as a build variable before deploying.`
    );
  }
  siteConfig.url = siteConfig.url.replace(/\/+$/, '');

  // Create dist/blog/
  fs.mkdirSync(path.join(DIST_DIR, 'blog'), { recursive: true });

  // Render each post page
  for (const post of posts) {
    const relatedPosts = posts.filter(p => p.slug !== post.slug).slice(0, 3);
    const html = nunjucks.render('post.njk', {
      post,
      relatedPosts,
      site: siteConfig,
      pageUrl: post.url,
      ogType: 'article',
      ogArticlePublishedTime: post.date instanceof Date
        ? post.date.toISOString()
        : new Date(String(post.date) + 'T12:00:00').toISOString(),
    });
    fs.writeFileSync(path.join(DIST_DIR, 'blog', `${post.slug}.html`), html);
    console.log(`[build]   /blog/${post.slug}.html`);
  }

  // Render blog listing page
  const blogHtml = nunjucks.render('blog.njk', {
    posts: blogGridPosts,
    featuredPost,
    allTags,
    site: siteConfig,
    pageUrl: '/blog/',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'blog', 'index.html'), blogHtml);
  console.log('[build]   /blog/index.html');

  // Render landing page
  const indexHtml = nunjucks.render('index.njk', {
    home,
    latestPosts,
    site: siteConfig,
    pageUrl: '/',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('[build]   /index.html');

  // Render /story-so-far page
  const storyHtml = nunjucks.render('story-so-far.njk', {
    story,
    site: siteConfig,
    pageUrl: '/story-so-far',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'story-so-far.html'), storyHtml);
  console.log('[build]   /story-so-far.html');

  // 404 page (server.js serves dist/404.html with a 404 status)
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), nunjucks.render('404.njk', { site: siteConfig, pageUrl: '/404' }));
  console.log('[build]   /404.html');

  // sitemap.xml + robots.txt
  const fmtDate = d => (d instanceof Date ? d : new Date(String(d) + 'T12:00:00')).toISOString().slice(0, 10);
  const sitemapEntries = [
    { loc: '/' },
    { loc: '/story-so-far' },
    { loc: '/blog/', lastmod: posts[0] ? fmtDate(posts[0].date) : undefined },
    ...posts.map(p => ({ loc: p.url, lastmod: fmtDate(p.date) })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapEntries
      .map(e => `  <url><loc>${siteConfig.url}${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.url}/sitemap.xml\n`);
  console.log('[build]   /sitemap.xml, /robots.txt');

  console.log(`[build] Done — ${posts.length} post(s), ${posts.length + 4} page(s) generated`);
}

build();

module.exports = { build };
