'use client';

import React from 'react';
import { Notification } from '../../types';
import { Send, Clock, CheckCheck, User, Search, Filter, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WhatsAppOutboxViewProps {
  notifications: Notification[];
  onBack?: () => void;
}

export default function WhatsAppOutboxView({ notifications, onBack }: WhatsAppOutboxViewProps) {
  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">Institutional Outbox</h1>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1 italic">WhatsApp Business API Simulation</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00ff84] animate-pulse" />
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">API Status: Online</span>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#00ff84] transition-colors" />
             <input 
               type="text" 
               placeholder="Search notifications by merchant or content..."
               className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff84]/50 transition-all placeholder:text-zinc-700 font-medium"
             />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notifications.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600 italic">
               <Send className="w-12 h-12 mb-4 opacity-20" />
               <p>No notifications have been dispatched yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-[#121212] border border-zinc-800 p-5 rounded-2xl hover:border-[#00ff84]/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff84] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-black border border-zinc-700 uppercase">
                      {n.merchantName[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">{n.merchantName}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#00ff84]">
                    <CheckCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Sent</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 italic text-[11px] text-zinc-400 leading-relaxed mb-4">
                  <p className="mb-3">"{n.message}"</p>
                  
                  {/* Action Buttons in Outbox Simulation */}
                  <div className="flex flex-wrap gap-2">
                    {n.message.includes('[Details]') && (
                      <div className="bg-[#202c33] text-[9px] font-bold py-1 px-2 rounded-lg border border-zinc-700/50 flex items-center gap-1 opacity-80">
                        Details
                      </div>
                    )}
                    {n.message.includes('[Accept Offer]') && (
                      <div className="bg-[#00ff84]/20 text-[#00ff84] text-[9px] font-black py-1 px-2 rounded-lg border border-[#00ff84]/20 flex items-center gap-1 opacity-80">
                        Accept Offer
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="text-zinc-600">ID: {n.id}</span>
                   <button className="text-[#00ff84] hover:underline">View in Chat</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
