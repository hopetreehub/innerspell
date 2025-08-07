import { 
  UsageStats, 
  UserActivity, 
  RealTimeStats,
  ActiveSession,
  PerformanceMetrics,
  SystemAlert
} from '@/types/admin';
import * as fileService from './usage-stats-file';
import { getUsageStats, getRecentActivities } from './usage-stats-service';

/**
 * 활성 세션 관리
 */
class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, ActiveSession> = new Map();
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  startSession(userId: string, source: string = 'web'): void {
    const session: ActiveSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      currentPage: '/',
      duration: 0,
      source
    };
    
    this.sessions.set(session.id, session);
    
    // 30분 후 자동 세션 만료
    setTimeout(() => {
      this.endSession(session.id);
    }, 30 * 60 * 1000);
  }
  
  updateSession(sessionId: string, currentPage: string, activity?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.currentPage = currentPage;
      session.duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
      
      if (activity) {
        session.lastActivityType = activity;
      }
    }
  }
  
  endSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
  
  getActiveSessions(): ActiveSession[] {
    const now = Date.now();
    const activeSessions: ActiveSession[] = [];
    
    // 비활성 세션 정리 (15분 이상 활동 없음)
    for (const [id, session] of this.sessions) {
      const inactiveTime = now - session.lastActivity.getTime();
      if (inactiveTime > 15 * 60 * 1000) {
        this.sessions.delete(id);
      } else {
        session.duration = Math.floor((now - session.startTime.getTime()) / 1000);
        activeSessions.push(session);
      }
    }
    
    return activeSessions;
  }
  
  getActiveUserCount(): number {
    const uniqueUsers = new Set(
      Array.from(this.sessions.values()).map(s => s.userId)
    );
    return uniqueUsers.size;
  }
}

/**
 * 실시간 통계 가져오기
 */
export async function getRealTimeStats(): Promise<RealTimeStats> {
  const sessionManager = SessionManager.getInstance();
  const stats = await getUsageStats();
  const recentActivities = await getRecentActivities(10);
  
  // 오늘의 활동 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = recentActivities.filter(
    activity => new Date(activity.timestamp) >= today
  );
  
  const todayReadings = todayActivities.filter(
    activity => activity.action === 'tarot_reading' || activity.action === 'dream_interpretation'
  ).length;
  
  // 평균 응답시간 계산 (Mock 데이터)
  const avgResponseTime = 200 + Math.random() * 300; // 200-500ms
  
  return {
    activeUsers: sessionManager.getActiveUserCount(),
    activeSessions: sessionManager.getActiveSessions().length,
    todayReadings,
    avgResponseTime: Math.round(avgResponseTime),
    systemStatus: avgResponseTime > 1000 ? 'warning' : 'healthy',
    lastUpdated: new Date(),
    peakConcurrentUsers: Math.max(sessionManager.getActiveUserCount(), 15)
  };
}

/**
 * 활성 세션 목록 가져오기
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const sessionManager = SessionManager.getInstance();
  const sessions = sessionManager.getActiveSessions();
  
  // 세션이 없으면 Mock 데이터 생성
  if (sessions.length === 0 && process.env.NODE_ENV === 'development') {
    const mockSessions: ActiveSession[] = [];
    const mockUsers = ['김철수', '이영희', '박민수', '정수진', '최진우'];
    const mockPages = ['/reading', '/blog', '/dream', '/tarot/yes-no', '/'];
    const mockActivities = ['페이지 보기', '타로 리딩', '블로그 읽기', '꿈 해석'];
    
    // 2-5개의 Mock 세션 생성
    const sessionCount = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < sessionCount; i++) {
      const startTime = new Date(Date.now() - Math.random() * 30 * 60 * 1000); // 0-30분 전
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      
      mockSessions.push({
        id: `mock-session-${i}`,
        userId: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        startTime,
        lastActivity: new Date(Date.now() - Math.random() * 5 * 60 * 1000), // 0-5분 전
        currentPage: mockPages[Math.floor(Math.random() * mockPages.length)],
        duration,
        source: 'web',
        lastActivityType: mockActivities[Math.floor(Math.random() * mockActivities.length)]
      });
    }
    
    return mockSessions;
  }
  
  return sessions;
}

/**
 * 환경 정보 가져오기
 */
export async function getEnvironmentInfo(): Promise<{
  nodeEnv: string;
  usingMockData: boolean;
  fileStorageEnabled: boolean;
  buildVersion: string;
  serverUptime: number;
}> {
  const isFileStorageEnabled = process.env.NODE_ENV === 'development' && 
    (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
     process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
     process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');
     
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    usingMockData: process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true',
    fileStorageEnabled: isFileStorageEnabled,
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0',
    serverUptime: process.uptime ? process.uptime() : 0
  };
}

/**
 * 성능 메트릭 가져오기
 */
export async function getAdminPerformanceMetrics(): Promise<PerformanceMetrics> {
  // 실시간 성능 메트릭 (Mock 데이터)
  const baseResponseTime = 350;
  const baseErrorRate = 0.5;
  const baseCpuUsage = 30;
  
  // 시간대별 변동 추가
  const hour = new Date().getHours();
  const hourMultiplier = 1 + Math.sin((hour - 12) * Math.PI / 12) * 0.3; // 낮 시간대 높음
  
  return {
    averageResponseTime: Math.round(baseResponseTime * hourMultiplier),
    successRate: 99.5 - baseErrorRate,
    totalRequests: Math.floor(3000 + Math.random() * 1000),
    errorRate: baseErrorRate + Math.random() * 0.5,
    requestsPerMinute: Math.floor(40 + Math.random() * 20),
    memoryUsage: Math.floor(50 + Math.random() * 20),
    cpuUsage: Math.floor(baseCpuUsage * hourMultiplier + Math.random() * 10),
    averageSessionDuration: 8 + Math.random() * 4
  };
}

/**
 * 시스템 알림 가져오기
 */
export async function getSystemAlerts(): Promise<SystemAlert[]> {
  const alerts: SystemAlert[] = [];
  const metrics = await getAdminPerformanceMetrics();
  
  // 성능 기반 알림 생성
  if (metrics.averageResponseTime > 1000) {
    alerts.push({
      id: `alert-response-${Date.now()}`,
      title: '높은 응답 시간 감지',
      message: `평균 응답 시간이 ${metrics.averageResponseTime}ms로 임계값을 초과했습니다.`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }
  
  if (metrics.errorRate > 2) {
    alerts.push({
      id: `alert-error-${Date.now()}`,
      title: '에러율 증가',
      message: `에러율이 ${metrics.errorRate.toFixed(1)}%로 증가했습니다.`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }
  
  if (metrics.cpuUsage > 80) {
    alerts.push({
      id: `alert-cpu-${Date.now()}`,
      title: 'CPU 사용량 높음',
      message: `CPU 사용량이 ${metrics.cpuUsage}%에 도달했습니다.`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }
  
  if (metrics.memoryUsage > 75) {
    alerts.push({
      id: `alert-memory-${Date.now()}`,
      title: '메모리 사용량 주의',
      message: `메모리 사용량이 ${metrics.memoryUsage}%에 도달했습니다.`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }
  
  return alerts;
}

/**
 * 세션 시작 기록
 */
export async function startUserSession(userId: string, source: string = 'web'): void {
  const sessionManager = SessionManager.getInstance();
  sessionManager.startSession(userId, source);
  
  // 활동 기록
  await fileService.recordUserActivity({
    userId,
    action: 'session_start',
    details: { source }
  });
}

/**
 * 세션 업데이트
 */
export function updateUserSession(sessionId: string, currentPage: string, activity?: string): void {
  const sessionManager = SessionManager.getInstance();
  sessionManager.updateSession(sessionId, currentPage, activity);
}

/**
 * 세션 종료
 */
export async function endUserSession(sessionId: string, userId: string): Promise<void> {
  const sessionManager = SessionManager.getInstance();
  const sessions = sessionManager.getActiveSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (session) {
    // 세션 종료 전 활동 기록
    await fileService.recordUserActivity({
      userId,
      action: 'session_end',
      details: { 
        duration: session.duration,
        lastPage: session.currentPage 
      }
    });
    
    sessionManager.endSession(sessionId);
  }
}