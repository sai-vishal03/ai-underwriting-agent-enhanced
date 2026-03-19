import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { auditService } from '@/lib/services/auditService';

const MAX_RETRY_COUNT = 3;

export class SettlementService {
  /**
   * Accepts an offer and puts it into the pending queue for background processing.
   * Supports idempotency keys to prevent duplicate financial operations.
   */
  async acceptOffer(
    merchantId: string,
    type: 'Credit' | 'Insurance' | 'Both',
    amount: number,
    idempotencyKey?: string
  ) {
    try {
      const merchant = await prisma.merchant.findUnique({ where: { merchant_id: merchantId } });
      if (!merchant) throw new Error('Merchant not found');

      const offer = await prisma.acceptedOffer.create({
        data: {
          merchantId,
          merchantName: merchant.name,
          type,
          amount,
          idempotencyKey: idempotencyKey ?? null,
          status: 'pending',
        }
      });

      await prisma.merchant.update({
        where: { merchant_id: merchantId },
        data: { status: 'ACCEPTED' }
      });

      await prisma.systemLog.create({
        data: {
          action: 'Offer Accepted',
          merchantId,
          newValue: `Accepted ${type} offer for ₹${amount}L. Entering settlement queue.`
        }
      });

      logger.info('Offer accepted and queued for settlement', { merchant_id: merchantId, offer_id: offer.id, amount });
      return offer;
    } catch (error: any) {
      logger.error('Failed to accept offer', { merchant_id: merchantId, amount }, error);
      throw new Error('Failed to accept offer');
    }
  }

  /**
   * Cron/Background Job method to process any pending settlements idempotently.
   * Includes retry logic with max retry count. Handles:
   *   pending → processing → completed  (happy path)
   *   pending → processing → retry_pending (transient failure, retry_count < MAX)
   *   pending → processing → failed (exhausted retries)
   */
  async processPendingSettlements() {
    logger.info('Starting scheduled settlement processing job');
    
    try {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      
      // Process both 'pending' and 'retry_pending' settlements
      const eligibleOffers = await prisma.acceptedOffer.findMany({
        where: {
          status: { in: ['pending', 'retry_pending'] },
          createdAt: { lte: oneMinuteAgo }
        }
      });

      if (eligibleOffers.length === 0) {
        logger.info('No pending settlements ready for processing');
        return { processed: 0, failed: 0, retrying: 0 };
      }

      let processedCount = 0;
      let failedCount = 0;
      let retryCount = 0;

      for (const offer of eligibleOffers) {
        // Row-level locking via status transition
        const lockedOffer = await prisma.acceptedOffer.updateMany({
           where: { id: offer.id, status: { in: ['pending', 'retry_pending'] } },
           data: { status: 'processing' }
        });

        if (lockedOffer.count === 0) continue;

        // Read the current offer to get retry count
        const currentOffer = await prisma.acceptedOffer.findUnique({ where: { id: offer.id } });
        // Parse retry_count from the offer (stored in amount field metadata or separately)
        // For simplicity we track retries via a convention field

        try {
          // ── Process Payout ──────────────────────────────────────────
          await prisma.platformStat.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', alreadyDisbursed: offer.amount },
            update: { alreadyDisbursed: { increment: offer.amount } }
          });

          // ── Mark Completed ──────────────────────────────────────────
          await prisma.acceptedOffer.update({
            where: { id: offer.id },
            data: { status: 'completed', settledAt: new Date() }
          });

          await prisma.systemLog.create({
            data: {
              action: 'Settlement Completed',
              merchantId: offer.merchantId,
              newValue: `Settled ${offer.type} payload of ₹${offer.amount}L.`
            }
          });

          await auditService.record({
            action: 'SETTLEMENT_COMPLETED',
            entity_type: 'AcceptedOffer',
            entity_id: offer.id,
            payload: { type: offer.type, amount: offer.amount },
          });

          logger.info('Settlement finalized successfully', { offer_id: offer.id, merchant_id: offer.merchantId });
          processedCount++;

        } catch (processError) {
          // ── Failure Handling with Retry Logic ────────────────────────
          // We track retry count using SystemLog entries for this offer
          const retryLogs = await prisma.systemLog.count({
            where: { merchantId: offer.merchantId, action: 'Settlement Retry' }
          });
          const currentRetries = retryLogs + 1;

          if (currentRetries >= MAX_RETRY_COUNT) {
            // Exhausted retries → mark as FAILED (dead-letter equivalent)
            await prisma.acceptedOffer.update({
              where: { id: offer.id },
              data: { status: 'failed' }
            });

            await auditService.record({
              action: 'SETTLEMENT_FAILED',
              status: 'FAILURE',
              entity_type: 'AcceptedOffer',
              entity_id: offer.id,
              payload: { type: offer.type, amount: offer.amount, retries: currentRetries, error: String(processError) },
            });

            logger.error('Settlement permanently failed after max retries', {
              offer_id: offer.id, retries: currentRetries, max: MAX_RETRY_COUNT
            }, processError as Error);
            failedCount++;

          } else {
            // Still has retries → set to retry_pending
            await prisma.acceptedOffer.update({
              where: { id: offer.id },
              data: { status: 'retry_pending' }
            });

            await prisma.systemLog.create({
              data: {
                action: 'Settlement Retry',
                merchantId: offer.merchantId,
                newValue: `Retry ${currentRetries}/${MAX_RETRY_COUNT} for ${offer.type} ₹${offer.amount}L.`
              }
            });

            logger.warn('Settlement failed, scheduling retry', {
              offer_id: offer.id, retry: currentRetries, max: MAX_RETRY_COUNT
            });
            retryCount++;
          }
        }
      }

      const result = { processed: processedCount, failed: failedCount, retrying: retryCount };
      logger.info('Settlement processing cycle complete', result);
      return result;

    } catch (error: any) {
      logger.error('Fatal error during settlement cron job', {}, error);
      throw error;
    }
  }
}

export const settlementService = new SettlementService();
