import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import * as xlsx from 'xlsx';

export class MerchantService {
  /**
   * Fetch merchants with pagination and optional tier filtering.
   */
  async getAllMerchants(opts: { page?: number; limit?: number; tier?: string } = {}) {
    const { page = 1, limit = 50, tier } = opts;
    const skip = (page - 1) * limit;

    try {
      const where = tier
        ? { underwriting: { credit_tier: tier } }
        : {};

      const [merchants, total] = await Promise.all([
        prisma.merchant.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { underwriting: true },
          skip,
          take: limit,
        }),
        prisma.merchant.count({ where }),
      ]);

      return { merchants, total };
    } catch (error: any) {
      logger.error('Failed to fetch merchants', { action: 'getAllMerchants' }, error);
      throw new Error('Failed to fetch merchants');
    }
  }

  /**
   * Fetch single merchant
   */
  async getMerchantById(id: string) {
    try {
      const merchant = await prisma.merchant.findUnique({
        where: { merchant_id: id },
        include: { underwriting: true, notifications: true },
      });
      return merchant;
    } catch (error: any) {
      logger.error('Failed to fetch merchant by ID', { merchant_id: id }, error);
      throw new Error('Failed to fetch merchant');
    }
  }

  /**
   * Process a bulk upload of merchants (JSON/Excel only)
   */
  async handleBulkUpload(file: File | null, jsonData: any[]) {
    let merchantsData: any[] = [];

    if (file) {
      const buffer = await file.arrayBuffer();
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        merchantsData = xlsx.utils.sheet_to_json(sheet);
      } else if (file.name.endsWith('.json')) {
        const text = new TextDecoder().decode(buffer);
        merchantsData = JSON.parse(text);
      } else {
        throw new Error('Unsupported file type. Only JSON and Excel are supported.');
      }
    } else if (jsonData && jsonData.length > 0) {
      merchantsData = jsonData;
    } else {
      throw new Error('No data provided');
    }

    let count = 0;
    try {
      for (const data of merchantsData) {
        const mId = data.merchant_id || data.id || `M${Date.now().toString().slice(-4)}${count}`;
        const monthlyGmv = Array.isArray(data.monthly_gmv_12m) 
          ? data.monthly_gmv_12m 
          : typeof data.monthlyGmv12m === 'string' 
            ? JSON.parse(data.monthlyGmv12m) 
            : Array(12).fill(0);

        await prisma.merchant.create({
          data: {
            merchant_id: mId,
            name: data.name || 'Unknown Merchant',
            category: data.category || 'Other',
            whatsappNumber: data.whatsappNumber || null,
            monthly_gmv_12m: JSON.stringify(monthlyGmv),
            coupon_redemption_rate: Number(data.coupon_redemption_rate || data.couponRedemptionRate) || 0,
            unique_customer_count: Number(data.unique_customer_count || data.uniqueCustomerCount) || 0,
            customer_return_rate: Number(data.customer_return_rate || data.customerReturnRate) || 0,
            avg_order_value: Number(data.avg_order_value || data.avgOrderValue) || 0,
            seasonality_index: Number(data.seasonality_index || data.seasonalityIndex) || 1,
            deal_exclusivity_rate: Number(data.deal_exclusivity_rate || data.dealExclusivityRate) || 0,
            return_and_refund_rate: Number(data.return_and_refund_rate || data.returnAndRefundRate) || 0,
            status: 'NEW'
          }
        });
        count++;
      }

      await prisma.systemLog.create({
        data: {
          action: 'Bulk Merchant Upload',
          userRole: 'Admin',
          userEmail: 'admin@grabon.in',
          newValue: `Uploaded ${count} merchants`,
        }
      });

      logger.info('Bulk merchant upload successful', { count });
      return count;
    } catch (error: any) {
      logger.error('Bulk upload processing error', { countProcessed: count }, error);
      throw new Error('Bulk upload failed during processing');
    }
  }
}

export const merchantService = new MerchantService();
