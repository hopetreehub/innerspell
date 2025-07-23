// Development-only Firebase client configuration
// This provides a mock auth instance for development when Firebase is not available

import type { Auth, User } from 'firebase/auth';

// Mock user for development
const mockUser: Partial<User> = {
  uid: 'dev-user-123',
  email: 'dev@innerspell.com',
  displayName: 'Development User',
  photoURL: null,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  } as any,
};

// Mock auth for development
export const mockAuth: Partial<Auth> = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Simulate auth state change after a short delay
    setTimeout(() => {
      callback(null); // No user logged in
    }, 100);
    
    // Return unsubscribe function
    return () => {};
  },
} as any;

export const isDevelopment = process.env.NODE_ENV === 'development';