'use client'; 

import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cacheBuster, refreshAuthWithCacheBust } from '@/lib/cache-buster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cog, Users, ShieldCheck, MoonStar, Bot, BookOpen, PenTool, BarChart3, Activity } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingError } from '@/components/ui/error-states';

// Lazy load all admin components
const AIPromptConfigForm = lazy(() => import('@/components/admin/AIPromptConfigForm').then(m => ({ default: m.AIPromptConfigForm })));
const DreamInterpretationConfigForm = lazy(() => import('@/components/admin/DreamInterpretationConfigForm').then(m => ({ default: m.DreamInterpretationConfigForm })));
const UserManagement = lazy(() => import('@/components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const SystemManagement = lazy(() => import('@/components/admin/SystemManagement').then(m => ({ default: m.SystemManagement })));
const AIProviderManagement = lazy(() => import('@/components/admin/AIProviderManagement').then(m => ({ default: m.AIProviderManagement })));
const BlogManagement = lazy(() => import('@/components/admin/BlogManagement').then(m => ({ default: m.BlogManagement })));
const TarotGuidelineManagement = lazy(() => import('@/components/admin/TarotGuidelineManagement').then(m => ({ default: m.TarotGuidelineManagement })));

// 최적화된 컴포넌트 사용
const UsageStatsChartsOptimized = lazy(() => import('@/components/admin/UsageStatsChartsOptimized'));
const RealTimeMonitoringDashboardOptimized = lazy(() => import('@/components/admin/RealTimeMonitoringDashboardOptimized'));

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <LoadingError 
      resource="관리자 컴포넌트" 
      onRetry={resetErrorBoundary}
    />
  );
}

// 탭 데이터 메모이제이션
const TAB_DATA = [
  { value: 'ai-providers', icon: Bot, label: 'AI 공급자', shortLabel: 'AI' },
  { value: 'tarot-guidelines', icon: BookOpen, label: '타로 지침', shortLabel: '지침' },
  { value: 'tarot-ai-config', icon: Cog, label: '타로 AI', shortLabel: '타로' },
  { value: 'dream-ai-config', icon: MoonStar, label: '꿈해몽 AI', shortLabel: '꿈' },
  { value: 'blog-management', icon: PenTool, label: '블로그 관리', shortLabel: '블로그' },
  { value: 'user-management', icon: Users, label: '회원 관리', shortLabel: '회원' },
  { value: 'system-management', icon: ShieldCheck, label: '시스템 관리', shortLabel: '시스템' },
  { value: 'usage-stats', icon: BarChart3, label: '사용통계', shortLabel: '통계' },
  { value: 'real-time-monitoring', icon: Activity, label: '실시간 모니터링', shortLabel: '실시간' }
];

export default function AdminDashboardPageOptimized() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tarot-guidelines');

  // 인증 체크 메모이제이션
  const isAuthorized = useMemo(() => {
    return !loading && user && user.role === 'admin';
  }, [loading, user]);

  // 탭 변경 핸들러 메모이제이션
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // URL 업데이트 (히스토리 추가 없이)
    window.history.replaceState({}, '', `?tab=${value}`);
  }, []);

  useEffect(() => {
    console.log('🔍 Admin Page - Auth State Check:', { loading, user: user ? `${user.email} (${user.role})` : null });
    
    if (!loading) {
      if (!user) {
        console.log('🚨 Admin Page: No user - redirecting to sign-in');
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

  // URL 쿼리 파라미터에서 탭 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const cacheBust = urlParams.get('cache_bust');
    const authRefresh = urlParams.get('auth_refresh');
    
    if (cacheBust || authRefresh) {
      console.log('🚨 Cache busting parameters detected, clearing auth cache');
      cacheBuster.clearAuthLocalStorage();
    }
    
    if (tab && TAB_DATA.some(t => t.value === tab)) {
      setActiveTab(tab);
    }
  }, []);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">관리자 권한을 확인하는 중...</p>
          <Spinner size="large" />
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
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary">관리자 대시보드</h1>
        <p className="mt-2 text-lg text-foreground/80">
          애플리케이션의 다양한 설정을 관리합니다. (최적화 버전)
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 mb-6 gap-2">
          {TAB_DATA.map(({ value, icon: Icon, label, shortLabel }) => (
            <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
              <Icon className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<DashboardSkeleton />}>
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
                  <AIProviderManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tarot-guidelines">
              <Card className="shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary flex items-center">
                    <BookOpen className="mr-2 h-6 w-6" /> 타로 지침 가이드 관리
                  </CardTitle>
                  <CardDescription>
                    6개 스프레드 × 6개 해석 스타일로 구성된 36개 전문 지침을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TarotGuidelineManagement />
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
                    타로 해석 생성을 위한 AI의 프롬프트 템플릿 및 안전 설정을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIPromptConfigForm />
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
                  <DreamInterpretationConfigForm />
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
                  <BlogManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-management">
              <UserManagement />
            </TabsContent>

            <TabsContent value="system-management">
              <SystemManagement />
            </TabsContent>

            <TabsContent value="usage-stats">
              <Card className="shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary flex items-center">
                    <BarChart3 className="mr-2 h-6 w-6" /> 사용통계 분석
                  </CardTitle>
                  <CardDescription>
                    서비스 사용량 추이와 사용자 행동 패턴을 분석합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UsageStatsChartsOptimized />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="real-time-monitoring">
              <Card className="shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl text-primary flex items-center">
                    <Activity className="mr-2 h-6 w-6" /> 실시간 모니터링
                  </CardTitle>
                  <CardDescription>
                    현재 접속자, 활성 세션, 시스템 상태를 실시간으로 모니터링합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeMonitoringDashboardOptimized />
                </CardContent>
              </Card>
            </TabsContent>
          </Suspense>
        </ErrorBoundary>
      </Tabs>
    </div>
  );
}