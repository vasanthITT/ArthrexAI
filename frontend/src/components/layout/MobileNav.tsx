'use client';
import React from 'react';

interface MobileNavProps {
  active: string;
  onSelect: (id: string) => void;
}

const ITEMS = [
  { id: 'home',        icon: '🏠', label: 'Home' },
  { id: 'live',        icon: '🔴', label: 'Live' },
  { id: 'masterclass', icon: '🎓', label: 'Classes' },
  { id: 'agentic',     icon: '🤖', label: 'AI' },
  { id: 'trending',    icon: '🔥', label: 'Trending' },
];

export default function MobileBottomNav({ active, onSelect }: MobileNavProps) {
  return (
    <nav className="mobile-bottom-nav" style={{ display: 'flex' }}>
      {ITEMS.map(item => (
        <a
          key={item.id}
          className={active === item.id ? 'active' : ''}
          href="#"
          onClick={e => { e.preventDefault(); onSelect(item.id); }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
