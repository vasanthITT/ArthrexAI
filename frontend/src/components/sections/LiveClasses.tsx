'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { apiGetLiveClasses, type LiveClassOut } from '@/lib/api';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useAuth } from '@/lib/auth';
import { apiAddEnrollment } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLcStatus(schedule: string): 'live' | 'upcoming' | 'ended' {
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

// ── LiveClassCard ─────────────────────────────────────────────────────────────
function LiveClassCard({ lc, onEnroll, enrolledIds }: { lc: LiveClassOut; onEnroll: (id: number, title: string) => void; enrolledIds: Set<number> }) {
  const [countdown, setCountdown] = useState(() => getCountdown(lc.schedule || ''));
  const status = getLcStatus(lc.schedule || '');

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown(lc.schedule || '')), 1000);
    return () => clearInterval(t);
  }, [lc.schedule]);

  const isLive = status === 'live';
  const schedDate = new Date(lc.schedule || '');
  const link = lc.join_link || lc.joinLink || lc.link || '#';

  return (
    <div className={`live-card${isLive ? ' featured' : ''}`} data-lc-id={lc.id}>
      <div className="live-thumb" style={{ background: lc.thumb ? '#000' : 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
        {lc.thumb && <img src={lc.thumb} alt={lc.title} className="live-thumb-img" />}
        <div className="live-thumb-overlay" />
        <span className={`live-pill${isLive ? '' : ' upcoming-pill'}`}>
          {isLive ? '🔴 LIVE NOW' : `⏰ ${countdown || 'Soon'}`}
        </span>
        <div className="live-thumb-meta">
          <span>{isLive ? '🔴 Live' : countdown ? `⏰ ${countdown}` : ''}</span>
          <span>{lc.duration}</span>
        </div>
        {lc.instructor && (
          <div className="live-instructor-badge">
            <div className="live-inst-avatar" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              {lc.instructor.slice(0, 2).toUpperCase()}
            </div>
            <span>{lc.instructor}</span>
          </div>
        )}
      </div>

      <div className="live-body">
        <div className="live-body-top">
          <span className="tag">{lc.tag || 'AI & ML'}</span>
          <span className={`live-tag-dot ${isLive ? 'live-dot-red' : 'live-dot-yellow'}`}>
            {isLive ? '● LIVE' : '⏰ Soon'}
          </span>
        </div>
        <h3>{lc.title}</h3>
        <p>{lc.description || ''}</p>
        <div className="live-meta">
          <span>📅 {isNaN(schedDate.getTime()) ? '' : schedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span>🕐 {isNaN(schedDate.getTime()) ? '' : schedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}{lc.end_time ? ` – ${lc.end_time}` : ''}</span>
          <span>⏱ {lc.duration}</span>
        </div>
        <div className="live-actions">
          {isLive
            ? <a href={link} target="_blank" rel="noreferrer" className="btn-join">▶ Join Now</a>
            : enrolledIds.has(lc.id)
              ? <button className="btn-enroll btn-enrolled" disabled>✅ Enrolled</button>
              : <button className="btn-enroll" onClick={() => onEnroll(lc.id, lc.title || '')}>▶ Enroll</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function LiveClassesSection({ onShowAuth }: { onShowAuth: () => void }) {
  const { session } = useAuth();
  const [classes, setClasses] = useState<LiveClassOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  // Load enrolled state from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lf_lc_enrolled') || '[]') as number[];
      setEnrolledIds(new Set(saved));
    } catch {}
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await apiGetLiveClasses();
      setClasses(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  const handleEnroll = useCallback(async (id: number, title: string) => {
    if (!session) { onShowAuth(); return; }
    try {
      await apiAddEnrollment({ name: session.name, email: session.email, phone: '', course: title, courseId: '' });
      const next = new Set(enrolledIds);
      next.add(id);
      setEnrolledIds(next);
      localStorage.setItem('lf_lc_enrolled', JSON.stringify([...next]));
      showToast(`Enrolled in "${title}" successfully!`, 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Enrollment failed.', 'error');
    }
  }, [session, enrolledIds, onShowAuth]);

  return (
    <section id="section-live" className="content-section active">
      <div className="section-header">
        <div>
          <h2>🔴 Live Classes</h2>
          <p className="section-subtitle">Join live interactive sessions with expert instructors</p>
        </div>
        <div className="filter-tabs">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">AI & ML</button>
          <button className="filter-btn">Data Analytics</button>
          <button className="filter-btn">Cloud Based</button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={3} type="live" />
      ) : classes.length === 0 ? (
        <div className="lc-empty-state">
          <div style={{ fontSize: '3rem' }}>📅</div>
          <h3 style={{ color: 'var(--white)', fontWeight: 700 }}>No live classes scheduled</h3>
          <p style={{ color: 'var(--muted)' }}>Check back soon — new sessions added regularly.</p>
        </div>
      ) : (
        <div className="live-grid">
          {classes.map(lc => (
            <LiveClassCard key={lc.id} lc={lc} onEnroll={handleEnroll} enrolledIds={enrolledIds} />
          ))}
        </div>
      )}
    </section>
  );
}
