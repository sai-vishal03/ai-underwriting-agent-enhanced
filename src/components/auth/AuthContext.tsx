'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Admin' | 'User';

interface User {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  useEffect(() => {
    // Sync with localStorage if it changes in other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'grabon_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (email: string, password?: string) => {
    let role: Role = 'User';
    if (email === 'AIVibeCoder@Grabon.com' && password === '3338582') {
      role = 'Admin';
    } else if (password) {
      // Mock validation for normal user
      if (password.length < 8) return false;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!(hasUpper && hasLower && hasNumber && hasSpecial)) return false;
    }

    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem('grabon_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grabon_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
