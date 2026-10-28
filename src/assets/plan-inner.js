/* Oasis Women Center · THE PLAN, interior pages.
   One job: let each section settle in as it arrives, once. No scroll handler, no frame loop.
   Content must never be trapped behind an observer that did not fire, so everything is
   shown after 2.5 seconds regardless, and straight away for anyone who asks for less motion. */
(function () {
  "use strict";
  var els = document.querySelectorAll("[data-rv], [data-open]");
  if (!els.length) return;
  var showAll = function () { Array.prototype.forEach.call(els, function (el) { el.classList.add("is-in"); }); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  window.setTimeout(showAll, 2500);
})();
