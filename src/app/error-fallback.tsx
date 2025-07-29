'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 추적 서비스로 전송)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-2xl font-bold text-primary mb-4">
          문제가 발생했습니다
        </h1>
        <p className="text-muted-foreground mb-8">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="w-full"
          >
            다시 시도
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}