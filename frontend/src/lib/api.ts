/**
 * Arthrex AI — API Client
 * All calls go to FastAPI backend
 */
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = JSON.parse(localStorage.getItem('aai_session') || 'null');
    return s?.token || null;
  } catch { return null; }
}

async function request<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiSignup = (d: { name: string; email: string; password: string; country: string; phone: string }) =>
  request<{ success: boolean; name: string; email: string; role: string; token: string }>('POST', '/api/auth/signup', d);

export const apiLogin = (d: { email: string; password: string }) =>
  request<{ success: boolean; name: string; email: string; role: string; token: string }>('POST', '/api/auth/login', d);

// ── Signups (admin) ───────────────────────────────────────────────────────────
export const apiGetSignups     = () => request<UserOut[]>('GET', '/api/signups', undefined, true);
export const apiDeleteSignup   = (id: number) => request<{ success: boolean }>('DELETE', `/api/signups/${id}`, undefined, true);

// ── Enrollments ───────────────────────────────────────────────────────────────
export const apiGetEnrollments  = () => request<EnrollmentOut[]>('GET', '/api/enrollments', undefined, true);
export const apiAddEnrollment   = (d: { name: string; email: string; phone?: string; course: string; courseId?: string }) =>
  request<{ success: boolean; id: number }>('POST', '/api/enrollments', { ...d, courseId: d.courseId || '' });
export const apiUpdateEnrollment = (id: number, status: string) =>
  request<{ success: boolean }>('PATCH', `/api/enrollments/${id}`, { status }, true);
export const apiDeleteEnrollment = (id: number) =>
  request<{ success: boolean }>('DELETE', `/api/enrollments/${id}`, undefined, true);

// ── Masterclasses ─────────────────────────────────────────────────────────────
export const apiGetMasterclasses = () => request<MasterclassOut[]>('GET', '/api/masterclasses');
export const apiAddMasterclass   = (d: MasterclassCreate) => request<{ success: boolean; id: number }>('POST', '/api/masterclasses', d, true);
export const apiUpdateMasterclass = (id: number, d: MasterclassCreate) => request<{ success: boolean }>('PUT', `/api/masterclasses/${id}`, d, true);
export const apiDeleteMasterclass = (id: number) => request<{ success: boolean }>('DELETE', `/api/masterclasses/${id}`, undefined, true);

// ── MC Registrations ──────────────────────────────────────────────────────────
export const apiRegisterMasterclass = (d: { mcId: string; name: string; email: string; phone: string; country: string; masterclassTitle: string }) =>
  request<{ success: boolean }>('POST', '/api/masterclass-registrations', d);
export const apiGetMCRegistrations  = (mcId: string) =>
  request<MCRegOut[]>('GET', `/api/masterclass-registrations/${mcId}`, undefined, true);

// ── Live Classes ──────────────────────────────────────────────────────────────
export const apiGetLiveClasses    = () => request<LiveClassOut[]>('GET', '/api/liveclasses');
export const apiAddLiveClass      = (d: LiveClassCreate) => request<{ success: boolean; id: number }>('POST', '/api/liveclasses', d, true);
export const apiUpdateLiveClass    = (id: number, d: LiveClassCreate)   => request<{ success: boolean }>('PUT', `/api/liveclasses/${id}`, d, true);
export const apiDeleteLiveClass   = (id: number) => request<{ success: boolean }>('DELETE', `/api/liveclasses/${id}`, undefined, true);

// ── LMS ───────────────────────────────────────────────────────────────────────
export const apiGetLMS     = () => request<Record<string, LMSCourse>>('GET', '/api/lms');
export const apiSaveLMS    = (id: string, d: Record<string, unknown>) => request<{ success: boolean }>('PUT', `/api/lms/${id}`, d, true);
export const apiDeleteLMS  = (id: string) => request<{ success: boolean }>('DELETE', `/api/lms/${id}`, undefined, true);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserOut { id: number; name: string; email: string; country?: string; phone?: string; role: string; created_at?: string; }
export interface EnrollmentOut { id: number; name?: string; email?: string; phone?: string; course?: string; course_id?: string; status: string; created_at?: string; }
export interface MasterclassOut { id: number; title: string; tag?: string; instructor?: string; description?: string; schedule?: string; duration?: string; link?: string; rating?: number; thumb?: string; video_url?: string; created_at?: string; }
export interface MasterclassCreate { title: string; tag?: string; instructor?: string; description?: string; schedule: string; duration?: string; link?: string; rating?: number; thumb?: string; videoUrl?: string; }
export interface LiveClassOut { id: number; title?: string; tag?: string; instructor?: string; description?: string; schedule?: string; date?: string; start_time?: string; end_time?: string; duration?: string; join_link?: string; link?: string; joinLink?: string; startTime?: string; endTime?: string; thumb?: string; }
export interface LiveClassCreate { title: string; tag?: string; instructor?: string; description?: string; schedule: string; startTime?: string; endTime?: string; duration?: string; joinLink?: string; link?: string; thumb?: string; }
export interface MCRegOut { id: number; mc_id: string; name?: string; email?: string; phone?: string; country?: string; mc_title?: string; registered_at?: string; }
export interface LMSCourse { name: string; category?: string; duration?: string; topics?: { title: string; lessons: { title: string; type: string; duration?: string }[] }[]; }
