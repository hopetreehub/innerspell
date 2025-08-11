import { 
  getFirestore as getFirestoreLazy, 
  getAuth as getAuthLazy, 
  getFieldValue as getFieldValueLazy,
  admin 
} from './admin-lazy';

/**
 * Type-safe Firebase Admin SDK helpers with proper async initialization
 */

export class FirebaseNotInitializedError extends Error {
  constructor(service: string) {
    super(`Firebase Admin ${service} is not initialized. Check your environment variables and initialization.`);
    this.name = 'FirebaseNotInitializedError';
  }
}

/**
 * Get Firestore instance with initialization
 * @returns Promise<Firestore> instance
 */
export async function getFirestore() {
  try {
    return await getFirestoreLazy();
  } catch (error) {
    throw new FirebaseNotInitializedError('Firestore');
  }
}

/**
 * Get Auth instance with initialization
 * @returns Promise<Auth> instance
 */
export async function getAuth() {
  try {
    return await getAuthLazy();
  } catch (error) {
    throw new FirebaseNotInitializedError('Auth');
  }
}

/**
 * Get FieldValue with initialization
 * @returns Promise<FieldValue> instance
 */
export async function getFieldValue() {
  try {
    return await getFieldValueLazy();
  } catch (error) {
    throw new FirebaseNotInitializedError('FieldValue');
  }
}

/**
 * Check if Firebase Admin is initialized
 * This is now always async due to lazy initialization
 */
export async function isFirebaseInitialized() {
  try {
    await getFirestoreLazy();
    await getAuthLazy();
    await getFieldValueLazy();
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe wrapper for Firestore operations
 * Returns a result object instead of throwing
 */
export async function safeFirestoreOperation<T>(
  operation: (firestore: admin.firestore.Firestore) => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const fs = await getFirestore();
    const data = await operation(fs);
    return { success: true, data };
  } catch (error) {
    if (error instanceof FirebaseNotInitializedError) {
      console.error('Firebase not initialized:', error);
      return { success: false, error: 'Database service is currently unavailable. Please try again later.' };
    }
    console.error('Firestore operation error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

/**
 * Get a Firestore collection reference with initialization
 */
export async function getCollection(collectionPath: string) {
  const fs = await getFirestore();
  return fs.collection(collectionPath);
}

/**
 * Get a Firestore document reference with initialization
 */
export async function getDoc(collectionPath: string, docId: string) {
  const fs = await getFirestore();
  return fs.collection(collectionPath).doc(docId);
}

// Re-export types for convenience
export type { admin };
export { FirebaseFirestore } from 'firebase-admin/firestore';

// Legacy synchronous exports - these will throw errors if used directly
// They're kept for backward compatibility but should not be used
export const firestore = null as any;
export const db = null as any;
export const FieldValue = null as any;
export const auth = null as any;
export const adminAuth = null as any;
export const adminFirestore = null as any;