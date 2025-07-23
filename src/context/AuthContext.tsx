
'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { getUserProfile, type AppUser } from '@/actions/userActions';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshUser: () => void;
  logout: () => void;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const refreshUser = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const logout = () => {
    setIsLoggedOut(true);
    setUser(null);
    setFirebaseUser(null);
    // Clear any localStorage items related to auth
    localStorage.removeItem('emailForSignIn');
    localStorage.removeItem('mock-user-logged-in');
    localStorage.setItem('user-logged-out', 'true');
    // Notify other tabs about logout
    localStorage.setItem('auth-state-changed', 'logged-out');
    console.log("AuthProvider: User logged out");
  };

  const login = () => {
    setIsLoggedOut(false);
    localStorage.removeItem('user-logged-out');
    localStorage.setItem('mock-user-logged-in', 'true');
    // Notify other tabs about login
    localStorage.setItem('auth-state-changed', 'logged-in');
    console.log("AuthProvider: User logged in (dev mode)");
    // Trigger refresh to re-create mock user
    setRefreshTrigger(prev => prev + 1);
  };

  // Tab synchronization for auth state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-state-changed') {
        const newState = e.newValue;
        if (newState === 'logged-out') {
          logout();
        } else if (newState === 'logged-in') {
          refreshUser();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    // Development mode: Use mock auth from firebase client
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      // Import mockAuth dynamically
      import('@/lib/firebase/mockAuth')
        .then((mockAuthModule) => {
          if (!isMounted) return;
          
          unsubscribe = mockAuthModule.onAuthStateChanged((mockFirebaseUser: any) => {
            if (!isMounted) return;
            
            if (mockFirebaseUser) {
              setFirebaseUser(mockFirebaseUser);
              const mockUser: AppUser = {
                uid: mockFirebaseUser.uid,
                email: mockFirebaseUser.email || '',
                displayName: mockFirebaseUser.displayName || '',
                photoURL: mockFirebaseUser.photoURL || '',
                creationTime: mockFirebaseUser.metadata?.creationTime || new Date().toISOString(),
                lastSignInTime: mockFirebaseUser.metadata?.lastSignInTime || new Date().toISOString(),
                role: mockFirebaseUser.email === 'admin@innerspell.com' ? 'admin' : 'user',
                birthDate: '',
                sajuInfo: '',
                subscriptionStatus: 'free',
                // Mock getIdToken 메서드 추가
                getIdToken: async () => 'mock-id-token',
              } as AppUser & { getIdToken: () => Promise<string> };
              setUser(mockUser);
              console.log("AuthProvider: Mock user authenticated:", mockUser);
            } else {
              setUser(null);
              setFirebaseUser(null);
              console.log("AuthProvider: No mock user authenticated");
            }
            setLoading(false);
          });
        })
        .catch((error) => {
          console.error("AuthProvider: Failed to import mockAuth:", error);
          if (isMounted) {
            setLoading(false);
          }
        });
      
      return () => {
        isMounted = false;
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
    
    if (!auth) {
      console.warn("AuthProvider: Firebase auth is not initialized. Skipping auth state listener.");
      setLoading(false);
      return;
    }

    unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        let profile = await getUserProfile(currentFirebaseUser.uid);
        
        // If profile doesn't exist (e.g., new Google sign-in), create a default one.
        if (!profile) {
          // Default role assignment should happen server-side
          const newAppUser: AppUser = {
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email || undefined,
            displayName: currentFirebaseUser.displayName || undefined,
            photoURL: currentFirebaseUser.photoURL || undefined,
            creationTime: currentFirebaseUser.metadata.creationTime,
            lastSignInTime: currentFirebaseUser.metadata.lastSignInTime,
            role: 'user', // Default role, server-side will determine admin status
            birthDate: '',
            sajuInfo: '',
            subscriptionStatus: 'free',
          };
          profile = newAppUser;
        }

        setUser(profile);

      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refreshTrigger, isLoggedOut]);

  const value = { user, firebaseUser, loading, refreshUser, logout, login };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
