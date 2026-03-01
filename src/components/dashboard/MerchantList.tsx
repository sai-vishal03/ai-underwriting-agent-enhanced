'use client';

import React from 'react';
import { Merchant, UnderwritingResult, Notification } from '../../types';
import { cn } from '../../lib/utils';
import { Badge } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface MerchantListProps {
  merchants: Merchant[];
  selectedId?: string;
  onSelect: (merchant: Merchant) => void;
  results: Record<string, UnderwritingResult>;
  notifications: Notification[];
  revealedIds?: Set<string>;
}

export default function MerchantList({ merchants, selectedId, onSelect, results, notifications, revealedIds = new Set() }: MerchantListProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const getStatus = (merchantId: string) => {
    const hasSent = notifications.some(n => n.merchantId === merchantId);
    if (hasSent) return { label: 'Notified', color: 'text-[#00ff84] bg-[#00ff84]/10 border-[#00ff84]/20' };
    return { label: 'Not Notified', color: 'text-zinc-500 bg-zinc-800/30 border-zinc-700/50' };
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Tier 2': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Tier 3': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Rejected': return 'bg-zinc-800 text-zinc-500 border-zinc-700';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  return (
    <div className="bg-[#121212] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden flex-1 shadow-2xl shadow-black/50">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 sticky top-0 z-10">
        <h3 className="text-white font-semibold text-sm tracking-tight uppercase">Merchant Partners</h3>
        <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">{merchants.length} Found</span>
      </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {merchants.map((merchant) => {
            const res = results[merchant.id];
            const status = getStatus(merchant.id);
            const isSelected = selectedId === merchant.id;
            const isRevealed = revealedIds.has(merchant.id);
  
            // For normal users, labels only show if the merchant is selected/revealed
            const showLabels = isAdmin || isSelected || isRevealed;
  
              return (
                  <button
                    key={merchant.id}
                    onClick={() => onSelect(merchant)}
                    className={cn(
                      "w-full text-left p-5 rounded-[24px] transition-all duration-300 border group transform",
                      isSelected 
                        ? "bg-[#1a1a1a] border-[#00ff84]/50 shadow-[0_20px_40px_rgba(0,0,0,0.6)] scale-[1.04] z-10" 
                        : "bg-[#161616]/40 border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700 hover:scale-[1.02] shadow-sm"
                    )}
                  >
  
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 pr-2">
                      <div className={cn(
                        "font-black text-[14px] transition-colors truncate tracking-tighter uppercase italic leading-tight",
                        isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      )}>
                        {merchant.name}
                      </div>
                      <div className="text-[10px] text-zinc-600 uppercase font-black mt-1 truncate tracking-widest italic opacity-70">{merchant.category}</div>
                    </div>
                    {showLabels && res && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className={cn(
                          "text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border shadow-sm",
                          getTierColor(res.creditOffer.tier)
                        )}>
                          {res.creditOffer.tier}
                        </div>
                        {!isAdmin && (
                          <div className={cn(
                            "text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.2em] border",
                            res.creditOffer.status === 'Approved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )}>
                            {res.creditOffer.status === 'Approved' ? 'PASS' : 'FAIL'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
  
                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className={cn(
                         "text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border truncate shadow-inner",
                         status.color
                       )}>
                         {status.label}
                       </div>
                    </div>
                    {showLabels && res && res.creditOffer.status === 'Approved' && (
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-black text-[#00ff84] tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,132,0.4)]">₹{res.creditOffer.limit}L</div>
                      </div>
                    )}
                  </div>
                </button>
              );
          })}
        </div>
    </div>
  );
}

