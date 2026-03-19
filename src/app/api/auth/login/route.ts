import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // In a real app, hash password and check DB
    // Here we hardcode the specified users for the GrabOn logic
    let role: 'Admin' | 'Analyst' | 'Viewer' | null = null;
    let name = '';
    
    if (email === 'admin@grabon.in' && password === 'admin123') {
      role = 'Admin';
      name = 'Admin User';
    } else if (email === 'analyst@grabon.in' && password === 'analyst123') {
      role = 'Analyst';
      name = 'Risk Analyst';
    } else if (email === 'viewer@grabon.in' && password === 'viewer123') {
      role = 'Viewer';
      name = 'Guest Viewer';
    }

    if (!role) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = { id: email, email, name, role };
    // Issue a short lived access token (15 minutes) as required
    const token = await signToken(payload, '15m');

    const response = NextResponse.json({ success: true, user: payload });
    
    // Set HTTP-Only Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
