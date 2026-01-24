import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { getMyPurchases, invalidateMyPurchases } from '../api/client';

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode } > = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('authUser');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Prefer live user info
      const { data } = await api.get('/users/me');
      if (data) {
        setUser(data);
        try { localStorage.setItem('authUser', JSON.stringify(data)); } catch {}
        try { await getMyPurchases({ force: true, ttlMs: 10 * 60 * 1000 }); } catch {}
      } else if (cached) {
        const u = JSON.parse(cached);
        setUser(u);
      } else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
    invalidateMyPurchases();
  };

  const ctx = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh: fetchMe, logout, setUser }),
    [user, loading]
  );
  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
