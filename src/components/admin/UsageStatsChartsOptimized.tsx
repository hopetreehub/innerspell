'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Calendar, TrendingUp, Users, Activity, AlertCircle, Database, Clock, Zap, RefreshCw, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { LoadingError } from '@/components/ui/error-states';
import { 
  getUsageStats, 
  getServiceUsageBreakdown, 
  getEnvironmentInfo, 
  getAdminPerformanceMetrics 
} from '@/actions/usageStatsActionsCached';
import {
  OptimizedAreaChart,
  OptimizedLineChart,
  OptimizedBarChart,
  OptimizedPieChart,
  PerformanceLineChart
} from './OptimizedCharts';

// 메모이제이션된 통계 카드 컴포넌트
const StatsCard = memo(({ 
  title, 
  value, 
  description, 
  icon: Icon 
}: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));
StatsCard.displayName = 'StatsCard';

// 메모이제이션된 성능 메트릭 카드
const PerformanceMetricCard = memo(({ 
  title, 
  value, 
  unit, 
  description, 
  icon: Icon 
}: { 
  title: string;
  value: number;
  unit: string;
  description: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}{unit}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));
PerformanceMetricCard.displayName = 'PerformanceMetricCard';

export default function UsageStatsChartsOptimized() {
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 데이터 로드 함수 메모이제이션
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usage, service, performance] = await Promise.all([
        getUsageStats(dateRange),
        getServiceUsageBreakdown(),
        getAdminPerformanceMetrics()
      ]);
      setUsageData(usage);
      setServiceData(service);
      setPerformanceMetrics(performance);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load usage data:', error);
      setError(error instanceof Error ? error.message : '데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // 환경 정보 로드 함수 메모이제이션
  const loadEnvironmentInfo = useCallback(async () => {
    try {
      const envInfo = await getEnvironmentInfo();
      setEnvironmentInfo(envInfo);
    } catch (error) {
      console.error('Failed to load environment info:', error);
    }
  }, []);

  // 새로고침 핸들러 메모이제이션
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // 날짜 범위 변경 핸들러 메모이제이션
  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value as 'daily' | 'weekly' | 'monthly');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadEnvironmentInfo();
  }, [loadEnvironmentInfo]);

  // 날짜 범위 설명 메모이제이션
  const dateRangeDescription = useMemo(() => {
    switch (dateRange) {
      case 'daily': return '지난 7일';
      case 'weekly': return '지난 4주';
      case 'monthly': return '지난 3개월';
      default: return '';
    }
  }, [dateRange]);

  if (loading && !usageData) {
    return <DashboardSkeleton />;
  }

  if (error && !usageData) {
    return <LoadingError resource="사용량 통계" onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 상태 표시 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">사용량 통계</h2>
          {environmentInfo && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant={environmentInfo.usingMockData ? "destructive" : "default"}
                className="flex items-center space-x-1"
              >
                <Database className="h-3 w-3" />
                <span>{environmentInfo.usingMockData ? 'Mock 데이터' : 'Production 데이터'}</span>
              </Badge>
              {environmentInfo.firebaseConfigured && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Firebase 연결됨</span>
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              마지막 업데이트: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 오류 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Mock 데이터 경고 */}
      {environmentInfo?.usingMockData && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            현재 Mock 데이터를 사용하고 있습니다. 실제 Firebase 데이터베이스에 연결하려면 환경 설정을 확인해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 성능 메트릭 카드 */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <PerformanceMetricCard
            title="응답 시간"
            value={performanceMetrics.averageResponseTime}
            unit="ms"
            description="API 평균 응답"
            icon={Clock}
          />
          <PerformanceMetricCard
            title="성공률"
            value={performanceMetrics.successRate}
            unit="%"
            description="요청 성공률"
            icon={CheckCircle}
          />
          <PerformanceMetricCard
            title="총 요청"
            value={performanceMetrics.totalRequests.toLocaleString()}
            unit=""
            description="오늘 처리된 요청"
            icon={Zap}
          />
          <PerformanceMetricCard
            title="오류율"
            value={performanceMetrics.errorRate}
            unit="%"
            description="시스템 오류율"
            icon={XCircle}
          />
        </div>
      )}

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="총 사용자"
          value={usageData?.totalUsers.toLocaleString() || '0'}
          description={dateRangeDescription}
          icon={Users}
        />
        <StatsCard
          title="총 세션"
          value={usageData?.totalSessions.toLocaleString() || '0'}
          description="전체 방문 수"
          icon={Activity}
        />
        <StatsCard
          title="평균 세션/사용자"
          value={usageData?.avgSessionsPerUser || '0'}
          description="사용자당 평균 방문"
          icon={TrendingUp}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">기간 선택</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">일별 (7일)</SelectItem>
                <SelectItem value="weekly">주별 (4주)</SelectItem>
                <SelectItem value="monthly">월별 (3개월)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* 차트 탭 */}
      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">사용 추이</TabsTrigger>
          <TabsTrigger value="service">서비스별 사용량</TabsTrigger>
          <TabsTrigger value="distribution">사용자 분포</TabsTrigger>
          <TabsTrigger value="performance">성능 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일별 사용자 및 세션 추이</CardTitle>
            </CardHeader>
            <CardContent>
              {usageData?.dailyStats && (
                <OptimizedAreaChart data={usageData.dailyStats} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>서비스별 일별 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              {usageData?.dailyStats && (
                <OptimizedLineChart data={usageData.dailyStats} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>서비스별 총 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceData?.services && (
                <OptimizedBarChart data={serviceData.services} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>인기 기능 Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceData?.topFeatures && (
                <OptimizedBarChart 
                  data={serviceData.topFeatures} 
                  dataKey="usage"
                  layout="horizontal"
                  useColors={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>사용자 분포</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceData?.userDistribution && (
                  <OptimizedPieChart data={serviceData.userDistribution} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>서비스별 사용 비율</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceData?.services && (
                  <OptimizedPieChart 
                    data={serviceData.services} 
                    nameKey="service"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceMetrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>시간대별 응답 성능</CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceMetrics.hourlyResponseTimes && (
                    <PerformanceLineChart 
                      data={performanceMetrics.hourlyResponseTimes}
                      dataKey="responseTime"
                      stroke="#10B981"
                      name="응답시간"
                    />
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>API 엔드포인트별 사용량</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceMetrics.endpointUsage && (
                      <OptimizedBarChart 
                        data={performanceMetrics.endpointUsage}
                        dataKey="requests"
                        height={250}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>오류 유형별 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {performanceMetrics.errorTypes && (
                      <OptimizedPieChart 
                        data={performanceMetrics.errorTypes}
                        height={250}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 기존 함수도 export로 유지 (호환성을 위해)
export { UsageStatsChartsOptimized };