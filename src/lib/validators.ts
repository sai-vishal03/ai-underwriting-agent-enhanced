import { z } from 'zod';

// ─── POST /api/underwrite ───────────────────────────────
export const underwriteSchema = z.object({
  merchantId: z.string().min(1, 'merchantId is required'),
});

// ─── POST /api/accept-offer ─────────────────────────────
export const acceptOfferSchema = z.object({
  merchantId: z.string().min(1, 'merchantId is required'),
  type: z.enum(['Credit', 'Insurance', 'Both']),
  amount: z.number().positive('amount must be a positive number'),
});

// ─── POST /api/risk-review ──────────────────────────────
export const riskReviewSchema = z.object({
  merchantId: z.string().min(1, 'merchantId is required'),
});

// ─── POST /api/merchants (JSON body) ────────────────────
export const merchantInputSchema = z.object({
  name: z.string().min(1, 'name is required'),
  category: z.string().min(1, 'category is required'),
  whatsappNumber: z.string().optional(),
  monthly_gmv_12m: z.array(z.number()).length(12).optional(),
  monthlyGmv12m: z.array(z.number()).length(12).optional(),
  coupon_redemption_rate: z.number().optional(),
  couponRedemptionRate: z.number().optional(),
  unique_customer_count: z.number().int().optional(),
  uniqueCustomerCount: z.number().int().optional(),
  customer_return_rate: z.number().optional(),
  customerReturnRate: z.number().optional(),
  avg_order_value: z.number().optional(),
  avgOrderValue: z.number().optional(),
  seasonality_index: z.number().optional(),
  seasonalityIndex: z.number().optional(),
  deal_exclusivity_rate: z.number().optional(),
  dealExclusivityRate: z.number().optional(),
  return_and_refund_rate: z.number().optional(),
  returnAndRefundRate: z.number().optional(),
}).passthrough();

export const merchantBulkSchema = z.array(merchantInputSchema).min(1, 'At least one merchant is required');

/**
 * Helper to format Zod errors into a clean string.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
}
