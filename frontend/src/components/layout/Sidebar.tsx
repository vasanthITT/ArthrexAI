'use client';
import React from 'react';
import { useAuth } from '@/lib/auth';

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  live: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="#ef4444" stroke="#ef4444" />
    </svg>
  ),
  masterclass: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
  trending: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  agentic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
      <path d="M9 15h6" />
    </svg>
  ),
  genai: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
    </svg>
  ),
  datascience: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  domainai: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 22H2M18 22V10l-4-4V2H6v8L2 14v8" />
    </svg>
  ),
  programming: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V11c0 2 1.5 3 4.5 3s4.5-1 4.5-3V6.5A4.5 4.5 0 0 0 12 2z" />
    </svg>
  )
};

const NAV_SECTIONS = [
  { label: 'PLATFORM',     items: [
    { id: 'home',        icon: ICONS.home, text: 'Dashboard' },
    { id: 'live',        icon: ICONS.live, text: 'Live Classes',  badge: 'LIVE', badgeCls: 'live-badge' },
    { id: 'masterclass', icon: ICONS.masterclass, text: 'Free Masterclasses', badge: 'NEW', badgeCls: 'new-badge' },
    { id: 'trending',    icon: ICONS.trending, text: 'Trending Topics' },
  ]},
  { label: 'AI COURSES',   items: [
    { id: 'agentic',     icon: ICONS.agentic, text: 'Agentic AI',      badge: 'HOT', badgeCls: 'new-badge' },
    { id: 'genai',       icon: ICONS.genai, text: 'Generative AI' },
    { id: 'datascience', icon: ICONS.datascience, text: 'Data Science' },
    { id: 'domainai',    icon: ICONS.domainai, text: 'Industry AI' },
    { id: 'programming', icon: ICONS.programming, text: 'Programming' },
  ]},
  { label: 'MORE', items: [
    { id: 'success',     icon: ICONS.success, text: 'Success Stories' },
  ]},
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onShowB2B: () => void;
}

export default function Sidebar({ active, onSelect, isOpen, onClose, onShowB2B }: SidebarProps) {
  const { session } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay${isOpen ? ' active' : ''}`} onClick={onClose} />

      <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(sec => (
            <div key={sec.label}>
              <div className="nav-section-label">{sec.label}</div>
              {sec.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item${active === item.id ? ' active' : ''}`}
                  onClick={() => { onSelect(item.id); onClose(); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.text}</span>
                  {item.badge && <span className={`badge ${item.badgeCls}`}>{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Admin Link */}
        {session?.role === 'admin' && (
          <a className="admin-link-btn show" href="/admin" target="_blank">
            ⚙️ Admin Panel
          </a>
        )}

        {/* B2B CTA */}
        <div className="sidebar-cta">
          <div className="b2b-cta-top">
            <span className="b2b-icon">🤝</span>
            <strong>B2B Collaboration</strong>
          </div>
          <p>Partner with Arthrex AI for custom AI training</p>
          <button className="btn-upgrade" onClick={onShowB2B}>Enquire Now →</button>
        </div>
      </aside>
    </>
  );
}
