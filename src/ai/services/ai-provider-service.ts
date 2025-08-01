'use server';

import { getAllAIProviderConfigs } from '@/actions/aiProviderActions';
import { AIProviderConfig } from '@/types/ai-providers';
import { normalizeModelId, getProviderConfig } from '@/lib/ai-utils';

/**
 * Get all active AI models from configured providers
 */
export async function getActiveAIModels(): Promise<{ id: string; name: string; provider: string }[]> {
  try {
    console.log('[getActiveAIModels] Starting to fetch AI provider configs...');
    const result = await getAllAIProviderConfigs();
    
    console.log('[getActiveAIModels] getAllAIProviderConfigs result:', result);
    
    if (!result.success || !result.data) {
      console.error('[getActiveAIModels] Failed to get AI provider configs');
      return [];
    }

    const activeModels: { id: string; name: string; provider: string }[] = [];
    
    console.log('[getActiveAIModels] Processing provider configs:', result.data);
    
    result.data.forEach(config => {
      console.log(`[getActiveAIModels] Processing config for ${config.provider}:`, config);
      if (config.isActive && config.models) {
        config.models.forEach(model => {
          console.log(`[getActiveAIModels] Processing model:`, model);
          if (model.isActive) {
            const modelEntry = {
              id: `${config.provider}/${model.id}`,
              name: `${model.name} (${config.provider})`,
              provider: config.provider
            };
            console.log(`[getActiveAIModels] Adding active model:`, modelEntry);
            activeModels.push(modelEntry);
          }
        });
      }
    });
    
    console.log('[getActiveAIModels] Active models found:', activeModels);
    
    // Always include default models as fallback (OpenAI first, then Gemini)
    if (activeModels.length === 0) {
      console.log('[getActiveAIModels] No active models found, using defaults');
      activeModels.push(
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo (OpenAI)',
          provider: 'openai'
        },
        {
          id: 'openai/gpt-4',
          name: 'GPT-4 (OpenAI)',
          provider: 'openai'
        },
        {
          id: 'googleai/gemini-1.5-pro-latest',
          name: 'Gemini 1.5 Pro (Google AI)',
          provider: 'googleai'
        },
        {
          id: 'googleai/gemini-1.5-flash-latest',
          name: 'Gemini 1.5 Flash (Google AI)',
          provider: 'googleai'
        }
      );
    }
    
    console.log('[getActiveAIModels] Final models to return:', activeModels);
    return activeModels;
  } catch (error) {
    console.error('[getActiveAIModels] Error getting active AI models:', error);
    // Return default models on error (OpenAI first)
    const defaultModels = [
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo (OpenAI)',
        provider: 'openai'
      },
      {
        id: 'openai/gpt-4',
        name: 'GPT-4 (OpenAI)',
        provider: 'openai'
      },
      {
        id: 'googleai/gemini-1.5-pro-latest',
        name: 'Gemini 1.5 Pro (Google AI)',
        provider: 'googleai'
      },
      {
        id: 'googleai/gemini-1.5-flash-latest',
        name: 'Gemini 1.5 Flash (Google AI)',
        provider: 'googleai'
      }
    ];
    console.log('[getActiveAIModels] Returning default models due to error:', defaultModels);
    return defaultModels;
  }
}

