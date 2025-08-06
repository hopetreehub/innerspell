'use server';

/**
 * @fileOverview 꿈 해몽 AI 프롬프트 설정을 위한 서버 액션 (Genkit 의존성 제거 버전)
 * 
 * Genkit 의존성 없이 직접 Firestore에 설정을 저장하는 방식으로 재구현
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase/admin';

export interface ConfigureDreamPromptSettingsInput {
  model: string;
  promptTemplate: string;
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface ConfigureDreamPromptSettingsOutput {
  success: boolean;
  message: string;
}

export async function configureDreamPromptSettings(
  input: ConfigureDreamPromptSettingsInput
): Promise<ConfigureDreamPromptSettingsOutput> {
  try {
    // Firebase Admin 초기화
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    
    // 모델에 프로바이더 접두사 추가
    let modelWithPrefix = input.model;
    if (!modelWithPrefix.includes('/')) {
      if (modelWithPrefix.includes('gpt') || modelWithPrefix.includes('o1')) {
        modelWithPrefix = `openai/${modelWithPrefix}`;
      } else if (modelWithPrefix.includes('gemini')) {
        modelWithPrefix = `googleai/${modelWithPrefix}`;
      } else if (modelWithPrefix.includes('claude')) {
        modelWithPrefix = `anthropic/${modelWithPrefix}`;
      } else {
        modelWithPrefix = `openai/${modelWithPrefix}`;
      }
      console.log(`[Dream Config] Added provider prefix: ${input.model} -> ${modelWithPrefix}`);
    }
    
    const settingsToSave = {
      model: modelWithPrefix,
      promptTemplate: input.promptTemplate,
      safetySettings: input.safetySettings || [],
      updatedAt: new Date().toISOString()
    };

    // Firestore에 설정 저장
    await db.collection('aiConfiguration').doc('dreamPromptSettings').set(settingsToSave, { merge: true });
    
    console.log('Dream Prompt settings saved to Firestore:', settingsToSave);

    return {
      success: true,
      message: '꿈 해몽 AI 프롬프트 설정이 성공적으로 저장되었습니다.',
    };
  } catch (error: any) {
    console.error('Failed to save Dream Prompt settings to Firestore:', error);
    return {
      success: false,
      message: `꿈 해몽 프롬프트 설정 저장 실패: ${error.message}`,
    };
  }
}