/* ============================================
   ixtro — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initMobileMenu();
  initNavScroll();
  initTypingEffect();
});

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Nav Scroll Behavior ── */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Add border glow when scrolled
        if (currentScrollY > 10) {
          nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        } else {
          nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ── Typing Effect for Hero ── */
function initTypingEffect() {
  const tagline = document.querySelector('.hero-tagline');
  if (!tagline) return;

  // Add cursor after tagline text loads
  const cursor = document.createElement('span');
  cursor.classList.add('typing-cursor');

  // Wait for the reveal animation, then add cursor
  setTimeout(() => {
    tagline.appendChild(cursor);

    // Remove cursor after a few seconds
    setTimeout(() => {
      cursor.style.opacity = '0';
      cursor.style.transition = 'opacity 500ms ease-out';
      setTimeout(() => cursor.remove(), 500);
    }, 4000);
  }, 1200);
}

/* ── Smooth stagger for card grids ── */
function staggerCards() {
  const grids = document.querySelectorAll('.card-grid');
  grids.forEach((grid) => {
    const cards = grid.querySelectorAll('.card, .post-card, .contact-item');
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 80}ms`;
    });
  });
}

// Run stagger on load
staggerCards();
