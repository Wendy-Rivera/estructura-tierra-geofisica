(function () {
  var lenis = null;
  var headerOffset = 128;
  var enableSmoothWheel = false;

  function safeScrollToElement(element, immediate) {
    if (!element) {
      return;
    }

    if (lenis) {
      lenis.scrollTo(element, {
        offset: -headerOffset,
        immediate: !!immediate,
        duration: 0.65
      });
      return;
    }

    var targetTop = element.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: targetTop, behavior: immediate ? "auto" : "smooth" });
  }

  function bindAnchorFix() {
    var localAnchors = document.querySelectorAll('a[href^="#"]');

    localAnchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var href = anchor.getAttribute("href");

        if (!href || href.length < 2) {
          return;
        }

        var id = href.slice(1);
        var target = document.getElementById(id);

        if (!target) {
          return;
        }

        event.preventDefault();
        safeScrollToElement(target, false);

        if (history && history.replaceState) {
          history.replaceState(null, "", "#" + id);
        }
      });
    });

    if (window.location.hash) {
      var hashId = decodeURIComponent(window.location.hash.slice(1));
      var hashTarget = document.getElementById(hashId);

      if (hashTarget) {
        window.setTimeout(function () {
          safeScrollToElement(hashTarget, true);
        }, 70);
      }
    }
  }

  function initLenis() {
    if (!window.Lenis || !enableSmoothWheel) {
      return;
    }

    lenis = new window.Lenis({
      duration: 0.5,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.2,
      syncTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  function initParticles() {
    if (!window.tsParticles) {
      return;
    }

    var container = document.getElementById("tsparticles");
    if (!container) {
      return;
    }

    function runParticles() {
      window.tsParticles.load({
        id: "tsparticles",
        options: {
          fullScreen: {
            enable: false
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 34,
              density: {
                enable: true,
                area: 900
              }
            },
            color: {
              value: ["#FF6B35", "#FFD166", "#16C79A", "#7AA2FF"]
            },
            opacity: {
              value: { min: 0.1, max: 0.35 }
            },
            size: {
              value: { min: 1, max: 2.2 }
            },
            move: {
              enable: true,
              direction: "bottom",
              speed: { min: 0.22, max: 0.8 },
              random: true,
              outModes: {
                default: "out"
              }
            }
          },
          detectRetina: true
        }
      });
    }

    if (window.loadBasic) {
      window.loadBasic(window.tsParticles).then(runParticles).catch(runParticles);
    } else {
      runParticles();
    }
  }

  function initGsap() {
    if (!window.gsap) {
      return;
    }

    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      if (lenis) {
        lenis.on("scroll", window.ScrollTrigger.update);
      }
    }

    window.gsap.from("[data-hero-title]", {
      y: 120,
      x: -60,
      opacity: 0,
      rotate: -2,
      duration: 1.25,
      ease: "power4.out"
    });

    window.gsap.from("[data-hero-copy]", {
      y: 42,
      opacity: 0,
      duration: 1,
      delay: 0.25,
      ease: "power3.out"
    });

    window.gsap.from("[data-hero-media]", {
      x: function (index) {
        return index % 2 === 0 ? 95 : -95;
      },
      y: 70,
      opacity: 0,
      rotate: function (index) {
        return index % 2 === 0 ? 5 : -5;
      },
      stagger: 0.12,
      duration: 1,
      delay: 0.2,
      ease: "power3.out"
    });

    var animatedBlocks = window.gsap.utils.toArray("[data-anim-in]");
    animatedBlocks.forEach(function (block, index) {
      window.gsap.from(block, {
        scrollTrigger: window.ScrollTrigger
          ? {
              trigger: block,
              start: "top 88%",
              once: true
            }
          : null,
        y: 72,
        x: index % 2 === 0 ? -35 : 35,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out"
      });
    });
  }

  initLenis();
  bindAnchorFix();
  initParticles();
  initGsap();
})();
