/* Oasis Women Center — interaction layer.
   Everything here degrades gracefully: with JS off, all content is visible,
   and with prefers-reduced-motion, nothing moves. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky nav background ---- */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Scroll reveal ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
    // Failsafe: if anything is still hidden after 2.5s, show it. Content must
    // never be trapped behind an observer that did not fire.
    window.setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
    }, 2500);
  }

  /* ---- Count-up numbers ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduced) { el.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, countUp);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  /* ---- Progress bars ---- */
  var bars = document.querySelectorAll('.bar-fill[data-pct]');
  if (bars.length) {
    var fill = function (el) { el.style.width = el.getAttribute('data-pct') + '%'; };
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(bars, fill);
    } else {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { fill(entry.target); bio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      Array.prototype.forEach.call(bars, function (el) { bio.observe(el); });
    }
  }

  /* ---- Pillars: pinned scroll sequence ----
     Scroll position through the tall track picks which pillar is showing. The
     CSS only pins above 820px and off reduced motion, so we bail in the same
     cases rather than fighting a layout that is deliberately just a stack. */
  var track  = document.querySelector('.pillars-track');
  var panels = document.querySelectorAll('.pillar');
  var railLi = document.querySelectorAll('.pillar-rail li');

  if (track && panels.length) {
    var pinned = function () {
      return !reduced && window.matchMedia('(min-width: 821px)').matches;
    };

    var current = -1;
    var setActive = function (i) {
      if (i === current) return;
      current = i;
      Array.prototype.forEach.call(panels, function (el, n) {
        el.classList.toggle('is-active', n === i);
        el.setAttribute('aria-hidden', n === i ? 'false' : 'true');
      });
      Array.prototype.forEach.call(railLi, function (el, n) {
        el.classList.toggle('is-active', n === i);
      });
    };

    var ticking = false;
    var update = function () {
      ticking = false;
      if (!pinned()) { setActive(0); return; }
      var span = track.offsetHeight - window.innerHeight;
      if (span <= 0) { setActive(0); return; }
      var p = (-track.getBoundingClientRect().top) / span;
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      var i = Math.floor(p * panels.length);
      setActive(i > panels.length - 1 ? panels.length - 1 : i);
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    /* The rail is real navigation, not decoration. */
    Array.prototype.forEach.call(railLi, function (li) {
      var btn = li.querySelector('button');
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (!pinned()) {
          panels[+btn.dataset.goto].scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        /* offsetTop is relative to .pillars (position:relative), not the
           document, so it reads 0. Measure against the viewport instead. */
        var top = track.getBoundingClientRect().top + window.pageYOffset;
        var span = track.offsetHeight - window.innerHeight;
        var target = top + span * ((+btn.dataset.goto + 0.5) / panels.length);
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });
  }
})();

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
