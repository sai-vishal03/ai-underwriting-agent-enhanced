'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  UserPlus, 
  History, 
  LogOut,
  ChevronRight,
  Info,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function Sidebar({ activeView = 'dashboard', onViewChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { id: 'about', label: 'About Website', icon: Info },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  ];

  const adminItems = [
    { id: 'add-partner', label: 'Add New Partner', icon: UserPlus },
    { id: 'whatsapp-outbox', label: 'WhatsApp Outbox', icon: Send },
    { id: 'logs', label: 'System Logs', icon: History },
  ];

  const handleItemClick = (id: string) => {
    if (onViewChange) {
      onViewChange(id);
    } else {
      router.push(`/?view=${id}`);
    }
  };

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] text-zinc-400 flex flex-col border-r border-zinc-800/50 sticky top-0 overflow-y-auto z-50">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.yourstory.com/cs/images/brandSpotlight/WhatsAppImage2023-09-20at11-1695236582304.jpeg" 
            alt="GrabOn Logo" 
            className="w-10 h-10 rounded-lg object-cover grayscale brightness-125"
          />
          <div className="font-bold text-white text-xl tracking-tight">GrabOn</div>
        </div>
        <div className="mt-1 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Fintech Solutions</div>
      </div>

      <div className="flex-1 px-3 space-y-1">
        <div className="text-[11px] font-semibold text-zinc-600 px-3 py-2 uppercase tracking-wider">Main</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              activeView === item.id 
                ? "bg-[#1a1a1a] text-[#00ff84] shadow-sm" 
                : "hover:bg-[#151515] hover:text-zinc-200"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-[#00ff84]" : "group-hover:text-zinc-300")} />
            <span className="text-sm font-medium">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00ff84] shadow-[0_0_10px_#00ff84]" />
            )}
          </button>
        ))}

        {isAdmin && (
          <>
            <div className="text-[11px] font-semibold text-zinc-600 px-3 py-6 uppercase tracking-wider">Administration</div>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  activeView === item.id 
                    ? "bg-[#1a1a1a] text-[#00ff84] shadow-sm" 
                    : "hover:bg-[#151515] hover:text-zinc-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-[#00ff84]" : "group-hover:text-zinc-300")} />
                <span className="text-sm font-medium">{item.label}</span>
                {activeView === item.id && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#00ff84] shadow-[0_0_10px_#00ff84]" />
                )}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-zinc-800/50 space-y-1">
        <button
          onClick={() => handleItemClick('profile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#151515] transition-all text-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs uppercase border border-zinc-700">
            {user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white font-medium truncate">{user?.email?.split('@')[0]}</div>
            <div className="text-[10px] text-zinc-500 uppercase">{user?.role}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

