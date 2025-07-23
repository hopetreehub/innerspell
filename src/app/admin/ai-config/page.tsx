'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function AiConfigRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This page's functionality is merged into the main admin dashboard.
    // Redirect users to the correct page.
    router.replace('/admin');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">Redirecting to the admin dashboard...</p>
        <Spinner size="large" />
      </div>
    </div>
  );
}
