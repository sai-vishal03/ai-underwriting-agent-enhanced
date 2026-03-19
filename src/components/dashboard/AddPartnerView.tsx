'use client';

import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Briefcase, 
  Phone, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Loader2,
  UploadCloud,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface AddPartnerViewProps {
  onBack: () => void;
  onAdd?: () => void;
}

export default function AddPartnerView({ onBack, onAdd }: AddPartnerViewProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Single Onboarding State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Fashion',
    whatsappNumber: '',
    monthlyGmv: '25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 55',
    customerReturnRate: 65,
    avgOrderValue: 2500,
    seasonalityIndex: 1.2,
    exclusivityRate: 80,
    refundRate: 2.1
  });

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const gmvArray = formData.monthlyGmv.split(',').map(v => parseFloat(v.trim()));
      const payload = {
        name: formData.name,
        category: formData.category,
        whatsappNumber: formData.whatsappNumber,
        monthly_gmv_12m: gmvArray,
        customer_return_rate: formData.customerReturnRate,
        return_and_refund_rate: formData.refundRate,
        avg_order_value: formData.avgOrderValue,
        seasonality_index: formData.seasonalityIndex,
        deal_exclusivity_rate: formData.exclusivityRate
      };

      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([payload])
      });
      
      if (!res.ok) throw new Error('Failed to add merchant');

      toast.success('Merchant added and underwriting calculated successfully!');
      if (onAdd) onAdd();
      onBack();
    } catch (error) {
       toast.error('Failed to add merchant. Please check the logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const res = await fetch('/api/merchants', {
        method: 'POST',
        body: formDataToSend
      });

      if (!res.ok) throw new Error('Failed to upload file');
      
      const data = await res.json();
      toast.success(`Successfully uploaded ${data.count || 'multiple'} merchants!`);
      if (onAdd) onAdd();
      onBack();
    } catch (error) {
      toast.error('Failed to process bulk upload. Invalid format.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#0d0d0d]">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Onboard New Merchant</h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1 italic">Initialize Institutional Underwriting Flow</p>
          </div>
          
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1">
            <button 
              onClick={() => setActiveTab('single')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'single' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Single Entry
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'bulk' ? 'bg-[#00ff84] text-black shadow-md shadow-[#00ff84]/20' : 'text-zinc-500 hover:text-[#00ff84]'}`}
            >
              Bulk Upload
            </button>
          </div>
        </header>

        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
  
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
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
  
               <div className="space-y-8 relative z-10">
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
  
            <div className="flex gap-4 pt-4">
               <button 
                 type="button" 
                 onClick={onBack}
                 className="flex-1 py-5 border border-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-zinc-800/50 hover:text-white transition-all shadow-lg"
               >
                 Cancel Sequence
               </button>
               <button 
                 type="submit" 
                 disabled={loading}
                 className="flex-[2] bg-[#00ff84] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all hover:bg-[#00e676] hover:shadow-[0_0_40px_rgba(0,255,132,0.4)] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
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
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#121212] border border-zinc-800 rounded-[32px] p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
             
             <div className="absolute inset-0 bg-[#00ff84]/5 animate-pulse rounded-[32px] pointer-events-none" />
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff84]/50 to-transparent" />
             
             <div className="bg-zinc-900/80 p-6 rounded-full border border-zinc-800 mb-8 relative z-10">
               <UploadCloud className="w-16 h-16 text-[#00ff84]" />
             </div>
             
             <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 relative z-10">Bulk Onboarding Terminal</h2>
             <p className="text-zinc-500 mb-10 max-w-lg mx-auto italic relative z-10">Upload your merchant datasets in .json or .xlsx format. The AI Core will automatically extract, normalize, and underwrite the entire batch instantly.</p>
             
             <div className="flex gap-4 justify-center mb-10 relative z-10">
                <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800/50 text-xs font-bold text-zinc-400">
                  <FileJson className="w-4 h-4 text-yellow-500" /> .JSON
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800/50 text-xs font-bold text-zinc-400">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> .XLSX / .CSV 
                </div>
             </div>

             <input 
               type="file" 
               accept=".json,.xlsx,.csv" 
               className="hidden" 
               ref={fileInputRef}
               onChange={handleBulkUpload}
             />
             
             <div className="flex gap-4 w-full max-w-md relative z-10">
               <button 
                 onClick={onBack}
                 className="flex-1 py-4 border border-zinc-800 text-zinc-400 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-zinc-800/50 hover:text-white transition-all"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={loading}
                 className="flex-[2] bg-[#00ff84] text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all hover:bg-[#00e676] hover:shadow-[0_0_40px_rgba(0,255,132,0.4)] disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Select File'}
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
