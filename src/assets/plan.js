/* Oasis Women Center · THE PLAN. Three moments of motion, everything else rests:
   1. hero loader: the home washes in from the gold line (--split 100% -> 50%)
   2. drawing to doorstep: pinned, scroll scrubs an image sequence (lerped playhead)
   3. the collapse: the line travels to the edge and the home takes the page
   Plus quiet reveals on the fund-a-line rows and the gold spine that fills as you read.

   Performance rule (KAR's Mac is a 2015 Intel MacBook Pro): the page does NOT run a
   frame loop. Scroll positions of every section are measured once (and on resize /
   font load), a scroll event schedules at most one frame, the frame does arithmetic only
   (no layout reads), and it writes a CSS variable only when the value actually changed. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var script = document.currentScript;
  var base = script ? script.src.replace(/assets\/plan\.js.*$/, "") : "/";
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

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

  /* ---------- elements ---------- */
  var hero = document.querySelector("[data-hero]");
  var heroImg = hero && hero.querySelector(".hero-drawing img");
  var heroHome = hero && hero.querySelector("[data-hero-home]");
  var heroLine = hero && hero.querySelector("[data-line]");
  var build = document.querySelector("[data-build]");
  var canvas = build && build.querySelector("[data-build-canvas]");
  var ctx = canvas && canvas.getContext("2d");
  var phases = build ? build.querySelectorAll("[data-phase]") : [];
  var segs = build ? build.querySelectorAll("[data-seg]") : [];
  var lines = document.querySelector(".lines");
  var spine = document.querySelector("[data-spine]");
  var buildHead = build && build.querySelector(".build-head");
  var rows = document.querySelectorAll("[data-ln]");
  var collapse = document.querySelector("[data-collapse]");
  var cHome = collapse && collapse.querySelector("[data-collapse-home]");
  var cLine = collapse && collapse.querySelector("[data-collapse-line]");
  var cCopy = collapse && collapse.querySelector(".collapse-copy");

  /* ---------- 1 · hero loader ---------- */
  var lastSplit = 50;
  // written on the two elements that read it, so the browser does not restyle the whole hero
  function setSplit(pct) { if (!hero) return; heroHome.style.setProperty("--split", pct + "%"); heroLine.style.setProperty("--split", pct + "%"); }
  function startHero() {
    if (!hero) return;
    if (reduce) { setSplit(50); hero.classList.add("is-ready"); hero.dataset.loaded = "1"; return; }
    setSplit(100);
    var t0 = null, dur = 1500;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / dur, 0, 1);
      setSplit(100 - 50 * ease(p));
      if (p < 1) requestAnimationFrame(step); else { hero.dataset.loaded = "1"; lastSplit = 50; request(); }
    }
    setTimeout(function () { requestAnimationFrame(step); hero.classList.add("is-ready"); }, 450);
  }
  if (heroImg && !heroImg.complete) { heroImg.addEventListener("load", startHero, { once: true }); heroImg.addEventListener("error", startHero, { once: true }); }
  else { startHero(); }

  /* ---------- 2 · drawing to doorstep: the image sequence ---------- */
  var frames = [], frameCount = canvas ? parseInt(canvas.dataset.frames, 10) || 0 : 0;
  var framesStarted = false, playhead = 0, target = 0, lastDrawn = -1, lastP = -1, lastPhase = -1, curFi = 0;

  function frameUrl(i) {
    var w = window.innerWidth <= 760 ? 720 : 1280;
    return base + "assets/images/plan/frames/" + w + "/f" + String(i + 1).padStart(3, "0") + ".webp";
  }
  function sizeCanvas() {
    if (!canvas || !canvas.clientWidth) return;
    // never paint more pixels than the frames hold: a 2880px retina canvas gains nothing from 1280px frames
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.min(Math.round(canvas.clientWidth * dpr), 1440);
    var h = Math.round(w * canvas.clientHeight / canvas.clientWidth);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    lastDrawn = -1;
  }
  function loadFrames() {
    if (framesStarted || !frameCount || reduce) return;
    framesStarted = true;
    // first, last, then coarse-to-fine so a fast scroll still has something to show
    var order = [], seen = {};
    [0, frameCount - 1].forEach(function (i) { order.push(i); seen[i] = 1; });
    for (var stride = 16; stride >= 1; stride = Math.floor(stride / 2)) {
      for (var i = 0; i < frameCount; i += stride) if (!seen[i]) { order.push(i); seen[i] = 1; }
    }
    var live = false;
    function arrived(i, img) {
      frames[i] = img;
      if (!live) { live = true; canvas.classList.add("is-live"); sizeCanvas(); }
      // only repaint when this frame is the one on screen, or nothing has been drawn yet
      if (lastDrawn === -1 || i === curFi) { lastDrawn = -1; request(); }
    }
    var queue = order.slice(), active = 0;
    function fetchFrame(i, done) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () {
        // decode on a worker thread first, so the first draw of this frame is cheap and the scroll does not stall
        if (img.decode) img.decode().then(function () { arrived(i, img); done(); }, function () { arrived(i, img); done(); });
        else { arrived(i, img); done(); }
      };
      img.onerror = done;
      img.src = frameUrl(i);
    }
    function next() {
      // a few at a time while she is reading, many at a time once she is in the section
      var nearBuild = M.build && window.scrollY > M.build.top - M.vh * 1.5;
      var max = nearBuild ? 5 : 4;
      while (active < max && queue.length) {
        active++;
        fetchFrame(queue.shift(), function () { active--; next(); });
      }
    }
    next();
    window.addEventListener("scroll", next, { passive: true });
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
    if (!img || !ctx || !canvas.width) return;
    var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) * 0.62, w, h);
    lastDrawn = i;
  }
  function applyBuild(p) {
    if (Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    var idx = clamp(Math.floor(p * phases.length * 0.999), 0, phases.length - 1);
    if (idx !== lastPhase) {
      lastPhase = idx;
      for (var k = 0; k < phases.length; k++) phases[k].classList.toggle("is-on", k === idx);
    }
    for (var s = 0; s < segs.length; s++) segs[s].style.setProperty("--f", clamp(p * segs.length - s, 0, 1).toFixed(3));
    buildHead.style.setProperty("--ho", (1 - clamp((p - 0.5) / 0.2, 0, 1)).toFixed(3));
    if (frameCount) {
      var fi = clamp(Math.round(p * (frameCount - 1)), 0, frameCount - 1);
      curFi = fi;
      if (fi !== lastDrawn) draw(fi);
    }
  }
  if (build) {
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) loadFrames(); }, { rootMargin: "150% 0px" }).observe(build);
    else loadFrames();
  }

  /* ---------- photos: load and decode ahead of the scroll, not as they arrive ---------- */
  var lazy = document.querySelectorAll('img[loading="lazy"]');
  if ("IntersectionObserver" in window && lazy.length) {
    var pre = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var im = e.target; pre.unobserve(im);
        im.loading = "eager";
        if (im.decode) im.decode().catch(function () {});
      });
    }, { rootMargin: "250% 0px" });
    lazy.forEach(function (im) { pre.observe(im); });
  }

  /* ---------- desktop: warm the heavy files in the background after the hero settles ---------- */
  function idle(fn, t) { if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: t }); else setTimeout(fn, t); }
  function warmPhotos() {
    var list = Array.prototype.slice.call(document.querySelectorAll('img[loading="lazy"]')), act = 0;
    function nxt() {
      while (act < 2 && list.length) {
        var im = list.shift();
        if (im.loading !== "lazy") continue;
        act++; im.loading = "eager";
        var done = function () { act--; nxt(); };
        (im.decode ? im.decode() : Promise.resolve()).then(done, done);
      }
    }
    nxt();
  }
  var saveData = navigator.connection && navigator.connection.saveData;
  if (window.innerWidth > 760 && !saveData && !reduce) {
    window.addEventListener("load", function () {
      setTimeout(function () { idle(function () { loadFrames(); warmPhotos(); }, 800); }, 700);
    });
  }

  /* ---------- measured once, not every frame ---------- */
  var M = { vh: window.innerHeight, rows: [] };
  var revealed = [], lastScrolled = null, lastLp = -1, lastC = -1, lastCo = -1;
  function abs(el) { return { top: el.getBoundingClientRect().top + window.scrollY, h: el.offsetHeight }; }
  function measure() {
    M.vh = window.innerHeight;
    if (hero) M.hero = abs(hero);
    if (build) M.build = abs(build);
    if (collapse) M.collapse = abs(collapse);
    if (lines) M.lines = abs(lines);
    M.rows = Array.prototype.map.call(rows, function (r) { return r.getBoundingClientRect().top + window.scrollY; });
    sizeCanvas();
    request();
  }

  /* ---------- one frame, scheduled by scroll ---------- */
  var ticking = false;
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  function tick() {
    ticking = false;
    var y = window.scrollY, again = false;

    var sc = y > 40;
    if (chrome && sc !== lastScrolled) { lastScrolled = sc; chrome.classList.toggle("is-scrolled", sc); }

    if (hero && hero.dataset.loaded && !reduce && M.hero && y < M.hero.h + 80) {
      var sp = 50 - 14 * ease(clamp(y / M.hero.h, 0, 1));
      if (Math.abs(sp - lastSplit) > 0.05) { lastSplit = sp; setSplit(sp.toFixed(2)); }
    }

    if (build && !reduce && M.build && y > M.build.top - M.vh && y < M.build.top + M.build.h + 40) {
      target = clamp((y - M.build.top) / (M.build.h - M.vh), 0, 1);
      playhead += (target - playhead) * 0.34;
      if (Math.abs(target - playhead) < 0.0015) playhead = target; else again = true;
      applyBuild(playhead);
    } else if (build && !reduce && M.build) {
      playhead = target = y < M.build.top ? 0 : 1;
    }

    for (var i = 0; i < rows.length; i++) {
      if (!revealed[i] && y + M.vh * 1.02 > M.rows[i]) { revealed[i] = true; rows[i].classList.add("is-in"); }
    }

    if (lines && M.lines) {
      var lp = clamp((y + M.vh * 0.6 - M.lines.top) / M.lines.h, 0, 1);
      if (Math.abs(lp - lastLp) > 0.002) { lastLp = lp; spine.style.transform = "scaleY(" + lp.toFixed(3) + ")"; }
    }

    if (collapse && !reduce && M.collapse && y > M.collapse.top - M.vh && y < M.collapse.top + M.collapse.h + 40) {
      var cp = clamp((y - M.collapse.top) / (M.collapse.h - M.vh), 0, 1);
      var c = 58 * (1 - easeInOut(clamp((cp - 0.08) / 0.72, 0, 1)));
      var co = clamp((cp - 0.62) / 0.25, 0, 1);
      if (Math.abs(c - lastC) > 0.05) {
        lastC = c;
        cHome.style.setProperty("--c", c.toFixed(2) + "%");
        cLine.style.setProperty("--c", c.toFixed(2) + "%");
        cLine.style.setProperty("--lo", c > 1 ? "1" : "0");
      }
      if (Math.abs(co - lastCo) > 0.004) { lastCo = co; cCopy.style.setProperty("--co", co.toFixed(3)); }
    }

    if (again) request();
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
})();
