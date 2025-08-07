import { UsageStats, UserActivity } from '@/types/admin';
import * as fileService from './usage-stats-file';

// Mock 데이터 (파일 저장소가 비활성화된 경우 사용)
const mockStats: UsageStats = {
  totalUsers: 1234,
  activeUsers: 342,
  newUsers: 87,
  totalSessions: 5678,
  totalReadings: 12345,
  avgSessionDuration: 4.5,
  lastUpdated: new Date()
};

const mockActivities: UserActivity[] = [
  {
    id: '1',
    userId: 'user1',
    action: 'tarot_reading',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    details: { spreadType: '켈틱 크로스' }
  },
  {
    id: '2',
    userId: 'user2',
    action: 'blog_view',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    details: { postId: 'post1', postTitle: '타로 카드 기초 가이드' }
  },
  {
    id: '3',
    userId: 'user3',
    action: 'session_start',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    details: { source: 'web' }
  }
];

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