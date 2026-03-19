import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { mockMerchants as initialMerchants } from '@/data/merchants';

export class AdminService {
  /**
   * Resets the entire database to the initial seed state
   */
  async resetDatabase() {
    try {
      // Clear data
      await prisma.systemLog.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.acceptedOffer.deleteMany();
      await prisma.underwritingResult.deleteMany();
      await prisma.merchant.deleteMany();
      
      // Upsert PlatformStat
      await prisma.platformStat.upsert({
        where: { id: 'singleton' },
        update: { totalDisbursedLimit: 2500000, alreadyDisbursed: 0 },
        create: { id: 'singleton', totalDisbursedLimit: 2500000, alreadyDisbursed: 0 }
      });

      // Reseed merchants
      for (const merchant of initialMerchants) {
        await prisma.merchant.create({
          data: {
            merchant_id: merchant.id,
            name: merchant.name,
            category: merchant.category,
            whatsappNumber: merchant.whatsappNumber,
            monthly_gmv_12m: JSON.stringify(merchant.monthlyGmv12m),
            coupon_redemption_rate: merchant.couponRedemptionRate,
            unique_customer_count: merchant.uniqueCustomerCount,
            customer_return_rate: merchant.customerReturnRate,
            avg_order_value: merchant.avgOrderValue,
            seasonality_index: merchant.seasonalityIndex,
            deal_exclusivity_rate: merchant.dealExclusivityRate,
            return_and_refund_rate: merchant.returnAndRefundRate,
            status: 'NEW'
          }
        });
      }

      await prisma.systemLog.create({
        data: {
          action: 'Database Reset',
          userRole: 'Admin',
          userEmail: 'admin@grabon.in',
          newValue: 'Database reset successfully'
        }
      });

      logger.info('Database reset via AdminService completed.', { action: 'resetDatabase' });
      return true;
    } catch (error: any) {
      logger.error('Failed to reset database', { action: 'resetDatabase' }, error);
      throw new Error('Failed to reset database');
    }
  }

  /**
   * Export database state
   */
  async exportData() {
    try {
      const merchants = await prisma.merchant.findMany({ include: { underwriting: true, notifications: true } });
      const stats = await prisma.platformStat.findUnique({ where: { id: 'singleton' } });
      const logs = await prisma.systemLog.findMany({ orderBy: { timestamp: 'desc' } });
      const offers = await prisma.acceptedOffer.findMany({ orderBy: { createdAt: 'desc' } });

      logger.info('Data export initiated', { action: 'exportData' });
      return { merchants, stats, logs, offers, timestamp: new Date().toISOString() };
    } catch (error: any) {
      logger.error('Data export failed', { action: 'exportData' }, error);
      throw new Error('Data export failed');
    }
  }

  /**
   * Fetch aggregate platform statistics
   */
  async getPlatformStats() {
    try {
      const stats = await prisma.platformStat.findUnique({ where: { id: 'singleton' } }) || { totalDisbursedLimit: 2500000, alreadyDisbursed: 0 };
      const acceptedOffers = await prisma.acceptedOffer.findMany({ orderBy: { createdAt: 'desc' } });
      return { stats, acceptedOffers };
    } catch (error: any) {
      logger.error('Failed to fetch platform stats', { action: 'getPlatformStats' }, error);
      throw new Error('Failed to fetch platform stats');
    }
  }

  /**
   * Update Total Disbursed Limit
   */
  async updateDisbursedLimit(amount: number) {
    try {
      const stats = await prisma.platformStat.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', totalDisbursedLimit: amount, alreadyDisbursed: 0 },
        update: { totalDisbursedLimit: amount }
      });

      await prisma.systemLog.create({
        data: {
          action: 'Limit Update',
          userRole: 'Admin',
          userEmail: 'admin@grabon.in',
          newValue: amount.toString()
        }
      });

      logger.info('Disbursed limit updated', { amount });
      return stats;
    } catch (error: any) {
      logger.error('Failed to update disbursed limit', { amount }, error);
      throw new Error('Failed to update disbursed limit');
    }
  }
}

export const adminService = new AdminService();
