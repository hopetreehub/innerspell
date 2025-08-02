'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X,
  Bell,
  BellOff
} from 'lucide-react';

interface AlertData {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  data?: Record<string, any>;
}

interface RealTimeAlertsProps {
  stats?: {
    totalActiveUsers: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  recentEvents?: Array<{
    type: string;
    timestamp: string;
    details: any;
  }>;
}

// 임계값 설정 - 컴포넌트 외부에 정의하여 재생성 방지
const THRESHOLDS = {
  responseTime: 2000, // 2초
  errorRate: 5, // 5%
  memoryUsage: 80, // 80%
  cpuUsage: 80, // 80%
  maxActiveUsers: 100
};

export function RealTimeAlerts({ stats, recentEvents }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // 통계 기반 알림 생성
  useEffect(() => {
    if (!stats || !alertsEnabled) return;

    const newAlerts: AlertData[] = [];

    // 응답 시간 알림
    if (stats.averageResponseTime > THRESHOLDS.responseTime) {
      newAlerts.push({
        id: `response-time-${Date.now()}`,
        type: 'warning',
        title: '응답 시간 지연',
        message: `평균 응답 시간이 ${Math.round(stats.averageResponseTime)}ms로 임계값(${THRESHOLDS.responseTime}ms)을 초과했습니다.`,
        timestamp: new Date(),
        dismissed: false,
        data: { responseTime: stats.averageResponseTime }
      });
    }

    // 오류율 알림
    if (stats.errorRate > THRESHOLDS.errorRate) {
      newAlerts.push({
        id: `error-rate-${Date.now()}`,
        type: 'error',
        title: '높은 오류율 감지',
        message: `오류율이 ${stats.errorRate.toFixed(2)}%로 임계값(${THRESHOLDS.errorRate}%)을 초과했습니다.`,
        timestamp: new Date(),
        dismissed: false,
        data: { errorRate: stats.errorRate }
      });
    }

    // 메모리 사용량 알림
    if (stats.memoryUsage && stats.memoryUsage > THRESHOLDS.memoryUsage) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        title: '높은 메모리 사용량',
        message: `메모리 사용량이 ${Math.round(stats.memoryUsage)}%로 임계값(${THRESHOLDS.memoryUsage}%)을 초과했습니다.`,
        timestamp: new Date(),
        dismissed: false,
        data: { memoryUsage: stats.memoryUsage }
      });
    }

    // CPU 사용량 알림
    if (stats.cpuUsage && stats.cpuUsage > THRESHOLDS.cpuUsage) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        title: '높은 CPU 사용량',
        message: `CPU 사용량이 ${Math.round(stats.cpuUsage)}%로 임계값(${THRESHOLDS.cpuUsage}%)을 초과했습니다.`,
        timestamp: new Date(),
        dismissed: false,
        data: { cpuUsage: stats.cpuUsage }
      });
    }

    // 활성 사용자 수 알림
    if (stats.totalActiveUsers > THRESHOLDS.maxActiveUsers) {
      newAlerts.push({
        id: `users-${Date.now()}`,
        type: 'info',
        title: '높은 사용자 활동',
        message: `현재 활성 사용자 수가 ${stats.totalActiveUsers}명으로 평상시보다 높습니다.`,
        timestamp: new Date(),
        dismissed: false,
        data: { activeUsers: stats.totalActiveUsers }
      });
    }

    // 새로운 알림이 있으면 추가
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // 중복 알림 제거 (같은 타입의 최근 알림이 있으면 무시)
        const filteredNewAlerts = newAlerts.filter(newAlert => {
          const recentSimilar = prev.find(existingAlert => 
            existingAlert.id.startsWith(newAlert.id.split('-')[0]) &&
            new Date().getTime() - existingAlert.timestamp.getTime() < 60000 // 1분 내
          );
          return !recentSimilar;
        });

        if (filteredNewAlerts.length > 0 && soundEnabled) {
          // 브라우저 알림음 재생
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // 알림음 재생 실패는 무시
            });
          } catch (error) {
            // 오디오 재생 실패 무시
          }
        }

        return [...prev, ...filteredNewAlerts].slice(-50); // 최대 50개만 유지
      });
    }
  }, [stats, alertsEnabled, soundEnabled]);

  // 이벤트 기반 알림 생성
  useEffect(() => {
    if (!recentEvents || !alertsEnabled) return;

    recentEvents.forEach(event => {
      if (event.type === 'error') {
        const errorAlert: AlertData = {
          id: `event-error-${Date.now()}-${Math.random()}`,
          type: 'error',
          title: '사용자 오류 발생',
          message: event.details.message || '알 수 없는 오류가 발생했습니다.',
          timestamp: new Date(event.timestamp),
          dismissed: false,
          data: event.details
        };

        setAlerts(prev => [...prev, errorAlert].slice(-50));
      }
    });
  }, [recentEvents, alertsEnabled]);

  // 알림 닫기
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  // 모든 알림 닫기
  const dismissAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })));
  };

  // 알림 아이콘 가져오기
  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // 활성 알림 (닫히지 않은 알림)
  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const recentAlerts = alerts.slice(-10); // 최근 10개

  return (
    <div className="space-y-4">
      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              알림 설정
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeAlerts.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
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
                onClick={() => setSoundEnabled(!soundEnabled)}
                disabled={!alertsEnabled}
              >
                {soundEnabled ? '🔊 사운드 ON' : '🔇 사운드 OFF'}
              </Button>

              {activeAlerts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissAllAlerts}
                >
                  모두 닫기
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {alertsEnabled && (
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>• 응답 시간: {THRESHOLDS.responseTime}ms 초과 시 경고</p>
              <p>• 오류율: {THRESHOLDS.errorRate}% 초과 시 경고</p>
              <p>• 메모리/CPU: {THRESHOLDS.memoryUsage}% 초과 시 경고</p>
              <p>• 활성 사용자: {THRESHOLDS.maxActiveUsers}명 초과 시 정보</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 활성 알림 */}
      {alertsEnabled && activeAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">활성 알림</h3>
          {activeAlerts.map(alert => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
              alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              alert.type === 'info' ? 'border-l-blue-500 bg-blue-50' :
              'border-l-green-500 bg-green-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {getAlertIcon(alert.type)}
                  <div>
                    <AlertTitle className="text-sm font-medium">
                      {alert.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* 최근 알림 히스토리 */}
      {alertsEnabled && recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">최근 알림 히스토리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentAlerts.slice().reverse().map(alert => (
                <div key={alert.id} className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                  alert.dismissed ? 'bg-muted/30 opacity-60' : 'bg-muted/50'
                }`}>
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleString('ko-KR')}
                    </p>
                  </div>
                  {alert.dismissed ? (
                    <Badge variant="outline" className="text-xs">닫힘</Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">활성</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 알림이 없을 때 */}
      {alertsEnabled && activeAlerts.length === 0 && recentAlerts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>현재 활성 알림이 없습니다.</p>
          <p className="text-sm">시스템이 정상적으로 작동 중입니다.</p>
        </div>
      )}
    </div>
  );
}