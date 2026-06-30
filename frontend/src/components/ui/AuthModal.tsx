'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/ui/Toast';
import { validatePassword } from '@/lib/passwordPolicy';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pwStrength, setPwStrength] = useState<{ score: number; label: string; color: string } | null>(null);

  // Form refs
  const nameRef    = useRef<HTMLInputElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);
  const phoneRef   = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLSelectElement>(null);
  const pwRef      = useRef<HTMLInputElement>(null);
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPwRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isOpen) { setError(''); setPwStrength(null); } }, [isOpen]);

  if (!isOpen) return null;

  function handlePasswordChange(v: string) {
    const res = validatePassword(v);
    setPwStrength(res);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const name     = nameRef.current?.value.trim() || '';
    const email    = emailRef.current?.value.trim() || '';
    const phone    = phoneRef.current?.value.trim() || '';
    const country  = countryRef.current?.value || '+91';
    const password = pwRef.current?.value || '';

    if (!name || !email || !password) { setError('Name, email and password are required.'); return; }
    const { valid, message } = validatePassword(password);
    if (!valid) { setError(message); return; }

    setLoading(true);
    try {
      await signup({ name, email, password, country, phone });
      showToast(`Welcome, ${name}! 🎉`, 'success');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
    } finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const email    = loginEmailRef.current?.value.trim() || '';
    const password = loginPwRef.current?.value || '';
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! 👋', 'success');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <div className="modal-icon">🚀</div>
          <h2>Join Arthrex AI</h2>
          <p>Learn Agentic AI, GenAI, Data Science & more</p>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
          <button className={`modal-tab${tab === 'login'  ? ' active' : ''}`} onClick={() => { setTab('login');  setError(''); }}>Sign In</button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}

        {/* ── Sign Up ── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input ref={nameRef} className="auth-input" type="text" placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input ref={emailRef} className="auth-input" type="email" placeholder="you@example.com" required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ width: 110 }}>
                <label>Country</label>
                <select ref={countryRef} className="auth-input">
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phone</label>
                <input ref={phoneRef} className="auth-input" type="tel" placeholder="Phone number" />
              </div>
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input ref={pwRef} className="auth-input" type="password" placeholder="Min 8 chars, A-Z, a-z, 0-9, !@#$" required
                onChange={e => handlePasswordChange(e.target.value)} />
              {pwStrength && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${pwStrength.score}%`, background: pwStrength.color }} />
                  </div>
                  <div className="strength-text" style={{ color: pwStrength.color }}>{pwStrength.label}</div>
                </div>
              )}
            </div>
            <p className="form-note" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              🔒 Min 8 chars · Uppercase · Lowercase · Number · Special char
            </p>
            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Create Account →'}
            </button>
            <p className="form-note">By signing up, you agree to our terms of service.</p>
          </form>
        )}

        {/* ── Sign In ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div className="form-group">
              <label>Email</label>
              <input ref={loginEmailRef} className="auth-input" type="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input ref={loginPwRef} className="auth-input" type="password" placeholder="Your password" required />
            </div>
            <button className="btn-auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Sign In →'}
            </button>
            <p className="form-note">
              Demo: <strong>arjun@demo.com</strong> / <strong>Demo@1234</strong>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
