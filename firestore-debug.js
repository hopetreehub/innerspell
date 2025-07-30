const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = '/mnt/e/project/test-studio-firebase/innerspell-an7ce-firebase-adminsdk-fbsvc-146460f64e.json';
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'innerspell-an7ce'
  });
}

const db = admin.firestore();

async function debugFirestoreAIConfig() {
  console.log('[FIRESTORE] Starting AI configuration debug...');
  
  try {
    // 1. Check AI Configuration - Prompt Settings
    console.log('[FIRESTORE] Checking AI prompt settings...');
    const promptDoc = await db.collection('aiConfiguration').doc('promptSettings').get();
    
    if (promptDoc.exists) {
      const promptData = promptDoc.data();
      console.log('[FIRESTORE] Prompt Settings found:');
      console.log('  Model:', promptData.model);
      console.log('  Prompt Template Length:', promptData.promptTemplate ? promptData.promptTemplate.length : 'N/A');
      console.log('  Safety Settings:', promptData.safetySettings ? promptData.safetySettings.length : 'N/A');
      
      // Save to file for detailed analysis
      fs.writeFileSync('firestore-prompt-config.json', JSON.stringify(promptData, null, 2));
    } else {
      console.log('[FIRESTORE] No prompt settings found');
    }
    
    // 2. Check AI Providers Configuration
    console.log('[FIRESTORE] Checking AI providers...');
    const providersSnapshot = await db.collection('aiProviders').get();
    
    const providers = [];
    providersSnapshot.forEach(doc => {
      const data = doc.data();
      providers.push({
        id: doc.id,
        provider: data.provider,
        isActive: data.isActive,
        model: data.model,
        hasApiKey: data.apiKey ? '***EXISTS***' : 'NO'
      });
    });
    
    console.log(`[FIRESTORE] Found ${providers.length} AI providers:`);
    providers.forEach(provider => {
      console.log(`  ${provider.id}: ${provider.provider}/${provider.model} - Active: ${provider.isActive} - API Key: ${provider.hasApiKey}`);
    });
    
    // Find active providers
    const activeProviders = providers.filter(p => p.isActive);
    console.log(`[FIRESTORE] Active providers: ${activeProviders.length}`);
    
    // Save providers data
    fs.writeFileSync('firestore-providers-config.json', JSON.stringify(providers, null, 2));
    
    // 3. Check AI Features Configuration
    console.log('[FIRESTORE] Checking AI features...');
    const featuresSnapshot = await db.collection('aiFeatures').get();
    
    const features = [];
    featuresSnapshot.forEach(doc => {
      const data = doc.data();
      features.push({
        id: doc.id,
        feature: data.feature,
        isEnabled: data.isEnabled,
        providerId: data.providerId,
        model: data.model
      });
    });
    
    console.log(`[FIRESTORE] Found ${features.length} AI features:`);
    features.forEach(feature => {
      console.log(`  ${feature.id}: ${feature.feature} - Enabled: ${feature.isEnabled} - Provider: ${feature.providerId} - Model: ${feature.model}`);
    });
    
    fs.writeFileSync('firestore-features-config.json', JSON.stringify(features, null, 2));
    
    // 4. Create comprehensive analysis
    const analysis = {
      timestamp: new Date().toISOString(),
      promptSettings: promptDoc.exists ? promptDoc.data() : null,
      providers: providers,
      activeProviders: activeProviders,
      features: features,
      enabledFeatures: features.filter(f => f.isEnabled),
      issues: []
    };
    
    // Analyze for potential issues
    if (!promptDoc.exists) {
      analysis.issues.push('No prompt settings configured in Firestore');
    }
    
    if (activeProviders.length === 0) {
      analysis.issues.push('No active AI providers found');
    }
    
    const tarotFeature = features.find(f => f.feature === 'tarot-reading');
    if (!tarotFeature) {
      analysis.issues.push('No tarot-reading feature configured');
    } else if (!tarotFeature.isEnabled) {
      analysis.issues.push('Tarot-reading feature is disabled');
    }
    
    // Check for the specific model issue
    if (promptDoc.exists) {
      const promptData = promptDoc.data();
      if (promptData.model === 'gpt-3.5-turbo') {
        analysis.issues.push('Prompt settings still using bare gpt-3.5-turbo model ID (missing provider prefix)');
      }
    }
    
    activeProviders.forEach(provider => {
      if (provider.hasApiKey === 'NO') {
        analysis.issues.push(`Active provider ${provider.id} has no API key`);
      }
    });
    
    console.log(`[FIRESTORE] Analysis complete. Found ${analysis.issues.length} potential issues:`);
    analysis.issues.forEach(issue => console.log(`  - ${issue}`));
    
    // Save comprehensive analysis
    fs.writeFileSync('firestore-ai-analysis.json', JSON.stringify(analysis, null, 2));
    
    // 5. Test the actual function calls that the app would make
    console.log('[FIRESTORE] Testing actual function calls...');
    
    // Simulate getTarotPromptConfig function
    const getActiveAIModels = async () => {
      const activeProviders = providers.filter(p => p.isActive && p.hasApiKey === '***EXISTS***');
      return activeProviders.map(p => ({
        id: p.model.includes('/') ? p.model : `${p.provider}/${p.model}`,
        provider: p.provider
      }));
    };
    
    const activeModels = await getActiveAIModels();
    console.log('[FIRESTORE] Simulated active models:', activeModels);
    
    // Simulate the actual config loading logic
    let resolvedModel = 'googleai/gemini-1.5-pro'; // default fallback
    if (promptDoc.exists) {
      const configData = promptDoc.data();
      let model = configData.model || resolvedModel;
      
      // This is the key logic - ensure model has provider prefix
      if (!model.includes('/')) {
        if (model.includes('gpt') || model.includes('o1')) {
          model = `openai/${model}`;
        } else if (model.includes('gemini')) {
          model = `googleai/${model}`;
        } else if (model.includes('claude')) {
          model = `anthropic/${model}`;
        } else {
          model = `openai/${model}`;
        }
        console.log(`[FIRESTORE] Added provider prefix: ${configData.model} -> ${model}`);
      }
      resolvedModel = model;
    } else if (activeModels.length > 0) {
      // Prefer OpenAI models if available
      const openaiModel = activeModels.find(m => m.provider === 'openai');
      resolvedModel = openaiModel ? openaiModel.id : activeModels[0].id;
    }
    
    console.log('[FIRESTORE] Final resolved model would be:', resolvedModel);
    
    const finalAnalysis = {
      ...analysis,
      simulatedActiveModels: activeModels,
      finalResolvedModel: resolvedModel,
      expectedBehavior: resolvedModel.includes('/') ? 'Should work correctly' : 'May cause NOT_FOUND error'
    };
    
    fs.writeFileSync('firestore-final-analysis.json', JSON.stringify(finalAnalysis, null, 2));
    
    console.log('[FIRESTORE] Debug complete. Check generated JSON files for detailed analysis.');
    
  } catch (error) {
    console.error('[FIRESTORE] Error during debug:', error);
    fs.writeFileSync('firestore-debug-error.txt', error.toString());
  }
}

// Run the debug
debugFirestoreAIConfig().catch(console.error);