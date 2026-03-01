export type RiskTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Rejected';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  whatsappNumber: string;
  monthlyGmv12m: number[];
  couponRedemptionRate: number;
  uniqueCustomerCount: number;
  customerReturnRate: number;
  avgOrderValue: number;
  seasonalityIndex: number;
  dealExclusivityRate: number;
  returnAndRefundRate: number;
}

export interface CreditOffer {
  limit: number; // in Lakhs
  interestRate: number; // percentage
  tenure: number; // months
  status: 'Approved' | 'Rejected';
  tier: RiskTier;
  rationale: string;
  baseRate: number;
  riskPremium: number;
  volatilityAdj: number;
}

export interface InsuranceOffer {
  coverageAmount: number; // in Lakhs
  premium: number; // in INR
  policyType: string;
  status: 'Approved' | 'Rejected';
  tier: RiskTier;
  rationale: string;
}

export interface UnderwritingResult {
  merchantId: string;
  creditOffer: CreditOffer;
  insuranceOffer: InsuranceOffer;
  riskScore: number; // 0-100
  pd: number; // Probability of Default
  el: number; // Expected Loss
  raroc: number; // Risk Adjusted Return on Capital
  lgd: number; // Loss Given Default
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userRole: 'Admin' | 'User';
  userEmail: string;
  action: string;
  merchantId?: string;
  oldValue?: string;
  newValue?: string;
  ip: string;
  status: 'success' | 'failure';
}

export interface Notification {
  id: string;
  merchantId: string;
  merchantName: string;
  timestamp: string;
  message: string;
  status: 'Sent' | 'Pending';
}

export interface AcceptedOffer {
  id: string;
  merchantName: string;
  type: 'Credit' | 'Insurance' | 'Both';
  timestamp: string;
  status: 'Accepted' | 'Pending Settlement' | 'Settled';
  amount: number;
}
