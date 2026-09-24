// Builds the static Polish pages in /pl/ from the English pages.
//   node tools/build-pl.mjs
// Short strings come from assets/js/i18n.js (data-i18n / data-i18n-attr),
// long content between <!-- pl:block NAME --> markers comes from i18n/pl/NAME.html.
// Re-run after every change to an English page, i18n.js or i18n/pl/*.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = 'https://www.valeris.co.in';
const PAGES = ['index.html', 'pharma.html', 'supplier-verification.html', 'guide-verify-indian-supplier.html', 'privacy.html'];

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/i18n.js'), 'utf8'), sandbox);
const PL = sandbox.window.VALERIS_I18N.pl;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const missing = new Set();
const t = (key, fallback) => {
  if (PL[key] == null) { missing.add(key); return fallback; }
  return esc(PL[key]);
};

fs.mkdirSync(path.join(ROOT, 'pl'), { recursive: true });

for (const page of PAGES) {
  let html = fs.readFileSync(path.join(ROOT, page), 'utf8');

  // long-form blocks
  html = html.replace(/<!-- pl:block ([\w-]+) -->[\s\S]*?<!-- \/pl:block -->\n?/g, (_, name) =>
    fs.readFileSync(path.join(ROOT, 'i18n/pl', name + '.html'), 'utf8'));

  // translated attributes (meta content, placeholders)
  html = html.replace(/<\w+\b[^>]*data-i18n-attr="([\w-]+)"[^>]*>/g, (tag, attr) => {
    const key = tag.match(/data-i18n="([^"]+)"/)[1];
    return tag.replace(new RegExp(`(\\s${attr}=")[^"]*"`), (m, pre) => pre + t(key, m.slice(pre.length, -1)) + '"');
  });

  // translated text (leaf elements only)
  html = html.replace(/<(\w+)(\s[^>]*?data-i18n="([^"]+)"[^>]*)>([^<]*)<\/\1>/g, (m, tag, attrs, key, text) =>
    attrs.includes('data-i18n-attr') ? m : `<${tag}${attrs}>${t(key, text)}</${tag}>`);

  html = html
    .replace('<html lang="en">', '<html lang="pl">')
    .replace('class="lang-btn is-active" data-lang="en" aria-pressed="true"', 'class="lang-btn" data-lang="en" aria-pressed="false"')
    .replace('class="lang-btn" data-lang="pl" aria-pressed="false"', 'class="lang-btn is-active" data-lang="pl" aria-pressed="true"')
    .replace('content="en_GB" />', 'content="__tmp" />')
    .replace('<meta property="og:locale:alternate" content="pl_PL" />', '<meta property="og:locale:alternate" content="en_GB" />')
    .replace('content="__tmp" />', 'content="pl_PL" />')
    .replace(new RegExp(`(rel="canonical" href="|property="og:url" content=")${BASE}/`, 'g'), `$1${BASE}/pl/`)
    // /pl/ pages sit one level deeper: make shared paths absolute
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/href="\/(#[^"]*)?"/g, (m, hash) => `href="/pl/${hash || ''}"`)
    .replace(/href="india\.html/g, 'href="/india.html');

  // accessibility labels that live outside the dictionary
  for (const [en, pl] of [['>Skip to content<', '>Przejdź do treści<'], ['aria-label="Language"', 'aria-label="Język"'],
    ['aria-label="Open menu"', 'aria-label="Otwórz menu"'], ['aria-label="Primary"', 'aria-label="Menu główne"'],
    ['aria-label="Scroll down"', 'aria-label="Przewiń w dół"'], ['aria-label="Valeris — home"', 'aria-label="Valeris — strona główna"']]) {
    html = html.replaceAll(en, pl);
  }

  fs.writeFileSync(path.join(ROOT, 'pl', page), html);
  console.log('built pl/' + page);
}

if (missing.size) {
  console.warn('Missing PL translations (English kept):', [...missing].join(', '));
  process.exitCode = 1;
}
