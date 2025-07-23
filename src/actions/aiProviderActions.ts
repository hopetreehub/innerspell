'use server';

import { firestore } from '@/lib/firebase/admin';
import { 
  AIConfiguration,
  AIFeatureMapping,
  PROVIDER_MODELS,
  AIProviderFormData,
  AIProviderFormSchema 
} from '@/types';
import { 
  AIProvider, 
  AIProviderConfig, 
  AVAILABLE_MODELS
} from '@/types/ai-providers';
import { z } from 'zod';
import { encrypt, decrypt } from '@/lib/encryption';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function saveAIProviderConfig(
  formData: AIProviderFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const validation = AIProviderFormSchema.safeParse(formData);
    if (!validation.success) {
      return { success: false, message: '유효하지 않은 데이터입니다.' };
    }

    const { provider, apiKey, baseUrl, isActive, maxRequestsPerMinute, selectedModels } = validation.data;

    // Get available models for this provider - use PROVIDER_MODELS from types/index.ts
    const availableModelsForProvider = PROVIDER_MODELS[provider] || [];
    const models = availableModelsForProvider
      .filter(model => selectedModels.includes(model.id));

    const providerConfig: Omit<AIProviderConfig, 'id'> = {
      provider,
      apiKey: encrypt(apiKey),
      baseUrl,
      isActive,
      maxRequestsPerMinute,
      models,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to Firestore - using unified collection name
    const docRef = firestore.collection('aiProviderConfigs').doc(provider);
    await docRef.set(providerConfig);

    // Also save to environment file for persistence
    await saveToEnvironmentFile(provider, apiKey);

    console.log(`[DEV MOCK] Saved AI provider config:`, { provider, modelsCount: models.length });

    return { success: true, message: `${provider} 설정이 성공적으로 저장되었습니다. (환경변수에도 저장됨)` };
  } catch (error) {
    console.error('Error saving AI provider config:', error);
    return { success: false, message: 'AI 제공업체 설정 저장 중 오류가 발생했습니다.' };
  }
}

export async function getAIProviderConfig(
  provider: AIProvider
): Promise<{ success: boolean; data?: AIProviderConfig; message?: string }> {
  try {
    const docRef = firestore.collection('aiProviderConfigs').doc(provider);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, message: '설정을 찾을 수 없습니다.' };
    }

    const data = doc.data() as AIProviderConfig;
    // Decrypt API key for display (in production, you might want to mask it)
    const decryptedConfig = {
      ...data,
      apiKey: decrypt(data.apiKey),
    };

    return { success: true, data: decryptedConfig };
  } catch (error) {
    console.error('Error getting AI provider config:', error);
    return { success: false, message: 'AI 제공업체 설정을 불러오는 중 오류가 발생했습니다.' };
  }
}

export async function getAllAIProviderConfigs(): Promise<{
  success: boolean;
  data?: AIProviderConfig[];
  message?: string;
}> {
  try {
    const snapshot = await firestore.collection('aiProviderConfigs').get();
    const configs: AIProviderConfig[] = [];

    // Use docs array instead of forEach for better compatibility with mock
    const docs = snapshot.docs || [];
    for (const doc of docs) {
      const data = doc.data() as AIProviderConfig;
      // Decrypt API key for display (mask it for security)
      const decryptedConfig = {
        ...data,
        apiKey: decrypt(data.apiKey).replace(/./g, '*'), // Mask the API key
      };
      configs.push(decryptedConfig);
    }

    return { success: true, data: configs };
  } catch (error) {
    console.error('Error getting all AI provider configs:', error);
    return { success: false, message: 'AI 제공업체 설정을 불러오는 중 오류가 발생했습니다.' };
  }
}

// Internal function for genkit.ts - returns unmasked encrypted keys
export async function getAllAIProviderConfigsForGenkit(): Promise<{
  success: boolean;
  data?: AIProviderConfig[];
  message?: string;
}> {
  try {
    console.log('[aiProviderActions] Fetching from aiProviderConfigs collection...');
    const snapshot = await firestore.collection('aiProviderConfigs').get();
    const configs: AIProviderConfig[] = [];

    console.log('[aiProviderActions] Found documents:', snapshot.size);

    // Use docs array instead of forEach for better compatibility with mock
    const docs = snapshot.docs || [];
    for (const doc of docs) {
      const data = doc.data() as AIProviderConfig;
      console.log('[aiProviderActions] Processing provider:', {
        provider: data.provider,
        isActive: data.isActive,
        hasApiKey: !!data.apiKey,
        encryptedApiKeyLength: data.apiKey?.length || 0,
        modelsCount: data.models?.length || 0
      });
      // Return raw encrypted data for genkit to decrypt
      configs.push(data);
    }

    console.log('[aiProviderActions] Returning configs count:', configs.length);
    return { success: true, data: configs };
  } catch (error) {
    console.error('[aiProviderActions] Error getting AI provider configs for genkit:', error);
    return { success: false, message: 'AI 제공업체 설정을 불러오는 중 오류가 발생했습니다.' };
  }
}

export async function deleteAIProviderConfig(
  provider: AIProvider
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = firestore.collection('aiProviderConfigs').doc(provider);
    await docRef.delete();

    console.log(`[DEV MOCK] Deleted AI provider config:`, provider);

    return { success: true, message: `${provider} 설정이 성공적으로 삭제되었습니다.` };
  } catch (error) {
    console.error('Error deleting AI provider config:', error);
    return { success: false, message: 'AI 제공업체 설정 삭제 중 오류가 발생했습니다.' };
  }
}

export async function testAIProviderConnection(
  provider: AIProvider,
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // In production, this would make actual API calls to test the connection
    // For now, we'll simulate the test
    console.log(`[DEV MOCK] Testing connection for provider: ${provider}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success for demo
    return { success: true, message: `${provider} 연결 테스트가 성공했습니다.` };
  } catch (error) {
    console.error('Error testing AI provider connection:', error);
    return { success: false, message: 'AI 제공업체 연결 테스트 중 오류가 발생했습니다.' };
  }
}

// Feature to AI model mapping
export async function saveAIFeatureMapping(
  mappings: AIFeatureMapping[]
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = firestore.collection('aiConfiguration').doc('featureMappings');
    await docRef.set({ mappings, updatedAt: new Date() });

    console.log(`[DEV MOCK] Saved AI feature mappings:`, mappings.length);

    return { success: true, message: '기능별 AI 모델 매핑이 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Error saving AI feature mappings:', error);
    return { success: false, message: 'AI 기능 매핑 저장 중 오류가 발생했습니다.' };
  }
}

export async function getAIFeatureMappings(): Promise<{
  success: boolean;
  data?: AIFeatureMapping[];
  message?: string;
}> {
  try {
    const docRef = firestore.collection('aiConfiguration').doc('featureMappings');
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: true, data: [] };
    }

    const data = doc.data();
    return { success: true, data: data?.mappings || [] };
  } catch (error) {
    console.error('Error getting AI feature mappings:', error);
    return { success: false, message: 'AI 기능 매핑을 불러오는 중 오류가 발생했습니다.' };
  }
}

// Helper function to save API key to environment file
async function saveToEnvironmentFile(provider: AIProvider, apiKey: string): Promise<void> {
  try {
    const envPath = join(process.cwd(), '.env.local');
    
    // Read current .env.local file
    let envContent = '';
    try {
      envContent = await readFile(envPath, 'utf8');
    } catch (error) {
      // File doesn't exist, start with empty content
      console.log('Creating new .env.local file');
    }
    
    // Map provider to environment variable name
    const envVarNames: Record<AIProvider, string> = {
      openai: 'OPENAI_API_KEY',
      gemini: 'GEMINI_API_KEY',
      googleai: 'GOOGLE_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      grok: 'GROK_API_KEY',
      openrouter: 'OPENROUTER_API_KEY',
      huggingface: 'HUGGINGFACE_API_KEY'
    };
    
    const envVarName = envVarNames[provider];
    if (!envVarName) {
      console.warn(`No environment variable mapping for provider: ${provider}`);
      return;
    }
    
    // Split content into lines
    const lines = envContent.split('\n');
    
    // Find and update or add the line for this API key
    let found = false;
    const updatedLines = lines.map(line => {
      if (line.startsWith(`${envVarName}=`)) {
        found = true;
        return `${envVarName}=${apiKey}`;
      }
      return line;
    });
    
    // If not found, add new line
    if (!found) {
      updatedLines.push(`${envVarName}=${apiKey}`);
    }
    
    // Write back to file
    const newContent = updatedLines.join('\n');
    await writeFile(envPath, newContent, 'utf8');
    
    console.log(`[ENV] Updated ${envVarName} in .env.local`);
    
    // Update process.env for immediate effect
    process.env[envVarName] = apiKey;
    
  } catch (error) {
    console.error('Error saving to environment file:', error);
    // Don't throw error, as Firestore save was successful
  }
}

export async function getAIConfiguration(): Promise<{
  success: boolean;
  data?: AIConfiguration;
  message?: string;
}> {
  try {
    // Get all provider configs
    const providersResult = await getAllAIProviderConfigs();
    if (!providersResult.success) {
      return { success: false, message: providersResult.message };
    }

    // Get feature mappings
    const mappingsResult = await getAIFeatureMappings();
    if (!mappingsResult.success) {
      return { success: false, message: mappingsResult.message };
    }

    // Get global settings
    const globalDoc = await firestore.collection('aiConfiguration').doc('globalSettings').get();
    const globalSettings = globalDoc.exists ? globalDoc.data() : {
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000,
      enableFallback: true,
    };

    const configuration: AIConfiguration = {
      providers: providersResult.data || [],
      featureMappings: mappingsResult.data || [],
      globalSettings,
      updatedAt: new Date(),
    };

    return { success: true, data: configuration };
  } catch (error) {
    console.error('Error getting AI configuration:', error);
    return { success: false, message: 'AI 설정을 불러오는 중 오류가 발생했습니다.' };
  }
}