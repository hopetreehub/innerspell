'use client';

import { collection, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './client';
import type { SavedReading, SavedReadingCard } from '@/types';
import { findCardById } from '@/data/all-tarot-cards';

/**
 * 클라이언트 사이드에서 직접 Firestore에서 사용자 리딩 조회
 */
export async function getUserReadingsClient(userId: string): Promise<SavedReading[]> {
  if (!userId || !db) {
    console.warn('getUserReadingsClient: No userId or database connection.');
    return [];
  }
  
  console.log(`🔍 사용자 리딩 조회 중: ${userId}`);
  
  try {
    const q = query(
      collection(db, 'userReadings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`📊 조회 결과: ${snapshot.docs.length}개 문서 발견`);
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const now = new Date();

      // Firestore Timestamp를 Date로 변환
      const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate() : now;
        
      // 저장된 카드 ID와 방향에서 전체 카드 정보 복원
      const rawDrawnCards = (data?.drawnCards as { id: string; isReversed: boolean; position?: string }[]) || [];
      const drawnCards: SavedReadingCard[] = rawDrawnCards.map(rawCard => {
        const cardDetails = findCardById(rawCard.id);
        return {
          id: rawCard.id,
          isReversed: rawCard.isReversed,
          position: rawCard.position || '알 수 없는 위치',
          name: cardDetails?.nameKorean || cardDetails?.name || '알 수 없는 카드',
          imageSrc: cardDetails?.imageUrl || '/images/tarot/back.png',
        };
      });

      return {
        id: doc.id,
        userId: data?.userId || '',
        question: data?.question || 'No question provided',
        spreadName: data?.spreadName || 'Unknown Spread',
        spreadNumCards: data?.spreadNumCards || 0,
        drawnCards: drawnCards,
        interpretationText: data?.interpretationText || 'No interpretation text.',
        createdAt: createdAt,
      } as SavedReading;
    });
  } catch (error) {
    console.error(`❌ 사용자 ${userId}의 리딩 조회 중 오류:`, error);
    return [];
  }
}

/**
 * 클라이언트 사이드에서 직접 Firestore에서 사용자 리딩 삭제
 */
export async function deleteUserReadingClient(userId: string, readingId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId || !readingId || !db) {
    return { success: false, error: '필수 정보가 누락되었습니다.' };
  }
  
  try {
    const readingRef = doc(db, 'userReadings', readingId);
    
    // 문서 조회하여 소유자 확인
    const readingDoc = await getDocs(
      query(
        collection(db, 'userReadings'),
        where('userId', '==', userId)
      )
    );
    
    const userReading = readingDoc.docs.find(d => d.id === readingId);
    if (!userReading) {
      return { success: false, error: '삭제할 리딩을 찾을 수 없거나 권한이 없습니다.' };
    }

    await deleteDoc(readingRef);
    console.log(`✅ 리딩 ${readingId}가 성공적으로 삭제되었습니다.`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ 리딩 삭제 중 오류:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '리딩 삭제 중 알 수 없는 오류가 발생했습니다.' 
    };
  }
}