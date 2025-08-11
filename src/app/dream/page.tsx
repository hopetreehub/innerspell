'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DreamRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // /dream 접근 시 /dream-interpretation으로 리다이렉트
    router.replace('/dream-interpretation');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">꿈해몽 페이지로 이동 중입니다...</p>
      </div>
    </div>
  );
}