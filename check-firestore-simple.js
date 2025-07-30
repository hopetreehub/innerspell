// Simple Firestore check using Firebase Admin
const admin = require('firebase-admin');

async function checkFirestore() {
  try {
    console.log('🔍 Initializing Firebase Admin...');
    
    // Parse service account from environment
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found');
      return;
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'innerspell-an7ce'
      });
    }
    
    const db = admin.firestore();
    
    console.log('✅ Firebase Admin initialized');
    
    // Check aiProviderConfigs collection
    const snapshot = await db.collection('aiProviderConfigs').get();
    console.log('📊 aiProviderConfigs collection size:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('❌ No AI provider configurations found!');
      
      // Check all collections
      const collections = await db.listCollections();
      console.log('Available collections:', collections.map(c => c.id));
      
      return { empty: true };
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Provider: ${doc.id}`, {
        isActive: data.isActive,
        modelsCount: data.models?.length || 0
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFirestore();