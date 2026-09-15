// ============================================
// Living Waters Incorporated — Site Scripts
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu after tapping a link (mobile)
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav dropdown (Our Wings) ---------- */
  var dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var parent = toggle.closest('.has-dropdown');
      if (!parent) return;
      var isOpen = parent.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-dropdown.open').forEach(function (parent) {
      if (!parent.contains(e.target)) {
        parent.classList.remove('open');
        var t = parent.querySelector('.dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---------- Floating social sidebar toggle ---------- */
  var socialFloat = document.getElementById('socialFloat');
  var socialToggle = document.getElementById('socialFloatToggle');

  if (socialFloat && socialToggle) {
    socialToggle.addEventListener('click', function () {
      var collapsed = socialFloat.classList.toggle('collapsed');
      socialToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  }

  /* ---------- Pinned scroll-scrub gallery ---------- */
  function initScrubGalleries() {
    var sections = document.querySelectorAll('.scrub-gallery');
    if (!sections.length) return;

    var desktopMq = window.matchMedia('(min-width: 781px)');
    var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    sections.forEach(function (section) {
      var sticky = section.querySelector('.scrub-sticky');
      var track = section.querySelector('.scrub-track');
      var fill = section.querySelector('.scrub-progress-fill');
      if (!sticky || !track) return;

      function pinnedModeActive() {
        return desktopMq.matches && !reduceMq.matches;
      }

      function maxTranslate() {
        return Math.max(track.scrollWidth - sticky.clientWidth, 0);
      }

      function layout() {
        if (!pinnedModeActive()) {
          section.style.height = '';
          track.style.transform = '';
          if (fill) fill.style.width = '0%';
          return;
        }
        section.style.height = (window.innerHeight + maxTranslate()) + 'px';
      }

      function update() {
        if (!pinnedModeActive()) return;
        var rect = section.getBoundingClientRect();
        var scrollRoom = section.offsetHeight - window.innerHeight;
        var scrolledInto = -rect.top;
        var progress = scrollRoom > 0
          ? Math.min(Math.max(scrolledInto / scrollRoom, 0), 1)
          : 0;
        var translate = progress * maxTranslate();
        track.style.transform = 'translateX(' + (-translate) + 'px)';
        if (fill) fill.style.width = (progress * 100) + '%';
      }

      layout();
      update();

      window.addEventListener('resize', function () {
        layout();
        update();
      });

      window.addEventListener('scroll', function () {
        window.requestAnimationFrame(update);
      }, { passive: true });
    });
  }

  initScrubGalleries();

  /* ---------- Animated stat counters ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statNumbers.length) {
    var statsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statNumbers.forEach(function (el) { statsObserver.observe(el); });
  } else {
    // Fallback: just set the final numbers
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ---------- Testimonial carousel controls ---------- */
  var voicesTrack = document.getElementById('voicesTrack');
  var voicesPrev = document.getElementById('voicesPrev');
  var voicesNext = document.getElementById('voicesNext');

  function scrollVoices(direction) {
    if (!voicesTrack) return;
    var card = voicesTrack.querySelector('.voice-card');
    var scrollAmount = card ? card.getBoundingClientRect().width + 24 : 300;
    voicesTrack.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  if (voicesPrev) voicesPrev.addEventListener('click', function () { scrollVoices(-1); });
  if (voicesNext) voicesNext.addEventListener('click', function () { scrollVoices(1); });

  /* ---------- Gallery lightbox (images + videos) ---------- */
  var galleryItems = document.querySelectorAll('.gallery-item');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxVideo = document.getElementById('lightboxVideo');
  var lightboxClose = document.getElementById('lightboxClose');

  function openLightboxImage(src, alt) {
    if (!lightbox || !lightboxImg) return;
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.removeAttribute('poster');
      lightboxVideo.load();
      lightboxVideo.hidden = true;
    }
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightboxImg.hidden = false;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function openLightboxVideo(src, poster) {
    if (!lightbox || !lightboxVideo) return;
    lightboxImg.hidden = true;
    lightboxVideo.hidden = false;
    if (poster) {
      lightboxVideo.setAttribute('poster', poster);
    } else {
      lightboxVideo.removeAttribute('poster');
    }
    lightboxVideo.src = src;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxVideo.play().catch(function () { /* autoplay may be blocked; controls remain available */ });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.removeAttribute('poster');
      lightboxVideo.load();
    }
  }

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var videoSrc = item.getAttribute('data-video');
      if (videoSrc) {
        var posterImg = item.querySelector('img');
        openLightboxVideo(videoSrc, posterImg ? posterImg.src : '');
        return;
      }
      var full = item.getAttribute('data-full');
      var img = item.querySelector('img');
      openLightboxImage(full, img ? img.alt : '');
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Back to top button ---------- */
  var backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Newsletter form (front-end only) ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  var newsletterNote = document.getElementById('newsletterNote');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('newsletterEmail');
      if (emailInput && emailInput.value) {
        newsletterNote.textContent = 'Thanks! We\u2019ll be in touch at ' + emailInput.value + '.';
        newsletterForm.reset();
      }
    });
  }

  /* ---------- Other front-end-only forms (member, booking, contact) ---------- */
  function wireSimpleForm(formId, noteId, message) {
    var form = document.getElementById(formId);
    var note = document.getElementById(noteId);
    if (!form || !note) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent = message;
      form.reset();
    });
  }

  wireSimpleForm('memberForm', 'memberFormNote', 'Thanks for your interest! We\u2019ll reach out soon about next steps.');
  wireSimpleForm('bookingForm', 'bookingFormNote', 'Thanks! Your booking request has been received \u2014 we\u2019ll follow up shortly.');
  wireSimpleForm('contactForm', 'contactFormNote', 'Thanks for reaching out! We\u2019ll get back to you soon.');

});
