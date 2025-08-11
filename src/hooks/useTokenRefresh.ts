'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes (tokens expire after 1 hour)
const TOKEN_EXPIRY_WARNING = 5 * 60 * 1000; // 5 minutes before expiry

export function useTokenRefresh() {
  const { firebaseUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!firebaseUser || !auth || process.env.NODE_ENV === 'development') {
      return;
    }

    const refreshToken = async () => {
      try {
        const token = await firebaseUser.getIdToken(true);
        console.log('Token refreshed successfully');
        
        // Update user context with refreshed data
        refreshUser();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        toast({
          variant: 'destructive',
          title: '인증 갱신 실패',
          description: '다시 로그인해주세요.',
        });
      }
    };

    const setupTokenRefresh = async () => {
      // Get initial token to check expiry
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const now = Date.now();
        const timeUntilExpiry = expirationTime - now;

        // Clear existing timers
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }

        // Set up warning before token expiry
        if (timeUntilExpiry > TOKEN_EXPIRY_WARNING) {
          warningTimeoutRef.current = setTimeout(() => {
            toast({
              title: '세션 만료 예정',
              description: '5분 후 세션이 만료됩니다. 계속 사용하시려면 활동을 유지해주세요.',
            });
          }, timeUntilExpiry - TOKEN_EXPIRY_WARNING);
        }

        // Set up periodic token refresh
        refreshIntervalRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);

        // If token is about to expire soon, refresh immediately
        if (timeUntilExpiry < TOKEN_REFRESH_INTERVAL) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Failed to setup token refresh:', error);
      }
    };

    setupTokenRefresh();

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [firebaseUser, refreshUser, toast]);

  // Handle visibility change to refresh token when returning to app
  useEffect(() => {
    if (!firebaseUser || !auth || process.env.NODE_ENV === 'development') {
      return;
    }

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        try {
          // Check token validity when user returns to the app
          const tokenResult = await firebaseUser.getIdTokenResult();
          const expirationTime = new Date(tokenResult.expirationTime).getTime();
          const now = Date.now();

          // Refresh if token has less than 10 minutes remaining
          if (expirationTime - now < 10 * 60 * 1000) {
            await firebaseUser.getIdToken(true);
            refreshUser();
          }
        } catch (error) {
          console.error('Failed to check token on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [firebaseUser, refreshUser]);
}