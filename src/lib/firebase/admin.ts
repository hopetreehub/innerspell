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
        storageBucket: 'innerspell-an7ce.appspot.com',
      });
    } else {
      // Try using service account key from environment variable (Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && 
          !process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에')) {
        try {
          let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
          
          // Base64 디코딩 지원
          if (serviceAccountKey.startsWith('ey') || !serviceAccountKey.includes('{')) {
            console.log('🔐 Decoding Base64 encoded service account key...');
            serviceAccountKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
          }
          
          // JSON 파싱
          const serviceAccount = JSON.parse(serviceAccountKey);
          
          // 필수 필드 검증
          if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid service account key: missing required fields');
          }
          
          credential = admin.credential.cert(serviceAccount);
          console.log('✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY');
          console.log('📌 Project ID:', serviceAccount.project_id);
        } catch (parseError) {
          console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
          console.log('🔄 Falling back to mock mode');
          credential = admin.credential.applicationDefault();
        }
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
        // Base64로 인코딩된 서비스 계정 키 지원
        try {
          console.log('🔐 Using Base64 encoded service account key...');
          const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
          const serviceAccount = JSON.parse(decoded);
          
          credential = admin.credential.cert(serviceAccount);
          console.log('✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY_BASE64');
          console.log('📌 Project ID:', serviceAccount.project_id);
        } catch (error) {
          console.error('❌ Failed to decode Base64 service account key:', error);
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
        storageBucket: `${cleanProjectId}.appspot.com`,
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
const storage = admin.storage();

// Export with consistent naming for API routes
export const adminApp = admin;
export const adminAuth = auth;
export const adminFirestore = firestore;
export const adminStorage = storage;

// Initialize admin function for API routes
export function initAdmin() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
}

// Firebase 연결 상태 확인
export async function checkFirebaseConnection(): Promise<{
  connected: boolean;
  projectId?: string;
  error?: string;
}> {
  try {
    // Firestore 연결 테스트
    const testDoc = await firestore.collection('_connection_test').doc('test').get();
    
    return {
      connected: true,
      projectId: admin.app().options.projectId
    };
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Firebase 서비스 상태 확인
export function getFirebaseStatus() {
  if (!admin.apps.length) {
    return {
      initialized: false,
      mode: 'not-initialized'
    };
  }
  
  return {
    initialized: true,
    mode: isDevelopmentMode ? 'mock' : 'production',
    projectId: admin.app().options.projectId,
    hasServiceAccount: !!(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64)
  };
}

export { admin, firestore, db, FieldValue, auth };