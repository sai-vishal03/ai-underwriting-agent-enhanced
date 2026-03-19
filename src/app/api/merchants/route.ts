import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchantService';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')));
    const tier = searchParams.get('tier') || undefined;  // e.g. "Tier 1"

    const { merchants, total } = await merchantService.getAllMerchants({ page, limit, tier });
    return NextResponse.json({
      success: true,
      merchants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let file: File | null = null;
    let jsonData: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      file = formData.get('file') as File;
      
      if (!file) return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      
      if (file.name.endsWith('.pdf')) {
        return NextResponse.json({ success: false, error: 'PDF not supported for structured data upload' }, { status: 400 });
      }
      
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.json')) {
        return NextResponse.json({ success: false, error: 'Unsupported file type. Please upload JSON or Excel.' }, { status: 400 });
      }
    } else {
      const body = await req.json();
      jsonData = Array.isArray(body) ? body : [body];
    }

    const count = await merchantService.handleBulkUpload(file, jsonData);
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    logger.error('Bulk upload route error', {}, error);
    return NextResponse.json({ success: false, error: error.message || 'Bulk upload failed' }, { status: 500 });
  }
}
