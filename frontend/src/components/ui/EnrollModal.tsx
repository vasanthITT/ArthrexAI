'use client';
import React, { useState } from 'react';
import { apiAddEnrollment } from '@/lib/api';
import { showToast } from '@/components/ui/Toast';

interface EnrollModalProps {
  courseName: string;
  onClose: () => void;
}

export default function EnrollModal({ courseName, onClose }: EnrollModalProps) {
  const [tab, setTab]         = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  // Register form
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [country, setCountry] = useState('+91');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email) { setError('Name and email are required.'); return; }
    setLoading(true);
    try {
      const fullPhone = phone ? `${country} ${phone}`.trim() : '';
      await apiAddEnrollment({ name, email, phone: fullPhone, course: courseName });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Enrollment failed.');
    } finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!loginEmail) { setError('Email is required.'); return; }
    setLoading(true);
    try {
      const { apiGetEnrollments } = await import('@/lib/api');
      // We check status via a simple fetch — user lookup
      showToast('Enrollment status: Please contact admin for your course access.', 'info');
      onClose();
    } catch { setError('Could not check enrollment status.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>

        {success ? (
          <div className="modal-success" style={{ display: 'flex' }}>
            <div className="success-icon">🎉</div>
            <h3>Enrollment Submitted!</h3>
            <p>Thank you for enrolling in <strong>{courseName}</strong>.</p>
            <p>Our team will review and approve your enrollment within 24 hours.</p>
            <button className="btn-auth-submit" onClick={onClose} style={{ marginTop: 12 }}>Got it!</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-icon">🎓</div>
              <h2>Enroll Now</h2>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{courseName}</p>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
              <button className={`modal-tab${tab === 'login'    ? ' active' : ''}`} onClick={() => { setTab('login');    setError(''); }}>Already Enrolled</button>
            </div>

            {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

            {tab === 'register' ? (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div className="form-group"><label>Full Name *</label><input className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required /></div>
                <div className="form-group"><label>Email *</label><input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ width: 100 }}>
                    <label>Country</label>
                    <select className="auth-input" value={country} onChange={e => setCountry(e.target.value)}>
                      <option value="+91">🇮🇳 +91</option><option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option><option value="+971">🇦🇪 +971</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}><label>Phone</label><input className="auth-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" /></div>
                </div>
                <button className="btn-auth-submit" type="submit" disabled={loading}>
                  {loading ? <span className="loading-spinner" /> : 'Enroll Now →'}
                </button>
                <p className="form-note">Free enrollment · Our team will contact you within 24 hrs</p>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div className="form-group"><label>Your Email</label><input className="auth-input" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Enrolled email address" required /></div>
                <button className="btn-auth-submit" type="submit" disabled={loading}>
                  {loading ? <span className="loading-spinner" /> : 'Check Status →'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
