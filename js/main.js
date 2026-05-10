/* =====================================================
   PIN BALMORAL ESG - Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar Scroll Behavior ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* ---- Urgency Bar + Navbar Offset ---- */
  const urgencyBar = document.getElementById('urgencyBar');
  const urgencyClose = document.getElementById('urgencyClose');

  function adjustNavbarTop() {
    if (!navbar) return;
    const barHeight = (urgencyBar && urgencyBar.offsetParent !== null) ? urgencyBar.offsetHeight : 0;
    navbar.style.top = barHeight + 'px';
  }

  adjustNavbarTop();
  window.addEventListener('resize', adjustNavbarTop);

  if (urgencyClose) {
    urgencyClose.addEventListener('click', () => {
      if (urgencyBar) {
        urgencyBar.style.display = 'none';
        adjustNavbarTop();
      }
    });
  }

  /* ---- Mobile Menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---- Scroll Animation (Intersection Observer) ---- */
  const animEls = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  animEls.forEach(el => observer.observe(el));

  /* ---- Counter Animation ---- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    const increment = target / steps;
    let current = 0;

    const isFloat = String(target).includes('.');
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    }, step);
  }

  const counterEls = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* ---- Hotel Tabs ---- */
  const hotelTabs = document.querySelectorAll('.hotel-tab');
  const hotelContents = document.querySelectorAll('.hotel-content');

  hotelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      hotelTabs.forEach(t => t.classList.remove('active'));
      hotelContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const activeContent = document.getElementById('hotel-' + target);
      if (activeContent) activeContent.classList.add('active');
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.navbar-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active-link', scrollPos >= top && scrollPos < bottom);
      }
    });
  });

  /* ---- Conic gradient PIN circle ---- */
  // Handled via CSS - animate on load
  const pinCircle = document.querySelector('.pin-circle');
  if (pinCircle) {
    setTimeout(() => {
      pinCircle.style.transition = 'background 1.5s ease';
    }, 500);
  }

  /* ---- Toast Notification ---- */
  window.showToast = function(msg, icon = 'fa-check-circle') {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastMsg';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  };

  /* ---- Hero CTA click feedback ---- */
  const heroCtas = document.querySelectorAll('.hero-actions .btn');
  heroCtas.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Redirecionando para o formulário de diagnóstico...', 'fa-arrow-right');
    });
  });


  /* ---- Animate progress bars on scroll ---- */
  const progressBars = document.querySelectorAll('[data-width]');
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width + '%';
        progressObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  progressBars.forEach(bar => progressObserver.observe(bar));

  /* ---- Reveal float cards after load ---- */
  setTimeout(() => {
    document.querySelectorAll('.hero-card-float-1, .hero-card-float-2').forEach(el => {
      el.style.opacity = '1';
    });
  }, 800);

  console.log('%c🏨 PIN Balmoral ESG', 'color:#D4A017;font-size:1.5rem;font-weight:bold;');
  console.log('%cPlataforma carregada com sucesso!', 'color:#40916C;font-size:1rem;');
});

