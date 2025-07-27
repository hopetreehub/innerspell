import { NextRequest, NextResponse } from 'next/server';

// This should match the storage from subscribe route
// In a real app, you'd use a shared database
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }
    
    // Remove subscription
    const existed = subscriptions.has(endpoint);
    subscriptions.delete(endpoint);
    
    console.log(`Push subscription removed: ${endpoint.split('/').pop()?.substring(0, 8)}...`);
    
    return NextResponse.json({ 
      success: true,
      message: existed ? 'Subscription removed successfully' : 'Subscription not found',
      existed,
    });
    
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}