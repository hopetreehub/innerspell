
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
    localStorage.setItem('user-logged-out', 'true');
    // Notify other tabs about logout
    localStorage.setItem('auth-state-changed', 'logged-out');
    console.log("AuthProvider: User logged out");
  };

  const login = () => {
    // This function is kept for interface compatibility but does nothing in production
    console.log("AuthProvider: login() called - redirecting to sign-in page");
  };

  // Tab synchronization for auth state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-state-changed') {
        const newState = e.newValue;
        if (newState === 'logged-out') {
          logout();
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

    // 🔥 ALWAYS USE REAL FIREBASE - Mock Auth completely removed
    
    if (!auth) {
      console.warn("AuthProvider: Firebase auth is not initialized. Skipping auth state listener.");
      setLoading(false);
      return;
    }

    // 🔧 긴급 수정: 타임아웃 제거하여 정상 인증 플로우 복구
    console.log('🔥 AuthContext: Setting up onAuthStateChanged listener');

    unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      console.log('🔥 AuthContext: onAuthStateChanged triggered with user:', currentFirebaseUser ? currentFirebaseUser.email : 'null');
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        console.log('🔥 AuthContext: Fetching user profile for UID:', currentFirebaseUser.uid);
        let profile;
        try {
          profile = await getUserProfile(currentFirebaseUser.uid);
          console.log('🔥 AuthContext: getUserProfile result:', profile);
        } catch (error) {
          console.error('🚨 AuthContext: getUserProfile error:', error);
          profile = null;
        }
        
        // If profile doesn't exist (e.g., new Google sign-in), create one with proper admin check
        if (!profile && currentFirebaseUser.email) {
          console.log('🔥 AuthContext: No profile found, creating new profile for:', currentFirebaseUser.email);
          const { createOrUpdateUserProfile } = await import('@/actions/userActions');
          await createOrUpdateUserProfile(currentFirebaseUser.uid, {
            email: currentFirebaseUser.email,
            name: currentFirebaseUser.displayName || currentFirebaseUser.email,
            avatar: currentFirebaseUser.photoURL || undefined,
          });
          
          // Re-fetch the profile after creation
          console.log('🔥 AuthContext: Re-fetching profile after creation');
          profile = await getUserProfile(currentFirebaseUser.uid);
          console.log('🔥 AuthContext: Re-fetched profile:', profile);
        }
        
        // If still no profile, create a default one 
        if (!profile) {
          // 🛡️ 보안 개선: 관리자 권한은 서버에서만 검증
          const newAppUser: AppUser = {
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email || undefined,
            displayName: currentFirebaseUser.displayName || undefined,
            photoURL: currentFirebaseUser.photoURL || undefined,
            creationTime: currentFirebaseUser.metadata.creationTime,
            lastSignInTime: currentFirebaseUser.metadata.lastSignInTime,
            role: 'user', // 기본값은 항상 user, 관리자 권한은 서버에서 설정
            birthDate: '',
            sajuInfo: '',
            subscriptionStatus: 'free',
          };
          profile = newAppUser;
          
          console.log(`🔥 AuthContext: Created fallback profile for ${currentFirebaseUser.email} with role: user`);
        }

        setUser(profile);
        console.log('🔥 AuthContext: User set to:', profile ? `${profile.email} (${profile.role})` : 'null');

      } else {
        console.log('🔥 AuthContext: No Firebase user, setting to null');
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
      console.log('🔥 AuthContext: Loading set to false');
    });

    return () => {
      isMounted = false;
      console.log('🔥 AuthContext: Cleanup - unsubscribing');
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
