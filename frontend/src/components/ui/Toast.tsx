'use client';
import React, { useEffect, useRef, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<ToastType, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};

interface ToastOptions { message: string; type?: ToastType; duration?: number; }

// Global singleton
let _showToast: ((opts: ToastOptions) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  _showToast?.({ message, type, duration });
}

export function ToastContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }: ToastOptions) => {
    const container = containerRef.current;
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type]}</span>
      <span class="toast-msg">${message.replace(/\n/g, '<br/>')}</span>
      <button class="toast-close" aria-label="Close">×</button>
    `;

    const close = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close')?.addEventListener('click', close);
    container.appendChild(toast);
    setTimeout(close, duration);
  }, []);

  useEffect(() => {
    _showToast = addToast;
    return () => { _showToast = null; };
  }, [addToast]);

  return <div id="toastContainer" ref={containerRef} />;
}
