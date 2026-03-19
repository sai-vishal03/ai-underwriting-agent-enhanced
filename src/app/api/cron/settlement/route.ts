import { NextResponse } from 'next/server';
import { settlementService } from '@/lib/services/settlementService';

/**
 * GET /api/cron/settlement
 * 
 * Background settlement processor — designed to be invoked by an external scheduler
 * (Vercel Cron, AWS EventBridge, CloudWatch, etc.) every 1 minute.
 * 
 * ARCHITECTURE NOTE (Interview talking point):
 * ─────────────────────────────────────────────
 * Current: HTTP-triggered cron endpoint with in-DB row-level locking for idempotency.
 * 
 * Production upgrade path:
 *   1. BullMQ + Redis — dedicated worker process, retry policies, dead-letter queues.
 *   2. AWS SQS/Lambda — event-driven, auto-scaling, zero-infrastructure settlement workers.
 *   3. Temporal.io — for complex multi-step settlement workflows with saga pattern.
 * 
 * The current implementation already guarantees:
 *   ✓ Idempotency (status-based row locking: pending → processing → completed)
 *   ✓ Failure recovery (rollback to pending on error)
 *   ✓ No duplicate disbursements
 */
export async function GET() {
  try {
    const result = await settlementService.processPendingSettlements();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in settlement cron:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
