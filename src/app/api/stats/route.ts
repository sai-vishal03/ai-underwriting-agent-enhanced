import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/adminService';

export async function GET() {
  try {
    const result = await adminService.getPlatformStats();
    return NextResponse.json({ success: true, stats: result.stats, acceptedOffers: result.acceptedOffers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { totalDisbursedLimit } = await req.json();
    const stats = await adminService.updateDisbursedLimit(Number(totalDisbursedLimit));
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update stats' }, { status: 500 });
  }
}
