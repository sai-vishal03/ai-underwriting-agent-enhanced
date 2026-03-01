'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  Clock, 
  Database,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemLog } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface LogsViewProps {
  logs: SystemLog[];
  onBack?: () => void;
}

export default function LogsView({ logs, onBack }: LogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.merchantId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('Accepted')) return 'text-[#00ff84] bg-[#00ff84]/10 border-[#00ff84]/20';
    if (action.includes('Rejected')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (action.includes('Override')) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

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
              <h1 className="text-4xl font-black text-white tracking-tighter">System Audit Logs</h1>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-1 italic">Enterprise Governance & Compliance</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all hover:border-zinc-700">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff84] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#00e676] transition-all shadow-lg shadow-[#00ff84]/20">
              <ShieldAlert className="w-4 h-4" />
              Security Report
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#00ff84] transition-colors" />
             <input 
               type="text" 
               placeholder="Search logs by action, ID, or email..."
               className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff84]/50 transition-all placeholder:text-zinc-700 font-medium"
             />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="px-6 py-5 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Event Timestamp</th>
                <th className="px-6 py-5 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Identity</th>
                <th className="px-6 py-5 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Action</th>
                <th className="px-6 py-5 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Endpoint</th>
                <th className="px-6 py-5 text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <div>
                        <div className="text-white font-bold text-xs tracking-tight tabular-nums">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-black text-[10px] border border-zinc-700">
                        {log.userRole[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">{log.userEmail}</div>
                        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{log.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      getActionColor(log.action)
                    )}>
                      {log.action}
                    </div>
                    {log.merchantId && (
                      <div className="mt-1 text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-1">
                        Ref: {log.merchantId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-zinc-400 text-xs font-bold tabular-nums tracking-tight">{log.ip}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#00ff84] shadow-[0_0_8px_#00ff84]" />
                       <span className="text-[#00ff84] text-[10px] font-black uppercase tracking-[0.2em]">{log.status}</span>
                     </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          <div>Showing 5 events of 1,248 total</div>
          <div className="flex items-center gap-4">
             <button className="p-2 hover:text-white transition-colors disabled:opacity-20" disabled>
               <ChevronLeft className="w-4 h-4" />
             </button>
             <span className="text-white bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700">01</span>
             <button className="p-2 hover:text-white transition-colors">
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
