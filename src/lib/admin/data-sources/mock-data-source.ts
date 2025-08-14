import { BaseDataSource } from './base-data-source';
import {
  AdminStats,
  HourlyStats,
  DailyStats,
  MonthlyStats,
  RealtimeData,
  BlogPost,
  SystemStatus,
  DataSourceOptions
} from '../types/data-source';

// 기존 MockDataGenerator를 활용
class MockDataGenerator {
  static generateHourlyData(date: Date): HourlyStats[] {
    const baseValue = 10;
    const hourlyWeights = [
      0.1, 0.1, 0.1, 0.2, 0.3, 0.5, // 0-5시
      0.7, 0.9, 1.1, 1.2, 1.3, 1.2, // 6-11시
      1.3, 1.2, 1.3, 1.4, 1.5, 1.4, // 12-17시
      1.3, 1.2, 1.0, 0.8, 0.5, 0.3  // 18-23시
    ];

    return hourlyWeights.map((weight, hour) => ({
      hour,
      readings: Math.round(baseValue * weight + Math.random() * 5),
      users: Math.round((baseValue * weight * 0.7) + Math.random() * 3)
    }));
  }

  static generateDailyData(startDate: Date, endDate: Date): DailyStats[] {
    const days: DailyStats[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseValue = isWeekend ? 150 : 100;
      
      days.push({
        date: current.toISOString().split('T')[0],
        totalReadings: baseValue + Math.round(Math.random() * 50),
        uniqueUsers: Math.round((baseValue * 0.6) + Math.random() * 20),
        peakHour: isWeekend ? 15 : 13,
        averageSessionTime: 180 + Math.round(Math.random() * 120)
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  static generateMonthlyData(year: number): MonthlyStats[] {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map((month, index) => {
      const seasonalWeight = index === 11 || index === 0 ? 1.3 : // 연말연시
                           index >= 6 && index <= 8 ? 0.8 : // 여름 휴가
                           1.0;
      
      const baseValue = 3000 * seasonalWeight;
      const growthRate = index === 0 ? 0 : (Math.random() * 20 - 5); // -5% ~ +15%
      
      return {
        month,
        totalReadings: Math.round(baseValue + Math.random() * 500),
        uniqueUsers: Math.round((baseValue * 0.3) + Math.random() * 100),
        growthRate
      };
    });
  }
}

// 가상 세션 관리
class SessionManager {
  private sessions: Map<string, any> = new Map();
  
  constructor() {
    this.initializeSessions();
  }
  
  private initializeSessions() {
    const mockUsers = [
      { userId: 'user1', email: 'user1@example.com' },
      { userId: 'user2', email: 'user2@example.com' },
      { userId: 'user3', email: 'user3@example.com' }
    ];
    
    mockUsers.forEach(user => {
      const isActive = Math.random() > 0.3;
      if (isActive) {
        this.sessions.set(user.userId, {
          ...user,
          lastActivity: new Date(Date.now() - Math.random() * 300000), // 최근 5분 내
          status: Math.random() > 0.5 ? 'active' : 'idle',
          currentPage: ['/tarot/new-reading', '/tarot/history', '/community'][Math.floor(Math.random() * 3)]
        });
      }
    });
  }
  
  getActiveSessions() {
    return Array.from(this.sessions.values());
  }
}

// 목 블로그 데이터
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: '타로의 역사와 의미',
    content: '타로 카드는 15세기 이탈리아에서 시작되어...',
    author: 'Admin',
    authorId: 'admin1',
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    status: 'published',
    tags: ['타로', '역사', '입문'],
    viewCount: 1234,
    imageUrl: '/images/blog/tarot-history.jpg'
  },
  {
    id: '2',
    title: '일일 카드 리딩의 중요성',
    content: '매일 아침 한 장의 카드를 뽑는 것은...',
    author: 'Admin',
    authorId: 'admin1',
    publishedAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    status: 'published',
    tags: ['일일카드', '실천', '가이드'],
    viewCount: 892,
    imageUrl: '/images/blog/daily-card.jpg'
  }
];

export class MockDataSource extends BaseDataSource {
  private sessionManager: SessionManager;
  private blogPosts: BlogPost[];

  constructor(options: DataSourceOptions) {
    super(options);
    this.connected = true;
    this.sessionManager = new SessionManager();
    this.blogPosts = [...mockPosts];
  }

  async getAdminStats(): Promise<AdminStats> {
    return {
      totalUsers: 156,
      activeUsers: 12,
      totalReadings: 2341,
      todayReadings: 47,
      averageSessionTime: 240,
      lastUpdated: new Date()
    };
  }

  async getHourlyStats(date: Date): Promise<HourlyStats[]> {
    return MockDataGenerator.generateHourlyData(date);
  }

  async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    return MockDataGenerator.generateDailyData(startDate, endDate);
  }

  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    return MockDataGenerator.generateMonthlyData(year);
  }

  async getRealtimeData(): Promise<RealtimeData> {
    const activeSessions = this.sessionManager.getActiveSessions();
    
    // 더 현실적인 활성 사용자 데이터 생성
    const mockActiveUsers: ActiveUser[] = [
      {
        userId: 'user-demo-001',
        email: 'demo@innerspell.com',
        lastActivity: new Date(Date.now() - 30000), // 30초 전
        status: 'active',
        currentPage: '/tarot/new-reading'
      },
      {
        userId: 'user-demo-002',
        email: 'test@innerspell.com',
        lastActivity: new Date(Date.now() - 60000), // 1분 전
        status: 'active',
        currentPage: '/dream'
      },
      {
        userId: 'user-demo-003',
        email: 'visitor@innerspell.com',
        lastActivity: new Date(Date.now() - 120000), // 2분 전
        status: 'idle',
        currentPage: '/blog'
      }
    ];
    
    // 세션이 있으면 실제 세션 데이터 사용, 없으면 목 데이터 사용
    const activeUsers = activeSessions.length > 0 
      ? activeSessions.map(session => ({
          userId: session.userId,
          email: `user${session.userId.slice(-4)}@example.com`,
          lastActivity: new Date(session.lastActivity),
          status: 'active' as const,
          currentPage: session.currentPage
        }))
      : mockActiveUsers;
    
    return {
      activeUsers,
      currentReadings: 3 + Math.floor(Math.random() * 3),
      todayStats: {
        readings: 142 + Math.floor(Math.random() * 10),
        newUsers: 12,
        peakConcurrentUsers: 28
      }
    };
  }

  subscribeToRealtimeUpdates(callback: (data: RealtimeData) => void): () => void {
    const interval = setInterval(async () => {
      const data = await this.getRealtimeData();
      callback(data);
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }

  async getBlogPosts(options?: {
    status?: 'draft' | 'published' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]> {
    let posts = [...this.blogPosts];
    
    if (options?.status && options.status !== 'all') {
      posts = posts.filter(p => p.status === options.status);
    }
    
    const offset = options?.offset || 0;
    const limit = options?.limit || posts.length;
    
    return posts.slice(offset, offset + limit);
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    return this.blogPosts.find(p => p.id === id) || null;
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>): Promise<BlogPost> {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      publishedAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0
    };
    
    this.blogPosts.push(newPost);
    return newPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    this.blogPosts[index] = {
      ...this.blogPosts[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.blogPosts[index];
  }

  async deleteBlogPost(id: string): Promise<void> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Blog post not found');
    }
    
    this.blogPosts.splice(index, 1);
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return {
      services: {
        firebase: 'operational',
        vercel: 'operational',
        nextjs: 'operational'
      },
      performance: {
        averageResponseTime: 120 + Math.random() * 50,
        errorRate: Math.random() * 0.02,
        uptime: 99.95
      },
      resources: {
        firebaseReads: 12500,
        firebaseWrites: 3200,
        bandwidthUsed: 2.4,
        storageUsed: 0.8
      }
    };
  }
}