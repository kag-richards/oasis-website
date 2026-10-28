/* Oasis Women Center · THE PLAN. Three moments of motion, everything else rests:
   1. hero loader: the home washes in from the gold line (--split 100% -> 50%)
   2. drawing to doorstep: pinned, scroll scrubs an image sequence (lerped playhead)
   3. the collapse: the line travels to the edge and the home takes the page
   Plus quiet reveals on the fund-a-line rows and the gold spine that fills as you read. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var script = document.currentScript;
  var base = script ? script.src.replace(/assets\/plan\.js.*$/, "") : "/";
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var vh = function () { return window.innerHeight; };

  /* ---------- chrome + menu ---------- */
  var chrome = document.querySelector("[data-chrome]");
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
      document.body.style.overflow = open ? "" : "hidden";
    });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") { toggle.click(); } });
  }

  /* ---------- 1 · hero loader ---------- */
  var hero = document.querySelector("[data-hero]");
  var heroImg = hero && hero.querySelector(".hero-drawing img");
  function setSplit(pct) { if (hero) hero.style.setProperty("--split", pct + "%"); }
  function startHero() {
    if (!hero) return;
    if (reduce) { setSplit(50); hero.classList.add("is-ready"); return; }
    setSplit(100);
    var t0 = null, dur = 1500;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / dur, 0, 1);
      setSplit(100 - 50 * ease(p));
      if (p < 1) requestAnimationFrame(step); else hero.dataset.loaded = "1";
    }
    setTimeout(function () { requestAnimationFrame(step); hero.classList.add("is-ready"); }, 450);
  }
  if (heroImg && !heroImg.complete) { heroImg.addEventListener("load", startHero, { once: true }); heroImg.addEventListener("error", startHero, { once: true }); }
  else { startHero(); }

  /* ---------- 2 · drawing to doorstep ---------- */
  var build = document.querySelector("[data-build]");
  var canvas = build && build.querySelector("[data-build-canvas]");
  var ctx = canvas && canvas.getContext("2d");
  var phases = build ? build.querySelectorAll("[data-phase]") : [];
  var segs = build ? build.querySelectorAll("[data-seg]") : [];
  var frames = [], frameCount = canvas ? parseInt(canvas.dataset.frames, 10) || 0 : 0;
  var loaded = 0, framesStarted = false, playhead = 0, target = 0, lastDrawn = -1;

  function frameUrl(i) {
    var w = window.innerWidth <= 760 ? 720 : 1280;
    return base + "assets/images/plan/frames/" + w + "/f" + String(i + 1).padStart(3, "0") + ".webp";
  }
  function loadFrames() {
    if (framesStarted || !frameCount || reduce) return;
    framesStarted = true;
    // first, last, then fill in coarse-to-fine so a fast scroll still has something to show
    var order = [], seen = {};
    [0, frameCount - 1].forEach(function (i) { order.push(i); seen[i] = 1; });
    for (var stride = 16; stride >= 1; stride = Math.floor(stride / 2)) {
      for (var i = 0; i < frameCount; i += stride) if (!seen[i]) { order.push(i); seen[i] = 1; }
    }
    order.forEach(function (i) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () { frames[i] = img; loaded++; if (loaded === 1) { canvas.classList.add("is-live"); sizeCanvas(); } lastDrawn = -1; };
      img.src = frameUrl(i);
    });
  }
  function sizeCanvas() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    lastDrawn = -1;
  }
  function nearestFrame(i) {
    if (frames[i]) return frames[i];
    for (var d = 1; d < frameCount; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }
  function draw(i) {
    var img = nearestFrame(i);
    if (!img || !ctx) return;
    var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) * 0.62, w, h);
    lastDrawn = i;
  }
  function buildProgress() {
    var r = build.getBoundingClientRect();
    return clamp(-r.top / (r.height - vh()), 0, 1);
  }
  function updateBuildUI(p) {
    var idx = clamp(Math.floor(p * phases.length * 0.999), 0, phases.length - 1);
    phases.forEach(function (el, k) { el.classList.toggle("is-on", k === idx); });
    segs.forEach(function (el, k) { el.style.setProperty("--f", clamp(p * segs.length - k, 0, 1).toFixed(3)); });
  }

  /* ---------- fund-a-line rows + spine ---------- */
  var lines = document.querySelector(".lines");
  var rows = document.querySelectorAll("[data-ln]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -18% 0px" });
    if (build) new IntersectionObserver(function (e) { if (e[0].isIntersecting) loadFrames(); }, { rootMargin: "150% 0px" }).observe(build);
  } else {
    rows.forEach(function (r) { r.classList.add("is-in"); });
    loadFrames();
  }

  /* ---------- 3 · the collapse ---------- */
  var collapse = document.querySelector("[data-collapse]");

  /* ---------- the one loop ---------- */
  function tick() {
    var y = window.scrollY;
    if (chrome) chrome.classList.toggle("is-scrolled", y > 40);

    if (hero && hero.dataset.loaded && !reduce) {
      var hp = clamp(y / (hero.offsetHeight || 1), 0, 1);
      setSplit(50 - 14 * ease(hp));
    }

    if (build && !reduce) {
      target = buildProgress();
      playhead += (target - playhead) * 0.16;
      if (Math.abs(target - playhead) < 0.0005) playhead = target;
      updateBuildUI(playhead);
      build.style.setProperty("--ho", (1 - clamp((playhead - 0.5) / 0.2, 0, 1)).toFixed(3));
      if (frameCount) {
        var fi = clamp(Math.round(playhead * (frameCount - 1)), 0, frameCount - 1);
        if (fi !== lastDrawn) draw(fi);
      }
    }

    for (var r = 0; r < rows.length; r++) {
      if (!rows[r].classList.contains("is-in") && rows[r].getBoundingClientRect().top < vh() * 0.86) rows[r].classList.add("is-in");
    }

    if (lines) {
      var lr = lines.getBoundingClientRect();
      var lp = clamp((vh() * 0.6 - lr.top) / lr.height, 0, 1);
      lines.style.setProperty("--fill", (lp * 100).toFixed(1) + "%");
    }

    if (collapse && !reduce) {
      var cr = collapse.getBoundingClientRect();
      var cp = clamp(-cr.top / (cr.height - vh()), 0, 1);
      var t = clamp((cp - 0.08) / 0.72, 0, 1);
      var c = 58 * (1 - (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2));
      collapse.style.setProperty("--c", c.toFixed(2) + "%");
      collapse.style.setProperty("--lo", c > 1 ? "1" : "0");
      collapse.style.setProperty("--co", clamp((cp - 0.62) / 0.25, 0, 1).toFixed(3));
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", sizeCanvas);
  requestAnimationFrame(tick);
})();
