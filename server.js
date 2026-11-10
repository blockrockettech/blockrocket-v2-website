// Production static server for Coolify / Hetzner.
// Serves dist/, resolves clean URLs (/blog/my-post -> my-post.html),
// and exposes GET /api/health for Coolify's health check.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { version } = require('./package.json');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST = path.join(__dirname, 'dist');
const startedAt = new Date();

// Sent on every response. CSP is Report-Only for now: the site still relies on inline
// scripts (hence 'unsafe-inline'). Watch the browser console for violations, move the
// inline scripts to files, then enforce it and drop 'unsafe-inline'.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://ajax.googleapis.com https://d3e54v103j8qbb.cloudfront.net",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data:",
    'connect-src https://formspree.io',
    'form-action https://formspree.io',
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

function sendJson(req, res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': MIME['.json'],
    'Content-Length': Buffer.byteLength(json),
    'Cache-Control': 'no-store',
  });
  res.end(req.method === 'HEAD' ? undefined : json);
}

function health(req, res) {
  const built = fs.existsSync(path.join(DIST, 'index.html'));
  sendJson(req, res, built ? 200 : 503, {
    status: built ? 'ok' : 'error',
    ...(built ? {} : { error: 'dist/index.html missing — has the build run?' }),
    version,
    commit: process.env.SOURCE_COMMIT || null, // injected by Coolify
    uptime: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
  });
}

// Resolve a URL path to a file inside dist/, trying clean-URL fallbacks:
//   /blog          -> /blog/index.html
//   /blog/my-post  -> /blog/my-post.html
//   /story-so-far  -> /story-so-far.html
function resolveFile(urlPath) {
  const base = path.normalize(path.join(DIST, urlPath));
  if (base !== DIST && !base.startsWith(DIST + path.sep)) return null; // path traversal

  const candidates = [base, base + '.html', path.join(base, 'index.html')];
  for (const file of candidates) {
    try {
      if (fs.statSync(file).isFile()) return file;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function cacheControl(req, ext) {
  if (ext === '.html') return 'no-cache';
  // CSS/JS are linked with ?v=<content hash> (see build.js), so a new build means a new URL.
  if (/[?&]v=/.test(req.url) && (ext === '.css' || ext === '.js')) return 'public, max-age=31536000, immutable';
  return 'public, max-age=86400';
}

function serveFile(req, res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': cacheControl(req, ext),
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  if (urlPath === '/api/health' || urlPath === '/api/health/') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
      return res.end();
    }
    return health(req, res);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
    return res.end();
  }

  // Strip trailing slash (except root) so /blog/ resolves like /blog
  if (urlPath.length > 1 && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);

  // Canonical URLs are extension-less: /story-so-far.html -> /story-so-far, /blog/index.html -> /blog/
  if (urlPath.endsWith('.html')) {
    let clean = urlPath.slice(0, -'.html'.length);
    if (clean.endsWith('/index')) clean = clean.slice(0, -'index'.length); // "/blog/" or "/"
    const search = new URL(req.url, 'http://localhost').search;
    res.writeHead(301, { ...SECURITY_HEADERS, Location: (clean || '/') + search });
    return res.end();
  }

  const file = resolveFile(urlPath);
  if (file) return serveFile(req, res, file);

  const notFound = path.join(DIST, '404.html');
  if (fs.existsSync(notFound)) return serveFile(req, res, notFound, 404);
  res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`BlockRocket site listening on http://${HOST}:${PORT}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
