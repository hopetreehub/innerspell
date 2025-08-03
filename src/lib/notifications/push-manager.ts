/**
 * Push Notification Manager
 * Handles service worker push notifications for PWA
 */

export interface PushNotificationOptions {
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
  renotify?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  userId?: string;
}

class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    }
  }

  /**
   * Initialize push notification system
   */
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('Push messaging not supported');
      return false;
    }

    if (!this.vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return false;
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.warn('Service Worker not registered');
        return false;
      }
      
      this.swRegistration = registration;

      console.log('Push notification system initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Check if notifications are supported and enabled
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Check current notification permission
   */
  getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.swRegistration || !this.vapidPublicKey) {
      console.error('Push notification system not initialized');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.subscription = subscription;

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
      };

      // Save subscription to server
      await this.saveSubscriptionToServer(subscriptionData);

      console.log('Push subscription created:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        this.subscription = await registration.pushManager.getSubscription();
      }
    }

    if (!this.subscription) {
      console.warn('No push subscription found');
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscription.endpoint);
        this.subscription = null;
        console.log('Successfully unsubscribed from push notifications');
      }

      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  /**
   * Send a local notification (for testing)
   */
  async sendLocalNotification(options: PushNotificationOptions): Promise<void> {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }

    const permission = this.getPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      ...options,
    };

    try {
      await this.swRegistration.showNotification(options.title, defaultOptions);
      console.log('Local notification sent:', options.title);
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Test push notifications
   */
  async testNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'InnerSpell 알림 테스트',
      body: '푸시 알림이 정상적으로 작동합니다!',
      tag: 'test-notification',
      actions: [
        {
          action: 'open',
          title: '앱 열기',
        },
        {
          action: 'close',
          title: '닫기',
        },
      ],
    });
  }

  /**
   * Send notification for tarot reading completion
   */
  async notifyTarotReadingComplete(readingId: string, spreadType: string): Promise<void> {
    await this.sendLocalNotification({
      title: '타로 리딩 완료',
      body: `${spreadType} 스프레드 해석이 완료되었습니다.`,
      tag: `tarot-reading-${readingId}`,
      data: {
        type: 'tarot_reading_complete',
        readingId,
        spreadType,
        url: `/reading/${readingId}`,
      },
      actions: [
        {
          action: 'view',
          title: '리딩 보기',
        },
      ],
    });
  }

  /**
   * Send notification for new blog post
   */
  async notifyNewBlogPost(postTitle: string, postSlug: string): Promise<void> {
    await this.sendLocalNotification({
      title: '새로운 블로그 글',
      body: postTitle,
      tag: `blog-post-${postSlug}`,
      data: {
        type: 'new_blog_post',
        postSlug,
        url: `/blog/${postSlug}`,
      },
      actions: [
        {
          action: 'read',
          title: '읽기',
        },
      ],
    });
  }

  /**
   * Save subscription to server
   */
  private async saveSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Failed to save subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(endpoint: string): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  /**
   * Get user ID from localStorage or generate one
   */
  private getUserId(): string {
    try {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
      }
      return userId;
    } catch {
      return `anonymous_${Date.now()}`;
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Export singleton instance
export const pushManager = new PushNotificationManager();

// Export utility functions
export const initializePushNotifications = () => pushManager.initialize();
export const subscribeToPushNotifications = () => pushManager.subscribe();
export const unsubscribeFromPushNotifications = () => pushManager.unsubscribe();
export const testPushNotification = () => pushManager.testNotification();