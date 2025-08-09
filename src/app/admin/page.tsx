
'use client'; 

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { cacheBuster, refreshAuthWithCacheBust } from '@/lib/cache-buster';
import { AIPromptConfigForm } from '@/components/admin/AIPromptConfigForm';
import { DreamInterpretationConfigForm } from '@/components/admin/DreamInterpretationConfigForm';
import { UserManagement } from '@/components/admin/UserManagement';
import { SystemManagement } from '@/components/admin/SystemManagement';
import { AIProviderManagement } from '@/components/admin/AIProviderManagement';
import { BlogManagement } from '@/components/admin/BlogManagement';
import { TarotGuidelineManagement } from '@/components/admin/TarotGuidelineManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Cog, Users, ShieldCheck, MoonStar, Bot, BookOpen, PenTool, BarChart3, Activity, GraduationCap } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { UsageStatsCharts } from '@/components/admin/UsageStatsCharts';
import { RealTimeMonitoringDashboard } from '@/components/admin/RealTimeMonitoringDashboard';


export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tarot-guidelines');
  
  // 개발 환경 확인
  const isDevMode = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true';

  useEffect(() => {
    console.log('🔍 Admin Page - Auth State Check:', { 
      loading, 
      user: user ? `${user.email} (${user.role})` : null,
      isDevMode,
      NEXT_PUBLIC_ENABLE_DEV_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH
    });
    
    // 개발 환경에서는 인증 체크 우회
    if (isDevMode) {
      console.log('🚀 Dev Mode: Bypassing auth check for admin page');
      return;
    }
    
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
  }, [user, loading, router, isDevMode]);

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
    
    if (tab && ['ai-providers', 'tarot-guidelines', 'tarot-ai-config', 'dream-ai-config', 'blog-management', 'user-management', 'system-management', 'usage-stats', 'real-time-monitoring'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);


  
  // 개발 환경에서는 로딩 스킵
  if (!isDevMode && (loading || !user || user.role !== 'admin')) {
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
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary">관리자 대시보드</h1>
        <p className="mt-2 text-lg text-foreground/80">
          애플리케이션의 다양한 설정을 관리합니다.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 mb-6 gap-2">
          <TabsTrigger value="ai-providers" className="text-xs sm:text-sm">
            <Bot className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">AI 공급자</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="tarot-guidelines" className="text-xs sm:text-sm">
            <BookOpen className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">타로 지침</span>
            <span className="sm:hidden">지침</span>
          </TabsTrigger>
          <TabsTrigger value="tarot-ai-config" className="text-xs sm:text-sm">
            <Cog className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">타로 AI</span>
            <span className="sm:hidden">타로</span>
          </TabsTrigger>
          <TabsTrigger value="dream-ai-config" className="text-xs sm:text-sm">
            <MoonStar className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">꿈해몽 AI</span>
            <span className="sm:hidden">꿈</span>
          </TabsTrigger>
          <TabsTrigger value="blog-management" className="text-xs sm:text-sm">
            <PenTool className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">블로그 관리</span>
            <span className="sm:hidden">블로그</span>
          </TabsTrigger>
          <TabsTrigger value="user-management" className="text-xs sm:text-sm">
            <Users className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">회원 관리</span>
            <span className="sm:hidden">회원</span>
          </TabsTrigger>
          <TabsTrigger value="system-management" className="text-xs sm:text-sm">
            <ShieldCheck className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">시스템 관리</span>
            <span className="sm:hidden">시스템</span>
          </TabsTrigger>
          <TabsTrigger value="usage-stats" className="text-xs sm:text-sm">
            <BarChart3 className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">사용통계</span>
            <span className="sm:hidden">통계</span>
          </TabsTrigger>
          <TabsTrigger value="real-time-monitoring" className="text-xs sm:text-sm">
            <Activity className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">실시간 모니터링</span>
            <span className="sm:hidden">실시간</span>
          </TabsTrigger>
          <TabsTrigger value="education-inquiries" className="text-xs sm:text-sm">
            <GraduationCap className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">교육 문의</span>
            <span className="sm:hidden">교육</span>
          </TabsTrigger>
        </TabsList>

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
                6개 스프레드 × 6개 해석 스타일로 구성된 36개 전문 지침을 관리합니다. 관리자만 보고 수정할 수 있습니다.
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
                타로 해석 생성을 위한 AI의 프롬프트 템플릿 및 안전 설정을 관리하고 업데이트합니다.
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
              <UsageStatsCharts />
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
              <RealTimeMonitoringDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education-inquiries">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <GraduationCap className="mr-2 h-6 w-6" /> 교육 문의 관리
              </CardTitle>
              <CardDescription>
                타로 교육 프로그램에 대한 문의를 확인하고 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <a 
                  href="/admin/education-inquiries" 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  교육 문의 목록 보기
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
