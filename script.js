/* =============================================
   SEGURO INSURANCE CENTER
   script.js
   ============================================= */

/* ---------------------------------------------
   ⚙️  WEB3FORMS SETUP
   ---------------------------------------------
   1. Create a free account at https://web3forms.com
   2. Register the email that should receive leads
      (e.g. leads@seguroinsurance.com)
   3. Copy the Access Key and paste it below.
      That's it — both forms (Quick Quote + Contact)
      will submit straight to the client's inbox.
--------------------------------------------- */
const WEB3FORMS_ACCESS_KEY = 'PASTE-YOUR-ACCESS-KEY-HERE';
/* --------------------------------------------- */


(function () {
  'use strict';

  // ---------- PRELOADER ----------
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    document.body.classList.add('loaded');
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 700);
    }, 500);
  });

  // ---------- LANGUAGE TOGGLE ----------
  const STORAGE_KEY = 'seguro-lang';
  const langToggle = document.getElementById('langToggle');
  const langOptions = document.querySelectorAll('.lang-option');
  const html = document.documentElement;

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'es') lang = 'en';

    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);

    // Update active pill state
    langOptions.forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.langOption === lang);
    });

    // Swap all text content
    document.querySelectorAll('[data-en]').forEach((el) => {
      const text = el.dataset[lang];
      if (text !== undefined) el.textContent = text;
    });

    // Swap placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach((el) => {
      const placeholder = el.dataset[`${lang}Placeholder`];
      if (placeholder !== undefined) el.setAttribute('placeholder', placeholder);
    });

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage unavailable — no-op */
    }
  }

  langToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-lang') || 'en';
    setLanguage(current === 'en' ? 'es' : 'en');
  });

  // Init language from storage or browser
  (function initLang() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) { /* no-op */ }

    if (saved === 'en' || saved === 'es') {
      setLanguage(saved);
    } else {
      // Detect Spanish browsers
      const browserLang = (navigator.language || 'en').toLowerCase();
      setLanguage(browserLang.startsWith('es') ? 'es' : 'en');
    }
  })();

  // ---------- NAV SCROLL STATE ----------
  const nav = document.getElementById('nav');
  let ticking = false;

  function updateNav() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // ---------- MOBILE MENU ----------
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // ---------- SCROLL REVEAL ----------
  const revealEls = document.querySelectorAll(
    '.service-card, .process-step, .about-point, .about-stat-card, .faq-item, .visit-block, .contact-direct-item, .section-head'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger within a group if card-like
            const el = entry.target;
            const siblings = Array.from(
              el.parentElement ? el.parentElement.children : []
            ).filter((s) => s.classList && (
              s.classList.contains('service-card') ||
              s.classList.contains('process-step') ||
              s.classList.contains('about-stat-card') ||
              s.classList.contains('faq-item')
            ));
            const idx = siblings.indexOf(el);
            const delay = idx > -1 ? idx * 80 : 0;
            setTimeout(() => el.classList.add('visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ---------- HERO STAGGERED REVEAL ----------
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    el.style.setProperty('--delay', delay);
  });

  // ---------- FORM SUBMISSIONS (Web3Forms) ----------
  async function submitToWeb3Forms(form, formLabel) {
    const formData = new FormData(form);

    // Inject Web3Forms-required fields
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `New ${formLabel} — Seguro Insurance Center`);
    formData.append('from_name', 'Seguro Insurance Website');

    // Honeypot spam trap (Web3Forms reads this field)
    if (!formData.has('botcheck')) formData.append('botcheck', '');

    // Friendly formatted message for the email body
    const entries = {};
    formData.forEach((value, key) => {
      if (!['access_key', 'subject', 'from_name', 'botcheck'].includes(key) && value) {
        entries[key] = value;
      }
    });
    const prettyMessage = Object.entries(entries)
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
      .join('\n');
    formData.append('message', prettyMessage);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  function handleFormSubmit(form, formLabel, successMessage) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const lang = html.getAttribute('data-lang') || 'en';

      // Validate required fields across all steps
      const requiredFields = form.querySelectorAll('[required]');
      let firstInvalid = null;
      for (const field of requiredFields) {
        if (!field.value.trim()) {
          firstInvalid = field;
          break;
        }
      }

      if (firstInvalid) {
        const parentStep = firstInvalid.closest('.form-step');
        if (parentStep) {
          const stepNum = parseInt(parentStep.dataset.step, 10);
          goToStep(form, stepNum);
        }
        firstInvalid.focus();
        firstInvalid.style.borderColor = '#ff6b6b';
        setTimeout(() => (firstInvalid.style.borderColor = ''), 2500);
        return;
      }

      const btn = e.submitter || form.querySelector('button[type="submit"]:not([data-next]):not([data-prev])');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span>${lang === 'es' ? 'Enviando…' : 'Sending…'}</span>`;

      try {
        // Bail gracefully if the key hasn't been set yet (dev-mode fallback)
        if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'PASTE-YOUR-ACCESS-KEY-HERE') {
          // Simulated success so the UI still demos correctly pre-deployment.
          await new Promise((r) => setTimeout(r, 700));
          btn.innerHTML = `<span>✓ ${successMessage[lang]}</span>`;
          form.reset();
          if (form.querySelector('.form-step')) goToStep(form, 1);
          console.warn('[Web3Forms] No access key configured — form submission simulated. Paste your key into WEB3FORMS_ACCESS_KEY in script.js to enable live email delivery.');
        } else {
          const result = await submitToWeb3Forms(form, formLabel);
          if (result.success) {
            btn.innerHTML = `<span>✓ ${successMessage[lang]}</span>`;
            form.reset();
            if (form.querySelector('.form-step')) goToStep(form, 1);
          } else {
            throw new Error(result.message || 'Submission failed');
          }
        }
      } catch (err) {
        console.error('Form submission error:', err);
        btn.innerHTML = `<span>⚠ ${lang === 'es' ? 'Error — llama directamente' : 'Error — please call us'}</span>`;
      }

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }, 3400);
    });
  }

  // Multi-step navigation
  function goToStep(form, targetStep) {
    const steps = form.querySelectorAll('.form-step');
    const dots = form.parentElement.querySelectorAll('.step-dot');
    const lines = form.parentElement.querySelectorAll('.step-line');

    steps.forEach((s) => {
      s.classList.toggle('active', parseInt(s.dataset.step, 10) === targetStep);
    });

    dots.forEach((d) => {
      const num = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', num === targetStep);
      d.classList.toggle('completed', num < targetStep);
    });

    lines.forEach((l, idx) => {
      l.classList.toggle('filled', idx < targetStep - 1);
    });
  }

  // Wire up step navigation buttons
  document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = btn.closest('form');
      const currentStep = btn.closest('.form-step');

      // Validate required fields in current step before advancing
      const requiredInCurrent = currentStep.querySelectorAll('[required]');
      let valid = true;
      for (const field of requiredInCurrent) {
        if (!field.value.trim()) {
          field.focus();
          field.style.borderColor = '#ff6b6b';
          setTimeout(() => (field.style.borderColor = ''), 2500);
          valid = false;
          break;
        }
      }
      if (!valid) return;

      const target = parseInt(btn.dataset.next, 10);
      goToStep(form, target);
    });
  });

  document.querySelectorAll('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = btn.closest('form');
      const target = parseInt(btn.dataset.prev, 10);
      goToStep(form, target);
    });
  });

  const quickQuote = document.getElementById('quickQuote');
  if (quickQuote) {
    handleFormSubmit(quickQuote, 'Quote Request', {
      en: 'Quote Sent — We\'ll Call or Text You',
      es: 'Cotización Enviada — Te Llamamos o Mensaje',
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    handleFormSubmit(contactForm, 'Contact Message', {
      en: 'Message Sent — Talk Soon',
      es: 'Mensaje Enviado — Hablamos Pronto',
    });
  }

  // ---------- SMOOTH SCROLL (with nav offset) ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const topbarHeight = document.querySelector('.topbar').offsetHeight;
      const offset = navHeight + 10;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- FAQ SINGLE OPEN (optional — accordion style) ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  // ---------- DYNAMIC YEAR ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- HERO PARALLAX (subtle) ----------
  const heroGlows = document.querySelectorAll('.hero-glow');
  if (heroGlows.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroGlows.forEach((glow, i) => {
        const factor = i === 0 ? 20 : -15;
        glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    }, { passive: true });
  }

})();
