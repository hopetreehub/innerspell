
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

  // In development, skip auth loading if it takes too long
  const [forceSkipAuth, setForceSkipAuth] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timeout = setTimeout(() => {
        setForceSkipAuth(true);
      }, 3000); // Wait 3 seconds in dev mode
      return () => clearTimeout(timeout);
    }
  }, []);

  // Prevent hydration mismatch by always rendering the same structure
  return (
    <div suppressHydrationWarning>
      {!isMounted ? (
        <MainContent>{children}</MainContent>
      ) : authLoading && !forceSkipAuth ? (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Spinner size="large" />
        </div>
      ) : (
        <MainContent>{children}</MainContent>
      )}
    </div>
  );
}
