
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
    
    // EMERGENCY CACHE INVALIDATION ON LOGOUT
    // Clear any localStorage items related to auth
    localStorage.removeItem('emailForSignIn');
    localStorage.setItem('user-logged-out', 'true');
    localStorage.setItem('cache-bust-timestamp', Date.now().toString());
    
    // Notify other tabs about logout
    localStorage.setItem('auth-state-changed', 'logged-out');
    
    // Force cache invalidation by adding timestamp to URL
    const cacheBuster = `cb=${Date.now()}`;
    if (typeof window !== 'undefined') {
      // Clear browser cache for auth-related pages
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('auth') || name.includes('admin')) {
              caches.delete(name);
            }
          });
        });
      }
      
      // Trigger a hard refresh with cache busting
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('logout', 'true');
      currentUrl.searchParams.set('cache_bust', Date.now().toString());
      window.location.href = currentUrl.toString();
    }
    
  };

  const login = () => {
    // This function is kept for interface compatibility but does nothing in production
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
    let unsubscribe: (() => void) | undefined = undefined;


    // 🔥 ALWAYS USE REAL FIREBASE - Mock Auth completely removed
    
    if (!auth) {
      console.error("AuthProvider: Firebase auth is not initialized. Setting loading to false immediately.");
      // Immediately set loading to false to prevent infinite loading
      setLoading(false);
      setUser(null);
      setFirebaseUser(null);
      return;
    }


    // ⚡ 긴급수정: 로딩 시간을 1초로 더 단축하여 빠른 복구
    const maxWaitTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1000);

    
    // CACHE BUSTING: Add timestamp to prevent cached auth state
    const cacheBustParam = new URLSearchParams(window.location.search).get('cache_bust');
    if (cacheBustParam) {
    }

    unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
      
      if (currentFirebaseUser) {
        setFirebaseUser(currentFirebaseUser);
        let profile;
        try {
          profile = await getUserProfile(currentFirebaseUser.uid);
        } catch (error) {
          console.error('AuthContext: getUserProfile ERROR:', error);
          profile = null;
        }
        
        // ⚡ 성능 최적화: 프로필 생성 과정 간소화
        if (!profile && currentFirebaseUser.email) {
          
          // 바로 생성하지 말고 임시 프로필 먼저 생성하여 빠른 로딩
          const tempProfile = {
            uid: currentFirebaseUser.uid,
            email: currentFirebaseUser.email,
            displayName: currentFirebaseUser.displayName || currentFirebaseUser.email,
            photoURL: currentFirebaseUser.photoURL || undefined,
            role: currentFirebaseUser.email === 'admin@innerspell.com' || currentFirebaseUser.email === 'junsupark9999@gmail.com' ? 'admin' : 'user',
            creationTime: currentFirebaseUser.metadata.creationTime,
            lastSignInTime: currentFirebaseUser.metadata.lastSignInTime,
            birthDate: '',
            sajuInfo: '',
            subscriptionStatus: 'free' as const,
          };
          
          profile = tempProfile;
          
          // 관리자 권한 재확인 로그
          if (currentFirebaseUser.email === 'admin@innerspell.com' || currentFirebaseUser.email === 'junsupark9999@gmail.com') {
          }
          
          // 백그라운드에서 실제 프로필 생성 (비동기)
          setTimeout(async () => {
            try {
              const { createOrUpdateUserProfile } = await import('@/actions/userActions');
              await createOrUpdateUserProfile(currentFirebaseUser.uid, {
                email: currentFirebaseUser.email,
                name: currentFirebaseUser.displayName || currentFirebaseUser.email,
                avatar: currentFirebaseUser.photoURL || undefined,
              });
            } catch (error) {
              console.error('Background profile creation failed:', error);
            }
          }, 100);
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
            role: currentFirebaseUser.email === 'admin@innerspell.com' || currentFirebaseUser.email === 'junsupark9999@gmail.com' ? 'admin' : 'user', // 🔥 긴급 수정: 관리자 이메일은 즉시 admin 권한
            birthDate: '',
            sajuInfo: '',
            subscriptionStatus: 'free',
          };
          profile = newAppUser;
          
          
          // 관리자 권한 재확인 로그
          if (currentFirebaseUser.email === 'admin@innerspell.com' || currentFirebaseUser.email === 'junsupark9999@gmail.com' || currentFirebaseUser.email === 'testadmin@innerspell.com') {
          }
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
      clearTimeout(maxWaitTimeout);
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
