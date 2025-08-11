import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  userId?: string;
}

// In-memory storage for demo (use database in production)
const subscriptions = new Map<string, PushSubscription & { createdAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'anonymous';
    
    const subscription: PushSubscription = await request.json();
    
    // Validate subscription data
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }
    
    // Store subscription with metadata
    const subscriptionWithMeta = {
      ...subscription,
      createdAt: Date.now(),
      ip,
      lastUsed: Date.now(),
    };
    
    subscriptions.set(subscription.endpoint, subscriptionWithMeta);
    
    console.log(`New push subscription registered: ${subscription.userId || 'anonymous'}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription saved successfully',
      subscriptionId: subscription.endpoint.split('/').pop()?.substring(0, 8) + '...',
    });
    
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// Get subscription statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const now = Date.now();
    const stats = {
      total: subscriptions.size,
      active: Array.from(subscriptions.values()).filter(
        sub => now - sub.lastUsed < 30 * 24 * 60 * 60 * 1000 // 30 days
      ).length,
      subscriptions: Array.from(subscriptions.values()).map(sub => ({
        userId: sub.userId || 'anonymous',
        createdAt: new Date(sub.createdAt).toISOString(),
        lastUsed: new Date(sub.lastUsed).toISOString(),
        userAgent: sub.userAgent.substring(0, 50) + '...',
        endpoint: sub.endpoint.split('/').pop()?.substring(0, 8) + '...',
      })),
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Failed to get subscription stats:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription stats' },
      { status: 500 }
    );
  }
}