import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Canonical seed data — single source of truth for initial merchants
const seedMerchants = [
  { id: 'M001', name: 'Zenith Fashion House', category: 'Fashion', whatsappNumber: '+919876543210', monthlyGmv12m: [12,14,15,18,20,22,25,28,30,32,35,38], couponRedemptionRate: 15, uniqueCustomerCount: 5000, customerReturnRate: 65, avgOrderValue: 2500, seasonalityIndex: 1.2, dealExclusivityRate: 80, returnAndRefundRate: 2.1 },
  { id: 'M002', name: 'Electro Hub India', category: 'Electronics', whatsappNumber: '+919876543211', monthlyGmv12m: [45,48,42,50,55,60,58,65,70,75,80,85], couponRedemptionRate: 10, uniqueCustomerCount: 12000, customerReturnRate: 55, avgOrderValue: 15000, seasonalityIndex: 1.5, dealExclusivityRate: 60, returnAndRefundRate: 4.5 },
  { id: 'M003', name: 'Wanderlust Travels', category: 'Travel', whatsappNumber: '+919876543212', monthlyGmv12m: [80,20,15,90,100,30,25,110,120,40,35,130], couponRedemptionRate: 5, uniqueCustomerCount: 3000, customerReturnRate: 35, avgOrderValue: 45000, seasonalityIndex: 4.5, dealExclusivityRate: 30, returnAndRefundRate: 8.2 },
  { id: 'M004', name: 'Gourmet Delights', category: 'Food', whatsappNumber: '+919876543213', monthlyGmv12m: [25,26,27,25,24,23,22,21,20,19,18,17], couponRedemptionRate: 25, uniqueCustomerCount: 8000, customerReturnRate: 38, avgOrderValue: 800, seasonalityIndex: 1.1, dealExclusivityRate: 90, returnAndRefundRate: 12.5 },
  { id: 'M005', name: 'Starlight Jewels', category: 'Fashion', whatsappNumber: '+919876543214', monthlyGmv12m: [100,110,105,115,120,125,130,135,140,145,150,160], couponRedemptionRate: 8, uniqueCustomerCount: 2000, customerReturnRate: 75, avgOrderValue: 25000, seasonalityIndex: 1.4, dealExclusivityRate: 100, returnAndRefundRate: 1.5 },
  { id: 'M006', name: 'Swift Groceries', category: 'Food', whatsappNumber: '+919876543215', monthlyGmv12m: [50,52,51,53,55,54,56,55,57,58,59,60], couponRedemptionRate: 30, uniqueCustomerCount: 15000, customerReturnRate: 85, avgOrderValue: 1200, seasonalityIndex: 1.05, dealExclusivityRate: 70, returnAndRefundRate: 2.8 },
  { id: 'M007', name: 'Urban Threads', category: 'Fashion', whatsappNumber: '+919876543216', monthlyGmv12m: [15,12,10,8,7,5,4,3,2,1,0,0], couponRedemptionRate: 40, uniqueCustomerCount: 1000, customerReturnRate: 15, avgOrderValue: 1500, seasonalityIndex: 2.0, dealExclusivityRate: 50, returnAndRefundRate: 15.0 },
  { id: 'M008', name: 'Tech Gadgets Pro', category: 'Electronics', whatsappNumber: '+919876543217', monthlyGmv12m: [30,35,40,38,42,45,48,50,55,60,65,70], couponRedemptionRate: 12, uniqueCustomerCount: 6000, customerReturnRate: 48, avgOrderValue: 8000, seasonalityIndex: 1.6, dealExclusivityRate: 85, returnAndRefundRate: 5.2 },
  { id: 'M009', name: 'Backpackers Paradise', category: 'Travel', whatsappNumber: '+919876543218', monthlyGmv12m: [20,25,30,15,10,40,50,60,30,20,80,90], couponRedemptionRate: 18, uniqueCustomerCount: 4000, customerReturnRate: 42, avgOrderValue: 12000, seasonalityIndex: 2.8, dealExclusivityRate: 40, returnAndRefundRate: 7.5 },
  { id: 'M010', name: 'Home Essentials', category: 'Electronics', whatsappNumber: '+919876543219', monthlyGmv12m: [18,20,19,21,20,22,23,21,24,25,24,26], couponRedemptionRate: 20, uniqueCustomerCount: 5500, customerReturnRate: 52, avgOrderValue: 4500, seasonalityIndex: 1.3, dealExclusivityRate: 95, returnAndRefundRate: 3.8 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert PlatformStat
  await prisma.platformStat.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', totalDisbursedLimit: 2500000, alreadyDisbursed: 0 },
  });

  for (const m of seedMerchants) {
    await prisma.merchant.upsert({
      where: { merchant_id: m.id },
      update: {},
      create: {
        merchant_id: m.id,
        name: m.name,
        category: m.category,
        whatsappNumber: m.whatsappNumber,
        monthly_gmv_12m: JSON.stringify(m.monthlyGmv12m),
        coupon_redemption_rate: m.couponRedemptionRate,
        unique_customer_count: m.uniqueCustomerCount,
        customer_return_rate: m.customerReturnRate,
        avg_order_value: m.avgOrderValue,
        seasonality_index: m.seasonalityIndex,
        deal_exclusivity_rate: m.dealExclusivityRate,
        return_and_refund_rate: m.returnAndRefundRate,
        status: 'NEW',
      },
    });
  }

  console.log(`✅ Seeded ${seedMerchants.length} merchants + PlatformStat singleton.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
