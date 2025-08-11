import { UsageStats, UserActivity } from '@/types/admin';
import * as fileService from './usage-stats-file';

// 초기 데이터 (파일 저장소가 비활성화된 경우 사용)
const mockStats: UsageStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsers: 0,
  totalSessions: 0,
  totalReadings: 0,
  avgSessionDuration: 0,
  lastUpdated: new Date()
};

const mockActivities: UserActivity[] = [];

/**
 * 사용 통계 가져오기
 */
export async function getUsageStats(): Promise<UsageStats> {
  try {
    // 파일 저장소가 활성화된 경우
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
         process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      return await fileService.getUsageStats();
    }
    
    // Mock 데이터 반환
    return mockStats;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return mockStats;
  }
}

/**
 * 최근 활동 가져오기
 */
export async function getRecentActivities(limit: number = 10): Promise<UserActivity[]> {
  try {
    // 파일 저장소가 활성화된 경우
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
         process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      return await fileService.getRecentActivities(limit);
    }
    
    // Mock 데이터 반환
    return mockActivities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return mockActivities.slice(0, limit);
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
    // 파일 저장소가 활성화된 경우
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
         process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      await fileService.recordUserActivity({
        userId,
        action,
        details
      });
    }
    
    console.log('Activity recorded:', { userId, action, details });
  } catch (error) {
    console.error('Error recording activity:', error);
  }
}

/**
 * 세션 시작 기록
 */
export async function recordSessionStart(userId: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      await fileService.recordSessionStart(userId);
    }
  } catch (error) {
    console.error('Error recording session start:', error);
  }
}

/**
 * 타로 리딩 기록
 */
export async function recordTarotReading(userId: string, spreadType: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      await fileService.recordTarotReading(userId, spreadType);
    }
  } catch (error) {
    console.error('Error recording tarot reading:', error);
  }
}

/**
 * 블로그 조회 기록
 */
export async function recordBlogView(userId: string, postId: string, postTitle: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development' && 
        (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
         process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')) {
      await fileService.recordBlogView(userId, postId, postTitle);
    }
  } catch (error) {
    console.error('Error recording blog view:', error);
  }
}