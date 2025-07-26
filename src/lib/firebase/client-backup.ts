import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
// Always use real Firebase

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

// Check if running on the client side before proceeding
if (typeof window !== 'undefined') {
  // Always use real Firebase
  {
    // Check if all required config values are present and valid strings
    const isConfigValid = 
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId;

    if (isConfigValid) {
      try {
        // Debug: Log cleaned config values (without sensitive API key)
        console.log("Firebase config validation:", {
          hasApiKey: !!firebaseConfig.apiKey,
          authDomain: firebaseConfig.authDomain,
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket
        });
        
        // Initialize Firebase
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
      } catch (error) {
        console.error("Firebase initialization error:", error);
        // If initialization fails for any reason, ensure app, auth, db and storage are null
        app = null;
        auth = null;
        db = null;
        storage = null;
        
        // In development, provide a better error message
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            "Firebase failed to initialize in development mode. " +
            "The app will continue to work but without authentication features. " +
            "This is normal if you're working without Firebase credentials."
          );
        }
      }
  } else {
    // This warning is crucial for developers to identify configuration issues.
    console.warn(
      "Firebase configuration is missing or incomplete. " +
      "Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set correctly. " +
      "Authentication features will be disabled."
    );
  }
}

export { app, auth, db, storage };
