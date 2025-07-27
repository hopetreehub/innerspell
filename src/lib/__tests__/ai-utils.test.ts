import { normalizeModelId, getProviderConfig } from '../ai-utils';

describe('AI Utils', () => {
  describe('normalizeModelId', () => {
    it('should preserve OpenAI model IDs with prefix', () => {
      expect(normalizeModelId('openai/gpt-4')).toBe('openai/gpt-4');
      expect(normalizeModelId('openai/gpt-3.5-turbo')).toBe('openai/gpt-3.5-turbo');
      expect(normalizeModelId('openai/gpt-4o-mini')).toBe('openai/gpt-4o-mini');
    });

    it('should convert gemini prefix to googleai', () => {
      expect(normalizeModelId('gemini/gemini-1.5-pro')).toBe('googleai/gemini-1.5-pro');
      expect(normalizeModelId('gemini/gemini-1.5-flash')).toBe('googleai/gemini-1.5-flash');
    });

    it('should preserve googleai prefix', () => {
      expect(normalizeModelId('googleai/gemini-1.5-pro')).toBe('googleai/gemini-1.5-pro');
      expect(normalizeModelId('googleai/gemini-pro')).toBe('googleai/gemini-pro');
    });

    it('should auto-detect OpenAI models without prefix', () => {
      expect(normalizeModelId('gpt-4')).toBe('openai/gpt-4');
      expect(normalizeModelId('gpt-3.5-turbo')).toBe('openai/gpt-3.5-turbo');
      expect(normalizeModelId('gpt-4o')).toBe('openai/gpt-4o');
    });

    it('should auto-detect Google models without prefix', () => {
      expect(normalizeModelId('gemini-1.5-pro')).toBe('googleai/gemini-1.5-pro');
      expect(normalizeModelId('gemini-pro')).toBe('googleai/gemini-pro');
      expect(normalizeModelId('gemini-1.5-flash-latest')).toBe('googleai/gemini-1.5-flash-latest');
    });

    it('should return unchanged for unknown models', () => {
      expect(normalizeModelId('claude-3')).toBe('claude-3');
      expect(normalizeModelId('llama-2')).toBe('llama-2');
      expect(normalizeModelId('unknown-model')).toBe('unknown-model');
    });

    it('should handle edge cases', () => {
      expect(normalizeModelId('')).toBe('');
      expect(normalizeModelId('/')).toBe('/');
      expect(normalizeModelId('provider/')).toBe('provider/');
    });
  });

  describe('getProviderConfig', () => {
    it('should return correct config for OpenAI models', () => {
      const config = getProviderConfig('openai/gpt-4');
      
      expect(config).toEqual({
        provider: 'openai',
        modelName: 'gpt-4',
        supportsSystemMessage: true,
        supportsSafetySettings: false
      });
    });

    it('should return correct config for Google AI models', () => {
      const config = getProviderConfig('googleai/gemini-1.5-pro');
      
      expect(config).toEqual({
        provider: 'googleai',
        modelName: 'gemini-1.5-pro',
        supportsSystemMessage: false,
        supportsSafetySettings: true
      });
    });

    it('should normalize model ID before processing', () => {
      // Test auto-detection
      const gptConfig = getProviderConfig('gpt-4');
      expect(gptConfig.provider).toBe('openai');
      expect(gptConfig.modelName).toBe('gpt-4');

      const geminiConfig = getProviderConfig('gemini-1.5-pro');
      expect(geminiConfig.provider).toBe('googleai');
      expect(geminiConfig.modelName).toBe('gemini-1.5-pro');
    });

    it('should handle gemini prefix conversion', () => {
      const config = getProviderConfig('gemini/gemini-1.5-flash');
      
      expect(config.provider).toBe('googleai');
      expect(config.modelName).toBe('gemini-1.5-flash');
    });

    it('should return default config for unknown providers', () => {
      const config = getProviderConfig('claude/claude-3');
      
      expect(config).toEqual({
        provider: 'claude',
        modelName: 'claude-3',
        supportsSystemMessage: false,
        supportsSafetySettings: false
      });
    });

    it('should handle complex model names', () => {
      const config = getProviderConfig('googleai/models/gemini-1.5-pro-latest');
      
      expect(config.provider).toBe('googleai');
      expect(config.modelName).toBe('models/gemini-1.5-pro-latest');
    });

    it('should handle empty and malformed inputs', () => {
      expect(() => getProviderConfig('')).not.toThrow();
      expect(() => getProviderConfig('/')).not.toThrow();
      expect(() => getProviderConfig('///')).not.toThrow();
      
      const emptyConfig = getProviderConfig('');
      expect(emptyConfig.provider).toBe('');
      expect(emptyConfig.modelName).toBe('');
    });
  });

  describe('Provider capabilities', () => {
    it('should correctly identify OpenAI capabilities', () => {
      const models = ['openai/gpt-4', 'openai/gpt-3.5-turbo', 'gpt-4o'];
      
      models.forEach(model => {
        const config = getProviderConfig(model);
        expect(config.supportsSystemMessage).toBe(true);
        expect(config.supportsSafetySettings).toBe(false);
      });
    });

    it('should correctly identify Google AI capabilities', () => {
      const models = ['googleai/gemini-1.5-pro', 'gemini-1.5-flash', 'gemini/gemini-pro'];
      
      models.forEach(model => {
        const config = getProviderConfig(model);
        expect(config.supportsSystemMessage).toBe(false);
        expect(config.supportsSafetySettings).toBe(true);
      });
    });

    it('should provide safe defaults for unknown providers', () => {
      const unknownModels = ['anthropic/claude-3', 'huggingface/llama-2', 'custom-model'];
      
      unknownModels.forEach(model => {
        const config = getProviderConfig(model);
        expect(config.supportsSystemMessage).toBe(false);
        expect(config.supportsSafetySettings).toBe(false);
      });
    });
  });
});