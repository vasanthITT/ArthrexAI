'use client';
import React, { useEffect, useState, useCallback } from 'react';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  apiGetSignups, apiDeleteSignup,
  apiGetEnrollments, apiUpdateEnrollment, apiDeleteEnrollment,
  apiGetMasterclasses, apiAddMasterclass, apiDeleteMasterclass,
  apiGetLiveClasses, apiAddLiveClass, apiDeleteLiveClass,
  type UserOut, type EnrollmentOut, type MasterclassOut, type LiveClassOut
} from '@/lib/api';
import { showToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { ToastContainer } from '@/components/ui/Toast';

type Tab = 'overview' | 'signups' | 'enrollments' | 'masterclasses' | 'liveclasses';

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (scoped via inline — keep admin self-contained)
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  page:     { display: 'flex', minHeight: '100vh', background: '#0d0d1a', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif" } as React.CSSProperties,
  sidebar:  { width: 240, background: '#111120', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' as const, padding: '0 0 20px 0', flexShrink: 0, minHeight: '100vh' },
  sideHead: { padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  sideTitle:{ fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 },
  sideSub:  { fontSize: '0.72rem', color: '#64748b', marginTop: 4 },
  sideNav:  { padding: '12px 10px', flex: 1 },
  sideLabel:{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 2, color: 'rgba(255,255,255,0.22)', padding: '14px 10px 5px' },
  sideBack: { margin: '12px 10px 0', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  main:     { flex: 1, display: 'flex', flexDirection: 'column' as const },
  topbar:   { height: 60, background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 },
  content:  { flex: 1, padding: 28, overflowY: 'auto' as const },
  card:     { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 },
};

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ icon, label, count, active, onClick }: { icon: string; label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: active ? 700 : 500, marginBottom: 2,
      background: active ? 'linear-gradient(135deg,rgba(124,58,237,0.28),rgba(37,99,235,0.18))' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
      boxShadow: active ? 'inset 0 0 0 1px rgba(124,58,237,0.35)' : 'none',
      position: 'relative' as const, textAlign: 'left' as const,
    }}>
      {active && <span style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, background: 'linear-gradient(180deg,#7c3aed,#2563eb)', borderRadius: '0 3px 3px 0' }} />}
      <span style={{ fontSize: '1rem', width: 22, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.25)', color: active ? '#fff' : '#a78bfa', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>{count}</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div style={{ ...S.card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────
function Pill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    approved: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    rejected: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  };
  const c = map[status] || { bg: 'rgba(100,116,139,0.12)', color: '#64748b' };
  return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}44`, borderRadius: 50, padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE
// ─────────────────────────────────────────────────────────────────────────────
function DataTable({ heads, children, empty }: { heads: string[]; children: React.ReactNode; empty: boolean }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {heads.map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr><td colSpan={heads.length} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div>No records yet</div>
            </td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function Tr({ children }: { children: React.ReactNode }) {
  return <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>{children}</tr>;
}
function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td style={{ padding: '12px 16px', color: muted ? '#64748b' : '#e2e8f0', verticalAlign: 'middle' }}>{children}</td>;
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: `${color}18`, border: `1px solid ${color}44`, color, padding: '4px 12px', borderRadius: 7, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD FORM (generic two-column grid form)
// ─────────────────────────────────────────────────────────────────────────────
function AddForm({ title, onSubmit, children }: { title: string; onSubmit: (e: React.FormEvent) => Promise<void>; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ ...S.card, padding: '20px 24px', marginBottom: 24 }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem' }}>NEW</span>
        {title}
      </div>
      <form onSubmit={async e => { setLoading(true); await onSubmit(e); setLoading(false); }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {children}
        <div style={{ gridColumn: '1/-1' }}>
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 9, fontWeight: 700, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : '+ Add Now'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ gridColumn: full ? '1/-1' : undefined, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: '9px 13px', color: '#e2e8f0', fontSize: '0.85rem',
  outline: 'none', fontFamily: 'inherit', width: '100%',
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHead({ title, count }: { title: string; count: number; onRefresh?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '3px 0 0' }}>{count} record{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();
  const [tab, setTab]       = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);

  const [signups,       setSignups]       = useState<UserOut[]>([]);
  const [enrollments,   setEnrollments]   = useState<EnrollmentOut[]>([]);
  const [masterclasses, setMasterclasses] = useState<MasterclassOut[]>([]);
  const [liveclasses,   setLiveclasses]   = useState<LiveClassOut[]>([]);

  // Add forms state
  const [mcForm, setMcForm] = useState({ title: '', tag: 'Agentic AI', instructor: '', description: '', schedule: '', duration: '2 hrs', link: '', rating: 4.9, thumb: '' });
  const [lcForm, setLcForm] = useState({ title: '', tag: 'AI & ML', instructor: '', description: '', schedule: '', startTime: '', endTime: '', duration: '2 hrs', joinLink: '', thumb: '' });

  const loadAll = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const [s, e, m, l] = await Promise.all([
        apiGetSignups(), apiGetEnrollments(), apiGetMasterclasses(), apiGetLiveClasses()
      ]);
      setSignups(s); setEnrollments(e); setMasterclasses(m); setLiveclasses(l);
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [session]);

  useEffect(() => { if (session?.role === 'admin') loadAll(); }, [loadAll, session]);

  // ── Auth Guard ─────────────────────────────────────────────────────────────
  if (authLoading) return <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#64748b' }}>Loading…</div></div>;

  if (!session || session.role !== 'admin') {
    return (
      <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3.5rem' }}>🔒</div>
        <h2 style={{ color: '#fff', margin: 0 }}>Admin Access Only</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Please log in with an admin account.</p>
        <a href="/" style={{ marginTop: 8, background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', padding: '10px 24px', borderRadius: 9, fontWeight: 600, fontSize: '0.88rem' }}>← Go to Platform</a>
      </div>
    );
  }

  const initials = session.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const pending  = enrollments.filter(e => e.status === 'pending').length;

  return (
    <>
      <ToastContainer />
      <div style={S.page}>

        {/* ── Sidebar ── */}
        <aside style={S.sidebar}>
          <div style={S.sideHead}>
            <div style={S.sideTitle}>⚙️ <span>Admin Panel</span></div>
            <div style={S.sideSub}>Arthrex AI Management</div>
          </div>

          <nav style={S.sideNav}>
            <div style={S.sideLabel}>Overview</div>
            <NavItem icon="📊" label="Dashboard"    active={tab === 'overview'}     onClick={() => setTab('overview')} />

            <div style={S.sideLabel}>Manage</div>
            <NavItem icon="👥" label="Signups"      count={signups.length}       active={tab === 'signups'}      onClick={() => setTab('signups')} />
            <NavItem icon="📋" label="Enrollments"  count={pending || enrollments.length} active={tab === 'enrollments'}  onClick={() => setTab('enrollments')} />
            <NavItem icon="🎓" label="Masterclasses" count={masterclasses.length} active={tab === 'masterclasses'} onClick={() => setTab('masterclasses')} />
            <NavItem icon="🔴" label="Live Classes"  count={liveclasses.length}   active={tab === 'liveclasses'}  onClick={() => setTab('liveclasses')} />
          </nav>

          {/* Admin profile */}
          <div style={{ margin: '0 10px 8px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Administrator</div>
            </div>
          </div>

          <a href="/" style={S.sideBack}>← Back to Platform</a>
        </aside>

        {/* ── Main ── */}
        <div style={S.main}>

          {/* Topbar */}
          <header style={S.topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {['overview','signups','enrollments','masterclasses','liveclasses'].find(t => t === tab) === 'overview' ? '📊 Dashboard Overview' :
                 tab === 'signups'       ? '👥 User Signups' :
                 tab === 'enrollments'   ? '📋 Course Enrollments' :
                 tab === 'masterclasses' ? '🎓 Masterclasses' : '🔴 Live Classes'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {loading && <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Syncing…</span>}
              <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>🔄 Refresh All</button>
            </div>
          </header>

          {/* Content */}
          <div style={S.content}>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Welcome back, {session.name.split(' ')[0]} 👋</h1>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.88rem' }}>Here's what's happening on your platform today.</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <StatCard icon="👥" value={signups.length}       label="Total Users"       color="#7c3aed" />
                  <StatCard icon="📋" value={enrollments.length}   label="Total Enrollments" color="#2563eb" />
                  <StatCard icon="⏳" value={pending}              label="Pending Approval"  color="#f59e0b" />
                  <StatCard icon="🎓" value={masterclasses.length} label="Masterclasses"     color="#10b981" />
                  <StatCard icon="🔴" value={liveclasses.length}   label="Live Classes"      color="#ef4444" />
                </div>

                {/* Quick lists */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Recent signups */}
                  <div style={S.card}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>👥 Recent Signups</div>
                    <div style={{ padding: '8px 0' }}>
                      {signups.slice(0, 5).map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                            {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{u.email}</div>
                          </div>
                          <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                          </div>
                        </div>
                      ))}
                      {signups.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>No signups yet</div>}
                    </div>
                  </div>

                  {/* Pending enrollments */}
                  <div style={S.card}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>⏳ Pending Enrollments</span>
                      {pending > 0 && <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>{pending}</span>}
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      {enrollments.filter(e => e.status === 'pending').slice(0, 5).map(e => (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <ActionBtn label="✅" color="#10b981" onClick={async () => { await apiUpdateEnrollment(e.id, 'approved'); setEnrollments(p => p.map(x => x.id === e.id ? {...x, status: 'approved'} : x)); showToast('Approved!', 'success'); }} />
                            <ActionBtn label="❌" color="#ef4444" onClick={async () => { await apiUpdateEnrollment(e.id, 'rejected'); setEnrollments(p => p.map(x => x.id === e.id ? {...x, status: 'rejected'} : x)); showToast('Rejected', 'warning'); }} />
                          </div>
                        </div>
                      ))}
                      {pending === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>No pending enrollments 🎉</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SIGNUPS ── */}
            {tab === 'signups' && (
              <div>
                <SectionHead title="👥 User Signups" count={signups.length} onRefresh={loadAll} />
                <div style={S.card}>
                  <DataTable heads={['#', 'Name', 'Email', 'Country', 'Phone', 'Joined', 'Action']} empty={signups.length === 0}>
                    {signups.map((u, i) => (
                      <Tr key={u.id}>
                        <Td muted>{i + 1}</Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{u.name}</span>
                          </div>
                        </Td>
                        <Td muted>{u.email}</Td>
                        <Td muted>{u.country}</Td>
                        <Td muted>{u.phone}</Td>
                        <Td muted>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</Td>
                        <Td><ActionBtn label="Delete" color="#ef4444" onClick={async () => { await apiDeleteSignup(u.id); setSignups(s => s.filter(x => x.id !== u.id)); showToast('User deleted', 'info'); }} /></Td>
                      </Tr>
                    ))}
                  </DataTable>
                </div>
              </div>
            )}

            {/* ── ENROLLMENTS ── */}
            {tab === 'enrollments' && (
              <div>
                <SectionHead title="📋 Course Enrollments" count={enrollments.length} onRefresh={loadAll} />
                <div style={S.card}>
                  <DataTable heads={['#', 'Student', 'Course', 'Status', 'Date', 'Actions']} empty={enrollments.length === 0}>
                    {enrollments.map((e, i) => (
                      <Tr key={e.id}>
                        <Td muted>{i + 1}</Td>
                        <Td>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{e.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.email}</div>
                          </div>
                        </Td>
                        <Td><span style={{ color: '#e2e8f0', maxWidth: 220, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course}</span></Td>
                        <Td><Pill status={e.status} /></Td>
                        <Td muted>{e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</Td>
                        <Td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <ActionBtn label="✅ Approve" color="#10b981" onClick={async () => { await apiUpdateEnrollment(e.id, 'approved'); setEnrollments(p => p.map(x => x.id === e.id ? {...x, status: 'approved'} : x)); showToast('Approved!', 'success'); }} />
                            <ActionBtn label="❌ Reject"  color="#ef4444" onClick={async () => { await apiUpdateEnrollment(e.id, 'rejected'); setEnrollments(p => p.map(x => x.id === e.id ? {...x, status: 'rejected'} : x)); showToast('Rejected', 'warning'); }} />
                            <ActionBtn label="Delete"     color="#94a3b8" onClick={async () => { await apiDeleteEnrollment(e.id); setEnrollments(p => p.filter(x => x.id !== e.id)); showToast('Deleted', 'info'); }} />
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </DataTable>
                </div>
              </div>
            )}

            {/* ── MASTERCLASSES ── */}
            {tab === 'masterclasses' && (
              <div>
                <SectionHead title="🎓 Masterclasses" count={masterclasses.length} onRefresh={loadAll} />
                <AddForm title="Add New Masterclass" onSubmit={async e => {
                  e.preventDefault();
                  await apiAddMasterclass({ ...mcForm, videoUrl: '', thumb: mcForm.thumb });
                  showToast('Masterclass added!', 'success'); loadAll();
                  setMcForm({ title: '', tag: 'Agentic AI', instructor: '', description: '', schedule: '', duration: '2 hrs', link: '', rating: 4.9, thumb: '' });
                }}>
                  <Field label="Title *"><input required style={inputStyle} value={mcForm.title} onChange={e => setMcForm(f => ({...f, title: e.target.value}))} placeholder="Masterclass title" /></Field>
                  <Field label="Tag"><input style={inputStyle} value={mcForm.tag} onChange={e => setMcForm(f => ({...f, tag: e.target.value}))} /></Field>
                  <Field label="Instructor"><input style={inputStyle} value={mcForm.instructor} onChange={e => setMcForm(f => ({...f, instructor: e.target.value}))} placeholder="Instructor name" /></Field>
                  <Field label="Schedule *"><input required type="datetime-local" style={inputStyle} value={mcForm.schedule} onChange={e => setMcForm(f => ({...f, schedule: e.target.value}))} /></Field>
                  <Field label="Duration"><input style={inputStyle} value={mcForm.duration} onChange={e => setMcForm(f => ({...f, duration: e.target.value}))} placeholder="e.g. 2 hrs" /></Field>
                  <Field label="Join Link"><input style={inputStyle} value={mcForm.link} onChange={e => setMcForm(f => ({...f, link: e.target.value}))} placeholder="https://meet.google.com/..." /></Field>
                  <Field label="Thumbnail Image" full>
                    <ImageUpload value={mcForm.thumb} onChange={url => setMcForm(f => ({...f, thumb: url}))} label="Masterclass Thumbnail" />
                  </Field>
                  <Field label="Description" full><textarea style={{...inputStyle, resize: 'vertical'}} rows={3} value={mcForm.description} onChange={e => setMcForm(f => ({...f, description: e.target.value}))} placeholder="What will attendees learn?" /></Field>
                </AddForm>

                <div style={S.card}>
                  <DataTable heads={['Title', 'Tag', 'Instructor', 'Schedule', 'Rating', 'Action']} empty={masterclasses.length === 0}>
                    {masterclasses.map(mc => (
                      <Tr key={mc.id}>
                        <Td><span style={{ fontWeight: 600, color: '#fff' }}>{mc.title}</span></Td>
                        <Td><span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '2px 9px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>{mc.tag}</span></Td>
                        <Td muted>{mc.instructor || '—'}</Td>
                        <Td muted>{mc.schedule ? new Date(mc.schedule).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</Td>
                        <Td><span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {mc.rating}</span></Td>
                        <Td><ActionBtn label="Delete" color="#ef4444" onClick={async () => { await apiDeleteMasterclass(mc.id); setMasterclasses(p => p.filter(x => x.id !== mc.id)); showToast('Deleted', 'info'); }} /></Td>
                      </Tr>
                    ))}
                  </DataTable>
                </div>
              </div>
            )}

            {/* ── LIVE CLASSES ── */}
            {tab === 'liveclasses' && (
              <div>
                <SectionHead title="🔴 Live Classes" count={liveclasses.length} onRefresh={loadAll} />
                <AddForm title="Add New Live Class" onSubmit={async e => {
                  e.preventDefault();
                  await apiAddLiveClass(lcForm);
                  showToast('Live class added!', 'success'); loadAll();
                  setLcForm({ title: '', tag: 'AI & ML', instructor: '', description: '', schedule: '', startTime: '', endTime: '', duration: '2 hrs', joinLink: '', thumb: '' });
                }}>
                  <Field label="Title *"><input required style={inputStyle} value={lcForm.title} onChange={e => setLcForm(f => ({...f, title: e.target.value}))} placeholder="Class title" /></Field>
                  <Field label="Tag"><input style={inputStyle} value={lcForm.tag} onChange={e => setLcForm(f => ({...f, tag: e.target.value}))} /></Field>
                  <Field label="Instructor"><input style={inputStyle} value={lcForm.instructor} onChange={e => setLcForm(f => ({...f, instructor: e.target.value}))} placeholder="Instructor name" /></Field>
                  <Field label="Schedule *"><input required type="datetime-local" style={inputStyle} value={lcForm.schedule} onChange={e => setLcForm(f => ({...f, schedule: e.target.value}))} /></Field>
                  <Field label="End Time (HH:MM)"><input type="time" style={inputStyle} value={lcForm.endTime} onChange={e => setLcForm(f => ({...f, endTime: e.target.value}))} /></Field>
                  <Field label="Duration"><input style={inputStyle} value={lcForm.duration} onChange={e => setLcForm(f => ({...f, duration: e.target.value}))} placeholder="e.g. 2 hrs" /></Field>
                  <Field label="Join Link" full><input style={inputStyle} value={lcForm.joinLink} onChange={e => setLcForm(f => ({...f, joinLink: e.target.value}))} placeholder="https://zoom.us/..." /></Field>
                  <Field label="Thumbnail Image" full>
                    <ImageUpload value={lcForm.thumb} onChange={url => setLcForm(f => ({...f, thumb: url}))} label="Live Class Thumbnail" />
                  </Field>
                  <Field label="Description" full><textarea style={{...inputStyle, resize: 'vertical'}} rows={3} value={lcForm.description} onChange={e => setLcForm(f => ({...f, description: e.target.value}))} placeholder="What will be covered?" /></Field>
                </AddForm>

                <div style={S.card}>
                  <DataTable heads={['Title', 'Tag', 'Instructor', 'Schedule', 'Join Link', 'Action']} empty={liveclasses.length === 0}>
                    {liveclasses.map(lc => (
                      <Tr key={lc.id}>
                        <Td><span style={{ fontWeight: 600, color: '#fff' }}>{lc.title}</span></Td>
                        <Td><span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 9px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>{lc.tag}</span></Td>
                        <Td muted>{lc.instructor || '—'}</Td>
                        <Td muted>{lc.schedule ? new Date(lc.schedule).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</Td>
                        <Td>{lc.join_link ? <a href={lc.join_link} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.78rem' }}>Join ↗</a> : <span style={{ color: '#64748b' }}>—</span>}</Td>
                        <Td><ActionBtn label="Delete" color="#ef4444" onClick={async () => { await apiDeleteLiveClass(lc.id); setLiveclasses(p => p.filter(x => x.id !== lc.id)); showToast('Deleted', 'info'); }} /></Td>
                      </Tr>
                    ))}
                  </DataTable>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
