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
import { firestore } from '@/lib/firebase/admin';
import { getDatabase } from 'firebase-admin/database';
import { FieldValue } from 'firebase-admin/firestore';

export class FirebaseDataSource extends BaseDataSource {
  private db: FirebaseFirestore.Firestore;
  private realtimeDb: any;

  constructor(options: DataSourceOptions) {
    super(options);
    this.db = firestore;
    
    try {
      this.realtimeDb = getDatabase();
      this.connected = true;
    } catch (error) {
      this.setError(error as Error);
      this.connected = false;
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      // 실시간 통계는 Realtime Database에서
      const statsRef = this.realtimeDb.ref('stats/current');
      const snapshot = await statsRef.once('value');
      const currentStats = snapshot.val();

      // 사용자 수는 Firestore에서
      const usersSnapshot = await this.db.collection('users').count().get();
      const totalUsers = usersSnapshot.data().count;

      // 활성 사용자는 최근 5분 이내 활동
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsersSnapshot = await this.db
        .collection('users')
        .where('lastActivity', '>', fiveMinutesAgo)
        .count()
        .get();
      const activeUsers = activeUsersSnapshot.data().count;

      return {
        totalUsers,
        activeUsers,
        totalReadings: currentStats?.totalReadings || 0,
        todayReadings: currentStats?.todayReadings || 0,
        averageSessionTime: currentStats?.averageSessionTime || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getHourlyStats(date: Date): Promise<HourlyStats[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const statsDoc = await this.db
        .collection('stats')
        .doc('hourly')
        .collection(dateStr)
        .get();

      const hourlyStats: HourlyStats[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        const hourDoc = statsDoc.docs.find(doc => doc.id === hour.toString());
        if (hourDoc) {
          const data = hourDoc.data();
          hourlyStats.push({
            hour,
            readings: data.readings || 0,
            users: data.users || 0
          });
        } else {
          hourlyStats.push({ hour, readings: 0, users: 0 });
        }
      }

      return hourlyStats;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    try {
      const stats: DailyStats[] = [];
      const current = new Date(startDate);

      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        const doc = await this.db
          .collection('stats')
          .doc('daily')
          .collection(dateStr.substring(0, 7)) // YYYY-MM
          .doc(dateStr)
          .get();

        if (doc.exists) {
          const data = doc.data()!;
          stats.push({
            date: dateStr,
            totalReadings: data.totalReadings || 0,
            uniqueUsers: data.uniqueUsers || 0,
            peakHour: data.peakHour || 0,
            averageSessionTime: data.averageSessionTime || 0
          });
        } else {
          stats.push({
            date: dateStr,
            totalReadings: 0,
            uniqueUsers: 0,
            peakHour: 0,
            averageSessionTime: 0
          });
        }

        current.setDate(current.getDate() + 1);
      }

      return stats;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    try {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const stats: MonthlyStats[] = [];

      for (let month = 0; month < 12; month++) {
        const monthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        const doc = await this.db
          .collection('stats')
          .doc('monthly')
          .collection(year.toString())
          .doc(monthStr)
          .get();

        if (doc.exists) {
          const data = doc.data()!;
          stats.push({
            month: monthNames[month],
            totalReadings: data.totalReadings || 0,
            uniqueUsers: data.uniqueUsers || 0,
            growthRate: data.growthRate || 0
          });
        } else {
          stats.push({
            month: monthNames[month],
            totalReadings: 0,
            uniqueUsers: 0,
            growthRate: 0
          });
        }
      }

      return stats;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getRealtimeData(): Promise<RealtimeData> {
    try {
      // 활성 사용자 조회
      const activeUsersRef = this.realtimeDb.ref('monitoring/activeUsers');
      const activeUsersSnapshot = await activeUsersRef.once('value');
      const activeUsersData = activeUsersSnapshot.val() || {};

      const activeUsers = Object.entries(activeUsersData).map(([userId, data]: [string, any]) => ({
        userId,
        email: data.email,
        lastActivity: new Date(data.lastActivity),
        status: data.status as 'active' | 'idle',
        currentPage: data.currentPage
      }));

      // 오늘 통계
      const todayStatsRef = this.realtimeDb.ref('monitoring/todayStats');
      const todayStatsSnapshot = await todayStatsRef.once('value');
      const todayStats = todayStatsSnapshot.val() || {
        readings: 0,
        newUsers: 0,
        peakConcurrentUsers: 0
      };

      // 현재 진행 중인 리딩 수
      const currentReadingsRef = this.realtimeDb.ref('monitoring/currentReadings');
      const currentReadingsSnapshot = await currentReadingsRef.once('value');
      const currentReadings = currentReadingsSnapshot.val() || 0;

      return {
        activeUsers,
        currentReadings,
        todayStats
      };
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  subscribeToRealtimeUpdates(callback: (data: RealtimeData) => void): () => void {
    const refs = {
      activeUsers: this.realtimeDb.ref('monitoring/activeUsers'),
      todayStats: this.realtimeDb.ref('monitoring/todayStats'),
      currentReadings: this.realtimeDb.ref('monitoring/currentReadings')
    };

    const listeners: any[] = [];

    // 데이터 수집 함수
    const collectAndCallback = async () => {
      try {
        const data = await this.getRealtimeData();
        callback(data);
      } catch (error) {
        console.error('Error in realtime update:', error);
      }
    };

    // 각 ref에 리스너 등록
    Object.entries(refs).forEach(([key, ref]) => {
      const listener = ref.on('value', () => {
        collectAndCallback();
      });
      listeners.push({ ref, listener });
    });

    // 클린업 함수 반환
    return () => {
      listeners.forEach(({ ref, listener }) => {
        ref.off('value', listener);
      });
    };
  }

  async getBlogPosts(options?: {
    status?: 'draft' | 'published' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<BlogPost[]> {
    try {
      let query = this.db.collection('blogPosts').orderBy('publishedAt', 'desc');

      if (options?.status && options.status !== 'all') {
        query = query.where('status', '==', options.status);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as BlogPost));
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    try {
      const doc = await this.db.collection('blogPosts').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data()!.publishedAt?.toDate() || new Date(),
        updatedAt: doc.data()!.updatedAt?.toDate() || new Date()
      } as BlogPost;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async createBlogPost(post: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>): Promise<BlogPost> {
    try {
      const docRef = await this.db.collection('blogPosts').add({
        ...post,
        publishedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        viewCount: 0
      });

      const created = await docRef.get();
      return {
        id: created.id,
        ...created.data(),
        publishedAt: created.data()!.publishedAt?.toDate() || new Date(),
        updatedAt: created.data()!.updatedAt?.toDate() || new Date()
      } as BlogPost;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const docRef = this.db.collection('blogPosts').doc(id);
      
      await docRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      return {
        id: updated.id,
        ...updated.data(),
        publishedAt: updated.data()!.publishedAt?.toDate() || new Date(),
        updatedAt: updated.data()!.updatedAt?.toDate() || new Date()
      } as BlogPost;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async deleteBlogPost(id: string): Promise<void> {
    try {
      await this.db.collection('blogPosts').doc(id).delete();
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // TODO: 실제 시스템 메트릭 수집 구현
      // 현재는 기본값 반환
      return {
        services: {
          firebase: 'operational',
          vercel: 'operational',
          nextjs: 'operational'
        },
        performance: {
          averageResponseTime: 150,
          errorRate: 0.001,
          uptime: 99.99
        },
        resources: {
          firebaseReads: 0,
          firebaseWrites: 0,
          bandwidthUsed: 0,
          storageUsed: 0
        }
      };
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }
}