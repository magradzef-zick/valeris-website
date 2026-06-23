# Polfrost — B2B Landing Page · Design & Technical Specification

**Document of record for the build.** Version 1.0 · 2026-06-20
Prepared by: Fares (Contractor) · Client: Polfrost Internationale Spedition Sp. z o.o.
Status: **Awaiting client approval before implementation.**

---

## 1. Purpose & success metric

Deliver a single, bilingual (EN/PL), production-ready B2B landing page that repositions Polfrost from "transport vendor" to **strategic international logistics & trade partner**, with a clear **Europe ↔ India** growth narrative.

**Primary success metric (client-stated):** the final experience must match the **quality, sophistication, spacing, typography, interaction quality and perceived value** of the approved Valeris reference — while remaining **unmistakably Polfrost** (Polfrost brand palette as the foundation, *not* the Valeris green/gold).

> Guiding principle: *Do not reinvent.* Recreate the approved Valeris experience as the best possible **Polfrost** version of it.

---

## 2. Scope (binding) & out-of-scope

Scope is governed by the signed Service Agreement (Contract No. 001/2026). This spec must not exceed it.

**In scope**
- One responsive single-page site, bilingual PL/EN with language toggle.
- Adaptation of the approved reference structure to Polfrost brand + content.
- UI/UX refinement, premium motion, smooth scroll.
- Contact/enquiry form with validation + confirmation feedback.
- Google Sheets CRM capture (name, email, phone, message, UTM source/medium/campaign, referrer, page URL, timestamp, browser, device, language).
- GA4 + form-submission event tracking.
- Basic SEO: meta title/description, Open Graph, canonical, robots.txt, JSON-LD Organization schema.
- Performance: image compression, lazy loading, asset minification.
- Static deployment to client's own hosting (cPanel/FTP).
- 2 structured revision rounds.

**Out of scope** (Change Order required): new sections/pages, copywriting beyond what the Contractor generates here, professional photography/graphic design, additional languages beyond PL/EN, advanced CRM (HubSpot/Pipedrive), email automation, paid-ads setup, blog/CMS, advanced SEO audit, cookie-consent/privacy-policy authoring beyond a basic placeholder.

---

## 3. Brand foundation

### 3.1 Asset status (action required)
The official Polfrost **vector logo** and **exact brand hex codes** were **not** among the files provided (the attached brand assets are Valeris). The Polfrost-branded source available is the **proposal deck**, plus the live site's logo, which is a **white typographic wordmark** ("POLFROST", no icon).

**Decision:** Proceed using a Polfrost palette **derived from the proposal deck**, and render the logo as a clean typographic **POLFROST** wordmark. Official SVG logo + confirmed hex will be dropped in at handoff with **no rebuild** required (palette is centralized in CSS variables).

### 3.2 Palette (foundation — Polfrost, to be hex-confirmed)
Premium atmosphere is achieved through **navy depth, restraint, space, type and motion** — not through an imported accent color. Accent stays within Polfrost's **blue family** (no Valeris gold).

| Token | Proposed value | Role |
|---|---|---|
| `--navy` | `#0F1B2A` | Primary dark anchor (hero, dark sections, footer) |
| `--navy-deep` | `#0B1622` | Deepest background layer / overlays |
| `--blue` | `#1D4ED8` | Polfrost primary — CTAs, active states, key accents |
| `--blue-bright` | `#2563EB` | Hover / emphasis |
| `--azure` | `#5B8DEF` | Fine details, hairlines, highlights on dark |
| `--ink` | `#1E293B` | Body text on light |
| `--slate` | `#64748B` | Muted text |
| `--canvas` | `#EEF2F8` | Light section background (cool, corporate) |
| `--canvas-2` | `#F5F7FB` | Alternate light background |
| `--white` | `#FFFFFF` | Cards, surfaces |
| `--line` | `rgba(29,78,216,0.16)` | Hairline borders |

*If Polfrost's official identity includes a secondary/accent (e.g., a specific red or metallic), it will be slotted into `--accent` on confirmation.*

### 3.3 Typography (open-source only)
Loew Next Arabic (specified in the Valeris brand) is **commercial** and is **excluded** per the license rule. Open-source substitutes that carry the premium feel:

- **Display:** **Cormorant Garamond** (SIL OFL) — the exact serif that gave the approved reference its premium character; used for H1/H2 and large numerals.
- **Body / UI:** **Inter** (SIL OFL) — executive, highly legible, closer to the McKinsey/Maersk references than DM Sans.
- Loaded via Google Fonts with `preconnect` + `display=swap`; weights limited to what's used (e.g., Cormorant 300/400/500; Inter 400/500/600) for performance.
- *Tunable:* emphasis can shift more sans-forward (DHL-corporate) vs. serif-led (luxury-consulting) on request.

### 3.4 Logo treatment
Typographic **POLFROST** wordmark (uppercase, tracked) in the nav and footer, sized and spaced to read as a mark. Swap-in slot reserved for the official SVG (color version on light surfaces, white version on navy).

---

## 4. Voice & content strategy

- **All copy generated by the Contractor.** No lorem ipsum, no placeholders, no generic AI filler.
- **EN is primary; PL is native-grade B2B Polish** (adapted, not literal machine translation).
- Tone: calm executive authority — concrete nouns, no hype. McKinsey/Maersk register.
- **Honesty rules (client-confirmed):**
  - **India = "Emerging Strategic Chapter."** Present Europe↔India as a strategic growth focus **built on** Polfrost's existing 30-year multimodal expertise — **not** a claim of long-established India operations.
  - **No fabricated clients, metrics, or results.** The case-study slot is replaced by **capability-based proof points** (see §5.7). Any hard figure must be either defensible from public record or **confirmed by the client** before it ships (marked as such).
  - **Single Polfrost voice.** Valeris is **not** named or shown as a partner brand anywhere. The Europe↔India offering is presented as Polfrost's own.

---

## 5. Information architecture (single page)

Sticky nav + 9 content sections + footer. Each section funnels toward one action: the contact form.

### 5.1 Navigation
Slim sticky bar, blurred navy backdrop. POLFROST wordmark · anchor links (About · Services · Europe ↔ India · Why Polfrost · Contact) · **EN/PL toggle** · primary **Contact** CTA. Mobile: hamburger → full-width overlay.

### 5.2 Hero — *Europe ↔ India bridge*
Full-height navy section. Eyebrow ("Europe ⇄ India · International Logistics & Trade"), a strong H1 with **one emphasized accent word**, a one-paragraph subheadline, two CTAs (primary "Start a conversation" + outline "Explore services"), and a **stat row** (e.g., *Since 1996 · 4 transport modes · Europe–Asia network*). Subtle background motif: faint geographic/route lines (CSS/SVG, low opacity) echoing the reference's restraint. Entrance: staggered fade/translate; respects `prefers-reduced-motion`.

### 5.3 USP strip
4 trust pillars on a contrasting band: **Since 1996 · Multimodal (road/rail/sea/air) · Temperature-controlled specialist · Customs & compliance**. Icon + title + one line each (line-art icons, open-source set, e.g. Lucide/Feather — MIT).

### 5.4 About
Founded **1996**, Warsaw HQ; group hubs in **Poland, Ukraine, Kazakhstan**; ~30 years building an international logistics network. Positions Polfrost as established, credible, partner-grade.

### 5.5 Services (numbered grid)
8 cards, reference-style hover-reveal: **Rail Logistics** (incl. China–Europe, own wagon fleet, 1435/1520 mm gauge) · **Sea Freight** (FCL/LCL) · **Air Freight** · **Road & Reefer** (temperature-controlled) · **Project Cargo** · **Customs & Compliance** · **Supply-Chain Consulting** · **Europe–India Business Development**.

### 5.6 Europe ↔ India (centerpiece)
Storytelling section, premium layout + motion. Narrative: **Europe → Polfrost → India** as a strategic corridor — sourcing, manufacturing, trade routes, market entry, logistics infrastructure, partnerships. Framed as consulting/strategy, not transport. Two-direction cards (EU→IN / IN→EU) consistent with reference structure, in Polfrost voice.

### 5.7 Capability metrics band *(replaces case study)*
Confident, 100% defensible proof points — **no invented numbers**. Baseline set: **Since 1996 · 4 transport modes · 3 country hubs (PL/UA/KZ) · China–Europe rail with own wagons · Temperature-controlled specialist · Sectors: food, pharma, construction, energy**. Any additional quantitative metric (TEU/year, countries served, shipments) is left as a **client-confirm** slot and only added once provided.

### 5.8 Why Polfrost
6 cards: **30 years of experience · International network · Multimodal expertise · Consulting mindset · End-to-end support · Reliability & compliance**. Bordered cards on navy (reference pattern), Polfrost-blue accents.

### 5.9 Contact
Dark section, centered. Fields: **Name · Company · Email · Phone · Message** + service-interest select. Inline validation + success confirmation. Submits to Google Sheets CRM; fires GA4 `generate_lead`. Privacy microcopy line.

### 5.10 Footer
Enterprise footer: POLFROST wordmark + descriptor, quick links, and **real registered details from the contract** — Tyniecka 27/2, 02-615 Warsaw; NIP 5261063249; KRS 0000097522; REGON 011883175. Language toggle mirror, copyright, EN/PL legal links (placeholders pending content).

---

## 6. Interaction & motion

- **Reveal on scroll:** IntersectionObserver adds a `visible` class; opacity + translateY, staggered by index. (Same proven pattern as the approved reference.)
- **Hovers:** restrained — arrow nudges, hairline/border transitions, subtle background lifts. No flashy effects.
- **Smooth scroll** for in-page anchors; sticky-nav offset handled.
- **Hero ambient motion:** slow, low-amplitude line/gradient drift only.
- **Accessibility:** all motion gated behind `@media (prefers-reduced-motion: reduce)`; no motion essential to comprehension.

---

## 7. Technical architecture

### 7.1 Stack & structure (static, no build required to run)
Hand-crafted **HTML5 + CSS3 + vanilla JS**. No Node/Vercel/server runtime. Deployable by copying files to cPanel/FTP.

```
/ (web root)
  index.html
  robots.txt
  sitemap.xml
  assets/
    css/styles.css          # design system + all sections
    js/i18n.js              # EN/PL content dictionary
    js/main.js              # toggle, reveal observer, nav, form, GA4 hooks
    img/                    # logo (official SVG slot), OG image, optimized media
  docs/specs/…              # this document (not deployed)
```
*Modern tooling may be used during development (e.g., local minify), but the delivered artifact is plain static files.*

### 7.2 Bilingual (i18n) approach
Single DOM, two content sets. Elements tagged `data-i18n="key"` (and `data-i18n-attr` for placeholders/aria). `i18n.js` holds `{ en: {...}, pl: {...} }`. Toggle: swaps text nodes, sets `<html lang>`, updates `<title>`/meta, persists choice to `localStorage`, and reflects in URL hash or `?lang=` (optional). EN default; PL fully authored. Architecture supports adding languages later (Change Order).

### 7.3 CRM — Google Sheets
Form posts (fetch, no page reload) to a **Google Apps Script Web App** endpoint bound to the client's Sheet, appending one row per submission with all fields in §2 (incl. UTM/referrer/timestamp/device/browser/language captured client-side). Endpoint URL is config-swappable. No third-party CRM, no subscription. Graceful success/error UX.

### 7.4 Analytics — GA4
`gtag.js` + `dataLayer` loaded with a config-swappable Measurement ID. Events: `generate_lead` on successful submit; optional `service_click`. GTM-ready (container can replace direct gtag without markup changes).

### 7.5 SEO
Semantic landmarks (`header/nav/main/section/footer`, one H1), bilingual `<title>`/meta-description, Open Graph + Twitter card, canonical URL, `hreflang` alternates (pl/en), `robots.txt`, `sitemap.xml`, and **JSON-LD `Organization`** (legal name, address, identifiers, logo, sameAs). Descriptive `alt` text.

### 7.6 Performance (target Lighthouse ≥ 90)
Minified CSS/JS; deferred non-critical JS; system-font fallback + `font-display: swap`; responsive images (`srcset`/WebP) + `loading="lazy"` below the fold; inline critical CSS for first paint; minimal DOM; no heavy libraries (icons inlined as SVG).

### 7.7 Accessibility
WCAG-minded: AA contrast (validated once final hex confirmed), visible focus states, keyboard-operable nav/toggle/form, `aria-label`s on icon controls, labeled inputs, reduced-motion support, logical heading order.

### 7.8 Responsive
Mobile-first. Breakpoints ≈ 640 / 900 / 1200px. Touch targets ≥ 44px. Grids collapse to single column; nav → overlay; hero scales via `clamp()`. Tested desktop/tablet/mobile across Chrome, Firefox, Safari, Edge (per contract QA).

---

## 8. Deliverables & handover (per contract §8)
Live deployed bilingual page · responsive build · functional validated form · Google Sheets CRM connected to client's account · GA4 property with form event · basic SEO (meta/OG/robots/schema) · **all source files (HTML/CSS/JS/images)** · handover doc (CRM link, GA4 ID, hosting notes, usage guide). Per §11.4, Contractor access to client systems is revoked at handover.

---

## 9. Open items / inputs needed from client
1. **Official Polfrost logo** (vector SVG/AI; color + white) and **confirmed brand hex codes**.
2. **Hosting access** (cPanel/FTP) + domain for deployment.
3. **Google account** for GA4 property + Sheets CRM ownership.
4. **Optional confirmed metrics** for §5.7 (else baseline defensible set ships).
5. **PL copy review** by a native stakeholder (Contractor authors; client validates tone).
6. Confirmation of contact details / inbox for lead notifications.

---

## 10. Build sequence (incremental, preview-gated)
1. **Spec approval** ← *current gate.*
2. **Vertical slice 1 — Nav + Hero** (palette, type, motion, i18n scaffold) → client validates premium direction.
3. Sections 3–6 (USP, About, Services, Europe↔India).
4. Sections 7–10 (Metrics, Why, Contact, Footer).
5. CRM + GA4 + SEO + JSON-LD wiring.
6. QA: responsive, a11y, performance, cross-browser; preview round.
7. Revision rounds ×2 → deployment + handover.

---

## 11. Assumptions
- Contract scope and pricing (2,300 PLN net) are unchanged; anything beyond §2 is a Change Order.
- Static hosting is available on the client's environment.
- Client provides assets per §9 within the contract's asset-provision window.
- Stock/illustrative imagery, if used, will be open-source / commercially licensed and disclosed.
