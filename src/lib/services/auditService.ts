import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface AuditEntry {
  action: string;
  actorId?: string;
  actorRole?: string;
  merchantId?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  status?: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
}

export class AuditService {
  /**
   * Record an audit event — fire-and-forget by default.
   * All financial actions (offer acceptance, settlement, risk AI generation)
   * must be audited for full traceability.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          actorId: entry.actorId ?? 'SYSTEM',
          actorRole: entry.actorRole ?? 'SYSTEM',
          merchantId: entry.merchantId,
          entityId: entry.entityId,
          payload: entry.payload ? JSON.stringify(entry.payload) : null,
          status: entry.status ?? 'SUCCESS',
          ipAddress: entry.ipAddress,
        },
      });
      logger.info('audit_log_recorded', { action: entry.action, entity_id: entry.entityId });
    } catch (error) {
      // Audit failures should never crash the main flow
      logger.error('audit_log_error', { action: entry.action }, error as Error);
    }
  }

  /**
   * Fetch audit trail for a specific merchant or globally.
   */
  async getTrail(merchantId?: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: merchantId ? { merchantId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}

export const auditService = new AuditService();
