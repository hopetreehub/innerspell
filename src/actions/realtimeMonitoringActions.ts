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
    activeSessions: realtimeData.activeUsers.filter(u => u.status === 'active').length,
    todayReadings: realtimeData.todayStats.readings,
    avgResponseTime: Math.floor(Math.random() * 500) + 200, // Mock response time
    systemStatus: 'healthy' as const,
    peakConcurrentUsers: realtimeData.todayStats.peakConcurrentUsers
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
  
  return realtimeData.activeUsers.map((user, index) => {
    const duration = Date.now() - user.lastActivity.getTime();
    return {
      id: `session-${user.userId}-${Date.now()}`,
      userId: user.userId,
      currentPage: user.currentPage || '/tarot',
      lastActivity: user.status === 'active' ? '페이지 보기' : '대기 중',
      duration: Math.floor(duration / 1000), // 초 단위
      startTime: new Date(user.lastActivity.getTime() - duration).toISOString()
    };
  });
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
  const activities = realtimeData.activeUsers
    .slice(0, Math.min(limit, 5))
    .map((user, index) => {
      const actions = [
        '타로 카드 선택',
        '타로 해석 요청',
        '꿈 해석 작성',
        '블로그 글 읽기',
        '커뮤니티 글 작성'
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      return {
        id: `log-${Date.now()}-${index}`,
        userId: user.userId,
        action: randomAction,
        details: {
          page: user.currentPage,
          status: user.status
        },
        timestamp: user.lastActivity.toISOString(),
        status: user.status === 'active' ? 'success' : 'info'
      };
    });
    
  // 추가 목업 활동 로그
  const mockActivities = [
    {
      id: `log-${Date.now()}-mock1`,
      userId: 'user-system',
      action: '시스템 상태 점검',
      details: { status: 'completed' },
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5분 전
      status: 'success'
    },
    {
      id: `log-${Date.now()}-mock2`,
      userId: 'user-guest-123',
      action: '회원 가입 완료',
      details: { referrer: 'google' },
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10분 전
      status: 'success'
    }
  ];
  
  return [...activities, ...mockActivities].slice(0, limit);
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
  
  // Mock 성능 데이터 (실제 Firebase 연결 시 실제 데이터로 대체됨)
  return {
    cpuUsage: 35 + Math.floor(Math.random() * 20), // 35-55%
    memoryUsage: 50 + Math.floor(Math.random() * 20), // 50-70%
    errorRate: Math.random() * 2, // 0-2%
    requestsPerMinute: 60 + Math.floor(Math.random() * 40), // 60-100
    totalRequests: 8543 + Math.floor(Math.random() * 1000),
    successRate: 98 + Math.random() * 2, // 98-100%
    averageSessionDuration: Math.floor(Math.random() * 15) + 5, // 5-20분
    hourlyResponseTimes: Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString(),
      responseTime: 200 + Math.floor(Math.random() * 300) // 200-500ms
    })),
    endpointUsage: [
      { endpoint: '/api/tarot', requests: 432 },
      { endpoint: '/api/dream', requests: 267 },
      { endpoint: '/api/auth', requests: 189 },
      { endpoint: '/api/blog', requests: 156 }
    ],
    errorTypes: [
      { type: '400 Bad Request', count: 12, percentage: 40 },
      { type: '401 Unauthorized', count: 8, percentage: 27 },
      { type: '500 Server Error', count: 5, percentage: 17 },
      { type: '503 Service Unavailable', count: 5, percentage: 17 }
    ]
  };
}

// 시스템 알림 가져오기
export async function getSystemAlerts() {
  const { authenticated } = await checkAuth();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
  
  // Mock 알림 데이터
  const alerts = [];
  
  // 현재 Mock 데이터 사용 중 알림
  if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    alerts.push({
      id: 'mock-data-mode',
      severity: 'info' as const,
      title: 'Mock 데이터 모드',
      message: 'Firebase 서비스 계정이 설정되지 않아 Mock 데이터를 사용 중입니다.',
      timestamp: new Date().toISOString()
    });
  }
  
  // 랜덤하게 알림 생성 (데모용)
  const random = Math.random();
  if (random > 0.7) {
    alerts.push({
      id: 'high-traffic',
      severity: 'warning' as const,
      title: '트래픽 증가 감지',
      message: '현재 평소보다 30% 높은 트래픽이 감지되었습니다.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5분 전
    });
  }
  
  return alerts;
}