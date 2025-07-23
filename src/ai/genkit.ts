
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
  
  try {
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
    const keys = await getAIProviderKeys();
    
    const plugins = [];
    
    // Google AI / Gemini
    if (keys.googleApiKey) {
      console.log('[GENKIT] Adding Google AI plugin');
      plugins.push(googleAI({
        apiKey: keys.googleApiKey
      }));
    }
    
    // OpenAI - Primary API
    if (keys.openaiApiKey) {
      console.log('[GENKIT] Adding OpenAI plugin');
      plugins.push(openAI({
        apiKey: keys.openaiApiKey
      }));
    }
    
    // Anthropic / Claude
    if (keys.anthropicApiKey) {
      console.log('[GENKIT] Adding Anthropic plugin');
      plugins.push(anthropic({
        apiKey: keys.anthropicApiKey
      }));
    }
    
    // For Grok and OpenRouter, we need to use different OpenAI plugin configurations
    // For now, we'll skip these to avoid duplicate plugin registration
    // They can be added later with proper namespace management
    
    console.log(`[GENKIT] Initializing Genkit with ${plugins.length} plugins`);
    
    if (plugins.length === 0) {
      console.error('[GENKIT] WARNING: No AI provider plugins available! AI features will not work.');
    }
    
    aiInstance = genkit({
      plugins,
      // Model is now specified dynamically in each flow based on Admin settings.
    });
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
