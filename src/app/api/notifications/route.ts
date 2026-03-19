import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

// Use environment variables for real integration, mocking otherwise.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(req: NextRequest) {
  try {
    const { merchantId, message } = await req.json();

    const merchantModel = await prisma.merchant.findUnique({ where: { merchant_id: merchantId } });
    if (!merchantModel) return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });

    // Send mock notification to the database
    await prisma.notification.create({
      data: {
        merchantId: merchantModel.merchant_id,
        merchantName: merchantModel.name,
        type: 'WHATSAPP',
        message: message,
        status: 'Sent'
      }
    });

    // Attempt Twilio SMS/WhatsApp if client exists
    if (client && merchantModel.whatsappNumber) {
      try {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886', // Twilio sandbox number
          to: `whatsapp:${merchantModel.whatsappNumber}`
        });
      } catch (err) {
        console.error('Twilio message failed:', err);
      }
    }

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'Offer Notification Sent',
        merchantId: merchantModel.merchant_id,
        details: `WhatsApp simulation sent to ${merchantModel.name}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
