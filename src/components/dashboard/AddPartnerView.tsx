'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Save, 
  Trash2, 
  UserPlus, 
  Briefcase, 
  Phone, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { Merchant } from '../../types';

interface AddPartnerViewProps {
  onBack: () => void;
  onAdd: (merchant: Merchant) => void;
}

export default function AddPartnerView({ onBack, onAdd }: AddPartnerViewProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fashion',
    whatsappNumber: '',
    monthlyGmv: '25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55',
    couponRate: 15,
    customerReturnRate: 65,
    avgOrderValue: 2500,
    seasonalityIndex: 1.2,
    exclusivityRate: 80,
    refundRate: 2.1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const gmvArray = formData.monthlyGmv.split(',').map(v => parseFloat(v.trim()));
      const newMerchant: Merchant = {
        id: 'M-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: formData.name,
        category: formData.category,
        whatsappNumber: formData.whatsappNumber,
        monthlyGmv12m: gmvArray,
        customerReturnRate: formData.customerReturnRate,
        returnAndRefundRate: formData.refundRate,
        avgOrderValue: formData.avgOrderValue,
        seasonalityIndex: formData.seasonalityIndex,
        dealExclusivityRate: formData.exclusivityRate
      };

      onAdd(newMerchant);
      toast.success('Merchant added and underwriting calculated successfully!');
      onBack();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tighter">Onboard New Partner</h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1 italic italic">Initialize Institutional Underwriting Flow</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Block */}
          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl shadow-black/50">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <UserPlus className="w-24 h-24 text-white" />
             </div>
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-lg uppercase tracking-tight">Merchant Identity</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Legal Entity Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Skyline Travel Group"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Industry Vertical</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium appearance-none"
                  >
                    <option>Fashion</option>
                    <option>Electronics</option>
                    <option>Travel</option>
                    <option>Food</option>
                    <option>Home</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">WhatsApp Business Endpoint</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text" 
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                      placeholder="+91 XXXXXXXXXX"
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium placeholder:text-zinc-700"
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Performance Block */}
          <div className="bg-[#121212] border border-zinc-800 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl shadow-black/50">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp className="w-24 h-24 text-white" />
             </div>
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg uppercase tracking-tight">Performance Vector</h3>
             </div>

             <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">12-Month GMV Historical Sequence (Lakhs)</label>
                    <span className="text-[9px] text-[#00ff84] font-bold uppercase tracking-widest bg-[#00ff84]/5 px-2 py-0.5 rounded-full border border-[#00ff84]/10">Auto-calculated</span>
                  </div>
                  <textarea 
                    required
                    rows={2}
                    value={formData.monthlyGmv}
                    onChange={(e) => setFormData({...formData, monthlyGmv: e.target.value})}
                    placeholder="25, 28, 30, ..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-mono text-sm placeholder:text-zinc-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Customer Retention (%)</label>
                    <input 
                      type="number" 
                      value={formData.customerReturnRate}
                      onChange={(e) => setFormData({...formData, customerReturnRate: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Refund Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.refundRate}
                      onChange={(e) => setFormData({...formData, refundRate: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Avg Order Value (₹)</label>
                    <input 
                      type="number" 
                      value={formData.avgOrderValue}
                      onChange={(e) => setFormData({...formData, avgOrderValue: Number(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-[#00ff84]/50 transition-all font-medium"
                    />
                  </div>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <button 
               type="button" 
               onClick={onBack}
               className="flex-1 py-5 border border-zinc-800 text-zinc-500 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-zinc-800/50 hover:text-white transition-all"
             >
               Cancel Sequence
             </button>
             <button 
               type="submit" 
               disabled={loading}
               className="flex-[2] bg-[#00ff84] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all hover:bg-[#00e676] hover:shadow-[0_0_30px_rgba(0,255,132,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
             >
               {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                  <ShieldCheck className="w-5 h-5" />
                  Deploy Institutional Underwriting
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
