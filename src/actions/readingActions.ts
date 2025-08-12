
'use server';

import { z } from 'zod';
import { firestore } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { SavedReading, SavedReadingCard } from '@/types';
import { findCardById } from '@/data/all-tarot-cards';
import { SaveReadingInputSchema, type SaveReadingInput } from '@/types';
import { 
  saveReadingToFile, 
  getUserReadingsFromFile, 
  getReadingByIdFromFile,
  deleteReadingFromFile 
} from '@/services/tarot-reading-service-file';


export async function saveUserReading(
  input: SaveReadingInput
): Promise<{ success: boolean; readingId?: string; error?: string | object }> {
  try {
    console.log('💾 리딩 저장 시작');
    console.log('📤 저장 요청 데이터:', {
      userId: input.userId,
      question: input.question?.substring(0, 50) + '...',
      spreadName: input.spreadName,
      drawnCardsCount: input.drawnCards?.length || 0
    });
    
    // Validate the input using the centralized schema from types/index.ts
    const validationResult = SaveReadingInputSchema.safeParse(input);
    if (!validationResult.success) {
      console.error("리딩 저장 유효성 검사 실패:", JSON.stringify(validationResult.error.flatten(), null, 2));
      return { success: false, error: validationResult.error.flatten().fieldErrors };
    }

    const { userId, question, spreadName, spreadNumCards, drawnCards, interpretationText } = validationResult.data;

    // 개발 환경 또는 Firebase 설정이 없을 때 파일 저장 사용
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         !process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                         process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에');
    
    if (isDevelopment) {
      console.log('📁 개발 환경: 파일 시스템에 저장');
      
      // drawnCards를 전체 카드 정보로 확장
      const enrichedCards = drawnCards.map((card, index) => {
        const cardDetails = findCardById(card.id);
        return {
          id: card.id,
          name: cardDetails?.nameKorean || cardDetails?.name || card.id,
          imageSrc: cardDetails?.imageUrl || `/images/tarot/${card.id}.png`,
          isReversed: card.isReversed,
          position: card.position || `카드 ${index + 1}`
        };
      });
      
      const result = await saveReadingToFile(userId, {
        question,
        spreadName,
        spreadNumCards,
        drawnCards: enrichedCards,
        interpretationText,
        interpretationStyle: (input as any).interpretationStyle // 해석 스타일 정보도 저장
      });
      
      if (result.success) {
        console.log(`✅ 파일 저장 성공: ${result.readingId}`);
      }
      return result;
    }
    
    // 프로덕션 환경: Firebase 사용
    console.log('🔥 프로덕션 환경: Firebase에 저장');
    
    // Ensure position has a fallback value
    const drawnCardsWithPosition = drawnCards.map((card, index) => ({
      ...card,
      position: card.position || `카드 ${index + 1}`
    }));

    const readingData = {
      userId,
      question,
      spreadName,
      spreadNumCards,
      drawnCards: drawnCardsWithPosition, // Saves the simplified, validated card info with position fallback
      interpretationText,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection('userReadings').add(readingData);
    console.log(`User reading saved successfully with ID: ${docRef.id} for user ${userId}.`);
    return { success: true, readingId: docRef.id };

  } catch (error) {
    console.error('🚨 서버 액션 저장 실패:', error instanceof Error ? error.message : error);
    console.error('🚨 Full error object:', error);
    
    // Firebase specific error handling
    if (error instanceof Error) {
      if (error.message.includes('illegal characters')) {
        console.error('🚨 Firebase 설정 오류: projectId에 불법 문자 포함');
        return { success: false, error: 'Firebase 연결 설정 오류입니다. 관리자에게 문의하세요.' };
      }
      if (error.message.includes('permission')) {
        console.error('🚨 Firebase 권한 오류');
        return { success: false, error: 'Firebase 권한 오류입니다. 관리자에게 문의하세요.' };
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : '리딩 저장 중 알 수 없는 오류가 발생했습니다.' };
  }
}

export async function getUserReadings(userId: string): Promise<SavedReading[]> {
  if (!userId) {
    console.warn('getUserReadings called without userId.');
    return [];
  }
  
  console.log(`🔍 getUserReadings called with userId: ${userId}`);
  
  // 개발 환경 또는 Firebase 설정이 없을 때 파일에서 읽기
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       !process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                       process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에');
  
  if (isDevelopment) {
    console.log('📁 개발 환경: 파일에서 리딩 목록 읽기');
    const readings = await getUserReadingsFromFile(userId);
    console.log(`📊 파일에서 ${readings.length}개의 리딩 발견`);
    return readings;
  }
  
  // 프로덕션 환경: Firebase 사용
  console.log('🔥 프로덕션 환경: Firebase에서 리딩 목록 읽기');
  
  try {
    const snapshot = await firestore
      .collection('userReadings')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50) // Limit to last 50 readings for performance
      .get();
    
    console.log(`📊 Query results: ${snapshot.docs.length} documents found`);
    
    if (snapshot.docs.length > 0) {
      console.log('📋 Found readings:');
      snapshot.docs.forEach((doc: any, index: number) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}, Question: "${data.question}", UserID: ${data.userId}`);
      });
    }

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const now = new Date();

      const createdAt = (data?.createdAt && typeof data.createdAt.toDate === 'function')
        ? data.createdAt.toDate()
        : now;
        
      // Reconstruct full card details from saved IDs and orientation
      const rawDrawnCards = (data?.drawnCards as { id: string; isReversed: boolean; position?: string }[]) || [];
      const drawnCards: SavedReadingCard[] = rawDrawnCards.map(rawCard => {
        const cardDetails = findCardById(rawCard.id);
        return {
          id: rawCard.id,
          isReversed: rawCard.isReversed,
          position: rawCard.position || '알 수 없는 위치',
          name: cardDetails?.nameKorean || cardDetails?.name || '알 수 없는 카드',
          imageSrc: cardDetails?.imageUrl || '/images/tarot/back.png', // Fallback image
        };
      });

      return {
        id: doc.id,
        userId: data?.userId || '',
        question: data?.question || 'No question provided',
        spreadName: data?.spreadName || 'Unknown Spread',
        spreadNumCards: data?.spreadNumCards || 0,
        drawnCards: drawnCards, // Use the reconstructed rich card data
        interpretationText: data?.interpretationText || 'No interpretation text.',
        createdAt: createdAt,
      } as SavedReading;
    });
  } catch (error) {
    console.error(`Error fetching readings for user ${userId}:`, error);
    // Instead of throwing, return an empty array to prevent UI crash.
    return [];
  }
}

export async function deleteUserReading(userId: string, readingId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId || !readingId) {
    return { success: false, error: '사용자 ID 또는 리딩 ID가 제공되지 않았습니다.' };
  }
  
  // 개발 환경 또는 Firebase 설정이 없을 때 파일에서 삭제
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       !process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                       process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에');
  
  if (isDevelopment) {
    console.log('📁 개발 환경: 파일에서 리딩 삭제');
    return await deleteReadingFromFile(userId, readingId);
  }
  
  // 프로덕션 환경: Firebase 사용
  console.log('🔥 프로덕션 환경: Firebase에서 리딩 삭제');
  
  try {
    const readingRef = firestore.collection('userReadings').doc(readingId);
    const doc = await readingRef.get();

    if (!doc.exists) {
      return { success: false, error: '삭제할 리딩을 찾을 수 없습니다.' };
    }

    if (doc.data()?.userId !== userId) {
      return { success: false, error: '이 리딩을 삭제할 권한이 없습니다.' };
    }

    await readingRef.delete();
    console.log(`User reading ${readingId} deleted successfully for user ${userId}.`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user reading from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : '리딩 삭제 중 알 수 없는 오류가 발생했습니다.' };
  }
}
