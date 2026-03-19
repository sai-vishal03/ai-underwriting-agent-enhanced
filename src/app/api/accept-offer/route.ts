import { NextRequest, NextResponse } from 'next/server';
import { settlementService } from '@/lib/services/settlementService';
import { logger } from '@/lib/logger';
import { acceptOfferSchema, formatZodError } from '@/lib/validators';
import { auditService } from '@/lib/services/auditService';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = acceptOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { merchantId, type, amount } = parsed.data;

    // ── Idempotency Key Check ─────────────────────────────────────────
    const idempotencyKey = req.headers.get('idempotency-key');

    if (idempotencyKey) {
      const existing = await prisma.acceptedOffer.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        logger.info('idempotent_duplicate_detected', { idempotency_key: idempotencyKey, existing_offer_id: existing.id });
        return NextResponse.json({
          success: true,
          offerId: existing.id,
          idempotent: true,
          message: 'Duplicate request — returning existing offer.',
        });
      }
    }

    // ── Accept Offer ──────────────────────────────────────────────────
    const offer = await settlementService.acceptOffer(merchantId, type, amount, idempotencyKey ?? undefined);

    // ── Audit Trail ───────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await auditService.record({
      action: 'OFFER_ACCEPTED',
      actorRole: req.headers.get('x-user-role') ?? 'Admin',
      actorId: req.headers.get('x-user-id') ?? undefined,
      merchantId,
      entityId: offer.id,
      payload: { type, amount, idempotencyKey },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, offerId: offer.id });
  } catch (error: any) {
    logger.error('Accept offer API error', {}, error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
