
'use client'; 

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('=== DETAILED ERROR INFO ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error cause:', error.cause);
    console.error('Full error object:', error);
    console.error('=== END ERROR INFO ===');
    
    // MIME type 오류 감지 (Vercel Private 프로젝트 문제)
    if (error.message?.includes('MIME type') || 
        error.message?.includes('text/html') ||
        error.message?.includes('Refused to execute script')) {
      console.warn('⚠️ MIME type error detected - possibly due to Vercel private project redirect');
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <AlertCircle className="w-24 h-24 text-destructive mb-8" />
      <h1 className="text-4xl font-bold text-primary mb-4 font-headline">이런! 오류가 발생했습니다</h1>
      <p className="text-lg text-foreground/80 mb-6 max-w-md">
        {error.message?.includes('MIME type') || error.message?.includes('Refused to execute script')
          ? '페이지 접근 권한이 필요합니다. 로그인이 필요할 수 있습니다.'
          : '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
      </p>
      <div className="text-sm text-muted-foreground mb-8 max-w-lg">
        <p className="mb-2">오류 코드: {error.digest || '알 수 없음'}</p>
        <details className="bg-muted p-3 rounded-md text-xs">
          <summary className="cursor-pointer font-medium mb-2">에러 상세정보</summary>
          <pre className="whitespace-pre-wrap overflow-auto">
            메시지: {error.message}
            {'\n\n'}
            스택: {error.stack}
          </pre>
        </details>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          size="lg"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          다시 시도
        </Button>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
