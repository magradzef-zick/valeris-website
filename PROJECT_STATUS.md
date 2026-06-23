# Polfrost — Project Status

**Client:** Polfrost Internationale Spedition Sp. z o.o. · **Contract:** No. 001/2026
**Deliverable:** One bilingual (PL/EN) static B2B landing page · **Contractor:** Fares
**Last updated:** 2026-06-21

> Living status doc for cross-session continuity. Spec of record: `docs/specs/2026-06-20-polfrost-landing-page-design.md`.

---

## ⚑ v2.0 BRAND RESET → VALERIS (2026-06-22)
Source of truth changed from Polfrost to **Valeris**. Re-skinned the whole framework to the Valeris brand palette (deep green `#071917/#0B211D/#12332C` · gold `#C19559` · warm cream `#F1E4D1` · forest green `#2F5C3F`) — all centralized in CSS vars. Gold is now the action+highlight accent (buttons = gold bg + deep-green text); light sections are warm cream (was cool blue-gray). Wordmark POLFROST→**VALERIS** (nav+footer), lighter/wider-tracked. Favicon = cream V + gold teardrop on green. OG image regenerated (green/gold, VALERIS). Header/nav/overlay/shadows recolored. Lighthouse held D100/M90, A11y 100 (no contrast failures), CLS 0.
**Content untouched** (temporary, client-replaced): body copy, nav "Why Polfrost" label, footer legal (Polfrost Sp. z o.o./NIP/KRS), meta/OG text, JSON-LD. Typography still Cormorant+Inter (serif) — Valeris brand font is Loew Next Arabic (sans); decision pending.

## Stage
**Tech & QA COMPLETE + v1.1 luxury polish pass done** (contract §3). Build + SEO + analytics/CRM scaffolding + full QA + creative-director polish done. Awaiting client inputs to deploy (hosting, Google account/GA4, logo/hex).

## v1.3 Flagship refine + mobile pass (2026-06-21, client-requested)
Flagship: now content-height (removed stretched internal empty space); replaced abstract corner arc with an explicit labeled **Europe↔India corridor graphic** (emerald Europe node → gold arc → gold India node) in the lower area + subtle base glow → intentionally composed. Mobile pass: `text-wrap:balance` headings; mobile menu = larger touch targets + prominent full-width emerald Contact button + 44px hamburger; contact inputs 16px (no iOS zoom) + taller touch; metric numerals scaled for mobile; USP/why/ei padding tightened; lang-btn tap area. Lighthouse held (D100 / M91, CLS 0).

## v1.2 Services redesign (2026-06-21, client-requested)
Replaced the 8-card grid with an executive capability showcase: asymmetric split — a dark **Europe–India Development flagship** block (centerpiece, corridor-motif echo, gold tags, "Explore the corridor" link → #europe-india) beside the other 7 as an **editorial hairline list** (large serif names, gold numerals, premium row hover, no boxes). New i18n keys (EN+PL) added: services.flagshipLabel/flagshipLink/flagTag1-3. Lighthouse held (D100 / M90, CLS 0). Section self-assessed 7 → ~9.5.

## v1.1 polish (2026-06-21, CSS-only — no structural/copy/SEO/CRM change)
Services empty cell removed (feature card 08 spans, emphasizing strategic service) · subtle radial depth on dark/band sections · premium service-card hover (gold top-line) · USP gold seam + refined/animated icons · crisp Europe⇄India checkmarks · gold-up (fact labels → gold, emerald reserved for interaction) · heavier gold stat/metric numerals · luminous corridor arc · more generous section rhythm · layered CTA shadow. Lighthouse unchanged (D100/M89, CLS 0). Self-assessed 8.5 → ~9.3.

## Lighthouse (production-representative, with .htaccess compression)
- Desktop: Performance 100 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 0.7s, CLS 0)
- Mobile: Performance 89 · Accessibility 100 · Best Practices 100 · SEO 100 (LCP 3.2s, CLS 0)
- Mobile Perf is LCP-bound by the large serif hero + approved entrance animation under slow-4G/4×CPU emulation; real devices score higher. Not lowered further to preserve approved motion.

## Locked decisions
- **Stack:** hand-crafted static HTML/CSS/vanilla JS (cPanel/FTP deployable, no build/runtime).
- **Identity:** Navy base · **emerald = action/interaction** · **gold = restrained highlight only** (headline words, key stats, corridor motif, small decorative). Not luxury/finance.
- **Type:** Cormorant Garamond (display) + Inter (body) — both SIL OFL (Loew Next Arabic excluded as commercial).
- **Headline:** "More than logistics. *Expanding business* between Europe and India." (fast <3s Europe⇄India read).
- **India:** "Emerging Strategic Chapter" framing — built on 30y multimodal credibility, no fabricated India ops.
- **Case study:** replaced by capability-metrics band (no fabricated clients/metrics); architected so a real case study can be inserted later.
- **Voice:** single Polfrost voice — Valeris never named.

## Completed
- Approved spec (design + technical).
- Hero validated via 3-accent comparison → Green+Gold chosen.
- Full page: Nav · Hero · USP · About · Services(8) · Europe⇄India · Metrics · Why(6) · Contact · Footer.
- Bilingual EN/PL (native-grade) via `data-i18n` dictionary + persistent toggle.
- Premium motion (IO reveals, hero entrance, corridor motif), reduced-motion safe.
- Contact form: validation + lead enrichment + GA4/dataLayer + CRM hooks (config-gated).

## Remaining
1. **SEO/technical foundation** — canonical, hreflang, OG/Twitter, JSON-LD, robots.txt, sitemap.xml, favicon, OG image, config.js. *(in progress 2026-06-21)*
2. **Analytics** — GA4 ID + loader (needs client GA4).
3. **CRM** — Google Sheets via Apps Script endpoint (needs client Google account).
4. **QA** — CTA contrast→AA, strip `?cap` capture hook, cross-browser/device, performance/Lighthouse.
5. **Deployment** — hosting/domain, SSL, smoke test, handover doc.

## Risks
- Official Polfrost **logo (vector) + hex not provided** → typographic wordmark placeholder; palette derived from proposal deck (centralized in CSS vars → zero-rework swap).
- **CTA contrast** white-on-emerald ≈3.2:1 < AA → fix in QA.
- **Canonical domain** unconfirmed (defaulting to polfrost.com.pl).
- **`?cap` capture hook** present in styles.css/main.js (inert) → strip before handoff.

## Missing client inputs
- Logo (SVG/AI colour+white) + brand hex
- Hosting/domain (cPanel/FTP) access
- Google account for GA4 + Sheets CRM + GA4 Measurement ID
- Confirmed hard metrics (optional) for metrics band
- PL copy sign-off (native stakeholder)
- Lead-notification inbox

## Files
- `index.html` — full markup, 9 sections, data-i18n, contact form.
- `assets/css/styles.css` — design system, Green+Gold tokens, light/dark sections, motion, responsive.
- `assets/js/i18n.js` — EN/PL content dictionary (all copy).
- `assets/js/main.js` — language, nav/scroll-spy, mobile menu, reveal, form capture.
- `assets/js/config.js` — deployment config: GA4 id, CRM endpoint, canonical base (added 2026-06-21).
- `robots.txt`, `sitemap.xml`, `assets/img/favicon.svg`, `assets/img/og-image.png` — SEO/technical (added 2026-06-21).
- `apps-script/Code.gs` — Google Sheets CRM backend; client deploys as a Web App, then sets `crmEndpoint` (added 2026-06-21).
- `docs/specs/2026-06-20-polfrost-landing-page-design.md` — approved spec.

## Done 2026-06-21
SEO/technical foundation: canonical + hreflang, OG/Twitter, JSON-LD Organization, theme-color, favicon, robots.txt, sitemap.xml, branded OG image, `?lang` deep-links, `config.js` (GA4/CRM/canonical), GA4 loader (gated on id). CRM Apps Script provided.

**Full QA done:** WCAG AA contrast fixes (CTA → #16795A, muted/gold-ink deepened) → Accessibility 100; heading-order fixed; skip-link + focus-visible + keyboard nav; responsive verified (mobile/tablet/desktop); **fonts self-hosted** (GDPR + LCP) with preload; `.htaccess` (brotli/gzip + caching + security headers); all dev-only code removed (`?cap` hook, debug logging). Cross-browser: tested on Chromium; reviewed for WebKit/Gecko (no blocking features; -webkit- prefixes + graceful degradation in place).

New files this pass: `assets/css/fonts.css`, `assets/fonts/*.woff2` (16), `.htaccess`.

## Pre-deployment package 2026-06-21
- `dist/` — clean web-root deploy bundle (+ `polfrost-deploy.zip`, ~1.2 MB). Upload this; rebuild by copying index.html, robots.txt, sitemap.xml, .htaccess, assets/{css,js,fonts,img}.
- `review/CLIENT_REVIEW.md` + `review/screenshots/` (24 PNGs) — EN/PL full pages, every section, mobile, contact-form flow (empty/error/success), language switcher. NOT web-served.
- Minor cosmetic note for a revision round: Services 8-card grid leaves one empty cell at 3-wide widths (left as approved; can span card 08 or tune grid on request).

Remaining: CRM/GA4 live values + deploy (both client-input gated — see below).

## Deployment notes (for handover)
- Set `assets/js/config.js`: `ga4Id` (client GA4), `crmEndpoint` (Apps Script Web App URL), `canonicalBase` (final domain).
- Replace placeholder canonical/OG domain if not polfrost.com.pl.
- Drop official logo SVG into `assets/img/` and swap the nav wordmark; confirm hex in `:root`.
- Remove the `?cap` capture-mode block (styles.css + main.js) before final handoff.
