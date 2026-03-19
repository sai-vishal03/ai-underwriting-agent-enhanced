import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Rate Limiting (fintech-grade: 100 req/min per IP) ────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const { allowed, remaining, retryAfterMs } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests. Rate limit: 100 req/min.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Observability: log API requests (exclude auth + static)
    if (!pathname.startsWith('/api/auth')) {
      console.log(`[REQ] ${req.method} ${pathname} [IP:${ip} remaining:${remaining}]`);
    }
  }

  // ── JWT & RBAC ───────────────────────────────────────────────────────
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login')) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    // Role-based Access Control (RBAC)
    if (pathname.startsWith('/api/admin')) {
      if (payload.role !== 'Admin') {
        console.error(`[FORBIDDEN] ${payload.email} attempted admin action ${pathname}`);
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }
    
    // Forward user context to downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
