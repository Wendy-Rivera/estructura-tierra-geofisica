/**
 * main.js
 * Estructura Interna de la Tierra — Interactive behaviours
 *
 * • Vertical parallax scrolling (index.html)
 * • Mobile navigation toggle
 * • Scroll-reveal for .reveal elements
 * • Active nav-link highlighting
 */

'use strict';

// ── Helpers ────────────────────────────────────────────────
/**
 * Safely query a selector; returns null without throwing if
 * the element is absent on a given page.
 */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Parallax ───────────────────────────────────────────────
/**
 * Applies a CSS transform to each `.parallax-bg` element based
 * on how far the user has scrolled through its parent section.
 * A depth factor < 1 makes the layer move slower than the viewport
 * (classic parallax effect — simulating depth into the Earth).
 */
function initParallax() {
  const sections = qsa('.parallax-section');
  if (!sections.length) return;

  // Depth factors per layer (deeper = slower movement)
  const depthMap = {
    'parallax-section--surface':   0.55,
    'parallax-section--crust':     0.45,
    'parallax-section--mantle':    0.35,
    'parallax-section--outercore': 0.25,
    'parallax-section--innercore': 0.15,
  };

  function updateParallax() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const bg = qs('.parallax-bg', section);
      if (!bg) return;

      // Determine depth factor from the section's modifier class
      let factor = 0.4;
      for (const [cls, val] of Object.entries(depthMap)) {
        if (section.classList.contains(cls)) { factor = val; break; }
      }

      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const relativeScroll = scrollY - sectionTop + window.innerHeight;
      const pct = relativeScroll / (sectionHeight + window.innerHeight);
      const offset = (pct - 0.5) * sectionHeight * factor;

      bg.style.transform = `translateY(${offset.toFixed(2)}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax(); // run once on load
}

// ── Mobile Nav Toggle ──────────────────────────────────────
function initMobileNav() {
  const toggle = qs('.nav-toggle');
  const links  = qs('.site-nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Animate hamburger → X
    const bars = qsa('span', toggle);
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  // Close menu when a link is clicked (single-page nav)
  qsa('a', links).forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const bars = qsa('span', toggle);
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    });
  });
}

// ── Scroll-reveal ──────────────────────────────────────────
function initScrollReveal() {
  const items = qsa('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(el => observer.observe(el));
}

// ── Active Nav Link ────────────────────────────────────────
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.site-nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParallax();
  initMobileNav();
  initScrollReveal();
  initActiveNav();
});
