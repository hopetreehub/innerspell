'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { initKakaoSDK, loginWithKakao } from '@/lib/firebase/auth-providers';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface KakaoLoginButtonProps {
  disabled?: boolean;
  className?: string;
}

export function KakaoLoginButton({ disabled = false, className = '' }: KakaoLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleKakaoLogin = () => {
    try {
      setLoading(true);

      // 카카오 SDK 초기화
      initKakaoSDK();

      // 카카오 로그인 실행 (리다이렉트 방식)
      // 로그인 성공 시 /auth/kakao/callback 으로 리다이렉트됨
      loginWithKakao();
      
    } catch (error: any) {
      console.error('Kakao login error:', error);
      setLoading(false);
      toast({
        title: "❌ 카카오 로그인 실패",
        description: error.message || "카카오 로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      className={`w-full bg-[#FEE500] hover:bg-[#FFEB00] text-black border-[#FEE500] hover:border-[#FFEB00] font-medium ${className}`}
      onClick={handleKakaoLogin}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <KakaoIcon className="mr-2 h-5 w-5" />
      )}
      {loading ? '카카오 로그인 중...' : '카카오로 로그인'}
    </Button>
  );
}

// 카카오톡 로고 SVG 컴포넌트 (공식 브랜드 가이드라인 준수)
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C7.03 3 3 6.58 3 10.95c0 2.76 1.8 5.19 4.52 6.58l-1.05 3.88c-.06.22.16.4.36.29L11.35 18.5c.21.02.43.02.65.02 4.97 0 9-3.58 9-7.95S16.97 3 12 3z"/>
    </svg>
  );
}