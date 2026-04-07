import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const AUTH_COOKIE_NAME = 'cairn_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!DASHBOARD_PASSWORD) {
      // No password configured - allow access
      return NextResponse.json({ success: true });
    }

    if (password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
