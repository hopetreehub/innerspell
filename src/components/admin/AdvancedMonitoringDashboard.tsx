'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Database, 
  Globe, 
  Smartphone, 
  Monitor,
  Wifi,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdvancedStats {
  serverMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    activeConnections: number;
    requestsPerMinute: number;
  };
  analytics: {
    topPages: Array<{ page: string; views: number }>;
    userGeography: Array<{ location: string; count: number }>;
    deviceTypes: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    conversionMetrics: {
      visitorToUser: number;
      userToReading: number;
      completionRate: number;
    };
  };
  timestamp: string;
}

export function AdvancedMonitoringDashboard() {
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAdvancedStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/realtime', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdvancedStats({
          serverMetrics: data.serverMetrics,
          analytics: data.analytics,
          timestamp: data.timestamp
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch advanced stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedStats();
    const interval = setInterval(fetchAdvancedStats, 10000); // 10초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'danger';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const DEVICE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981'];

  if (loading || !advancedStats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const deviceData = [
    { name: 'Mobile', value: advancedStats.analytics.deviceTypes.mobile, color: DEVICE_COLORS[0] },
    { name: 'Desktop', value: advancedStats.analytics.deviceTypes.desktop, color: DEVICE_COLORS[1] },
    { name: 'Tablet', value: advancedStats.analytics.deviceTypes.tablet, color: DEVICE_COLORS[2] }
  ];

  return (
    <div className="space-y-8">
      {/* 새로고침 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">고급 모니터링 대시보드</h3>
          <p className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdate ? lastUpdate.toLocaleTimeString('ko-KR') : '알 수 없음'}
            {loading && <span className="ml-2 inline-flex items-center">• 업데이트 중...</span>}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAdvancedStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '업데이트 중' : '새로고침'}
        </Button>
      </div>

      {/* 서버 메트릭스 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU 사용률</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(advancedStats.serverMetrics.cpuUsage, { warning: 70, danger: 90 })}`}>
              {Math.round(advancedStats.serverMetrics.cpuUsage)}%
            </div>
            <Progress 
              value={advancedStats.serverMetrics.cpuUsage} 
              className="mt-2" 
              // @ts-ignore
              indicatorClassName={
                getMetricStatus(advancedStats.serverMetrics.cpuUsage, { warning: 70, danger: 90 }) === 'danger' ? 'bg-red-500' :
                getMetricStatus(advancedStats.serverMetrics.cpuUsage, { warning: 70, danger: 90 }) === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              {getMetricStatus(advancedStats.serverMetrics.cpuUsage, { warning: 70, danger: 90 }) === 'healthy' ? '✅ 정상' :
               getMetricStatus(advancedStats.serverMetrics.cpuUsage, { warning: 70, danger: 90 }) === 'warning' ? '⚠️ 주의' : '🚨 위험'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">메모리 사용률</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(advancedStats.serverMetrics.memoryUsage, { warning: 80, danger: 95 })}`}>
              {Math.round(advancedStats.serverMetrics.memoryUsage)}%
            </div>
            <Progress 
              value={advancedStats.serverMetrics.memoryUsage} 
              className="mt-2"
              // @ts-ignore
              indicatorClassName={
                getMetricStatus(advancedStats.serverMetrics.memoryUsage, { warning: 80, danger: 95 }) === 'danger' ? 'bg-red-500' :
                getMetricStatus(advancedStats.serverMetrics.memoryUsage, { warning: 80, danger: 95 }) === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              {getMetricStatus(advancedStats.serverMetrics.memoryUsage, { warning: 80, danger: 95 }) === 'healthy' ? '✅ 정상' :
               getMetricStatus(advancedStats.serverMetrics.memoryUsage, { warning: 80, danger: 95 }) === 'warning' ? '⚠️ 주의' : '🚨 위험'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">네트워크 지연시간</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(advancedStats.serverMetrics.networkLatency, { warning: 100, danger: 200 })}`}>
              {Math.round(advancedStats.serverMetrics.networkLatency)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getMetricStatus(advancedStats.serverMetrics.networkLatency, { warning: 100, danger: 200 }) === 'healthy' ? '✅ 빠름' :
               getMetricStatus(advancedStats.serverMetrics.networkLatency, { warning: 100, danger: 200 }) === 'warning' ? '⚠️ 보통' : '🚨 느림'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 분석 대시보드 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 인기 페이지 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              인기 페이지 (실시간)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advancedStats.analytics.topPages.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={advancedStats.analytics.topPages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="page" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value.length > 8) {
                        return value.substring(0, 8) + '...';
                      }
                      return value;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={["조회수", "페이지"]}
                    labelFormatter={(label) => `페이지: ${label}`}
                  />
                  <Bar dataKey="views" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">페이지 조회 데이터 수집 중...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 디바이스 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              디바이스 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 변환 지표 및 지역 분포 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 변환 지표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              변환 지표
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">방문자 → 회원</span>
                <span className="text-sm font-medium">{advancedStats.analytics.conversionMetrics.visitorToUser.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(advancedStats.analytics.conversionMetrics.visitorToUser, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">웹사이트 방문자 중 회원가입하는 비율</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">회원 → 리딩</span>
                <span className="text-sm font-medium">{Math.min(advancedStats.analytics.conversionMetrics.userToReading, 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(advancedStats.analytics.conversionMetrics.userToReading, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">가입 회원 중 타로/꿈해몽 서비스를 이용하는 비율</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">완료율</span>
                <span className="text-sm font-medium">{advancedStats.analytics.conversionMetrics.completionRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(advancedStats.analytics.conversionMetrics.completionRate, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">시작된 세션 중 성공적으로 결과를 받은 비율</p>
            </div>
          </CardContent>
        </Card>

        {/* 지역별 사용자 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              지역별 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {advancedStats.analytics.userGeography.length > 0 ? (
                advancedStats.analytics.userGeography.slice(0, 6).map((region, index) => (
                  <div key={region.location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary" style={{ 
                        backgroundColor: `hsl(${(index * 360) / advancedStats.analytics.userGeography.length}, 60%, 50%)` 
                      }} />
                      <span className="text-sm">{region.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{region.count}명</Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((region.count / advancedStats.analytics.userGeography.reduce((sum, r) => sum + r.count, 0)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">지역별 데이터 수집 중...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            시스템 상태 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">활성 연결</div>
              <div className="text-2xl font-bold">{advancedStats.serverMetrics.activeConnections}</div>
              <div className="text-xs text-muted-foreground">동시 연결 수</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">분당 요청</div>
              <div className="text-2xl font-bold">{advancedStats.serverMetrics.requestsPerMinute}</div>
              <div className="text-xs text-muted-foreground">API 호출/분</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">디스크 사용률</div>
              <div className="text-2xl font-bold">{Math.round(advancedStats.serverMetrics.diskUsage)}%</div>
              <div className="text-xs text-muted-foreground">저장공간 사용</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}