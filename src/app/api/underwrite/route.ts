import { NextRequest, NextResponse } from 'next/server';
import { underwritingService } from '@/lib/services/underwritingService';
import { logger } from '@/lib/logger';
import { underwriteSchema, formatZodError } from '@/lib/validators';
import { auditService } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = underwriteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { merchantId } = parsed.data;
    const result = await underwritingService.processUnderwriting(merchantId);

    // ── Audit Trail ───────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await auditService.record({
      action: 'UNDERWRITE_RUN',
      entity_type: 'Merchant',
      entity_id: merchantId,
      payload: { tier: result.creditOffer.tier, riskScore: result.riskScore },
      ip_address: ip,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    logger.error('Underwrite API error', {}, error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
