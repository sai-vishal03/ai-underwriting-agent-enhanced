'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Use URL parameter for active view to prevent resets on refresh
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && view !== activeView) {
      setActiveView(view);
    }
  }, []);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    if (!user) {
      const savedUser = localStorage.getItem('grabon_user');
      if (!savedUser) {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d0d0d] gap-4">
        <Loader2 className="w-12 h-12 text-[#00ff84] animate-spin" />
        <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing AI Core...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
        <div className="flex-1 overflow-hidden">
          <Dashboard activeView={activeView} onViewChange={handleViewChange} />
        </div>
    </div>
  );

}

