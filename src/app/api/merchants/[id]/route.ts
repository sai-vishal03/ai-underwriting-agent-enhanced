import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchantService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const merchant = await merchantService.getMerchantById(params.id);
    if (!merchant) {
      return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, merchant });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch merchant' }, { status: 500 });
  }
}
