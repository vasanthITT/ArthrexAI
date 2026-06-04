// ===== LIVE CLASSES — Dynamic Frontend Renderer =====
// API-only — reads exclusively from Flask /api/liveclasses. No localStorage, no cache guard.
let _cachedLcList = [];

// Track locally enrolled live class IDs for this session
const _enrolledLcIds = new Set(
  JSON.parse(localStorage.getItem('lf_lc_enrolled') || '[]')
);

function _saveLcEnrolled() {
  localStorage.setItem('lf_lc_enrolled', JSON.stringify([..._enrolledLcIds]));
}

async function getLiveClasses() {
  try {
    const res = await fetch('/api/liveclasses');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        _cachedLcList = data;
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to fetch live classes from API:', e);
  }
  return [];
}

function getLcStatus(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0 && diff > -10800000) return 'live';
  if (diff > 0) return 'upcoming';
  return 'ended';
}

function getLcCountdown(scheduleStr) {
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

async function renderDynamicLiveClasses() {
  const container = document.getElementById('dynamicLiveClasses');
  const emptyEl = document.getElementById('lcEmptyState');
  if (!container) return;

  // Show ALL live classes — no filtering by ended status
  const list = await getLiveClasses();

  if (!list.length) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  container.innerHTML = list.map(lc => {
    const status = getLcStatus(lc.schedule);
    const countdown = getLcCountdown(lc.schedule);
    const schedDate = new Date(lc.schedule);
    const isLive = status === 'live';
    const thumbStyle = lc.thumb
      ? `background:#000`
      : `background:linear-gradient(135deg,#7c3aed,#2563eb)`;

    return `
      <div class="live-card ${isLive ? 'featured' : ''}" data-lc-id="${lc.id}">
        <div class="live-thumb" style="${thumbStyle}">
          ${lc.thumb ? `<img src="${lc.thumb}" alt="${lc.title}" class="live-thumb-img"/>` : ''}
          <div class="live-thumb-overlay"></div>
          ${isLive
            ? `<span class="live-pill">🔴 LIVE NOW</span>`
            : `<span class="live-pill upcoming-pill">⏰ ${countdown || 'Soon'}</span>`}
          <div class="live-thumb-meta">
            <span class="live-viewers" id="lccountdown-${lc.id}">
              ${isLive ? '🔴 Live' : countdown ? `⏰ ${countdown}` : ''}
            </span>
            <span class="live-duration">${lc.duration}</span>
          </div>
          ${lc.instructor ? `
          <div class="live-instructor-badge">
            <div class="live-inst-avatar" style="background:linear-gradient(135deg,#7c3aed,#2563eb)">${lc.instructor.slice(0,2).toUpperCase()}</div>
            <span>${lc.instructor}</span>
          </div>` : ''}
        </div>
        <div class="live-body">
          <div class="live-body-top">
            <span class="tag">${lc.tag}</span>
            <span class="live-tag-dot ${isLive ? 'live-dot-red' : 'live-dot-yellow'}">
              ${isLive ? '● LIVE' : '⏰ Soon'}
            </span>
          </div>
          <h3>${lc.title}</h3>
          <p>${lc.description || ''}</p>
          <div class="live-meta">
            <span>📅 ${schedDate.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
            <span>🕐 ${schedDate.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}${lc.endTime ? ` – ${lc.endTime}` : ''}</span>
            <span>⏱ ${lc.duration}</span>
          </div>
          <div class="live-actions">
            ${isLive
              ? `<a href="${lc.link || '#'}" target="_blank" class="btn-join">▶ Join Now</a>`
              : _enrolledLcIds.has(String(lc.id))
                ? `<button class="btn-enroll btn-enrolled" disabled>✅ Enrolled</button>`
                : `<a href="#" class="btn-enroll" onclick="enrollLiveClass('${lc.id}','${lc.title.replace(/'/g,"\\'")}');return false;">▶ Enroll</a>`}
          </div>
        </div>
      </div>`;
  }).join('');
}

function enrollLiveClass(id, title) {
  const session = (function() {
    try { return JSON.parse(localStorage.getItem('aai_session') || 'null'); } catch(e) { return null; }
  })();

  if (session && session.email) {
    // Already logged in — submit enrollment directly
    if (typeof apiAddEnrollment !== 'undefined') {
      apiAddEnrollment({ name: session.name, email: session.email, phone: '', course: title, courseId: '' })
        .catch(() => {});
    }
    // FIX: persist enrolled state so button stays "Enrolled" across re-renders
    _enrolledLcIds.add(String(id));
    _saveLcEnrolled();
    // Update the button immediately without waiting for the 30s re-render
    const card = document.querySelector(`[data-lc-id="${id}"]`);
    if (card) {
      const actionsEl = card.querySelector('.live-actions');
      if (actionsEl) {
        actionsEl.innerHTML = `<button class="btn-enroll btn-enrolled" disabled>✅ Enrolled</button>`;
      }
    }
    showToast('Enrolled in "' + title + '" successfully!', 'success');
    return;
  }

  // Not logged in — open enroll modal
  if (document.getElementById('enrollModal')) {
    document.getElementById('modalCourseName').textContent = title;
    if (document.getElementById('reg_course'))
      document.getElementById('reg_course').value = title;
    document.getElementById('enrollModal').classList.add('active');
  }
}

// Tick countdowns every second — uses _cachedLcList, no API call
const _lcPrevStatus = {};

function tickLcCountdowns() {
  let needsRerender = false;
  _cachedLcList.forEach(lc => {
    const status = getLcStatus(lc.schedule);
    if (_lcPrevStatus[lc.id] !== undefined && _lcPrevStatus[lc.id] !== status) needsRerender = true;
    _lcPrevStatus[lc.id] = status;
    const el = document.getElementById(`lccountdown-${lc.id}`);
    if (!el) return;
    const countdown = getLcCountdown(lc.schedule);
    el.textContent = status === 'live' ? '🔴 Live' : countdown ? `⏰ ${countdown}` : '';
  });
  if (needsRerender) renderDynamicLiveClasses();
}

// Init — wait for ALL scripts to load, then fetch fresh from API
window.addEventListener('load', () => renderDynamicLiveClasses());
setInterval(tickLcCountdowns, 1000);
setInterval(() => renderDynamicLiveClasses(), 30000);
