'use client';

import { doc, setDoc, getDoc } from 'firebase/firestore';
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
): Promise<{ success: boolean; shareUrl?: string; error?: string; warning?: string }> {
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
    try {
      await setDoc(doc(db, 'sharedReadings', shareId), sharedReading);
    } catch (firestoreError: any) {
      // 권한 오류인 경우 로컬 스토리지에 임시 저장
      if (firestoreError?.code === 'permission-denied') {
        console.warn('⚠️ Firestore 권한 오류 - 로컬 스토리지에 임시 저장');
        
        // 로컬 스토리지에 저장
        if (typeof window !== 'undefined') {
          const localShares = JSON.parse(localStorage.getItem('localSharedReadings') || '{}');
          localShares[shareId] = sharedReading;
          localStorage.setItem('localSharedReadings', JSON.stringify(localShares));
          
          // 공유 URL은 동일하게 생성
          const baseUrl = window.location.origin;
          const shareUrl = `${baseUrl}/reading/shared/${shareId}`;
          
          return {
            success: true,
            shareUrl,
            warning: 'Firestore 권한 문제로 임시 저장되었습니다. 링크는 현재 브라우저에서만 유효합니다.'
          };
        }
      }
      throw firestoreError;
    }

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

/**
 * 클라이언트 사이드에서 직접 Firestore에서 공유 리딩 조회
 */
export async function getSharedReadingClient(
  shareId: string
): Promise<{ success: boolean; reading?: any; error?: string }> {
  try {
    if (!db) {
      console.error('❌ Firebase db가 초기화되지 않음');
      return { 
        success: false, 
        error: '데이터베이스 연결을 확인하는 중입니다.' 
      };
    }

    if (!shareId) {
      return { 
        success: false, 
        error: '공유 ID가 제공되지 않았습니다.' 
      };
    }

    // 먼저 로컬 스토리지 확인
    if (typeof window !== 'undefined') {
      const localShares = JSON.parse(localStorage.getItem('localSharedReadings') || '{}');
      if (localShares[shareId]) {
        console.log('✅ 로컬 스토리지에서 공유 리딩 조회 성공:', shareId);
        return {
          success: true,
          reading: localShares[shareId]
        };
      }
    }

    // Firestore에서 공유 리딩 조회
    const docRef = doc(db, 'sharedReadings', shareId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { 
        success: false, 
        error: '공유된 리딩을 찾을 수 없습니다. 링크가 만료되었거나 존재하지 않습니다.' 
      };
    }

    const reading = docSnap.data();

    // 만료 확인
    if (reading.expiresAt && new Date(reading.expiresAt) < new Date()) {
      return { 
        success: false, 
        error: '공유 링크가 만료되었습니다.' 
      };
    }

    console.log('✅ 공유 리딩 조회 성공:', shareId);

    return { 
      success: true, 
      reading 
    };

  } catch (error) {
    console.error('❌ 공유 리딩 조회 중 오류:', error);
    
    if (error instanceof Error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { 
      success: false, 
      error: '공유 리딩 조회 중 알 수 없는 오류가 발생했습니다.' 
    };
  }
}