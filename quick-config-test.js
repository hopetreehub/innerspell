const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./innerspell-an7ce-firebase-adminsdk-fbsvc-146460f64e.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'innerspell-an7ce'
  });
}

async function testPromptConfig() {
  try {
    console.log('🧪 Testing prompt configuration function...');
    
    // Test the prompt service directly
    const promptService = await import('./src/ai/services/prompt-service.ts');
    console.log('Available functions:', Object.keys(promptService));
    
    console.log('📖 Calling getTarotPromptConfig...');
    const config = await promptService.getTarotPromptConfig();
    
    console.log('✅ Configuration loaded:');
    console.log('- Model:', config.model);
    console.log('- Has provider prefix:', config.model.includes('/'));
    console.log('- Prompt template length:', config.promptTemplate.length);
    console.log('- Safety settings count:', config.safetySettings.length);
    
    // Test the AI provider service
    console.log('\n📖 Testing AI provider service...');
    const { getActiveAIModels } = await import('./src/ai/services/ai-provider-service.ts');
    
    const models = await getActiveAIModels();
    console.log('📊 Active models found:', models.length);
    models.forEach(model => {
      console.log(`  - ${model.id} (${model.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testPromptConfig();