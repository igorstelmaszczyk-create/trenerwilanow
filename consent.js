/*
  trenerwilanow.pl — Consent Mode v2
  Wariant: BASIC (tagi Google nie są ładowane przed zgodą).
  Kategorie:
    - analytics: Google Analytics 4
    - ads: pomiar Google Ads
  Personalizacja reklam pozostaje wyłączona.
*/
(function () {
  'use strict';

  var VERSION = '2026-08-16-v1';
  var COOKIE_NAME = 'tw_consent_v2';
  var GA_ID = 'G-FBX8CDNETZ';
  var ADS_ID = 'AW-10989654613';
  var GOOGLE_TAG_URL = 'https://www.googletagmanager.com/gtag/js?id=';

  var state = {
    analytics: false,
    ads: false,
    decided: false,
    version: VERSION
  };

  var tagLoaded = false;

  function readChoice() {
    try {
      var prefix = COOKIE_NAME + '=';
      var parts = document.cookie ? document.cookie.split('; ') : [];
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(prefix) === 0) {
          var parsed = JSON.parse(decodeURIComponent(parts[i].slice(prefix.length)));
          if (parsed && parsed.version === VERSION) {
            state.analytics = parsed.analytics === true;
            state.ads = parsed.ads === true;
            state.decided = true;
          }
          break;
        }
      }
    } catch (e) {}
    syncPublicState();
  }

  function saveChoice() {
    var payload = encodeURIComponent(JSON.stringify({
      analytics: state.analytics,
      ads: state.ads,
      version: VERSION
    }));
    document.cookie = COOKIE_NAME + '=' + payload +
      '; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
  }

  function syncPublicState() {
    window.__twConsent = {
      analytics: state.analytics,
      ads: state.ads,
      decided: state.decided,
      version: state.version
    };
  }

  function ensureGtag() {
    if (!window.dataLayer) window.dataLayer = [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function consentObject() {
    return {
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.ads ? 'granted' : 'denied',
      ad_user_data: state.ads ? 'granted' : 'denied',
      ad_personalization: 'denied'
    };
  }

  function loadGoogleTag() {
    if (tagLoaded || (!state.analytics && !state.ads)) return;

    ensureGtag();

    // Google wymaga ustawienia stanu domyślnego przed config/event.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    window.gtag('consent', 'update', consentObject());
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('js', new Date());

    if (state.analytics) {
      window.gtag('config', GA_ID, {
        anonymize_ip: true
      });
    }

    if (state.ads) {
      window.gtag('config', ADS_ID);
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = GOOGLE_TAG_URL + encodeURIComponent(state.analytics ? GA_ID : ADS_ID);
    script.onload = function () {
      document.documentElement.setAttribute('data-google-consent', 'active');
    };
    document.head.appendChild(script);
    tagLoaded = true;
  }

  function updateLoadedTag() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', consentObject());

      if (state.analytics) {
        window.gtag('config', GA_ID, { anonymize_ip: true });
      }
      if (state.ads) {
        window.gtag('config', ADS_ID);
      }
    }

    if (!tagLoaded && (state.analytics || state.ads)) {
      loadGoogleTag();
    }
  }

  function deleteCookie(name) {
    var hostname = location.hostname.replace(/^www\./, '');
    var expiries = [
      '; Path=/; Max-Age=0; SameSite=Lax',
      '; Path=/; Max-Age=0; SameSite=Lax; Domain=' + hostname,
      '; Path=/; Max-Age=0; SameSite=Lax; Domain=.' + hostname
    ];
    for (var i = 0; i < expiries.length; i++) {
      document.cookie = name + '=;' + expiries[i];
    }
  }

  function clearGoogleCookies() {
    try {
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      for (var i = 0; i < cookies.length; i++) {
        var name = cookies[i].split('=')[0];
        if (
          name === '_ga' ||
          name.indexOf('_ga_') === 0 ||
          name === '_gid' ||
          name === '_gat' ||
          name === '_gcl_au' ||
          name.indexOf('_gcl_') === 0
        ) {
          deleteCookie(name);
        }
      }
    } catch (e) {}
  }

  function setChoice(analytics, ads, reloadIfRevoked) {
    var hadAny = state.analytics || state.ads;

    state.analytics = analytics === true;
    state.ads = ads === true;
    state.decided = true;

    saveChoice();
    syncPublicState();

    if (!state.analytics && !state.ads) {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
      clearGoogleCookies();
    } else {
      updateLoadedTag();
    }

    hideBanner();
    showManageButton();

    // Po pełnym cofnięciu zgody przeładuj stronę, aby w wariancie BASIC
    // żaden załadowany wcześniej tag Google nie pozostał aktywny.
    if (reloadIfRevoked && hadAny && !state.analytics && !state.ads) {
      window.setTimeout(function () {
        location.reload();
      }, 120);
    }
  }

  function injectStyles() {
    if (document.getElementById('tw-consent-style')) return;

    var style = document.createElement('style');
    style.id = 'tw-consent-style';
    style.textContent =
      '#tw-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;margin:auto;background:#fff;color:#171a18;border:1px solid #dfe7e1;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.22);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:20px}' +
      '#tw-consent[hidden]{display:none!important}' +
      '#tw-consent h2{margin:0;font-size:1.15rem;line-height:1.25}' +
      '#tw-consent p{margin:8px 0 0;color:#555f57;font-size:.92rem;line-height:1.5}' +
      '#tw-consent a{color:#1f7e21;font-weight:750;text-underline-offset:3px}' +
      '#tw-consent-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}' +
      '#tw-consent button{min-height:44px;border-radius:10px;padding:10px 14px;font:inherit;font-weight:820;cursor:pointer}' +
      '#tw-consent .tw-primary{border:2px solid #1f7e21;background:#1f7e21;color:#fff}' +
      '#tw-consent .tw-primary:hover{background:#176619;border-color:#176619}' +
      '#tw-consent .tw-secondary{border:2px solid #9fc7a2;background:#fff;color:#1f7e21}' +
      '#tw-consent .tw-secondary:hover{background:#eef8ef}' +
      '#tw-consent .tw-text{border:0;background:transparent;color:#384139;text-decoration:underline;text-underline-offset:3px}' +
      '#tw-settings{display:none;margin-top:16px;padding-top:16px;border-top:1px solid #dfe7e1}' +
      '#tw-settings.tw-open{display:block}' +
      '.tw-choice{display:flex;gap:12px;align-items:flex-start;padding:11px 0}' +
      '.tw-choice+.tw-choice{border-top:1px solid #edf1ee}' +
      '.tw-choice input{width:20px;height:20px;margin:2px 0 0;accent-color:#1f7e21;flex:0 0 auto}' +
      '.tw-choice strong{display:block;font-size:.93rem}' +
      '.tw-choice span{display:block;margin-top:3px;color:#626a64;font-size:.82rem;line-height:1.4}' +
      '#tw-manage{position:fixed;left:12px;bottom:12px;z-index:2147482000;border:1px solid #cad7cc;border-radius:999px;background:#fff;color:#364139;padding:8px 11px;font:700 .78rem system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.12);cursor:pointer}' +
      '#tw-manage[hidden]{display:none!important}' +
      '#tw-manage:hover{background:#eef8ef;color:#1f7e21}' +
      '@media(max-width:620px){#tw-consent{left:10px;right:10px;bottom:10px;padding:17px}#tw-consent-actions{display:grid}#tw-consent button{width:100%}#tw-manage{bottom:10px;left:10px}}' +
      '@media(prefers-reduced-motion:reduce){#tw-consent *,#tw-manage{transition:none!important}}';

    document.head.appendChild(style);
  }

  function createUi() {
    if (document.getElementById('tw-consent')) return;

    injectStyles();

    var box = document.createElement('section');
    box.id = 'tw-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-labelledby', 'tw-consent-title');
    box.innerHTML =
      '<h2 id="tw-consent-title">Twoja prywatność</h2>' +
      '<p>Używam technologii niezbędnych do działania strony. Za Twoją zgodą mogę też używać Google Analytics do statystyk oraz Google Ads do pomiaru skuteczności reklam. Personalizacja reklam pozostaje wyłączona. <a href="/polityka-prywatnosci/">Polityka prywatności</a>.</p>' +
      '<div id="tw-consent-actions">' +
        '<button type="button" class="tw-primary" id="tw-accept-all">Akceptuję wszystkie</button>' +
        '<button type="button" class="tw-secondary" id="tw-reject">Tylko niezbędne</button>' +
        '<button type="button" class="tw-text" id="tw-open-settings" aria-expanded="false">Ustawienia</button>' +
      '</div>' +
      '<div id="tw-settings">' +
        '<label class="tw-choice">' +
          '<input type="checkbox" id="tw-analytics">' +
          '<span><strong>Analityka</strong><span>Google Analytics 4 — pomaga zrozumieć, które strony są użyteczne i skąd trafiają użytkownicy.</span></span>' +
        '</label>' +
        '<label class="tw-choice">' +
          '<input type="checkbox" id="tw-ads">' +
          '<span><strong>Pomiar reklam</strong><span>Google Ads — pomiar skuteczności kampanii i konwersji. Bez personalizacji reklam.</span></span>' +
        '</label>' +
        '<div id="tw-consent-actions">' +
          '<button type="button" class="tw-primary" id="tw-save">Zapisz wybór</button>' +
        '</div>' +
      '</div>';

    var manage = document.createElement('button');
    manage.id = 'tw-manage';
    manage.type = 'button';
    manage.textContent = 'Ustawienia prywatności';
    manage.setAttribute('aria-label', 'Zmień ustawienia prywatności');
    manage.hidden = true;

    document.body.appendChild(box);
    document.body.appendChild(manage);

    var settings = document.getElementById('tw-settings');
    var openSettings = document.getElementById('tw-open-settings');
    var analytics = document.getElementById('tw-analytics');
    var ads = document.getElementById('tw-ads');

    function fillSettings() {
      analytics.checked = state.analytics;
      ads.checked = state.ads;
    }

    function toggleSettings(open) {
      settings.classList.toggle('tw-open', open);
      openSettings.setAttribute('aria-expanded', String(open));
      if (open) fillSettings();
    }

    document.getElementById('tw-accept-all').addEventListener('click', function () {
      setChoice(true, true, false);
    });

    document.getElementById('tw-reject').addEventListener('click', function () {
      setChoice(false, false, true);
    });

    openSettings.addEventListener('click', function () {
      toggleSettings(!settings.classList.contains('tw-open'));
    });

    document.getElementById('tw-save').addEventListener('click', function () {
      setChoice(analytics.checked, ads.checked, true);
    });

    manage.addEventListener('click', function () {
      fillSettings();
      box.hidden = false;
      manage.hidden = true;
      toggleSettings(true);
      document.getElementById('tw-consent-title').focus && document.getElementById('tw-consent-title').focus();
    });

    if (state.decided) {
      box.hidden = true;
      manage.hidden = false;
    } else {
      box.hidden = false;
      manage.hidden = true;
    }
  }

  function hideBanner() {
    var box = document.getElementById('tw-consent');
    if (box) box.hidden = true;
  }

  function showManageButton() {
    var manage = document.getElementById('tw-manage');
    if (manage) manage.hidden = false;
  }

  readChoice();

  // BASIC Consent Mode v2: Google tag dopiero po zgodzie na co najmniej jedną kategorię.
  if (state.decided && (state.analytics || state.ads)) {
    loadGoogleTag();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUi, { once: true });
  } else {
    createUi();
  }

  // Małe API dla istniejących skryptów strony.
  window.TrenerWilanowConsent = {
    get: function () {
      return {
        analytics: state.analytics,
        ads: state.ads,
        decided: state.decided,
        version: VERSION
      };
    },
    open: function () {
      var manage = document.getElementById('tw-manage');
      if (manage) manage.click();
    }
  };
})();
