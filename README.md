<div align="center">

# VALERIS

**Europe ⇄ India market-entry advisory — corporate website**

A static, dependency-free front end built for a bilingual B2B advisory firm. No framework, no build step, no runtime overhead — just disciplined HTML, CSS and JavaScript engineered to load fast, read correctly in two languages, and hold up under real production constraints.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Responsive](https://img.shields.io/badge/Layout-Responsive-2F5C3F?style=flat-square)](#responsive-design)
[![SEO Ready](https://img.shields.io/badge/SEO-Ready-C19559?style=flat-square)](#seo-implementation)
[![Bilingual](https://img.shields.io/badge/i18n-EN%20%2F%20PL-113632?style=flat-square)](#localization-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

[Live Site](https://www.valeris.com.in) · [Report an Issue](../../issues)

</div>

---

## Overview

Valeris is a market-entry and business development advisory operating between Europe and India — supplier verification, consulting, local representation and business facilitation, with a dedicated vertical for pharmaceutical export readiness.

This repository is the production front end for `valeris.com.in`: two HTML documents (`index.html`, `pharma.html`) sharing a single CSS design system and a single JavaScript runtime, with all copy abstracted into a bilingual content dictionary rather than hard-coded into markup. There is no framework and no build tool. Every byte shipped to the browser is a byte that was written by hand, which was a deliberate trade-off: for a two-page marketing site, a bundler adds build-time risk and dependency surface without buying anything a flat file structure doesn't already provide.

The project is optimized for the constraints that actually matter on a site like this: first-load performance, layout stability, language correctness, and long-term editability by someone who isn't the original author.

## Live Demo

| Environment | URL |
|---|---|
| Production | [valeris.com.in](https://www.valeris.com.in) |
| Pharma vertical | [valeris.com.in/pharma.html](https://www.valeris.com.in/pharma.html) |

## Key Features

- **Bilingual by architecture, not by duplication** — one English page, one Polish page would have meant two sources of truth to keep in sync. Instead, every string lives once in a JS dictionary and is rendered into both languages from the same markup.
- **Zero layout shift on language switch** — switching `EN ⇄ PL` swaps text content in place; it never swaps DOM structure, so nothing reflows.
- **Fully responsive, verified at real breakpoints** — not just `@media` rules written and assumed correct, but checked against 320px–1920px viewports including the awkward in-between laptop heights (864px, 900px) where content most commonly clips above the fold.
- **Restrained, editorial motion** — entrance reveals, a hairline stroke-draw, a one-time hero counter. No parallax, no scroll-jacking, no card-lift hovers. `prefers-reduced-motion` is respected throughout.
- **Self-hosted, subset-aware fonts** — Cormorant Garamond and Inter, served as `woff2`, split into `latin` / `latin-ext` subsets so a Polish-reading browser isn't forced to download glyph ranges it doesn't need.
- **No third-party requests by default** — fonts are self-hosted and analytics is opt-in via a single config flag; nothing phones home unless explicitly configured to.
- **Structured-data and metadata complete** — Organization JSON-LD, canonical URLs, `hreflang` alternates, Open Graph and Twitter Card tags, present on both pages, pointed at a consistent production domain.

## Screenshots

> Replace the placeholders below with current captures from `assets/img/screenshots/` before publishing.

**Hero — desktop (1440×900)**
`![Hero desktop](assets/img/screenshots/hero-desktop.png)`

**Hero — mobile (390×844)**
`![Hero mobile](assets/img/screenshots/hero-mobile.png)`

**Services**
`![Services section](assets/img/screenshots/services.png)`

**Pharma vertical**
`![Pharma page](assets/img/screenshots/pharma.png)`

**Language switch (EN / PL)**
`![Language switch](assets/img/screenshots/language-switch.png)`

## Technical Highlights

| Area | Implementation |
|---|---|
| Markup | Semantic HTML5, single `<h1>` per page, non-skipping heading hierarchy, landmark elements (`header` / `nav` / `main` / `footer`) |
| Styling | One stylesheet, custom-property design tokens, mobile-first cascade with explicit desktop overrides |
| Behavior | Vanilla JS, no dependencies, `IntersectionObserver` for scroll-driven reveals, passive scroll listeners |
| Localization | Data-driven dictionary (`assets/js/i18n.js`), `data-i18n` attribute binding, no duplicated markup per language |
| Fonts | Self-hosted `woff2`, `font-display: swap`, preloaded weights for the hero's critical render path |
| Deployment | Static files only — deployable to Vercel, Netlify, GitHub Pages, or any static host with zero configuration |

## Architecture Overview

```
Request
  │
  ▼
index.html / pharma.html   (static markup, data-i18n attributes, no inline copy logic)
  │
  ├── assets/css/fonts.css   → @font-face declarations, subset-mapped
  ├── assets/css/styles.css  → design tokens, components, responsive rules
  │
  └── assets/js/
        config.js  → deployment-time constants (GA4 ID, CRM endpoint, canonical origin)
        i18n.js    → EN/PL string dictionary, single source of truth for all copy
        main.js    → language engine, nav behavior, scroll reveal, form handling
```

There is no client-side routing and no virtual DOM. Each page is a complete, independently servable HTML document. Shared behavior (header, language switch, animations, form logic) lives once in `main.js` and is loaded by both pages — the duplication is in two thin HTML shells, not in the logic or the copy.

### `assets/css/`

- **`fonts.css`** — `@font-face` rules only. Each typeface is split into `latin` and `latin-ext` subsets via `unicode-range`, so the browser fetches only the glyph set the rendered language actually needs instead of one oversized file covering both.
- **`styles.css`** — the entire design system: CSS custom properties for color, spacing, easing and typography (`:root`), then components (header, hero, USP grid, service rows, process steps, contact form, footer), then a `RESPONSIVE` section containing breakpoint overrides ordered mobile-first with explicit `min-width` desktop refinements layered on top.

### `assets/js/`

- **`config.js`** — the only file a deployer is expected to touch: GA4 measurement ID, CRM (Google Apps Script) endpoint, canonical production origin. Analytics loads conditionally — if `ga4Id` is empty, no script tag is ever injected.
- **`i18n.js`** — `window.VALERIS_I18N`, a flat key-value dictionary for `en` and `pl`. Every visible string on either page resolves through this object; there is no copy embedded directly in `index.html` or `pharma.html` beyond the `data-i18n` key references.
- **`main.js`** — language switching, sticky-header + scroll-spy, mobile navigation, scroll-triggered reveals, the hero numeral count-up, and contact-form validation/submission. No external libraries.

### `assets/fonts/` and `assets/img/`

- **`assets/fonts/`** — self-hosted `woff2` files for Cormorant Garamond (300/400/400-italic/500) and Inter (300/400/500/600), each in `latin` and `latin-ext` variants.
- **`assets/img/`** — favicon (`favicon.svg`) and the Open Graph share image (`og-image.png`). The hero visual is a CSS-driven background layer plus an inline SVG motif — there are no `<img>` tags on either page, which removes an entire category of image-related layout shift by construction.

## Localization System

Translations are not scattered through the markup — they live in one place, `assets/js/i18n.js`, as a flat dictionary keyed by string identifier:

```js
window.VALERIS_I18N = {
  en: {
    'hero.line1': "We don't sell consulting.",
    'hero.ctaPrimary': 'Explore Services',
    // …
  },
  pl: {
    'hero.line1': 'Nie sprzedajemy konsultingu.',
    'hero.ctaPrimary': 'Zobacz usługi',
    // …
  }
};
```

Markup never contains hard-coded copy for either language — it references a key:

```html
<h1 class="hero-title" data-i18n="hero.line1">We don't sell consulting.</h1>
```

The English text inside the tag is a static fallback (so the page is fully readable even if JavaScript fails to load), not the rendered source of truth. On load, `main.js` reads the active language, walks every `[data-i18n]` element, and replaces its text content — or, for elements flagged with `data-i18n-attr`, a specific attribute (used for `<meta name="description">`) — with the matching dictionary value.

Language switching is a pure data operation: clicking `EN` / `PL` updates `document.documentElement.lang`, persists the choice, and re-runs the same substitution pass. No element is added, removed, or repositioned, so there is no layout recalculation beyond the text reflow itself — switching languages mid-session produces no visible flash or jump.

## Responsive Design

The CSS is written mobile-first: base rules in `styles.css` target the smallest viewport, and successive `min-width` blocks layer on refinements for tablet and desktop rather than the reverse. This keeps the common case (a phone on a slow connection) the cheapest one to compute.

Layout behavior is verified, not assumed, at the breakpoints that actually break things in practice:

- **320–414px** — phones. Stacked layout, full-width CTAs, compressed vertical rhythm.
- **641px and up** — tablet/desktop. A dedicated rhythm tier tightens hero spacing (top padding, heading margins, stat-bar padding) so above-the-fold content — including the metrics row and scroll indicator — clears common laptop viewport heights (864–900px) without touching typography or animation.
- **1920px and beyond** — the hero's `justify-content: center` takes over once content height drops below the viewport, recentering the block in the extra space instead of leaving it pinned to the top with dead space below.

The mobile breakpoint (`max-width: 640px`) and the desktop tier (`min-width: 641px`) partition the viewport range exactly, with no shared boundary value — a spacing change scoped to one can never leak into the other.

## Performance Considerations

- **No render-blocking JavaScript** — all three scripts (`config.js`, `i18n.js`, `main.js`) load with `defer`.
- **Critical fonts preloaded** — only the two font files used in the hero's first paint are preloaded; the rest load on demand via `font-display: swap`, avoiding a render-blocking webfont chain.
- **Subset-split fonts** — `latin` / `latin-ext` splitting means a Polish reader's browser isn't forced to download Latin-extended glyph data it will use, while an English reader isn't forced to download it either way — `unicode-range` lets the browser fetch only what the rendered text requires.
- **No layout-shift surface** — no `<img>` tags, an absolutely-positioned `inset: 0` photo layer prepared for future imagery, and an inlined critical background color to prevent a white flash before the stylesheet parses.
- **Passive, observer-driven interactivity** — the scroll listener is registered `{ passive: true }`; all reveal and scroll-spy behavior runs through `IntersectionObserver` instead of polling scroll position on every frame.
- **No framework runtime** — no virtual DOM, no hydration, no client-side router. The cost of the JavaScript layer is `main.js` plus `i18n.js`, both small, both deferred.

## SEO Implementation

- Canonical URL, `hreflang` alternates (`en`, `pl`, `x-default`) and a matching `sitemap.xml` entry, kept consistent across both pages and pointed at one production domain.
- `Organization` JSON-LD structured data — name, URL, logo, description, contact details, `knowsLanguage`, `areaServed` — populated only with facts that were actually supplied; unverifiable fields (founding date, social profiles) are omitted rather than fabricated.
- Open Graph and Twitter Card metadata on every page, including explicit `og:image:width` / `og:image:height` to avoid a layout guess on the consuming platform's side.
- `robots.txt` permitting full crawl, pointing at the sitemap; `meta name="robots"` set to `index, follow, max-image-preview:large`.
- One `<h1>` per page, a heading hierarchy that never skips a level, and descriptive, keyworded `<title>` / meta description pairs per page rather than a single generic pair reused everywhere.

## Accessibility Implementation

- A working skip-link (`Skip to content` → `#main`) as the first focusable element on the page.
- A global `:focus-visible` style (2px outline, offset, rounded) applied consistently — no interactive element relies on the browser's default outline or, worse, suppresses it.
- All decorative SVGs and icon glyphs marked `aria-hidden="true"`; all functional icon-only controls (hamburger, language toggle) carry explicit `aria-label`, `aria-expanded`, `aria-pressed` or `aria-controls` as appropriate.
- The mobile navigation and language switch are fully keyboard-operable, with state (`aria-expanded`, `aria-pressed`) kept in sync with visual state.
- The contact form's status region uses `role="status" aria-live="polite"` so submission feedback is announced without stealing focus.
- All entrance animation respects `prefers-reduced-motion`; nothing in the motion system is required to understand or operate the page.

## Design System

The design language is restrained and editorial — closer to a professional services firm's site than a consumer product. Every token lives in `:root` in `styles.css`:

```css
:root {
  /* color */
  --navy-deep: #071917;   /* primary dark field */
  --navy-mid:  #113632;   /* dark teal-green bands */
  --canvas:    #F1E4D1;   /* light sections */
  --accent:    #C19559;   /* brand gold */
  --green:     #2F5C3F;   /* secondary accent */

  /* type */
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-body:    'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* motion */
  --ease-reveal: cubic-bezier(0.2, 0, 0.1, 1);
  --t-reveal:    0.65s var(--ease-reveal);

  /* layout */
  --header-h: 70px;
  --maxw:     1180px;
}
```

Typography pairs a serif display face (Cormorant Garamond) for headlines against a grotesque sans (Inter) for body copy and UI text — a deliberate split between an editorial register for messaging and a neutral, highly legible register for everything functional. Motion is limited to entrance reveals, a one-time hero counter, and hairline stroke-draws; hover states are flat color/opacity transitions only — no lift, scale, glow or 3D transform — by design, to keep the register closer to an advisory firm than a product launch page.

## Folder Structure

```
.
├── index.html                  Primary landing page
├── pharma.html                 Pharma export-readiness vertical
├── robots.txt
├── sitemap.xml
├── LICENSE
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── styles.css          Design tokens + components + responsive rules
│   │   └── fonts.css           @font-face declarations, subset-mapped
│   ├── js/
│   │   ├── config.js           Deployment-time constants (GA4, CRM, canonical origin)
│   │   ├── i18n.js             EN/PL content dictionary
│   │   └── main.js             Language engine, nav, reveals, form handling
│   ├── fonts/                  Self-hosted woff2 (Cormorant Garamond, Inter)
│   └── img/                    favicon.svg, og-image.png
│
├── apps-script/
│   └── Code.gs                 Google Apps Script — contact-form → Sheet CRM bridge
│
├── docs/
│   └── specs/                  Build specifications / design history
│
└── dist/                       Deploy bundle — mirrors the above, synced on each release
```

`dist/` is a plain mirror of the production-relevant files (`index.html`, `pharma.html`, `assets/`). It exists because deployment in this project is a file copy, not a build — there is no compiler step to regenerate it automatically, so it is kept in sync manually before each deploy.

## Deployment

The site is static output — no build step, no environment variables required to render correctly. Deployment is a matter of pointing a static host at the repository root (or at `dist/`, which mirrors it).

### Vercel

```bash
npm i -g vercel
vercel        # preview deployment
vercel --prod # production deployment
```

No `vercel.json` is required for a default static deployment; if you introduce custom headers or redirects later, add one at the repository root.

### Any static host

```bash
# the entire deployable surface is:
index.html
pharma.html
robots.txt
sitemap.xml
assets/
```

Upload those paths as-is to GitHub Pages, Netlify, S3 + CloudFront, or any host capable of serving static files.

### Pre-deploy checklist

1. Set `canonicalBase` in `assets/js/config.js` to the confirmed production domain.
2. Set `ga4Id` if analytics is required for this deployment; leave empty to ship with zero third-party requests.
3. Set `crmEndpoint` to the deployed Google Apps Script Web App URL if the contact form should write to a live Sheet.
4. Confirm `dist/` matches the project root (`diff -rq . dist --exclude=dist` from the repository root) before publishing.

## Local Development

No build tooling is required — any static file server will do.

```bash
git clone https://github.com/magradzef-zick/valeris-website.git
cd valeris-website

# serve with any static server, e.g.:
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Edit `assets/css/styles.css`, `assets/js/*.js`, or either HTML file directly — no compilation or hot-reload pipeline is involved; refresh the browser to see changes.

### Git workflow

```bash
git checkout -b feature/short-description
# make changes
git add <specific files>
git commit -m "Tighten hero vertical rhythm for 1536x864 laptop viewports"
git push -u origin feature/short-description
# open a pull request against main
```

## Future Improvements

- Replace the placeholder `.hero-photo` layer with confirmed brand photography once supplied.
- Add a registered business address and company registration number to the footer once available — currently omitted rather than fabricated.
- Consider an automated visual-regression check (e.g. Playwright screenshot diffing) ahead of future spacing or typography changes, given how sensitive the hero is to viewport height.
- Evaluate a lightweight build step (asset hashing, minification) only if request volume or CDN strategy ever makes it worth the added complexity — not before.

## Author

**Valeris Group Private Limited**
Email: [agata@valeris.com.in](mailto:agata@valeris.com.in)
Phone: +48 697 751 377

---

<div align="center">

Licensed under the [MIT License](LICENSE).

</div>
