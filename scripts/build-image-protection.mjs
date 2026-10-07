import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Run last so every generated page (including new pages and admin) receives the guard.
function protectPages(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { protectPages(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = readFileSync(path, 'utf8');
    html = html.replace(/<img\b[^>]*>/gi, tag =>
      tag.replace(/\sdraggable\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/\s*\/?>$/, ' draggable="false">'));
    if (!html.includes('/image-protection.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/image-protection.css?v=3"><script src="/image-protection.js?v=3" defer></script></head>');
    writeFileSync(path, html);
  }
}
protectPages('dist');

