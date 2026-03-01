'use client';

import React, { useState, useEffect } from 'react';
import { Merchant, UnderwritingResult, SystemLog, Notification, AcceptedOffer } from '../../types';
import { mockMerchants } from '../../data/merchants';
import { performUnderwriting } from '../../lib/underwriting';
import { formatCurrency } from '../../lib/utils';
import MerchantList from './MerchantList';
import MerchantDetail from './MerchantDetail';
import WhatsAppWindow from './WhatsAppWindow';
import AboutSection from './AboutSection';
import AddPartnerView from './AddPartnerView';
import LogsView from './LogsView';
import WhatsAppOutboxView from './WhatsAppOutboxView';
import Header from '../layout/Header';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

interface DashboardProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function Dashboard({ activeView = 'dashboard', onViewChange }: DashboardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_merchants');
      return saved ? JSON.parse(saved) : mockMerchants;
    }
    return mockMerchants;
  });
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_revealed_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [underwritingResults, setUnderwritingResults] = useState<Record<string, UnderwritingResult>>({});
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_notifications');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [acceptedOffers, setAcceptedOffers] = useState<AcceptedOffer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_accepted_offers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_logs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grabon_stats');
      return saved ? JSON.parse(saved) : {
        totalDisbursed: 12500000,
        pendingSettlement: 0,
        totalApproved: 0,
        totalRejected: 0
      };
    }
    return {
      totalDisbursed: 12500000,
      pendingSettlement: 0,
      totalApproved: 0,
      totalRejected: 0
    };
  });

  // Calculate underwriting results for all merchants
  useEffect(() => {
    const results: Record<string, UnderwritingResult> = {};
    merchants.forEach(m => {
      results[m.id] = performUnderwriting(m);
    });
    setUnderwritingResults(results);
  }, [merchants]);

  // Persist all critical state
  useEffect(() => {
    localStorage.setItem('grabon_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('grabon_merchants', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('grabon_revealed_ids', JSON.stringify(Array.from(revealedIds)));
  }, [revealedIds]);

  useEffect(() => {
    localStorage.setItem('grabon_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('grabon_accepted_offers', JSON.stringify(acceptedOffers));
  }, [acceptedOffers]);

  useEffect(() => {
    localStorage.setItem('grabon_logs', JSON.stringify(logs));
  }, [logs]);

  // Settlement Completion & Sync Recovery
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now = new Date();
    let statsChanged = false;
    let newStats = { ...stats };
    
    const updatedOffers = acceptedOffers.map(offer => {
      if (offer.status === 'Pending Settlement') {
        const offerDate = new Date(offer.timestamp);
        // If more than 15 seconds have passed (simulation), settle it
        if (now.getTime() - offerDate.getTime() > 15000) {
          newStats.pendingSettlement = Math.max(0, newStats.pendingSettlement - offer.amount);
          newStats.totalDisbursed += offer.amount;
          statsChanged = true;
          return { ...offer, status: 'Settled' as const };
        }
      }
      return offer;
    });

    if (statsChanged) {
      setAcceptedOffers(updatedOffers);
      setStats(newStats);
      addLog('Institutional Settlement Sync Completed');
    }
  }, []);

  const handleSelectMerchant = (m: Merchant) => {
    setSelectedMerchant(m);
    if (!revealedIds.has(m.id)) {
      const newRevealed = new Set(revealedIds);
      newRevealed.add(m.id);
      setRevealedIds(newRevealed);

      // Update stats based on revealed merchants
      const res = underwritingResults[m.id] || performUnderwriting(m);
      if (res) {
        setStats(prev => ({
          ...prev,
          totalApproved: prev.totalApproved + (res.creditOffer.status === 'Approved' ? 1 : 0),
          totalRejected: prev.totalRejected + (res.creditOffer.status === 'Rejected' ? 1 : 0)
        }));
      }
    }
  };

  const addLog = (action: string, merchantId?: string, oldValue?: string, newValue?: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userRole: user?.role || 'User',
      userEmail: user?.email || 'Unknown',
      action,
      merchantId,
      oldValue,
      newValue,
      ip: '127.0.0.1',
      status: 'success'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleNotify = (merchant: Merchant, type: 'Credit' | 'Insurance') => {
    if (!isAdmin) {
      toast.error('This action is restricted to Admin users.');
      return;
    }

    const result = underwritingResults[merchant.id];
    const offer = type === 'Credit' ? result.creditOffer : result.insuranceOffer;
    
    // Add detail/accept button to message as requested
    const message = `Hi ${merchant.name}, GrabOn is pleased to offer you ${type === 'Credit' ? `a credit limit of ₹${offer.limit}L` : `insurance coverage of ₹${(offer as any).coverageAmount}L`}. Tier: ${offer.tier}. Rationale: ${offer.rationale}. Click [Details] to view more or [Accept Offer] to proceed.`;

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      merchantId: merchant.id,
      merchantName: merchant.name,
      timestamp: new Date().toISOString(),
      message,
      status: 'Sent'
    };

    setNotifications(prev => [newNotification, ...prev]);
    addLog(`Notification sent (${type})`, merchant.id);
    toast.success(`WhatsApp Notification sent to ${merchant.name}`);
  };

  const handleAcceptOffer = (merchant: Merchant, type: 'Credit' | 'Insurance' | 'Both') => {
    const result = underwritingResults[merchant.id];
    let amount = 0;
    if (type === 'Credit' || type === 'Both') amount += result.creditOffer.limit * 100000;
    if (type === 'Insurance' || type === 'Both') amount += result.insuranceOffer.premium;

    const newOffer: AcceptedOffer = {
      id: Math.random().toString(36).substr(2, 9),
      merchantName: merchant.name,
      type,
      timestamp: new Date().toISOString(),
      status: 'Pending Settlement',
      amount
    };

    setAcceptedOffers(prev => [newOffer, ...prev]);
    setStats(prev => ({
      ...prev,
      pendingSettlement: prev.pendingSettlement + amount
    }));

    addLog(`Offer accepted (${type})`, merchant.id);
    toast.success('Offer accepted! Settlement reflecting in 24 hrs.');

    // 24 Hour Simulation (fast-forwarded)
    setTimeout(() => {
      setAcceptedOffers(prev => prev.map(o => o.id === newOffer.id ? { ...o, status: 'Settled' } : o));
      setStats(prev => ({
        ...prev,
        pendingSettlement: prev.pendingSettlement - amount,
        totalDisbursed: prev.totalDisbursed + amount
      }));
    addLog(`Settlement updated`, merchant.id);
    toast.info(`Settlement for ${merchant.name} completed!`);
  }, 15000); // 15 seconds simulation for 24 hours
};

const handleAddMerchant = (newMerchant: Merchant) => {
  setMerchants(prev => [newMerchant, ...prev]);
  addLog('New merchant onboarded', newMerchant.id);
};

const renderContent = () => {
  switch (activeView) {
    case 'about':
      return <AboutSection />;
    case 'dashboard':
      return (
        <main className="flex-1 flex gap-8 px-10 pb-10 pt-6 overflow-hidden min-h-0">
          {/* Left: Merchant List */}
            <div className="w-1/4 flex flex-col gap-8 min-h-0 h-full">
              <div className="flex-1 min-h-0 flex flex-col">
                <MerchantList 
                  merchants={merchants}
                  selectedId={selectedMerchant?.id}
                  onSelect={handleSelectMerchant}
                  results={underwritingResults}
                  notifications={notifications}
                  revealedIds={revealedIds}
                />
              </div>

            {/* Accepted Offers Box */}
            <div className="bg-[#121212] border border-zinc-800 rounded-3xl flex flex-col overflow-hidden h-1/3 shrink-0 shadow-2xl shadow-black/50">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-white font-semibold text-sm">Accepted Offers</h3>
                <span className="text-[10px] text-[#00ff84] bg-[#00ff84]/10 px-2 py-0.5 rounded-full font-bold">LIVE</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {acceptedOffers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                    <p className="text-[10px] uppercase tracking-widest font-bold">No active mandates</p>
                  </div>
                ) : (
                  acceptedOffers.map(o => (
                    <div key={o.id} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-white text-[11px] truncate w-1/2">{o.merchantName}</div>
                        <div className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${o.status === 'Settled' ? 'bg-[#00ff84]/10 text-[#00ff84]' : 'bg-amber-400/10 text-amber-400 animate-pulse'}`}>
                          {o.status === 'Settled' ? 'SETTLED' : 'REFLECTING'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-zinc-500">
                        <span>{o.type}</span>
                        <span className="text-white font-black">{formatCurrency(o.amount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle: Merchant Detail View */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {selectedMerchant && (
              <MerchantDetail 
                merchant={selectedMerchant}
                result={underwritingResults[selectedMerchant.id]}
                onNotify={handleNotify}
                onAccept={handleAcceptOffer}
                notifications={notifications.filter(n => n.merchantId === selectedMerchant.id)}
              />
            )}
          </div>

          {/* Right: WhatsApp Simulation (Admin Only) */}
          {isAdmin && (
            <div className="w-1/4 flex flex-col min-h-0">
              <WhatsAppWindow 
                notifications={notifications}
                selectedMerchant={selectedMerchant}
              />
            </div>
          )}
        </main>
      );
    case 'add-partner':
      return isAdmin ? <AddPartnerView onAdd={handleAddMerchant} onBack={() => onViewChange?.('dashboard')} /> : <AboutSection />;
    case 'logs':

        return isAdmin ? <LogsView logs={logs} onBack={() => onViewChange?.('dashboard')} /> : <AboutSection />;
      case 'whatsapp-outbox':
        return isAdmin ? <WhatsAppOutboxView notifications={notifications} onBack={() => onViewChange?.('dashboard')} /> : <AboutSection />;
      default:
        return <div className="p-8 text-zinc-500 italic">This section ({activeView}) is under development.</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      <Header stats={stats} />
      {renderContent()}
    </div>
  );
}

