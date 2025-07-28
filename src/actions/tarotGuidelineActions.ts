'use server';

import { firestore } from '@/lib/firebase/admin';
import { 
  TarotGuideline, 
  TarotSpread, 
  InterpretationStyle, 
  SpreadStyleCombination,
  TarotGuidelinesResponse,
  SaveGuidelineRequest,
  UpdateGuidelineRequest 
} from '@/types/tarot-guidelines';
import { TAROT_SPREADS, INTERPRETATION_STYLES } from '@/data/tarot-spreads';
import { TAROT_GUIDELINES, SPREAD_STYLE_COMBINATIONS } from '@/data/tarot-guidelines';

// Firebase Admin이 사용할 수 없을 때의 폴백 처리
const isFirebaseAdminAvailable = () => {
  return firestore !== null;
};

// 캐시 관리
let guidelinesCache: TarotGuidelinesResponse | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시

// 모든 타로 지침 데이터 가져오기
export async function getAllTarotGuidelines(forceRefresh = false): Promise<TarotGuidelinesResponse> {
  try {
    console.log('[tarotGuidelineActions] Fetching all tarot guidelines...');
    
    // 캐시 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh && guidelinesCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('[tarotGuidelineActions] Returning cached data');
      return guidelinesCache;
    }
    
    let customGuidelines: TarotGuideline[] = [];
    
    // Firebase Admin이 사용 가능할 때만 Firestore에서 데이터 가져오기
    if (isFirebaseAdminAvailable() && firestore) {
      try {
        console.log('[tarotGuidelineActions] Querying Firestore for custom guidelines...');
        const customGuidelinesSnapshot = await firestore.collection('tarotGuidelines').get();
        
        customGuidelinesSnapshot.docs.forEach(doc => {
          const data = doc.data() as TarotGuideline;
          customGuidelines.push({ ...data, id: doc.id });
        });
        
        console.log('[tarotGuidelineActions] Found custom guidelines:', customGuidelines.length);
      } catch (firestoreError) {
        console.warn('[tarotGuidelineActions] Firestore access failed, using local data only:', firestoreError);
      }
    } else {
      console.log('[tarotGuidelineActions] Firebase Admin not available, using local data only');
    }
    
    // 시스템 기본 데이터와 커스텀 데이터 합치기
    const allGuidelines = [...TAROT_GUIDELINES, ...customGuidelines];
    
    // 중복 제거 (ID 기준)
    const uniqueGuidelines = allGuidelines.filter((guideline, index, self) => 
      index === self.findIndex(g => g.id === guideline.id)
    );
    
    console.log('[tarotGuidelineActions] Total unique guidelines:', uniqueGuidelines.length);
    
    const response: TarotGuidelinesResponse = {
      success: true,
      data: {
        spreads: TAROT_SPREADS,
        styles: INTERPRETATION_STYLES,
        guidelines: uniqueGuidelines,
        combinations: SPREAD_STYLE_COMBINATIONS,
        stats: {
          totalGuidelines: uniqueGuidelines.length,
          systemGuidelines: TAROT_GUIDELINES.length,
          customGuidelines: customGuidelines.length,
          lastUpdated: new Date().toISOString()
        }
      }
    };
    
    // 캐시 업데이트
    guidelinesCache = response;
    cacheTimestamp = Date.now();
    
    console.log('[tarotGuidelineActions] Successfully loaded and cached guidelines:', {
      total: uniqueGuidelines.length,
      system: TAROT_GUIDELINES.length,
      custom: customGuidelines.length
    });
    
    return response;
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching tarot guidelines:', error);
    
    // 에러 발생 시 최소한 로컬 데이터라도 반환
    return {
      success: true,
      data: {
        spreads: TAROT_SPREADS,
        styles: INTERPRETATION_STYLES,
        guidelines: TAROT_GUIDELINES,
        combinations: SPREAD_STYLE_COMBINATIONS
      },
      message: '로컬 데이터만 로드되었습니다. 일부 기능이 제한될 수 있습니다.'
    };
  }
}

// 특정 스프레드의 지침들 가져오기
export async function getGuidelinesBySpread(spreadId: string): Promise<TarotGuidelinesResponse> {
  try {
    const allData = await getAllTarotGuidelines();
    if (!allData.success || !allData.data) {
      return allData;
    }
    
    const spreadGuidelines = allData.data.guidelines.filter(
      guideline => guideline.spreadId === spreadId
    );
    
    return {
      success: true,
      data: {
        ...allData.data,
        guidelines: spreadGuidelines
      }
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching guidelines by spread:', error);
    return {
      success: false,
      message: '스프레드별 지침을 불러오는 중 오류가 발생했습니다.'
    };
  }
}

// 특정 해석 스타일의 지침들 가져오기
export async function getGuidelinesByStyle(styleId: string): Promise<TarotGuidelinesResponse> {
  try {
    const allData = await getAllTarotGuidelines();
    if (!allData.success || !allData.data) {
      return allData;
    }
    
    const styleGuidelines = allData.data.guidelines.filter(
      guideline => guideline.styleId === styleId
    );
    
    return {
      success: true,
      data: {
        ...allData.data,
        guidelines: styleGuidelines
      }
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching guidelines by style:', error);
    return {
      success: false,
      message: '스타일별 지침을 불러오는 중 오류가 발생했습니다.'
    };
  }
}

// 특정 스프레드와 스타일 조합의 지침 가져오기
export async function getGuidelineBySpreadAndStyle(
  spreadId: string, 
  styleId: string
): Promise<{ success: boolean; data?: TarotGuideline; message?: string }> {
  try {
    const allData = await getAllTarotGuidelines();
    if (!allData.success || !allData.data) {
      return {
        success: false,
        message: allData.message
      };
    }
    
    const guideline = allData.data.guidelines.find(
      g => g.spreadId === spreadId && g.styleId === styleId
    );
    
    if (!guideline) {
      return {
        success: false,
        message: '해당 조합의 지침을 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      data: guideline
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching guideline by combination:', error);
    return {
      success: false,
      message: '지침을 불러오는 중 오류가 발생했습니다.'
    };
  }
}

// 새로운 지침 저장
export async function saveTarotGuideline(
  request: SaveGuidelineRequest
): Promise<{ success: boolean; id?: string; message: string }> {
  try {
    // Firebase Admin이 사용 가능한지 확인
    if (!isFirebaseAdminAvailable() || !firestore) {
      console.warn('[tarotGuidelineActions] Firebase Admin not available for saving');
      return {
        success: false,
        message: 'Firebase Admin이 초기화되지 않았습니다. 데이터베이스 연결을 확인해주세요.'
      };
    }

    const guideline: Omit<TarotGuideline, 'id'> = {
      ...request.guideline,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await firestore.collection('tarotGuidelines').add(guideline);
    
    console.log('[tarotGuidelineActions] Saved new guideline:', docRef.id);
    
    return {
      success: true,
      id: docRef.id,
      message: '타로 지침이 성공적으로 저장되었습니다.'
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error saving guideline:', error);
    return {
      success: false,
      message: `타로 지침 저장 중 오류가 발생했습니다: ${(error as Error).message}`
    };
  }
}

// 지침 업데이트
export async function updateTarotGuideline(
  request: UpdateGuidelineRequest
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isFirebaseAdminAvailable() || !firestore) {
      return {
        success: false,
        message: 'Firebase Admin이 초기화되지 않았습니다. 데이터베이스 연결을 확인해주세요.'
      };
    }

    const updates = {
      ...request.updates,
      updatedAt: new Date()
    };
    
    await firestore.collection('tarotGuidelines').doc(request.id).update(updates);
    
    console.log('[tarotGuidelineActions] Updated guideline:', request.id);
    
    return {
      success: true,
      message: '타로 지침이 성공적으로 업데이트되었습니다.'
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error updating guideline:', error);
    return {
      success: false,
      message: `타로 지침 업데이트 중 오류가 발생했습니다: ${(error as Error).message}`
    };
  }
}

// 지침 삭제
export async function deleteTarotGuideline(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isFirebaseAdminAvailable() || !firestore) {
      return {
        success: false,
        message: 'Firebase Admin이 초기화되지 않았습니다. 데이터베이스 연결을 확인해주세요.'
      };
    }

    await firestore.collection('tarotGuidelines').doc(id).delete();
    
    console.log('[tarotGuidelineActions] Deleted guideline:', id);
    
    return {
      success: true,
      message: '타로 지침이 성공적으로 삭제되었습니다.'
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error deleting guideline:', error);
    return {
      success: false,
      message: `타로 지침 삭제 중 오류가 발생했습니다: ${(error as Error).message}`
    };
  }
}

// 지침 활성화/비활성화
export async function toggleGuidelineStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[tarotGuidelineActions] Toggling guideline status:', { id, isActive });
    
    // 시스템 디폴트 지침인지 확인
    const isSystemGuideline = TAROT_GUIDELINES.some(g => g.id === id);
    
    if (isSystemGuideline) {
      // 시스템 지침은 수정 불가
      console.log('[tarotGuidelineActions] Cannot toggle system guideline:', id);
      return {
        success: false,
        message: '시스템 기본 지침은 상태를 변경할 수 없습니다.'
      };
    }
    
    if (!isFirebaseAdminAvailable() || !firestore) {
      // Firebase Admin이 사용 불가능하면 로컬 상태만 변경
      console.warn('[tarotGuidelineActions] Firebase Admin not available, simulating toggle');
      
      // 캐시 무효화
      guidelinesCache = null;
      
      return {
        success: true,
        message: `타로 지침이 ${isActive ? '활성화' : '비활성화'}되었습니다. (로컬)`
      };
    }

    await firestore.collection('tarotGuidelines').doc(id).update({
      isActive,
      updatedAt: new Date()
    });
    
    // 캐시 무효화
    guidelinesCache = null;
    
    console.log('[tarotGuidelineActions] Toggled guideline status:', id, isActive);
    
    return {
      success: true,
      message: `타로 지침이 ${isActive ? '활성화' : '비활성화'}되었습니다.`
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error toggling guideline status:', error);
    return {
      success: false,
      message: `타로 지침 상태 변경 중 오류가 발생했습니다: ${(error as Error).message}`
    };
  }
}

// 사용 가능한 스프레드 목록 가져오기
export async function getAvailableSpreads(): Promise<{ success: boolean; data?: TarotSpread[]; message?: string }> {
  try {
    return {
      success: true,
      data: TAROT_SPREADS
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching spreads:', error);
    return {
      success: false,
      message: '스프레드 목록을 불러오는 중 오류가 발생했습니다.'
    };
  }
}

// 사용 가능한 해석 스타일 목록 가져오기
export async function getAvailableStyles(): Promise<{ success: boolean; data?: InterpretationStyle[]; message?: string }> {
  try {
    return {
      success: true,
      data: INTERPRETATION_STYLES
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching styles:', error);
    return {
      success: false,
      message: '해석 스타일 목록을 불러오는 중 오류가 발생했습니다.'
    };
  }
}

// 스프레드-스타일 조합 정보 가져오기
export async function getSpreadStyleCombination(
  spreadId: string,
  styleId: string
): Promise<{ success: boolean; data?: SpreadStyleCombination; message?: string }> {
  try {
    const combination = SPREAD_STYLE_COMBINATIONS.find(
      combo => combo.spreadId === spreadId && combo.styleId === styleId
    );
    
    return {
      success: true,
      data: combination
    };
  } catch (error) {
    console.error('[tarotGuidelineActions] Error fetching combination:', error);
    return {
      success: false,
      message: '조합 정보를 불러오는 중 오류가 발생했습니다.'
    };
  }
}