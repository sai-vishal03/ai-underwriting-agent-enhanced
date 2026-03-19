'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Merchant, UnderwritingResult, SystemLog, Notification, AcceptedOffer } from '../../types';
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
  const queryClient = useQueryClient();

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isWaMinimized, setIsWaMinimized] = useState<boolean>(false);

  // --- Data Fetching ---
  const { data: merchantsData } = useQuery({
    queryKey: ['merchants'],
    queryFn: async () => {
      const res = await fetch('/api/merchants');
      const data = await res.json();
      return (data.merchants || []).map((m: any) => ({
        ...m,
        id: m.merchant_id,
        monthlyGmv12m: JSON.parse(m.monthly_gmv_12m),
        couponRedemptionRate: m.coupon_redemption_rate,
        uniqueCustomerCount: m.unique_customer_count,
        customerReturnRate: m.customer_return_rate,
        avgOrderValue: m.avg_order_value,
        seasonalityIndex: m.seasonality_index,
        dealExclusivityRate: m.deal_exclusivity_rate,
        returnAndRefundRate: m.return_and_refund_rate,
      })) as Merchant[];
    }
  });

  // Re-fetch everything else we need
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      return res.json();
    },
    refetchInterval: 10000 // Poll every 10s to sync with backend settlement processing
  });

  const { data: logsData } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const res = await fetch('/api/logs');
      const data = await res.json();
      return (data.logs || []).map((l: any) => ({
        ...l,
        timestamp: l.timestamp,
      })) as SystemLog[];
    }
  });

  const merchants = merchantsData || [];
  const underwritingResults = merchantsData?.reduce((acc: any, m: any) => {
    if (m.underwriting) {
      acc[m.id] = {
        merchantId: m.id,
        creditOffer: {
          limit: m.underwriting.credit_limit,
          interestRate: m.underwriting.credit_interestRate,
          tenure: m.underwriting.credit_tenure,
          status: m.underwriting.credit_status,
          tier: m.underwriting.credit_tier,
          rationale: m.underwriting.credit_rationale,
          baseRate: m.underwriting.credit_baseRate,
          riskPremium: m.underwriting.credit_riskPremium,
          volatilityAdj: m.underwriting.credit_volatilityAdj,
        },
        insuranceOffer: {
          coverageAmount: m.underwriting.insurance_coverageAmount,
          premium: m.underwriting.insurance_premium,
          policyType: m.underwriting.insurance_policyType,
          status: m.underwriting.insurance_status,
          tier: m.underwriting.insurance_tier,
          rationale: m.underwriting.insurance_rationale,
        },
        riskScore: m.underwriting.riskScore,
        pd: m.underwriting.pd,
        el: m.underwriting.el,
        raroc: m.underwriting.raroc,
        lgd: m.underwriting.lgd
      } as UnderwritingResult;
    }
    return acc;
  }, {}) || {};

  const acceptedOffers = (statsData?.acceptedOffers || []).map((o: any) => ({
    ...o,
    timestamp: o.createdAt,
  })) as AcceptedOffer[];

  // --- Derived Mapped Stats for Header ---
  const pendingSettlement = acceptedOffers.filter(o => o.status === 'Pending Settlement').reduce((sum, o) => sum + o.amount, 0);
  let totalApproved = 0;
  let totalRejected = 0;
  merchants.forEach(m => {
    if (underwritingResults[m.id]) {
      if (underwritingResults[m.id].creditOffer.status === 'Approved' || underwritingResults[m.id].insuranceOffer.status === 'Approved') totalApproved++;
      if (underwritingResults[m.id].creditOffer.status === 'Rejected') totalRejected++;
    }
  });

  const stats = {
    totalDisbursed: statsData?.stats?.totalDisbursedLimit || 2500000,
    alreadyDisbursed: statsData?.stats?.alreadyDisbursed || 0,
    pendingSettlement,
    totalApproved,
    totalRejected
  };

  const notifications = (merchantsData?.reduce((acc: any[], m: any) => {
    if (m.notifications) {
      acc.push(...m.notifications.map((n: any) => ({
        ...n,
        timestamp: n.createdAt
      })));
    }
    return acc;
  }, []) || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as Notification[];

  // --- Mutations ---
  const underwriteMutation = useMutation({
    mutationFn: async (merchantId: string) => {
      await fetch('/api/underwrite', { method: 'POST', body: JSON.stringify({ merchantId }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
  });

  const notifyMutation = useMutation({
    mutationFn: async ({ merchantId, message }: { merchantId: string, message: string }) => {
      await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ merchantId, message }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchants'] })
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async ({ merchantId, type, amount }: { merchantId: string, type: string, amount: number }) => {
      const res = await fetch('/api/accept-offer', { method: 'POST', body: JSON.stringify({ merchantId, type, amount }) });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stats', 'merchants'] })
  });

  const settleOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
        await fetch('/api/accept-offer', { method: 'PUT', body: JSON.stringify({ offerId }) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stats', 'merchants'] })
  });

  // Note: Settlement is now handled securely by a backend cron worker (/api/cron/settlement),
  // which ensures idempotency and runs independently of active frontend sessions.


  const handleSelectMerchant = (m: Merchant) => {
    setSelectedMerchant(m);
    if (!revealedIds.has(m.id)) {
      setRevealedIds(prev => new Set(prev).add(m.id));
      if (!underwritingResults[m.id]) {
        underwriteMutation.mutate(m.id);
      }
    }
  };

  const handleNotify = (merchant: Merchant, type: 'Credit' | 'Insurance') => {
    if (!isAdmin) {
      toast.error('This action is restricted to Admin users.');
      return;
    }

    const result = underwritingResults[merchant.id];
    const offer = type === 'Credit' ? result.creditOffer : result.insuranceOffer;
    const message = `Hi ${merchant.name}, GrabOn is pleased to offer you ${type === 'Credit' ? `a credit limit of ₹${offer.limit}L` : `insurance coverage of ₹${(offer as any).coverageAmount}L`}. Tier: ${offer.tier}. Rationale: ${offer.rationale}. Click [Details] to view more or [Accept Offer] to proceed.`;

    toast.promise(notifyMutation.mutateAsync({ merchantId: merchant.id, message }), {
        loading: 'Sending notification...',
        success: `WhatsApp Notification sent to ${merchant.name}`,
        error: 'Failed to send notification'
    });
  };

  const handleAcceptOffer = (merchant: Merchant, type: 'Credit' | 'Insurance' | 'Both') => {
    const result = underwritingResults[merchant.id];
    let amount = 0;
    if (type === 'Credit' || type === 'Both') amount += result.creditOffer.limit * 100000;
    if (type === 'Insurance' || type === 'Both') amount += result.insuranceOffer.premium;

    toast.promise(acceptOfferMutation.mutateAsync({ merchantId: merchant.id, type, amount }), {
        loading: 'Accepting offer...',
        success: 'Offer accepted! Settlement reflecting in 1 minute.',
        error: 'Failed to accept offer'
    });
  };

  const handleAddMerchant = () => {
    // Rely on child component's API calls and invalidation
    queryClient.invalidateQueries({ queryKey: ['merchants'] });
    onViewChange?.('dashboard');
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
                          <span className="text-white font-black">₹{o.amount.toLocaleString('en-IN')}</span>
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
              <>
                {!isWaMinimized && (
                  <div className="w-1/4 flex flex-col min-h-0 animate-in slide-in-from-right-8 duration-300 relative">
                    <WhatsAppWindow 
                      notifications={notifications}
                      selectedMerchant={selectedMerchant}
                      onMinimize={() => setIsWaMinimized(true)}
                    />
                  </div>
                )}
                {isWaMinimized && (
                  <div 
                    onClick={() => setIsWaMinimized(false)}
                    className="fixed bottom-0 right-10 w-[300px] h-14 bg-[#202c33] border-t border-x border-[#3b4a54] rounded-t-xl flex justify-between items-center px-4 cursor-pointer shadow-2xl z-50 hover:bg-[#2a3942] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00ff84] flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-xs">WhatsApp API</span>
                        <span className="text-[#00ff84] text-[9px] font-bold">ONLINE</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-400 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                )}
              </>
            )}
          </main>
        );
      case 'add-partner':
        return isAdmin ? <AddPartnerView onAdd={handleAddMerchant} onBack={() => onViewChange?.('dashboard')} /> : <AboutSection />;
      case 'logs':
        return isAdmin ? <LogsView logs={logsData || []} onBack={() => onViewChange?.('dashboard')} /> : <AboutSection />;
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
