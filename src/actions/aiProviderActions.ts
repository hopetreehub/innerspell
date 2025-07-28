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

// 브라우저 캐시 사용 (클라이언트에서만)
let cacheAIProviders: ((data: any) => Promise<void>) | null = null;
let getCachedAIProviders: (() => Promise<any>) | null = null;

if (typeof window !== 'undefined') {
  import('../lib/cache').then(({ cacheAIProviders: cache, getCachedAIProviders: get }) => {
    cacheAIProviders = cache;
    getCachedAIProviders = get;
  }).catch(() => {
    // 캐시 모듈 로드 실패 시 무시
  });
}

// 캐시 관리
let providersCache: (AIProviderConfig & { maskedApiKey?: string })[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간 캐시

// Helper function to mask API key
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '••••••••••••••••';
  
  const firstChars = apiKey.slice(0, 3);
  const lastChars = apiKey.slice(-3);
  const maskedMiddle = '•'.repeat(Math.min(apiKey.length - 6, 16));
  
  return `${firstChars}${maskedMiddle}${lastChars}`;
}

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
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = firestore.collection('aiProviderConfigs').doc(provider);
    await docRef.set(providerConfig);

    // Also save to environment file for persistence
    await saveToEnvironmentFile(provider, apiKey);

    // 캐시 무효화
    providersCache = null;
    
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
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
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

export async function getAllAIProviderConfigs(forceRefresh = false): Promise<{
  success: boolean;
  data?: (AIProviderConfig & { maskedApiKey?: string })[];
  message?: string;
}> {
  try {
    // 브라우저 캐시 확인 (클라이언트에서만)
    if (!forceRefresh && getCachedAIProviders) {
      try {
        const browserCached = await getCachedAIProviders();
        if (browserCached) {
          console.log('[aiProviderActions] Returning browser cached providers');
          return { success: true, data: browserCached };
        }
      } catch (error) {
        console.warn('[aiProviderActions] Browser cache failed:', error);
      }
    }
    
    // 메모리 캐시 확인
    if (!forceRefresh && providersCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('[aiProviderActions] Returning memory cached providers');
      return { success: true, data: providersCache };
    }
    
    console.log('[aiProviderActions] Fetching providers from Firestore...');
    const snapshot = await firestore.collection('aiProviderConfigs').get();
    const configs: (AIProviderConfig & { maskedApiKey?: string })[] = [];

    // Use docs array instead of forEach for better compatibility with mock
    const docs = snapshot.docs || [];
    for (const doc of docs) {
      const data = doc.data() as AIProviderConfig;
      // Decrypt API key and create masked version
      const decryptedKey = decrypt(data.apiKey);
      const decryptedConfig = {
        ...data,
        apiKey: decryptedKey, // Send actual decrypted key
        maskedApiKey: maskApiKey(decryptedKey), // Also send masked version
      };
      configs.push(decryptedConfig);
    }
    
    // 메모리 캐시 업데이트
    providersCache = configs;
    cacheTimestamp = Date.now();
    
    // 브라우저 캐시 업데이트 (클라이언트에서만)
    if (cacheAIProviders) {
      try {
        await cacheAIProviders(configs);
        console.log('[aiProviderActions] Updated browser cache with', configs.length, 'providers');
      } catch (error) {
        console.warn('[aiProviderActions] Failed to update browser cache:', error);
      }
    }
    
    console.log('[aiProviderActions] Cached', configs.length, 'providers');

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
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = firestore.collection('aiProviderConfigs').doc(provider);
    await docRef.delete();
    
    // 캐시 무효화
    providersCache = null;

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
    console.log(`[AI Connection Test] Testing provider: ${provider}`);
    
    // Basic API key format validation
    const validationResult = validateApiKeyFormat(provider, apiKey);
    if (!validationResult.isValid) {
      return { 
        success: false, 
        message: `API 키 형식 오류: ${validationResult.message}` 
      };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple connection test based on provider
    const testResult = await performConnectionTest(provider, apiKey, baseUrl);
    
    console.log(`[AI Connection Test] Result for ${provider}:`, testResult);
    
    return testResult;
  } catch (error) {
    console.error('Error testing AI provider connection:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return { 
      success: false, 
      message: `${provider} 연결 테스트 중 오류가 발생했습니다: ${errorMessage}` 
    };
  }
}

// API 키 형식 검증
function validateApiKeyFormat(provider: AIProvider, apiKey: string): { isValid: boolean; message: string } {
  const trimmedKey = apiKey.trim();
  
  switch (provider) {
    case 'openai':
      if (!trimmedKey.startsWith('sk-')) {
        return { isValid: false, message: 'OpenAI API 키는 "sk-"로 시작해야 합니다' };
      }
      if (trimmedKey.length < 20) {
        return { isValid: false, message: 'API 키가 너무 짧습니다' };
      }
      break;
      
    case 'gemini':
    case 'googleai':
      if (!trimmedKey.startsWith('AIza')) {
        return { isValid: false, message: 'Google AI API 키는 "AIza"로 시작해야 합니다' };
      }
      if (trimmedKey.length < 30) {
        return { isValid: false, message: 'API 키가 너무 짧습니다' };
      }
      break;
      
    case 'anthropic':
      if (!trimmedKey.startsWith('sk-ant-')) {
        return { isValid: false, message: 'Anthropic API 키는 "sk-ant-"로 시작해야 합니다' };
      }
      break;
      
    case 'grok':
      if (!trimmedKey.startsWith('xai-')) {
        return { isValid: false, message: 'xAI API 키는 "xai-"로 시작해야 합니다' };
      }
      break;
      
    case 'openrouter':
      if (!trimmedKey.startsWith('sk-or-')) {
        return { isValid: false, message: 'OpenRouter API 키는 "sk-or-"로 시작해야 합니다' };
      }
      break;
      
    case 'huggingface':
      if (!trimmedKey.startsWith('hf_')) {
        return { isValid: false, message: 'Hugging Face API 키는 "hf_"로 시작해야 합니다' };
      }
      break;
      
    default:
      if (trimmedKey.length < 10) {
        return { isValid: false, message: 'API 키가 너무 짧습니다' };
      }
  }
  
  return { isValid: true, message: 'API 키 형식이 올바릅니다' };
}

// 실제 연결 테스트 수행
async function performConnectionTest(
  provider: AIProvider, 
  apiKey: string, 
  baseUrl?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    switch (provider) {
      case 'openai':
        return await testOpenAIConnection(apiKey, baseUrl);
      
      case 'gemini':
      case 'googleai':
        return await testGoogleAIConnection(apiKey, provider);
      
      case 'anthropic':
        return await testAnthropicConnection(apiKey, baseUrl);
      
      case 'grok':
        return await testGrokConnection(apiKey, baseUrl);
      
      case 'openrouter':
        return await testOpenRouterConnection(apiKey, baseUrl);
      
      case 'huggingface':
        return await testHuggingFaceConnection(apiKey);
      
      default:
        // 기본 연결성 시뮬레이션
        const isKeyValid = apiKey.length > 15;
        if (!isKeyValid) {
          return {
            success: false,
            message: 'API 키가 유효하지 않습니다'
          };
        }
        
        return {
          success: true,
          message: `${provider} 연결 테스트 성공! (기본 검증)`
        };
    }
  } catch (error) {
    console.error(`[AI Connection Test] Error for ${provider}:`, error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `연결 테스트 중 오류 발생: ${errorMessage}`
    };
  }
}

// OpenAI 연결 테스트
async function testOpenAIConnection(
  apiKey: string, 
  baseUrl?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = baseUrl || 'https://api.openai.com/v1/models';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return {
        success: true,
        message: `OpenAI 연결 성공! ${modelCount}개 모델 사용 가능`,
        details: { models: data.data?.slice(0, 5) }
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `OpenAI API 오류: ${response.status} - ${error.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `OpenAI 연결 실패: ${errorMessage}`
    };
  }
}

// Google AI (Gemini) 연결 테스트
async function testGoogleAIConnection(
  apiKey: string,
  provider: 'gemini' | 'googleai'
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
      return {
        success: true,
        message: `${provider === 'googleai' ? 'Google AI' : 'Gemini'} 연결 성공! ${modelCount}개 모델 사용 가능`,
        details: { models: data.models?.slice(0, 5) }
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `Google AI API 오류: ${response.status} - ${error.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `Google AI 연결 실패: ${errorMessage}`
    };
  }
}

// Anthropic 연결 테스트
async function testAnthropicConnection(
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = baseUrl || 'https://api.anthropic.com/v1/complete';
    // Anthropic은 모델 목록 API가 없으므로 간단한 completion 테스트
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        prompt: '\n\nHuman: Hi\n\nAssistant:',
        max_tokens_to_sample: 1,
      })
    });
    
    if (response.ok || response.status === 400) { // 400은 모델 오류일 수 있음
      return {
        success: true,
        message: 'Anthropic 연결 성공! Claude 모델 사용 가능',
        details: { status: response.status }
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `Anthropic API 오류: ${response.status} - ${error.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `Anthropic 연결 실패: ${errorMessage}`
    };
  }
}

// xAI Grok 연결 테스트
async function testGrokConnection(
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  // Grok API는 아직 공개되지 않았으므로 시뮬레이션
  return {
    success: true,
    message: 'xAI Grok 연결 성공! (시뮬레이션)',
    details: { note: 'Grok API는 현재 베타 테스트 중입니다' }
  };
}

// OpenRouter 연결 테스트
async function testOpenRouterConnection(
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = baseUrl || 'https://openrouter.ai/api/v1/models';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return {
        success: true,
        message: `OpenRouter 연결 성공! ${modelCount}개 모델 사용 가능`,
        details: { models: data.data?.slice(0, 5) }
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `OpenRouter API 오류: ${response.status} - ${error.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `OpenRouter 연결 실패: ${errorMessage}`
    };
  }
}

// Hugging Face 연결 테스트
async function testHuggingFaceConnection(
  apiKey: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const url = 'https://api-inference.huggingface.co/models/gpt2';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: 'test' })
    });
    
    if (response.ok || response.status === 503) { // 503은 모델 로딩 중
      return {
        success: true,
        message: 'Hugging Face 연결 성공! 추론 API 사용 가능',
        details: { status: response.status }
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `Hugging Face API 오류: ${response.status} - ${error.substring(0, 100)}`
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return {
      success: false,
      message: `Hugging Face 연결 실패: ${errorMessage}`
    };
  }
}

// Feature to AI model mapping
export async function saveAIFeatureMapping(
  mappings: AIFeatureMapping[]
): Promise<{ success: boolean; message: string }> {
  try {
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
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
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
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
    if (!firestore) {
      throw new Error('Firestore is not initialized');
    }
    const globalDoc = await firestore.collection('aiConfiguration').doc('globalSettings').get();
    const globalSettings = globalDoc.exists ? globalDoc.data() : {
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000,
      enableFallback: true,
    } as { defaultTemperature: number; defaultMaxTokens: number; enableFallback: boolean; fallbackProvider?: AIProvider };

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