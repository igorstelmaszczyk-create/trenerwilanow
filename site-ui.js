/* trenerwilanow.pl — wspólne zachowanie UI v4 */
(function () {
  'use strict';

  var PHONE = '48537918161';
  var GA_ID = 'G-FBX8CDNETZ';
  var WA_TEXT = 'Cześć Igor, chcę umówić bezpłatną konsultację. Imię: __, cel: __';
  var ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'gbraid',
    'wbraid'
  ];

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function currentPath() {
    return location.pathname.replace(/\/+$/, '') || '/';
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

  function cleanOldPromiseCopy() {
    if (currentPath() !== '/umow-konsultacje') return;

    var lead = document.querySelector('.contact-copy .lead');
    if (lead && lead.textContent.indexOf('Oddzwonię tego samego dnia') !== -1) {
      lead.textContent = 'Zostaw imię i numer telefonu. Skontaktuję się z Tobą po otrzymaniu zgłoszenia, krótko omówimy Twój cel i ustalimy, jaki kolejny krok ma sens.';
    }

    var metaItems = document.querySelectorAll('.contact-meta li');
    for (var i = 0; i < metaItems.length; i++) {
      if ((metaItems[i].textContent || '').toLowerCase().indexOf('odpowiadam tego samego dnia') !== -1) {
        metaItems[i].textContent = 'kontakt po otrzymaniu zgłoszenia';
      }
    }

    var success = document.querySelector('#success-box p');
    if (success && success.textContent.indexOf('Odezwę się tego samego dnia') !== -1) {
      success.textContent = 'Skontaktuję się z Tobą po otrzymaniu zgłoszenia. Jeśli sprawa jest pilna, możesz też napisać na WhatsApp.';
    }

    var faq = document.querySelectorAll('.faq-answer p');
    for (var j = 0; j < faq.length; j++) {
      if ((faq[j].textContent || '').indexOf('Na zgłoszenia odpowiadam tego samego dnia') !== -1) {
        faq[j].textContent = 'Na zgłoszenia odpowiadam po ich otrzymaniu, tak szybko jak pozwala mi bieżący grafik treningów.';
      }
    }
  }

  function applySeoHygiene() {
    var path = currentPath();

    /*
      Strona prawna ma być dostępna dla użytkowników i linków,
      ale nie powinna konkurować o ruch organiczny.
    */
    if (path === '/polityka-prywatnosci') {
      var robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex,follow');
    }

    /*
      GSC pokazuje potencjał frazy "trening personalny Wilanów".
      Wzmacniamy istniejący link wewnętrzny bez dodawania sztucznej treści.
    */
    if (path === '/') {
      var links = document.querySelectorAll('a[href="/trener-personalny-wilanow/"]');
      for (var i = 0; i < links.length; i++) {
        var text = (links[i].textContent || '').trim();
        if (text.indexOf('Treningi personalne w Wilanowie') !== -1) {
          links[i].textContent = 'Trening personalny Wilanów →';
          break;
        }
      }
    }
  }

  function applyPageContext() {
    var path = currentPath();

    if (path === '/trener-personalny-wilanow') {
      document.body.classList.add('tw-paid-landing', 'tw-paid-trainer');
    } else if (path === '/trener-zdrofit-wilanow') {
      document.body.classList.add('tw-paid-landing', 'tw-paid-zdrofit');
    } else if (path === '/cennik') {
      document.body.classList.add('tw-paid-landing', 'tw-paid-pricing');
    }
  }

  function buildPriceSnapshot() {
    if (currentPath() !== '/cennik' || document.querySelector('.tw-price-snapshot')) return;

    var hero = document.querySelector('.hero .container');
    var cards = document.querySelectorAll('.pricing-grid .price-card');
    if (!hero || cards.length < 3) return;

    var snapshot = document.createElement('div');
    snapshot.className = 'tw-price-snapshot';
    snapshot.setAttribute('aria-label', 'Skrót cen treningów');

    for (var i = 0; i < 3; i++) {
      var title = cards[i].querySelector('h2');
      var amount = cards[i].querySelector('.amount strong');
      if (!title || !amount) continue;

      var item = document.createElement('div');
      item.className = 'tw-price-snapshot-item';

      var label = document.createElement('span');
      label.textContent = (title.textContent || '').replace('Pojedynczy trening', '1 trening').replace('Pakiet ', '');

      var value = document.createElement('strong');
      value.textContent = amount.textContent || '';

      item.appendChild(label);
      item.appendChild(value);
      snapshot.appendChild(item);
    }

    if (!snapshot.children.length) return;

    var cta = document.createElement('a');
    cta.className = 'tw-price-snapshot-cta';
    cta.href = '/umow-konsultacje/';
    cta.textContent = 'Umów konsultację 0 zł';

    hero.appendChild(snapshot);
    hero.appendChild(cta);
  }

  function preserveAttributionOnConsultLinks() {
    var source = new URLSearchParams(location.search);
    var carry = {};
    var hasAny = false;

    for (var i = 0; i < ATTRIBUTION_KEYS.length; i++) {
      var key = ATTRIBUTION_KEYS[i];
      if (source.has(key)) {
        carry[key] = source.get(key);
        hasAny = true;
      }
    }

    if (!hasAny) return;

    var links = document.querySelectorAll('a[href]');
    for (var j = 0; j < links.length; j++) {
      var raw = links[j].getAttribute('href') || '';
      var url;

      try {
        url = new URL(raw, location.origin);
      } catch (e) {
        continue;
      }

      if (url.origin !== location.origin || url.pathname.replace(/\/+$/, '') !== '/umow-konsultacje') continue;

      for (var k = 0; k < ATTRIBUTION_KEYS.length; k++) {
        var attrKey = ATTRIBUTION_KEYS[k];
        if (carry[attrKey] && !url.searchParams.has(attrKey)) {
          url.searchParams.set(attrKey, carry[attrKey]);
        }
      }

      links[j].setAttribute('href', url.pathname + url.search + url.hash);
    }
  }

  function setupAnalyticsIntentTracking() {
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest('a[href]')
        : null;

      if (!link || !window.__twConsent || window.__twConsent.analytics !== true || typeof window.gtag !== 'function') {
        return;
      }

      var raw = link.getAttribute('href') || '';
      var eventName = '';

      if (raw.indexOf('/umow-konsultacje/') === 0 || raw.indexOf(location.origin + '/umow-konsultacje/') === 0) {
        eventName = 'consultation_cta_click';
      } else if (raw.indexOf('https://wa.me/') === 0 || raw.indexOf('https://api.whatsapp.com/') === 0) {
        eventName = 'whatsapp_click';
      } else if (raw.indexOf('tel:') === 0) {
        eventName = 'phone_click';
      }

      if (!eventName) return;

      window.gtag('event', eventName, {
        send_to: GA_ID,
        page_path: location.pathname,
        link_text: (link.textContent || '').trim().slice(0, 100),
        link_url: link.href
      });
    }, true);
  }

  function makeGlobalCta() {
    var path = currentPath();
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
    cleanOldPromiseCopy();
    applySeoHygiene();
    applyPageContext();
    buildPriceSnapshot();
    preserveAttributionOnConsultLinks();
    setupAnalyticsIntentTracking();
    setupMobileCta(makeGlobalCta());
  });
})();
