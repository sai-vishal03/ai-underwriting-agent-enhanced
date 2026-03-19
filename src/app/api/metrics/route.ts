import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/metrics
 * Exposes aggregate platform health metrics for observability dashboards.
 */
export async function GET() {
  try {
    const totalUnderwritten = await prisma.underwritingResult.count();
    
    const approvedCredit = await prisma.underwritingResult.count({
      where: { credit_status: 'Approved' }
    });
    
    const approvedInsurance = await prisma.underwritingResult.count({
      where: { insurance_status: 'Approved' }
    });

    const riskScoreAgg = await prisma.underwritingResult.aggregate({
      _avg: { riskScore: true },
      _min: { riskScore: true },
      _max: { riskScore: true },
    });

    const tierDistribution = {
      tier1: await prisma.underwritingResult.count({ where: { credit_tier: 'Tier 1' } }),
      tier2: await prisma.underwritingResult.count({ where: { credit_tier: 'Tier 2' } }),
      tier3: await prisma.underwritingResult.count({ where: { credit_tier: 'Tier 3' } }),
      rejected: await prisma.underwritingResult.count({ where: { credit_tier: 'Rejected' } }),
    };

    const totalMerchants = await prisma.merchant.count();
    const totalSettled = await prisma.acceptedOffer.count({ where: { status: 'completed' } });
    const totalPending = await prisma.acceptedOffer.count({ where: { status: 'pending' } });

    const acceptanceRate = totalUnderwritten > 0 
      ? Number(((approvedCredit / totalUnderwritten) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        underwriting_count: totalUnderwritten,
        acceptance_rate: acceptanceRate,
        avg_risk_score: riskScoreAgg._avg.riskScore ?? 0,
        min_risk_score: riskScoreAgg._min.riskScore ?? 0,
        max_risk_score: riskScoreAgg._max.riskScore ?? 0,
        tier_distribution: tierDistribution,
        total_merchants: totalMerchants,
        credit_approved: approvedCredit,
        insurance_approved: approvedInsurance,
        settlements_completed: totalSettled,
        settlements_pending: totalPending,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to compute metrics' }, { status: 500 });
  }
}
