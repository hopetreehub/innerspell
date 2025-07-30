'use server';

import { 
  getAIProviderConfig, 
  getAIFeatureMappings, 
  getAIConfiguration,
  testAIProviderConnection
} from '@/actions/aiProviderActions';
import { 
  getTarotCardInstructions 
} from '@/actions/tarotInstructionActions';
import { 
  AIFeature, 
  AIProvider, 
  AIModel, 
  AIProviderConfig, 
  AIFeatureMapping,
  TarotCardInstruction 
} from '@/types';

/**
 * Get the configured AI provider and model for a specific feature
 */
export async function getFeatureConfig(feature: AIFeature): Promise<{
  provider: AIProviderConfig;
  model: AIModel;
  mapping: AIFeatureMapping;
} | null> {
  try {
    // Get the feature mappings
    const mappingsResult = await getAIFeatureMappings();
    if (!mappingsResult.success || !mappingsResult.data) {
      console.warn(`No mappings found`);
      return null;
    }

    // Find the mapping for this feature
    const mapping = mappingsResult.data.find(m => m.feature === feature && m.isActive);
    if (!mapping) {
      console.warn(`No mapping found for feature: ${feature}`);
      return null;
    }

    // Get the provider configuration
    const providerResult = await getAIProviderConfig(mapping.provider);
    if (!providerResult.success || !providerResult.data) {
      console.warn(`No provider config found for: ${mapping.provider}`);
      return null;
    }

    // Get the specific model
    const model = providerResult.data.models.find(m => m.id === mapping.modelId);
    if (!model) {
      console.warn(`Model ${mapping.modelId} not found for provider ${mapping.provider}`);
      return null;
    }

    return { provider: providerResult.data, model, mapping };
  } catch (error) {
    console.error(`Error getting feature config for ${feature}:`, error);
    return null;
  }
}

/**
 * Get enhanced tarot interpretation prompt with card-specific instructions
 * and spread/style guidelines
 */
export async function getTarotInterpretationPrompt(
  cardIds: string[],
  interpretationMethod: string,
  basePrompt: string,
  spreadId?: string,
  styleId?: string
): Promise<string> {
  try {
    // Import guideline actions
    const { getTarotGuidelineBySpreadAndStyle } = await import('@/actions/tarotGuidelineActions');
    
    // Get card-specific instructions
    const allInstructions: TarotCardInstruction[] = [];
    
    for (const cardId of cardIds) {
      const instructionsResult = await getTarotCardInstructions(cardId, interpretationMethod as any);
      if (instructionsResult.success && instructionsResult.data) {
        allInstructions.push(...instructionsResult.data);
      }
    }

    // Build enhanced prompt with card-specific instructions
    let enhancedPrompt = basePrompt;
    
    if (allInstructions.length > 0) {
      const cardInstructionSection = allInstructions
        .map(instruction => {
          return `
**Card: ${instruction.cardId}**
- Upright Instruction: ${instruction.uprightInstruction}
- Reversed Instruction: ${instruction.reversedInstruction}
${instruction.contextualHints ? `- Contextual Hints: ${instruction.contextualHints}` : ''}
${instruction.combinationHints ? `- Combination Hints: ${instruction.combinationHints}` : ''}
        `;
        })
        .join('\n');

      enhancedPrompt += `\n\n[CARD-SPECIFIC INSTRUCTIONS]\n${cardInstructionSection}\n[END CARD-SPECIFIC INSTRUCTIONS]`;
    }

    // Get spread and style specific guidelines
    if (spreadId && styleId) {
      const guidelineResult = await getTarotGuidelineBySpreadAndStyle(spreadId, styleId);
      
      if (guidelineResult.success && guidelineResult.data) {
        const guideline = guidelineResult.data;
        
        // Add spread-specific information
        const spreadInfo = {
          name: guideline.spreadName,
          generalApproach: guideline.generalApproach,
          positions: guideline.positions.map(pos => ({
            positionName: pos.positionName,
            interpretationFocus: pos.interpretationFocus,
            keyQuestions: pos.keyQuestions.join(', ')
          })),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        // Add style-specific information
        const styleInfo = {
          name: guideline.styleName,
          description: guideline.styleDescription,
          keyFocusAreas: guideline.keyFocusAreas.join(', '),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        // Replace placeholders in prompt
        enhancedPrompt = enhancedPrompt
          .replace('{{#if spreadGuideline}}', '')
          .replace('{{/if}}', '')
          .replace('{{#if styleGuideline}}', '')
          .replace(/\{\{\{spreadGuideline\.(\w+)\}\}\}/g, (match, prop) => spreadInfo[prop] || '')
          .replace(/\{\{\{styleGuideline\.(\w+)\}\}\}/g, (match, prop) => styleInfo[prop] || '');
        
        // Handle nested properties
        enhancedPrompt = enhancedPrompt.replace(/\{\{#each spreadGuideline\.positions\}\}([\s\S]*?)\{\{\/each\}\}/g, 
          (match, template) => {
            return spreadInfo.positions.map(pos => 
              template
                .replace(/\{\{\{this\.(\w+)\}\}\}/g, (m, prop) => pos[prop] || '')
            ).join('\n');
          }
        );
      }
    }

    return enhancedPrompt;
  } catch (error) {
    console.error('Error building enhanced tarot prompt:', error);
    return basePrompt; // Fallback to base prompt
  }
}

/**
 * Get fallback configuration for a feature
 */
export async function getFallbackConfig(feature: AIFeature): Promise<{
  provider: string;
  model: string;
  prompt: string;
}> {
  // Define fallback configurations for each feature
  const fallbacks = {
    'tarot-reading': {
      provider: 'googleai/gemini-1.5-pro-latest',
      model: 'gemini-1.5-pro-latest',
      prompt: 'You are a wise tarot reader. Provide insightful interpretations.',
    },
    'dream-interpretation': {
      provider: 'googleai/gemini-1.5-pro-latest',
      model: 'gemini-1.5-pro-latest',
      prompt: 'You are a dream interpreter. Analyze dreams with psychological insight.',
    },
    'general-chat': {
      provider: 'googleai/gemini-1.5-flash-latest',
      model: 'gemini-1.5-flash-latest',
      prompt: 'You are a helpful assistant.',
    },
  };

  return fallbacks[feature] || fallbacks['tarot-reading'];
}

/**
 * Check if a provider is healthy and available
 */
export async function checkProviderHealth(provider: AIProvider): Promise<boolean> {
  try {
    const result = await testAIProviderConnection(provider, 'dummy-key');
    return result.success;
  } catch (error) {
    console.error(`Health check failed for ${provider}:`, error);
    return false;
  }
}

/**
 * Get usage statistics for a provider
 */
export async function getProviderUsageStats(provider: AIProvider): Promise<{
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
}> {
  // This would typically query a monitoring/analytics service
  // For now, return mock data
  return {
    totalRequests: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    errorRate: 0,
  };
}