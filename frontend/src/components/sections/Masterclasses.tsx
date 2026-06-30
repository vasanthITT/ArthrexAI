'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { apiGetMasterclasses, apiRegisterMasterclass, type MasterclassOut } from '@/lib/api';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/Toast';

function getMcStatus(schedule: string): 'live' | 'upcoming' | 'ended' {
  const diff = new Date(schedule).getTime() - Date.now();
  if (diff <= 0 && diff > -10_800_000) return 'live';
  if (diff > 0) return 'upcoming';
  return 'ended';
}

function getCountdown(schedule: string): string | null {
  const diff = new Date(schedule).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86_400_000);
  const hrs  = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0)  return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

// ── Registration Modal ────────────────────────────────────────────────────────
function McRegModal({ mc, onClose }: { mc: MasterclassOut; onClose: () => void }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) { setError('Name and email are required.'); return; }
    setLoading(true);
    try {
      await apiRegisterMasterclass({ mcId: String(mc.id), name, email, phone, country, masterclassTitle: mc.title });
      onClose();
      if (mc.link) window.open(mc.link, '_blank');
      else showToast('Registered! Join link will be shared by the instructor.', 'success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-header">
          <div className="modal-icon">🎓</div>
          <h2>Register for Free</h2>
          <p style={{ fontWeight: 700, color: 'var(--text)' }}>{mc.title}</p>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="form-group"><label>Full Name *</label><input className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></div>
          <div className="form-group"><label>Email *</label><input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="form-group" style={{ flex: 1 }}><label>Phone</label><input className="auth-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" /></div>
            <div className="form-group" style={{ flex: 1 }}><label>Country</label><input className="auth-input" value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" /></div>
          </div>
          <button className="btn-auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="loading-spinner" /> : mc.link ? 'Register & Join Now →' : 'Register for Free →'}
          </button>
          <p className="form-note">Free registration · No credit card required</p>
        </form>
      </div>
    </div>
  );
}

// ── Masterclass Card ──────────────────────────────────────────────────────────
function MasterclassCard({ mc, onRegister }: { mc: MasterclassOut; onRegister: (mc: MasterclassOut) => void }) {
  const [countdown, setCountdown] = useState(() => getCountdown(mc.schedule || ''));
  const status = getMcStatus(mc.schedule || '');
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown(mc.schedule || '')), 1000);
    return () => clearInterval(t);
  }, [mc.schedule]);

  const schedDate = new Date(mc.schedule || '');

  return (
    <div className="master-card mc-dynamic-card" style={{ cursor: 'pointer' }}>
      <div className="card-thumb mc-thumb" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', position: 'relative' }}>
        {mc.thumb && <img src={mc.thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} onError={e => (e.currentTarget.style.display = 'none')} />}
        <div className="mc-thumb-overlay" />
        {status === 'live'
          ? <span className="mc-live-badge">🔴 LIVE NOW</span>
          : <span className="mc-upcoming-badge">⏰ Upcoming</span>}
        <div className="mc-countdown-wrap">
          {status === 'live' ? <span className="mc-live-text">Join Now</span>
            : countdown ? <span className="mc-countdown">{countdown}</span> : null}
        </div>
        <div className="mc-thumb-title">{mc.title}</div>
      </div>

      <div className="card-body">
        <span className="tag free-tag">FREE</span>
        <h3>{mc.title}</h3>
        <p>{mc.description || 'Join this free live masterclass.'}</p>
        <div className="card-meta">
          <span>⏱ {mc.duration || '2 hrs'}</span>
          <span>⭐ {mc.rating || 4.9}</span>
          {mc.instructor && <span>👨‍🏫 {mc.instructor}</span>}
        </div>
        <div className="mc-schedule-row">
          <span>📅 {isNaN(schedDate.getTime()) ? '' : schedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>🕐 {isNaN(schedDate.getTime()) ? '' : schedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            className={`btn-enroll${status === 'live' ? ' mc-join-btn' : ''}`}
            onClick={() => onRegister(mc)}
          >
            {status === 'live' ? '🔴 Join Now' : 'Register Free →'}
          </button>
          <button className="mc-share-card-btn" title="Copy link"
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/masterclass/${mc.id}`); showToast('Link copied!', 'success'); }}>
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function MasterclassSection() {
  const [list, setList]           = useState<MasterclassOut[]>([]);
  const [loading, setLoading]     = useState(true);
  const [regTarget, setRegTarget] = useState<MasterclassOut | null>(null);

  const load = useCallback(async () => {
    try { const data = await apiGetMasterclasses(); setList(data); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  return (
    <section id="section-masterclass" className="content-section active">
      <div className="section-header">
        <div>
          <h2>🎓 Free Masterclasses</h2>
          <p className="section-subtitle">Free live sessions with industry experts — register in seconds</p>
        </div>
        <div className="filter-tabs">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Agentic AI</button>
          <button className="filter-btn">Generative AI</button>
          <button className="filter-btn">Data Science</button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={4} type="card" />
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
          <h3 style={{ color: 'var(--white)' }}>No masterclasses scheduled yet</h3>
          <p>Check back soon!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {list.map(mc => <MasterclassCard key={mc.id} mc={mc} onRegister={setRegTarget} />)}
        </div>
      )}

      {regTarget && <McRegModal mc={regTarget} onClose={() => setRegTarget(null)} />}
    </section>
  );
}
