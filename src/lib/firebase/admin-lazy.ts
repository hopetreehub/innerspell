import admin from 'firebase-admin';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;
  
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    if (!admin.apps.length) {
      try {
        let credential;
        
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            credential = admin.credential.cert(serviceAccount);
          } catch (parseError) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
            throw parseError;
          }
        } else {
          credential = admin.credential.applicationDefault();
        }
        
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
          throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set');
        }
        
        const cleanProjectId = projectId
          .trim()
          .replace(/\n/g, '')
          .replace(/"/g, '');
        
        admin.initializeApp({
          credential: credential,
          projectId: cleanProjectId,
        });
        
        isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw error;
      }
    } else {
      isInitialized = true;
    }
  })();

  await initPromise;
}

// Lazy getters for Firebase services
export async function getFirestore() {
  await ensureInitialized();
  return admin.firestore();
}

export async function getAuth() {
  await ensureInitialized();
  return admin.auth();
}

export async function getFieldValue() {
  await ensureInitialized();
  return admin.firestore.FieldValue;
}

// For backward compatibility
export { admin };

// Legacy exports (will throw if used before initialization)
export const firestore = null as any;
export const db = null as any;
export const FieldValue = null as any;
export const auth = null as any;
export const adminAuth = null as any;
export const adminFirestore = null as any;

export async function initAdmin() {
  await ensureInitialized();
}