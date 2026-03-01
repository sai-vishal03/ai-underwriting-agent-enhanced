'use client';

import Sidebar from '@/components/layout/Sidebar';
import { User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar />
      <div className="flex-1 flex flex-col p-20 items-center justify-center">
        <div className="w-full max-w-lg bg-[#121212] border border-zinc-800 p-12 rounded-[40px] shadow-2xl shadow-black relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-48 h-48 text-white" />
          </div>
          
          <div className="flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-4xl font-black text-zinc-500 border border-zinc-700 shadow-xl">
              {user?.email?.[0].toUpperCase()}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter">{user?.email?.split('@')[0]}</h2>
              <div className="flex items-center justify-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#00ff84]" />
                 <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{user?.role} Access</span>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800/50" />

            <div className="w-full text-left space-y-4">
               <div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Identity Endpoint</div>
                  <div className="text-white font-medium">{user?.email}</div>
               </div>
               <div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Session Protocol</div>
                  <div className="text-white font-medium">Institutional SSO (v9.2.0)</div>
               </div>
            </div>

            <button className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl font-black uppercase tracking-widest hover:text-white hover:border-[#00ff84]/50 transition-all">
              Update Security Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
