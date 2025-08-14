'use server';

import { createDataSource } from '@/lib/admin';
import { RealtimeData, SystemStatus } from '@/lib/admin/types/data-source';
import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

// 인증 체크 헬퍼
async function checkAuth(): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return { authenticated: false };
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { authenticated: true, userId: decodedToken.uid };
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

// 실시간 통계 가져오기
export async function getRealTimeStats() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const realtimeData = await dataSource.getRealtimeData();
  
  return {
    activeUsers: realtimeData.activeUsers.length,
    activeSessions: realtimeData.activeSessions,
    todayReadings: realtimeData.todayReadings,
    avgResponseTime: realtimeData.performance.averageResponseTime,
    systemStatus: realtimeData.systemStatus,
    peakConcurrentUsers: realtimeData.peakConcurrentUsers || 0
  };
}

// 활성 세션 가져오기
export async function getActiveSessions() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const realtimeData = await dataSource.getRealtimeData();
  
  return realtimeData.activeUsers.map((user, index) => ({
    id: `session-${user.userId}-${Date.now()}`,
    userId: user.userId,
    currentPage: user.currentPage || '/tarot',
    lastActivity: user.lastActivity.toISOString(),
    duration: Math.floor(Math.random() * 3600), // 임시 duration
    startTime: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
  }));
}

// 최근 활동 로그 가져오기
export async function getRecentActivityLogs(limit: number = 10) {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const realtimeData = await dataSource.getRealtimeData();
  
  // 활성 사용자 정보를 활동 로그 형식으로 변환
  return realtimeData.activeUsers
    .slice(0, limit)
    .map((user, index) => ({
      id: `log-${Date.now()}-${index}`,
      userId: user.userId,
      action: user.status === 'reading' ? '타로 리딩 중' : '페이지 탐색',
      details: {
        page: user.currentPage,
        status: user.status
      },
      timestamp: user.lastActivity.toISOString(),
      status: user.status === 'reading' ? 'success' : 'info'
    }));
}

// 환경 정보 가져오기
export async function getEnvironmentInfo() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const usingMockData = dataSource.constructor.name === 'MockDataSource';
  
  return {
    usingMockData,
    firebaseConfigured: !usingMockData,
    environment: process.env.NODE_ENV || 'development',
    isDevelopment
  };
}

// 성능 메트릭 가져오기
export async function getAdminPerformanceMetrics() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const [realtimeData, systemStatus] = await Promise.all([
    dataSource.getRealtimeData(),
    dataSource.getSystemStatus()
  ]);
  
  return {
    cpuUsage: systemStatus.services.find(s => s.name === 'API Server')?.metrics?.cpuUsage || 45,
    memoryUsage: systemStatus.services.find(s => s.name === 'API Server')?.metrics?.memoryUsage || 62,
    errorRate: systemStatus.performance.errorRate,
    requestsPerMinute: realtimeData.performance.requestsPerMinute,
    totalRequests: realtimeData.performance.totalRequests,
    successRate: 100 - systemStatus.performance.errorRate,
    averageSessionDuration: Math.floor(Math.random() * 15) + 5 // 5-20분
  };
}

// 시스템 알림 가져오기
export async function getSystemAlerts() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  const dataSource = createDataSource();
  const systemStatus = await dataSource.getSystemStatus();
  
  const alerts = [];
  
  // 성능 기반 알림 생성
  if (systemStatus.performance.errorRate > 5) {
    alerts.push({
      id: 'error-rate-high',
      severity: 'critical',
      title: '높은 오류율 감지',
      message: `현재 오류율이 ${systemStatus.performance.errorRate}%로 정상 수준(5%)을 초과했습니다.`,
      timestamp: new Date().toISOString()
    });
  }
  
  if (systemStatus.performance.averageResponseTime > 1000) {
    alerts.push({
      id: 'slow-response',
      severity: 'warning',
      title: '응답 속도 저하',
      message: `평균 응답 시간이 ${systemStatus.performance.averageResponseTime}ms로 느려졌습니다.`,
      timestamp: new Date().toISOString()
    });
  }
  
  // 서비스 상태 기반 알림
  const unhealthyServices = systemStatus.services.filter(s => s.status !== 'healthy');
  unhealthyServices.forEach(service => {
    alerts.push({
      id: `service-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
      severity: service.status === 'down' ? 'critical' : 'warning',
      title: `${service.name} 서비스 문제`,
      message: service.message,
      timestamp: new Date().toISOString()
    });
  });
  
  return alerts;
}