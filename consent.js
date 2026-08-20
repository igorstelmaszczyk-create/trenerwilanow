/* trenerwilanow.pl — loader wspólnego UI + zachowanie Consent Mode */
(function () {
  'use strict';

  var VERSION = '2026-08-20-v6';

  function addStylesheet(href, attrName) {
    if (document.querySelector('link[' + attrName + ']')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href + '?v=' + VERSION;
    link.setAttribute(attrName, VERSION);
    document.head.appendChild(link);
  }

  function addScript(src, id) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src + '?v=' + VERSION;
    script.async = false;
    document.head.appendChild(script);
  }

  addStylesheet('/site-theme.css', 'data-tw-theme');
  addStylesheet('/consent-compact.css', 'data-tw-consent-compact');
  addStylesheet('/paid-landing-cro.css', 'data-tw-paid-cro');
  addScript('/site-ui.js', 'tw-site-ui');
  addScript('/consent-core.js', 'tw-consent-core');
})();
