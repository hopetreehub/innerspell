import admin from 'firebase-admin';

// Check if we're in development mode with mock auth
const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
   process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');

// Production Firebase Admin initialization
if (!admin.apps.length) {
  try {
    let credential;
    
    // Skip Firebase initialization in development mock mode
    if (isDevelopmentMode) {
      console.log('🔧 Development mode detected - using mock Firebase Admin');
      // Initialize with mock credential for development
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'innerspell-an7ce-dev',
      });
    } else {
      // Try using service account key from environment variable (Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && 
          !process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에')) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          credential = admin.credential.cert(serviceAccount);
          console.log('✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY');
        } catch (parseError) {
          console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
          console.log('🔄 Falling back to mock mode');
          credential = admin.credential.applicationDefault();
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
    }
    
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    // In development, continue without throwing
    if (!isDevelopmentMode) {
      throw error;
    }
  }
}

// Export real Firebase Admin components
const firestore = admin.firestore();
const db = firestore;
const FieldValue = admin.firestore.FieldValue;
const auth = admin.auth();

// Export with consistent naming for API routes
export const adminApp = admin;
export const adminAuth = auth;
export const adminFirestore = firestore;

// Initialize admin function for API routes
export function initAdmin() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
}

export { admin, firestore, db, FieldValue, auth };