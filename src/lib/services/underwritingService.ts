import { prisma } from '@/lib/prisma';
import { performUnderwriting } from '@/lib/underwriting';
import { Merchant } from '@/types';
import { logger } from '@/lib/logger';

export class UnderwritingService {
  /**
   * Execute underwriting processing for a given merchant
   */
  async processUnderwriting(merchantId: string) {
    try {
      const merchantModel = await prisma.merchant.findUnique({ where: { merchant_id: merchantId } });
      if (!merchantModel) {
        throw new Error('Merchant not found');
      }

      // Map to the type expected by performUnderwriting
      const merchant: Merchant = {
        id: merchantModel.merchant_id,
        name: merchantModel.name,
        category: merchantModel.category,
        whatsappNumber: merchantModel.whatsappNumber || '',
        monthlyGmv12m: JSON.parse(merchantModel.monthly_gmv_12m || '[]'),
        couponRedemptionRate: merchantModel.coupon_redemption_rate,
        uniqueCustomerCount: merchantModel.unique_customer_count,
        customerReturnRate: merchantModel.customer_return_rate,
        avgOrderValue: merchantModel.avg_order_value,
        seasonalityIndex: merchantModel.seasonality_index,
        dealExclusivityRate: merchantModel.deal_exclusivity_rate,
        returnAndRefundRate: merchantModel.return_and_refund_rate
      };

      const uwResult = performUnderwriting(merchant);

      // Update Merchant status
      const status = uwResult.creditOffer.status === 'Approved' || uwResult.insuranceOffer.status === 'Approved'
        ? 'OFFER_READY' : 'REJECTED';
      
      await prisma.merchant.update({
        where: { merchant_id: merchantId },
        data: { status }
      });

      // Create or update Underwriting Result
      await prisma.underwritingResult.upsert({
        where: { merchantId: merchant.id },
        create: {
          merchantId: merchant.id,
          credit_limit: uwResult.creditOffer.limit,
          credit_interestRate: uwResult.creditOffer.interestRate,
          credit_tenure: uwResult.creditOffer.tenure,
          credit_status: uwResult.creditOffer.status,
          credit_tier: uwResult.creditOffer.tier,
          credit_rationale: uwResult.creditOffer.rationale,
          credit_baseRate: uwResult.creditOffer.baseRate,
          credit_riskPremium: uwResult.creditOffer.riskPremium,
          credit_volatilityAdj: uwResult.creditOffer.volatilityAdj,
          insurance_coverageAmount: uwResult.insuranceOffer.coverageAmount,
          insurance_premium: uwResult.insuranceOffer.premium,
          insurance_policyType: uwResult.insuranceOffer.policyType,
          insurance_status: uwResult.insuranceOffer.status,
          insurance_tier: uwResult.insuranceOffer.tier,
          insurance_rationale: uwResult.insuranceOffer.rationale,
          riskScore: uwResult.riskScore,
          pd: uwResult.pd,
          el: uwResult.el,
          raroc: uwResult.raroc,
          lgd: uwResult.lgd
        },
        update: {
          credit_limit: uwResult.creditOffer.limit,
          credit_interestRate: uwResult.creditOffer.interestRate,
          credit_tenure: uwResult.creditOffer.tenure,
          credit_status: uwResult.creditOffer.status,
          credit_tier: uwResult.creditOffer.tier,
          credit_rationale: uwResult.creditOffer.rationale,
          credit_baseRate: uwResult.creditOffer.baseRate,
          credit_riskPremium: uwResult.creditOffer.riskPremium,
          credit_volatilityAdj: uwResult.creditOffer.volatilityAdj,
          insurance_coverageAmount: uwResult.insuranceOffer.coverageAmount,
          insurance_premium: uwResult.insuranceOffer.premium,
          insurance_policyType: uwResult.insuranceOffer.policyType,
          insurance_status: uwResult.insuranceOffer.status,
          insurance_tier: uwResult.insuranceOffer.tier,
          insurance_rationale: uwResult.insuranceOffer.rationale,
          riskScore: uwResult.riskScore,
          pd: uwResult.pd,
          el: uwResult.el,
          raroc: uwResult.raroc,
          lgd: uwResult.lgd
        }
      });

      // Log action
      await prisma.systemLog.create({
        data: {
          action: 'Underwriting Executed',
          merchantId: merchant.id,
          newValue: `Underwriting executed for ${merchant.name}. Credit: ${uwResult.creditOffer.status}, Insurance: ${uwResult.insuranceOffer.status}`,
          userRole: 'System',
          userEmail: 'system@automation'
        }
      });

      logger.info('Underwriting processed successfully', { merchant_id: merchantId, credit_status: uwResult.creditOffer.status });
      logger.logMetric('underwriting_count', 1, { merchant_id: merchantId });
      
      const accepted = [uwResult.creditOffer.status, uwResult.insuranceOffer.status].includes('Approved');
      if (accepted) {
          logger.logMetric('acceptance_rate', 1, { merchant_id: merchantId });
      }

      logger.logMetric('tier_distribution', uwResult.creditOffer.tier, { merchant_id: merchantId });

      return uwResult;
    } catch (error: any) {
      logger.error('Error during underwriting processing', { merchant_id: merchantId }, error);
      throw new Error('Failed to process underwriting');
    }
  }
}

export const underwritingService = new UnderwritingService();
