import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // Development only endpoint
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { action } = await request.json();
    
    if (action === 'login') {
      // Set a development auth cookie
      const cookieStore = await cookies();
      cookieStore.set('dev-auth-token', 'mock-test-user-id', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      
      return NextResponse.json({ 
        success: true, 
        user: {
          uid: 'mock-test-user-id',
          email: 'test@innerspell.com',
          displayName: 'Test User',
          role: 'user'
        }
      });
    } else if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('dev-auth-token');
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Dev auth error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}