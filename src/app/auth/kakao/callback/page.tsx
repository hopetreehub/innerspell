'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || '카카오 로그인이 취소되었습니다.');
        }

        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        // 서버에 인증 코드를 전송하여 Firebase 커스텀 토큰 받기
        const response = await fetch('/api/auth/kakao/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '서버에서 인증 처리 중 오류가 발생했습니다.');
        }

        const { customToken } = await response.json();

        // Firebase Auth로 커스텀 토큰 로그인
        await signInWithCustomToken(auth, customToken);

        // 사용자 정보 새로고침
        await refreshUser();

        toast({
          title: "✅ 카카오 로그인 성공",
          description: "카카오 계정으로 성공적으로 로그인되었습니다.",
        });

        // 로그인 후 홈으로 리다이렉트
        router.push('/');

      } catch (error: any) {
        console.error('Kakao callback error:', error);
        toast({
          title: "❌ 카카오 로그인 실패",
          description: error.message || "카카오 로그인 처리 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        
        // 에러 발생 시 로그인 페이지로 리다이렉트
        router.push('/sign-in');
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, toast, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {processing ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">카카오 로그인 처리 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </>
        ) : (
          <p className="text-gray-600">리다이렉트 중...</p>
        )}
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <KakaoCallbackContent />
    </Suspense>
  );
}