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

  function setStatus(msg, cls) { if (!statusEl) return; statusEl.textContent = msg; statusEl.className = 'form-status' + (cls ? ' ' + cls : ''); }
  function emailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function collectMeta() {
    var p;
    try { p = new URLSearchParams(location.search); } catch (e) { p = { get: function () { return ''; } }; }
    return {
      utm_source: p.get('utm_source') || '', utm_medium: p.get('utm_medium') || '', utm_campaign: p.get('utm_campaign') || '',
      referrer: document.referrer || '', page_url: location.href,
      timestamp: new Date().toISOString(),
      language: document.documentElement.lang || 'en',
      device: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      user_agent: navigator.userAgent
    };
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var T = window.__valerisT;
      var name = form.name.value.trim(), email = form.email.value.trim(), message = form.message.value.trim();

      if (!name || !email || !message) { setStatus(T('form.errorRequired'), 'is-error'); return; }
      if (!emailValid(email)) { setStatus(T('form.errorEmail'), 'is-error'); return; }

      var data = {
        name: name, company: form.company.value.trim(), email: email,
        phone: form.phone.value.trim(), interest: form.interest.value, message: message
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
          if (typeof window.gtag === 'function') { window.gtag('event', 'generate_lead', { method: 'contact_form' }); }
          if (window.dataLayer) { window.dataLayer.push({ event: 'generate_lead', form: 'contact' }); }
        } else {
          setStatus(T('form.errorSend'), 'is-error');
        }
      }

      if (CRM_ENDPOINT) {
        fetch(CRM_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
          .then(function () { done(true); })
          .catch(function () { done(false); });
      } else {
        /* CRM endpoint not configured — set crmEndpoint in assets/js/config.js at deployment. */
        if (window.console && console.warn) { console.warn('[Valeris] CRM endpoint not configured in config.js — submission not stored.'); }
        setTimeout(function () { done(true); }, 600);
      }
    });
  }

  /* ---------- init ---------- */
  if (IS_INDIA_PAGE) {
    document.documentElement.lang = 'en';
  } else {
    applyLang(getInitialLang());
  }
})();
