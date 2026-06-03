/**
 * dokanelbanat Landing Page — Main JavaScript
 *
 * Handles:
 * - Off-canvas side navigation
 * - Section entrance animations (IntersectionObserver)
 * - Smooth scroll offset for sticky header
 */

/* ═══════════════════════════════════════════════════════════════
   OFF-CANVAS SIDE NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var trigger  = document.getElementById('canvas-trigger');
  var canvas   = document.getElementById('side-canvas');
  var overlay  = document.getElementById('canvas-overlay');
  var closeBtn = document.getElementById('canvas-close');

  function openCanvas() {
    canvas.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCanvas() {
    canvas.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (trigger)  trigger.addEventListener('click', openCanvas);
  if (closeBtn) closeBtn.addEventListener('click', closeCanvas);
  if (overlay)  overlay.addEventListener('click', closeCanvas);

  document.querySelectorAll('#side-canvas nav a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      setTimeout(closeCanvas, 300);
    });
  });
});

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     SECTION ENTRANCE ANIMATIONS
     ═══════════════════════════════════════════════════════════════ */
  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -64px 0px',
    threshold: 0.1,
  };

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.ds-section-enter, .ds-stagger').forEach(function (el) {
    sectionObserver.observe(el);
  });

  /* ═══════════════════════════════════════════════════════════════
     SMOOTH SCROLL OFFSET (sticky header compensation)
     Canvas nav links are excluded — browser handles their scroll,
     then the canvas closes after 300ms.
     ═══════════════════════════════════════════════════════════════ */
  var headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    if (anchor.closest('#side-canvas')) return;

    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      var targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
})();
