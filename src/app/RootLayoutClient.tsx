
'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import type React from 'react';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/AuthContext';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/finish-sign-in';

    if (isAuthPage) {
        return <AuthLayout>{children}</AuthLayout>;
    }

    return <AppLayout>{children}</AppLayout>;
}

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // Enable automatic token refresh
  useTokenRefresh();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🔧 긴급 수정: 타임아웃 활성화하여 로딩 문제 해결
  const [forceSkipAuth, setForceSkipAuth] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('⚡ RootLayoutClient: Auth loading timeout - forcing skip auth check');
      setForceSkipAuth(true);
    }, 2000); // 2초 후 강제 스킵
    return () => clearTimeout(timeout);
  }, []);
  
  // Remove console log during build to prevent timeout
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 RootLayoutClient state:', { authLoading, isMounted });
  }

  // Prevent hydration mismatch by always rendering the same structure
  return (
    <div suppressHydrationWarning>
      {!isMounted || (authLoading && !forceSkipAuth) ? (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Spinner size="large" />
        </div>
      ) : (
        <MainContent>{children}</MainContent>
      )}
    </div>
  );
}
