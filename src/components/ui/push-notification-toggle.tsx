'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pushManager } from '@/lib/notifications/push-manager';
import { cn } from '@/lib/utils';

interface PushNotificationToggleProps {
  className?: string;
}

export function PushNotificationToggle({ className }: PushNotificationToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supported = pushManager.isSupported();
      setIsSupported(supported);

      if (!supported) {
        setError('브라우저에서 푸시 알림을 지원하지 않습니다.');
        return;
      }

      const initialized = await pushManager.initialize();
      if (!initialized) {
        setError('푸시 알림 시스템을 초기화할 수 없습니다.');
        return;
      }

      const currentPermission = pushManager.getPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const subscription = await pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error('Failed to initialize push notifications:', err);
      setError('푸시 알림 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      if (enabled) {
        const subscription = await pushManager.subscribe();
        if (subscription) {
          setIsSubscribed(true);
          setPermission('granted');
        } else {
          setError('푸시 알림 구독에 실패했습니다.');
        }
      } else {
        const success = await pushManager.unsubscribe();
        if (success) {
          setIsSubscribed(false);
        } else {
          setError('푸시 알림 구독 해제에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('Failed to toggle push notifications:', err);
      setError('푸시 알림 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await pushManager.testNotification();
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setError('테스트 알림 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            푸시 알림
          </CardTitle>
          <CardDescription>
            브라우저에서 푸시 알림을 지원하지 않습니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          푸시 알림 설정
        </CardTitle>
        <CardDescription>
          새로운 타로 리딩 완료와 업데이트 소식을 받아보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-toggle" className="text-sm font-medium">
              푸시 알림 받기
            </Label>
            <p className="text-xs text-muted-foreground">
              {permission === 'granted' && isSubscribed
                ? '알림이 활성화되어 있습니다'
                : permission === 'denied'
                ? '알림 권한이 거부되었습니다'
                : '알림 권한을 허용해주세요'}
            </p>
          </div>
          <Switch
            id="notifications-toggle"
            checked={permission === 'granted' && isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <Alert>
            <AlertDescription>
              브라우저 설정에서 알림 권한을 허용한 후 페이지를 새로고침해주세요.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && isSubscribed && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  전송 중...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  테스트 알림 보내기
                </>
              )}
            </Button>
          </div>
        )}

        {isLoading && !error && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">처리 중...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}