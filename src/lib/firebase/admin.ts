// Import everything from the lazy admin module
import { 
  getFirestore, 
  getAuth, 
  getFieldValue,
  admin,
  initAdmin
} from './admin-lazy';

// Legacy synchronous exports that require initialization
let _firestore: any = null;
let _auth: any = null;
let _FieldValue: any = null;

// Initialize on first use
async function ensureLegacyInit() {
  if (!_firestore) {
    await initAdmin();
    _firestore = await getFirestore();
    _auth = await getAuth();
    _FieldValue = await getFieldValue();
  }
}

// Create proxy objects that initialize on first access
export const firestore = new Proxy({}, {
  get(target, prop) {
    if (!_firestore) {
      throw new Error('Firebase Admin Firestore is not initialized. Use getFirestore() instead.');
    }
    return _firestore[prop];
  }
});

export const auth = new Proxy({}, {
  get(target, prop) {
    if (!_auth) {
      throw new Error('Firebase Admin Auth is not initialized. Use getAuth() instead.');
    }
    return _auth[prop];
  }
});

export const FieldValue = new Proxy({}, {
  get(target, prop) {
    if (!_FieldValue) {
      throw new Error('Firebase Admin FieldValue is not initialized. Use getFieldValue() instead.');
    }
    return _FieldValue[prop];
  }
});

// Aliases
export const db = firestore;
export const adminAuth = auth;
export const adminFirestore = firestore;

// Re-export async functions
export { getFirestore, getAuth, getFieldValue, admin, initAdmin };

// Export everything else from admin-lazy
export * from './admin-lazy';