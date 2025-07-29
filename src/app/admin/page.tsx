
'use client'; 

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cacheBuster, refreshAuthWithCacheBust } from '@/lib/cache-buster';
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats';
import { Spinner } from '@/components/ui/spinner';

// 레이지 로딩으로 초기 번들 크기 감소
const AIPromptConfigForm = lazy(() => import('@/components/admin/AIPromptConfigForm').then(mod => ({ default: mod.AIPromptConfigForm })));
const DreamInterpretationConfigForm = lazy(() => import('@/components/admin/DreamInterpretationConfigForm').then(mod => ({ default: mod.DreamInterpretationConfigForm })));
const UserManagement = lazy(() => import('@/components/admin/UserManagement').then(mod => ({ default: mod.UserManagement })));
const SystemManagement = lazy(() => import('@/components/admin/SystemManagement').then(mod => ({ default: mod.SystemManagement })));
const AIProviderManagement = lazy(() => import('@/components/admin/AIProviderManagement').then(mod => ({ default: mod.AIProviderManagement })));
const BlogManagement = lazy(() => import('@/components/admin/BlogManagement').then(mod => ({ default: mod.BlogManagement })));
const TarotGuidelineManagement = lazy(() => import('@/components/admin/TarotGuidelineManagement').then(mod => ({ default: mod.TarotGuidelineManagement })));
const UsageStatsCharts = lazy(() => import('@/components/admin/UsageStatsCharts').then(mod => ({ default: mod.UsageStatsCharts })));
const RealTimeMonitoringDashboard = lazy(() => import('@/components/admin/RealTimeMonitoringDashboard').then(mod => ({ default: mod.RealTimeMonitoringDashboard })));
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cog, Users, ShieldCheck, MoonStar, Bot, BookOpen, PenTool, Bell, BarChart, Activity } from 'lucide-react';

// 푸시 알림 토글도 레이지 로딩
const PushNotificationToggle = lazy(() => import('@/components/ui/push-notification-toggle').then(mod => ({ default: mod.PushNotificationToggle })));

// 로딩 스피너 컴포넌트
const TabContentSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="large" />
  </div>
);


export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    console.log('🔍 Admin Page - Auth State Check:', { loading, user: user ? `${user.email} (${user.role})` : null });
    
    if (!loading) {
      if (!user) {
        console.log('🚨 Admin Page: No user - redirecting to sign-in');
        // EMERGENCY: Clear cache before redirect for login issues
        cacheBuster.clearAuthLocalStorage();
        router.replace('/sign-in?redirect=/admin');
      } else if (user.role !== 'admin') {
        console.log(`🚨 Admin Page: User ${user.email} has role "${user.role}" - not admin, redirecting to home`);
        router.replace('/');
      } else {
        console.log(`✅ Admin Page: User ${user.email} has admin access`);
      }
    }
  }, [user, loading, router]);

  // URL 쿼리 파라미터에서 탭 확인 + 캐시 버스팅 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const cacheBust = urlParams.get('cache_bust');
    const authRefresh = urlParams.get('auth_refresh');
    
    // 캐시 버스팅 파라미터 있으면 캐시 클리어
    if (cacheBust || authRefresh) {
      console.log('🚨 Cache busting parameters detected, clearing auth cache');
      cacheBuster.clearAuthLocalStorage();
    }
    
    if (tab && ['stats', 'live-monitoring', 'ai-providers', 'tarot-instructions', 'tarot-ai-config', 'dream-ai-config', 'blog-management', 'notifications', 'user-management', 'system-management'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);


  
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">관리자 권한을 확인하는 중...</p>
          <Spinner size="large" />
          {/* EMERGENCY: 로딩이 너무 오래 걸리면 캐시 문제일 수 있음 */}
          {loading && (
            <button 
              onClick={() => {
                console.log('🚨 Manual cache refresh triggered');
                refreshAuthWithCacheBust();
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 underline hover:text-blue-800"
            >
              로딩에 문제가 있나요? 캐시 새로고침
            </button>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          InnerSpell 관리자 대시보드
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          AI 기반 타로 서비스의 모든 설정과 데이터를 관리합니다
        </p>
      </header>

      {/* 대시보드 통계 */}
      <AdminDashboardStats />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-10 mb-6">
          <TabsTrigger value="stats" className="text-sm sm:text-base">
            <BarChart className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 통계
          </TabsTrigger>
          <TabsTrigger value="live-monitoring" className="text-sm sm:text-base">
            <Activity className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 실시간
          </TabsTrigger>
          <TabsTrigger value="ai-providers" className="text-sm sm:text-base">
            <Bot className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> AI 공급자
          </TabsTrigger>
          <TabsTrigger value="tarot-instructions" className="text-sm sm:text-base">
            <BookOpen className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 타로 지침
          </TabsTrigger>
          <TabsTrigger value="tarot-ai-config" className="text-sm sm:text-base">
            <Cog className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 타로 AI
          </TabsTrigger>
          <TabsTrigger value="dream-ai-config" className="text-sm sm:text-base">
            <MoonStar className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 꿈해몽 AI
          </TabsTrigger>
          <TabsTrigger value="blog-management" className="text-sm sm:text-base">
            <PenTool className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 블로그 관리
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm sm:text-base">
            <Bell className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 알림 설정
          </TabsTrigger>
          <TabsTrigger value="user-management" className="text-sm sm:text-base">
            <Users className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 회원 관리
          </TabsTrigger>
          <TabsTrigger value="system-management" className="text-sm sm:text-base">
            <ShieldCheck className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 시스템 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <BarChart className="mr-2 h-6 w-6" /> 사용 통계 분석
              </CardTitle>
              <CardDescription>
                서비스 사용량, 사용자 성장, 성능 지표를 시각화하여 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <UsageStatsCharts />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-monitoring">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Activity className="mr-2 h-6 w-6" /> 실시간 모니터링
              </CardTitle>
              <CardDescription>
                사용자 활동, 시스템 성능, 실시간 이벤트를 모니터링합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <RealTimeMonitoringDashboard />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-providers">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Bot className="mr-2 h-6 w-6" /> AI 공급자 관리
              </CardTitle>
              <CardDescription>
                다양한 AI 공급자를 설정하고 기능별로 모델을 매핑합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <AIProviderManagement />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarot-instructions">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <BookOpen className="mr-2 h-6 w-6" /> 타로 해석 지침 관리
              </CardTitle>
              <CardDescription>
                스프레드별, 해석 스타일별 타로 지침을 체계적으로 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <TarotGuidelineManagement />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarot-ai-config">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Cog className="mr-2 h-6 w-6" /> 타로 AI 프롬프트 및 안전 설정
              </CardTitle>
              <CardDescription>
                타로 해석 생성을 위한 AI의 프롬프트 템플릿 및 안전 설정을 관리하고 업데이트합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <AIPromptConfigForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dream-ai-config">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <MoonStar className="mr-2 h-6 w-6" /> 꿈 해몽 AI 프롬프트 설정
              </CardTitle>
              <CardDescription>
                꿈 해몽 생성을 위한 AI의 프롬프트 템플릿을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <DreamInterpretationConfigForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="blog-management">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <PenTool className="mr-2 h-6 w-6" /> 블로그 콘텐츠 관리
              </CardTitle>
              <CardDescription>
                블로그 포스트를 생성, 수정, 삭제하고 카테고리와 태그를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TabContentSpinner />}>
                <BlogManagement />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <Bell className="mr-2 h-6 w-6" /> 푸시 알림 설정
              </CardTitle>
              <CardDescription>
                관리자용 푸시 알림을 설정하고 테스트합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Suspense fallback={<TabContentSpinner />}>
                <PushNotificationToggle />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management">
          <Suspense fallback={<TabContentSpinner />}>
            <UserManagement />
          </Suspense>
        </TabsContent>

        <TabsContent value="system-management">
          <Suspense fallback={<TabContentSpinner />}>
            <SystemManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
