// ===== ENROLLMENTS =====
// API-only — no localStorage merge for enrollment lists

async function renderAll() {
  let all = [];
  try {
    if (typeof apiGetEnrollments !== 'undefined') {
      all = await apiGetEnrollments();
    }
  } catch(e) {
    console.error('Error fetching enrollments:', e);
  }

  const pending  = all.filter(e => e.status === 'pending');
  const approved = all.filter(e => e.status === 'approved');
  const rejected = all.filter(e => e.status === 'rejected');

  document.getElementById('pendingCount').textContent  = pending.length;
  document.getElementById('approvedCount').textContent = approved.length;
  document.getElementById('rejectedCount').textContent = rejected.length;

  renderList('pendingList',  pending,  true);
  renderList('approvedList', approved, false);
  renderList('rejectedList', rejected, false);
}

function renderList(containerId, list, showActions) {
  const el = document.getElementById(containerId);
  if (!list.length) { el.innerHTML = '<div class="empty-state">No records found.</div>'; return; }

  el.innerHTML = `
    <div class="table-head">
      <span>Name</span><span>Email</span><span>Phone</span><span>Course</span><span>Date</span><span>Status</span><span>Actions</span>
    </div>
    ${list.map(e => `
      <div class="table-row">
        <span>${e.name || '—'}</span>
        <span>${e.email || '—'}</span>
        <span>${e.phone || '—'}</span>
        <span class="course-cell">${e.course || '—'}</span>
        <span>${e.date || (e.created_at ? e.created_at.split(' ')[0] : '—')}</span>
        <span class="status-pill status-${e.status}">${e.status}</span>
        <span class="action-btns">
          ${showActions ? `
            <button class="btn-approve" onclick="updateStatus(${e.id}, 'approved')">✅ Approve</button>
            <button class="btn-reject"  onclick="updateStatus(${e.id}, 'rejected')">❌ Reject</button>
          ` : ''}
          ${e.status === 'approved' ? `
            <button class="btn-edit-lms" onclick="editCourse('${e.courseId || e.course_id || ''}','${encodeURIComponent(e.course || '')}')">✏️ Edit LMS</button>
            <button class="btn-view-lms" onclick="window.open('curriculum.html?course=${encodeURIComponent(e.course || '')}&user=${encodeURIComponent(e.name || '')}&cid=${e.courseId || e.course_id || ''}','_blank')">👁 View LMS</button>
          ` : ''}
        </span>
      </div>`).join('')}
  `;
}

async function updateStatus(id, status) {
  try {
    if (typeof apiUpdateEnrollment !== 'undefined') {
      await apiUpdateEnrollment(id, status);
    }
  } catch(e) {
    console.error('Error updating enrollment status:', e);
  }
  renderAll();
}

// ── LMS course helpers (localStorage used intentionally — LMS data is local) ──
function getEnrollments() {
  return JSON.parse(localStorage.getItem('lf_enrollments') || '[]');
}
function saveEnrollments(list) {
  localStorage.setItem('lf_enrollments', JSON.stringify(list));
}

function ensureCourseExists(courseName) {
  const lms = JSON.parse(localStorage.getItem('lf_lms') || '{}');
  const existing = Object.entries(lms).find(([, c]) => c.name.toLowerCase() === courseName.toLowerCase());
  if (existing) return existing[0];
  const id = 'course_' + Date.now();
  lms[id] = {
    name: courseName,
    category: detectCategory(courseName),
    duration: 'Self-paced',
    topics: [], assignments: [], quizzes: [], projects: [], resources: []
  };
  localStorage.setItem('lf_lms', JSON.stringify(lms));
  return id;
}

function detectCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('agentic') || n.includes('agent')) return 'Agentic AI';
  if (n.includes('generative') || n.includes('genai') || n.includes('llm') || n.includes('gpt') || n.includes('rag') || n.includes('mcp') || n.includes('prompt')) return 'Generative AI';
  if (n.includes('data') || n.includes('excel') || n.includes('analytics') || n.includes('machine learning') || n.includes('deep learning') || n.includes('nlp')) return 'Data Science';
  if (n.includes('python') || n.includes('sql') || n.includes('nosql') || n.includes('database') || n.includes('programming')) return 'Programming';
  if (n.includes('domain') || n.includes('healthcare') || n.includes('finance') || n.includes('banking') || n.includes('retail') || n.includes('telecom') || n.includes('robotics') || n.includes('automation')) return 'Industry AI';
  return 'Generative AI';
}

function editCourse(courseId, encodedName) {
  const name = decodeURIComponent(encodedName);
  const lms = JSON.parse(localStorage.getItem('lf_lms') || '{}');
  let id = courseId;
  if (!id || !lms[id]) {
    const found = Object.entries(lms).find(([, c]) => c.name.toLowerCase() === name.toLowerCase());
    id = found ? found[0] : ensureCourseExists(name);
  }
  localStorage.setItem('lf_active_course', id);
  window.open('admin-lms.html', '_blank');
}

// ── Panel switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.admin-nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const panel = item.getAttribute('data-panel');
    document.getElementById('panel-' + panel).classList.add('active');

    if (panel === 'masterclasses') renderMasterclasses();
    if (panel === 'liveclasses') renderLiveClasses();
    if (panel === 'signups') renderSignups();
    if (panel === 'enrollments' || panel === 'approved' || panel === 'rejected') renderAll();
  });
});

// ===== MASTERCLASSES ADMIN =====
// API-only — no localStorage anywhere for masterclass data

async function getMasterclasses() {
  try {
    if (typeof apiGetMasterclasses !== 'undefined') {
      const data = await apiGetMasterclasses();
      if (Array.isArray(data)) return data;
    }
  } catch(e) {
    console.error('Error fetching masterclasses:', e);
  }
  return [];
}

async function getRegsForMc(mcId) {
  const sid = String(mcId);
  try {
    const res = await fetch('/api/masterclass-registrations/' + sid);
    if (res.ok) {
      const dbRegs = await res.json();
      return dbRegs.map(r => ({
        name: r.name, email: r.email, phone: r.phone,
        country: r.country, registeredAt: r.registered_at
      }));
    }
  } catch(e) {
    console.error('Error fetching registrations for mc ' + sid, e);
  }
  return [];
}

document.getElementById('btnAddMasterclass').addEventListener('click', () => {
  document.getElementById('mcForm').style.display = 'block';
  document.getElementById('mcTitle').value = '';
  document.getElementById('mcTag').value = '';
  document.getElementById('mcDesc').value = '';
  document.getElementById('mcDuration').value = '';
  document.getElementById('mcInstructor').value = '';
  document.getElementById('mcSchedule').value = '';
  document.getElementById('mcLink').value = '';
  document.getElementById('mcRating').value = '4.9';
  if (document.getElementById('mcThumb')) document.getElementById('mcThumb').value = '';
});

document.getElementById('btnSaveMc').addEventListener('click', async () => {
  const title    = document.getElementById('mcTitle').value.trim();
  const schedule = document.getElementById('mcSchedule').value;
  if (!title)    return showToast('Title is required.', 'error');
  if (!schedule) return showToast('Schedule date & time is required.', 'error');

  const mc = {
    title,
    tag:         document.getElementById('mcTag').value.trim() || 'AI & ML',
    description: document.getElementById('mcDesc').value.trim(),
    duration:    document.getElementById('mcDuration').value.trim() || '2 hrs',
    instructor:  document.getElementById('mcInstructor').value.trim(),
    schedule,
    link:        document.getElementById('mcLink').value.trim(),
    rating:      parseFloat(document.getElementById('mcRating').value) || 4.9,
    thumb:       document.getElementById('mcThumb') ? document.getElementById('mcThumb').value.trim() : '',
  };

  try {
    const res = await apiAddMasterclass(mc);
    if (res.ok) {
      showToast('Masterclass created successfully!', 'success');
    } else {
      showToast('Error saving masterclass: ' + (res.error || 'Unknown error'), 'error');
      return;
    }
  } catch (e) {
    showToast('Error creating masterclass. Is the server running?', 'error');
    return;
  }

  document.getElementById('mcForm').style.display = 'none';
  document.getElementById('mcTitle').value = '';
  document.getElementById('mcTag').value = '';
  document.getElementById('mcDesc').value = '';
  document.getElementById('mcDuration').value = '';
  document.getElementById('mcInstructor').value = '';
  document.getElementById('mcSchedule').value = '';
  document.getElementById('mcLink').value = '';
  document.getElementById('mcRating').value = '';
  if (document.getElementById('mcThumb')) document.getElementById('mcThumb').value = '';

  renderMasterclasses();
});

async function deleteMasterclass(id) {
  const ok = await showConfirm('Delete this masterclass?\nThis action cannot be undone.', 'error');
  if (!ok) return;
  try {
    await apiDeleteMasterclass(id);
  } catch(e) {
    console.error('Error deleting masterclass:', e);
  }
  document.getElementById('mcRegPanel').style.display = 'none';
  renderMasterclasses();
}

async function renderMcAnalytics() {
  const list = await getMasterclasses();
  const totalRegs = (await Promise.all(list.map(m => getRegsForMc(String(m.id))))).reduce((s, r) => s + r.length, 0);
  const live     = list.filter(m => { const d = new Date(m.schedule)-new Date(); return d<=0&&d>-10800000; }).length;
  const upcoming = list.filter(m => new Date(m.schedule) > new Date()).length;
  document.getElementById('mcAnalyticsBar').innerHTML = `
    <div class="mc-stat-bar">
      <div class="mc-stat-item"><strong>${list.length}</strong><span>Total Masterclasses</span></div>
      <div class="mc-stat-item live"><strong>${live}</strong><span>Live Now</span></div>
      <div class="mc-stat-item"><strong>${upcoming}</strong><span>Upcoming</span></div>
      <div class="mc-stat-item green"><strong>${totalRegs}</strong><span>Total Registrations</span></div>
    </div>`;
}

async function renderMasterclasses() {
  const list = await getMasterclasses();
  renderMcAnalytics();

  const el = document.getElementById('mcList');
  if (!list.length) {
    el.innerHTML = '<div class="empty-state">No masterclasses yet. Create one!</div>';
    return;
  }

  const cardsHtml = await Promise.all(list.map(async m => {
    const schedDate = new Date(m.schedule);
    const diff = schedDate - new Date();
    const regs = await getRegsForMc(String(m.id));
    let statusHtml = '';
    if (diff <= 0 && diff > -10800000) statusHtml = '<span class="mc-status-live">🔴 LIVE NOW</span>';
    else if (diff > 0) {
      const days=Math.floor(diff/86400000), hrs=Math.floor((diff%86400000)/3600000), mins=Math.floor((diff%3600000)/60000);
      statusHtml = `<span class="mc-status-upcoming">⏰ In ${days>0?days+'d ':''}${hrs}h ${mins}m</span>`;
    } else statusHtml = '<span class="mc-status-ended">✅ Ended</span>';

    return `
      <div class="mc-admin-card">
        <div class="mc-admin-info">
          <div class="mc-admin-top">
            <span class="mc-admin-tag">${m.tag}</span>
            ${statusHtml}
            <span class="mc-reg-chip" onclick="openMcRegistrations('${String(m.id)}')">👥 ${regs.length} Registrations</span>
          </div>
          <h3>${m.title}</h3>
          <p>${m.description || ''}</p>
          <div class="mc-admin-meta">
            <span>📅 ${schedDate.toLocaleString()}</span>
            <span>⏱ ${m.duration}</span>
            <span>👨‍🏫 ${m.instructor || 'TBD'}</span>
            <span>⭐ ${m.rating}</span>
          </div>
        </div>
        <div class="mc-admin-actions">
          <button class="btn-view-regs" onclick="openMcRegistrations('${String(m.id)}')">📋 View Registrations</button>
          ${m.link ? `<a href="${m.link}" target="_blank" class="btn-mc-link">🔗 Join Link</a>` : ''}
          <button class="btn-del" onclick="deleteMasterclass('${String(m.id)}')">🗑 Delete</button>
        </div>
      </div>`;
  }));

  el.innerHTML = cardsHtml.join('');
}

async function openMcRegistrations(mcId) {
  const sid  = String(mcId);
  const list = await getMasterclasses();
  const mc   = list.find(m => String(m.id) === sid);
  const regs = await getRegsForMc(sid);
  const panel = document.getElementById('mcRegPanel');

  document.getElementById('mcRegPanelTitle').textContent = mc?.title || 'Registrations';
  document.getElementById('mcRegPanelCount').textContent = `${regs.length} registered`;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
  panel.dataset.mcid = sid;

  renderMcRegChart(regs);

  document.getElementById('mcStatBoxes').innerHTML = `
    <div class="mc-mini-stat"><strong>${regs.length}</strong><span>Total</span></div>
    <div class="mc-mini-stat green"><strong>${regs.filter(r=>r.registeredAt&&new Date(r.registeredAt)>new Date(Date.now()-86400000)).length}</strong><span>Last 24h</span></div>
    <div class="mc-mini-stat"><strong>${regs.filter(r=>r.phone&&r.phone!=='N/A').length}</strong><span>With Phone</span></div>`;

  const tbody = document.getElementById('mcRegTableBody');
  if (!regs.length) { tbody.innerHTML = '<div class="empty-state">No registrations yet.</div>'; return; }
  tbody.innerHTML = regs.map(r => `
    <div class="mc-reg-row">
      <span>${r.name || '—'}</span>
      <span>${r.email || '—'}</span>
      <span>${r.phone || '—'}</span>
      <span>${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '—'}</span>
    </div>`).join('');
}

function renderMcRegChart(regs) {
  const svg = document.getElementById('mcRegChart');
  const labelsEl = document.getElementById('mcChartXLabels');
  if (!regs.length) {
    svg.innerHTML = '<text x="250" y="55" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="12" font-family="Inter">No registrations yet</text>';
    labelsEl.innerHTML = '';
    return;
  }
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days[d.toLocaleDateString('en-IN', {day:'2-digit',month:'short'})] = 0;
  }
  regs.forEach(r => {
    if (!r.registeredAt) return;
    const key = new Date(r.registeredAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short'});
    if (days[key] !== undefined) days[key]++;
  });
  const labels = Object.keys(days);
  const values = Object.values(days);
  const maxVal = Math.max(...values, 1);
  const W = 500, H = 100, pad = 20;
  const barW = (W - pad * 2) / labels.length - 6;
  svg.innerHTML = labels.map((label, i) => {
    const barH = ((values[i] / maxVal) * (H - pad - 20)) || 2;
    const x = pad + i * ((W - pad * 2) / labels.length);
    const y = H - pad - barH;
    const color = values[i] > 0 ? '#7c3aed' : 'rgba(255,255,255,0.08)';
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${color}" opacity="0.85"/>
      ${values[i] > 0 ? `<text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.7)" font-family="Inter">${values[i]}</text>` : ''}`;
  }).join('');
  labelsEl.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
}

document.getElementById('btnExportExcel').addEventListener('click', async () => {
  const mcId = document.getElementById('mcRegPanel').dataset.mcid;
  const list = await getMasterclasses();
  const mc   = list.find(m => String(m.id) === String(mcId));
  const regs = await getRegsForMc(mcId);
  if (!regs.length) return showToast('No registrations to export.', 'warning');
  const headers = ['Name', 'Email', 'Phone', 'Registered At', 'Masterclass', 'Scheduled'];
  const rows = regs.map(r => [
    r.name || '', r.email || '', r.phone || '',
    r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
    mc?.title || '',
    mc?.schedule ? new Date(mc.schedule).toLocaleString() : ''
  ]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(mc?.title || 'masterclass').replace(/\s+/g,'_')}_registrations.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

setInterval(() => {
  if (document.getElementById('panel-masterclasses').classList.contains('active')) renderMasterclasses();
}, 60000);

// ===== LIVE CLASSES ADMIN =====
// API-only — no localStorage anywhere

async function getLiveClasses() {
  try {
    if (typeof apiGetLiveClasses !== 'undefined') {
      const data = await apiGetLiveClasses();
      if (Array.isArray(data)) return data;
    }
  } catch(e) {
    console.error('Error fetching live classes:', e);
  }
  return [];
}

document.getElementById('btnAddLiveClass').addEventListener('click', () => {
  document.getElementById('lcForm').style.display = 'block';
  ['lcTitle','lcTag','lcDesc','lcDuration','lcInstructor','lcLink','lcThumb'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('lcDate').value = '';
  document.getElementById('lcStartTime').value = '';
  document.getElementById('lcEndTime').value = '';
  document.getElementById('lcForm').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('btnSaveLc').addEventListener('click', async () => {
  const title     = document.getElementById('lcTitle').value.trim();
  const date      = document.getElementById('lcDate').value;
  const startTime = document.getElementById('lcStartTime').value;
  const endTime   = document.getElementById('lcEndTime').value;

  if (!title)     return showToast('Title is required.', 'error');
  if (!date)      return showToast('Please select a date.', 'error');
  if (!startTime) return showToast('Please set a start time.', 'error');

  const schedule = `${date}T${startTime}`;

  let duration = document.getElementById('lcDuration').value.trim();
  if (!duration && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const totalMins = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMins > 0) {
      const hrs  = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      duration = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`) : `${mins} mins`;
    }
  }
  if (!duration) duration = '2 hrs';

  const lcData = {
    title,
    tag:         document.getElementById('lcTag').value.trim() || 'AI & ML',
    description: document.getElementById('lcDesc').value.trim(),
    duration,
    instructor:  document.getElementById('lcInstructor').value.trim(),
    schedule, startTime,
    endTime:     endTime || '',
    joinLink:    document.getElementById('lcLink').value.trim(),
    link:        document.getElementById('lcLink').value.trim(),
    thumb:       document.getElementById('lcThumb') ? document.getElementById('lcThumb').value.trim() : '',
  };

  try {
    const apiRes = await apiAddLiveClass(lcData);
    if (!apiRes || !apiRes.ok) {
      showToast('Failed to save live class. Is the server running?', 'error');
      return;
    }
  } catch(e) {
    showToast('Error saving live class: ' + e.message, 'error');
    return;
  }

  document.getElementById('lcForm').style.display = 'none';
  showToast('Live class announced successfully!', 'success');
  renderLiveClasses();
});

async function deleteLiveClass(id) {
  const ok = await showConfirm('Delete this live class?\nThis action cannot be undone.', 'error');
  if (!ok) return;
  try {
    if (typeof apiDeleteLiveClass !== 'undefined') await apiDeleteLiveClass(id);
  } catch(e) {
    console.error('Error deleting live class:', e);
  }
  renderLiveClasses();
}

function getLcStatus(scheduleStr) {
  const diff = new Date(scheduleStr) - new Date();
  if (diff <= 0 && diff > -10800000) return 'live';
  if (diff > 0) return 'upcoming';
  return 'ended';
}

async function renderLiveClasses() {
  const list = await getLiveClasses();
  const el = document.getElementById('lcList');
  if (!list.length) {
    el.innerHTML = '<div class="empty-state">No live classes yet. Add one!</div>';
    return;
  }
  el.innerHTML = list.map(lc => {
    const schedDate = new Date(lc.schedule);
    const diff = schedDate - new Date();
    const status = getLcStatus(lc.schedule);
    let statusHtml = '';
    if (status === 'live') statusHtml = '<span class="mc-status-live">🔴 LIVE NOW</span>';
    else if (status === 'upcoming') {
      const days=Math.floor(diff/86400000), hrs=Math.floor((diff%86400000)/3600000), mins=Math.floor((diff%3600000)/60000);
      statusHtml = `<span class="mc-status-upcoming">⏰ In ${days>0?days+'d ':''}${hrs}h ${mins}m</span>`;
    } else statusHtml = '<span class="mc-status-ended">✅ Ended</span>';

    return `
      <div class="mc-admin-card">
        <div class="mc-admin-info">
          <div class="mc-admin-top">
            <span class="mc-admin-tag">${lc.tag}</span>
            ${statusHtml}
          </div>
          <h3>${lc.title}</h3>
          <p>${lc.description || ''}</p>
          <div class="mc-admin-meta">
            <span>📅 ${schedDate.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
            <span>🕐 ${schedDate.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}${lc.endTime ? ` → ${lc.endTime}` : ''}</span>
            <span>⏱ ${lc.duration}</span>
            <span>👨‍🏫 ${lc.instructor || 'TBD'}</span>
            ${lc.thumb ? `<span>🖼 Thumbnail set</span>` : ''}
          </div>
        </div>
        <div class="mc-admin-actions">
          ${lc.link ? `<a href="${lc.link}" target="_blank" class="btn-mc-link">🔗 Join Link</a>` : ''}
          <button class="btn-del" onclick="deleteLiveClass('${lc.id}')">🗑 Delete</button>
        </div>
      </div>`;
  }).join('');
}

setInterval(() => {
  if (document.getElementById('panel-liveclasses').classList.contains('active')) renderLiveClasses();
}, 60000);

// ===== INIT — wait for ALL scripts loaded =====
window.addEventListener('load', () => {
  renderAll();
  renderMasterclasses();
  renderLiveClasses();
  renderSignups();
});

// =====================================================
//  SIGN UP DASHBOARD — API-only
// =====================================================

async function renderSignups(filter = '') {
  let all = [];
  try {
    if (typeof apiGetSignups !== 'undefined') {
      const apiData = await apiGetSignups();
      if (Array.isArray(apiData)) all = apiData;
    }
  } catch(e) {
    console.error('Error fetching signups:', e);
  }

  const filtered = filter
    ? all.filter(s =>
        (s.name || '').toLowerCase().includes(filter) ||
        (s.email || '').toLowerCase().includes(filter) ||
        (s.phone || '').toLowerCase().includes(filter))
    : all;

  document.getElementById('signupsCount').textContent = all.length;
  const el = document.getElementById('signupsList');

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state">No sign ups found.</div>';
    return;
  }

  el.innerHTML = `
    <div class="table-head">
      <span>#</span><span>Name</span><span>Email</span><span>Phone</span><span>Date</span><span>Time</span><span>Actions</span>
    </div>
    ${filtered.map((s, i) => `
      <div class="table-row">
        <span>${i + 1}</span>
        <span><strong style="color:#e2e8f0">${s.name || '—'}</strong></span>
        <span>${s.email || '—'}</span>
        <span>${s.phone || '—'}</span>
        <span>${s.date || (s.created_at ? s.created_at.split(' ')[0] : '—')}</span>
        <span>${s.time || (s.created_at ? s.created_at.split(' ')[1] || '—' : '—')}</span>
        <span class="action-btns">
          <button class="btn-reject" onclick="deleteSignup(${s.id})">🗑 Delete</button>
        </span>
      </div>`).join('')}
  `;
}

async function deleteSignup(id) {
  const ok = await showConfirm('Delete this sign up?', 'warning');
  if (!ok) return;
  try {
    if (typeof apiDeleteSignup !== 'undefined') await apiDeleteSignup(id);
  } catch(e) {}
  renderSignups();
}

async function clearSignups() {
  const ok = await showConfirm('Clear ALL sign ups?\nThis cannot be undone.', 'error');
  if (!ok) return;
  renderSignups();
}

function exportSignups() {
  // Export from current DOM — signups come from API so no localStorage needed
  showToast('Use the API to export signups as CSV.', 'info');
}

const signupSearchEl = document.getElementById('signupSearch');
if (signupSearchEl) {
  signupSearchEl.addEventListener('input', e => renderSignups(e.target.value.trim().toLowerCase()));
}

document.querySelectorAll('.admin-nav-item[data-panel="signups"]').forEach(el => {
  el.addEventListener('click', () => renderSignups());
});
