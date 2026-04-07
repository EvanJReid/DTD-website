import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface User {
  userId: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = import.meta.env.VITE_ORACLE_APEX_URL || 'https://129-213-123-67.sslip.io/api';

function getStoredUser(): User | null {
  try {
    const email = localStorage.getItem('dtd_email');
    const userId = localStorage.getItem('dtd_user_id');
    if (email && userId) return { email, userId: parseInt(userId) };
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Invalid credentials');
    }
    const { token } = await res.json();
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('dtd_token', token);
    localStorage.setItem('dtd_email', payload.email);
    localStorage.setItem('dtd_user_id', String(payload.userId));
    setUser({ email: payload.email, userId: payload.userId });
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Signup failed');
    }
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('dtd_token');
    localStorage.removeItem('dtd_email');
    localStorage.removeItem('dtd_user_id');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
