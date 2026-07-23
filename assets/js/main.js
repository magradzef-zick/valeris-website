/* =================================================================
   VALERIS — Behaviour
   Language toggle · sticky nav + scroll-spy · mobile menu ·
   scroll reveal · contact form (validation + lead capture)
   Vanilla JS, no dependencies.
   ================================================================= */
(function () {
  'use strict';

  var DICT = window.VALERIS_I18N || { en: {}, pl: {} };
  var CONFIG = window.VALERIS_CONFIG || {};
  var CRM_ENDPOINT = CONFIG.crmEndpoint || '';   /* Google Apps Script Web App URL — set at deployment */
  var LANG_KEY = 'valeris_lang';
  var LANGS = ['en', 'pl'];

  /* india.html is English-only by design (Indian-company audience, not Polish visitors) —
     it never runs the language system, regardless of a stored/URL language preference. */
  var IS_INDIA_PAGE = (location.pathname.split('/').pop() || 'index.html') === 'india.html';

  var header = document.getElementById('siteHeader');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  /* ---------- language ---------- */
  function getInitialLang() {
    var fromUrl = (location.search.match(/[?&]lang=(en|pl)/i) || [])[1];
    if (fromUrl) return fromUrl.toLowerCase();
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    var sys = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return sys === 'pl' ? 'pl' : 'en';
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'en';
    var table = DICT[lang] || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = table[key];
      if (val == null) return;
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) { el.setAttribute(attr, val); } else { el.textContent = val; }
    });
    document.documentElement.lang = lang;
    var titleEl = document.querySelector('title[data-i18n]');
    var titleKey = titleEl ? titleEl.getAttribute('data-i18n') : 'meta.title';
    if (table[titleKey]) { document.title = table[titleKey]; }
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      var active = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    /* Re-render the CRM-driven interest options (built from data-label-en/pl
       attributes, not data-i18n keys — see loadServices() below) for the new
       language. A no-op until loadServices() has actually replaced the
       static list, and a no-op again if it never does (fetch failed). */
    if (typeof refreshServiceOptionLabels === 'function') { refreshServiceOptionLabels(lang); }
  }
  window.__valerisT = function (key) { var l = document.documentElement.lang || 'en'; return (DICT[l] || DICT.en)[key] || (DICT.en[key] || key); };

  if (!IS_INDIA_PAGE) {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });
  }

  /* ---------- sticky nav ---------- */
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- analytics events (GA4 / dataLayer, opt-in through config.js) ---------- */
  function trackEvent(name, params) {
    params = params || {};
    if (typeof window.gtag === 'function') { window.gtag('event', name, params); }
    if (window.dataLayer) {
      var payload = { event: name };
      for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k]; }
      window.dataLayer.push(payload);
    }
  }

  /* ---------- mobile menu ---------- */
  if (hamburger && navLinks) {
    var closeMobileMenu = function () {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) closeMobileMenu();
    });
  }

  /* ---------- scroll-spy (active nav link) ---------- */
  var navMap = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') navMap[href.slice(1)] = a;
  });
  var spyEls = Object.keys(navMap).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && spyEls.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navMap).forEach(function (id) { navMap[id].classList.remove('is-current'); });
        if (navMap[en.target.id]) navMap[en.target.id].classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyEls.forEach(function (el) { spy.observe(el); });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.dataset.revealDelay ? parseInt(el.dataset.revealDelay, 10) : Math.min(i * 70, 280);
        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- service accordions ---------- */
  document.querySelectorAll('.row-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.service-row');
      if (!row) return;
      var open = row.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var title = row.querySelector('.row-title');
        trackEvent('service_click', { service: title ? title.textContent.trim() : '', page: thisPage });
      }
    });
  });

  document.querySelectorAll('a[href*="pharma.html"]').forEach(function (a) {
    a.addEventListener('click', function () {
      trackEvent('pharma_click', { page: thisPage });
    });
  });

  /* ---------- hero numeral count-up (hero stats only, runs once) ---------- */
  var statNums = document.querySelectorAll('.hero-stats .stat-num');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (statNums.length && !reduceMotion) {
    var countUp = function (el) {
      var target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      var start = null;
      var duration = 700;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
      }
      requestAnimationFrame(tick);
    };
    /* Hero content loads with the page (not scroll-triggered), so the count-up
       runs on a fixed delay matching the hero's own entrance timing, rather
       than IntersectionObserver — the stat bar can sit right at the fold on
       common viewport heights and never cross a scroll-based threshold. */
    if (document.querySelector('.hero-stats')) {
      setTimeout(function () { statNums.forEach(countUp); }, 550);
    } else {
      statNums.forEach(countUp);
    }
  }

  /* ---------- page transition: index <-> pharma <-> india (200ms fade) ---------- */
  var thisPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    var hrefPage = href.split('#')[0].split('?')[0].split('/').pop();
    if (hrefPage !== 'index.html' && hrefPage !== 'pharma.html' && hrefPage !== 'india.html') return;
    if (hrefPage === thisPage) return;   /* same document — no cross-page transition needed */
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      if (reduceMotion) return;   /* navigate immediately, no artificial delay */
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { window.location.href = href; }, 200);
    });
  });

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var interestSelect = document.getElementById('cf-interest');

  /* ---------- CRM-driven "I'm interested in" options ----------
     The dropdown ships with a static, hardcoded list (see index.html) so the
     form always works even if this fetch fails, is slow, or Apps Script is
     down — that static list is the graceful-degradation fallback, not dead
     markup. When the CRM's live, admin-managed service list loads, it
     replaces the static <option>s (values are stable keys the CRM controls,
     same idea as the pre-existing options — see index.html's own value=
     attributes). Adding/renaming/removing/reordering a service from the CRM
     needs no website code change and no deploy, per the brief. */
  function refreshServiceOptionLabels(lang) {
    if (!interestSelect || !interestSelect.hasAttribute('data-crm-driven')) return;
    Array.prototype.forEach.call(interestSelect.options, function (opt) {
      if (opt.value === '') return; // "Select a service…" placeholder stays on data-i18n
      var label = lang === 'pl' ? opt.getAttribute('data-label-pl') : opt.getAttribute('data-label-en');
      if (label) opt.textContent = label;
    });
  }

  function loadServices() {
    if (!interestSelect || !CRM_ENDPOINT) return;
    var sep = CRM_ENDPOINT.indexOf('?') === -1 ? '?' : '&';
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 4000); });
    var lookup = fetch(CRM_ENDPOINT + sep + 'action=getServices', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });

    Promise.race([lookup, timeout]).then(function (json) {
      var services = (json && json.ok && json.data && Array.isArray(json.data.services)) ? json.data.services : null;
      if (!services || !services.length) return; // fetch failed/empty/timed out — keep the static list

      var lang = document.documentElement.lang === 'pl' ? 'pl' : 'en';
      var previousValue = interestSelect.value;
      var placeholder = interestSelect.querySelector('option[value=""]');

      while (interestSelect.firstChild) { interestSelect.removeChild(interestSelect.firstChild); }
      if (placeholder) interestSelect.appendChild(placeholder);
      services.forEach(function (svc) {
        if (!svc || !svc.key) return;
        var opt = document.createElement('option');
        opt.value = svc.key;
        opt.setAttribute('data-label-en', svc.label || svc.key);
        opt.setAttribute('data-label-pl', svc.label_pl || svc.label || svc.key);
        opt.textContent = lang === 'pl' ? (svc.label_pl || svc.label || svc.key) : (svc.label || svc.key);
        interestSelect.appendChild(opt);
      });
      interestSelect.setAttribute('data-crm-driven', 'true');

      if (previousValue) {
        var stillExists = Array.prototype.some.call(interestSelect.options, function (o) { return o.value === previousValue; });
        if (stillExists) interestSelect.value = previousValue;
      }
    });
  }

  function setStatus(msg, cls) { if (!statusEl) return; statusEl.textContent = msg; statusEl.className = 'form-status' + (cls ? ' ' + cls : ''); }
  function emailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* Letters (any script — this business serves both Polish and Indian contacts,
     so Devanagari etc. must be accepted, not just Latin/accented-Latin), spaces,
     apostrophes and hyphens only. \p{M} covers combining diacritics entered as
     separate code points. Requires at least one actual letter (rejects "-" or "'"
     alone). Mirrors the HTML pattern= on the inputs (used only for the native
     :user-invalid style hook — this function is the actual authority). */
  var NAME_RE = /^[\p{L}\p{M}' -]+$/u;
  var HAS_LETTER_RE = /\p{L}/u;
  function nameValid(v) { return NAME_RE.test(v) && HAS_LETTER_RE.test(v); }

  /* Digits, +, -, spaces and parentheses only — no letters. */
  var PHONE_RE = /^[0-9+\-() ]+$/;
  function phoneValid(v) { return PHONE_RE.test(v); }

  function detectBrowser_(ua) {
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua) || /Opera/.test(ua)) return 'Opera';
    if (/CriOS\//.test(ua)) return 'Chrome (iOS)';
    if (/FxiOS\//.test(ua)) return 'Firefox (iOS)';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
    return 'Other';
  }

  function detectOS_(ua) {
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Other';
  }

  function collectMeta() {
    var p;
    try { p = new URLSearchParams(location.search); } catch (e) { p = { get: function () { return ''; } }; }
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var ua = navigator.userAgent || '';
    return {
      utm_source: p.get('utm_source') || '', utm_medium: p.get('utm_medium') || '', utm_campaign: p.get('utm_campaign') || '',
      utm_term: p.get('utm_term') || '', utm_content: p.get('utm_content') || '',
      referrer: document.referrer || '', page_url: location.href,
      timestamp: new Date().toISOString(),
      timezone: tz,
      language: document.documentElement.lang || 'en',
      device: /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop',
      browser: detectBrowser_(ua),
      operating_system: detectOS_(ua),
      user_agent: ua
    };
  }

  /* Best-effort, non-blocking IP/geo lookup so leads carry IP address, country
     and city. Apps Script web apps have no way to see the caller's IP server-
     side at all (a hard platform limitation — there is no equivalent of a
     REMOTE_ADDR in the request object), so a client-side lookup is the only
     way to capture it at all. Key-free, HTTPS, no account needed. Any failure
     (network down, ad-blocker, CORS, timeout) resolves to empty strings rather
     than blocking or meaningfully delaying the actual lead submission. */
  function fetchGeoInfo() {
    var empty = { ip_address: '', country: '', city: '' };
    if (typeof fetch !== 'function') return Promise.resolve(empty);
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(empty); }, 2500); });
    var lookup = fetch('https://ipwho.is/', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (j) {
        if (!j || j.success === false) return empty;
        return { ip_address: j.ip || '', country: j.country || '', city: j.city || '' };
      })
      .catch(function () { return empty; });
    return Promise.race([lookup, timeout]);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var T = window.__valerisT;
      var firstName = form.first_name ? form.first_name.value.trim() : '';
      var lastName = form.last_name ? form.last_name.value.trim() : '';
      var name = (firstName + ' ' + lastName).trim();
      var email = form.email.value.trim(), message = form.message.value.trim();
      var phone = form.phone ? form.phone.value.trim() : '';
      var honeypot = form.website ? form.website.value.trim() : '';

      if (honeypot) return;
      if (!firstName || !lastName || !email || !message) { setStatus(T('form.errorRequired'), 'is-error'); return; }
      if (!nameValid(firstName) || !nameValid(lastName)) { setStatus(T('form.errorName'), 'is-error'); return; }
      if (!emailValid(email)) { setStatus(T('form.errorEmail'), 'is-error'); return; }
      if (phone && !phoneValid(phone)) { setStatus(T('form.errorPhone'), 'is-error'); return; }

      /* Captured synchronously (before the async geo lookup below) so a field
         edited while "Sending…" is showing can't change what gets submitted. */
      var data = {
        first_name: firstName, last_name: lastName, name: name, company: form.company.value.trim(), email: email,
        phone: phone, interest: form.interest.value, message: message
      };
      var meta = collectMeta();
      for (var k in meta) { if (Object.prototype.hasOwnProperty.call(meta, k)) data[k] = meta[k]; }

      var btn = form.querySelector('.form-submit');
      setStatus(T('form.sending'), '');
      if (btn) btn.disabled = true;

      function done(ok) {
        if (btn) btn.disabled = false;
        if (ok) {
          setStatus(T('form.success'), 'is-success');
          form.reset();
          trackEvent('generate_lead', { method: 'contact_form', form: 'contact' });
        } else {
          setStatus(T('form.errorSend'), 'is-error');
        }
      }

      fetchGeoInfo().then(function (geo) {
        data.ip_address = geo.ip_address;
        data.country = geo.country;
        data.city = geo.city;

        if (CRM_ENDPOINT) {
          fetch(CRM_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
            .then(function () { done(true); })
            .catch(function () { done(false); });
        } else {
          /* CRM endpoint not configured — set crmEndpoint in assets/js/config.js at deployment. */
          if (window.console && console.warn) { console.warn('[Valeris] CRM endpoint not configured in config.js — submission not stored.'); }
          setTimeout(function () { setStatus(T('form.errorConfig'), 'is-error'); if (btn) btn.disabled = false; }, 300);
        }
      });
    });
  }

  /* ---------- init ---------- */
  if (IS_INDIA_PAGE) {
    document.documentElement.lang = 'en';
  } else {
    applyLang(getInitialLang());
  }
  loadServices(); /* no-op on pages without #cf-interest (india.html, pharma.html) */
})();
