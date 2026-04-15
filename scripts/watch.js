'use strict';

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Initial build
console.log('[watch] Initial build…');
try {
  execSync('node scripts/build.js', { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('[watch] Initial build failed');
}

// Watch for changes
const watcher = chokidar.watch(
  ['content/**', 'templates/**', 'public/**'],
  { cwd: ROOT, ignoreInitial: true, persistent: true }
);

watcher.on('all', (event, filePath) => {
  console.log(`[watch] ${event}: ${filePath} — rebuilding…`);
  try {
    execSync('node scripts/build.js', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('[watch] Build error — fix the issue and save again');
  }
});

console.log('[watch] Watching content/, templates/, public/ for changes…');
