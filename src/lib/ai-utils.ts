/**
 * Map provider prefix to standardized format
 */
export function normalizeModelId(modelId: string): string {
  // OpenAI models
  if (modelId.startsWith('openai/')) {
    return modelId;
  }
  // Google AI models
  if (modelId.startsWith('gemini/')) {
    return modelId.replace('gemini/', 'googleai/');
  }
  if (modelId.startsWith('googleai/')) {
    return modelId;
  }
  
  // If no prefix, try to determine provider
  if (modelId.includes('gpt')) {
    return `openai/${modelId}`;
  }
  if (modelId.includes('gemini')) {
    return `googleai/${modelId}`;
  }
  
  return modelId;
}

/**
 * Get provider-specific configuration
 */
export function getProviderConfig(modelId: string): {
  provider: string;
  modelName: string;
  supportsSystemMessage: boolean;
  supportsSafetySettings: boolean;
} {
  const normalized = normalizeModelId(modelId);
  const [provider, ...modelParts] = normalized.split('/');
  const modelName = modelParts.join('/');
  
  switch (provider) {
    case 'openai':
      return {
        provider: 'openai',
        modelName,
        supportsSystemMessage: true,
        supportsSafetySettings: false
      };
    case 'googleai':
      return {
        provider: 'googleai',
        modelName,
        supportsSystemMessage: false,
        supportsSafetySettings: true
      };
    default:
      return {
        provider,
        modelName,
        supportsSystemMessage: false,
        supportsSafetySettings: false
      };
  }
}