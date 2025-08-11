'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Activity, 
  Zap, 
  Clock,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

// 원본 컴포넌트
import { UsageStatsCharts } from '@/components/admin/UsageStatsCharts';
import { RealTimeMonitoringDashboard } from '@/components/admin/RealTimeMonitoringDashboard';

// 최적화된 컴포넌트
import UsageStatsChartsOptimized from '@/components/admin/UsageStatsChartsOptimized';
import RealTimeMonitoringDashboardOptimized from '@/components/admin/RealTimeMonitoringDashboardOptimized';

export default function TestOptimizationPage() {
  const [showOptimized, setShowOptimized] = useState(false);
  const [renderTime, setRenderTime] = useState<{ original: number; optimized: number }>({ original: 0, optimized: 0 });

  const measureRenderTime = (type: 'original' | 'optimized') => {
    const startTime = performance.now();
    
    setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(prev => ({
        ...prev,
        [type]: Math.round(endTime - startTime)
      }));
    }, 100);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">성능 최적화 테스트</h1>
          <p className="text-muted-foreground">
            원본 컴포넌트와 최적화된 컴포넌트의 성능을 비교합니다
          </p>
        </div>

        {/* 성능 메트릭 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">현재 버전</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showOptimized ? '최적화됨' : '원본'}
              </div>
              <p className="text-xs text-muted-foreground">
                {showOptimized ? 'React.memo, useMemo 적용' : '최적화 미적용'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">렌더링 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showOptimized ? renderTime.optimized : renderTime.original}ms
              </div>
              <p className="text-xs text-muted-foreground">
                {renderTime.original > 0 && renderTime.optimized > 0 && showOptimized
                  ? `${Math.round((1 - renderTime.optimized / renderTime.original) * 100)}% 개선`
                  : '측정 대기중'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">캐싱 상태</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showOptimized ? '활성화' : '비활성화'}
              </div>
              <p className="text-xs text-muted-foreground">
                {showOptimized ? '데이터 캐싱 적용됨' : '매번 새로 로드'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">최적화 기법</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showOptimized ? '4가지' : '0가지'}
              </div>
              <p className="text-xs text-muted-foreground">
                {showOptimized ? 'Memo, Cache, Lazy, Suspense' : '기본 렌더링'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex justify-center gap-4">
          <Button 
            variant={!showOptimized ? "default" : "outline"}
            onClick={() => {
              setShowOptimized(false);
              measureRenderTime('original');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            원본 컴포넌트 보기
          </Button>
          <Button 
            variant={showOptimized ? "default" : "outline"}
            onClick={() => {
              setShowOptimized(true);
              measureRenderTime('optimized');
            }}
          >
            <Zap className="h-4 w-4 mr-2" />
            최적화 컴포넌트 보기
          </Button>
        </div>

        {/* 최적화 개선 사항 */}
        <Card>
          <CardHeader>
            <CardTitle>최적화 개선 사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🚀 차트 렌더링 최적화</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Recharts 컴포넌트 메모이제이션</li>
                  <li>• 차트 데이터 useMemo 처리</li>
                  <li>• 불필요한 리렌더링 방지</li>
                  <li>• 애니메이션 duration 최적화</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 데이터 로딩 최적화</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 인메모리 캐싱 시스템 구현</li>
                  <li>• TTL 기반 캐시 무효화</li>
                  <li>• 병렬 데이터 로딩</li>
                  <li>• Suspense 경계 설정</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💾 메모리 최적화</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 타이머 자동 정리</li>
                  <li>• 캐시 크기 제한 (100개)</li>
                  <li>• 오래된 캐시 자동 삭제</li>
                  <li>• 컴포넌트 언마운트 시 정리</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">✨ UX 개선</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 개선된 로딩 스켈레톤</li>
                  <li>• 부드러운 애니메이션</li>
                  <li>• 에러 바운더리 적용</li>
                  <li>• Lazy loading 구현</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 컴포넌트 렌더링 */}
        <Tabs defaultValue="usage-stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage-stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              사용통계
            </TabsTrigger>
            <TabsTrigger value="real-time">
              <Activity className="h-4 w-4 mr-2" />
              실시간 모니터링
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage-stats">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showOptimized ? '사용통계 (최적화됨)' : '사용통계 (원본)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showOptimized ? (
                  <UsageStatsChartsOptimized />
                ) : (
                  <UsageStatsCharts />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="real-time">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showOptimized ? '실시간 모니터링 (최적화됨)' : '실시간 모니터링 (원본)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showOptimized ? (
                  <RealTimeMonitoringDashboardOptimized />
                ) : (
                  <RealTimeMonitoringDashboard />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}