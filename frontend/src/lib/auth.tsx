'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiLogin, apiSignup } from './api';

export interface Session {
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  login:   (email: string, password: string) => Promise<void>;
  signup:  (data: { name: string; email: string; password: string; country: string; phone: string }) => Promise<void>;
  logout:  () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aai_session') || 'null');
      if (saved?.token) setSession(saved);
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const sess: Session = { name: res.name, email: res.email, role: res.role as 'user' | 'admin', token: res.token };
    localStorage.setItem('aai_session', JSON.stringify(sess));
    setSession(sess);
  }, []);

  const signup = useCallback(async (data: { name: string; email: string; password: string; country: string; phone: string }) => {
    const res = await apiSignup(data);
    const sess: Session = { name: res.name, email: res.email, role: res.role as 'user' | 'admin', token: res.token };
    localStorage.setItem('aai_session', JSON.stringify(sess));
    setSession(sess);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aai_session');
    setSession(null);
  }, []);

  return <AuthContext.Provider value={{ session, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
