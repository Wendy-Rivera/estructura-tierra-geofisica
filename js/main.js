/**
 * main.js
 * Geociencias: Estructura, Tiempo y Campos de la Tierra
 * "Deep Earth Abyss" Interactive Behaviours
 *
 * • Vertical parallax scrolling (index.html)
 * • Mobile navigation toggle
 * • Scroll-reveal for .reveal elements
 * • Active nav-link highlighting
 * • 3D card tilt effect (gallery & blog items)
 * • Video play button interaction
 */

'use strict';

// ── Helpers ────────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Parallax ───────────────────────────────────────────────
function initParallax() {
  const sections = qsa('.parallax-section');
  if (!sections.length) return;

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

      let factor = 0.4;
      for (const [cls, val] of Object.entries(depthMap)) {
        if (section.classList.contains(cls)) { factor = val; break; }
      }

      const sectionTop     = section.offsetTop;
      const sectionHeight  = section.offsetHeight;
      const relativeScroll = scrollY - sectionTop + window.innerHeight;
      const pct    = relativeScroll / (sectionHeight + window.innerHeight);
      const offset = (pct - 0.5) * sectionHeight * factor;

      bg.style.transform = `translateY(${offset.toFixed(2)}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}

// ── Mobile Nav Toggle ──────────────────────────────────────
function initMobileNav() {
  const toggle = qs('.nav-toggle');
  const links  = qs('.site-nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

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
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Staggered delay for grid items
          const delay = (i % 4) * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
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

// ── 3D Card Tilt Effect ────────────────────────────────────
/**
 * Adds a subtle 3D perspective tilt on mouse move
 * for .glass-card, .gallery-item, and .video-card elements.
 * Resets smoothly on mouse leave.
 */
function initCardTilt() {
  const cards = qsa('.glass-card, .gallery-item, .video-card');
  if (!cards.length || window.matchMedia('(max-width: 768px)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -6;   // ±6deg vertical
      const rotY   = ((x - cx) / cx) *  6;   // ±6deg horizontal
      card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Video Play Button ──────────────────────────────────────
function initVideoPlayButtons() {
  const playBtns = qsa('.play-btn');
  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.video-card');
      if (!card) return;
      const title = card.querySelector('h3');
      if (title) {
        // Visual feedback — pulse the button
        btn.style.transform = 'scale(1.3)';
        btn.style.background = 'var(--clr-core)';
        setTimeout(() => {
          btn.style.transform = '';
          btn.style.background = '';
        }, 400);
      }
    });
  });
}

// ── Smooth Hero Scroll ─────────────────────────────────────
function initHeroScroll() {
  const heroBtn = qs('a[href="#presentation"]');
  if (!heroBtn) return;
  heroBtn.addEventListener('click', e => {
    e.preventDefault();
    const target = qs('#presentation');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParallax();
  initMobileNav();
  initScrollReveal();
  initActiveNav();
  initCardTilt();
  initVideoPlayButtons();
  initHeroScroll();
});

