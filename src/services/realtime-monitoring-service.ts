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
  
  // 데모 모드인지 확인
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true';
  
  // 오늘의 활동 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivities = recentActivities.filter(
    activity => new Date(activity.timestamp) >= today
  );
  
  const todayReadings = todayActivities.filter(
    activity => activity.action === 'tarot_reading' || activity.action === 'dream_interpretation'
  ).length;
  
  // 데모 모드일 때 샘플 데이터 반환
  if (isDemoMode) {
    return {
      activeUsers: 12,
      activeSessions: 8,
      todayReadings: 47,
      avgResponseTime: 245,
      systemStatus: 'healthy',
      lastUpdated: new Date(),
      peakConcurrentUsers: 25
    };
  }
  
  // 실제 응답시간은 추후 구현 예정, 현재는 0으로 초기화
  const avgResponseTime = 0;
  
  return {
    activeUsers: sessionManager.getActiveUserCount(),
    activeSessions: sessionManager.getActiveSessions().length,
    todayReadings,
    avgResponseTime,
    systemStatus: 'healthy', // 초기 상태는 정상
    lastUpdated: new Date(),
    peakConcurrentUsers: sessionManager.getActiveUserCount()
  };
}

/**
 * 활성 세션 목록 가져오기
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const sessionManager = SessionManager.getInstance();
  const sessions = sessionManager.getActiveSessions();
  
  // 실제 세션만 반환, Mock 데이터 제거
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
    usingMockData: process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true' || process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true',
    fileStorageEnabled: isFileStorageEnabled,
    buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0',
    serverUptime: process.uptime ? process.uptime() : 0
  };
}

/**
 * 성능 메트릭 가져오기
 */
export async function getAdminPerformanceMetrics(): Promise<PerformanceMetrics> {
  // 실제 성능 메트릭 - 초기값으로 설정
  return {
    averageResponseTime: 0,
    successRate: 100, // 초기 상태는 100%
    totalRequests: 0,
    errorRate: 0,
    requestsPerMinute: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    averageSessionDuration: 0
  };
}

/**
 * 시스템 알림 가져오기
 */
export async function getSystemAlerts(): Promise<SystemAlert[]> {
  // 실제 시스템 알림 - 초기에는 빈 배열
  const alerts: SystemAlert[] = [];
  
  // 추후 실제 시스템 모니터링 로직 구현 예정
  // 현재는 알림이 없는 상태로 반환
  
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