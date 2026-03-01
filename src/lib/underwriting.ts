import { Merchant, UnderwritingResult, RiskTier, CreditOffer, InsuranceOffer } from '../types';

export const calculateCV = (data: number[]) => {
  if (data.length === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  if (mean === 0) return 1;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  return Math.sqrt(variance) / mean;
};

export const calculateGmvGrowth = (data: number[]) => {
  if (data.length < 2) return 0;
  const last6Months = data.slice(-6).reduce((a, b) => a + b, 0);
  const prev6Months = data.slice(-12, -6).reduce((a, b) => a + b, 0);
  if (prev6Months === 0) return last6Months > 0 ? 100 : 0;
  return ((last6Months - prev6Months) / prev6Months) * 100;
};

export const checkThreeMonthDecline = (data: number[]) => {
  if (data.length < 4) return false;
  const last4 = data.slice(-4);
  return last4[3] < last4[2] && last4[2] < last4[1] && last4[1] < last4[0];
};

export const performUnderwriting = (merchant: Merchant): UnderwritingResult => {
  const gmvGrowth = calculateGmvGrowth(merchant.monthlyGmv12m);
  const cv = calculateCV(merchant.monthlyGmv12m);
  const isDeclining = checkThreeMonthDecline(merchant.monthlyGmv12m);

  // Deterministic Risk Tiering
  let tier: RiskTier = 'Tier 2';
  let isRejected = false;
  let rejectionReason = '';

  if (isDeclining || merchant.returnAndRefundRate > 10 || (merchant.customerReturnRate < 20 && merchant.monthlyGmv12m[11] < 1)) {
    tier = 'Rejected';
    isRejected = true;
    if (isDeclining) rejectionReason = '3 consecutive months of declining GMV indicating potential business collapse.';
    else if (merchant.returnAndRefundRate > 10) rejectionReason = `Extremely high refund rate of ${merchant.returnAndRefundRate}% exceeds the maximum tolerance threshold.`;
    else rejectionReason = 'Critically low customer retention and negligible recent GMV.';
  } else if (gmvGrowth > 0 && merchant.customerReturnRate > 60 && merchant.returnAndRefundRate < 3 && merchant.seasonalityIndex < 1.8) {
    tier = 'Tier 1';
  } else if (gmvGrowth < -5 || merchant.returnAndRefundRate > 6 || merchant.customerReturnRate < 40 || merchant.seasonalityIndex > 2.5) {
    tier = 'Tier 3';
  }

  // Risk Score Calculation (0-100)
  // Higher is better
  let riskScore = 0;
  riskScore += Math.min(30, (merchant.customerReturnRate / 100) * 30);
  riskScore += Math.max(0, 30 - (merchant.returnAndRefundRate * 3));
  riskScore += Math.min(20, (Math.max(0, gmvGrowth + 20) / 40) * 20);
  riskScore += Math.max(0, 20 - (cv * 20));
  riskScore = Math.min(100, Math.max(0, riskScore));

  // PD Simulation
  const basePd = 1 / (1 + Math.exp(0.1 * (riskScore - 60)));
  let pd = basePd;
  if (merchant.returnAndRefundRate > 8) pd *= 1.2;
  if (cv > 0.5) pd *= 1.3;
  pd = Math.min(0.6, pd);

  // Credit Offer
  const avgGmv = merchant.monthlyGmv12m.reduce((a, b) => a + b, 0) / 12;
  const baseLimit = avgGmv * 1.5; // Lakhs
  const limit = isRejected ? 0 : Number((baseLimit * (riskScore / 100)).toFixed(1));

  const baseRate = 15;
  const riskPremium = 0.08 * (100 - riskScore);
  const volatilityAdj = cv > 0.6 ? 1 : cv > 0.4 ? 0.5 : 0;
  const interestRate = isRejected ? 0 : Math.min(24, baseRate + riskPremium + volatilityAdj);
  const tenure = riskScore > 80 ? 24 : riskScore > 50 ? 12 : 6;

  const creditRationale = isRejected ? rejectionReason : `We are offering ₹${limit}L at ${tier} rates because your GMV has grown ${gmvGrowth.toFixed(1)}% YoY. Your customer return rate of ${merchant.customerReturnRate}% indicates strong demand stability. Additionally, your refund rate of ${merchant.returnAndRefundRate}% is within acceptable limits, reducing operational risk.`;

  const creditOffer: CreditOffer = {
    limit,
    interestRate: Number(interestRate.toFixed(1)),
    tenure,
    status: isRejected ? 'Rejected' : 'Approved',
    tier,
    rationale: creditRationale,
    baseRate,
    riskPremium: Number(riskPremium.toFixed(1)),
    volatilityAdj
  };

  // Insurance Offer
  const coverageAmount = isRejected ? 0 : Number((avgGmv * 5).toFixed(1));
  const premium = isRejected ? 0 : Math.round((coverageAmount * 1000) * (1.5 - riskScore / 100));
  const insuranceRationale = isRejected ? rejectionReason : `Based on your ${tier} risk profile and ${merchant.category} category, we provide business interruption coverage of ₹${coverageAmount}L. Your low refund rate of ${merchant.returnAndRefundRate}% qualifies you for a preferred premium rate.`;

  const insuranceOffer: InsuranceOffer = {
    coverageAmount,
    premium,
    policyType: 'Business Interruption',
    status: isRejected ? 'Rejected' : 'Approved',
    tier,
    rationale: insuranceRationale
  };

  // LGD Logic
  let lgd = 0.6; // Base LGD
  if (merchant.customerReturnRate > 70) lgd = 0.5;
  if (tier === 'Tier 3') lgd = 0.7;

  // Expected Loss (EL)
  const ead = limit; // Exposure at Default
  const el = pd * lgd * ead;

  // RAROC
  const interestIncome = ead * (interestRate / 100);
  const netReturn = interestIncome - el;
  const economicCapital = 0.2 * ead;
  const raroc = economicCapital > 0 ? (netReturn / economicCapital) * 100 : 0;

  return {
    merchantId: merchant.id,
    creditOffer,
    insuranceOffer,
    riskScore: Math.round(riskScore),
    pd: Number(pd.toFixed(3)),
    el: Number(el.toFixed(2)),
    raroc: Number(raroc.toFixed(1)),
    lgd
  };
};
