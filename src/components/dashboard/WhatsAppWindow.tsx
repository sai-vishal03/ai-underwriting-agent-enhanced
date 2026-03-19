'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Notification, Merchant } from '../../types';
import { Send, User, CheckCheck, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WhatsAppWindowProps {
  notifications: Notification[];
  selectedMerchant: Merchant | null;
  onMinimize?: () => void;
}

export default function WhatsAppWindow({ notifications, selectedMerchant, onMinimize }: WhatsAppWindowProps) {
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notifications]);

  const merchantMessages = notifications.filter(n => n.merchantId === selectedMerchant?.id);

  return (
    <div className="bg-[#121212] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-full shadow-2xl">
      {/* WA Header */}
      <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
            {selectedMerchant?.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{selectedMerchant?.name || 'Select a Merchant'}</div>
            <div className="text-[10px] text-zinc-400">online</div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-zinc-400">
          <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Phone className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
          {onMinimize && (
            <button onClick={onMinimize} className="hover:text-white transition-colors group">
              <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          )}
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] relative"
      >
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
            backgroundSize: '400px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="flex justify-center mb-4">
          <div className="bg-[#182229] text-[10px] text-zinc-400 px-3 py-1 rounded-lg uppercase tracking-widest font-bold">
            Today
          </div>
        </div>

        {merchantMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 opacity-50">
             <div className="p-4 bg-[#182229] rounded-2xl border border-zinc-800 text-center max-w-[80%]">
               <p className="text-xs italic">Messages to this merchant will appear here as they are sent via the AI Core.</p>
             </div>
          </div>
        ) : (
            merchantMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-md relative group">
                  <p className="text-xs leading-relaxed mb-2">{msg.message}</p>
                  
                    {/* Action Buttons in Chat Simulation */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.message.includes('[Details]') && (
                        <button 
                          onClick={() => setShowDetailsId(showDetailsId === msg.id ? null : msg.id)}
                          className="bg-[#202c33] hover:bg-[#2a3942] text-[10px] font-bold py-1.5 px-3 rounded-lg border border-zinc-700/50 transition-all flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          {showDetailsId === msg.id ? 'Close Details' : 'Details'}
                        </button>
                      )}
                      {msg.message.includes('[Accept Offer]') && (
                        <button className="bg-[#00ff84] hover:bg-[#00e676] text-black text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          Accept Offer
                        </button>
                      )}
                    </div>

                    {showDetailsId === msg.id && (
                      <div className="mt-3 p-3 bg-[#202c33] rounded-xl border border-zinc-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-2">Extended Offer Intelligence</div>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px]">
                             <span className="text-zinc-500">Risk Assessment</span>
                             <span className="text-[#00ff84]">Optimal</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                             <span className="text-zinc-500">Tenure Options</span>
                             <span className="text-white">6, 12, 18 Months</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                             <span className="text-zinc-500">Settlement Type</span>
                             <span className="text-white">Instant NACH</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => setShowDetailsId(null)}
                          className="w-full mt-3 text-[9px] text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest"
                        >
                          Close Details
                        </button>
                      </div>
                    )}


                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] text-zinc-300">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            ))

        )}
      </div>

      {/* WA Input Simulation */}
      <div className="bg-[#202c33] p-3 flex items-center gap-4">
        <Smile className="w-6 h-6 text-zinc-400 cursor-pointer hover:text-white" />
        <Paperclip className="w-6 h-6 text-zinc-400 cursor-pointer hover:text-white rotate-45" />
        <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2.5 text-zinc-400 text-sm border border-transparent focus-within:border-zinc-700 transition-all">
          Type a message
        </div>
        <Mic className="w-6 h-6 text-zinc-400 cursor-pointer hover:text-white" />
      </div>
    </div>
  );
}
