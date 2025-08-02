'use server';

import { firestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

// 사용자의 타로 리딩 사용 기록
export async function recordTarotUsage(
  userId: string, 
  details?: { question?: string; spread?: string; interpretation?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const batch = firestore.batch();
    
    // 사용 통계 업데이트
    const statsRef = firestore.collection('userUsageStats').doc(userId);
    batch.set(statsRef, {
      userId,
      tarotReadings: FieldValue.increment(1),
      lastTarotReading: new Date(),
      totalUsage: FieldValue.increment(1),
      updatedAt: new Date()
    }, { merge: true });
    
    // 상세 사용 기록 추가
    const usageRef = firestore.collection('usageRecords').doc();
    batch.set(usageRef, {
      userId,
      type: 'tarot',
      timestamp: new Date(),
      details: details || {}
    });
    
    await batch.commit();
    
    console.log(`[UsageStats] Tarot usage recorded for user: ${userId}`);
    return { success: true, message: '타로 리딩 사용 기록이 저장되었습니다.' };
  } catch (error) {
    console.error('[UsageStats] Error recording tarot usage:', error);
    return { success: false, message: '사용 기록 저장 중 오류가 발생했습니다.' };
  }
}

// 사용자의 꿈해몽 사용 기록
export async function recordDreamUsage(
  userId: string,
  details?: { dreamContent?: string; interpretation?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const batch = firestore.batch();
    
    // 사용 통계 업데이트
    const statsRef = firestore.collection('userUsageStats').doc(userId);
    batch.set(statsRef, {
      userId,
      dreamInterpretations: FieldValue.increment(1),
      lastDreamInterpretation: new Date(),
      totalUsage: FieldValue.increment(1),
      updatedAt: new Date()
    }, { merge: true });
    
    // 상세 사용 기록 추가
    const usageRef = firestore.collection('usageRecords').doc();
    batch.set(usageRef, {
      userId,
      type: 'dream',
      timestamp: new Date(),
      details: details || {}
    });
    
    await batch.commit();
    
    console.log(`[UsageStats] Dream usage recorded for user: ${userId}`);
    return { success: true, message: '꿈해몽 사용 기록이 저장되었습니다.' };
  } catch (error) {
    console.error('[UsageStats] Error recording dream usage:', error);
    return { success: false, message: '사용 기록 저장 중 오류가 발생했습니다.' };
  }
}

// 모든 사용자의 사용 통계 조회
export async function getAllUsageStats(): Promise<{
  success: boolean;
  data?: UsageStats[];
  message?: string;
}> {
  try {
    console.log('[UsageStats] Fetching all user usage statistics...');
    
    const statsSnapshot = await firestore.collection('userUsageStats').get();
    const stats: UsageStats[] = [];
    
    for (const doc of statsSnapshot.docs) {
      const data = doc.data();
      
      // 사용자 정보 가져오기
      let email = '';
      try {
        const userDoc = await firestore.collection('users').doc(doc.id).get();
        if (userDoc.exists) {
          email = userDoc.data()?.email || '';
        }
      } catch (emailError) {
        console.warn(`[UsageStats] Could not fetch email for user ${doc.id}:`, emailError);
      }
      
      stats.push({
        userId: doc.id,
        email,
        tarotReadings: data.tarotReadings || 0,
        dreamInterpretations: data.dreamInterpretations || 0,
        lastTarotReading: data.lastTarotReading?.toDate(),
        lastDreamInterpretation: data.lastDreamInterpretation?.toDate(),
        totalUsage: data.totalUsage || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    }
    
    // 총 사용량으로 정렬
    stats.sort((a, b) => b.totalUsage - a.totalUsage);
    
    console.log(`[UsageStats] Successfully fetched usage stats for ${stats.length} users`);
    return { success: true, data: stats };
  } catch (error) {
    console.error('[UsageStats] Error fetching usage statistics:', error);
    return { success: false, message: '사용 통계를 불러오는 중 오류가 발생했습니다.' };
  }
}

// 특정 사용자의 상세 사용 기록 조회
export async function getUserUsageDetails(
  userId: string,
  limit: number = 50
): Promise<{
  success: boolean;
  data?: DetailedUsageRecord[];
  message?: string;
}> {
  try {
    console.log(`[UsageStats] Fetching detailed usage for user: ${userId}`);
    
    const usageSnapshot = await firestore
      .collection('usageRecords')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const records: DetailedUsageRecord[] = [];
    
    usageSnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        timestamp: data.timestamp.toDate(),
        details: data.details || {}
      });
    });
    
    console.log(`[UsageStats] Found ${records.length} usage records for user ${userId}`);
    return { success: true, data: records };
  } catch (error) {
    console.error(`[UsageStats] Error fetching user usage details for ${userId}:`, error);
    return { success: false, message: '사용자 상세 기록을 불러오는 중 오류가 발생했습니다.' };
  }
}

// 사용 통계 요약 정보
export async function getUsageStatsSummary(): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    totalTarotReadings: number;
    totalDreamInterpretations: number;
    totalUsage: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    topUsers: UsageStats[];
  };
  message?: string;
}> {
  try {
    console.log('[UsageStats] Generating usage summary...');
    
    const statsSnapshot = await firestore.collection('userUsageStats').get();
    
    let totalUsers = 0;
    let totalTarotReadings = 0;
    let totalDreamInterpretations = 0;
    let totalUsage = 0;
    let activeUsersToday = 0;
    let activeUsersThisWeek = 0;
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const allStats: UsageStats[] = [];
    
    for (const doc of statsSnapshot.docs) {
      const data = doc.data();
      totalUsers++;
      totalTarotReadings += data.tarotReadings || 0;
      totalDreamInterpretations += data.dreamInterpretations || 0;
      totalUsage += data.totalUsage || 0;
      
      const lastActivity = data.updatedAt?.toDate();
      if (lastActivity) {
        if (lastActivity >= dayStart) {
          activeUsersToday++;
        }
        if (lastActivity >= weekAgo) {
          activeUsersThisWeek++;
        }
      }
      
      // 사용자 이메일 정보 추가
      let email = '';
      try {
        const userDoc = await firestore.collection('users').doc(doc.id).get();
        if (userDoc.exists) {
          email = userDoc.data()?.email || '';
        }
      } catch (emailError) {
        console.warn(`[UsageStats] Could not fetch email for user ${doc.id}`);
      }
      
      allStats.push({
        userId: doc.id,
        email,
        tarotReadings: data.tarotReadings || 0,
        dreamInterpretations: data.dreamInterpretations || 0,
        lastTarotReading: data.lastTarotReading?.toDate(),
        lastDreamInterpretation: data.lastDreamInterpretation?.toDate(),
        totalUsage: data.totalUsage || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    }
    
    // 상위 5명 사용자
    const topUsers = allStats
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 5);
    
    const summary = {
      totalUsers,
      totalTarotReadings,
      totalDreamInterpretations,
      totalUsage,
      activeUsersToday,
      activeUsersThisWeek,
      topUsers
    };
    
    console.log('[UsageStats] Usage summary generated:', summary);
    return { success: true, data: summary };
  } catch (error) {
    console.error('[UsageStats] Error generating usage summary:', error);
    return { success: false, message: '사용 통계 요약을 생성하는 중 오류가 발생했습니다.' };
  }
}