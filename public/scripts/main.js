/**
 * dokanelbanat Landing Page — Main JavaScript
 *
 * Handles:
 * - Section entrance animations (IntersectionObserver)
 * - Smooth scroll offset for sticky header
 *
 * Note: Mobile drawer interaction is self-contained in Header.astro.
 */

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
     Mobile nav links are excluded — the drawer closes first and
     the browser handles the anchor scroll natively.
     ═══════════════════════════════════════════════════════════════ */
  var headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    if (anchor.closest('#mobile-nav')) return;

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
