'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Topbar        from '@/components/layout/Topbar';
import Sidebar       from '@/components/layout/Sidebar';
import AuthModal     from '@/components/ui/AuthModal';
import DashboardSection   from '@/components/sections/Dashboard';
import LiveClassesSection from '@/components/sections/LiveClasses';
import MasterclassSection from '@/components/sections/Masterclasses';
import TrendingSection    from '@/components/sections/Trending';
import CoursesSection     from '@/components/sections/Courses';

// ── Success Stories (static) ──────────────────────────────────────────────────
function SuccessSection({ active }: { active: boolean }) {
  const stories = [
    { name: 'Rahul Menon',  role: 'ML Engineer at Google',          text: "Arthrex AI transformed my career. The Agentic AI course is the most comprehensive I've ever taken — from LangChain to AWS Bedrock in 6 months.", badge: 'Placed at Google', featured: true },
    { name: 'Priya Nair',   role: 'AI Architect at Infosys',         text: 'The hands-on projects and real-world case studies made all the difference. I got promoted within 3 months of completing the course.', badge: '₹28 LPA' },
    { name: 'Arjun Kumar',  role: 'Data Scientist at Amazon',        text: "Best investment I've made. The GenAI course gave me skills that are directly applicable to my daily work.", badge: '3x Salary' },
    { name: 'Sneha Patel',  role: 'AI Product Manager at Flipkart',  text: 'The curriculum is industry-aligned and the instructors are actual practitioners. Highly recommended!', badge: 'Promoted' },
  ];
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header"><div><h2>🏆 Success Stories</h2><p className="section-subtitle">Real outcomes from our learners</p></div></div>
      <div className="stories-grid">
        {stories.map((s, i) => (
          <div key={i} className={`story-card${s.featured ? ' featured-story' : ''}`}>
            <div className="story-quote">"</div>
            <p>{s.text}</p>
            <div className="story-author">
              <div className="avatar">{s.name.split(' ').map(w => w[0]).join('')}</div>
              <div><strong>{s.name}</strong><span>{s.role}</span></div>
              <span className="story-badge">{s.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── B2B Modal ─────────────────────────────────────────────────────────────────
function B2BModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ company: '', name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose}>×</button>
        {sent ? (
          <div className="modal-success" style={{ display: 'flex' }}>
            <div className="success-icon">🤝</div>
            <h3>Request Submitted!</h3>
            <p>Our partnerships team will contact you within 24 business hours.</p>
            <button className="btn-auth-submit" onClick={onClose} style={{ marginTop: 12 }}>Got it!</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-icon">🤝</div>
              <h2>B2B Collaboration</h2>
              <p>Partner with Arthrex AI for custom AI training programs</p>
            </div>
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div className="form-group"><label>Company Name *</label><input className="auth-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your company" required /></div>
              <div className="form-group"><label>Your Name *</label><input className="auth-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" required /></div>
              <div className="form-group"><label>Work Email *</label><input className="auth-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="work@company.com" required /></div>
              <div className="form-group"><label>Phone</label><input className="auth-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number" /></div>
              <div className="form-group"><label>Message</label><textarea className="auth-input" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} placeholder="Tell us about your training requirements..." style={{ resize: 'vertical' }} /></div>
              <button className="btn-auth-submit" type="submit">Submit Enquiry →</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── SECTION IDs ───────────────────────────────────────────────────────────────
const COURSE_IDS = ['agentic', 'genai', 'datascience', 'domainai', 'programming'];

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function HomePage() {
  const [activeSection, setActiveSection] = useState('home');
  const [showAuth,      setShowAuth]      = useState(false);
  const [showB2B,       setShowB2B]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');

  // Unregister any old service workers
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
      });
    }
  }, []);

  const navigate = useCallback((section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <Topbar
        activeSection={activeSection}
        onShowAuth={() => setShowAuth(true)}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <div className="dashboard-layout">
        <Sidebar
          active={activeSection}
          onSelect={navigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onShowB2B={() => setShowB2B(true)}
        />

        <main className="main-content">
          {/*
            ALL sections are mounted once and toggled with CSS (active class).
            This prevents constant unmount→remount→re-fetch on every tab switch.
          */}

          {/* Dashboard */}
          <div style={{ display: activeSection === 'home' ? 'block' : 'none' }}>
            <DashboardSection onNavigate={navigate} onShowAuth={() => setShowAuth(true)} />
          </div>

          {/* Live Classes */}
          <div style={{ display: activeSection === 'live' ? 'block' : 'none' }}>
            <LiveClassesSection onShowAuth={() => setShowAuth(true)} />
          </div>

          {/* Masterclasses */}
          <div style={{ display: activeSection === 'masterclass' ? 'block' : 'none' }}>
            <MasterclassSection />
          </div>

          {/* Trending */}
          <div style={{ display: activeSection === 'trending' ? 'block' : 'none' }}>
            <TrendingSection />
          </div>

          {/* Course sections */}
          {COURSE_IDS.map(id => (
            <div key={id} style={{ display: activeSection === id ? 'block' : 'none' }}>
              <CoursesSection sectionId={id} />
            </div>
          ))}

          {/* Success Stories */}
          <SuccessSection active={activeSection === 'success'} />
        </main>
      </div>

      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />}
      {showB2B  && <B2BModal onClose={() => setShowB2B(false)} />}
    </>
  );
}
