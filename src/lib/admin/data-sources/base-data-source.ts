import { DataSource, DataSourceOptions } from '../types/data-source';

// 추상 기본 클래스 - 공통 기능 구현
export abstract class BaseDataSource implements DataSource {
  protected options: DataSourceOptions;
  protected lastError: Error | null = null;
  protected connected: boolean = false;

  constructor(options: DataSourceOptions) {
    this.options = options;
  }

  // 공통 메서드
  isConnected(): boolean {
    return this.connected;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  protected setError(error: Error): void {
    this.lastError = error;
    console.error(`[${this.constructor.name}] Error:`, error);
  }

  protected clearError(): void {
    this.lastError = null;
  }

  // 추상 메서드들 - 하위 클래스에서 구현 필요
  abstract getAdminStats(): Promise<import('../types/data-source').AdminStats>;
  abstract getHourlyStats(date: Date): Promise<import('../types/data-source').HourlyStats[]>;
  abstract getDailyStats(startDate: Date, endDate: Date): Promise<import('../types/data-source').DailyStats[]>;
  abstract getMonthlyStats(year: number): Promise<import('../types/data-source').MonthlyStats[]>;
  abstract getRealtimeData(): Promise<import('../types/data-source').RealtimeData>;
  abstract subscribeToRealtimeUpdates(callback: (data: import('../types/data-source').RealtimeData) => void): () => void;
  abstract getBlogPosts(options?: {
    status?: 'draft' | 'published' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<import('../types/data-source').BlogPost[]>;
  abstract getBlogPost(id: string): Promise<import('../types/data-source').BlogPost | null>;
  abstract createBlogPost(post: Omit<import('../types/data-source').BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>): Promise<import('../types/data-source').BlogPost>;
  abstract updateBlogPost(id: string, updates: Partial<import('../types/data-source').BlogPost>): Promise<import('../types/data-source').BlogPost>;
  abstract deleteBlogPost(id: string): Promise<void>;
  abstract getSystemStatus(): Promise<import('../types/data-source').SystemStatus>;
}