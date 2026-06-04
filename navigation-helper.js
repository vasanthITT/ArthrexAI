// navigation-helper.js
// FIX: This file was referenced in curriculum.html but did not exist (404 error).
// Provides mobile sidebar toggle for curriculum page.

document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle for curriculum page
  const sidebar = document.querySelector('.module-sidebar');
  if (!sidebar) return;

  // Create hamburger button if not present
  let hamburger = document.getElementById('curriculumHamburger');
  if (!hamburger) {
    hamburger = document.createElement('button');
    hamburger.id = 'curriculumHamburger';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Toggle course menu');
    hamburger.style.cssText = 'display:none;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;padding:8px 12px;border-radius:8px;font-size:1.1rem;cursor:pointer;margin-right:12px;';
    const topbarLeft = document.querySelector('.topbar-left');
    if (topbarLeft) topbarLeft.prepend(hamburger);
  }

  // Create overlay
  let overlay = document.getElementById('curriculumOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'curriculumOverlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:299;';
    document.body.appendChild(overlay);
  }

  function showHamburger() {
    if (window.innerWidth <= 768) {
      hamburger.style.display = 'flex';
    } else {
      hamburger.style.display = 'none';
      sidebar.classList.remove('mobile-open');
      overlay.style.display = 'none';
    }
  }

  hamburger.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', !isOpen);
    overlay.style.display = isOpen ? 'none' : 'block';
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.style.display = 'none';
  });

  window.addEventListener('resize', showHamburger);
  showHamburger();
});
