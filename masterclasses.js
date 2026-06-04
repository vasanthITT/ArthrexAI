// ===== MASTERCLASSES — Dynamic Frontend Renderer =====
// API-only — no localStorage, no cache guard. Every render hits the API fresh.
let _cachedMcList = []; // for countdown ticker only

async function getMasterclasses() {
  try {
    const res = await fetch('/api/masterclasses');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        _cachedMcList = data;
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to fetch masterclasses from API:', e);
  }
  return [];
}

// ── Status helpers ────────────────────────────────────────────────────────────
function getMcStatus(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0 && diff > -10800000) return 'live';
  if (diff > 0) return 'upcoming';
  return 'ended';
}

function getCountdown(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0)  return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

// ── Render all dynamic masterclass cards ─────────────────────────────────────
async function renderDynamicMasterclasses() {
  const container = document.getElementById('dynamicMasterclasses');
  if (!container) return;

  // Show ALL masterclasses — no filtering by ended/upcoming
  const list = await getMasterclasses();

  if (!list.length) { container.innerHTML = ''; return; }

  container.innerHTML = list.map(m => {
    const status    = getMcStatus(m.schedule);
    const countdown = getCountdown(m.schedule);
    const schedDate = new Date(m.schedule);
    const thumbId   = 'mc-thumb-' + m.id;
    const detailUrl = `masterclass.html?id=${m.id}`;

    const imgTag = m.thumb
      ? `<img src="${m.thumb}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="var p=document.getElementById('${thumbId}');if(p){p.style.background='linear-gradient(135deg,#7c3aed,#2563eb)';}this.remove();"/>`
      : '';

    return `
      <div class="master-card mc-dynamic-card" data-mcid="${m.id}" onclick="window.location.href='${detailUrl}'" style="cursor:pointer">
        <div class="card-thumb mc-thumb" id="${thumbId}" style="background:linear-gradient(135deg,#7c3aed,#2563eb);position:relative;">
          ${imgTag}
          <div class="mc-thumb-overlay"></div>
          ${status === 'live'
            ? `<span class="mc-live-badge">🔴 LIVE NOW</span>`
            : `<span class="mc-upcoming-badge">⏰ Upcoming</span>`}
          <div class="mc-countdown-wrap" id="mccountdown-${m.id}">
            ${status === 'live'
              ? `<span class="mc-live-text">Join Now</span>`
              : countdown ? `<span class="mc-countdown">${countdown}</span>` : ''}
          </div>
          <div class="mc-thumb-title">${m.title}</div>
        </div>
        <div class="card-body">
          <span class="tag free-tag">FREE</span>
          <h3>${m.title}</h3>
          <p>${m.description || 'Join this free live masterclass.'}</p>
          <div class="card-meta">
            <span>⏱ ${m.duration || '2 hrs'}</span>
            <span>⭐ ${m.rating || 4.9}</span>
            ${m.instructor ? `<span>👨‍🏫 ${m.instructor}</span>` : ''}
          </div>
          <div class="mc-schedule-row">
            <span class="mc-date">📅 ${schedDate.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
            <span class="mc-time">🕐 ${schedDate.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            ${status === 'live'
              ? `<a href="${detailUrl}" class="btn-enroll mc-join-btn" onclick="event.stopPropagation()">🔴 Join Now</a>`
              : `<a href="${detailUrl}" class="btn-enroll" onclick="event.stopPropagation()">View Details →</a>`}
            <button class="mc-share-card-btn" onclick="event.stopPropagation();copyMcLink('${m.id}')" title="Copy link">🔗</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function copyMcLink(mcId) {
  const url = `${window.location.origin}${window.location.pathname.replace('index.html','')}masterclass.html?id=${mcId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard!\nShare it to give direct access to this masterclass.', 'success');
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

// ── Masterclass Detail Modal ──────────────────────────────────────────────────
async function openMcDetail(mcId) {
  const list = await getMasterclasses();
  const m = list.find(x => String(x.id) === String(mcId));
  if (!m) return;

  const status    = getMcStatus(m.schedule);
  const schedDate = new Date(m.schedule);

  const heroImg = document.getElementById('mcDetailHeroImg');
  if (m.thumb) {
    heroImg.src = m.thumb;
    heroImg.style.display = 'block';
    heroImg.onerror = () => { heroImg.style.display = 'none'; };
  } else {
    heroImg.style.display = 'none';
  }

  document.getElementById('mcDetailTag').textContent        = m.tag || 'FREE';
  document.getElementById('mcDetailTitle').textContent      = m.title;
  document.getElementById('mcDetailDesc').textContent       = m.description || '';
  document.getElementById('mcDetailDate').textContent       = '📅 ' + schedDate.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'});
  document.getElementById('mcDetailTime').textContent       = '🕐 ' + schedDate.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'});
  document.getElementById('mcDetailDuration').textContent   = m.duration ? '⏱ ' + m.duration : '';
  document.getElementById('mcDetailInstructor').textContent = m.instructor ? '👨‍🏫 ' + m.instructor : '';
  document.getElementById('mcDetailRating').textContent     = m.rating ? '⭐ ' + m.rating : '';

  const statusEl = document.getElementById('mcDetailStatusBadge');
  if (status === 'live') {
    statusEl.innerHTML = '<span style="background:#ef4444;color:white;font-size:0.78rem;font-weight:800;padding:5px 14px;border-radius:50px;animation:pulse 1.5s infinite">🔴 LIVE NOW — Join immediately!</span>';
  } else if (status === 'upcoming') {
    const cd = getCountdown(m.schedule);
    statusEl.innerHTML = `<span style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-size:0.78rem;font-weight:700;padding:5px 14px;border-radius:50px;">⏰ Starts in ${cd || 'soon'}</span>`;
  } else {
    statusEl.innerHTML = '<span style="background:rgba(100,116,139,0.15);border:1px solid rgba(100,116,139,0.3);color:#94a3b8;font-size:0.78rem;font-weight:700;padding:5px 14px;border-radius:50px;">✅ Session Ended</span>';
  }

  const learns = m.learnPoints || [
    'Core concepts covered in this masterclass',
    'Hands-on demonstrations and live examples',
    'Q&A session with the instructor',
    'Access to session recording (if available)'
  ];
  document.getElementById('mcDetailLearnList').innerHTML = learns.map(l =>
    `<li style="display:flex;gap:8px;font-size:0.84rem;color:var(--text)"><span style="color:#10b981;flex-shrink:0">✓</span>${l}</li>`
  ).join('');

  const linkBox = document.getElementById('mcDetailLinkBox');
  const linkEl  = document.getElementById('mcDetailJoinLink');
  if (m.link) {
    linkBox.style.display = 'block';
    linkEl.href = m.link;
    linkEl.textContent = m.link;
  } else {
    linkBox.style.display = 'none';
  }

  const regBtn = document.getElementById('mcDetailRegBtn');
  if (status === 'live') {
    regBtn.textContent = '🔴 Register & Join Now';
    regBtn.style.background = 'linear-gradient(135deg,#ef4444,#f97316)';
  } else if (status === 'ended') {
    regBtn.textContent = '✅ Session Ended — View Recording';
    regBtn.style.background = 'linear-gradient(135deg,#475569,#334155)';
  } else {
    regBtn.textContent = 'Register for Free →';
    regBtn.style.background = '';
  }

  regBtn.onclick = () => {
    document.getElementById('mcDetailModal').classList.remove('active');
    openMcRegModal(String(m.id), m.title, m.link || '');
  };

  document.getElementById('mcDetailModal').classList.add('active');
}

document.getElementById('closeMcDetailModal').addEventListener('click', () => {
  document.getElementById('mcDetailModal').classList.remove('active');
});
document.getElementById('mcDetailModal').addEventListener('click', e => {
  if (e.target === document.getElementById('mcDetailModal'))
    document.getElementById('mcDetailModal').classList.remove('active');
});

// ── Registration modal — no localStorage, always show the form ────────────────
let _activeMcId   = null;
let _activeMcLink = null;

function openMcRegModal(mcId, title, link) {
  _activeMcId   = mcId;
  _activeMcLink = link;

  document.getElementById('mcRegTitle').textContent   = title;
  document.getElementById('mcRegName').value          = '';
  document.getElementById('mcRegEmail').value         = '';
  document.getElementById('mcRegPhone').value         = '';
  document.getElementById('mcRegCountry').value       = '';
  document.getElementById('mcRegError').style.display = 'none';
  document.getElementById('mcRegModal').classList.add('active');
}

document.getElementById('closeMcRegModal').addEventListener('click', () => {
  document.getElementById('mcRegModal').classList.remove('active');
});
document.getElementById('mcRegModal').addEventListener('click', e => {
  if (e.target === document.getElementById('mcRegModal'))
    document.getElementById('mcRegModal').classList.remove('active');
});

document.getElementById('btnMcRegSubmit').addEventListener('click', async () => {
  const name    = document.getElementById('mcRegName').value.trim();
  const email   = document.getElementById('mcRegEmail').value.trim();
  const phone   = document.getElementById('mcRegPhone').value.trim();
  const country = document.getElementById('mcRegCountry').value.trim();
  const errEl   = document.getElementById('mcRegError');

  if (!name || !email) {
    errEl.textContent   = 'Name and email are required.';
    errEl.style.display = 'block';
    return;
  }

  document.getElementById('mcRegModal').classList.remove('active');

  // Save registration to server only — no localStorage
  try {
    const mcList = await getMasterclasses();
    const mc = mcList.find(m => String(m.id) === String(_activeMcId));
    const res = await fetch('/api/masterclass-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mcId: String(_activeMcId), name, email, phone, country,
        masterclassTitle: mc?.title || 'Masterclass'
      })
    });
    if (!res.ok) throw new Error('Server error');
  } catch(e) {
    console.error('Failed to submit masterclass registration:', e);
    showToast('Registration failed. Please try again.', 'error');
    return;
  }

  if (_activeMcLink) {
    window.open(_activeMcLink, '_blank');
  } else {
    showToast('Registered successfully!\nThe join link will be shared by the instructor shortly.', 'success');
  }
});

async function enrollMasterclass(id, title) {
  const list = await getMasterclasses();
  const mc   = list.find(m => String(m.id) === String(id));
  openMcRegModal(String(id), title, mc?.link || '');
}

// ── Countdown ticker — uses _cachedMcList, no API call ───────────────────────
const _prevStatus = {};

function tickCountdowns() {
  const list = _cachedMcList.filter(m => {
    const s = getMcStatus(m.schedule);
    if (s !== 'ended') return true;
    return (new Date() - new Date(m.schedule)) < 86400000;
  });
  let needsRerender = false;

  list.forEach(m => {
    const status = getMcStatus(m.schedule);
    if (_prevStatus[m.id] !== undefined && _prevStatus[m.id] !== status) needsRerender = true;
    _prevStatus[m.id] = status;

    const el = document.getElementById('mccountdown-' + m.id);
    if (!el) return;
    const countdown = getCountdown(m.schedule);
    if (status === 'live') {
      el.innerHTML = '<span class="mc-live-text">Join Now</span>';
    } else if (countdown) {
      el.innerHTML = `<span class="mc-countdown">${countdown}</span>`;
    }
  });

  if (needsRerender) renderDynamicMasterclasses();
}

// ── Init — wait for ALL scripts to load, then fetch fresh from API ────────────
window.addEventListener('load', () => renderDynamicMasterclasses());
setInterval(tickCountdowns, 1000);
setInterval(() => renderDynamicMasterclasses(), 30000);
