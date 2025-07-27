import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@innerspell.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  vibrate?: number[];
}

interface SendNotificationRequest {
  payload: NotificationPayload;
  recipients?: 'all' | 'active' | string[]; // 'all', 'active', or array of user IDs
  targetUserId?: string; // Send to specific user
}

// Mock subscription storage (should be same as subscribe route)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    const { payload, recipients = 'all', targetUserId }: SendNotificationRequest = await request.json();

    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Invalid payload: title and body are required' },
        { status: 400 }
      );
    }

    // Get target subscriptions
    let targetSubscriptions: any[] = [];

    if (targetUserId) {
      // Send to specific user
      targetSubscriptions = Array.from(subscriptions.values()).filter(
        sub => sub.userId === targetUserId
      );
    } else if (recipients === 'all') {
      // Send to all subscribers
      targetSubscriptions = Array.from(subscriptions.values());
    } else if (recipients === 'active') {
      // Send to active subscribers (used in last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      targetSubscriptions = Array.from(subscriptions.values()).filter(
        sub => sub.lastUsed > thirtyDaysAgo
      );
    } else if (Array.isArray(recipients)) {
      // Send to specific user IDs
      targetSubscriptions = Array.from(subscriptions.values()).filter(
        sub => recipients.includes(sub.userId)
      );
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'No target subscriptions found',
          sent: 0,
          failed: 0,
        }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      data: {
        timestamp: Date.now(),
        ...payload.data,
      },
      actions: payload.actions || [],
      tag: payload.tag,
      vibrate: payload.vibrate || [200, 100, 200],
    };

    // Send notifications
    const results = await Promise.allSettled(
      targetSubscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            JSON.stringify(notificationPayload)
          );
          
          // Update last used timestamp
          subscription.lastUsed = Date.now();
          
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            subscriptions.delete(subscription.endpoint);
            console.log(`Removed invalid subscription: ${subscription.endpoint}`);
          }
          
          return { 
            success: false, 
            endpoint: subscription.endpoint, 
            error: error.message 
          };
        }
      })
    );

    // Count results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Notifications sent to ${successful} subscribers`,
      sent: successful,
      failed: failed,
      total: results.length,
    });

  } catch (error) {
    console.error('Failed to send push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}

// Get notification sending capabilities
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasVapidKeys = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
    const subscriberCount = subscriptions.size;

    return NextResponse.json({
      configured: hasVapidKeys,
      subscriberCount,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY ? '***configured***' : null,
      capabilities: {
        sendToAll: true,
        sendToActive: true,
        sendToSpecificUsers: true,
        supportedActions: true,
        supportedImages: true,
      },
    });

  } catch (error) {
    console.error('Failed to get notification capabilities:', error);
    return NextResponse.json(
      { error: 'Failed to get capabilities' },
      { status: 500 }
    );
  }
}