import { UsageStats, UserActivity } from '@/types/admin';
import { createDataSource, getCurrentDataSourceType } from '@/lib/admin';

/**
 * 사용 통계 가져오기
 */
export async function getUsageStats(): Promise<UsageStats> {
  try {
    const dataSource = createDataSource();
    const adminStats = await dataSource.getAdminStats();
    
    // 데이터 소스의 AdminStats를 UsageStats 형식으로 변환
    return {
      totalUsers: adminStats.totalUsers,
      activeUsers: adminStats.activeUsers,
      newUsers: Math.floor(adminStats.totalUsers * 0.05), // 신규 사용자는 전체의 5%로 추정
      totalSessions: adminStats.totalReadings, // 세션 수를 리딩 수로 대체
      totalReadings: adminStats.totalReadings,
      avgSessionDuration: adminStats.averageSessionTime,
      lastUpdated: adminStats.lastUpdated
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    
    // 에러 시 기본값 반환
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      totalSessions: 0,
      totalReadings: 0,
      avgSessionDuration: 0,
      lastUpdated: new Date()
    };
  }
}

/**
 * 최근 활동 가져오기
 */
export async function getRecentActivities(limit: number = 10): Promise<UserActivity[]> {
  try {
    const dataSource = createDataSource();
    const realtimeData = await dataSource.getRealtimeData();
    
    // 활성 사용자 정보를 UserActivity 형식으로 변환
    const activities: UserActivity[] = realtimeData.activeUsers
      .slice(0, limit)
      .map((user, index) => ({
        id: `activity-${Date.now()}-${index}`,
        userId: user.userId,
        action: user.currentPage || 'page_view',
        details: {
          page: user.currentPage,
          status: user.status
        },
        timestamp: user.lastActivity
      }));
    
    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * 사용자 활동 기록
 */
export async function recordUserActivity(
  userId: string, 
  action: string, 
  details?: any
): Promise<void> {
  try {
    const dataSourceType = getCurrentDataSourceType();
    
    // 개발 모드에서는 콘솔 로그만
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Activity recorded:', { userId, action, details });
      return;
    }
    
    // Firebase에서는 실제 기록
    // TODO: Firebase에 활동 기록 저장 구현
    console.log('[FirebaseDataSource] Recording activity:', { userId, action, details });
  } catch (error) {
    console.error('Error recording activity:', error);
  }
}

/**
 * 세션 시작 기록
 */
export async function recordSessionStart(userId: string): Promise<void> {
  try {
    const dataSourceType = getCurrentDataSourceType();
    
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Session started:', userId);
      return;
    }
    
    // TODO: Firebase에 세션 시작 기록
    console.log('[FirebaseDataSource] Recording session start:', userId);
  } catch (error) {
    console.error('Error recording session start:', error);
  }
}

/**
 * 세션 종료 기록
 */
export async function recordSessionEnd(userId: string): Promise<void> {
  try {
    const dataSourceType = getCurrentDataSourceType();
    
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Session ended:', userId);
      return;
    }
    
    // TODO: Firebase에 세션 종료 기록
    console.log('[FirebaseDataSource] Recording session end:', userId);
  } catch (error) {
    console.error('Error recording session end:', error);
  }
}

/**
 * 서비스별 사용량 분석
 */
export async function getServiceUsageBreakdown(): Promise<{
  tarot: number;
  dream: number;
  yesno: number;
  total: number;
}> {
  try {
    const dataSource = createDataSource();
    const adminStats = await dataSource.getAdminStats();
    
    const total = adminStats.totalReadings;
    const tarot = Math.floor(total * 0.7);
    const dream = Math.floor(total * 0.2);
    const yesno = Math.floor(total * 0.1);
    
    return { tarot, dream, yesno, total };
  } catch (error) {
    console.error('Error fetching service breakdown:', error);
    return { tarot: 0, dream: 0, yesno: 0, total: 0 };
  }
}

/**
 * 관리자 성능 메트릭
 */
export async function getAdminPerformanceMetrics(): Promise<{
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
  lastChecked: Date;
}> {
  try {
    const dataSource = createDataSource();
    const systemStatus = await dataSource.getSystemStatus();
    
    return {
      avgResponseTime: systemStatus.performance.averageResponseTime,
      errorRate: systemStatus.performance.errorRate,
      uptime: systemStatus.performance.uptime,
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      avgResponseTime: 0,
      errorRate: 0,
      uptime: 0,
      lastChecked: new Date()
    };
  }
}