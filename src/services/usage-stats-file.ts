import { UsageStats, UserActivity } from '@/types/admin';
import * as fileStorage from './file-storage-service';

const USAGE_STATS_FILE = 'usage-stats.json';
const USER_ACTIVITIES_FILE = 'user-activities.json';

interface UsageStatsData {
  stats: UsageStats;
  lastUpdated: string;
  version: string;
}

interface UserActivitiesData {
  activities: UserActivity[];
  lastUpdated: string;
  version: string;
}

/**
 * 초기 사용 통계 데이터
 */
const initialUsageStats: UsageStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsers: 0,
  totalSessions: 0,
  totalReadings: 0,
  avgSessionDuration: 0,
  lastUpdated: new Date()
};

/**
 * 사용 통계 파일 초기화
 */
async function initializeUsageStatsFile(): Promise<void> {
  const exists = await fileStorage.fileExists(USAGE_STATS_FILE);
  
  if (!exists) {
    console.log('📊 Initializing usage stats file...');
    
    const initialData: UsageStatsData = {
      stats: initialUsageStats,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(USAGE_STATS_FILE, initialData, false);
    console.log('✅ Usage stats file initialized');
  }
}

/**
 * 사용자 활동 파일 초기화
 */
async function initializeUserActivitiesFile(): Promise<void> {
  const exists = await fileStorage.fileExists(USER_ACTIVITIES_FILE);
  
  if (!exists) {
    console.log('📋 Initializing user activities file...');
    
    const initialData: UserActivitiesData = {
      activities: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(USER_ACTIVITIES_FILE, initialData, false);
    console.log('✅ User activities file initialized');
  }
}

/**
 * 사용 통계 가져오기
 */
export async function getUsageStats(): Promise<UsageStats> {
  if (!fileStorage.isFileStorageEnabled) {
    return initialUsageStats;
  }

  try {
    await initializeUsageStatsFile();
    
    const data = await fileStorage.readJSON<UsageStatsData>(USAGE_STATS_FILE);
    if (!data || !data.stats) {
      console.warn('⚠️ No usage stats found, returning initial data');
      return initialUsageStats;
    }
    
    // Date 객체로 변환
    return {
      ...data.stats,
      lastUpdated: new Date(data.stats.lastUpdated)
    };
  } catch (error) {
    console.error('❌ Error loading usage stats:', error);
    return initialUsageStats;
  }
}

/**
 * 사용 통계 업데이트
 */
export async function updateUsageStats(updates: Partial<UsageStats>): Promise<void> {
  if (!fileStorage.isFileStorageEnabled) {
    console.log('📊 File storage disabled, mock update');
    return;
  }

  try {
    const currentStats = await getUsageStats();
    const updatedStats = {
      ...currentStats,
      ...updates,
      lastUpdated: new Date()
    };
    
    const data: UsageStatsData = {
      stats: updatedStats,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(USAGE_STATS_FILE, data);
    console.log('✅ Usage stats updated');
  } catch (error) {
    console.error('❌ Error updating usage stats:', error);
    throw error;
  }
}

/**
 * 사용자 활동 기록
 */
export async function recordUserActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
  if (!fileStorage.isFileStorageEnabled) {
    console.log('📝 File storage disabled, mock activity record');
    return;
  }

  try {
    await initializeUserActivitiesFile();
    
    const data = await fileStorage.readJSON<UserActivitiesData>(USER_ACTIVITIES_FILE);
    const activities = data?.activities || [];
    
    const newActivity: UserActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    // 최신 활동을 앞에 추가
    activities.unshift(newActivity);
    
    // 최대 1000개의 활동만 유지
    const trimmedActivities = activities.slice(0, 1000);
    
    const updatedData: UserActivitiesData = {
      activities: trimmedActivities,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(USER_ACTIVITIES_FILE, updatedData);
    console.log('✅ User activity recorded:', newActivity.action);
  } catch (error) {
    console.error('❌ Error recording user activity:', error);
  }
}

/**
 * 최근 사용자 활동 가져오기
 */
export async function getRecentActivities(limit: number = 10): Promise<UserActivity[]> {
  if (!fileStorage.isFileStorageEnabled) {
    return [];
  }

  try {
    await initializeUserActivitiesFile();
    
    const data = await fileStorage.readJSON<UserActivitiesData>(USER_ACTIVITIES_FILE);
    if (!data || !data.activities) {
      return [];
    }
    
    // Date 객체로 변환
    const activities = data.activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
    
    return activities.slice(0, limit);
  } catch (error) {
    console.error('❌ Error loading recent activities:', error);
    return [];
  }
}

/**
 * 세션 시작 기록
 */
export async function recordSessionStart(userId: string): Promise<void> {
  await recordUserActivity({
    userId,
    action: 'session_start',
    details: { source: 'web' }
  });
  
  // 통계 업데이트
  const stats = await getUsageStats();
  await updateUsageStats({
    totalSessions: stats.totalSessions + 1,
    activeUsers: stats.activeUsers + 1
  });
}

/**
 * 타로 리딩 기록
 */
export async function recordTarotReading(userId: string, spreadType: string): Promise<void> {
  await recordUserActivity({
    userId,
    action: 'tarot_reading',
    details: { spreadType }
  });
  
  // 통계 업데이트
  const stats = await getUsageStats();
  await updateUsageStats({
    totalReadings: stats.totalReadings + 1
  });
}

/**
 * 블로그 조회 기록
 */
export async function recordBlogView(userId: string, postId: string, postTitle: string): Promise<void> {
  await recordUserActivity({
    userId,
    action: 'blog_view',
    details: { postId, postTitle }
  });
}

/**
 * 일일 통계 리셋 (새로운 날 시작)
 */
export async function resetDailyStats(): Promise<void> {
  await updateUsageStats({
    activeUsers: 0,
    newUsers: 0
  });
}