'use client';

import { doc, setDoc } from 'firebase/firestore';
import { db } from './client';

interface ShareReadingInput {
  question: string;
  spreadName: string;
  spreadNumCards: number;
  drawnCards: Array<{
    id: string;
    isReversed: boolean;
    position?: string;
  }>;
  interpretationText: string;
  timestamp?: string;
}

/**
 * 클라이언트 사이드에서 직접 Firestore에 공유 리딩 저장
 */
export async function shareReadingClient(
  input: ShareReadingInput
): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
  try {
    if (!db) {
      console.error('❌ Firebase db가 초기화되지 않음');
      return { 
        success: false, 
        error: '데이터베이스 연결을 확인하는 중입니다. 잠시 후 다시 시도해주세요.' 
      };
    }

    const { question, spreadName, spreadNumCards, drawnCards, interpretationText, timestamp } = input;

    // 입력 검증
    if (!question || !spreadName || !drawnCards || drawnCards.length === 0 || !interpretationText) {
      return { 
        success: false, 
        error: '공유할 리딩 정보가 누락되었습니다.' 
      };
    }

    // 고유한 공유 ID 생성
    const shareId = `tarot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 공유 리딩 데이터 생성
    const sharedReading = {
      id: shareId,
      question,
      spreadName,
      spreadNumCards,
      drawnCards,
      interpretationText,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
      viewCount: 0,
    };

    // Firestore에 저장
    await setDoc(doc(db, 'sharedReadings', shareId), sharedReading);

    // 현재 도메인 기반으로 공유 URL 생성
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://test-studio-firebase.vercel.app';
    
    const shareUrl = `${baseUrl}/reading/shared/${shareId}`;

    console.log('✅ 리딩 공유 성공:', shareUrl);

    return { 
      success: true, 
      shareUrl 
    };

  } catch (error) {
    console.error('❌ 리딩 공유 중 오류:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return { 
          success: false, 
          error: 'Firestore 보안 규칙에 의해 공유가 거부되었습니다.' 
        };
      }
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: false, 
      error: '리딩 공유 중 알 수 없는 오류가 발생했습니다.' 
    };
  }
}