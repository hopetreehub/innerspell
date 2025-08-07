'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { LoadingError } from '@/components/ui/error-states';
import { 
  Activity, 
  Users, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Monitor,
  CheckCircle,
  XCircle,
  Server,
  Database,
  Settings,
  TrendingUp,
  TrendingDown,
  Gauge,
  Bell,
  BellOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  getRealTimeStats, 
  getActiveSessions, 
  getRecentActivityLogs, 
  getEnvironmentInfo,
  getAdminPerformanceMetrics,
  getSystemAlerts 
} from '@/actions/usageStatsActions';

export default function RealTimeMonitoringDashboard() {
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5초
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    try {
      const [stats, activeSessions, logs, envInfo, performance, alerts] = await Promise.all([
        getRealTimeStats(),
        getActiveSessions(),
        getRecentActivityLogs(15),
        getEnvironmentInfo(),
        getAdminPerformanceMetrics(),
        getSystemAlerts()
      ]);
      
      setRealTimeData(stats);
      setSessions(activeSessions);
      setActivityLogs(logs);
      setEnvironmentInfo(envInfo);
      setPerformanceMetrics(performance);
      setSystemAlerts(alerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load real-time data:', error);
      setError(error instanceof Error ? error.message : '실시간 데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // 알림 확인
  useEffect(() => {
    if (alertsEnabled && systemAlerts?.length > 0) {
      const criticalAlerts = systemAlerts.filter(alert => alert.severity === 'critical');
      if (criticalAlerts.length > 0) {
        // 여기서 브라우저 알림을 띄울 수 있음
        console.warn('Critical system alerts detected:', criticalAlerts);
      }
    }
  }, [systemAlerts, alertsEnabled]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (metric: string, value: number) => {
    const thresholds = {
      responseTime: { good: 500, warning: 1000 },
      errorRate: { good: 1, warning: 5 },
      cpuUsage: { good: 50, warning: 80 }
    };
    
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';
    
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.warning) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !realTimeData) {
    return <LoadingError resource="실시간 모니터링 데이터" onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 제어 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">실시간 모니터링</h2>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(realTimeData?.systemStatus || 'healthy')}>
              <Server className="h-3 w-3 mr-1" />
              시스템 {realTimeData?.systemStatus === 'healthy' ? '정상' : realTimeData?.systemStatus === 'warning' ? '주의' : '위험'}
            </Badge>
            {environmentInfo?.usingMockData && (
              <Badge variant="destructive">
                <Database className="h-3 w-3 mr-1" />
                Mock 데이터
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={1000}>1초</option>
            <option value={3000}>3초</option>
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            {alertsEnabled ? (
              <>
                <Bell className="h-4 w-4 mr-1" />
                알림 ON
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-1" />
                알림 OFF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <>
                <Wifi className="h-4 w-4 mr-1" />
                자동 새로고침 ON
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 mr-1" />
                자동 새로고침 OFF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            새로고침
          </Button>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-sm text-muted-foreground">
          마지막 업데이트: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })}
        </p>
      )}

      {/* 시스템 알림 */}
      {systemAlerts && systemAlerts.length > 0 && (
        <div className="space-y-2">
          {systemAlerts.filter(alert => alert.severity === 'critical').map((alert) => (
            <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">{alert.title}</span>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <p className="text-sm text-red-700 mt-1">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* 실시간 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">현재 접속 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 세션</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">진행 중인 세션</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 리딩</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData?.todayReadings || 0}</div>
            <p className="text-xs text-muted-foreground">타로 & 꿈해석</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor('responseTime', realTimeData?.avgResponseTime || 0)}`}>
              {realTimeData?.avgResponseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">API 응답속도</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오류율</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor('errorRate', performanceMetrics?.errorRate || 0)}`}>
              {performanceMetrics?.errorRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">시스템 오류율</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리량</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics?.requestsPerMinute || 0}</div>
            <p className="text-xs text-muted-foreground">분당 요청 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 활성 세션 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>활성 세션</CardTitle>
            <CardDescription>현재 진행 중인 사용자 세션</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    현재 활성 세션이 없습니다.
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{session.userId}</span>
                        </div>
                        <Badge variant="secondary">
                          {formatDuration(session.duration)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>현재 페이지: <span className="text-foreground">{session.currentPage}</span></div>
                        <div>마지막 활동: <span className="text-foreground">{session.lastActivity}</span></div>
                        <div>시작 시간: {new Date(session.startTime).toLocaleTimeString('ko-KR')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 최근 활동 로그 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동 로그</CardTitle>
            <CardDescription>실시간 사용자 활동 및 시스템 이벤트</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    최근 활동 로그가 없습니다.
                  </p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getLogStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{log.action}</p>
                          <time className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { 
                              addSuffix: true, 
                              locale: ko 
                            })}
                          </time>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          사용자: {log.userId} • {log.details}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 표시기 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 성능 대시보드</CardTitle>
          <CardDescription>실시간 시스템 성능 지표 및 상태 모니터링</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">시스템 상태</span>
                <Badge className={getStatusColor(realTimeData?.systemStatus || 'healthy')}>
                  {realTimeData?.systemStatus === 'healthy' ? '정상' : 
                   realTimeData?.systemStatus === 'warning' ? '주의' : '위험'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {environmentInfo?.usingMockData 
                  ? 'Mock 데이터 모드로 실행 중' 
                  : '모든 서비스가 정상적으로 작동 중입니다.'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">메모리 사용률</span>
                <span className="text-sm">{performanceMetrics?.memoryUsage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${performanceMetrics?.memoryUsage || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU 사용률</span>
                <span className={`text-sm font-bold ${getPerformanceColor('cpuUsage', performanceMetrics?.cpuUsage || 0)}`}>
                  {performanceMetrics?.cpuUsage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getPerformanceColor('cpuUsage', performanceMetrics?.cpuUsage || 0).includes('green') 
                      ? 'bg-green-500' 
                      : getPerformanceColor('cpuUsage', performanceMetrics?.cpuUsage || 0).includes('orange')
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${performanceMetrics?.cpuUsage || 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API 응답시간</span>
                <span className={`text-sm font-bold ${getPerformanceColor('responseTime', realTimeData?.avgResponseTime || 0)}`}>
                  {realTimeData?.avgResponseTime || 0}ms
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getPerformanceColor('responseTime', realTimeData?.avgResponseTime || 0).includes('green') 
                      ? 'bg-green-500' 
                      : getPerformanceColor('responseTime', realTimeData?.avgResponseTime || 0).includes('orange')
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, ((realTimeData?.avgResponseTime || 0) / 2000) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                목표: 500ms 이하 | 경고: 1000ms 이상
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">동시 연결</span>
                <span className="text-sm">{realTimeData?.activeUsers || 0} / 1000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((realTimeData?.activeUsers || 0) / 1000) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                최대 동시 접속: 1000명
              </div>
            </div>
          </div>

          {/* 추가 성능 메트릭 */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium mb-3">상세 성능 지표</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">{performanceMetrics?.totalRequests || 0}</div>
                <div className="text-muted-foreground">오늘 총 요청</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{performanceMetrics?.successRate || 0}%</div>
                <div className="text-muted-foreground">성공률</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{performanceMetrics?.averageSessionDuration || 0}분</div>
                <div className="text-muted-foreground">평균 세션 시간</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{realTimeData?.peakConcurrentUsers || 0}</div>
                <div className="text-muted-foreground">최대 동시 사용자</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 기존 함수도 export로 유지 (호환성을 위해)
export { RealTimeMonitoringDashboard };