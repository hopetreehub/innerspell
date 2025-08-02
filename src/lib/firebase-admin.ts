import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Lazy initialization
let app: any;
let _adminDb: Firestore | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    if (!getApps().length) {
      try {
        // Skip initialization during build
        if (typeof window === 'undefined' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          console.log('⚠️  Skipping Firebase Admin initialization during build');
          return;
        }

        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        
        if (!serviceAccountKey) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
        }
        
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        
        _adminDb = getFirestore(app);
        initialized = true;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Firebase Admin initialized with service account');
        }
      } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
        throw error;
      }
    } else {
      app = getApp();
      _adminDb = getFirestore(app);
      initialized = true;
    }
  })();

  await initPromise;
}

// Proxy to lazy-load adminDb
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    if (!_adminDb) {
      throw new Error('Firebase Admin not initialized. This should not be accessed during build time.');
    }
    return Reflect.get(_adminDb, prop, _adminDb);
  }
});

// Export lazy getter for adminApp
export async function getAdminApp() {
  await ensureInitialized();
  return app;
}

export { app as adminApp };