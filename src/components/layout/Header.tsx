'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Cpu
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface HeaderProps {
  stats: {
    totalDisbursed: number;
    pendingSettlement: number;
    totalApproved: number;
    totalRejected: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const cards = [
    { label: 'Total Disbursed', value: formatCurrency(stats.totalDisbursed), icon: Wallet, color: 'text-[#00ff84]', bg: 'bg-[#00ff84]/10' },
    { label: 'Pending Settlement', value: formatCurrency(stats.pendingSettlement), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', sub: '(24 hr simulation)' },
    { label: 'Total Approved', value: stats.totalApproved.toString(), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Total Rejected', value: stats.totalRejected.toString(), icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="w-full bg-[#0d0d0d]/80 backdrop-blur-md border-b border-zinc-800/50 sticky top-0 z-10 px-8 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time AI Merchant Underwriting Overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full group cursor-help transition-all hover:border-[#00ff84]/50">
          <Cpu className="w-4 h-4 text-[#00ff84] animate-pulse" />
          <span className="text-zinc-400 text-xs font-medium uppercase tracking-widest">AI CORE v3.0</span>
          <div className="w-2 h-2 rounded-full bg-[#00ff84] shadow-[0_0_8px_#00ff84]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="group relative overflow-hidden bg-[#121212] border border-zinc-800/80 p-5 rounded-2xl transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/40">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{card.label}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{card.value}</div>
              {card.sub && <div className="text-[10px] text-zinc-600 mt-1 uppercase font-semibold">{card.sub}</div>}
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#00ff84] to-emerald-600 transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
