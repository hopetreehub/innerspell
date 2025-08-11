/**
 * AI Provider Service - File Storage Implementation
 * Firebase가 없는 개발 환경에서 AI 공급자 설정을 파일로 관리
 */

import { readJSON, writeJSON, fileExists } from './file-storage-service';
import { AIProviderConfig, AIProvider } from '@/types/ai-providers';
import { AIFeatureMapping } from '@/types';
import { encrypt, decrypt } from '@/lib/encryption';

const AI_PROVIDERS_FILE = 'ai-providers.json';
const AI_MAPPINGS_FILE = 'ai-feature-mappings.json';

interface AIProvidersData {
  providers: Record<string, AIProviderConfig>;
  lastUpdated: string;
  version: string;
}

interface AIFeatureMappingsData {
  mappings: AIFeatureMapping[];
  lastUpdated: string;
  version: string;
}

// 기본 AI 공급자 설정 - 환경 변수에서 API 키 자동 로드 (Gemini 우선)
const DEFAULT_PROVIDERS: Record<string, Omit<AIProviderConfig, 'id'>> = {
  gemini: {
    provider: 'gemini' as AIProvider,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '', // 환경 변수에서 자동 로드
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    isActive: true,
    maxRequestsPerMinute: 60,
    models: [
      { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', isActive: true },
      { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', isActive: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  openai: {
    provider: 'openai' as AIProvider,
    apiKey: process.env.OPENAI_API_KEY || '', // 환경 변수에서 자동 로드
    baseUrl: 'https://api.openai.com/v1',
    isActive: true,
    maxRequestsPerMinute: 60,
    models: [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', isActive: true },
      { id: 'gpt-4', name: 'GPT-4', isActive: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// 기본 기능 매핑
const DEFAULT_MAPPINGS: AIFeatureMapping[] = [
  {
    id: 'tarot-interpretation',
    feature: 'tarot-interpretation',
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '당신은 전문 타로 리더입니다.',
    isActive: true
  },
  {
    id: 'dream-interpretation',
    feature: 'dream-interpretation', 
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    temperature: 0.8,
    maxTokens: 1500,
    systemPrompt: '당신은 전문 꿈 해석가입니다.',
    isActive: true
  }
];

export async function saveAIProviderConfig(
  provider: AIProvider,
  config: Omit<AIProviderConfig, 'id'>
): Promise<void> {
  try {
    let data = await readJSON<AIProvidersData>(AI_PROVIDERS_FILE);
    
    if (!data) {
      data = {
        providers: {},
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    }
    
    // API 키 암호화
    const encryptedConfig = {
      ...config,
      apiKey: config.apiKey ? encrypt(config.apiKey) : '',
      updatedAt: new Date()
    };
    
    data.providers[provider] = {
      ...encryptedConfig,
      id: provider
    };
    data.lastUpdated = new Date().toISOString();
    
    await writeJSON(AI_PROVIDERS_FILE, data);
  } catch (error) {
    console.error('[AI Provider Service] Save config error:', error);
    throw error;
  }
}

export async function getAIProviderConfig(
  provider: AIProvider
): Promise<AIProviderConfig | null> {
  try {
    const data = await readJSON<AIProvidersData>(AI_PROVIDERS_FILE);
    
    // 항상 환경 변수의 API 키를 우선 사용
    const envApiKey = provider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    
    if (!data || !data.providers[provider]) {
      // 기본 설정 반환
      const defaultConfig = DEFAULT_PROVIDERS[provider];
      if (defaultConfig) {
        return {
          ...defaultConfig,
          id: provider,
          apiKey: envApiKey || defaultConfig.apiKey // 환경 변수 우선
        };
      }
      return null;
    }
    
    const config = data.providers[provider];
    
    // API 키 복호화 - 환경 변수가 있으면 우선 사용
    return {
      ...config,
      apiKey: envApiKey || (config.apiKey ? decrypt(config.apiKey) : '')
    };
  } catch (error) {
    console.error('[AI Provider Service] Get config error:', error);
    return null;
  }
}

export async function getAllAIProviderConfigs(): Promise<AIProviderConfig[]> {
  try {
    const data = await readJSON<AIProvidersData>(AI_PROVIDERS_FILE);
    
    // 환경 변수에서 API 키 가져오기
    const envKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      gemini: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
    };
    
    if (!data || !data.providers) {
      // 기본 설정으로 초기화 - 환경 변수 적용
      const initialData: AIProvidersData = {
        providers: Object.entries(DEFAULT_PROVIDERS).reduce((acc, [key, value]) => {
          acc[key] = { 
            ...value, 
            id: key,
            apiKey: envKeys[key as keyof typeof envKeys] || value.apiKey
          };
          return acc;
        }, {} as Record<string, AIProviderConfig>),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await writeJSON(AI_PROVIDERS_FILE, initialData);
      return Object.values(initialData.providers);
    }
    
    // API 키 복호화하여 반환 - 환경 변수 우선
    return Object.values(data.providers).map(config => ({
      ...config,
      apiKey: envKeys[config.provider as keyof typeof envKeys] || (config.apiKey ? decrypt(config.apiKey) : '')
    }));
  } catch (error) {
    console.error('[AI Provider Service] Get all configs error:', error);
    return [];
  }
}

export async function deleteAIProviderConfig(
  provider: AIProvider
): Promise<void> {
  try {
    const data = await readJSON<AIProvidersData>(AI_PROVIDERS_FILE);
    
    if (data && data.providers[provider]) {
      delete data.providers[provider];
      data.lastUpdated = new Date().toISOString();
      await writeJSON(AI_PROVIDERS_FILE, data);
    }
  } catch (error) {
    console.error('[AI Provider Service] Delete config error:', error);
    throw error;
  }
}

// AI 기능 매핑 관련 함수들
export async function saveAIFeatureMapping(
  mapping: AIFeatureMapping
): Promise<void> {
  try {
    let data = await readJSON<AIFeatureMappingsData>(AI_MAPPINGS_FILE);
    
    if (!data) {
      data = {
        mappings: DEFAULT_MAPPINGS,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    }
    
    // 기존 매핑 업데이트 또는 새 매핑 추가
    const existingIndex = data.mappings.findIndex(m => m.id === mapping.id);
    if (existingIndex >= 0) {
      data.mappings[existingIndex] = mapping;
    } else {
      data.mappings.push(mapping);
    }
    
    data.lastUpdated = new Date().toISOString();
    await writeJSON(AI_MAPPINGS_FILE, data);
  } catch (error) {
    console.error('[AI Provider Service] Save mapping error:', error);
    throw error;
  }
}

export async function getAIFeatureMappings(): Promise<AIFeatureMapping[]> {
  try {
    const data = await readJSON<AIFeatureMappingsData>(AI_MAPPINGS_FILE);
    
    if (!data || !data.mappings) {
      // 기본 매핑으로 초기화
      const initialData: AIFeatureMappingsData = {
        mappings: DEFAULT_MAPPINGS,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await writeJSON(AI_MAPPINGS_FILE, initialData);
      return initialData.mappings;
    }
    
    return data.mappings;
  } catch (error) {
    console.error('[AI Provider Service] Get mappings error:', error);
    return DEFAULT_MAPPINGS;
  }
}

export async function deleteAIFeatureMapping(
  mappingId: string
): Promise<void> {
  try {
    const data = await readJSON<AIFeatureMappingsData>(AI_MAPPINGS_FILE);
    
    if (data && data.mappings) {
      data.mappings = data.mappings.filter(m => m.id !== mappingId);
      data.lastUpdated = new Date().toISOString();
      await writeJSON(AI_MAPPINGS_FILE, data);
    }
  } catch (error) {
    console.error('[AI Provider Service] Delete mapping error:', error);
    throw error;
  }
}

// 개발 환경에서 초기 데이터 설정
export async function initializeAIProviderData(): Promise<void> {
  try {
    const hasProviders = await fileExists(AI_PROVIDERS_FILE);
    const hasMappings = await fileExists(AI_MAPPINGS_FILE);
    
    if (!hasProviders) {
      console.log('📁 Initializing AI provider configurations...');
      const initialProviders: AIProvidersData = {
        providers: Object.entries(DEFAULT_PROVIDERS).reduce((acc, [key, value]) => {
          acc[key] = { ...value, id: key };
          return acc;
        }, {} as Record<string, AIProviderConfig>),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      await writeJSON(AI_PROVIDERS_FILE, initialProviders);
    }
    
    if (!hasMappings) {
      console.log('📁 Initializing AI feature mappings...');
      const initialMappings: AIFeatureMappingsData = {
        mappings: DEFAULT_MAPPINGS,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      await writeJSON(AI_MAPPINGS_FILE, initialMappings);
    }
  } catch (error) {
    console.error('[AI Provider Service] Initialize error:', error);
  }
}