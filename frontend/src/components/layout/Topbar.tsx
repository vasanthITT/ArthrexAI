'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/ui/Toast';

const SECTIONS = [
  { id: 'home',        icon: '🏠', label: 'Dashboard' },
  { id: 'live',        icon: '🔴', label: 'Live Classes',   badge: 'LIVE' },
  { id: 'masterclass', icon: '🎓', label: 'Free Masterclasses', badge: 'NEW' },
  { id: 'trending',    icon: '🔥', label: 'Trending Topics' },
  { id: 'agentic',     icon: '🤖', label: 'Agentic AI' },
  { id: 'genai',       icon: '✨', label: 'Generative AI' },
  { id: 'datascience', icon: '🔬', label: 'Data Science' },
  { id: 'domainai',    icon: '🏭', label: 'Industry AI' },
  { id: 'programming', icon: '💻', label: 'Programming' },
  { id: 'success',     icon: '🏆', label: 'Success Stories' },
];

interface TopbarProps {
  activeSection: string;
  onShowAuth: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

export default function Topbar({ activeSection, onShowAuth, onToggleSidebar, searchQuery, onSearch }: TopbarProps) {
  const { session, logout } = useAuth();

  const initials = session ? session.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  })();

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — mobile only */}
        <button className="hamburger-btn" id="hamburgerBtn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <a className="logo" href="/">
          <img src="/logo-cropped.png" alt="Arthrex AI" className="logo-img" style={{ height: '40px', width: 'auto' }} />
        </a>

        {/* Search */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="mainSearch" type="text" placeholder="Search courses, topics..."
            value={searchQuery} onChange={e => onSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Website link */}
        <a className="btn-website" href="https://intraintech.com" target="_blank" rel="noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Website
        </a>

        {/* Social */}
        <a className="icon-btn social-btn" href="https://linkedin.com/company/intraintech" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a className="icon-btn social-btn" href="https://youtube.com/@intraintech" target="_blank" rel="noreferrer" aria-label="YouTube">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
          </svg>
        </a>

        {/* Auth */}
        {session ? (
          <>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{greeting}, <strong style={{ color: 'var(--text)' }}>{session.name.split(' ')[0]}</strong></span>
            <div className={`user-avatar${session.role === 'admin' ? ' avatar-admin' : ''}`} title={`${session.name} (${session.role})`}>
              {initials}
            </div>
            <button className="btn-logout" onClick={() => { logout(); showToast('Logged out successfully.', 'info'); }}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn-login" onClick={onShowAuth}>🚀 Get Started</button>
        )}
      </div>
    </header>
  );
}
