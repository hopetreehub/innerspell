import { z } from 'zod';

// AI Provider Types
export const AIProvider = z.enum([
  'openai',
  'gemini',
  'googleai',
  'anthropic',
  'grok',
  'openrouter',
  'huggingface'
]);
export type AIProvider = z.infer<typeof AIProvider>;

// Model configurations for each provider
export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: AIProvider,
  maxTokens: z.number().optional(),
  costPer1kTokens: z.number().optional(),
  capabilities: z.array(z.enum(['text', 'vision', 'function-calling'])).default(['text']),
  isActive: z.boolean().default(true),
});
export type AIModel = z.infer<typeof AIModelSchema>;

// API Configuration for each provider
export const AIProviderConfigSchema = z.object({
  provider: AIProvider,
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url().optional(), // For custom endpoints like OpenRouter
  organizationId: z.string().optional(), // For OpenAI
  isActive: z.boolean().default(true),
  maxRequestsPerMinute: z.number().min(1).max(1000).default(60),
  models: z.array(AIModelSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

// Feature types that can use AI
export const AIFeature = z.enum([
  'tarot-interpretation',
  'dream-interpretation',
  'tarot-question-clarification',
  'dream-question-clarification',
  'community-moderation',
  'content-generation'
]);
export type AIFeature = z.infer<typeof AIFeature>;

// Feature to Model mapping
export const AIFeatureMappingSchema = z.object({
  feature: AIFeature,
  provider: AIProvider,
  modelId: z.string(),
  promptTemplateId: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});
export type AIFeatureMapping = z.infer<typeof AIFeatureMappingSchema>;

// Available models by provider
export const AVAILABLE_MODELS: Record<AIProvider, Omit<AIModel, 'id'>[]> = {
  openai: [
    {
      name: 'GPT-4o',
      provider: 'openai',
      maxTokens: 128000,
      costPer1kTokens: 5.0,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'GPT-4o mini',
      provider: 'openai',
      maxTokens: 128000,
      costPer1kTokens: 0.15,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      costPer1kTokens: 10.0,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 16385,
      costPer1kTokens: 0.5,
      capabilities: ['text', 'function-calling'],
      isActive: true,
    },
  ],
  gemini: [
    {
      name: 'Gemini 1.5 Pro',
      provider: 'gemini',
      maxTokens: 2097152,
      costPer1kTokens: 3.5,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      maxTokens: 1048576,
      costPer1kTokens: 0.075,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'Gemini 1.5 Flash-8B',
      provider: 'gemini',
      maxTokens: 1048576,
      costPer1kTokens: 0.0375,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
  ],
  grok: [
    {
      name: 'Grok-2',
      provider: 'grok',
      maxTokens: 131072,
      costPer1kTokens: 5.0,
      capabilities: ['text', 'vision'],
      isActive: true,
    },
    {
      name: 'Grok-2 mini',
      provider: 'grok',
      maxTokens: 131072,
      costPer1kTokens: 2.0,
      capabilities: ['text'],
      isActive: true,
    },
  ],
  openrouter: [
    {
      name: 'Auto (best for prompt)',
      provider: 'openrouter',
      capabilities: ['text'],
      isActive: true,
    },
    {
      name: 'Claude 3.5 Sonnet',
      provider: 'openrouter',
      maxTokens: 200000,
      costPer1kTokens: 3.0,
      capabilities: ['text', 'vision'],
      isActive: true,
    },
    {
      name: 'Claude 3 Opus',
      provider: 'openrouter',
      maxTokens: 200000,
      costPer1kTokens: 15.0,
      capabilities: ['text', 'vision'],
      isActive: true,
    },
    {
      name: 'Llama 3.1 405B',
      provider: 'openrouter',
      maxTokens: 131072,
      costPer1kTokens: 2.0,
      capabilities: ['text'],
      isActive: true,
    },
  ],
  googleai: [
    {
      name: 'Gemini 1.5 Pro',
      provider: 'googleai',
      maxTokens: 2097152,
      costPer1kTokens: 3.5,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
    {
      name: 'Gemini 1.5 Flash',
      provider: 'googleai',
      maxTokens: 1048576,
      costPer1kTokens: 0.075,
      capabilities: ['text', 'vision', 'function-calling'],
      isActive: true,
    },
  ],
  anthropic: [
    {
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1kTokens: 3.0,
      capabilities: ['text', 'vision'],
      isActive: true,
    },
    {
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1kTokens: 15.0,
      capabilities: ['text', 'vision'],
      isActive: true,
    },
    {
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 200000,
      costPer1kTokens: 0.25,
      capabilities: ['text'],
      isActive: true,
    },
  ],
  huggingface: [
    {
      name: 'Mixtral-8x7B-Instruct',
      provider: 'huggingface',
      maxTokens: 32768,
      capabilities: ['text'],
      isActive: true,
    },
    {
      name: 'Llama-3-70B-Instruct',
      provider: 'huggingface',
      maxTokens: 8192,
      capabilities: ['text'],
      isActive: true,
    },
    {
      name: 'Phi-3-medium-128k-instruct',
      provider: 'huggingface',
      maxTokens: 131072,
      capabilities: ['text'],
      isActive: true,
    },
  ],
};

// Form schemas for UI
export const AIProviderConfigFormSchema = AIProviderConfigSchema.omit({
  createdAt: true,
  updatedAt: true,
  models: true,
});
export type AIProviderConfigFormData = z.infer<typeof AIProviderConfigFormSchema>;

export const AIFeatureMappingFormSchema = AIFeatureMappingSchema;
export type AIFeatureMappingFormData = z.infer<typeof AIFeatureMappingFormSchema>;