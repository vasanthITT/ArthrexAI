'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/ui/Toast';

// Predefined curriculum templates based on course name
function getCurriculumData(courseName: string) {
  const c = (courseName || '').toLowerCase();
  if (c.includes('agentic')) {
    return [
      {
        module: 'Module 1: Foundations of Agentic AI',
        lessons: [
          { id: 'a1', title: 'Introduction to Autonomous Agents' },
          { id: 'a2', title: 'API Tool Selection & Tool Calling' },
          { id: 'a3', title: 'Reasoning Loops (ReAct Framework)' },
          { id: 'a4', title: 'Building Your First Agent Framework' }
        ]
      },
      {
        module: 'Module 2: Advanced Multi-Agent Collaboration',
        lessons: [
          { id: 'a5', title: 'Hierarchical Multi-Agent Systems' },
          { id: 'a6', title: 'Inter-Agent Communication Protocols' },
          { id: 'a7', title: 'State & Memory Management in Workflows' },
          { id: 'a8', title: 'Collaborative Problem Solving Lab' }
        ]
      },
      {
        module: 'Module 3: Retrieval & Memory Integration',
        lessons: [
          { id: 'a9', title: 'Semantic Chunking & Embedding Strategies' },
          { id: 'a10', title: 'Hybrid RAG Pipeline Implementations' },
          { id: 'a11', title: 'Conversational Memory Store Integration' },
          { id: 'a12', title: 'Vector Index Optimizations' }
        ]
      },
      {
        module: 'Module 4: Enterprise Orchestration',
        lessons: [
          { id: 'a13', title: 'Agentic Workflow Design Patterns' },
          { id: 'a14', title: 'Production Orchestration Frameworks' },
          { id: 'a15', title: 'Resilience, Retries & Fallbacks' },
          { id: 'a16', title: 'High-Throughput Task Distribution' }
        ]
      },
      {
        module: 'Module 5: Security & Governance',
        lessons: [
          { id: 'a17', title: 'Guardrails & Context Moderation' },
          { id: 'a18', title: 'Prompt Injection Defense & Securing Tools' },
          { id: 'a19', title: 'LLM Evaluators & Agent Testing' },
          { id: 'a20', title: 'Capstone Enterprise Agent Project' }
        ]
      }
    ];
  }
  if (c.includes('data science') || c.includes('analytics')) {
    return [
      {
        module: 'Module 1: Python for Data Analysis',
        lessons: [
          { id: 'd1', title: 'NumPy Arrays & Mathematical Operations' },
          { id: 'd2', title: 'Data Wrangling with Pandas' },
          { id: 'd3', title: 'Handling Missing Values & Outliers' },
          { id: 'd4', title: 'Exploratory Data Analysis (EDA)' }
        ]
      },
      {
        module: 'Module 2: Visualization Dashboards',
        lessons: [
          { id: 'd5', title: 'Data Storytelling with Matplotlib & Seaborn' },
          { id: 'd6', title: 'Designing Dashboards in Power BI' },
          { id: 'd7', title: 'Tableau Visualizations & Storyboards' },
          { id: 'd8', title: 'Visual Analytics Project' }
        ]
      },
      {
        module: 'Module 3: Core Machine Learning',
        lessons: [
          { id: 'd9', title: 'Supervised Learning Algorithms' },
          { id: 'd10', title: 'Unsupervised Clustering & PCA' },
          { id: 'd11', title: 'Model Hyperparameter Tuning' },
          { id: 'd12', title: 'Advanced Feature Engineering' }
        ]
      },
      {
        module: 'Module 4: Applied Capstone Projects',
        lessons: [
          { id: 'd13', title: 'Project: E-Commerce Customer Churn Prediction' },
          { id: 'd14', title: 'Project: Real-time Sales Forecasting' },
          { id: 'd15', title: 'Model Pipeline Deployments' },
          { id: 'd16', title: 'Data Science Capstone Presentation' }
        ]
      }
    ];
  }
  // Default Template
  return [
    {
      module: 'Module 1: Introduction to the Course',
      lessons: [
        { id: 'g1', title: 'Course Overview & Roadmap' },
        { id: 'g2', title: 'Development Environment & Tools Setup' },
        { id: 'g3', title: 'Core Terminology & Concepts' },
        { id: 'g4', title: 'First Practical Lab' }
      ]
    },
    {
      module: 'Module 2: Core Skills & Practical Application',
      lessons: [
        { id: 'g5', title: 'Fundamental Building Blocks' },
        { id: 'g6', title: 'Hands-on Coding Practice' },
        { id: 'g7', title: 'Real-World System Architectures' },
        { id: 'g8', title: 'Module Mini-Project Challenge' }
      ]
    },
    {
      module: 'Module 3: Advanced Topics & Systems',
      lessons: [
        { id: 'g9', title: 'Scaling and Advanced Configurations' },
        { id: 'g10', title: 'Industry-Standard Design Patterns' },
        { id: 'g11', title: 'Governance and Performance Audit' },
        { id: 'g12', title: 'Case Study Reviews' }
      ]
    },
    {
      module: 'Module 4: Deployment & Capstone Project',
      lessons: [
        { id: 'g13', title: 'CI/CD Pipelines & Cloud Deployments' },
        { id: 'g14', title: 'System Auditing & Performance Optimization' },
        { id: 'g15', title: 'Monitoring & Scaling Best Practices' },
        { id: 'g16', title: 'Final Capstone Project Evaluation' }
      ]
    }
  ];
}

function CurriculumContent() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const courseName = searchParams.get('course') || 'AI Specialization';

  // Load curriculum structure
  const curriculum = getCurriculumData(courseName);

  // Lesson state
  const [activeLesson, setActiveLesson] = useState({ modIdx: 0, lesIdx: 0 });
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const progressKey = `lf_progress_${courseName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // Load progress
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || '[]');
      setCompleted(new Set(saved));
    } catch {}
  }, [progressKey]);

  // Save progress helper
  const toggleComplete = (lessonId: string) => {
    const next = new Set(completed);
    if (next.has(lessonId)) {
      next.delete(lessonId);
    } else {
      next.add(lessonId);
      showToast('Lesson marked as completed! 🎉', 'success');
    }
    setCompleted(next);
    localStorage.setItem(progressKey, JSON.stringify([...next]));
  };

  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
  const percentComplete = totalLessons ? Math.round((completed.size / totalLessons) * 100) : 0;

  // Active details
  const activeMod = curriculum[activeLesson.modIdx];
  const activeLes = activeMod?.lessons[activeLesson.lesIdx];
  const activeId  = activeLes?.id || `${activeLesson.modIdx}-${activeLesson.lesIdx}`;

  // Nav helpers
  const handlePrev = () => {
    let { modIdx: mi, lesIdx: li } = activeLesson;
    li--;
    if (li < 0) {
      mi--;
      if (mi >= 0) {
        li = curriculum[mi].lessons.length - 1;
      }
    }
    if (mi >= 0) setActiveLesson({ modIdx: mi, lesIdx: li });
  };

  const handleNext = () => {
    let { modIdx: mi, lesIdx: li } = activeLesson;
    li++;
    if (li >= curriculum[mi].lessons.length) {
      mi++;
      li = 0;
    }
    if (mi < curriculum.length) setActiveLesson({ modIdx: mi, lesIdx: li });
  };

  const isFirst = activeLesson.modIdx === 0 && activeLesson.lesIdx === 0;
  const isLast = activeLesson.modIdx === curriculum.length - 1 && activeLesson.lesIdx === curriculum[curriculum.length - 1].lessons.length - 1;

  const initials = session ? session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <div style={{ background: '#0d0d1a', minHeight: '100vh', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Topbar ── */}
      <header className="topbar" style={{ position: 'sticky', zIndex: 10 }}>
        <div className="topbar-left">
          <a className="logo" href="/">
            <img src="/logo-cropped.png" alt="Arthrex AI" className="logo-img" style={{ height: '40px', width: 'auto' }} />
          </a>
        </div>
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '8px 16px', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600 }}>
            ← Back to Dashboard
          </a>
          <div className="user-avatar" style={{ background: 'var(--gradient)' }}>
            {initials}
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="curriculum-layout" style={{ display: 'flex', flex: 1, marginTop: 0 }}>
        
        {/* Left Sidebar */}
        <aside className="module-sidebar" style={{ width: 280, background: '#111120', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div className="module-course-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            {courseName}
          </div>
          
          <div className="module-progress-wrap" style={{ marginBottom: 20 }}>
            <div className="module-progress-bar" style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
              <div className="module-progress-fill" style={{ height: '100%', background: 'var(--gradient)', width: `${percentComplete}%`, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>{percentComplete}% Complete</span>
          </div>

          <div className="module-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {curriculum.map((mod, mi) => (
              <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {mod.module}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {mod.lessons.map((les, li) => {
                    const isCur = mi === activeLesson.modIdx && li === activeLesson.lesIdx;
                    const isDone = completed.has(les.id);
                    return (
                      <button
                        key={li}
                        onClick={() => setActiveLesson({ modIdx: mi, lesIdx: li })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 12px',
                          borderRadius: 8,
                          background: isCur ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                          border: isCur ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                          color: isCur ? '#fff' : isDone ? 'var(--muted)' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: isCur ? 700 : 500,
                          transition: 'background 0.2s'
                        }}
                      >
                        <span>{isDone ? '✅' : '○'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{les.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lesson-content" style={{ flex: 1, padding: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
              {activeMod?.module}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              {activeLes?.title}
            </h1>
          </div>

          {/* Video Player Box */}
          <div style={{ aspectRatio: '16/9', width: '100%', background: '#13131f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>▶</div>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>Lesson Video: {activeLes?.title}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>Default video placeholder class active</p>
            </div>
          </div>

          {/* Description Body */}
          <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>About this lesson</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 0 20px' }}>
              In this session, you will learn about the foundational patterns and theoretical applications of <strong>{activeLes?.title}</strong> in modern AI industry environments.
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, paddingLeft: 20, margin: '0 0 24px' }}>
              <li>Understand details and workflow implementation constraints for {activeLes?.title}.</li>
              <li>Hands-on code patterns and model validation parameters.</li>
              <li>Detailed summary materials and links available to download.</li>
            </ul>

            <button
              onClick={() => toggleComplete(activeId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: completed.has(activeId) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#10b981,#0ea5e9)',
                border: completed.has(activeId) ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 9,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              {completed.has(activeId) ? '✓ Completed' : '✅ Mark as Complete'}
            </button>
          </div>

          {/* Prev/Next buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={handlePrev}
              disabled={isFirst}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
                padding: '10px 20px',
                borderRadius: 9,
                cursor: isFirst ? 'not-allowed' : 'pointer',
                opacity: isFirst ? 0.4 : 1,
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={isLast}
              style={{
                background: isLast ? 'rgba(255,255,255,0.05)' : 'var(--gradient)',
                border: isLast ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 9,
                cursor: isLast ? 'not-allowed' : 'pointer',
                opacity: isLast ? 0.4 : 1,
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0d0d1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Loading curriculum...
      </div>
    }>
      <CurriculumContent />
    </Suspense>
  );
}
