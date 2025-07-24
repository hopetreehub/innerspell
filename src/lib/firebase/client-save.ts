'use client';

import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './client';
import type { SaveReadingInput } from '@/types';

/**
 * 클라이언트 사이드에서 직접 Firestore에 타로 리딩을 저장
 * Server Action 대신 사용하여 Firebase Admin SDK 의존성 제거
 */
export async function saveUserReadingClient(
  input: SaveReadingInput
): Promise<{ success: boolean; readingId?: string; error?: string }> {
  try {
    console.log('📝 저장 시도 - 입력 데이터:', {
      userId: input.userId,
      question: input.question?.substring(0, 50) + '...',
      spreadName: input.spreadName,
      spreadNumCards: input.spreadNumCards,
      drawnCardsCount: input.drawnCards?.length,
      interpretationLength: input.interpretationText?.length
    });

    // Firebase가 초기화되지 않았거나 Mock 모드인 경우
    if (!db) {
      console.error('❌ Firebase db가 초기화되지 않음');
      return { 
        success: false, 
        error: '데이터베이스 연결을 확인하는 중입니다. 잠시 후 다시 시도해주세요.' 
      };
    }

    const { userId, question, spreadName, spreadNumCards, drawnCards, interpretationText } = input;

    // 입력 검증
    if (!userId || !question || !spreadName || !drawnCards || drawnCards.length === 0 || !interpretationText) {
      console.error('❌ 입력 검증 실패:', {
        userId: !!userId,
        question: !!question,
        spreadName: !!spreadName,
        spreadNumCards: spreadNumCards,
        drawnCards: drawnCards,
        drawnCardsLength: drawnCards?.length || 0,
        interpretationText: !!interpretationText
      });
      return { 
        success: false, 
        error: '필수 정보가 누락되었습니다. 질문, 카드 선택, 해석이 모두 완료되었는지 확인해주세요.' 
      };
    }

    // drawnCards 데이터 형식 검증
    for (let i = 0; i < drawnCards.length; i++) {
      const card = drawnCards[i];
      if (!card || !card.id) {
        console.error(`❌ 카드 ${i + 1} 데이터 오류:`, card);
        return {
          success: false,
          error: `카드 데이터가 올바르지 않습니다. 카드 ${i + 1}번을 다시 선택해주세요.`
        };
      }
    }

    // Firestore에 저장할 데이터 준비
    const readingData = {
      userId,
      question: question.trim(),
      spreadName,
      spreadNumCards: spreadNumCards || drawnCards.length, // spreadNumCards가 없으면 drawnCards 길이 사용
      drawnCards: drawnCards.map((card, index) => ({
        id: card.id,
        isReversed: card.isReversed || false,
        position: card.position || `카드 ${index + 1}`
      })),
      interpretationText,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Firestore에 문서 추가
    const docRef = await addDoc(collection(db, 'userReadings'), readingData);
    
    console.log(`✅ 타로 리딩이 성공적으로 저장되었습니다. ID: ${docRef.id}`);
    
    return { 
      success: true, 
      readingId: docRef.id 
    };

  } catch (error) {
    console.error('❌ 타로 리딩 저장 중 오류:', error);
    
    // Firebase 오류 메시지 처리
    if (error instanceof Error) {
      // 권한 오류
      if (error.message.includes('permission-denied')) {
        return { 
          success: false, 
          error: 'Firestore 보안 규칙에 의해 저장이 거부되었습니다. 로그인 상태를 확인해주세요.' 
        };
      }
      // 네트워크 오류
      if (error.message.includes('network')) {
        return { 
          success: false, 
          error: '네트워크 연결을 확인해주세요.' 
        };
      }
      // 기타 Firebase 오류
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: false, 
      error: '리딩 저장 중 알 수 없는 오류가 발생했습니다.' 
    };
  }
}