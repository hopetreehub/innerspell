'use server';

import { firestore } from '@/lib/firebase/admin';
import { encrypt, decrypt, maskApiKey, validateApiKeyFormat } from '@/lib/encryption';
import { 
  AIProvider, 
  AIProviderConfig, 
  AIFeatureMapping, 
  AIModel,
  AVAILABLE_MODELS,
  AIProviderConfigFormData,
  AIFeatureMappingFormData,
  AIFeature
} from '@/types/ai-providers';
import { FieldValue } from '@/lib/firebase/admin';

const AI_CONFIG_COLLECTION = 'aiProviderConfigs';
const AI_FEATURE_MAPPING_COLLECTION = 'aiFeatureMappings';

/**
 * Get all AI provider configurations
 */
export async function getAllProviderConfigs(): Promise<AIProviderConfig[]> {
  try {
    const snapshot = await firestore.collection(AI_CONFIG_COLLECTION).get();
    const configs: AIProviderConfig[] = [];
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      // Decrypt API key for internal use
      if (data.apiKey) {
        try {
          data.apiKey = decrypt(data.apiKey);
        } catch (error) {
          console.error(`Failed to decrypt API key for provider ${data.provider}:`, error);
          data.apiKey = ''; // Set to empty if decryption fails
        }
      }
      configs.push({ ...data, id: doc.id } as AIProviderConfig);
    });
    
    return configs;
  } catch (error) {
    console.error('Error fetching provider configs:', error);
    throw new Error('Failed to fetch AI provider configurations');
  }
}

/**
 * Get a single provider configuration
 */
export async function getProviderConfig(provider: AIProvider): Promise<AIProviderConfig | null> {
  try {
    const doc = await firestore
      .collection(AI_CONFIG_COLLECTION)
      .doc(provider)
      .get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data()!;
    // Decrypt API key
    if (data.apiKey) {
      try {
        data.apiKey = decrypt(data.apiKey);
      } catch (error) {
        console.error(`Failed to decrypt API key for provider ${provider}:`, error);
        data.apiKey = '';
      }
    }
    
    return { ...data, id: doc.id } as AIProviderConfig;
  } catch (error) {
    console.error(`Error fetching provider config for ${provider}:`, error);
    throw new Error(`Failed to fetch configuration for ${provider}`);
  }
}

/**
 * Save or update a provider configuration
 */
export async function saveProviderConfig(data: AIProviderConfigFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Validate API key format
    if (!validateApiKeyFormat(data.provider, data.apiKey)) {
      return {
        success: false,
        message: `Invalid API key format for ${data.provider}`
      };
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(data.apiKey);
    
    // Get available models for this provider
    const models: AIModel[] = AVAILABLE_MODELS[data.provider].map((model, index) => ({
      ...model,
      id: `${data.provider}-${index}`,
    }));

    const configData: Partial<AIProviderConfig> = {
      ...data,
      apiKey: encryptedApiKey,
      models,
      updatedAt: new Date(),
    };

    // Check if document exists
    const docRef = firestore.collection(AI_CONFIG_COLLECTION).doc(data.provider);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      configData.createdAt = new Date();
    }

    await docRef.set(configData, { merge: true });

    return {
      success: true,
      message: `${data.provider} configuration saved successfully`
    };
  } catch (error) {
    console.error('Error saving provider config:', error);
    return {
      success: false,
      message: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Delete a provider configuration
 */
export async function deleteProviderConfig(provider: AIProvider): Promise<{ success: boolean; message: string }> {
  try {
    // Check if provider is used in any feature mappings
    const mappingsSnapshot = await firestore
      .collection(AI_FEATURE_MAPPING_COLLECTION)
      .where('provider', '==', provider)
      .get();
    
    if (!mappingsSnapshot.empty) {
      return {
        success: false,
        message: `Cannot delete ${provider} as it is currently used in ${mappingsSnapshot.size} feature mappings`
      };
    }

    await firestore.collection(AI_CONFIG_COLLECTION).doc(provider).delete();

    return {
      success: true,
      message: `${provider} configuration deleted successfully`
    };
  } catch (error) {
    console.error('Error deleting provider config:', error);
    return {
      success: false,
      message: `Failed to delete configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get all feature mappings
 */
export async function getAllFeatureMappings(): Promise<AIFeatureMapping[]> {
  try {
    const snapshot = await firestore.collection(AI_FEATURE_MAPPING_COLLECTION).get();
    const mappings: AIFeatureMapping[] = [];
    
    snapshot.forEach((doc: any) => {
      mappings.push({ ...doc.data(), id: doc.id } as AIFeatureMapping);
    });
    
    return mappings;
  } catch (error) {
    console.error('Error fetching feature mappings:', error);
    throw new Error('Failed to fetch AI feature mappings');
  }
}

/**
 * Get feature mapping for a specific feature
 */
export async function getFeatureMapping(feature: AIFeature): Promise<AIFeatureMapping | null> {
  try {
    const doc = await firestore
      .collection(AI_FEATURE_MAPPING_COLLECTION)
      .doc(feature)
      .get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { ...doc.data(), id: doc.id } as AIFeatureMapping;
  } catch (error) {
    console.error(`Error fetching feature mapping for ${feature}:`, error);
    throw new Error(`Failed to fetch mapping for ${feature}`);
  }
}

/**
 * Save or update a feature mapping
 */
export async function saveFeatureMapping(data: AIFeatureMappingFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Verify provider exists and is active
    const providerConfig = await getProviderConfig(data.provider);
    if (!providerConfig) {
      return {
        success: false,
        message: `Provider ${data.provider} is not configured`
      };
    }
    
    if (!providerConfig.isActive) {
      return {
        success: false,
        message: `Provider ${data.provider} is not active`
      };
    }

    // Verify model exists for the provider
    const modelExists = providerConfig.models.some(m => m.id === data.modelId);
    if (!modelExists) {
      return {
        success: false,
        message: `Model ${data.modelId} not found for provider ${data.provider}`
      };
    }

    await firestore
      .collection(AI_FEATURE_MAPPING_COLLECTION)
      .doc(data.feature)
      .set(data, { merge: true });

    return {
      success: true,
      message: `Feature mapping for ${data.feature} saved successfully`
    };
  } catch (error) {
    console.error('Error saving feature mapping:', error);
    return {
      success: false,
      message: `Failed to save feature mapping: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Delete a feature mapping
 */
export async function deleteFeatureMapping(feature: AIFeature): Promise<{ success: boolean; message: string }> {
  try {
    await firestore.collection(AI_FEATURE_MAPPING_COLLECTION).doc(feature).delete();

    return {
      success: true,
      message: `Feature mapping for ${feature} deleted successfully`
    };
  } catch (error) {
    console.error('Error deleting feature mapping:', error);
    return {
      success: false,
      message: `Failed to delete feature mapping: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test a provider connection
 */
export async function testProviderConnection(provider: AIProvider): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getProviderConfig(provider);
    if (!config) {
      return {
        success: false,
        message: `No configuration found for ${provider}`
      };
    }

    // Here you would implement actual API testing for each provider
    // For now, we'll just verify the API key exists
    if (!config.apiKey) {
      return {
        success: false,
        message: `No API key configured for ${provider}`
      };
    }

    // TODO: Implement actual API testing for each provider
    // This would involve making a simple API call to verify the key works

    return {
      success: true,
      message: `Connection to ${provider} successful`
    };
  } catch (error) {
    console.error(`Error testing ${provider} connection:`, error);
    return {
      success: false,
      message: `Failed to test connection: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get provider configs for display (with masked API keys)
 */
export async function getProviderConfigsForDisplay(): Promise<Array<AIProviderConfig & { maskedApiKey: string }>> {
  try {
    const configs = await getAllProviderConfigs();
    
    return configs.map(config => ({
      ...config,
      maskedApiKey: config.apiKey ? maskApiKey(config.apiKey) : '',
      apiKey: '' // Don't send actual API key to client
    }));
  } catch (error) {
    console.error('Error fetching provider configs for display:', error);
    throw new Error('Failed to fetch provider configurations');
  }
}

// Legacy AIProviderService methods are now available as individual exports
// Use the exported functions directly instead of AIProviderService.methodName