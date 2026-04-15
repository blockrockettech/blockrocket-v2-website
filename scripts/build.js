'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const nunjucks = require('nunjucks');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');

// Configure Nunjucks
const env = nunjucks.configure(TEMPLATES_DIR, { autoescape: true, throwOnUndefined: false });

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

// Extract ## headings from markdown source for the "Jump To" sidebar
function extractHeadings(markdown) {
  const headings = [];
  for (const line of markdown.split('\n')) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      const text = match[1].replace(/\*\*/g, '').replace(/`/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      headings.push({ text, id });
    }
  }
  return headings;
}

// Add id attributes to <h2> tags in rendered HTML so jump-to links work
function addHeadingIds(html) {
  return html.replace(/<h2>(.*?)<\/h2>/g, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `<h2 id="${id}">${inner}</h2>`;
  });
}

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8');
      const { data, content } = matter(raw);
      const slug = slugify(filename);
      const htmlContent = addHeadingIds(marked(content));
      const headings = extractHeadings(content);
      return {
        ...data,
        slug,
        content: htmlContent,
        headings,
        tagsCsv: (data.tags || []).map(t => t.label.toLowerCase()).join(','),
        url: `/blog/${slug}.html`,
      };
    })
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

  // Load posts
  const posts = loadPosts();
  const featuredPost = posts[0] || null;
  const latestPosts = posts.slice(0, 3);
  const allTags = [...new Set(posts.flatMap(p => (p.tags || []).map(t => t.label)))];

  const siteConfig = {
    url: process.env.SITE_URL || 'http://localhost:3000',
    name: process.env.SITE_NAME || 'BlockRocket',
    gaId: process.env.GA_TRACKING_ID || '',
  };

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
    posts,
    featuredPost,
    allTags,
    site: siteConfig,
    pageUrl: '/blog/index.html',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'blog', 'index.html'), blogHtml);
  console.log('[build]   /blog/index.html');

  // Render landing page
  const indexHtml = nunjucks.render('index.njk', {
    latestPosts,
    site: siteConfig,
    pageUrl: '/',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
  console.log('[build]   /index.html');

  console.log(`[build] Done — ${posts.length} post(s), ${posts.length + 2} page(s) generated`);
}

build();

module.exports = { build };
