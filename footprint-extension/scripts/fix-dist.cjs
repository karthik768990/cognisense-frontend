// scripts/fix-dist.cjs
const fs = require('fs');
const path = require('path');

const distRoot = path.resolve(__dirname, '..', 'dist');

const items = [
  { src: path.join(distRoot, 'src/popup/index.html'), destDir: path.join(distRoot, 'popup'), dest: 'index.html' },
  { src: path.join(distRoot, 'src/options/index.html'), destDir: path.join(distRoot, 'options'), dest: 'index.html' },
  // if the plugin already copied into dist/popup, patch that too
  { src: path.join(distRoot, 'popup/index.html'), destDir: path.join(distRoot, 'popup'), dest: 'index.html' },
  { src: path.join(distRoot, 'options/index.html'), destDir: path.join(distRoot, 'options'), dest: 'index.html' }
];

for (const it of items) {
  try {
    if (!fs.existsSync(it.src)) continue;
    if (!fs.existsSync(it.destDir)) fs.mkdirSync(it.destDir, { recursive: true });
    let html = fs.readFileSync(it.src, 'utf8');
    // Replace index.jsx / index.tsx / index.ts with index.js
    html = html.replace(/<script\s+type=["']module["']\s+src=["']\.\/index\.(jsx|tsx|ts)["']\s*><\/script>/g, '<script type="module" src="./index.js"></script>');
    fs.writeFileSync(path.join(it.destDir, it.dest), html, 'utf8');
    console.log(`Copied/fixed: ${it.src} -> ${path.join(it.destDir, it.dest)}`);
  } catch (err) {
    console.error('fix-dist error for', it.src, err);
  }
}
