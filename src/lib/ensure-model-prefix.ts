/**
 * Ensure model ID has proper provider prefix
 * This is a defensive utility to handle all cases
 */
export function ensureModelHasProviderPrefix(modelId: string): string {
  if (!modelId) return 'openai/gpt-3.5-turbo'; // Safe default
  
  // If already has provider prefix, return as is
  if (modelId.includes('/')) {
    return modelId;
  }
  
  // Add provider prefix based on model name patterns
  const lowerModel = modelId.toLowerCase();
  
  if (lowerModel.includes('gpt') || lowerModel.includes('o1')) {
    return `openai/${modelId}`;
  } else if (lowerModel.includes('gemini')) {
    return `googleai/${modelId}`;
  } else if (lowerModel.includes('claude')) {
    return `anthropic/${modelId}`;
  } else if (lowerModel.includes('llama') || lowerModel.includes('mixtral')) {
    return `openrouter/${modelId}`;
  } else if (lowerModel.includes('grok')) {
    return `grok/${modelId}`;
  } else {
    // Default to OpenAI for unknown models
    return `openai/${modelId}`;
  }
}