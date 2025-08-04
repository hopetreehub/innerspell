'use server';

import { getFirestore, getFieldValue, safeFirestoreOperation } from '@/lib/firebase/admin-helpers';
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
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  try {
    const validated = TarotReadingHistorySchema.parse({
      ...data,
      userId,
    });

    const result = await safeFirestoreOperation(async (firestore) => {
      const docRef = await firestore
        .collection('users')
        .doc(userId)
        .collection('tarotReadings')
        .add({
          ...validated,
          createdAt: new Date(),
        });

      return { success: true, id: docRef.id };
    });

    if (!result.success) {
      console.error('Error saving tarot reading:', result.error);
      return { success: false, error: result.error };
    }

    return result.data;
  } catch (error) {
    console.error('Error saving tarot reading:', error);
    return { success: false, error: '저장 중 오류가 발생했습니다.' };
  }
}

// Get user's tarot reading history
export async function getTarotReadingHistory(limit = 10, startAfter?: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.', readings: [] };
  }

  const result = await safeFirestoreOperation(async (firestore) => {
    let query = firestore
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfter) {
      const startDoc = await firestore
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
  });

  if (!result.success) {
    console.error('Error getting tarot reading history:', result.error);
    return { success: false, error: result.error, readings: [] };
  }

  return result.data;
}

// Get single tarot reading
export async function getTarotReading(readingId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const result = await safeFirestoreOperation(async (firestore) => {
    const doc = await firestore
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .doc(readingId)
      .get();

    if (!doc.exists) {
      throw new Error('리딩을 찾을 수 없습니다.');
    }

    const reading: TarotReadingHistory = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt.toDate(),
    } as TarotReadingHistory;

    return { success: true, reading };
  });

  if (!result.success) {
    console.error('Error getting tarot reading:', result.error);
    return { success: false, error: result.error };
  }

  return result.data;
}

// Delete tarot reading
export async function deleteTarotReading(readingId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const result = await safeFirestoreOperation(async (firestore) => {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .doc(readingId)
      .delete();

    return { success: true };
  });

  if (!result.success) {
    console.error('Error deleting tarot reading:', result.error);
    return { success: false, error: result.error };
  }

  return result.data;
}