'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wifi, WifiOff, Home, BookOpen, Sparkles, Zap } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setLastUpdate(new Date().toLocaleTimeString('ko-KR'));
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Auto-retry when online
    if (isOnline && retryCount > 0) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isOnline, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (isOnline) {
      window.location.reload();
    }
  };

  const cachedPages = [
    { title: '홈', href: '/', icon: Home, description: '메인 페이지', color: 'text-blue-500' },
    { title: '타로리딩', href: '/reading', icon: Sparkles, description: 'AI 타로 리딩', color: 'text-purple-500' },
    { title: '타로카드', href: '/tarot', icon: Zap, description: '카드 백과사전', color: 'text-amber-500' },
    { title: '블로그', href: '/blog', icon: BookOpen, description: '타로 가이드와 팁', color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Connection Status */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300 ${
            isOnline 
              ? 'bg-green-100 text-green-600 animate-pulse' 
              : 'bg-red-100 text-red-600'
          }`}>
            {isOnline ? <Wifi size={40} /> : <WifiOff size={40} />}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isOnline ? '연결 복구됨!' : '오프라인 상태'}
          </h1>
          <p className="text-muted-foreground">
            {isOnline 
              ? '곧 페이지가 자동으로 새로고침됩니다' 
              : '인터넷 연결을 확인해주세요'
            }
          </p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-2">
              마지막 확인: {lastUpdate}
            </p>
          )}
        </div>

        {/* Retry Button */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleRetry}
              className="w-full min-h-[48px] touch-manipulation active:scale-[0.98] transition-transform duration-150"
              variant={isOnline ? "default" : "outline"}
              disabled={!isOnline}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${retryCount > 0 ? 'animate-spin' : ''}`} />
              {isOnline ? '페이지 새로고침' : '연결 대기 중...'}
            </Button>
            {retryCount > 0 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                재시도 횟수: {retryCount}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cached Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              오프라인에서도 이용 가능
            </CardTitle>
            <CardDescription>
              다음 페이지들은 오프라인에서도 접근할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cachedPages.map((page) => (
              <Link key={page.href} href={page.href}>
                <div className="flex items-center p-3 rounded-lg border hover:bg-accent/50 transition-all duration-200 touch-manipulation active:scale-[0.98] min-h-[48px]">
                  <page.icon className={`h-5 w-5 mr-3 ${page.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{page.title}</div>
                    <div className="text-sm text-muted-foreground">{page.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">오프라인 기능</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-sm font-medium">캐시된 콘텐츠</div>
              </div>
              <div className="bg-accent/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">💾</div>
                <div className="text-sm font-medium">로컬 저장소</div>
              </div>
              <div className="bg-accent/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-sm font-medium">자동 동기화</div>
              </div>
              <div className="bg-accent/30 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📱</div>
                <div className="text-sm font-medium">PWA 지원</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">오프라인 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                이전에 방문했던 페이지는 캐시되어 오프라인에서도 볼 수 있습니다
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                새로운 AI 타로 리딩은 온라인 연결이 필요합니다
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                연결이 복구되면 자동으로 최신 콘텐츠와 동기화됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            InnerSpell PWA • 오프라인 지원
          </p>
        </div>
      </div>
    </div>
  );
}