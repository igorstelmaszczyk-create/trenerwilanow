/* trenerwilanow.pl — loader wspólnego UI + zachowanie Consent Mode */
(function () {
  'use strict';

  var VERSION = '2026-08-19-v2';

  function addTheme() {
    if (document.querySelector('link[data-tw-theme]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/site-theme.css?v=' + VERSION;
    link.setAttribute('data-tw-theme', VERSION);
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

  addTheme();
  addScript('/site-ui.js', 'tw-site-ui');
  addScript('/consent-core.js', 'tw-consent-core');
})();
