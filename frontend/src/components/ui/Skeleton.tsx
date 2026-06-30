'use client';
import React from 'react';

/** Renders shimmer skeleton cards for loading states */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-thumb shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-tag shimmer" />
        <div className="skeleton-title shimmer" />
        <div className="skeleton-text shimmer" />
        <div className="skeleton-text short shimmer" />
        <div className="skeleton-meta shimmer" />
        <div className="skeleton-btn shimmer" />
      </div>
    </div>
  );
}

export function SkeletonLiveCard() {
  return (
    <div className="skeleton-live">
      <div className="skeleton-live-thumb shimmer" />
      <div className="skeleton-live-body">
        <div className="skeleton-tag shimmer" />
        <div className="skeleton-title shimmer" />
        <div className="skeleton-text shimmer" />
        <div className="skeleton-meta shimmer" />
        <div className="skeleton-btn shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'live' }) {
  return (
    <div className={type === 'live' ? 'live-grid' : 'cards-grid'}>
      {Array.from({ length: count }).map((_, i) =>
        type === 'live' ? <SkeletonLiveCard key={i} /> : <SkeletonCard key={i} />
      )}
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="skeleton-banner">
      <div className="skeleton-banner-text">
        <div className="skeleton-tag shimmer" style={{ width: 80 }} />
        <div className="skeleton-h1 shimmer" />
        <div className="skeleton-sub shimmer" />
        <div className="skeleton-cta shimmer" />
      </div>
      <div className="skeleton-stats">
        <div className="skeleton-stat shimmer" />
        <div className="skeleton-stat shimmer" />
        <div className="skeleton-stat shimmer" />
      </div>
    </div>
  );
}
