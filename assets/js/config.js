/* =================================================================
   VALERIS — Deployment configuration
   Edit these three values at deployment; everything else is wired.
   ================================================================= */
window.VALERIS_CONFIG = {
  /* Google Analytics 4 Measurement ID, e.g. 'G-XXXXXXXXXX'.
     Leave empty to disable analytics (no script loads). */
  ga4Id: '',

  /* Google Apps Script Web App URL bound to the client's Sheet.
     Leave empty and the contact form logs to console (testable) until set. */
  crmEndpoint: '',

  /* Final production origin (no trailing slash) — used only for reference.
     TBD: business card uses valeris.com.in, content brief uses valeris.com — confirm final domain before launch. */
  canonicalBase: 'https://www.valeris.com.in'
};

/* GA4 loader — only runs when a Measurement ID is configured. */
(function () {
  var id = window.VALERIS_CONFIG.ga4Id;
  if (!id) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
})();
