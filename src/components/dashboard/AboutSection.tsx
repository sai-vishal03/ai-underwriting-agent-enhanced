'use client';

import React from 'react';
import { 
  Shield, 
  CreditCard, 
  Clock, 
  Activity,
  Info,
  Network
} from 'lucide-react';

export default function AboutSection() {
  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff84]/10 border border-[#00ff84]/20 text-[#00ff84] text-[10px] font-black uppercase tracking-widest">
            Institutional Guide
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">New here? Don't worry.</h1>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed italic">
            Here is everything about the website that you need to know to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-24 h-24 text-white" />
            </div>
            <div className="w-12 h-12 bg-[#00ff84]/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Shield className="w-6 h-6 text-[#00ff84]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight relative z-10">AI Merchant Underwriting</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10">
              GrabOn's AI Core assesses institutional risk in real-time. We analyze over 50 data points per merchant—including GMV momentum, redemption quality, and customer loyalty—to generate pre-approved financial offers with precise Probabilities of Default (PD) and Expected Losses (EL).
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <CreditCard className="w-24 h-24 text-white" />
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight relative z-10">GrabCredit & GrabInsurance</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10">
              Approved merchants receive immediate access to working capital (GrabCredit) and business interruption protection (GrabInsurance). Each offer is backed by a fully explainable rationale referencing their unique platform metrics and industry benchmarks.
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24 text-white" />
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight relative z-10">Risk Tiering System</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10">
              Merchants are categorized into Tier 1 (Elite), Tier 2 (Growth), and Tier 3 (High Risk). This ensures that institutional capital is deployed efficiently. Our continuous monitoring systems observe changes to auto-adjust RAROC expectations.
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-24 h-24 text-white" />
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight relative z-10">Instant Settlement</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10">
              Accepting an offer triggers a mock NACH mandate. Funds reflect in the platform account seamlessly (simulated 1-minute cycle), delivering a realistic portrayal of friction-free institutional financing via integrated neo-banking APIs.
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group md:col-span-2">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Network className="w-32 h-32 text-white" />
            </div>
            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Network className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight relative z-10">Strategic Integration Frameworks</h3>
            <p className="text-zinc-500 leading-relaxed text-sm relative z-10 max-w-2xl">
              This platform bridges the gap between GrabOn's expansive merchant ecosystem and specialized financial partners. Our architecture simulates integrations with <strong>Poonawalla Fincorp</strong> (for credit deployment), <strong>Rakuten</strong> (for data synergy), <strong>PayU</strong> (for settlement execution), and <strong>InMobi</strong> (for dynamic targeting frameworks).
            </p>
          </div>
        </div>

        <div className="bg-[#1a1a1a]/50 border border-dashed border-zinc-800 p-8 rounded-3xl text-center">
          <Info className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
          <h4 className="text-white font-bold mb-2 uppercase tracking-widest text-sm">Getting Started</h4>
          <p className="text-zinc-500 text-xs max-w-lg mx-auto leading-relaxed">
            Navigate to the **Dashboard** to view active partners. Select a merchant to see their deep-dive underwriting analysis and available financial products. Admins can notify partners via the integrated WhatsApp simulator.
          </p>
        </div>
      </div>
    </div>
  );
}
