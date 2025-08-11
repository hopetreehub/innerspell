import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim().replace(/\n/g, '').replace(/"/g, ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim().replace(/\n/g, '').replace(/"/g, ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim().replace(/\n/g, '').replace(/"/g, ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim().replace(/\n/g, '').replace(/"/g, ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim().replace(/\n/g, '').replace(/"/g, ''),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim().replace(/\n/g, '').replace(/"/g, '')
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
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
  
  // Check for lingering special characters
  if (firebaseConfig.projectId && (firebaseConfig.projectId.includes('\n') || firebaseConfig.projectId.includes('"'))) {
    console.error('❌ Firebase projectId still contains special characters:', firebaseConfig.projectId);
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Firebase configuration missing required fields');
    console.warn('⚠️ App will run without Firebase authentication');
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