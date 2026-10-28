/* Oasis Women Center · contact form. Moved here unchanged from site.js when the interior pages moved
   to The Plan's design, so the form still reaches the Oasis workspace. */
/* Contact form -> DraftClicks.com OS, sub-account #1014 (Oasis Women Center).
   Submissions land as contacts in the Oasis pipeline. If the request ever
   fails, the visitor gets the email address rather than a dead button. */
(function () {
  var ENDPOINT = 'https://go.draftclicks.com/api/forms/FNfB8UOuMOsZxJ20ptcM/submit';
  var FALLBACK_EMAIL = 'info@oasiswomencenter.org';

  var form = document.querySelector('.ls-form');
  if (!form) return;

  var loadedAt = Date.now();

  function attribution() {
    var p = new URLSearchParams(window.location.search);
    return {
      utmSource: p.get('utm_source') || '',
      utmMedium: p.get('utm_medium') || '',
      utmCampaign: p.get('utm_campaign') || '',
      landingPage: window.location.href,
      referrer: document.referrer || ''
    };
  }

  function notice(text, ok) {
    var el = form.querySelector('.form-notice');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-notice ' + (ok ? 'is-ok' : 'is-err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var values = {};
    form.querySelectorAll('[data-ls-field]').forEach(function (el) {
      values[el.getAttribute('data-ls-field')] = (el.value || '').trim();
    });

    if (!values.name || !values.email || !values.message) {
      notice('Please add your name, your email, and a short message.', false);
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    notice('', true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: values,
        attribution: attribution(),
        hp: (form.querySelector('.hp input') || {}).value || '',
        elapsedMs: Date.now() - loadedAt
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      form.reset();
      notice('Thank you for reaching out. Someone from Oasis Women Center will get back to you shortly.', true);
    }).catch(function () {
      notice('Something went wrong sending that. Please email ' + FALLBACK_EMAIL + ' and we will pick it up from there.', false);
    }).then(function () {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    });
  });
})();
