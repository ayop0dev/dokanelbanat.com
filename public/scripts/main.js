/**
 * dokanelbanat Landing Page — Main JavaScript
 * Static HTML/CSS/JS. Zero framework.
 *
 * Handles:
 * - Mobile navigation toggle
 * - Section entrance animations (IntersectionObserver)
 * - Staggered children reveals
 * - Smooth scroll offset for sticky header
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     MOBILE NAVIGATION
     ═══════════════════════════════════════════════════════════════ */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navOverlay = document.getElementById('nav-overlay');

  function setNavOpen(isOpen) {
    mainNav.classList.toggle('is-open', isOpen);
    if (navOverlay) navOverlay.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      setNavOpen(!mainNav.classList.contains('is-open'));
    });

    // Close menu when clicking overlay
    if (navOverlay) {
      navOverlay.addEventListener('click', function () {
        setNavOpen(false);
      });
    }

    // Close menu when clicking a nav link (anchor scroll)
    mainNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        setNavOpen(false);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     SECTION ENTRANCE ANIMATIONS
     ═══════════════════════════════════════════════════════════════ */
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -64px 0px',
    threshold: 0.1,
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
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
     ═══════════════════════════════════════════════════════════════ */
  const headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
})();
