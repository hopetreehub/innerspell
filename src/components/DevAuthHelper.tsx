'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function DevAuthHelper() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;
    
    // Auto-login if not logged in
    if (!loading && !user) {
      console.log('[DEV] Auto-logging in with mock user...');
      
      // Create a mock Firebase user
      const mockFirebaseUser = {
        uid: 'mock-test-user-id',
        email: 'admin@innerspell.com',
        displayName: 'Admin User',
        photoURL: null,
        emailVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        // Mock required Firebase User methods
        getIdToken: async () => 'mock-token',
        reload: async () => {},
        delete: async () => {},
        // Add other required properties
        isAnonymous: false,
        phoneNumber: null,
        providerId: 'mock',
        refreshToken: 'mock-refresh-token',
        tenantId: null,
        providerData: [],
        getIdTokenResult: async () => ({
          token: 'mock-token',
          expirationTime: new Date(Date.now() + 3600000).toISOString(),
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          signInProvider: 'mock',
          signInSecondFactor: null,
          claims: {}
        }),
        toJSON: () => ({})
      };
      
      // Trigger auth state change by setting to window
      if (typeof window !== 'undefined') {
        (window as any).__mockFirebaseUser = mockFirebaseUser;
        
        // Force refresh
        window.location.reload();
      }
    }
  }, [user, loading]);
  
  return null;
}