import { NextResponse } from 'next/server';
import { adminService } from '@/lib/services/adminService';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const success = await adminService.resetDatabase();
    return NextResponse.json({ success, message: 'Database reset successfully' });
  } catch (error: any) {
    logger.error('Reset API error', {}, error);
    return NextResponse.json({ success: false, error: 'Failed to reset database' }, { status: 500 });
  }
}
