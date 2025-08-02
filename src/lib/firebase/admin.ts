import admin from 'firebase-admin';

let adminInitialized = false;
let initializationError: Error | null = null;

// Skip Firebase Admin initialization during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// Production Firebase Admin initialization
if (!admin.apps.length && !isBuildTime) {
  try {
    let credential;
    
    // Try using service account key from environment variable (Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        credential = admin.credential.cert(serviceAccount);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Using Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        throw parseError;
      }
    } else {
      // Fall back to application default credentials (local development)
      try {
        credential = admin.credential.applicationDefault();
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Using Firebase application default credentials');
        }
      } catch (defaultError) {
        console.log('⚠️ Application default credentials not available, skipping admin initialization');
        initializationError = defaultError as Error;
        adminInitialized = false;
      }
    }
    
    if (credential) {
      // 🔧 환경변수에서 개행 문자 및 특수 문자 제거
      const cleanProjectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'innerspell-an7ce')
        .trim()
        .replace(/\n/g, '')
        .replace(/"/g, '');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Clean Project ID:', cleanProjectId);
      }
      
      admin.initializeApp({
        credential: credential,
        projectId: cleanProjectId,
      });
      
      adminInitialized = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔥 Firebase Admin SDK initialized successfully');
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    initializationError = error as Error;
    adminInitialized = false;
  }
}

// Safe Firebase Admin components with fallback
let firestore: admin.firestore.Firestore | null = null;
let db: admin.firestore.Firestore | null = null;
let FieldValue: typeof admin.firestore.FieldValue | null = null;
let auth: admin.auth.Auth | null = null;

if (adminInitialized && admin.apps.length > 0 && !isBuildTime) {
  try {
    firestore = admin.firestore();
    db = firestore;
    FieldValue = admin.firestore.FieldValue;
    auth = admin.auth();
  } catch (error) {
    console.error('❌ Failed to access Firebase Admin services:', error);
  }
}

// Initialize admin function for API routes
export function initAdmin() {
  if (isBuildTime) {
    // Skip during build
    return;
  }
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
}

export { admin, firestore, db, FieldValue, auth };
export { auth as adminAuth, firestore as adminFirestore };