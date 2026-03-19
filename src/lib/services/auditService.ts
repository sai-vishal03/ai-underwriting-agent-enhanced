import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface AuditEntry {
  action: string;
  actor_id?: string;
  actor_role?: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
  status?: 'SUCCESS' | 'FAILURE';
  ip_address?: string;
}

export class AuditService {
  /**
   * Record an audit event — fire-and-forget by default.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: entry.action,
          actor_id: entry.actor_id ?? 'SYSTEM',
          actor_role: entry.actor_role ?? 'SYSTEM',
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          payload_snapshot: entry.payload ? JSON.stringify(entry.payload) : null,
          status: entry.status ?? 'SUCCESS',
          ip_address: entry.ip_address,
        },
      });
      logger.info('audit_log_recorded', { action: entry.action, entity_id: entry.entity_id });
    } catch (error) {
      logger.error('audit_log_error', { action: entry.action }, error as Error);
    }
  }

  /**
   * Fetch audit trail for a specific entity or globally.
   */
  async getTrail(entityId?: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: entityId ? { entity_id: entityId } : undefined,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}

export const auditService = new AuditService();
