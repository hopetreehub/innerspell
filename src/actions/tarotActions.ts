'use server';

import { db } from '@/lib/firebase/admin';
import { TarotReadingHistory, TarotReadingHistorySchema } from '@/types';
import { cookies } from 'next/headers';

// Get user ID from cookies (for server actions)
async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  if (!userCookie) return null;
  
  try {
    const user = JSON.parse(userCookie.value);
    return user.uid;
  } catch {
    return null;
  }
}

// Save tarot reading to user's history
export async function saveTarotReading(data: Omit<TarotReadingHistory, 'id' | 'createdAt' | 'userId'>) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const validated = TarotReadingHistorySchema.parse({
      ...data,
      userId,
    });

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .add({
        ...validated,
        createdAt: new Date(),
      });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving tarot reading:', error);
    return { success: false, error: '저장 중 오류가 발생했습니다.' };
  }
}

// Get user's tarot reading history
export async function getTarotReadingHistory(limit = 10, startAfter?: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.', readings: [] };
    }

    let query = db
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfter) {
      const startDoc = await db
        .collection('users')
        .doc(userId)
        .collection('tarotReadings')
        .doc(startAfter)
        .get();
      
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();
    const readings: TarotReadingHistory[] = [];

    snapshot.forEach((doc: any) => {
      readings.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      } as TarotReadingHistory);
    });

    return { success: true, readings };
  } catch (error) {
    console.error('Error getting tarot reading history:', error);
    return { success: false, error: '데이터를 불러올 수 없습니다.', readings: [] };
  }
}

// Get single tarot reading
export async function getTarotReading(readingId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const doc = await db
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .doc(readingId)
      .get();

    if (!doc.exists) {
      return { success: false, error: '리딩을 찾을 수 없습니다.' };
    }

    const reading: TarotReadingHistory = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt.toDate(),
    } as TarotReadingHistory;

    return { success: true, reading };
  } catch (error) {
    console.error('Error getting tarot reading:', error);
    return { success: false, error: '데이터를 불러올 수 없습니다.' };
  }
}

// Delete tarot reading
export async function deleteTarotReading(readingId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    await db
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .doc(readingId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting tarot reading:', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}