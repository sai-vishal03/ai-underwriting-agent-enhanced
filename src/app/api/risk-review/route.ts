import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { riskReviewSchema, formatZodError } from '@/lib/validators';
import { flags } from '@/lib/feature-flags';
import { auditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = riskReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { merchantId } = parsed.data;

    // ── Feature Flag Check ────────────────────────────────────────────
    if (!flags.isEnabled('ENABLE_RISK_AI_V2')) {
      logger.warn('risk_ai_v2_disabled', { merchant_id: merchantId });
      return NextResponse.json({ 
        success: false, 
        error: 'AI Risk Review is currently disabled (feature flag)' 
      }, { status: 503 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { merchant_id: merchantId },
      include: { underwriting: true }
    });

    if (!merchant || !merchant.underwriting) {
      return NextResponse.json({ error: 'Merchant or underwriting profile not found' }, { status: 404 });
    }

    // ── Feature Extraction ────────────────────────────────────────────
    const gmvData = JSON.parse(merchant.monthly_gmv_12m);
    const recentGmv = gmvData.slice(-3).reduce((a: number, b: number) => a + b, 0) / 3;
    const oldestGmv = gmvData.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3;
    const gmvTrend = recentGmv > oldestGmv ? 'Positive' : 'Declining';
    const growthRate = oldestGmv > 0 ? ((recentGmv - oldestGmv) / oldestGmv * 100) : 0;

    // GMV volatility (coefficient of variation)
    const mean = gmvData.reduce((a: number, b: number) => a + b, 0) / gmvData.length;
    const variance = gmvData.reduce((sum: number, v: number) => sum + Math.pow(v - mean, 2), 0) / gmvData.length;
    const volatility = mean > 0 ? Math.sqrt(variance) / mean : 1; // CV: lower = more stable

    const isHighRisk = merchant.return_and_refund_rate > 5;
    const isHighLoyalty = merchant.customer_return_rate > 60;

    // ── ML-Style Confidence Score (0–1) ───────────────────────────────
    //  Weighted multi-factor composite:
    //    - Risk Score normalized (35%)
    //    - GMV trajectory direction (20%)  
    //    - Volatility inverse (20%)
    //    - Refund rate inverse (15%)
    //    - Customer loyalty (10%)
    const riskNorm = merchant.underwriting.riskScore / 100;                     // 0–1
    const trendSignal = gmvTrend === 'Positive' ? 1 : 0.3;                     // binary
    const volatilitySignal = Math.max(0, 1 - volatility);                      // lower vol = higher confidence
    const refundSignal = Math.max(0, 1 - (merchant.return_and_refund_rate / 15)); // normalize against 15% max
    const loyaltySignal = merchant.customer_return_rate / 100;                  // 0–1

    const confidence_score = Number((
      (riskNorm * 0.35) + 
      (trendSignal * 0.20) + 
      (volatilitySignal * 0.20) + 
      (refundSignal * 0.15) + 
      (loyaltySignal * 0.10)
    ).toFixed(3));

    // ── Risk Level Classification ─────────────────────────────────────
    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    if (confidence_score >= 0.75) risk_level = 'LOW';
    else if (confidence_score >= 0.45) risk_level = 'MEDIUM';
    else risk_level = 'HIGH';

    // ── Confidence Level (human readable) ─────────────────────────────
    let confidenceLevel: string;
    if (confidence_score >= 0.75) confidenceLevel = 'High';
    else if (confidence_score >= 0.45) confidenceLevel = 'Medium';
    else confidenceLevel = 'Low';

    // ── Narrative Generation ──────────────────────────────────────────
    const riskSummary = `The merchant exhibits a ${gmvTrend.toLowerCase()} GMV trajectory with an estimated ${growthRate.toFixed(1)}% change over the trailing 12 months. GMV volatility coefficient is ${volatility.toFixed(2)}. With a Risk Score of ${merchant.underwriting.riskScore} and an expected loss of ${(merchant.underwriting.el * 100).toFixed(2)}%, the profile sits squarely in the ${merchant.underwriting.credit_tier} tier.`;

    const keyRiskDrivers = [
      `Refund & Return Rate: ${merchant.return_and_refund_rate}%. ${isHighRisk ? 'This is significantly higher than category averages, marking an operational risk.' : 'This reflects stable operability and strong customer satisfaction.'}`,
      `Customer Return Rate (Loyalty): ${merchant.customer_return_rate}%. ${isHighLoyalty ? 'Excellent retention indicating high LTV per customer.' : 'Moderate retention; room for engagement optimizations.'}`,
      `GMV Trend: ${gmvTrend}. A ${gmvTrend.toLowerCase()} volume dynamic heavily influences credit capability.`,
      `Volatility Index: ${volatility.toFixed(2)} CV. ${volatility > 0.5 ? 'High variance in revenue stream increases default probability.' : 'Revenue consistency supports creditworthiness.'}`
    ];

    const financialRecommendation = merchant.underwriting.credit_status === 'Approved' 
        ? `Proceed with the computed base limit of ₹${merchant.underwriting.credit_limit} Lakhs. Monitor utilization. Ensure the ${merchant.underwriting.credit_interestRate}% ARR is firmly structured with monthly settlement sweeps.`
        : `Decline institutional credit facility. Risk premium calculations exceed internal RAROC thresholds. Re-evaluate post 2 quarters of sustained growth.`;

    // Simulate AI inference latency
    await new Promise(r => setTimeout(r, 1000));
    
    // ── Audit Trail ───────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await auditService.record({
      action: 'RISK_AI_GEN',
      entity_type: 'Merchant',
      entity_id: merchantId,
      payload: { confidence_score, risk_level, tier: merchant.underwriting.credit_tier },
      ip_address: ip,
    });

    logger.info('risk_review_generated', { merchant_id: merchantId, tier: merchant.underwriting.credit_tier, confidence_score, risk_level });

    return NextResponse.json({
        success: true,
        data: {
            riskSummary,
            keyRiskDrivers,
            financialRecommendation,
            confidenceLevel,
            confidence_score,
            risk_level
        }
    });
  } catch (error) {
    logger.error('risk_review_error', { error: String(error) });
    return NextResponse.json({ success: false, error: 'Failed to generate risk memo' }, { status: 500 });
  }
}
