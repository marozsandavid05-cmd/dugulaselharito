/* Oláh Duguláselhárítás · site.js
   Kritikus rész (menü, belépők) GSAP nélkül is működik. A GSAP és a Lenis csak a sima görgetést
   és a hero örvény-képének lassú, görgetéshez kötött elfordulását adja. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Lenis (sima görgetés), saját rAF, nem gsap.ticker; csak egeres eszközön (érintésen natív görgetés) ---- */
  var lenis = null;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ smoothWheel: true, syncTouch: false, lerp: 0.12 });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    } catch (e) { lenis = null; }
  }

  /* ---- mobil menü ---- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('fomenu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---- hero belépő: CSS-ből, egy osztály ---- */
  var hero = document.querySelector('.hero');
  if (hero) {
    if (reduce || document.hidden) hero.classList.add('is-in');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
    setTimeout(function () { hero.classList.add('is-in'); }, 1200);
  }

  /* ---- belépők: csak a hajtás alatti elemek kapnak rejtett indulást ---- */
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!reduce && 'IntersectionObserver' in window && !document.hidden) {
    var below = items.filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.96; });
    below.forEach(function (el) { el.classList.add('rv'); });
    var show = function (el) { el.classList.add('in'); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    below.forEach(function (el) { io.observe(el); });
    /* gyors görgetés vagy háttér-fül: ami már a képernyő fölött van, az is látszódjon */
    var sweep = function () {
      below.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight) show(el); });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) below.forEach(show); });
    setTimeout(sweep, 600);
  }

  /* ---- GSAP: a hero örvény lassan elfordul görgetésre (csak asztalon, csak mozgással) ---- */
  function initGsap() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var g = window.gsap;
    g.registerPlugin(window.ScrollTrigger);
    if (lenis) lenis.on('scroll', window.ScrollTrigger.update);
    var img = document.querySelector('.hero__img');
    if (img && window.matchMedia('(min-width: 900px)').matches) {
      g.to(img, {
        rotation: -9, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    setTimeout(function () { window.ScrollTrigger.refresh(); }, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGsap);
  else initGsap();
})();
