'use client';

import React, { useState } from 'react';
import { Merchant, UnderwritingResult, Notification, RiskMemo } from '../../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Send, 
  CreditCard, Shield, Activity, BarChart3, PieChart, ShieldAlert
} from 'lucide-react';
import { cn, formatIndianCurrency } from '../../lib/utils';
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
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, type: 'Credit' | 'Insurance' | null}>({isOpen: false, type: null});
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [riskMemo, setRiskMemo] = useState<RiskMemo | null>(null);

  const generateRiskMemo = async () => {
    setIsGeneratingMemo(true);
    try {
      const res = await fetch('/api/risk-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id })
      });
      const data = await res.json();
      if (data.success) {
        setRiskMemo(data.data);
        toast.success('Risk Memo generated successfully');
      } else {
        toast.error('Failed to generate Risk Memo');
      }
    } catch (e) {
      toast.error('Error connecting to Risk AI');
    } finally {
      setIsGeneratingMemo(false);
    }
  };

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
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  const executeAccept = () => {
    if (confirmDialog.type) {
      onAccept(merchant, confirmDialog.type);
    }
    setConfirmDialog({ isOpen: false, type: null });
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Confirmation Dialog Overlay */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h3 className="text-white text-xl font-bold mb-4">Are you sure?</h3>
            <p className="text-zinc-400 mb-8">Did the merchant confirm that you should accept the offer on their behalf?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, type: null })}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeAccept}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Header Info */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-[24px] flex justify-between items-center group overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">{merchant.name}</h2>
            <div className={cn(
              "text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-sm",
              getTierBadgeColor(result.creditOffer.tier)
            )}>
              {result.creditOffer.tier}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> ID: {merchant.id}</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> {merchant.category}</span>
            {isAdmin && merchant.whatsappNumber && (
              <span className="flex items-center gap-1.5 text-[#00ff84]"><Send className="w-3 h-3" /> {merchant.whatsappNumber}</span>
            )}
          </div>
        </div>
        <div className="text-right relative z-10 flex flex-col items-end">
          <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Institutional Risk Score</div>
          <div className={cn("text-4xl font-black tabular-nums tracking-tighter leading-none drop-shadow-sm", result.riskScore > 75 ? 'text-[#00ff84]' : result.riskScore > 50 ? 'text-amber-400' : 'text-rose-400')}>
            {result.riskScore}<span className="text-lg opacity-30 ml-1">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Benchmark Comparison */}
        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <PieChart className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Risk Benchmark Comparison</h3>
          </div>
          <div className="space-y-5 flex-1">
            {riskBenchmarks.map((bench, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">{bench.label}</span>
                  <span className="text-white">{bench.displayValue || bench.value}{bench.unit}</span>
                </div>
                <div className="relative h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                   <div className="absolute top-0 bottom-0 w-0.5 bg-zinc-700 z-10" style={{ left: `${bench.benchmark}%` }} />
                   <div 
                     className={cn(
                       "absolute top-0 bottom-0 rounded-full transition-all duration-1000",
                       bench.label === 'Refund Rate' 
                         ? (bench.value > bench.benchmark ? 'bg-rose-500' : 'bg-emerald-500')
                         : (bench.value < bench.benchmark ? 'bg-rose-500' : 'bg-emerald-500')
                     )}
                     style={{ width: `${bench.value}%` }}
                   />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Risk Intelligence */}
        <div className="bg-[#121212] border border-zinc-800 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Credit Risk Intelligence (NBFC)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Prob. of Default</div>
              <div className="text-lg font-bold text-white tabular-nums">{(result.pd * 100).toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Loss Given Default</div>
              <div className="text-lg font-bold text-white tabular-nums">{(result.lgd * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Expected Loss</div>
              <div className="text-lg font-bold text-rose-400 tabular-nums">{formatIndianCurrency(result.el * 100000)}</div>
            </div>
            <div className="p-3 bg-[#00ff84]/5 border border-[#00ff84]/10 rounded-xl">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">RAROC</div>
              <div className={cn("text-lg font-bold tabular-nums", result.raroc > 25 ? 'text-[#00ff84]' : 'text-amber-400')}>
                {result.raroc.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Committee AI Section */}
      <div className="bg-[#121212] border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Risk Committee AI</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Automated Underwriting Memorandum</p>
            </div>
          </div>
          {!riskMemo && (
            <button
              onClick={generateRiskMemo}
              disabled={isGeneratingMemo}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isGeneratingMemo ? <Activity className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              {isGeneratingMemo ? 'Analyzing...' : 'Generate Memo'}
            </button>
          )}
        </div>

        {riskMemo && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
               <div className="flex-1 space-y-2">
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Executive Summary</div>
                 <p className="text-sm text-zinc-300 leading-relaxed">{riskMemo.riskSummary}</p>
               </div>
               <div className="w-px bg-zinc-800 hidden md:block" />
               <div className="flex-1 space-y-2">
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Financial Recommendation</div>
                 <p className="text-sm text-zinc-300 leading-relaxed font-medium">{riskMemo.financialRecommendation}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Key Risk Drivers</div>
                <div className="space-y-2">
                  {riskMemo.keyRiskDrivers.map((driver, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-zinc-400 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 space-y-5">
                {/* Risk Level Badge */}
                <div className="text-center">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Risk Classification</div>
                  <div className={cn(
                    "text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest border inline-block",
                    riskMemo.risk_level === 'LOW' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    riskMemo.risk_level === 'MEDIUM' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {riskMemo.risk_level} RISK
                  </div>
                </div>

                {/* Numeric Confidence Score */}
                <div className="text-center w-full">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">ML Confidence Score</div>
                  <div className={cn(
                    "text-4xl font-black tabular-nums tracking-tight",
                    riskMemo.confidence_score >= 0.75 ? "text-[#00ff84]" :
                    riskMemo.confidence_score >= 0.45 ? "text-amber-400" : "text-rose-400"
                  )}>
                    {(riskMemo.confidence_score * 100).toFixed(1)}
                    <span className="text-sm opacity-40 ml-0.5">%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full max-w-[200px] mx-auto h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000",
                      riskMemo.confidence_score >= 0.75 ? "bg-[#00ff84]" :
                      riskMemo.confidence_score >= 0.45 ? "bg-amber-500" : "bg-rose-500"
                    )} style={{ width: `${riskMemo.confidence_score * 100}%` }} />
                  </div>
                </div>

                {/* Human-Readable Confidence */}
                <div className="text-center">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Qualitative Assessment</div>
                  <div className={cn(
                    "text-lg font-black uppercase tracking-widest",
                    riskMemo.confidenceLevel === 'High' ? "text-[#00ff84]" :
                    riskMemo.confidenceLevel === 'Medium' ? "text-amber-400" : "text-rose-400"
                  )}>
                    {riskMemo.confidenceLevel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offer Panel - Compact and Redesigned tiles */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* GrabCredit Tile */}
        <div className={cn(
          "bg-[#121212] border border-zinc-800 p-6 rounded-[32px] relative overflow-hidden group shadow-lg transition-all duration-300 min-h-[420px] flex flex-col",
          result.creditOffer.status === 'Approved' ? 'border-[#00ff84]/30' : 'grayscale opacity-60'
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl shadow-inner">
              <CreditCard className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-2xl italic uppercase tracking-tight">GrabCredit</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Institutional Capital</p>
            </div>
            <div className="ml-auto">
              <span className={cn(
                "text-[9px] px-3 py-1 rounded-full font-black tracking-widest border",
                result.creditOffer.status === 'Approved' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"
              )}>
                {result.creditOffer.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 border-y border-zinc-800/50 py-6">
            <div className="space-y-1">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Limit Amount</div>
              <div className="text-2xl font-black text-white tabular-nums drop-shadow-md">
                {formatIndianCurrency(result.creditOffer.limit * 100000)}
              </div>
            </div>
            <div className="border-l border-zinc-800/50 pl-6 space-y-1">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Interest Rate</div>
              <div className="text-2xl font-black text-white tabular-nums drop-shadow-md">
                {result.creditOffer.interestRate}% <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">APR</span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-[12px] text-zinc-400 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 italic leading-relaxed mb-6">
            {result.creditOffer.rationale}
          </div>

          <div className="flex gap-4 mt-auto">
             <button 
               onClick={() => isAdmin ? onNotify(merchant, 'Credit') : toast.error('This action is restricted to Admin users.')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors",
                 isAdmin 
                   ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                   : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
               )}
               disabled={result.creditOffer.status !== 'Approved'}
             >
               <Send className="w-4 h-4" />
               NOTIFY VIA WHATSAPP
             </button>
             <button 
               onClick={() => setConfirmDialog({ isOpen: true, type: 'Credit' })}
               className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-500 transition-colors"
               disabled={result.creditOffer.status !== 'Approved'}
             >
               ACCEPT ON BEHALF OF MERCHANT
             </button>
          </div>
        </div>

        {/* GrabShield Tile */}
        <div className={cn(
          "bg-[#121212] border border-zinc-800 p-6 rounded-[32px] relative overflow-hidden group shadow-lg transition-all duration-300 min-h-[420px] flex flex-col",
          result.insuranceOffer.status === 'Approved' ? 'border-blue-500/30' : 'grayscale opacity-60'
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-2xl italic uppercase tracking-tight">GrabShield</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Business Protection</p>
            </div>
            <div className="ml-auto">
              <span className={cn(
                "text-[9px] px-3 py-1 rounded-full font-black tracking-widest border",
                result.insuranceOffer.status === 'Approved' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"
              )}>
                {result.insuranceOffer.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 border-y border-zinc-800/50 py-6">
            <div className="space-y-1">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Coverage Amount</div>
              <div className="text-2xl font-black text-white tabular-nums drop-shadow-md">
                {formatIndianCurrency(result.insuranceOffer.coverageAmount * 100000)}
              </div>
            </div>
            <div className="border-l border-zinc-800/50 pl-6 space-y-1">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Annual Premium</div>
              <div className="text-2xl font-black text-white tabular-nums drop-shadow-md">
                {formatIndianCurrency(result.insuranceOffer.premium)} <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">/ YR</span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-[12px] text-zinc-400 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 italic leading-relaxed mb-6">
            {result.insuranceOffer.rationale}
          </div>

          <div className="flex gap-4 mt-auto">
             <button 
               onClick={() => isAdmin ? onNotify(merchant, 'Insurance') : toast.error('This action is restricted to Admin users.')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors",
                 isAdmin 
                   ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                   : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
               )}
               disabled={result.insuranceOffer.status !== 'Approved'}
             >
               <Send className="w-4 h-4" />
               NOTIFY VIA WHATSAPP
             </button>
             <button 
               onClick={() => setConfirmDialog({ isOpen: true, type: 'Insurance' })}
               className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-500 transition-colors"
               disabled={result.insuranceOffer.status !== 'Approved'}
             >
               ACCEPT ON BEHALF OF MERCHANT
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
