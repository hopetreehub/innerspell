
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
import { Cog, Users, ShieldCheck, MoonStar, Bot, BookOpen, PenTool } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';


export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tarot-guidelines');

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
    
    if (tab && ['ai-providers', 'tarot-guidelines', 'tarot-ai-config', 'dream-ai-config', 'blog-management', 'user-management', 'system-management'].includes(tab)) {
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
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 mb-6">
          <TabsTrigger value="ai-providers" className="text-sm sm:text-base">
            <Bot className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> AI 공급자
          </TabsTrigger>
          <TabsTrigger value="tarot-guidelines" className="text-sm sm:text-base">
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
          <TabsTrigger value="user-management" className="text-sm sm:text-base">
            <Users className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 회원 관리
          </TabsTrigger>
          <TabsTrigger value="system-management" className="text-sm sm:text-base">
            <ShieldCheck className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" /> 시스템 관리
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
      </Tabs>
    </div>
  );
}
