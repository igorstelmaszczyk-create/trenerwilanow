/* trenerwilanow.pl — wspólne zachowanie UI v2 */
(function () {
  'use strict';

  var PHONE = '48537918161';
  var WA_TEXT = 'Cześć Igor, chcę umówić bezpłatną konsultację. Imię: __, cel: __';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function updateThemeMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', '#145f2a');
  }

  function cleanOldPromiseMeta() {
    var metas = document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]');
    for (var i = 0; i < metas.length; i++) {
      var content = metas[i].getAttribute('content') || '';
      if (content.indexOf('Odpowiadam tego samego dnia') !== -1) {
        metas[i].setAttribute(
          'content',
          content.replace('Odpowiadam tego samego dnia.', 'Skontaktuję się z Tobą po otrzymaniu zgłoszenia.')
        );
      }
    }
  }

  function makeGlobalCta() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    var excluded = path === '/umow-konsultacje' || path === '/polityka-prywatnosci';
    if (excluded) return null;

    var cta = document.querySelector('.mobile-cta-bar');
    if (!cta) {
      cta = document.createElement('div');
      cta.className = 'mobile-cta-bar tw-global-cta';
      cta.setAttribute('aria-label', 'Szybki kontakt');

      var consult = document.createElement('a');
      consult.className = 'mobile-cta-primary';
      consult.href = '/umow-konsultacje/';
      consult.textContent = 'Umów konsultację';

      var wa = document.createElement('a');
      wa.className = 'mobile-cta-wa';
      wa.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(WA_TEXT);
      wa.target = '_blank';
      wa.rel = 'noopener noreferrer';
      wa.textContent = 'WhatsApp';

      cta.appendChild(consult);
      cta.appendChild(wa);
      document.body.appendChild(cta);
    }

    document.body.classList.add('tw-has-mobile-cta');
    return cta;
  }

  function setupMobileCta(cta) {
    if (!cta) return;

    var mq = window.matchMedia('(max-width: 680px)');
    var sentinel = document.getElementById('hero');

    if (!sentinel) {
      var main = document.querySelector('main');
      sentinel = main ? main.querySelector('section') : null;
    }

    var visible = false;

    function setVisible(next) {
      next = !!next && mq.matches;
      if (next === visible) return;
      visible = next;
      cta.classList.toggle('tw-visible', visible);
      document.body.classList.toggle('tw-mobile-cta-visible', visible);
    }

    function fallbackScroll() {
      setVisible(window.scrollY > Math.max(420, window.innerHeight * 0.72));
    }

    var observer = null;
    if ('IntersectionObserver' in window && sentinel) {
      observer = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        if (!entry) return;
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      }, { threshold: 0.02 });
      observer.observe(sentinel);
    } else {
      window.addEventListener('scroll', fallbackScroll, { passive: true });
      fallbackScroll();
    }

    function onMediaChange() {
      if (!mq.matches) {
        setVisible(false);
      } else if (!observer) {
        fallbackScroll();
      }
    }

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onMediaChange);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(onMediaChange);
    }
  }

  ready(function () {
    document.documentElement.classList.add('tw-theme-v2');
    updateThemeMeta();
    cleanOldPromiseMeta();
    setupMobileCta(makeGlobalCta());
  });
})();
