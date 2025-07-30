const { firestore } = require('./src/lib/firebase/admin');

async function checkAIProviders() {
  try {
    console.log('🔍 Checking AI Provider Configurations...');
    
    // Check aiProviderConfigs collection
    const providersSnapshot = await firestore.collection('aiProviderConfigs').get();
    
    console.log('📊 AI Provider Configs collection size:', providersSnapshot.size);
    
    if (providersSnapshot.empty) {
      console.log('❌ No AI provider configurations found!');
      
      // List all collections to debug
      const collections = await firestore.listCollections();
      console.log('Available collections:', collections.map(c => c.id));
      
      return { empty: true };
    }
    
    const providers = [];
    providersSnapshot.forEach(doc => {
      const data = doc.data();
      providers.push({
        id: doc.id,
        provider: data.provider,
        isActive: data.isActive,
        hasApiKey: !!data.apiKey,
        apiKeyLength: data.apiKey?.length || 0,
        modelsCount: data.models?.length || 0,
        models: data.models?.map(m => ({ id: m.id, name: m.name, isActive: m.isActive })) || []
      });
    });
    
    console.log('✅ Found AI providers:', providers);
    
    // Check prompt settings
    const promptDoc = await firestore.collection('aiConfiguration').doc('promptSettings').get();
    console.log('🎯 Prompt settings exists:', promptDoc.exists);
    if (promptDoc.exists) {
      const promptData = promptDoc.data();
      console.log('Model in prompt settings:', promptData.model);
    }
    
    return { providers, empty: false };
    
  } catch (error) {
    console.error('❌ Error checking AI providers:', error);
    return { error: error.message };
  }
}

checkAIProviders().then(result => {
  if (result.empty) {
    console.log('\n🚨 PROBLEM IDENTIFIED: No AI provider configurations exist!');
    console.log('This explains why gpt-3.5-turbo is being used as fallback.');
  } else if (result.providers) {
    console.log('\n✅ AI Provider Status Summary:');
    result.providers.forEach(p => {
      console.log(`  ${p.provider}: ${p.isActive ? '✅' : '❌'} (${p.modelsCount} models)`);
    });
  }
}).catch(console.error);