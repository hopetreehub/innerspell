require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');
const fs = require('fs');

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

async function completeDebug() {
  console.log('[COMPLETE] Starting complete system debug...');
  
  // 1. Environment Variables Check
  console.log('[COMPLETE] 1. Environment Variables:');
  const envVars = [
    'OPENAI_API_KEY',
    'GOOGLE_API_KEY', 
    'GEMINI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];

  const envStatus = {};
  envVars.forEach(varName => {
    const value = process.env[varName];
    envStatus[varName] = !!value;
    console.log(`  ${varName}: ${value ? 'SET (' + value.substring(0, 10) + '...)' : 'NOT SET'}`);
  });
  
  // 2. Firestore AI Configuration
  console.log('[COMPLETE] 2. Firestore AI Configuration:');
  const promptDoc = await db.collection('aiConfiguration').doc('promptSettings').get();
  
  let firestoreConfig = null;
  if (promptDoc.exists) {
    firestoreConfig = promptDoc.data();
    console.log(`  Model: ${firestoreConfig.model}`);
    console.log(`  Has Custom Prompt: ${!!firestoreConfig.promptTemplate && firestoreConfig.promptTemplate.length > 0}`);
  } else {
    console.log('  No Firestore configuration found');
  }
  
  // 3. Simulate getTarotPromptConfig logic
  console.log('[COMPLETE] 3. Simulating getTarotPromptConfig logic:');
  
  // Simulate getActiveAIModels
  const simulateGetActiveAIModels = () => {
    const models = [];
    
    if (envStatus.OPENAI_API_KEY) {
      models.push({ id: 'openai/gpt-3.5-turbo', provider: 'openai' });
      models.push({ id: 'openai/gpt-4o', provider: 'openai' });
    }
    
    if (envStatus.GEMINI_API_KEY || envStatus.GOOGLE_API_KEY) {
      models.push({ id: 'googleai/gemini-1.5-flash', provider: 'googleai' });
      models.push({ id: 'googleai/gemini-1.5-pro', provider: 'googleai' });
    }
    
    if (models.length === 0) {
      // Default fallback
      models.push({ id: 'openai/gpt-3.5-turbo', provider: 'openai' });
      models.push({ id: 'googleai/gemini-1.5-flash', provider: 'googleai' });
    }
    
    return models;
  };
  
  const activeModels = simulateGetActiveAIModels();
  console.log('  Simulated active models:', activeModels.map(m => m.id));
  
  // Simulate getTarotPromptConfig
  const DEFAULT_TAROT_MODEL = 'googleai/gemini-1.5-pro';
  
  let resolvedModel;
  if (firestoreConfig) {
    let model = firestoreConfig.model || DEFAULT_TAROT_MODEL;
    
    // Add provider prefix if missing (this is the key logic)
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
      console.log(`  Added provider prefix: ${firestoreConfig.model} -> ${model}`);
    }
    resolvedModel = model;
  } else {
    // No Firestore config, use active models
    const openaiModel = activeModels.find(m => m.provider === 'openai');
    resolvedModel = openaiModel ? openaiModel.id : (activeModels.length > 0 ? activeModels[0].id : DEFAULT_TAROT_MODEL);
  }
  
  console.log(`  Final resolved model: ${resolvedModel}`);
  
  // 4. Analyze potential issues
  console.log('[COMPLETE] 4. Issue Analysis:');
  const issues = [];
  
  if (!envStatus.OPENAI_API_KEY && !envStatus.GEMINI_API_KEY && !envStatus.GOOGLE_API_KEY) {
    issues.push('No AI API keys found in environment');
  }
  
  if (firestoreConfig && firestoreConfig.model && !firestoreConfig.model.includes('/')) {
    issues.push(`Firestore model ID lacks provider prefix: ${firestoreConfig.model}`);
  }
  
  if (resolvedModel === 'openai/gpt-3.5-turbo' && !envStatus.OPENAI_API_KEY) {
    issues.push('Resolved to OpenAI model but no OpenAI API key available');
  }
  
  if (resolvedModel.startsWith('googleai/') && !envStatus.GEMINI_API_KEY && !envStatus.GOOGLE_API_KEY) {
    issues.push('Resolved to Google AI model but no Google API key available');
  }
  
  issues.forEach(issue => console.log(`  ❌ ${issue}`));
  
  if (issues.length === 0) {
    console.log('  ✅ No issues detected');
  }
  
  // 5. Test ensureModelHasProviderPrefix function
  console.log('[COMPLETE] 5. Testing ensureModelHasProviderPrefix function:');
  
  const ensureModelHasProviderPrefix = (modelId) => {
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
    } else {
      // Default to OpenAI for unknown models
      return `openai/${modelId}`;
    }
  };
  
  const testCases = [
    'gpt-3.5-turbo',
    'gpt-4o',
    'gemini-1.5-pro',
    'claude-3-sonnet',
    'openai/gpt-4',
    'googleai/gemini-1.5-flash',
    '',
    null
  ];
  
  testCases.forEach(testCase => {
    const result = ensureModelHasProviderPrefix(testCase);
    console.log(`  "${testCase}" -> "${result}"`);
  });
  
  // 6. Final diagnosis
  console.log('[COMPLETE] 6. Final Diagnosis:');
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAI: envStatus.OPENAI_API_KEY,
      hasGemini: envStatus.GEMINI_API_KEY || envStatus.GOOGLE_API_KEY,
    },
    firestore: {
      hasConfig: !!firestoreConfig,
      model: firestoreConfig?.model || 'none',
      hasProviderPrefix: firestoreConfig?.model?.includes('/') || false
    },
    resolution: {
      finalModel: resolvedModel,
      shouldWork: resolvedModel.includes('/'),
      hasRequiredApiKey: 
        (resolvedModel.startsWith('openai/') && envStatus.OPENAI_API_KEY) ||
        (resolvedModel.startsWith('googleai/') && (envStatus.GEMINI_API_KEY || envStatus.GOOGLE_API_KEY)) ||
        (resolvedModel.startsWith('anthropic/') && envStatus.ANTHROPIC_API_KEY)
    },
    issues: issues,
    recommendation: issues.length === 0 ? 'System should work correctly' : 'Issues need to be resolved'
  };
  
  console.log('  Environment APIs:', diagnosis.environment);
  console.log('  Firestore Config:', diagnosis.firestore);
  console.log('  Resolution:', diagnosis.resolution);
  console.log('  Recommendation:', diagnosis.recommendation);
  
  // 7. If there's a "gpt-3.5-turbo not found" issue, provide specific fix
  if (diagnosis.resolution.finalModel === 'openai/gpt-3.5-turbo' && !diagnosis.resolution.hasRequiredApiKey) {
    console.log('[COMPLETE] 7. Specific Fix for "gpt-3.5-turbo not found":');
    console.log('  ❌ Issue: Resolved to openai/gpt-3.5-turbo but no OpenAI API key');
    console.log('  🔧 Fix Option 1: Set OPENAI_API_KEY in environment variables');
    console.log('  🔧 Fix Option 2: Update Firestore to use googleai/gemini-1.5-pro since Google API is available');
    console.log('  🔧 Fix Option 3: Ensure AI provider system is properly configured');
  }
  
  // Save complete analysis
  fs.writeFileSync('complete-ai-debug-analysis.json', JSON.stringify(diagnosis, null, 2));
  console.log('[COMPLETE] Analysis saved to complete-ai-debug-analysis.json');
}

// Run the complete debug
completeDebug().catch(console.error);