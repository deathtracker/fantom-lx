// =============================================
//  FANTOM.LX — script.js
//  Handles animations, interactions, and UI
// =============================================

// --- SCROLL REVEAL ANIMATIONS ---
function initReveal() {
  const elements = document.querySelectorAll('.feature-card, .step, .price-card, .subject-tag, .dash-stat-card, .dash-card');
  elements.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

// --- NAVBAR SCROLL EFFECT ---
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(5,5,8,0.98)';
    } else {
      navbar.style.background = 'rgba(5,5,8,0.85)';
    }
  });
}

// --- MOBILE NAV TOGGLE ---
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '70px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'rgba(5,5,8,0.98)';
    links.style.padding = '20px';
    links.style.borderBottom = '1px solid #1e1e2e';
  });
}

// --- DRAG & DROP UPLOAD ---
function initUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  if (!dropZone) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }
}

function handleFile(file) {
  showModal();
  simulateProcessing();
}

// --- MODAL ---
function showModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('visible');
}

function hideModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('visible');
}

function simulateProcessing() {
  const steps = document.querySelectorAll('.processing-step');
  if (!steps.length) return;
  steps.forEach(s => { s.classList.remove('done', 'active'); });
  let i = 0;
  function next() {
    if (i > 0) steps[i-1].classList.replace('active', 'done');
    if (i < steps.length) {
      steps[i].classList.add('active');
      i++;
      setTimeout(next, 1200);
    }
  }
  next();
}

function initModal() {
  const closeBtn = document.getElementById('modalClose');
  const uploadBtn = document.getElementById('uploadBtn');
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (uploadBtn) uploadBtn.addEventListener('click', () => {
    showModal();
    simulateProcessing();
  });
  document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) hideModal();
  });
}

// --- SMOOTH SCROLL FOR NAV LINKS ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- INIT ALL ---
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNavbar();
  initMobileNav();
  initUpload();
  initModal();
  initSmoothScroll();
});
