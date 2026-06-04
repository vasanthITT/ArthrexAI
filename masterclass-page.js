// ===== MASTERCLASS DETAIL PAGE =====
// Deep-link: masterclass.html?id=<mcId>
// Handles: full detail display, registration, countdown, share link, related masterclasses

const params   = new URLSearchParams(window.location.search);
const MC_ID    = params.get('id');
const BASE_URL = window.location.origin + window.location.pathname;

let _mc         = null;   // current masterclass object
let _countdownInterval = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMcStatus(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0 && diff > -10800000) return 'live';
  if (diff > 0) return 'upcoming';
  return 'ended';
}

function formatCountdown(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${String(hrs).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m`;
  return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

async function getAllMasterclasses() {
  try {
    const res = await fetch('/api/masterclasses');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch(e) {
    console.error('Error fetching masterclasses:', e);
  }
  return [];
}

function isRegistered(mcId) {
  const regs = JSON.parse(localStorage.getItem('lf_mc_registrations') || '{}');
  return !!regs[String(mcId)];
}

function getRegistration(mcId) {
  const regs = JSON.parse(localStorage.getItem('lf_mc_registrations') || '{}');
  return regs[String(mcId)] || null;
}

// ── Page init ─────────────────────────────────────────────────────────────────
async function initPage() {
  if (!MC_ID) {
    showNotFound();
    return;
  }

  let list = [];
  let fetchFailed = false;
  try {
    list = await getAllMasterclasses();
  } catch(e) {
    fetchFailed = true;
  }

  if (fetchFailed || !list.length) {
    // Retry once after 1 second in case server is slow
    await new Promise(r => setTimeout(r, 1000));
    try { list = await getAllMasterclasses(); } catch(e) {}
  }

  _mc = list.find(m => String(m.id) === String(MC_ID));

  if (!_mc) {
    showNotFound();
    return;
  }

  // Update page title and meta
  document.title = _mc.title + ' — Arthrex AI Masterclass';

  renderHero();
  renderDetails();
  renderRegistrationCard();
  renderDeepLink();
  renderRelated(list);
  startCountdown();

  document.getElementById('mcPageLoading').style.display = 'none';
  document.getElementById('mcPage').style.display = 'block';
}

function showNotFound() {
  document.getElementById('mcPageLoading').style.display = 'none';
  document.getElementById('mcNotFound').style.display = 'flex';
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function renderHero() {
  const m      = _mc;
  const status = getMcStatus(m.schedule);
  const sched  = new Date(m.schedule);

  // Background
  const heroBg = document.getElementById('mcHeroBg');
  if (m.thumb) {
    heroBg.style.backgroundImage = `url('${m.thumb}')`;
    heroBg.style.backgroundSize  = 'cover';
    heroBg.style.backgroundPosition = 'center';
  } else {
    heroBg.style.background = 'linear-gradient(135deg,#7c3aed 0%,#2563eb 50%,#0ea5e9 100%)';
  }

  // Breadcrumb tag
  document.getElementById('mcHeroTag').textContent = m.tag || 'Masterclass';

  // Status badge
  const statusRow = document.getElementById('mcStatusRow');
  if (status === 'live') {
    statusRow.innerHTML = `<span class="mc-status-badge mc-status-live">🔴 LIVE NOW</span>`;
  } else if (status === 'upcoming') {
    statusRow.innerHTML = `<span class="mc-status-badge mc-status-upcoming">⏰ Upcoming</span>`;
  } else {
    statusRow.innerHTML = `<span class="mc-status-badge mc-status-ended">✅ Session Ended</span>`;
  }

  // Title & desc
  document.getElementById('mcHeroTitle').textContent = m.title;
  document.getElementById('mcHeroDesc').textContent  = m.description || '';

  // Meta row
  const metaItems = [
    `📅 ${sched.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}`,
    `🕐 ${sched.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}`,
    m.duration   ? `⏱ ${m.duration}`   : null,
    m.instructor ? `👨‍🏫 ${m.instructor}` : null,
    m.rating     ? `⭐ ${m.rating}`     : null,
  ].filter(Boolean);

  document.getElementById('mcHeroMeta').innerHTML = metaItems
    .map(item => `<span class="mc-hero-meta-item">${item}</span>`)
    .join('');

  // Countdown banner
  if (status === 'upcoming') {
    document.getElementById('mcCountdownBanner').style.display = 'flex';
  }
}

// ── Details ───────────────────────────────────────────────────────────────────
function renderDetails() {
  const m     = _mc;
  const sched = new Date(m.schedule);
  const status = getMcStatus(m.schedule);

  // About text
  document.getElementById('mcAboutText').textContent =
    m.description ||
    `Join us for this free live masterclass on ${m.title}. This session is designed to give you practical, hands-on knowledge you can apply immediately. Whether you're a beginner or an experienced professional, this masterclass will provide valuable insights and real-world examples.`;

  // What you'll learn
  const learns = m.learnPoints || [
    `Core concepts and fundamentals of ${m.tag || 'the topic'}`,
    'Live demonstrations with real-world examples',
    'Hands-on exercises you can follow along',
    'Q&A session — get your questions answered live',
    'Best practices used by industry professionals',
    'Resources and next steps to continue learning',
  ];
  document.getElementById('mcLearnGrid').innerHTML = learns
    .map(l => `<li class="mc-learn-item"><span class="mc-learn-check">✓</span><span>${l}</span></li>`)
    .join('');

  // Session details grid
  const details = [
    { icon: '📅', label: 'Date',       value: sched.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'}) },
    { icon: '🕐', label: 'Time',       value: sched.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) + ' IST' },
    { icon: '⏱',  label: 'Duration',   value: m.duration || '2 hours' },
    { icon: '🎓', label: 'Format',     value: 'Live Online Session' },
    { icon: '💰', label: 'Cost',       value: 'Completely Free' },
    { icon: '🌐', label: 'Language',   value: 'English' },
    { icon: '📊', label: 'Level',      value: 'All Levels Welcome' },
    { icon: '🏆', label: 'Status',     value: status === 'live' ? '🔴 Live Now' : status === 'upcoming' ? '⏰ Upcoming' : '✅ Ended' },
  ];
  if (m.instructor) details.splice(2, 0, { icon: '👨‍🏫', label: 'Instructor', value: m.instructor });

  document.getElementById('mcDetailsGrid').innerHTML = details
    .map(d => `
      <div class="mc-detail-item">
        <span class="mc-detail-icon">${d.icon}</span>
        <div>
          <div class="mc-detail-label">${d.label}</div>
          <div class="mc-detail-value">${d.value}</div>
        </div>
      </div>`)
    .join('');

  // Instructor card
  if (m.instructor) {
    document.getElementById('mcInstructorSection').style.display = 'block';
    const initials = m.instructor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('mcInstructorCard').innerHTML = `
      <div class="mc-inst-avatar">${initials}</div>
      <div class="mc-inst-info">
        <div class="mc-inst-name">${m.instructor}</div>
        <div class="mc-inst-role">AI Instructor · Arthrex AI</div>
        <p class="mc-inst-bio">Expert instructor with hands-on industry experience in ${m.tag || 'AI & Technology'}. Passionate about making complex topics accessible to everyone.</p>
      </div>`;
  }
}

// ── Registration card ─────────────────────────────────────────────────────────
function renderRegistrationCard() {
  const m      = _mc;
  const status = getMcStatus(m.schedule);
  const sched  = new Date(m.schedule);
  const reg    = isRegistered(m.id);

  // Thumb
  const thumb = document.getElementById('mcRegCardThumb');
  if (m.thumb) {
    thumb.style.backgroundImage = `url('${m.thumb}')`;
    thumb.style.backgroundSize  = 'cover';
    thumb.style.backgroundPosition = 'center';
  } else {
    thumb.style.background = 'linear-gradient(135deg,#7c3aed,#2563eb)';
    thumb.innerHTML = `<span style="font-size:2.5rem">🎓</span>`;
  }

  // Meta
  document.getElementById('mcRegMeta').innerHTML = `
    <div class="mc-reg-meta-item">📅 ${sched.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
    <div class="mc-reg-meta-item">🕐 ${sched.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</div>
    ${m.duration ? `<div class="mc-reg-meta-item">⏱ ${m.duration}</div>` : ''}
    ${m.instructor ? `<div class="mc-reg-meta-item">👨‍🏫 ${m.instructor}</div>` : ''}
  `;

  // Join link box
  if (m.link && (status === 'live' || reg)) {
    document.getElementById('mcJoinLinkBox').style.display = 'block';
    const anchor = document.getElementById('mcJoinLinkAnchor');
    anchor.href        = m.link;
    anchor.textContent = m.link;
  }

  // Submit button text based on status
  const submitBtn = document.getElementById('mcpSubmitBtn');
  if (status === 'live') {
    submitBtn.textContent = '🔴 Register & Join Now';
    submitBtn.style.background = 'linear-gradient(135deg,#ef4444,#f97316)';
  } else if (status === 'ended') {
    submitBtn.textContent = '✅ Session Ended';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor  = 'not-allowed';
  } else {
    submitBtn.textContent = 'Register for Free →';
  }

  // Pre-fill from session if logged in
  try {
    const session = JSON.parse(localStorage.getItem('aai_session') || 'null');
    if (session) {
      const nameEl = document.getElementById('mcpName');
      const emailEl = document.getElementById('mcpEmail');
      if (nameEl && !nameEl.value)  nameEl.value  = session.name  || '';
      if (emailEl && !emailEl.value) emailEl.value = session.email || '';
    }
  } catch(e) {}

  // Already registered?
  if (reg) {
    document.getElementById('mcRegAlreadyDone').style.display = 'flex';
    document.getElementById('mcRegFormFields').style.display  = 'none';
  }
}

// ── Deep link ─────────────────────────────────────────────────────────────────
function renderDeepLink() {
  const deepLink = `${window.location.origin}${window.location.pathname}?id=${MC_ID}`;
  const input = document.getElementById('mcDeepLinkInput');
  if (input) input.value = deepLink;
}

function copyDeepLink() {
  const input = document.getElementById('mcDeepLinkInput');
  if (!input) return;
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById('mcCopyBtn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 2000); }
  }).catch(() => {
    input.select();
    document.execCommand('copy');
    const btn = document.getElementById('mcCopyBtn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 2000); }
  });
}

// Share button in topbar
document.getElementById('btnShare')?.addEventListener('click', () => {
  const deepLink = `${window.location.origin}${window.location.pathname}?id=${MC_ID}`;
  if (navigator.share) {
    navigator.share({ title: _mc?.title || 'Masterclass', url: deepLink })
      .catch(() => copyDeepLink());
  } else {
    copyDeepLink();
    const btn = document.getElementById('btnShare');
    if (btn) { btn.textContent = '✅ Link Copied!'; setTimeout(() => btn.textContent = '🔗 Share', 2000); }
  }
});

// ── Related masterclasses ─────────────────────────────────────────────────────
function renderRelated(list) {
  const others = list.filter(m => String(m.id) !== String(MC_ID)).slice(0, 3);
  if (!others.length) return;

  const box = document.getElementById('mcRelatedBox');
  box.style.display = 'block';

  document.getElementById('mcRelatedList').innerHTML = others.map(m => {
    const sched  = new Date(m.schedule);
    const status = getMcStatus(m.schedule);
    const statusDot = status === 'live' ? '🔴' : status === 'upcoming' ? '⏰' : '✅';
    return `
      <a href="masterclass.html?id=${m.id}" class="mc-related-item">
        <div class="mc-related-thumb" style="background:linear-gradient(135deg,#7c3aed,#2563eb)">
          ${m.thumb ? `<img src="${m.thumb}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"/>` : '🎓'}
        </div>
        <div class="mc-related-info">
          <div class="mc-related-title-text">${m.title}</div>
          <div class="mc-related-meta">${statusDot} ${sched.toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</div>
        </div>
      </a>`;
  }).join('');
}

// ── Countdown ticker ──────────────────────────────────────────────────────────
function startCountdown() {
  if (!_mc) return;
  const status = getMcStatus(_mc.schedule);
  if (status !== 'upcoming') return;

  _countdownInterval = setInterval(() => {
    const val = formatCountdown(_mc.schedule);
    const el  = document.getElementById('mcCountdownValue');
    if (el) el.textContent = val || '00:00:00';

    // If status changed to live, reload page
    if (getMcStatus(_mc.schedule) === 'live') {
      clearInterval(_countdownInterval);
      location.reload();
    }
  }, 1000);
}

// ── Registration submit ───────────────────────────────────────────────────────
async function submitMcRegistration() {
  const name    = document.getElementById('mcpName')?.value?.trim();
  const email   = document.getElementById('mcpEmail')?.value?.trim();
  const phone   = document.getElementById('mcpPhone')?.value?.trim() || '';
  const country = document.getElementById('mcpCountry')?.value || '';
  const errEl   = document.getElementById('mcpError');

  if (!name || !email) {
    if (errEl) { errEl.textContent = '❌ Name and email are required.'; errEl.style.display = 'block'; }
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) { errEl.textContent = '❌ Please enter a valid email address.'; errEl.style.display = 'block'; }
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const btn = document.getElementById('mcpSubmitBtn');
  if (btn) { btn.textContent = 'Registering...'; btn.disabled = true; }

  // Save to lf_mc_registrations (single per mcId) — always use string key
  const sid  = String(MC_ID);
  const regs = JSON.parse(localStorage.getItem('lf_mc_registrations') || '{}');
  regs[sid] = { name, email, phone, country, registeredAt: new Date().toISOString() };
  localStorage.setItem('lf_mc_registrations', JSON.stringify(regs));

  // Save to lf_mc_registrations_detail (array per mcId, deduped by email)
  const detail = JSON.parse(localStorage.getItem('lf_mc_registrations_detail') || '{}');
  if (!detail[sid]) detail[sid] = [];
  if (!detail[sid].find(r => r.email === email)) {
    detail[sid].push({ name, email, phone, country, registeredAt: new Date().toISOString() });
  }
  localStorage.setItem('lf_mc_registrations_detail', JSON.stringify(detail));

  // Also save to enrollments as approved
  const enrollments = JSON.parse(localStorage.getItem('lf_enrollments') || '[]');
  const alreadyEnrolled = enrollments.find(e => e.email === email && e.course === _mc.title);
  if (!alreadyEnrolled) {
    enrollments.push({
      id: Date.now(), name, email, phone, country,
      course: _mc.title, status: 'approved',
      date: new Date().toLocaleDateString('en-IN')
    });
    localStorage.setItem('lf_enrollments', JSON.stringify(enrollments));
  }

  // Save to Flask DB so admin panel can see it
  try {
    await fetch('/api/masterclass-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mcId: sid, name, email, phone, country,
        masterclassTitle: _mc.title
      })
    });
  } catch(e) { /* localStorage fallback already done */ }

  if (btn) { btn.textContent = '✅ Registered!'; btn.disabled = false; }

  // Show registered state
  document.getElementById('mcRegAlreadyDone').style.display = 'flex';
  document.getElementById('mcRegFormFields').style.display  = 'none';

  // Show join link if available
  if (_mc.link) {
    document.getElementById('mcJoinLinkBox').style.display = 'block';
    const anchor = document.getElementById('mcJoinLinkAnchor');
    anchor.href        = _mc.link;
    anchor.textContent = _mc.link;

    const status = getMcStatus(_mc.schedule);
    if (status === 'live') {
      setTimeout(() => window.open(_mc.link, '_blank'), 500);
    } else {
      showToast('Registered successfully!\nSave the join link — you will need it when the session starts.', 'success');
    }
  } else {
    showToast('Registered successfully!\nThe join link will be shared by the instructor before the session starts.', 'success');
  }
}

async function unregisterMc() {
  const ok = await showConfirm('Unregister from this masterclass?', 'warning');
  if (!ok) return;
  const sid  = String(MC_ID);
  const regs = JSON.parse(localStorage.getItem('lf_mc_registrations') || '{}');
  delete regs[sid];
  localStorage.setItem('lf_mc_registrations', JSON.stringify(regs));
  document.getElementById('mcRegAlreadyDone').style.display = 'none';
  document.getElementById('mcRegFormFields').style.display  = 'block';
  document.getElementById('mcJoinLinkBox').style.display    = 'none';
  showToast('Unregistered successfully.', 'info');
}

// ── Boot — wait for ALL scripts (api.js) to be ready ─────────────────────────
window.addEventListener('load', () => initPage());
