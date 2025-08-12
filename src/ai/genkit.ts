
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';
import {anthropic} from 'genkitx-anthropic';
import {config} from 'dotenv';
import { getAllAIProviderConfigsForGenkit } from '@/actions/aiProviderActions';
import { decrypt } from '@/lib/encryption';

config();

// Cache for AI provider configs
let aiConfigCache: { 
  googleApiKey?: string; 
  openaiApiKey?: string;
  anthropicApiKey?: string;
  grokApiKey?: string;
  openrouterApiKey?: string;
  huggingfaceApiKey?: string;
  timestamp: number 
} | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAIProviderKeys() {
  // Check cache
  if (aiConfigCache && Date.now() - aiConfigCache.timestamp < CACHE_TTL) {
    console.log('[GENKIT] Using cached AI keys');
    return aiConfigCache;
  }
  
  // 🔴 CRITICAL: Vercel 환경에서는 환경변수를 우선적으로 사용
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
  
  console.log('[GENKIT] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isProduction,
    isVercel
  });
  
  // Vercel 또는 프로덕션 환경에서는 환경변수 우선 사용
  if (isProduction || isVercel) {
    console.log('[GENKIT] Production/Vercel mode - checking environment variables first');
    
    const envKeys = {
      googleApiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      grokApiKey: process.env.GROK_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
      timestamp: Date.now()
    };
    
    console.log('[GENKIT] Production environment keys status:', {
      hasGoogleKey: !!envKeys.googleApiKey,
      googleKeyLength: envKeys.googleApiKey?.length || 0,
      googleKeyPrefix: envKeys.googleApiKey?.substring(0, 10) + '...',
      hasOpenAIKey: !!envKeys.openaiApiKey,
      openaiKeyLength: envKeys.openaiApiKey?.length || 0,
      openaiKeyPrefix: envKeys.openaiApiKey?.substring(0, 10) + '...',
      hasAnthropicKey: !!envKeys.anthropicApiKey
    });
    
    // 최소한 하나의 AI 키가 있으면 사용
    if (envKeys.googleApiKey || envKeys.openaiApiKey || envKeys.anthropicApiKey) {
      console.log('[GENKIT] Valid API keys found in environment variables');
      aiConfigCache = envKeys;
      return envKeys;
    } else {
      console.warn('[GENKIT] ⚠️ No valid API keys found in environment variables!');
    }
  }
  
  try {
    // 개발 모드에서 먼저 환경 변수 확인
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    const fileStorageEnabled = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true';
    const useMockAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false';
    
    if (isDevelopmentMode && fileStorageEnabled && useMockAuth) {
      console.log('[GENKIT] Development mode detected - using environment variables directly');
      const envKeys = {
        googleApiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        grokApiKey: process.env.GROK_API_KEY,
        openrouterApiKey: process.env.OPENROUTER_API_KEY,
        huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
        timestamp: Date.now()
      };
      
      console.log('[GENKIT] Development mode keys:', {
        googleKeyLength: envKeys.googleApiKey?.length || 0,
        openaiKeyLength: envKeys.openaiApiKey?.length || 0,
        anthropicKeyLength: envKeys.anthropicApiKey?.length || 0
      });
      
      if (envKeys.openaiApiKey || envKeys.googleApiKey) {
        aiConfigCache = envKeys;
        return envKeys;
      }
    }
    
    console.log('[GENKIT] Fetching AI provider configs from Firestore...');
    const result = await getAllAIProviderConfigsForGenkit();
    console.log('[GENKIT] Fetch result:', { success: result.success, dataCount: result.data?.length || 0 });
    
    if (result.success && result.data && result.data.length > 0) {
      console.log('[GENKIT] Raw provider data:', result.data.map(c => ({ 
        provider: c.provider, 
        isActive: c.isActive,
        hasApiKey: !!c.apiKey,
        apiKeyLength: c.apiKey?.length || 0
      })));
      
      const googleConfig = result.data.find(c => c.provider === 'googleai' && c.isActive);
      const geminiConfig = result.data.find(c => c.provider === 'gemini' && c.isActive);
      const openaiConfig = result.data.find(c => c.provider === 'openai' && c.isActive);
      const anthropicConfig = result.data.find(c => c.provider === 'anthropic' && c.isActive);
      const grokConfig = result.data.find(c => c.provider === 'grok' && c.isActive);
      const openrouterConfig = result.data.find(c => c.provider === 'openrouter' && c.isActive);
      const huggingfaceConfig = result.data.find(c => c.provider === 'huggingface' && c.isActive);
      
      console.log('[GENKIT] Found configs:', {
        googleFound: !!googleConfig,
        geminiFound: !!geminiConfig,
        openaiFound: !!openaiConfig,
        anthropicFound: !!anthropicConfig,
        grokFound: !!grokConfig,
        openrouterFound: !!openrouterConfig,
        huggingfaceFound: !!huggingfaceConfig
      });
      
      const keys = {
        googleApiKey: googleConfig?.apiKey ? decrypt(googleConfig.apiKey) : 
                     geminiConfig?.apiKey ? decrypt(geminiConfig.apiKey) : 
                     process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
        openaiApiKey: openaiConfig?.apiKey ? decrypt(openaiConfig.apiKey) : process.env.OPENAI_API_KEY,
        anthropicApiKey: anthropicConfig?.apiKey ? decrypt(anthropicConfig.apiKey) : process.env.ANTHROPIC_API_KEY,
        grokApiKey: grokConfig?.apiKey ? decrypt(grokConfig.apiKey) : process.env.GROK_API_KEY,
        openrouterApiKey: openrouterConfig?.apiKey ? decrypt(openrouterConfig.apiKey) : process.env.OPENROUTER_API_KEY,
        huggingfaceApiKey: huggingfaceConfig?.apiKey ? decrypt(huggingfaceConfig.apiKey) : process.env.HUGGINGFACE_API_KEY,
        timestamp: Date.now()
      };
      
      console.log('[GENKIT] Decrypted keys:', {
        googleKeyLength: keys.googleApiKey?.length || 0,
        openaiKeyLength: keys.openaiApiKey?.length || 0,
        anthropicKeyLength: keys.anthropicApiKey?.length || 0,
        grokKeyLength: keys.grokApiKey?.length || 0,
        openrouterKeyLength: keys.openrouterApiKey?.length || 0,
        huggingfaceKeyLength: keys.huggingfaceApiKey?.length || 0
      });
      
      aiConfigCache = keys;
      return keys;
    } else {
      console.log('[GENKIT] No provider configs found in Firestore, falling back to env vars');
    }
  } catch (error) {
    console.error('[GENKIT] Failed to load AI provider configs:', error);
  }
  
  // Fallback to env vars
  console.log('[GENKIT] Using environment variables as fallback');
  const envKeys = {
    googleApiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    grokApiKey: process.env.GROK_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    timestamp: Date.now()
  };
  
  console.log('[GENKIT] Environment variable keys:', {
    googleKeyLength: envKeys.googleApiKey?.length || 0,
    openaiKeyLength: envKeys.openaiApiKey?.length || 0,
    anthropicKeyLength: envKeys.anthropicApiKey?.length || 0,
    grokKeyLength: envKeys.grokApiKey?.length || 0,
    openrouterKeyLength: envKeys.openrouterApiKey?.length || 0,
    huggingfaceKeyLength: envKeys.huggingfaceApiKey?.length || 0
  });
  
  return envKeys;
}

// Initialize Genkit with dynamic provider configuration
let aiInstance: ReturnType<typeof genkit> | null = null;

export async function getAI() {
  if (!aiInstance) {
    console.log('[GENKIT] Initializing AI instance...');
    
    try {
      const keys = await getAIProviderKeys();
      
      // 🔴 CRITICAL: API 키 존재 확인
      if (!keys.googleApiKey && !keys.openaiApiKey && !keys.anthropicApiKey) {
        const errorMsg = '[GENKIT] CRITICAL ERROR: No AI API keys available! Please check environment variables.';
        console.error(errorMsg);
        console.error('[GENKIT] Required keys: GOOGLE_API_KEY or OPENAI_API_KEY');
        console.error('[GENKIT] Current environment:', {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          hasGoogleKey: !!process.env.GOOGLE_API_KEY,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY
        });
        throw new Error('No AI provider API keys configured. Check Vercel environment variables.');
      }
      
      const plugins = [];
      
      // Google AI / Gemini - 우선순위 1
      if (keys.googleApiKey) {
        try {
          console.log('[GENKIT] Adding Google AI plugin with key length:', keys.googleApiKey.length);
          plugins.push(googleAI({
            apiKey: keys.googleApiKey
          }));
          console.log('[GENKIT] ✅ Google AI plugin added successfully');
        } catch (error) {
          console.error('[GENKIT] Failed to add Google AI plugin:', error);
        }
      }
      
      // OpenAI - 우선순위 2
      if (keys.openaiApiKey) {
        try {
          console.log('[GENKIT] Adding OpenAI plugin with key length:', keys.openaiApiKey.length);
          plugins.push(openAI({
            apiKey: keys.openaiApiKey
          }));
          console.log('[GENKIT] ✅ OpenAI plugin added successfully');
        } catch (error) {
          console.error('[GENKIT] Failed to add OpenAI plugin:', error);
        }
      }
      
      // Anthropic / Claude - 우선순위 3
      if (keys.anthropicApiKey) {
        try {
          console.log('[GENKIT] Adding Anthropic plugin');
          plugins.push(anthropic({
            apiKey: keys.anthropicApiKey
          }));
          console.log('[GENKIT] ✅ Anthropic plugin added successfully');
        } catch (error) {
          console.error('[GENKIT] Failed to add Anthropic plugin:', error);
        }
      }
      
      console.log(`[GENKIT] Initializing Genkit with ${plugins.length} plugins`);
      
      if (plugins.length === 0) {
        const criticalError = '[GENKIT] CRITICAL: No AI provider plugins could be initialized!';
        console.error(criticalError);
        throw new Error('Failed to initialize any AI provider plugins');
      }
      
      aiInstance = genkit({
        plugins,
        // Model is now specified dynamically in each flow based on Admin settings.
      });
      
      console.log('[GENKIT] ✅ AI instance initialized successfully');
    } catch (error) {
      console.error('[GENKIT] Failed to initialize AI instance:', error);
      throw error;
    }
  }
  
  return aiInstance;
}

// For backward compatibility
export const ai = {
  defineFlow: (...args: any[]) => {
    return {
      ...(args[0] || {}),
      // Wrap the flow function to ensure AI is initialized
      fn: async (input: any) => {
        const instance = await getAI();
        const flow = instance.defineFlow(args[0], args[1]);
        return flow(input);
      }
    };
  },
  definePrompt: async (...args: Parameters<ReturnType<typeof genkit>['definePrompt']>) => {
    const instance = await getAI();
    return instance.definePrompt(...args);
  }
};
