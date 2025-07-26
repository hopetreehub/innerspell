import admin from 'firebase-admin';

// Production Firebase Admin initialization
if (!admin.apps.length) {
  try {
    let credential;
    
    // Try using service account key from environment variable (Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY');
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        throw parseError;
      }
    } else {
      // Fall back to application default credentials (local development)
      credential = admin.credential.applicationDefault();
      console.log('✅ Using Firebase application default credentials');
    }
    
    // 🔧 긴급 수정: 환경변수에서 개행 문자 및 특수 문자 제거
    const cleanProjectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'innerspell-an7ce')
      .trim()
      .replace(/\n/g, '')
      .replace(/"/g, '');
    
    console.log('🔍 Clean Project ID:', cleanProjectId);
    
    admin.initializeApp({
      credential: credential,
      projectId: cleanProjectId,
    });
    
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

// Export real Firebase Admin components
const firestore = admin.firestore();
const db = firestore;
const FieldValue = admin.firestore.FieldValue;
const auth = admin.auth();

// Initialize admin function for API routes
export function initAdmin() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
}

export { admin, firestore, db, FieldValue, auth };