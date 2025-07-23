'use server';

import { firestore } from '@/lib/firebase/admin';
import { 
  TarotCardInstruction, 
  TarotCardInstructionFormData,
  TarotCardInstructionFormSchema,
  TarotInstructionBatch,
  TarotInterpretationMethod 
} from '@/types';
import { z } from 'zod';

export async function saveTarotCardInstruction(
  formData: TarotCardInstructionFormData,
  userId: string,
  instructionId?: string
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const validation = TarotCardInstructionFormSchema.safeParse(formData);
    if (!validation.success) {
      return { success: false, message: '유효하지 않은 데이터입니다.' };
    }

    const { cardId, interpretationMethod, uprightInstruction, reversedInstruction, contextualHints, combinationHints } = validation.data;

    const instruction: TarotCardInstruction = {
      cardId,
      interpretationMethod,
      uprightInstruction,
      reversedInstruction,
      contextualHints,
      combinationHints,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = instructionId 
      ? firestore.collection('tarotCardInstructions').doc(instructionId)
      : firestore.collection('tarotCardInstructions').doc();

    await docRef.set(instruction);

    console.log(`[DEV MOCK] Saved tarot card instruction:`, { cardId, interpretationMethod });

    return { 
      success: true, 
      message: '타로 카드 지침이 성공적으로 저장되었습니다.',
      id: docRef.id
    };
  } catch (error) {
    console.error('Error saving tarot card instruction:', error);
    return { success: false, message: '타로 카드 지침 저장 중 오류가 발생했습니다.' };
  }
}

export async function getTarotCardInstructions(
  cardId?: string,
  interpretationMethod?: TarotInterpretationMethod
): Promise<{ success: boolean; data?: TarotCardInstruction[]; message?: string }> {
  try {
    let query = firestore.collection('tarotCardInstructions');

    if (cardId) {
      query = query.where('cardId', '==', cardId) as any;
    }

    if (interpretationMethod) {
      query = query.where('interpretationMethod', '==', interpretationMethod) as any;
    }

    const snapshot = await query.get();
    const instructions: TarotCardInstruction[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data() as TarotCardInstruction;
      instructions.push({ ...data, id: doc.id });
    });

    return { success: true, data: instructions };
  } catch (error) {
    console.error('Error getting tarot card instructions:', error);
    return { success: false, message: '타로 카드 지침을 불러오는 중 오류가 발생했습니다.' };
  }
}

export async function getTarotCardInstruction(
  cardId: string,
  interpretationMethod: TarotInterpretationMethod
): Promise<{ success: boolean; data?: TarotCardInstruction; message?: string }> {
  try {
    const snapshot = await firestore.collection('tarotCardInstructions')
      .where('cardId', '==', cardId)
      .where('interpretationMethod', '==', interpretationMethod)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { success: false, message: '지침을 찾을 수 없습니다.' };
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as TarotCardInstruction;
    
    return { success: true, data: { ...data, id: doc.id } };
  } catch (error) {
    console.error('Error getting tarot card instruction:', error);
    return { success: false, message: '타로 카드 지침을 불러오는 중 오류가 발생했습니다.' };
  }
}

export async function deleteTarotCardInstruction(
  instructionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = firestore.collection('tarotCardInstructions').doc(instructionId);
    await docRef.delete();

    console.log(`[DEV MOCK] Deleted tarot card instruction:`, instructionId);

    return { success: true, message: '타로 카드 지침이 성공적으로 삭제되었습니다.' };
  } catch (error) {
    console.error('Error deleting tarot card instruction:', error);
    return { success: false, message: '타로 카드 지침 삭제 중 오류가 발생했습니다.' };
  }
}

export async function batchUpdateTarotInstructions(
  operation: 'activate' | 'deactivate' | 'delete',
  instructionIds: string[],
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const batch = firestore.batch();

    for (const instructionId of instructionIds) {
      const docRef = firestore.collection('tarotCardInstructions').doc(instructionId);
      
      if (operation === 'delete') {
        batch.delete(docRef);
      } else {
        batch.update(docRef, {
          isActive: operation === 'activate',
          updatedAt: new Date()
        });
      }
    }

    await batch.commit();

    const operationNames = {
      activate: '활성화',
      deactivate: '비활성화',
      delete: '삭제'
    };

    console.log(`[DEV MOCK] Batch ${operation} tarot instructions:`, instructionIds.length);

    return { 
      success: true, 
      message: `${instructionIds.length}개의 지침이 성공적으로 ${operationNames[operation]}되었습니다.`
    };
  } catch (error) {
    console.error('Error batch updating tarot instructions:', error);
    return { success: false, message: '일괄 작업 중 오류가 발생했습니다.' };
  }
}

export async function importTarotInstructionTemplate(
  template: TarotInstructionBatch[],
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const batch = firestore.batch();
    let totalInstructions = 0;

    for (const cardBatch of template) {
      for (const instruction of cardBatch.instructions) {
        const docRef = firestore.collection('tarotCardInstructions').doc();
        batch.set(docRef, {
          ...instruction,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        totalInstructions++;
      }
    }

    await batch.commit();

    console.log(`[DEV MOCK] Imported tarot instruction template:`, totalInstructions);

    return { 
      success: true, 
      message: `${totalInstructions}개의 지침이 성공적으로 가져왔습니다.`
    };
  } catch (error) {
    console.error('Error importing tarot instruction template:', error);
    return { success: false, message: '템플릿 가져오기 중 오류가 발생했습니다.' };
  }
}

export async function exportTarotInstructionTemplate(
  interpretationMethod: TarotInterpretationMethod,
  templateName: string,
  description: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const snapshot = await firestore.collection('tarotCardInstructions')
      .where('interpretationMethod', '==', interpretationMethod)
      .get();

    const instructionsByCard: Record<string, TarotCardInstruction[]> = {};

    snapshot.forEach((doc: any) => {
      const data = doc.data() as TarotCardInstruction;
      if (!instructionsByCard[data.cardId]) {
        instructionsByCard[data.cardId] = [];
      }
      instructionsByCard[data.cardId].push(data);
    });

    const template: TarotInstructionBatch[] = Object.entries(instructionsByCard)
      .map(([cardId, instructions]) => ({
        cardId,
        instructions
      }));

    const exportData = {
      templateName,
      description,
      interpretationMethod,
      version: '1.0',
      exportedAt: new Date(),
      template
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Error exporting tarot instruction template:', error);
    return { success: false, message: '템플릿 내보내기 중 오류가 발생했습니다.' };
  }
}

export async function getTarotInstructionStats(): Promise<{
  success: boolean;
  data?: {
    totalInstructions: number;
    instructionsByMethod: Record<string, number>;
    instructionsByCard: Record<string, number>;
    completionPercentage: number;
  };
  message?: string;
}> {
  try {
    const snapshot = await firestore.collection('tarotCardInstructions').get();
    
    const stats = {
      totalInstructions: snapshot.size,
      instructionsByMethod: {} as Record<string, number>,
      instructionsByCard: {} as Record<string, number>,
      completionPercentage: 0
    };

    snapshot.forEach((doc: any) => {
      const data = doc.data() as TarotCardInstruction;
      
      // Count by method
      if (!stats.instructionsByMethod[data.interpretationMethod]) {
        stats.instructionsByMethod[data.interpretationMethod] = 0;
      }
      stats.instructionsByMethod[data.interpretationMethod]++;

      // Count by card
      if (!stats.instructionsByCard[data.cardId]) {
        stats.instructionsByCard[data.cardId] = 0;
      }
      stats.instructionsByCard[data.cardId]++;
    });

    // Calculate completion percentage (assuming 78 cards * 6 methods = 468 total possible)
    const totalPossibleInstructions = 78 * 6;
    stats.completionPercentage = (stats.totalInstructions / totalPossibleInstructions) * 100;

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting tarot instruction stats:', error);
    return { success: false, message: '통계를 불러오는 중 오류가 발생했습니다.' };
  }
}