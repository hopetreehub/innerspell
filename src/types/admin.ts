/**
 * 관리자 대시보드 관련 타입 정의
 */

// 사용 통계 타입
export interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalSessions: number;
  totalReadings: number;
  avgSessionDuration: number;
  lastUpdated: Date;
}

// 사용자 활동 타입
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: any;
}

// 실시간 통계 타입
export interface RealTimeStats {
  activeUsers: number;
  activeSessions: number;
  todayReadings: number;
  avgResponseTime: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
  peakConcurrentUsers: number;
}

// 활성 세션 타입
export interface ActiveSession {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  currentPage: string;
  duration: number;
  source: string;
  lastActivityType?: string;
}

// 성능 메트릭 타입
export interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  totalRequests: number;
  errorRate: number;
  requestsPerMinute: number;
  memoryUsage: number;
  cpuUsage: number;
  averageSessionDuration: number;
}

// 시스템 알림 타입
export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  resolved: boolean;
}

// 일별 통계 타입
export interface DailyStats {
  date: string;
  users: number;
  sessions: number;
  tarotReadings: number;
  dreamInterpretations: number;
  yesNoReadings?: number;
}

// 사용자별 상세 통계
export interface UserUsageStats {
  userId: string;
  email?: string;
  tarotReadings: number;
  dreamInterpretations: number;
  totalUsage: number;
  lastTarotReading?: Date;
  lastDreamInterpretation?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 상세 사용 기록
export interface DetailedUsageRecord {
  id: string;
  userId: string;
  type: 'tarot_reading' | 'dream_interpretation' | 'blog_view' | 'session_start' | 'session_end';
  timestamp: Date;
  details: any;
}

// 사용 통계 요약
export interface UsageStatsSummary {
  totalUsers: number;
  totalTarotReadings: number;
  totalDreamInterpretations: number;
  totalUsage: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  topUsers: UserUsageStats[];
}

// 트렌드 데이터
export interface TrendData {
  previousValue: number | null;
  change: number;
  changePercent: number | null;
  trend: 'up' | 'down' | 'stable';
}

// 사용자 활동 스트림 데이터
export interface ActivityStreamData {
  type: 'connected' | 'activities';
  data?: UserActivity[];
  timestamp: string;
}