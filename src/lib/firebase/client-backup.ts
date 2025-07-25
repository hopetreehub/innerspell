import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";
// 🚫 Mock Auth import removed - always use real Firebase

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
  // 🔥 FORCE REAL FIREBASE: Always use real Firebase regardless of environment
  const forceRealFirebase = true; // Override for production readiness
  
  // In development mode with mock auth enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true' && !forceRealFirebase) {
    console.log("Using mock Firebase Auth for development");
    // Use mock auth as a proxy
    auth = mockAuthModule.mockAuth as any;
    app = {} as FirebaseApp; // Mock app object
    // Mock Firestore - in-memory store with blog data
    const mockBlogPosts = new Map();
    
    db = {
      collection: (path: string) => {
        if (path === 'blog_posts') {
          return {
            doc: (id?: string) => {
              const docId = id || `mock-post-${Date.now()}`;
              return {
                id: docId,
                get: () => Promise.resolve({
                  exists: () => mockBlogPosts.has(docId),
                  data: () => mockBlogPosts.get(docId) || null,
                  id: docId
                }),
                set: (data: any) => {
                  mockBlogPosts.set(docId, { ...data, id: docId });
                  console.log('🔥 Mock Firestore: Post saved to collection:', docId, data);
                  return Promise.resolve();
                },
                update: (data: any) => {
                  const existing = mockBlogPosts.get(docId) || {};
                  mockBlogPosts.set(docId, { ...existing, ...data });
                  console.log('🔥 Mock Firestore: Post updated in collection:', docId, data);
                  return Promise.resolve();
                },
                delete: () => {
                  mockBlogPosts.delete(docId);
                  console.log('🔥 Mock Firestore: Post deleted from collection:', docId);
                  return Promise.resolve();
                }
              };
            },
            getDocs: () => {
              const docs = Array.from(mockBlogPosts.values()).map(data => ({
                exists: () => true,
                data: () => data,
                id: data.id
              }));
              console.log('🔥 Mock Firestore: Retrieved posts from collection:', docs.length);
              return Promise.resolve({ docs });
            },
            add: (data: any) => {
              const docId = `mock-post-${Date.now()}`;
              const docData = { ...data, id: docId };
              mockBlogPosts.set(docId, docData);
              console.log('🔥 Mock Firestore: Post added to collection:', docId, data);
              return Promise.resolve({ id: docId });
            }
          };
        }
        // Default collection
        return {
          doc: () => ({ 
            get: () => Promise.resolve({ exists: () => false, data: () => null }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            delete: () => Promise.resolve()
          }),
          getDocs: () => Promise.resolve({ docs: [] })
        };
      }
    } as any;
    
    // Mock Storage - in-memory store with images
    const mockImages = new Map();
    storage = {
      ref: (path?: string) => {
        const refPath = path || `images/${Date.now()}`;
        return {
          put: (file: any) => {
            return new Promise((resolve) => {
              // Simulate file upload
              const mockUrl = `https://mock-storage.com/${refPath}`;
              mockImages.set(refPath, { file, url: mockUrl });
              console.log('🔥 Mock Storage: File uploaded to:', refPath);
              
              setTimeout(() => {
                resolve({
                  ref: {
                    getDownloadURL: () => Promise.resolve(mockUrl)
                  },
                  metadata: {
                    name: file.name || 'mock-file.jpg',
                    size: file.size || 1024,
                    contentType: file.type || 'image/jpeg'
                  }
                });
              }, 100); // Simulate upload delay
            });
          },
          putString: (data: string, format?: string) => {
            return new Promise((resolve) => {
              const mockUrl = `https://mock-storage.com/${refPath}`;
              mockImages.set(refPath, { data, url: mockUrl, format });
              console.log('🔥 Mock Storage: String uploaded to:', refPath);
              
              setTimeout(() => {
                resolve({
                  ref: {
                    getDownloadURL: () => Promise.resolve(mockUrl)
                  },
                  metadata: {
                    name: 'mock-string-file',
                    size: data.length,
                    contentType: 'text/plain'
                  }
                });
              }, 100);
            });
          },
          getDownloadURL: () => {
            const stored = mockImages.get(refPath);
            return Promise.resolve(stored?.url || `https://mock-storage.com/${refPath}`);
          },
          delete: () => {
            mockImages.delete(refPath);
            console.log('🔥 Mock Storage: File deleted from:', refPath);
            return Promise.resolve();
          }
        };
      }
    } as any;
  } else {
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
}

export { app, auth, db, storage };
