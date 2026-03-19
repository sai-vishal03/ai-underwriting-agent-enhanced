import { NextResponse } from 'next/server';
import { adminService } from '@/lib/services/adminService';

export async function GET() {
  try {
    const exportData = await adminService.exportData();
    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 });
  }
}
