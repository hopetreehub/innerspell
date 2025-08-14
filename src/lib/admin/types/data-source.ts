// 관리자 시스템 데이터 소스 타입 정의

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalReadings: number;
  todayReadings: number;
  averageSessionTime: number;
  lastUpdated: Date;
}

export interface HourlyStats {
  hour: number;
  readings: number;
  users: number;
}

export interface DailyStats {
  date: string;
  totalReadings: number;
  uniqueUsers: number;
  peakHour: number;
  averageSessionTime: number;
}

export interface MonthlyStats {
  month: string;
  totalReadings: number;
  uniqueUsers: number;
  growthRate: number;
}

export interface RealtimeData {
  activeUsers: ActiveUser[];
  currentReadings: number;
  todayStats: {
    readings: number;
    newUsers: number;
    peakConcurrentUsers: number;
  };
}

export interface ActiveUser {
  userId: string;
  email: string;
  lastActivity: Date;
  status: 'active' | 'idle';
  currentPage?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  publishedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  tags: string[];
  viewCount: number;
  imageUrl?: string;
}

export interface SystemStatus {
  services: {
    firebase: 'operational' | 'degraded' | 'down';
    vercel: 'operational' | 'degraded' | 'down';
    nextjs: 'operational' | 'degraded' | 'down';
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  resources: {
    firebaseReads: number;
    firebaseWrites: number;
    bandwidthUsed: number;
    storageUsed: number;
  };
}

// 데이터 소스 인터페이스
export interface DataSource {
  // 통계 관련
  getAdminStats(): Promise<AdminStats>;
  getHourlyStats(date: Date): Promise<HourlyStats[]>;
  getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]>;
  getMonthlyStats(year: number): Promise<MonthlyStats[]>;
  
  // 실시간 모니터링
  getRealtimeData(): Promise<RealtimeData>;
  subscribeToRealtimeUpdates(callback: (data: RealtimeData) => void): () => void;
  
  // 블로그 관리
  getBlogPosts(options?: {
    status?: 'draft' | 'published' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | null>;
  createBlogPost(post: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  
  // 시스템 상태
  getSystemStatus(): Promise<SystemStatus>;
  
  // 연결 상태
  isConnected(): boolean;
  getLastError(): Error | null;
}

// 데이터 소스 옵션
export interface DataSourceOptions {
  environment: 'development' | 'production';
  firebaseConfig?: any;
  enableCache?: boolean;
  cacheTimeout?: number;
}