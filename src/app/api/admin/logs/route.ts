import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Fetch both SystemLogs (legacy) and AuditLogs (new) for a complete system view
    const [systemLogs, auditLogs] = await Promise.all([
      prisma.systemLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50
      }),
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50
      })
    ]);

    return NextResponse.json({
      success: true,
      auditLogs,
      systemLogs
    });
  } catch (error) {
    logger.error('Failed to fetch admin logs', {}, error as Error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
