import { firestore, db, FieldValue, auth, admin } from './admin';

/**
 * Type-safe Firebase Admin SDK helpers with null checks
 * These helpers ensure Firebase services are initialized before use
 */

export class FirebaseNotInitializedError extends Error {
  constructor(service: string) {
    super(`Firebase Admin ${service} is not initialized. Check your environment variables and initialization.`);
    this.name = 'FirebaseNotInitializedError';
  }
}

/**
 * Get Firestore instance with null check
 * @throws {FirebaseNotInitializedError} if Firestore is not initialized
 */
export function getFirestore() {
  if (!firestore) {
    throw new FirebaseNotInitializedError('Firestore');
  }
  return firestore;
}

/**
 * Get Auth instance with null check
 * @throws {FirebaseNotInitializedError} if Auth is not initialized
 */
export function getAuth() {
  if (!auth) {
    throw new FirebaseNotInitializedError('Auth');
  }
  return auth;
}

/**
 * Get FieldValue with null check
 * @throws {FirebaseNotInitializedError} if FieldValue is not available
 */
export function getFieldValue() {
  if (!FieldValue) {
    throw new FirebaseNotInitializedError('FieldValue');
  }
  return FieldValue;
}

/**
 * Check if Firebase Admin is initialized
 */
export function isFirebaseInitialized() {
  return firestore !== null && auth !== null && FieldValue !== null;
}

/**
 * Safe wrapper for Firestore operations
 * Returns a result object instead of throwing
 */
export async function safeFirestoreOperation<T>(
  operation: (firestore: admin.firestore.Firestore) => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const fs = getFirestore();
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
 * Get a Firestore collection reference with null check
 */
export function getCollection(collectionPath: string) {
  const fs = getFirestore();
  return fs.collection(collectionPath);
}

/**
 * Get a Firestore document reference with null check
 */
export function getDoc(collectionPath: string, docId: string) {
  const fs = getFirestore();
  return fs.collection(collectionPath).doc(docId);
}

// Re-export types for convenience
export type { admin };
export { Firestore } from 'firebase-admin/firestore';