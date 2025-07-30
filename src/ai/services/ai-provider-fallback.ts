'use server';

import { AIProvider } from '@/types/ai-providers';
import { getAllAIProviderConfigs, getAIProviderConfig } from '@/actions/aiProviderActions';
import { decrypt } from '@/lib/encryption';

/**
 * AI Provider Fallback System
 * Automatically switches to alternative providers when primary provider fails
 */

interface ProviderAttempt {
  provider: AIProvider;
  model: string;
  error?: string;
  success: boolean;
  responseTime?: number;
}

interface FallbackResult {
  selectedProvider: AIProvider;
  selectedModel: string;
  attempts: ProviderAttempt[];
  fallbackUsed: boolean;
}

/**
 * Priority order for AI providers based on reliability and cost
 */
const PROVIDER_PRIORITY: AIProvider[] = [
  'openai',     // Most reliable, good performance
  'gemini',     // Google's offering, good alternative
  'anthropic',  // High quality Claude models
  'openrouter', // Access to multiple models
  'grok',       // X.AI offering
  'huggingface' // Open source option
];

/**
 * Model preferences for each provider for tarot interpretation
 */
const PREFERRED_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  googleai: ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],
  anthropic: ['claude-3.5-sonnet', 'claude-3-haiku'],
  openrouter: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-405b-instruct'],
  grok: ['grok-2-mini', 'grok-2'],
  huggingface: ['mixtral-8x7b-instruct', 'llama-3-70b-instruct']
};

/**
 * Test a provider's availability and performance
 */
async function testProvider(provider: AIProvider, model: string, apiKey: string): Promise<ProviderAttempt> {
  const startTime = Date.now();
  
  try {
    // Simple test prompt to verify provider works
    const testResult = await makeTestAPICall(provider, model, apiKey);
    
    return {
      provider,
      model,
      success: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      provider,
      model,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * Make a test API call to verify provider works
 */
async function makeTestAPICall(provider: AIProvider, model: string, apiKey: string): Promise<boolean> {
  const testPrompt = "Test prompt - respond with 'OK'";
  
  switch (provider) {
    case 'openai':
      return testOpenAI(apiKey, model, testPrompt);
    case 'gemini':
      return testGemini(apiKey, model, testPrompt);
    case 'anthropic':
      return testAnthropic(apiKey, model, testPrompt);
    case 'grok':
      return testGrok(apiKey, model, testPrompt);
    case 'openrouter':
      return testOpenRouter(apiKey, model, testPrompt);
    case 'huggingface':
      return testHuggingFace(apiKey, model, testPrompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function testOpenAI(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10
    })
  });
  
  return response.ok;
}

async function testGemini(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  
  return response.ok;
}

async function testAnthropic(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 10,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return response.ok;
}

async function testGrok(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10
    })
  });
  
  return response.ok;
}

async function testOpenRouter(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10
    })
  });
  
  return response.ok;
}

async function testHuggingFace(apiKey: string, model: string, prompt: string): Promise<boolean> {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 10 }
    })
  });
  
  return response.ok;
}

/**
 * Select the best available AI provider with fallback support
 */
export async function selectBestProvider(): Promise<FallbackResult> {
  console.log('[AI FALLBACK] Starting provider selection...');
  
  const attempts: ProviderAttempt[] = [];
  let selectedProvider: AIProvider | null = null;
  let selectedModel: string | null = null;
  
  // Get all active provider configurations
  const result = await getAllAIProviderConfigs();
  if (!result.success || !result.data) {
    throw new Error('Failed to load AI provider configurations');
  }
  
  const allConfigs = result.data;
  const activeConfigs = allConfigs.filter(config => config.isActive && config.apiKey);
  
  console.log('[AI FALLBACK] Active providers found:', activeConfigs.map(c => c.provider));
  
  // Try providers in priority order
  for (const provider of PROVIDER_PRIORITY) {
    const config = activeConfigs.find(c => c.provider === provider);
    if (!config) {
      console.log(`[AI FALLBACK] Provider ${provider} not configured or inactive`);
      continue;
    }
    
    // Try preferred models for this provider
    const preferredModels = PREFERRED_MODELS[provider] || [];
    for (const model of preferredModels) {
      console.log(`[AI FALLBACK] Testing ${provider}:${model}...`);
      
      const decryptedApiKey = decrypt(config.apiKey);
      const attempt = await testProvider(provider, model, decryptedApiKey);
      attempts.push(attempt);
      
      if (attempt.success) {
        selectedProvider = provider;
        selectedModel = model;
        console.log(`[AI FALLBACK] Selected ${provider}:${model} (${attempt.responseTime}ms)`);
        break;
      } else {
        console.log(`[AI FALLBACK] Failed ${provider}:${model} - ${attempt.error}`);
      }
    }
    
    if (selectedProvider) break;
  }
  
  // Fallback to first available provider if none of the preferred ones work
  if (!selectedProvider) {
    console.log('[AI FALLBACK] No preferred providers available, trying any active provider...');
    
    for (const config of activeConfigs) {
      const models = config.models || [];
      for (const modelConfig of models) {
        if (!modelConfig.isActive) continue;
        
        const decryptedApiKey = decrypt(config.apiKey);
        const attempt = await testProvider(config.provider, modelConfig.name, decryptedApiKey);
        attempts.push(attempt);
        
        if (attempt.success) {
          selectedProvider = config.provider;
          selectedModel = modelConfig.name;
          console.log(`[AI FALLBACK] Fallback selected ${selectedProvider}:${selectedModel}`);
          break;
        }
      }
      
      if (selectedProvider) break;
    }
  }
  
  if (!selectedProvider || !selectedModel) {
    throw new Error('No AI providers are currently available');
  }
  
  const fallbackUsed = !PROVIDER_PRIORITY.slice(0, 3).includes(selectedProvider);
  
  return {
    selectedProvider,
    selectedModel,
    attempts,
    fallbackUsed
  };
}

/**
 * Get provider configuration with automatic fallback
 */
export async function getProviderWithFallback() {
  const result = await selectBestProvider();
  const configResult = await getAIProviderConfig(result.selectedProvider);
  
  if (!configResult.success || !configResult.data) {
    throw new Error(`Provider ${result.selectedProvider} configuration not found`);
  }
  
  return {
    provider: result.selectedProvider,
    model: `${result.selectedProvider}/${result.selectedModel}`,
    apiKey: decrypt(configResult.data.apiKey),
    config: configResult.data,
    fallbackInfo: result
  };
}