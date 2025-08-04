
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Server, Database, BrainCircuit, CheckCircle, AlertTriangle, Info, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnvironmentManager } from './EnvironmentManager';
import React, { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
  name: string;
  status: string;
  icon: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  details?: string;
  lastCheck?: string;
}

interface SystemLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'AI_GEN' | 'ADMIN' | 'SYSTEM';
  message: string;
  source?: string;
}

interface SystemHealthData {
  statuses: SystemStatus[];
  logs: SystemLog[];
  timestamp: string;
  error?: string;
}

// 아이콘 매핑 함수
const getIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Server': <Server className="h-5 w-5" />,
    'Database': <Database className="h-5 w-5" />,
    'BrainCircuit': <BrainCircuit className="h-5 w-5" />,
    'CheckCircle': <CheckCircle className="h-5 w-5" />,
    'Info': <Info className="h-5 w-5" />,
    'AlertTriangle': <AlertTriangle className="h-5 w-5" />
  };
  return iconMap[iconName] || <Monitor className="h-5 w-5" />;
};

// 로그 레벨별 색상 함수
const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'ERROR': return 'text-red-500';
    case 'WARN': return 'text-yellow-500';
    case 'AI_GEN': return 'text-blue-500';
    case 'ADMIN': return 'text-purple-500';
    case 'SYSTEM': return 'text-green-500';
    case 'INFO':
    default: return 'text-foreground/70';
  }
};


export function SystemManagement() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 시스템 상태 데이터 가져오기
  const fetchSystemHealth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/system-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SystemHealthData = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setError(err instanceof Error ? err.message : '시스템 상태를 가져오는데 실패했습니다.');
      
      // 오류 시 기본 상태 설정
      setHealthData({
        statuses: [
          {
            name: "시스템 상태 확인",
            status: "확인 실패",
            icon: "AlertTriangle",
            variant: "destructive",
            details: "상태 확인 API에 연결할 수 없습니다."
          }
        ],
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message: '시스템 상태 확인 실패',
            source: 'system-monitor'
          }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSystemHealth();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6" /> 시스템 관리
        </CardTitle>
        <CardDescription>
          시스템 상태, 환경변수, 모니터링 등을 관리합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">시스템 상태</TabsTrigger>
            <TabsTrigger value="environment">환경변수</TabsTrigger>
            <TabsTrigger value="monitoring">모니터링</TabsTrigger>
            <TabsTrigger value="logs">로그</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground/90">시스템 상태 개요</h3>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
                </span>
              )}
              <button
                onClick={fetchSystemHealth}
                disabled={isLoading}
                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLoading ? '확인 중...' : '새로고침'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">연결 오류</span>
              </div>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading && !healthData ? (
              <div className="col-span-2 text-center py-8">
                <Monitor className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">시스템 상태 확인 중...</p>
              </div>
            ) : (
              healthData?.statuses.map((item) => {
                const getStatusColor = (status: string) => {
                  if (status.includes('Online') || status.includes('Connected') || 
                      status.includes('Success') || status.includes('Operational') || status === '없음') {
                    return 'text-green-500';
                  }
                  if (status.includes('Failed') || status.includes('Error') || item.variant === 'destructive') {
                    return 'text-red-500';
                  }
                  if (status.includes('Idle') || item.variant === 'secondary') {
                    return 'text-yellow-500';
                  }
                  return 'text-blue-500';
                };
                
                const getBadgeClass = (status: string, variant: string) => {
                  if (status.includes('Online') || status.includes('Connected') || 
                      status.includes('Success') || status.includes('Operational') || status === '없음') {
                    return 'bg-green-500/10 text-green-700 border-green-500/30';
                  }
                  if (status.includes('Failed') || status.includes('Error') || variant === 'destructive') {
                    return 'bg-red-500/10 text-red-700 border-red-500/30';
                  }
                  if (status.includes('Idle') || variant === 'secondary') {
                    return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
                  }
                  return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
                };
                
                return (
                  <Card key={item.name} className="p-4 bg-card/70 border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={getStatusColor(item.status)}>
                          {getIcon(item.icon)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground/80">{item.name}</p>
                          {item.details && (
                            <p className="text-xs text-muted-foreground">{item.details}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={item.variant} className={getBadgeClass(item.status, item.variant)}>
                        {item.status}
                      </Badge>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
          </TabsContent>

          <TabsContent value="environment">
            <EnvironmentManager />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">모니터링 대시보드</h3>
              <p className="text-muted-foreground">
                성능 메트릭, 사용량 통계, 오류 추적 등의 모니터링 기능이 여기에 표시됩니다.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground/90">시스템 로그</h3>
                <span className="text-xs text-muted-foreground">
                  실시간 로그 (최근 20개)
                </span>
              </div>
              <div className="bg-muted/50 p-3 rounded-md max-h-48 overflow-y-auto text-xs font-mono">
                {isLoading && !healthData ? (
                  <p className="text-muted-foreground">로그를 불러오는 중...</p>
                ) : healthData?.logs && healthData.logs.length > 0 ? (
                  healthData.logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-muted-foreground">
                        [{new Date(log.timestamp).toLocaleString('ko-KR')}]
                      </span>
                      <span className={`ml-2 font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level}:
                      </span>
                      <span className="ml-1 text-foreground/70">
                        {log.message}
                      </span>
                      {log.source && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({log.source})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">로그 데이터가 없습니다.</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                실시간 Firebase 활동 및 시스템 이벤트 로그입니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
