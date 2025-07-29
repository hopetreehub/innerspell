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
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAdvancedStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
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
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={advancedStats.analytics.topPages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
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
                <Tooltip />
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
              <Progress value={advancedStats.analytics.conversionMetrics.visitorToUser} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">회원 → 리딩</span>
                <span className="text-sm font-medium">{advancedStats.analytics.conversionMetrics.userToReading.toFixed(1)}%</span>
              </div>
              <Progress value={advancedStats.analytics.conversionMetrics.userToReading} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">완료율</span>
                <span className="text-sm font-medium">{advancedStats.analytics.conversionMetrics.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={advancedStats.analytics.conversionMetrics.completionRate} />
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
              {advancedStats.analytics.userGeography.map((region, index) => (
                <div key={region.location} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{region.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{region.count}명</Badge>
                  </div>
                </div>
              ))}
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