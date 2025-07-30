const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./innerspell-an7ce-firebase-adminsdk-fbsvc-146460f64e.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'innerspell-an7ce'
  });
}

async function checkFirestoreData() {
  try {
    const firestore = admin.firestore();
    
    // First, let's see what collections exist
    console.log('🔍 Listing all collections...');
    const collections = await firestore.listCollections();
    console.log('📄 Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    console.log('\n🔍 Checking aiProviderConfigs collection...');
    const providerConfigsSnapshot = await firestore.collection('aiProviderConfigs').get();
    
    if (!providerConfigsSnapshot.empty) {
      console.log('📄 aiProviderConfigs documents:');
      providerConfigsSnapshot.forEach(doc => {
        console.log(`\n--- Provider Config: ${doc.id} ---`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    } else {
      console.log('❌ aiProviderConfigs collection is empty or does not exist');
    }
    
    console.log('\n🔍 Checking aiConfiguration collection...');
    const aiConfigSnapshot = await firestore.collection('aiConfiguration').get();
    
    if (!aiConfigSnapshot.empty) {
      console.log('📄 aiConfiguration documents:');
      aiConfigSnapshot.forEach(doc => {
        console.log(`\n--- Document: ${doc.id} ---`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    }
    
    console.log('\n🔍 Checking for basic AI provider setup...');
    const googleaiProviderDoc = await firestore.collection('aiProviderConfigs').doc('googleai').get();
    
    if (!googleaiProviderDoc.exists) {
      console.log('🚀 Creating basic Google AI provider configuration...');
      
      // Simple encryption for the API key (in production, use proper encryption)
      const Buffer = require('buffer').Buffer;
      const encryptedApiKey = Buffer.from('AIzaSyCEYBrskvxVcI7oANkKWn__AxeDWSFQ3Yc').toString('base64');
      
      const googleaiProviderData = {
        provider: 'googleai',
        apiKey: encryptedApiKey,
        baseUrl: 'https://generativelanguage.googleapis.com',
        isActive: true,
        maxRequestsPerMinute: 60,
        models: [
          {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            isActive: true
          },
          {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            isActive: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await firestore.collection('aiProviderConfigs').doc('googleai').set(googleaiProviderData);
      console.log('✅ Created Google AI provider configuration');
    } else {
      console.log('✅ Google AI provider configuration already exists');
    }
    
    // Now display all the data that was created/exists
    console.log('\n📊 Final verification - All AI configurations:');
    
    const finalAiConfigSnapshot = await firestore.collection('aiConfiguration').get();
    if (!finalAiConfigSnapshot.empty) {
      finalAiConfigSnapshot.forEach(doc => {
        console.log(`\n--- ${doc.id} ---`);
        console.log(JSON.stringify(doc.data(), null, 2));
      });
    }
    
    const finalProviderSnapshot = await firestore.collection('aiProviderConfigs').get();
    if (!finalProviderSnapshot.empty) {
      console.log('\n📊 AI Provider Configurations:');
      finalProviderSnapshot.forEach(doc => {
        console.log(`\n--- Provider: ${doc.id} ---`);
        const data = doc.data();
        // Hide API key for security
        const displayData = { ...data, apiKey: '[ENCRYPTED]' };
        console.log(JSON.stringify(displayData, null, 2));
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error);
  } finally {
    process.exit(0);
  }
}

checkFirestoreData();