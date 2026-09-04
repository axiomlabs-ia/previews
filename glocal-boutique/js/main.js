/* G'Local Boutique — Main JS */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const initHeader = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    function handleScroll() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  };

  // --- Mobile nav toggle ---
  const initMobileNav = () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    if (!navToggle || !navMobile) return;

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMobile.classList.toggle('open');
      document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
    });

    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  };

  // --- Scroll reveal ---
  const initReveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  };

  // --- Smooth scroll for anchor links ---
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  };

  // --- Parallax on hero ---
  const initParallax = () => {
    const heroImg = document.querySelector('.hero-bg-img');
    if (!heroImg) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        heroImg.style.transform = `scale(1.1) translateY(${window.scrollY * 0.15}px)`;
      }
    }, { passive: true });
  };

  // Use a small delay to let Components.inject() render the header/footer first
  setTimeout(() => {
    initHeader();
    initMobileNav();
    initReveal();
    initSmoothScroll();
    initParallax();
  }, 10);

});
