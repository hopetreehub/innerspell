import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim().replace(/\n/g, ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim().replace(/\n/g, ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim().replace(/\n/g, ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim().replace(/\n/g, ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim().replace(/\n/g, ''),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim().replace(/\n/g, '')
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// 🔥 ALWAYS USE REAL FIREBASE - NO MORE MOCK MODE
if (typeof window !== 'undefined') {
  console.log('🔥 Initializing REAL Firebase only');
  
  // Firebase config validation
  console.log("Firebase config validation:", {
    hasApiKey: !!firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Firebase configuration missing required fields');
  } else {
    try {
      // Initialize Firebase app
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      // Initialize services
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      console.log('✅ Real Firebase initialized successfully');
      console.log('✅ Auth, Firestore, and Storage ready');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
    }
  }
}

export { app, auth, db, storage };