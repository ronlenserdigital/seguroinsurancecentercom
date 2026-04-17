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
const WEB3FORMS_ACCESS_KEY = '8d3f79bb-68c3-428b-966e-adf925560724';
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

    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', `New ${formLabel} — Seguro Insurance Center`);
    formData.append('from_name', 'Seguro Insurance Website');

    // Build clean readable message — plain text, one field per line
    const skip = ['access_key', 'subject', 'from_name', 'botcheck', 'message'];
    const lines = [];
    for (const [key, value] of formData.entries()) {
      if (!skip.includes(key) && value && value.toString().trim()) {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        lines.push(`${label}: ${value}`);
      }
    }
    // Use set not append — ensures only one message field
    formData.delete('message');
    formData.append('message', lines.join('\r\n'));

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  function showSuccessState(form, lang, successMessage) {
    // Hide all form content and show a success panel
    const existing = form.querySelector('.form-success-state');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'form-success-state';
    panel.innerHTML = `
      <div class="form-success-icon">✓</div>
      <div class="form-success-title">${lang === 'es' ? '¡Enviado!' : 'Sent!'}</div>
      <div class="form-success-msg">${successMessage[lang]}</div>
      <button type="button" class="btn btn-primary form-success-btn" style="margin-top:18px;">
        ${lang === 'es' ? 'Enviar Otro' : 'Submit Another'}
      </button>
    `;

    // Hide form contents
    Array.from(form.children).forEach(el => el.style.display = 'none');
    form.appendChild(panel);

    // Reset + restore on "Submit Another"
    panel.querySelector('.form-success-btn').addEventListener('click', () => {
      form.reset();
      if (form.querySelector('.form-step')) goToStep(form, 1);
      Array.from(form.children).forEach(el => el.style.display = '');
      panel.remove();
    });
  }

  function handleFormSubmit(form, formLabel, successMessage) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = html.getAttribute('data-lang') || 'en';
      const isSkip = e.submitter && e.submitter.classList.contains('btn-link');

      // Validate required fields unless skipping
      if (!isSkip) {
        const requiredFields = form.querySelectorAll('[required]');
        let firstInvalid = null;
        for (const field of requiredFields) {
          if (!field.value.trim()) { firstInvalid = field; break; }
        }
        if (firstInvalid) {
          const parentStep = firstInvalid.closest('.form-step');
          if (parentStep) goToStep(form, parseInt(parentStep.dataset.step, 10));
          firstInvalid.focus();
          firstInvalid.style.borderColor = '#ff6b6b';
          setTimeout(() => (firstInvalid.style.borderColor = ''), 2500);
          return;
        }
      }

      // Find the submit button — handle both step-3 submit and skip btn
      const btn = e.submitter ||
        form.querySelector('.form-step.active button[type="submit"]') ||
        form.querySelector('button[type="submit"]');

      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span>${lang === 'es' ? 'Enviando…' : 'Sending…'}</span>`;

      try {
        const result = await submitToWeb3Forms(form, formLabel);
        if (result.success) {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
          showSuccessState(form, lang, successMessage);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Form error:', err);
        btn.innerHTML = `<span>⚠ ${lang === 'es' ? 'Error — llama directamente' : 'Error — please call us'}</span>`;
        setTimeout(() => { btn.disabled = false; btn.innerHTML = originalHTML; }, 3400);
      }
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
