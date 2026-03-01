'use client';

import React from 'react';
import { Merchant, UnderwritingResult, Notification } from '../../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Send, 
  CreditCard, Shield, Activity, BarChart3, PieChart, ShieldAlert, Clock
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

interface MerchantDetailProps {
  merchant: Merchant;
  result: UnderwritingResult;
  onNotify: (merchant: Merchant, type: 'Credit' | 'Insurance') => void;
  onAccept: (merchant: Merchant, type: 'Credit' | 'Insurance' | 'Both') => void;
  notifications: Notification[];
}

export default function MerchantDetail({ merchant, result, onNotify, onAccept, notifications }: MerchantDetailProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  if (!result) return <div className="flex items-center justify-center h-full text-zinc-500 italic">Calculating underwriting...</div>;

  const chartData = merchant.monthlyGmv12m.map((val, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    gmv: val
  }));

  const riskBenchmarks = [
    { label: 'Return Rate', value: merchant.customerReturnRate, benchmark: 60, unit: '%' },
    { label: 'Refund Rate', value: merchant.returnAndRefundRate, benchmark: 3, unit: '%' },
    { label: 'Seasonality Index', value: merchant.seasonalityIndex * 20, benchmark: 1.8 * 20, unit: '', displayValue: merchant.seasonalityIndex.toFixed(1) },
    { label: 'Exclusivity Rate', value: merchant.dealExclusivityRate, benchmark: 70, unit: '%' },
  ];

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Tier 1': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]';
      case 'Tier 2': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]';
      case 'Tier 3': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]';
      case 'Rejected': return 'bg-zinc-800 text-zinc-500 border-zinc-700';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score > 75) return 'text-[#00ff84]';
    if (score > 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Merchant Header Info */}
      <div className="bg-[#121212] border border-zinc-800 p-8 rounded-[32px] flex justify-between items-center group overflow-hidden relative shadow-2xl shadow-black/50">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">{merchant.name}</h2>
            <div className={cn(
              "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-lg",
              getTierBadgeColor(result.creditOffer.tier)
            )}>
              {result.creditOffer.tier}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> ID: {merchant.id}</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> {merchant.category}</span>
            {isAdmin && (
              <span className="flex items-center gap-1.5 text-[#00ff84]"><Send className="w-3 h-3" /> {merchant.whatsappNumber}</span>
            )}
          </div>
        </div>
        <div className="text-right relative z-10 flex flex-col items-end">
          <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Institutional Risk Score</div>
          <div className={cn("text-5xl font-black tabular-nums tracking-tighter leading-none drop-shadow-md", getRiskScoreColor(result.riskScore))}>
            {result.riskScore}<span className="text-xl opacity-30 ml-1">/100</span>
          </div>
          <div className="mt-2 text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Calculated by AI Core v3.0</div>
        </div>
      </div>

      {/* Tier Intelligence - New Detailed Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          "p-4 rounded-xl border transition-all duration-500",
          result.creditOffer.tier === 'Tier 1' ? "bg-emerald-500/10 border-emerald-500/30 scale-105 shadow-xl shadow-emerald-500/5 z-10" : "bg-zinc-900/30 border-zinc-800 opacity-40"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /></div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tier 1: Elite</h4>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed italic">High GMV stability, low refund rate, and exceptional customer retention. Eligible for max credit limits and lowest APR.</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border transition-all duration-500",
          result.creditOffer.tier === 'Tier 2' ? "bg-amber-500/10 border-amber-500/30 scale-105 shadow-xl shadow-amber-500/5 z-10" : "bg-zinc-900/30 border-zinc-800 opacity-40"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-500/20 rounded-lg"><Info className="w-3.5 h-3.5 text-amber-400" /></div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tier 2: Growth</h4>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed italic">Moderate volatility or slightly higher refund rates. Solid business foundation with standard credit limits and pricing.</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border transition-all duration-500",
          result.creditOffer.tier === 'Tier 3' || result.creditOffer.tier === 'Rejected' ? "bg-rose-500/10 border-rose-500/30 scale-105 shadow-xl shadow-rose-500/5 z-10" : "bg-zinc-900/30 border-zinc-800 opacity-40"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-500/20 rounded-lg"><AlertTriangle className="w-3.5 h-3.5 text-rose-400" /></div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tier 3 / Rejected</h4>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed italic">High risk factors detected: declining GMV, high refunds, or low exclusivity. Limited offers or full rejection based on PD threshold.</p>
        </div>
      </div>

      {/* 12-Month GMV Momentum Chart */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">12-Month GMV Momentum (Lakhs)</h3>
          </div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
            Historical Trend
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff84" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff84" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
              <XAxis dataKey="month" stroke="#4a4a4a" fontSize={10} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#4a4a4a" fontSize={10} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2d2d2d', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#00ff84' }}
              />
              <Area type="monotone" dataKey="gmv" stroke="#00ff84" strokeWidth={3} fillOpacity={1} fill="url(#colorGmv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Benchmark Comparison */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <PieChart className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Risk Benchmark Comparison</h3>
          </div>
          <div className="space-y-6 flex-1">
            {riskBenchmarks.map((bench, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">{bench.label}</span>
                  <span className="text-white">{bench.displayValue || bench.value}{bench.unit}</span>
                </div>
                <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                   {/* Benchmark Line */}
                   <div 
                     className="absolute top-0 bottom-0 w-0.5 bg-zinc-700 z-10"
                     style={{ left: `${bench.benchmark}%` }}
                   />
                   <div 
                     className={cn(
                       "absolute top-0 bottom-0 rounded-full transition-all duration-1000",
                       bench.label === 'Refund Rate' 
                         ? (bench.value > bench.benchmark ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]')
                         : (bench.value < bench.benchmark ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]')
                     )}
                     style={{ width: `${bench.value}%` }}
                   />
                </div>
                <div className="flex justify-between text-[8px] text-zinc-600 uppercase font-black italic tracking-widest">
                  <span>Merchant Level</span>
                  <span>Category Avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Risk Intelligence */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Credit Risk Intelligence (NBFC)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Prob. of Default (PD)</div>
              <div className="text-xl font-bold text-white tabular-nums">{(result.pd * 100).toFixed(1)}%</div>
              <p className="text-[8px] text-zinc-600 mt-1 italic">Probability of non-repayment</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Loss Given Default</div>
              <div className="text-xl font-bold text-white tabular-nums">{(result.lgd * 100).toFixed(0)}%</div>
              <p className="text-[8px] text-zinc-600 mt-1 italic">Estimated loss on default</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Expected Loss (EL)</div>
              <div className="text-xl font-bold text-rose-400 tabular-nums">₹{result.el.toFixed(2)}L</div>
              <p className="text-[8px] text-zinc-600 mt-1 italic">Annual loss expectation</p>
            </div>
            <div className="p-4 bg-[#00ff84]/5 border border-[#00ff84]/10 rounded-xl hover:border-[#00ff84]/30 transition-colors">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">RAROC</div>
              <div className={cn("text-xl font-bold tabular-nums", result.raroc > 25 ? 'text-[#00ff84]' : 'text-amber-400')}>
                {result.raroc}%
              </div>
              <p className="text-[8px] text-zinc-600 mt-1 italic">Risk-Adjusted Return</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
             <div className="flex items-center gap-2 mb-2">
               <Info className="w-3 h-3 text-zinc-500" />
               <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Pricing Analysis</span>
             </div>
             <div className="flex justify-between text-xs mb-1">
               <span className="text-zinc-500">Base Rate</span>
               <span className="text-white font-medium">15.0%</span>
             </div>
             <div className="flex justify-between text-xs mb-1">
               <span className="text-zinc-500">Risk Premium</span>
               <span className="text-white font-medium">+{result.creditOffer.riskPremium}%</span>
             </div>
             <div className="flex justify-between text-xs pt-1 border-t border-zinc-800 mt-1">
               <span className="text-[#00ff84] font-bold">Final APR</span>
               <span className="text-[#00ff84] font-bold">{result.creditOffer.interestRate}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Offer Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Credit Offer */}
        <div className={cn(
          "bg-[#121212] border border-zinc-800 p-8 md:p-12 rounded-[48px] relative overflow-hidden group shadow-2xl transition-all duration-500 hover:border-[#00ff84]/30 min-h-[600px] flex flex-col",
          result.creditOffer.status === 'Approved' ? 'border-[#00ff84]/20' : 'grayscale opacity-50 cursor-not-allowed'
        )}>
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <CreditCard className="w-48 h-48 text-white" />
          </div>
          
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-emerald-500/10 rounded-[24px] shadow-inner">
              <CreditCard className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-3xl lg:text-4xl tracking-tighter italic uppercase">GrabCredit</h3>
              <p className="text-[11px] text-zinc-500 font-black tracking-[0.3em] uppercase">Institutional Capital</p>
            </div>
            <div className="ml-auto">
              {result.creditOffer.status === 'Approved' ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full font-black tracking-widest border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">APPROVED</span>
              ) : (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-4 py-1.5 rounded-full font-black tracking-widest border border-rose-500/30">REJECTED</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10 border-y border-zinc-800/50 py-10">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Limit Amount</div>
              <div className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{formatCurrency(result.creditOffer.limit * 100000)}</div>
            </div>
            <div className="sm:border-l border-zinc-800/50 sm:pl-10 space-y-1">
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Interest Rate</div>
              <div className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{result.creditOffer.interestRate}<span className="text-xl font-medium ml-1">%</span><span className="text-[10px] text-zinc-500 ml-2 uppercase font-black tracking-widest">APR</span></div>
            </div>
          </div>

          <div className="flex-1 text-[14px] text-zinc-400 bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800/50 italic leading-relaxed shadow-inner mb-10 relative">
            <div className="absolute top-4 left-4 text-zinc-800 font-black text-4xl opacity-20">"</div>
            <p className="relative z-10 px-2">{result.creditOffer.rationale}</p>
            <div className="absolute bottom-4 right-4 text-zinc-800 font-black text-4xl opacity-20 rotate-180">"</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
             <button 
               onClick={() => isAdmin ? onNotify(merchant, 'Credit') : toast.error('This action is restricted to Admin users.')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-4 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all group/btn",
                 isAdmin 
                   ? "bg-[#00ff84] text-black hover:bg-[#00e676] hover:shadow-[0_0_40px_rgba(0,255,132,0.4)] hover:scale-[1.03] active:scale-[0.98]" 
                   : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
               )}
               disabled={result.creditOffer.status !== 'Approved'}
             >
               <Send className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
               Notify Admin
             </button>
             <button 
               onClick={() => onAccept(merchant, 'Credit')}
               className="flex-1 py-6 border border-zinc-800 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 hover:border-zinc-600 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl"
               disabled={result.creditOffer.status !== 'Approved'}
             >
               Self Accept
             </button>
          </div>
          {!isAdmin && (
             <p className="mt-6 text-[10px] text-zinc-600 text-center font-black tracking-[0.3em] italic uppercase opacity-60">
               Institutional Access Key Required
             </p>
          )}
        </div>

        {/* Insurance Offer */}
        <div className={cn(
          "bg-[#121212] border border-zinc-800 p-8 md:p-12 rounded-[48px] relative overflow-hidden group shadow-2xl transition-all duration-500 hover:border-blue-500/30 min-h-[600px] flex flex-col",
          result.insuranceOffer.status === 'Approved' ? 'border-blue-500/20' : 'grayscale opacity-50 cursor-not-allowed'
        )}>
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Shield className="w-48 h-48 text-white" />
          </div>

          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-blue-500/10 rounded-[24px] shadow-inner">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-3xl lg:text-4xl tracking-tighter italic uppercase">GrabShield</h3>
              <p className="text-[11px] text-zinc-500 font-black tracking-[0.3em] uppercase">Business Protection</p>
            </div>
            <div className="ml-auto">
              {result.insuranceOffer.status === 'Approved' ? (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full font-black tracking-widest border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">APPROVED</span>
              ) : (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-4 py-1.5 rounded-full font-black tracking-widest border border-rose-500/30">REJECTED</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10 border-y border-zinc-800/50 py-10">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Coverage Amount</div>
              <div className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{formatCurrency(result.insuranceOffer.coverageAmount * 100000)}</div>
            </div>
            <div className="sm:border-l border-zinc-800/50 sm:pl-10 space-y-1">
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Annual Premium</div>
              <div className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{formatCurrency(result.insuranceOffer.premium)}<span className="text-sm font-medium ml-1">/ YR</span></div>
            </div>
          </div>

          <div className="flex-1 text-[14px] text-zinc-400 bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-800/50 italic leading-relaxed shadow-inner mb-10 relative">
            <div className="absolute top-4 left-4 text-zinc-800 font-black text-4xl opacity-20">"</div>
            <p className="relative z-10 px-2">{result.insuranceOffer.rationale}</p>
            <div className="absolute bottom-4 right-4 text-zinc-800 font-black text-4xl opacity-20 rotate-180">"</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
             <button 
               onClick={() => isAdmin ? onNotify(merchant, 'Insurance') : toast.error('This action is restricted to Admin users.')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-4 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all group/btn",
                 isAdmin 
                   ? "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.03] active:scale-[0.98]" 
                   : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50"
               )}
               disabled={result.insuranceOffer.status !== 'Approved'}
             >
               <Send className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
               Notify Admin
             </button>
             <button 
               onClick={() => onAccept(merchant, 'Insurance')}
               className="flex-1 py-6 border border-zinc-800 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 hover:border-zinc-600 transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl"
               disabled={result.insuranceOffer.status !== 'Approved'}
             >
               Self Accept
             </button>
          </div>
          {!isAdmin && (
             <p className="mt-6 text-[10px] text-zinc-600 text-center font-black tracking-[0.3em] italic uppercase opacity-60">
               Institutional Access Key Required
             </p>
          )}
        </div>
      </div>
    </div>
  );
}
