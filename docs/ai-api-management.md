# AI API Management System

This document describes the comprehensive AI API management system implemented for the admin dashboard.

## Overview

The AI API management system provides a unified interface for managing multiple AI providers, configuring models for different features, and managing tarot card interpretation instructions. This system supports OpenAI, Google Gemini, xAI Grok, OpenRouter, and Hugging Face.

## Features

### 1. AI Provider Management
- **Multiple Provider Support**: OpenAI, Gemini, Grok, OpenRouter, Hugging Face
- **Secure API Key Storage**: Encrypted storage of API keys using AES-256-GCM
- **Provider Configuration**: Base URLs, organization IDs, and other provider-specific settings
- **Connection Testing**: Verify API key validity and provider connectivity
- **Model Management**: Automatic model discovery and configuration per provider

### 2. Feature-to-Model Mapping
- **Flexible Assignment**: Assign different models to different features
- **Feature Types**: 
  - `tarot-interpretation`: Main tarot reading interpretations
  - `dream-interpretation`: Dream analysis
  - `tarot-question-clarification`: Clarifying questions for tarot
  - `dream-question-clarification`: Clarifying questions for dreams
  - `community-moderation`: Content moderation
  - `content-generation`: General content creation
- **Configuration Parameters**: Temperature, max tokens, top-p, frequency penalty, presence penalty

### 3. Tarot Card Instructions Management
- **Card-Specific Instructions**: Custom interpretation instructions for each tarot card
- **Interpretation Methods**: Support for multiple interpretation approaches
- **CRUD Operations**: Create, read, update, delete instructions
- **Batch Operations**: Bulk operations on multiple instructions
- **Template System**: Import/export instruction templates
- **Statistics**: Track completion rates and usage statistics

## Architecture

### Database Schema

#### AI Provider Configurations (`aiProviderConfigs`)
```typescript
{
  provider: 'openai' | 'gemini' | 'grok' | 'openrouter' | 'huggingface',
  apiKey: string, // Encrypted
  baseUrl?: string,
  organizationId?: string,
  isActive: boolean,
  models: AIModel[],
  createdAt: Date,
  updatedAt: Date
}
```

#### Feature Mappings (`aiFeatureMappings`)
```typescript
{
  feature: AIFeature,
  provider: AIProvider,
  modelId: string,
  temperature: number,
  maxTokens?: number,
  topP?: number,
  frequencyPenalty?: number,
  presencePenalty?: number
}
```

#### Tarot Card Instructions (`tarotCardInstructions`)
```typescript
{
  cardId: string,
  interpretationMethod: string,
  uprightInstruction: string,
  reversedInstruction: string,
  keywords: string[],
  symbolism?: {
    primary: string[],
    secondary: string[]
  },
  numerology?: string,
  astrology?: string,
  element?: string,
  chakra?: string,
  archetype?: string,
  shadow?: string,
  advice?: {
    general?: string,
    love?: string,
    career?: string,
    spiritual?: string
  },
  questionPrompts: string[],
  combinationNotes?: Record<string, string>,
  customPromptAddition?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string
}
```

### Services

#### AIProviderService
Core service for managing AI provider configurations and feature mappings.

**Key Methods:**
- `getAllProviderConfigs()`: Get all provider configurations
- `getProviderConfig(provider)`: Get specific provider configuration
- `saveProviderConfig(data)`: Save/update provider configuration
- `deleteProviderConfig(provider)`: Delete provider configuration
- `getAllFeatureMappings()`: Get all feature mappings
- `saveFeatureMapping(data)`: Save/update feature mapping
- `testProviderConnection(provider)`: Test provider connectivity

#### TarotInstructionsService
Service for managing tarot card interpretation instructions.

**Key Methods:**
- `getInstructions(filter?)`: Get instructions with optional filtering
- `getInstructionsForCard(cardId)`: Get all instructions for a specific card
- `getInstruction(cardId, method)`: Get specific instruction
- `saveInstruction(data, userId, id?)`: Save/update instruction
- `deleteInstruction(id)`: Delete instruction
- `batchOperation(operation, userId)`: Perform batch operations
- `importTemplate(template, userId)`: Import instruction template
- `exportTemplate(method, name, description)`: Export instruction template

#### EnhancedAIService
High-level service providing unified AI operations across providers.

**Key Methods:**
- `getFeatureConfig(feature)`: Get AI configuration for a feature
- `getTarotInterpretationPrompt(cardIds, method, basePrompt)`: Build enhanced tarot prompt
- `formatProviderRequest(provider, model, mapping, prompt, input)`: Format provider-specific requests
- `executeProviderRequest(provider, model, requestData)`: Execute API calls
- `getFallbackConfig(feature)`: Get fallback configuration
- `checkProviderHealth(provider)`: Check provider health

### Security

#### API Key Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Random 64-byte salt per encryption
- **Authentication**: GCM provides built-in authentication
- **Storage**: Encrypted keys stored in Firestore

#### Environment Variables
```bash
# Required for API key encryption
ENCRYPTION_KEY=your-secure-encryption-key-change-in-production
```

## Admin UI Components

### AIProviderManagement
Main component for managing AI providers and feature mappings.

**Features:**
- Provider configuration list with masked API keys
- Add/edit/delete provider configurations
- Test provider connections
- Feature mapping management
- Model selection and configuration

### TarotInstructionsManagement
Component for managing tarot card interpretation instructions.

**Features:**
- Instructions grid with filtering and search
- Card-specific instruction editing
- Batch operations on multiple instructions
- Template import/export
- Statistics dashboard

### Supporting Components
- `AIProviderConfigForm`: Form for configuring AI providers
- `AIFeatureMappingForm`: Form for mapping features to models
- `TarotInstructionForm`: Form for editing card instructions
- `TarotInstructionTemplateManager`: Template management interface

## Usage

### Setting Up AI Providers

1. **Navigate to Admin Dashboard** → AI 공급자 (AI Providers)
2. **Add Provider**: Click "Add Provider" and select the provider type
3. **Configure API Key**: Enter your API key for the selected provider
4. **Test Connection**: Verify the configuration works
5. **Save Configuration**: Enable the provider for use

### Mapping Features to Models

1. **Navigate to Feature Mappings** tab
2. **Add Mapping**: Click "Add Mapping"
3. **Select Feature**: Choose the feature to configure
4. **Select Provider and Model**: Choose from configured providers
5. **Adjust Parameters**: Set temperature, max tokens, etc.
6. **Save Mapping**: Apply the configuration

### Managing Tarot Instructions

1. **Navigate to Admin Dashboard** → 타로 지침 (Tarot Instructions)
2. **Add Instructions**: Click "Add Instruction"
3. **Select Card and Method**: Choose tarot card and interpretation method
4. **Fill Instructions**: Provide upright/reversed instructions
5. **Add Metadata**: Include keywords, symbolism, advice, etc.
6. **Save**: Apply the instruction

### Template Management

1. **Navigate to Templates** tab in Tarot Instructions
2. **Export Template**: Select interpretation method and export
3. **Import Template**: Upload JSON template file
4. **Batch Import**: Import multiple instructions at once

## Integration with Existing Code

The system is designed to be backward compatible with existing AI flows:

### Tarot Interpretation Flow
The `generate-tarot-interpretation.ts` flow can be enhanced to use the new system:

```typescript
// Enhanced prompt configuration
const enhancedConfig = await getEnhancedTarotPromptConfig(
  cardIds,
  interpretationMethod
);

if (enhancedConfig.useEnhancedSystem) {
  // Use enhanced prompt with card-specific instructions
  const tarotPrompt = ai.definePrompt({
    name: 'enhancedTarotInterpretationPrompt',
    input: { schema: GenerateTarotInterpretationInputSchema },
    prompt: enhancedConfig.enhancedPrompt,
    model: enhancedConfig.providerConfig.model.name,
    // ... other configurations
  });
} else {
  // Fallback to original system
  const { promptTemplate, model } = await getTarotPromptConfig();
  // ... original flow
}
```

## Monitoring and Analytics

### Provider Health Monitoring
- Connection health checks
- Response time monitoring
- Error rate tracking
- Usage statistics

### Instruction Analytics
- Completion percentage tracking
- Usage statistics by method
- Popular cards analysis
- Template usage tracking

## Best Practices

### Security
1. **Rotate API Keys**: Regularly rotate API keys for security
2. **Use Strong Encryption Key**: Generate a secure encryption key for production
3. **Monitor Usage**: Track API usage and costs
4. **Access Control**: Restrict admin access to authorized users only

### Performance
1. **Provider Selection**: Choose appropriate models for each feature
2. **Caching**: Implement caching for frequently used configurations
3. **Fallback Strategy**: Always have fallback configurations
4. **Load Balancing**: Distribute load across multiple providers when possible

### Maintenance
1. **Regular Updates**: Keep model configurations up to date
2. **Backup Templates**: Export and backup instruction templates
3. **Monitor Costs**: Track API usage and costs across providers
4. **Test Connections**: Regularly test provider connections

## Troubleshooting

### Common Issues

1. **API Key Encryption Errors**
   - Check `ENCRYPTION_KEY` environment variable
   - Verify key format for specific provider
   - Test API key validity manually

2. **Provider Connection Failures**
   - Verify API key is correct and active
   - Check network connectivity
   - Validate base URL configuration

3. **Missing Instructions**
   - Check if instructions are active
   - Verify card ID matches tarot deck
   - Ensure interpretation method is correct

4. **Template Import Errors**
   - Validate JSON format
   - Check template schema compatibility
   - Verify card IDs exist in system

### Error Handling
The system includes comprehensive error handling:
- Provider failures fall back to default configurations
- Encryption errors are logged and handled gracefully
- Invalid configurations are validated before saving
- Failed API calls include detailed error messages

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Detailed usage and performance metrics
2. **Auto-Scaling**: Dynamic provider selection based on load
3. **Cost Optimization**: Intelligent model selection based on cost/quality
4. **A/B Testing**: Compare different models and prompts
5. **Webhook Integration**: Real-time notifications for failures
6. **Custom Models**: Support for fine-tuned models
7. **Advanced Caching**: Redis-based caching for improved performance
8. **Rate Limiting**: Provider-specific rate limiting
9. **Prompt Versioning**: Version control for prompt templates
10. **Multi-Language Support**: Localized prompts and instructions

## API Reference

### Environment Variables
```bash
# Required
ENCRYPTION_KEY=your-secure-encryption-key-change-in-production

# Optional
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Database Collections
- `aiProviderConfigs`: AI provider configurations
- `aiFeatureMappings`: Feature to model mappings
- `tarotCardInstructions`: Tarot card interpretation instructions
- `tarotInstructionTemplates`: Instruction templates

### Firestore Security Rules
```javascript
// Add to your firestore.rules
match /aiProviderConfigs/{document} {
  allow read, write: if request.auth != null && 
    resource.data.userRole == 'admin';
}

match /aiFeatureMappings/{document} {
  allow read, write: if request.auth != null && 
    resource.data.userRole == 'admin';
}

match /tarotCardInstructions/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    resource.data.userRole == 'admin';
}
```

This comprehensive AI API management system provides a robust foundation for managing multiple AI providers, configuring models for different features, and maintaining detailed tarot card interpretation instructions. The system is designed to be scalable, secure, and maintainable while providing extensive customization options for different use cases.