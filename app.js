// Sidebar navigation
const navItems = document.querySelectorAll('.nav-item[data-section]');
const sections = document.querySelectorAll('.content-section');

// Clear search bar on every page load — prevent browser autofill persistence
(function clearSearch() {
  const s = document.getElementById('mainSearch');
  if (!s) return;
  s.value = '';
  s.setAttribute('autocomplete', 'off');
  // Double-clear trick for Chrome autofill
  s.setAttribute('readonly', true);
  setTimeout(() => { s.removeAttribute('readonly'); s.value = ''; }, 50);
})();

function showSection(sectionId) {
  sections.forEach(s => s.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));

  const target = document.getElementById('section-' + sectionId);
  if (target) target.classList.add('active');

  const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Lazy-load admin iframe only when admin navigates to admin section
  if (sectionId === 'admin') {
    const wrap = document.getElementById('adminIframeWrap');
    if (wrap && !wrap.querySelector('iframe')) {
      const session = JSON.parse(localStorage.getItem('aai_session') || 'null');
      if (session && session.role === 'admin') {
        const iframe = document.createElement('iframe');
        iframe.src = 'admin.html';
        iframe.style.cssText = 'width:100%;height:calc(100vh - 180px);border:none;border-radius:12px;background:#13131f;';
        iframe.title = 'Admin Panel';
        wrap.appendChild(iframe);
      } else {
        wrap.innerHTML = '<div style="text-align:center;padding:60px;color:#64748b">⛔ Admin access required. Please log in as admin.</div>';
      }
    }
  }
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.getAttribute('data-section');
    const sectionMap = {
      home: 'home', live: 'live', masterclass: 'masterclass',
      trending: 'trending', courses: 'home', success: 'success', mycourses: 'home',
      agentic: 'agentic', genai: 'genai',
      datascience: 'datascience', domainai: 'domainai',
      programming: 'programming', admin: 'admin',
      progress: 'home', certificates: 'home', settings: 'home'
    };
    showSection(sectionMap[section] || 'home');
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

// Filter tabs — filter cards by tag, hide orphan subsection headers
document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
  tabGroup.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.textContent.trim().toLowerCase();
      const section = tabGroup.closest('.content-section');
      const cards = section.querySelectorAll('.master-card, .live-card, .course-card');

      cards.forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const tag = card.querySelector('.tag');
          const tagText = tag ? tag.textContent.trim().toLowerCase() : '';
          card.style.display = tagText.includes(filter) ? '' : 'none';
        }
      });

      // FIX: Hide subsection headers that have no visible cards beneath them
      section.querySelectorAll('.subsection-header').forEach(header => {
        let next = header.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('subsection-header')) {
          if ((next.classList.contains('master-card') || next.classList.contains('course-card')) && next.style.display !== 'none') {
            hasVisible = true;
          }
          next = next.nextElementSibling;
        }
        header.style.display = hasVisible ? '' : 'none';
      });
    });
  });
});

// ── Mobile sidebar toggle ─────────────────────────────────────────────────────
const hamburgerBtn  = document.getElementById('hamburgerBtn');
const sidebar       = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar?.classList.add('mobile-open');
  sidebarOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar?.classList.remove('mobile-open');
  sidebarOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

hamburgerBtn?.addEventListener('click', () => {
  sidebar?.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
});
sidebarOverlay?.addEventListener('click', closeSidebar);

// Close sidebar when a nav item is clicked on mobile
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});
