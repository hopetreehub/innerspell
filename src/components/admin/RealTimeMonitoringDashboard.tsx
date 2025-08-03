'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Cpu,
  HardDrive
} from 'lucide-react';
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';
import { RealTimeAlerts } from '@/components/admin/RealTimeAlerts';
import { AdvancedMonitoringDashboard } from '@/components/admin/AdvancedMonitoringDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function RealTimeMonitoringDashboard() {
  const { data, connected, error, lastUpdate, reconnect, hasError } = useRealTimeMonitoring();
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'advanced'>('overview');

  // 연결 상태 표시
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center space-x-1">
        {connected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-green-600 border-green-600">
              실시간 연결됨
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="text-red-600 border-red-600">
              연결 끊김
            </Badge>
          </>
        )}
      </div>
      
      {lastUpdate && (
        <span className="text-sm text-muted-foreground">
          마지막 업데이트: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })}
        </span>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={reconnect}
        disabled={connected}
        className="ml-auto"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        재연결
      </Button>
    </div>
  );

  // 오류 표시
  if (hasError) {
    return (
      <div className="space-y-4">
        <ConnectionStatus />
        <Alert className="border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            실시간 모니터링 연결 오류: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 로딩 중 표시
  if (!data) {
    return (
      <div className="space-y-4">
        <ConnectionStatus />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">실시간 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ConnectionStatus />
        <div className="flex gap-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('overview')}
          >
            실시간 개요
          </Button>
          <Button
            variant={activeView === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('advanced')}
          >
            고급 분석
          </Button>
        </div>
      </div>
      
      {activeView === 'advanced' ? (
        <AdvancedMonitoringDashboard />
      ) : (
        <div className="space-y-6">
      
      {/* 실시간 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실시간 활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.stats.totalActiveUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              현재 접속 중
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">타로 리딩</CardTitle>
            <Zap className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.stats.currentTarotReadings}
            </div>
            <p className="text-xs text-muted-foreground">
              최근 5분간
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">꿈해몽</CardTitle>
            <Activity className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.stats.currentDreamInterpretations}
            </div>
            <p className="text-xs text-muted-foreground">
              최근 5분간
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
            <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(data.stats.averageResponseTime)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              서버 응답시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 성능 */}
      {(data.stats.memoryUsage !== undefined || data.stats.cpuUsage !== undefined) && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">메모리 사용률</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats.memoryUsage ? `${Math.round(data.stats.memoryUsage)}%` : 'N/A'}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.stats.memoryUsage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU 사용률</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats.cpuUsage ? `${Math.round(data.stats.cpuUsage)}%` : 'N/A'}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.stats.cpuUsage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오류율</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats.errorRate?.toFixed(2) || '0.00'}%
              </div>
              <p className="text-xs text-muted-foreground">
                최근 5분간
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 실시간 알림 시스템 */}
      <RealTimeAlerts 
        stats={data?.stats ? {
          ...data.stats,
          errorRate: data.stats.errorRate ?? 0
        } : undefined} 
        recentEvents={data?.recentEvents} 
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 활성 사용자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              활성 사용자 ({data.activeUsers.length})
            </CardTitle>
            <CardDescription>
              현재 접속 중인 사용자들
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.activeUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  현재 활성 사용자가 없습니다.
                </p>
              ) : (
                data.activeUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">사용자 {user.userId.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">{user.page || '알 수 없음'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true, locale: ko })}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 최근 이벤트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  실시간 이벤트
                </CardTitle>
                <CardDescription>
                  최근 사용자 활동
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {autoScroll ? '자동스크롤 ON' : '자동스크롤 OFF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 max-h-64 overflow-y-auto ${autoScroll ? 'scroll-smooth' : ''}`}>
              {data.recentEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  최근 이벤트가 없습니다.
                </p>
              ) : (
                data.recentEvents.slice().reverse().map((event) => (
                  <div key={event.id} className="flex items-start space-x-2 p-2 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {getEventDescription(event.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        사용자: {event.userId.slice(-6)} • {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: ko })}
                      </p>
                      {event.details.page && (
                        <p className="text-xs text-muted-foreground">
                          페이지: {event.details.page}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      )}
    </div>
  );
}

// 이벤트 타입별 아이콘
function getEventIcon(type: string) {
  switch (type) {
    case 'tarot_reading':
      return <Zap className="h-4 w-4 text-purple-500" />;
    case 'dream_interpretation':
      return <Activity className="h-4 w-4 text-green-500" />;
    case 'page_view':
      return <Eye className="h-4 w-4 text-blue-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'user_action':
      return <Monitor className="h-4 w-4 text-gray-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
}

// 이벤트 타입별 설명
function getEventDescription(type: string) {
  switch (type) {
    case 'tarot_reading':
      return '타로 리딩 시작';
    case 'dream_interpretation':
      return '꿈해몽 시작';
    case 'page_view':
      return '페이지 방문';
    case 'error':
      return '오류 발생';
    case 'user_action':
      return '사용자 활동';
    default:
      return '알 수 없는 이벤트';
  }
}