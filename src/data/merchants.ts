import { Merchant } from '../types';

export const mockMerchants: Merchant[] = [
  {
    id: 'M001',
    name: 'Zenith Fashion House',
    category: 'Fashion',
    whatsappNumber: '+919876543210',
    monthlyGmv12m: [12, 14, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38], // Growing
    couponRedemptionRate: 15,
    uniqueCustomerCount: 5000,
    customerReturnRate: 65, // Low Risk
    avgOrderValue: 2500,
    seasonalityIndex: 1.2, // Low Risk
    dealExclusivityRate: 80,
    returnAndRefundRate: 2.1, // Low Risk
  },
  {
    id: 'M002',
    name: 'Electro Hub India',
    category: 'Electronics',
    whatsappNumber: '+919876543211',
    monthlyGmv12m: [45, 48, 42, 50, 55, 60, 58, 65, 70, 75, 80, 85], // Growing, some volatility
    couponRedemptionRate: 10,
    uniqueCustomerCount: 12000,
    customerReturnRate: 55, // Moderate Risk
    avgOrderValue: 15000,
    seasonalityIndex: 1.5, // Moderate Risk
    dealExclusivityRate: 60,
    returnAndRefundRate: 4.5, // Moderate Risk
  },
  {
    id: 'M003',
    name: 'Wanderlust Travels',
    category: 'Travel',
    whatsappNumber: '+919876543212',
    monthlyGmv12m: [80, 20, 15, 90, 100, 30, 25, 110, 120, 40, 35, 130], // High Volatility
    couponRedemptionRate: 5,
    uniqueCustomerCount: 3000,
    customerReturnRate: 35, // High Risk
    avgOrderValue: 45000,
    seasonalityIndex: 4.5, // High Risk
    dealExclusivityRate: 30,
    returnAndRefundRate: 8.2, // High Risk
  },
  {
    id: 'M004',
    name: 'Gourmet Delights',
    category: 'Food',
    whatsappNumber: '+919876543213',
    monthlyGmv12m: [25, 26, 27, 25, 24, 23, 22, 21, 20, 19, 18, 17], // Declining
    couponRedemptionRate: 25,
    uniqueCustomerCount: 8000,
    customerReturnRate: 38, // Low retention
    avgOrderValue: 800,
    seasonalityIndex: 1.1,
    dealExclusivityRate: 90,
    returnAndRefundRate: 12.5, // High Refund (Rejection case)
  },
  {
    id: 'M005',
    name: 'Starlight Jewels',
    category: 'Fashion',
    whatsappNumber: '+919876543214',
    monthlyGmv12m: [100, 110, 105, 115, 120, 125, 130, 135, 140, 145, 150, 160], // Strong
    couponRedemptionRate: 8,
    uniqueCustomerCount: 2000,
    customerReturnRate: 75, // Low Risk
    avgOrderValue: 25000,
    seasonalityIndex: 1.4,
    dealExclusivityRate: 100,
    returnAndRefundRate: 1.5, // Low Risk
  },
  {
    id: 'M006',
    name: 'Swift Groceries',
    category: 'Food',
    whatsappNumber: '+919876543215',
    monthlyGmv12m: [50, 52, 51, 53, 55, 54, 56, 55, 57, 58, 59, 60], // Stable
    couponRedemptionRate: 30,
    uniqueCustomerCount: 15000,
    customerReturnRate: 85, // Excellent retention
    avgOrderValue: 1200,
    seasonalityIndex: 1.05,
    dealExclusivityRate: 70,
    returnAndRefundRate: 2.8,
  },
  {
    id: 'M007',
    name: 'Urban Threads',
    category: 'Fashion',
    whatsappNumber: '+919876543216',
    monthlyGmv12m: [15, 12, 10, 8, 7, 5, 4, 3, 2, 1, 0, 0], // Collapsing (Rejection case)
    couponRedemptionRate: 40,
    uniqueCustomerCount: 1000,
    customerReturnRate: 15,
    avgOrderValue: 1500,
    seasonalityIndex: 2.0,
    dealExclusivityRate: 50,
    returnAndRefundRate: 15.0,
  },
  {
    id: 'M008',
    name: 'Tech Gadgets Pro',
    category: 'Electronics',
    whatsappNumber: '+919876543217',
    monthlyGmv12m: [30, 35, 40, 38, 42, 45, 48, 50, 55, 60, 65, 70], // Good growth
    couponRedemptionRate: 12,
    uniqueCustomerCount: 6000,
    customerReturnRate: 48, // Moderate
    avgOrderValue: 8000,
    seasonalityIndex: 1.6,
    dealExclusivityRate: 85,
    returnAndRefundRate: 5.2,
  },
  {
    id: 'M009',
    name: 'Backpackers Paradise',
    category: 'Travel',
    whatsappNumber: '+919876543218',
    monthlyGmv12m: [20, 25, 30, 15, 10, 40, 50, 60, 30, 20, 80, 90], // Volatile but growing
    couponRedemptionRate: 18,
    uniqueCustomerCount: 4000,
    customerReturnRate: 42, // Moderate
    avgOrderValue: 12000,
    seasonalityIndex: 2.8, // High
    dealExclusivityRate: 40,
    returnAndRefundRate: 7.5, // High Risk
  },
  {
    id: 'M010',
    name: 'Home Essentials',
    category: 'Electronics',
    whatsappNumber: '+919876543219',
    monthlyGmv12m: [18, 20, 19, 21, 20, 22, 23, 21, 24, 25, 24, 26], // Stable, low growth
    couponRedemptionRate: 20,
    uniqueCustomerCount: 5500,
    customerReturnRate: 52,
    avgOrderValue: 4500,
    seasonalityIndex: 1.3,
    dealExclusivityRate: 95,
    returnAndRefundRate: 3.8,
  }
];
