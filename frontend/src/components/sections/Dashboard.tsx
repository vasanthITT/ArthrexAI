'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiGetLMS, type LMSCourse } from '@/lib/api';
import { SkeletonBanner, SkeletonGrid } from '@/components/ui/Skeleton';

const GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#2563eb)',
  'linear-gradient(135deg,#10b981,#0ea5e9)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#059669,#0ea5e9)',
  'linear-gradient(135deg,#f97316,#facc15)',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Generative AI': '✨', 'Agentic AI': '🤖',
  'Data Science': '🔬', 'Data Science & Analytics': '🔬',
  'Domain AI': '🏭', 'Industry AI': '🏭', 'LLM': '🧠',
  'RAG': '🔗', 'MCP': '🔌', 'Programming': '💻', default: '📚',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning ☀️';
  if (h < 17) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
}

interface DashboardProps {
  onNavigate: (section: string) => void;
  onShowAuth: () => void;
}

export default function DashboardSection({ onNavigate, onShowAuth }: DashboardProps) {
  const { session, loading: authLoading } = useAuth();
  const [courses, setCourses]     = useState<Record<string, LMSCourse>>({});
  const [lmsLoading, setLmsLoading] = useState(true);
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    apiGetLMS().then(data => {
      setCourses(data);
      // Load progress from localStorage
      const p: Record<string, number> = {};
      Object.entries(data).forEach(([id, course]) => {
        const totalLessons = (course.topics || []).reduce((s, t) => s + (t.lessons || []).length, 0);
        const done = JSON.parse(localStorage.getItem(`lf_progress_${id}`) || '[]').length;
        p[id] = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
      });
      setProgresses(p);
    }).catch(() => {}).finally(() => setLmsLoading(false));
  }, []);

  const courseEntries = Object.entries(courses);
  const enrolled  = courseEntries.length;
  const completed = courseEntries.filter(([id]) => progresses[id] === 100).length;
  const avgPct    = enrolled ? Math.round(Object.values(progresses).reduce((a, b) => a + b, 0) / enrolled) : 0;

  if (authLoading) {
    return (
      <section id="section-home" className="content-section active">
        <SkeletonBanner />
        <SkeletonGrid count={3} />
      </section>
    );
  }

  return (
    <section id="section-home" className="content-section active">
      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">{getGreeting()}</div>
          <h1>
            {session ? (
              <>Welcome back, <span className="gradient-text">{session.name.split(' ')[0]}</span>! 👋</>
            ) : (
              <>Welcome to <span className="gradient-text">Arthrex AI</span> 🚀</>
            )}
          </h1>
          <p className="welcome-sub">
            {session
              ? `${enrolled} course${enrolled !== 1 ? 's' : ''} enrolled · Keep going!`
              : 'Learn Agentic AI, GenAI, Data Science and more from industry experts.'}
          </p>
          {session ? (
            <button className="btn-primary" onClick={() => onNavigate('agentic')}>Browse Courses →</button>
          ) : (
            <button className="btn-primary" onClick={onShowAuth}>🚀 Start Learning Free</button>
          )}
        </div>
        <div className="welcome-stats">
          <div className="stat-box"><strong id="statEnrolled">{enrolled}</strong><span>Enrolled</span></div>
          <div className="stat-box"><strong id="statCompleted">{completed}</strong><span>Completed</span></div>
          <div className="stat-box"><strong id="statProgress">{avgPct}%</strong><span>Progress</span></div>
        </div>
      </div>

      {/* ── My Courses ── */}
      <div className="section-header">
        <div>
          <h2>📚 My Courses</h2>
          <p className="section-subtitle">Pick up where you left off</p>
        </div>
        {session?.role === 'admin' && (
          <a href="/admin-lms" target="_blank" className="btn-manage-courses" style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--card-border)', color: 'var(--text)', fontSize: '0.82rem', cursor: 'pointer' }}>
            ✏️ Manage Courses
          </a>
        )}
      </div>

      {lmsLoading ? (
        <SkeletonGrid count={3} />
      ) : courseEntries.length === 0 ? (
        <div className="my-courses-empty">
          <div className="empty-icon">🎓</div>
          <h3>No courses yet</h3>
          <p>Enroll in a course to get started on your AI learning journey.</p>
          <button className="btn-primary" onClick={() => onNavigate('agentic')} style={{ marginTop: 8 }}>Browse Courses →</button>
        </div>
      ) : (
        <div className="cards-grid">
          {courseEntries.map(([id, course], idx) => {
            const icon  = CATEGORY_ICONS[course.category || ''] || CATEGORY_ICONS.default;
            const grad  = GRADIENTS[idx % GRADIENTS.length];
            const pct   = progresses[id] || 0;
            const total = (course.topics || []).reduce((s, t) => s + (t.lessons || []).length, 0);
            const mods  = (course.topics || []).length;
            return (
              <div key={id} className="master-card dashboard-course-card">
                <div className="card-thumb" style={{ background: grad }}>{icon}</div>
                <div className="card-body">
                  <span className="tag">{course.category || 'Course'}</span>
                  <h3>{course.name}</h3>
                  <p>{mods} modules · {total} lessons · {course.duration || 'Self-paced'}</p>
                  <div className="progress-bar" style={{ margin: '10px 0 4px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="progress-label">{pct}% complete</p>
                  <div className="job-ready-banner">
                    <span className="job-ready-icon">💼</span>
                    <div>
                      <strong>Job Ready</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)' }}>Industry-aligned · Certificate included</span>
                    </div>
                  </div>
                  <div className="dashboard-course-actions">
                    <a href={`/curriculum?course=${encodeURIComponent(course.name)}`} className="btn-enroll">
                      {pct > 0 ? '▶ Continue' : '▶ Start Course'}
                    </a>
                    {session?.role === 'admin' && (
                      <a href="/admin-lms" className="btn-edit-course" onClick={() => localStorage.setItem('lf_active_course', id)}>✏️ Edit</a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
