/**
 * main.js
 * Estructura Interna de la Tierra, Tiempo Geológico y Campos Geofísicos
 * "Deep Earth Abyss" Interactive Behaviours
 *
 * • Three.js animated layered-Earth globe (index hero)
 * • Vertical parallax scrolling (index.html)
 * • Mobile navigation toggle
 * • Scroll-reveal for .reveal elements
 * • Active nav-link highlighting
 * • 3D card tilt effect (gallery & blog items)
 * • Video play button interaction
 * • Scroll progress bar
 * • Animated stat counters
 * • Back-to-top button
 */

'use strict';

// ── Helpers ────────────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Keep in sync with CSS @media (max-width: 768px)
const MOBILE_BREAKPOINT = 768;

// ── Three.js Hero Canvas ───────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 5;

  // ── Outer wireframe sphere (seismic network / surface) ──
  const outerGeo = new THREE.IcosahedronGeometry(2, 4);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x00D4FF,
    wireframe: true,
    transparent: true,
    opacity: 0.10,
  });
  const outerSphere = new THREE.Mesh(outerGeo, outerMat);

  // ── Mid sphere (manto) ──
  const midGeo = new THREE.IcosahedronGeometry(1.35, 3);
  const midMat = new THREE.MeshBasicMaterial({
    color: 0xFF4500,
    wireframe: true,
    transparent: true,
    opacity: 0.14,
  });
  const midSphere = new THREE.Mesh(midGeo, midMat);

  // ── Inner core sphere (glowing solid) ──
  const coreGeo = new THREE.SphereGeometry(0.55, 48, 48);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xFFD700,
    transparent: true,
    opacity: 0.92,
  });
  const coreSphere = new THREE.Mesh(coreGeo, coreMat);

  // ── Particles (seismic station network) ──
  const PARTICLE_COUNT = 900;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 2.2 + Math.random() * 1.2;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const ptMat = new THREE.PointsMaterial({
    color: 0x00D4FF,
    size: 0.018,
    transparent: true,
    opacity: 0.55,
  });
  const particles = new THREE.Points(ptGeo, ptMat);

  scene.add(outerSphere, midSphere, coreSphere, particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    outerSphere.rotation.y  = t * 0.25;
    outerSphere.rotation.x  = t * 0.08;
    midSphere.rotation.y    = -t * 0.38;
    midSphere.rotation.z    = t * 0.18;
    particles.rotation.y    = t * 0.12;

    // Pulsating core
    const pulse = 1 + 0.12 * Math.sin(t * 2.5);
    coreSphere.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });
}

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

  let revealCount = 0;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = (revealCount % 4) * 80;
          revealCount++;
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
function initCardTilt() {
  const cards = qsa('.glass-card, .gallery-item, .video-card');
  if (!cards.length || window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -6;
      const rotY   = ((x - cx) / cx) *  6;
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
      btn.style.transform = 'scale(1.3)';
      btn.style.background = 'var(--clr-core)';
      setTimeout(() => {
        btn.style.transform = '';
        btn.style.background = '';
      }, 400);
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

// ── Scroll Progress Bar ────────────────────────────────────
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  function updateBar() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = pct.toFixed(2) + '%';
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

// ── Back to Top ────────────────────────────────────────────
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver al inicio');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Animated Stat Counters ─────────────────────────────────
function initCounters() {
  const counters = qsa('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseFloat(el.dataset.target);
      const isFloat = el.dataset.target.includes('.');
      const duration = 1800;
      const start    = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = target * ease;
        el.textContent = isFloat
          ? value.toFixed(1)
          : Math.round(value).toLocaleString('es');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initParallax();
  initMobileNav();
  initScrollReveal();
  initActiveNav();
  initCardTilt();
  initVideoPlayButtons();
  initHeroScroll();
  initScrollProgress();
  initBackToTop();
  initCounters();
});

