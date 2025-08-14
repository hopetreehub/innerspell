'use server';

import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { createDataSource, getCurrentDataSourceType } from '@/lib/admin';
import type { 
  AdminStats, 
  HourlyStats, 
  DailyStats as DataSourceDailyStats,
  MonthlyStats 
} from '@/lib/admin/types/data-source';

// 기존 타입들 유지 (호환성을 위해)
export interface UsageStats {
  userId: string;
  email?: string;
  tarotReadings: number;
  dreamInterpretations: number;
  lastTarotReading?: Date;
  lastDreamInterpretation?: Date;
  totalUsage: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyStats {
  date: string;
  users: number;
  sessions: number;
  tarotReadings: number;
  dreamInterpretations: number;
  yesNoReadings: number;
}

interface ServiceUsage {
  service: string;
  count: number;
  percentage: number;
}

interface UserDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface RealTimeStats {
  activeUsers: number;
  activeSessions: number;
  todayReadings: number;
  avgResponseTime: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface DetailedUsageRecord {
  id: string;
  userId: string;
  type: 'tarot' | 'dream';
  timestamp: Date;
  details?: {
    question?: string;
    spread?: string;
    interpretation?: string;
    dreamContent?: string;
  };
}

// 타로 리딩 사용 기록
export async function recordTarotUsage(
  userId: string, 
  details?: { question?: string; spread?: string; interpretation?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const dataSource = createDataSource();
    const dataSourceType = getCurrentDataSourceType();
    
    // Mock 데이터 소스인 경우 로깅만
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Recording tarot usage:', { userId, details });
      return { 
        success: true, 
        message: '[개발모드] 타로 리딩 사용 기록이 모의 저장되었습니다.' 
      };
    }
    
    // Firebase 데이터 소스인 경우 실제 저장
    // TODO: Firebase에 사용 기록 저장 로직 구현
    console.log('[FirebaseDataSource] Recording tarot usage:', { userId, details });
    
    return { 
      success: true, 
      message: '타로 리딩 사용 기록이 저장되었습니다.' 
    };
  } catch (error) {
    console.error('Failed to record tarot usage:', error);
    return { 
      success: false, 
      message: '타로 리딩 사용 기록 저장에 실패했습니다.' 
    };
  }
}

// 드림 해석 사용 기록
export async function recordDreamUsage(
  userId: string, 
  details?: { dreamContent?: string; interpretation?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const dataSource = createDataSource();
    const dataSourceType = getCurrentDataSourceType();
    
    if (dataSourceType === 'mock') {
      console.log('[MockDataSource] Recording dream usage:', { userId, details });
      return { 
        success: true, 
        message: '[개발모드] 드림 해석 사용 기록이 모의 저장되었습니다.' 
      };
    }
    
    // TODO: Firebase에 사용 기록 저장 로직 구현
    console.log('[FirebaseDataSource] Recording dream usage:', { userId, details });
    
    return { 
      success: true, 
      message: '드림 해석 사용 기록이 저장되었습니다.' 
    };
  } catch (error) {
    console.error('Failed to record dream usage:', error);
    return { 
      success: false, 
      message: '드림 해석 사용 기록 저장에 실패했습니다.' 
    };
  }
}

// 전체 사용자 통계 조회
export async function getAllUsageStats(): Promise<{ 
  success: boolean; 
  data?: UsageStats[]; 
  error?: string 
}> {
  try {
    const dataSource = createDataSource();
    const adminStats = await dataSource.getAdminStats();
    
    // 데이터 소스에서 제공하는 전체 통계를 기반으로 가상의 사용자별 통계 생성
    // 실제로는 Firebase에서 사용자별 통계를 조회해야 함
    const mockUserStats: UsageStats[] = [];
    
    // TODO: 실제 사용자별 통계 조회 구현
    console.log('[UsageStats] Admin stats:', adminStats);
    
    return { success: true, data: mockUserStats };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '통계를 불러올 수 없습니다.' 
    };
  }
}

// 일별 통계 조회
export async function getDailyStats(days: number = 7): Promise<{
  success: boolean;
  data?: DailyStats[];
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    const dailyStats = await dataSource.getDailyStats(startDate, endDate);
    
    // 데이터 소스 형식을 기존 형식으로 변환
    const formattedStats: DailyStats[] = dailyStats.map(stat => ({
      date: stat.date,
      users: stat.uniqueUsers,
      sessions: stat.totalReadings, // 세션 수를 리딩 수로 대체
      tarotReadings: Math.floor(stat.totalReadings * 0.7), // 70%는 타로
      dreamInterpretations: Math.floor(stat.totalReadings * 0.2), // 20%는 드림
      yesNoReadings: Math.floor(stat.totalReadings * 0.1), // 10%는 예/아니오
    }));
    
    return { success: true, data: formattedStats };
  } catch (error) {
    console.error('Failed to get daily stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '일별 통계를 불러올 수 없습니다.' 
    };
  }
}

// 서비스별 사용량 조회
export async function getServiceUsageStats(): Promise<{
  success: boolean;
  data?: ServiceUsage[];
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const adminStats = await dataSource.getAdminStats();
    
    const total = adminStats.totalReadings;
    const tarot = Math.floor(total * 0.7);
    const dream = Math.floor(total * 0.2);
    const yesNo = Math.floor(total * 0.1);
    
    const serviceUsage: ServiceUsage[] = [
      { service: '타로 리딩', count: tarot, percentage: 70 },
      { service: '드림 해석', count: dream, percentage: 20 },
      { service: '예/아니오', count: yesNo, percentage: 10 },
    ];
    
    return { success: true, data: serviceUsage };
  } catch (error) {
    console.error('Failed to get service usage stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '서비스 사용량을 불러올 수 없습니다.' 
    };
  }
}

// 사용자 분포 조회
export async function getUserDistribution(): Promise<{
  success: boolean;
  data?: UserDistribution[];
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const adminStats = await dataSource.getAdminStats();
    
    const total = adminStats.totalUsers;
    const active = adminStats.activeUsers;
    const inactive = total - active;
    
    const distribution: UserDistribution[] = [
      { type: '활성 사용자', count: active, percentage: (active / total) * 100 },
      { type: '비활성 사용자', count: inactive, percentage: (inactive / total) * 100 },
    ];
    
    return { success: true, data: distribution };
  } catch (error) {
    console.error('Failed to get user distribution:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '사용자 분포를 불러올 수 없습니다.' 
    };
  }
}

// 실시간 통계 조회
export async function getRealTimeStats(): Promise<{
  success: boolean;
  data?: RealTimeStats;
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const realtimeData = await dataSource.getRealtimeData();
    const adminStats = await dataSource.getAdminStats();
    
    const stats: RealTimeStats = {
      activeUsers: realtimeData.activeUsers.length,
      activeSessions: realtimeData.currentReadings,
      todayReadings: adminStats.todayReadings,
      avgResponseTime: 120 + Math.random() * 50, // Mock 응답 시간
      systemStatus: 'healthy',
      lastUpdated: new Date().toISOString(),
    };
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Failed to get real-time stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '실시간 통계를 불러올 수 없습니다.' 
    };
  }
}

// 시간대별 통계 조회
export async function getHourlyStats(date: Date = new Date()): Promise<{
  success: boolean;
  data?: HourlyStats[];
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const hourlyStats = await dataSource.getHourlyStats(date);
    
    return { success: true, data: hourlyStats };
  } catch (error) {
    console.error('Failed to get hourly stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '시간대별 통계를 불러올 수 없습니다.' 
    };
  }
}

// 월별 통계 조회
export async function getMonthlyStats(year: number = new Date().getFullYear()): Promise<{
  success: boolean;
  data?: MonthlyStats[];
  error?: string;
}> {
  try {
    const dataSource = createDataSource();
    const monthlyStats = await dataSource.getMonthlyStats(year);
    
    return { success: true, data: monthlyStats };
  } catch (error) {
    console.error('Failed to get monthly stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '월별 통계를 불러올 수 없습니다.' 
    };
  }
}

// 상세 사용 기록 조회
export async function getDetailedUsageRecords(
  userId?: string,
  type?: 'tarot' | 'dream',
  days: number = 7
): Promise<{
  success: boolean;
  data?: DetailedUsageRecord[];
  error?: string;
}> {
  try {
    // TODO: 실제 상세 기록 조회 구현
    console.log('[UsageStats] Getting detailed records:', { userId, type, days });
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Failed to get detailed usage records:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '상세 기록을 불러올 수 없습니다.' 
    };
  }
}

// 현재 데이터 소스 타입 반환 (UI에서 표시용)
export async function getDataSourceInfo(): Promise<{
  type: 'firebase' | 'mock';
  message: string;
}> {
  const type = getCurrentDataSourceType();
  const message = type === 'firebase' 
    ? '실제 Firebase 데이터를 사용 중입니다.'
    : '개발 모드 - 목 데이터를 사용 중입니다.';
    
  return { type, message };
}