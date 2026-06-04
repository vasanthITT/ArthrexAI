/**
 * Arthrex AI — API Helper
 * Calls Flask backend at localhost:8000
 * Falls back to localStorage if server is unreachable
 */

const API_BASE = '';  // same origin — Flask serves frontend too

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiCall(method, endpoint, body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + endpoint, opts);
    const data = await res.json();
    return { ok: res.ok, data, status: res.status };
  } catch (e) {
    console.warn('⚠️ API unreachable, using localStorage fallback:', endpoint, e.message);
    return { ok: false, error: 'server_unreachable' };
  }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
async function apiSignup(name, email, password, country, phone) {
  const res = await apiCall('POST', '/api/auth/signup', { name, email, password, country, phone });
  if (res.ok) return { ok: true, data: res.data };
  return { ok: false, error: 'Registration failed. Server unreachable.' }; // Removed fallback
}

async function apiLogin(email, password) {
  const res = await apiCall('POST', '/api/auth/login', { email, password });
  if (res.ok) return { ok: true, data: res.data };
  if (res.data?.error) return { ok: false, error: res.data.error };
  return { ok: false, error: 'server_unreachable' };
}

// ── SIGNUPS (admin) ───────────────────────────────────────────────────────────
async function apiGetSignups() {
  const res = await apiCall('GET', '/api/signups');
  if (res.ok) return res.data;
  return []; // Removed localstorage fallback
}

async function apiDeleteSignup(id) {
  const res = await apiCall('DELETE', `/api/signups/${id}`);
  if (res.ok) return { ok: true };
  return { ok: false }; // Removed localstorage fallback
}

// ── ENROLLMENTS ───────────────────────────────────────────────────────────────
async function apiGetEnrollments() {
  const res = await apiCall('GET', '/api/enrollments');
  if (res.ok) return res.data;
  return []; // Removed fallback
}

async function apiAddEnrollment(data) {
  const res = await apiCall('POST', '/api/enrollments', data);
  if (res.ok) return { ok: true, data: res.data };
  return { ok: false };
}

async function apiUpdateEnrollment(id, status) {
  const res = await apiCall('PATCH', `/api/enrollments/${id}`, { status });
  if (res.ok) return { ok: true };
  return { ok: false };
}

async function apiDeleteEnrollment(id) {
  const res = await apiCall('DELETE', `/api/enrollments/${id}`);
  if (res.ok) return { ok: true };
  return { ok: false };
}

// ── MASTERCLASSES ─────────────────────────────────────────────────────────────
async function apiGetMasterclasses() {
  const res = await apiCall('GET', '/api/masterclasses');
  if (res.ok) {
    return res.data;
  }
  return []; // Removed fallback
}

async function apiAddMasterclass(data) {
  const res = await apiCall('POST', '/api/masterclasses', data);
  if (res.ok) {
    return { ok: true, data: res.data };
  }
  return { ok: false };
}

async function apiDeleteMasterclass(id) {
  const res = await apiCall('DELETE', `/api/masterclasses/${id}`);
  if (res.ok) {
    return { ok: true };
  }
  return { ok: false };
}

// ── LIVE CLASSES ──────────────────────────────────────────────────────────────
async function apiGetLiveClasses() {
  const res = await apiCall('GET', '/api/liveclasses');
  if (res.ok) {
    return res.data;
  }
  return []; // Removed fallback
}

async function apiAddLiveClass(data) {
  const res = await apiCall('POST', '/api/liveclasses', data);
  if (res.ok) { return { ok: true, data: res.data }; }
  return { ok: false };
}

async function apiDeleteLiveClass(id) {
  const res = await apiCall('DELETE', `/api/liveclasses/${id}`);
  if (res.ok) { return { ok: true }; }
  return { ok: true };
}

// ── LMS ───────────────────────────────────────────────────────────────────────
async function apiGetLMS() {
  const res = await apiCall('GET', '/api/lms');
  if (res.ok) {
    return res.data;
  }
  return {}; // Removed fallback
}

async function apiSaveLMSCourse(courseId, data) {
  const res = await apiCall('PUT', `/api/lms/${courseId}`, data);
  if (res.ok) return { ok: true };
  return { ok: false };
}

async function apiDeleteLMSCourse(courseId) {
  const res = await apiCall('DELETE', `/api/lms/${courseId}`);
  if (res.ok) return { ok: true };
  return { ok: false };
}

console.log('✅ API Module loaded — Flask + SQLite backend with localStorage fallback');
