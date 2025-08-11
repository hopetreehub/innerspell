'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Activity, 
  AlertCircle, 
  Database, 
  Clock,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
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
  EmptyUsageStats, 
  EmptyChartState, 
  DevelopmentModeState,
  EmptyCard 
} from '@/components/ui/empty-states';
import { 
  getUsageStats, 
  getServiceUsageBreakdown, 
  getEnvironmentInfo, 
  getAdminPerformanceMetrics 
} from '@/actions/usageStatsActions';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function UsageStatsCharts() {
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  useEffect(() => {
    // 환경 정보는 최초에만 로드
    loadEnvironmentInfo();
  }, []);

  const loadData = async () => {
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
  };

  const loadEnvironmentInfo = async () => {
    try {
      const envInfo = await getEnvironmentInfo();
      setEnvironmentInfo(envInfo);
    } catch (error) {
      console.error('Failed to load environment info:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading && !usageData) {
    return <DashboardSkeleton />;
  }

  if (error && !usageData) {
    return <LoadingError resource="사용량 통계" onRetry={loadData} />;
  }

  // 데이터가 없는 경우 (빈 상태)
  if (!loading && (!usageData || (usageData.totalUsers === 0 && usageData.totalSessions === 0))) {
    if (environmentInfo?.usingMockData) {
      return <DevelopmentModeState onRefresh={handleRefresh} />;
    }
    return <EmptyUsageStats onRefresh={handleRefresh} />;
  }

  return (
    <div className="space-y-6">
      {/* 환경 정보 및 상태 표시 */}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">응답 시간</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">API 평균 응답</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">성공률</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.successRate}%</div>
              <p className="text-xs text-muted-foreground">요청 성공률</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 요청</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">오늘 처리된 요청</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오류율</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.errorRate}%</div>
              <p className="text-xs text-muted-foreground">시스템 오류율</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'daily' ? '지난 7일' : dateRange === 'weekly' ? '지난 4주' : '지난 3개월'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 세션</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">전체 방문 수</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 세션/사용자</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData?.avgSessionsPerUser}</div>
            <p className="text-xs text-muted-foreground">사용자당 평균 방문</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">기간 선택</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
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
              {usageData?.dailyStats && usageData.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={usageData?.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={formatTooltipDate}
                      formatter={(value: any, name: string) => [
                        value.toLocaleString(),
                        name
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      name="사용자"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="sessions"
                      stackId="2"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="세션"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState 
                  title="사용자 및 세션 데이터가 없습니다"
                  description="아직 수집된 일별 사용자 및 세션 데이터가 없습니다."
                  onRefresh={handleRefresh}
                  chartType="area"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>서비스별 일별 사용량</CardTitle>
            </CardHeader>
            <CardContent>
              {usageData?.dailyStats && usageData.dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData?.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatTooltipDate}
                      formatter={(value: any) => value.toLocaleString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tarotReadings" 
                      stroke="#10B981" 
                      name="타로 리딩"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dreamInterpretations" 
                      stroke="#F59E0B" 
                      name="꿈 해석"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yesNoReadings" 
                      stroke="#EF4444" 
                      name="예스/노 타로"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState 
                  title="서비스 사용량 데이터가 없습니다"
                  description="타로 리딩, 꿈 해석 등의 서비스 사용 기록이 없습니다."
                  onRefresh={handleRefresh}
                  chartType="line"
                />
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData?.services}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" name="사용 횟수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>인기 기능 Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={serviceData?.topFeatures} 
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value.toLocaleString()} />
                  <Bar dataKey="usage" fill="#3B82F6">
                    {serviceData?.topFeatures.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceData?.userDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }: any) => `${type}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {serviceData?.userDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>서비스별 사용 비율</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceData?.services}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ service, percentage }: any) => `${service}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {serviceData?.services.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceMetrics.hourlyResponseTimes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`${value}ms`, '응답시간']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#10B981" 
                        name="평균 응답시간 (ms)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>API 엔드포인트별 사용량</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={performanceMetrics.endpointUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="endpoint" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="requests" fill="#3B82F6" name="요청 수" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>오류 유형별 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={performanceMetrics.errorTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percentage }: any) => `${type}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {performanceMetrics.errorTypes.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
export { UsageStatsCharts };