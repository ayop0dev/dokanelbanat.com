/**
 * dokanelbanat Landing Page — Main JavaScript
 * Static HTML/CSS/JS. Zero framework.
 *
 * Handles:
 * - Mobile navigation toggle (hamburger, close button, overlay, Escape, anchor clicks)
 * - Section entrance animations (IntersectionObserver)
 * - Staggered children reveals
 * - Smooth scroll offset for sticky header (non-drawer links only)
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     MOBILE NAVIGATION
     ═══════════════════════════════════════════════════════════════ */
  var menuToggle  = document.getElementById('menu-toggle');
  var mainNav     = document.getElementById('main-nav');
  var navOverlay  = document.getElementById('nav-overlay');
  var drawerClose = document.getElementById('drawer-close');

  function setNavOpen(isOpen) {
    if (!mainNav) return;
    mainNav.classList.toggle('is-open', isOpen);
    if (navOverlay) navOverlay.classList.toggle('is-open', isOpen);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (menuToggle && mainNav) {
    // Hamburger opens / toggles the drawer
    menuToggle.addEventListener('click', function () {
      setNavOpen(!mainNav.classList.contains('is-open'));
    });

    // X button: close immediately
    if (drawerClose) {
      drawerClose.addEventListener('click', function () {
        setNavOpen(false);
      });
    }

    // Overlay: close immediately
    if (navOverlay) {
      navOverlay.addEventListener('click', function () {
        setNavOpen(false);
      });
    }

    // Drawer nav links: let the browser navigate naturally (no preventDefault),
    // then close the drawer after 300ms so the scroll destination is already reached.
    mainNav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(function () { setNavOpen(false); }, 300);
      });
    });

    // Escape key closes the drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        setNavOpen(false);
      }
    });
  }

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
     Drawer nav links are excluded — they rely on browser-native
     anchor navigation and must not receive preventDefault.
     ═══════════════════════════════════════════════════════════════ */
  var headerHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
    10
  ) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    // Skip links that live inside the drawer — they handle navigation themselves
    if (mainNav && mainNav.contains(anchor)) return;

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
