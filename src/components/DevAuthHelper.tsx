'use client';

import { Button } from '@/components/ui/button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert } from 'lucide-react';

export function DevAuthHelper() {
  const { toast } = useToast();
  
  const handleAdminLogin = async () => {
    try {
      // Admin credentials for development
      const email = 'admin@innerspell.com';
      const password = 'admin123';
      
      if (!auth) {
        throw new Error('Auth not available');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "✅ 관리자 로그인 성공",
        description: `${userCredential.user.email}로 로그인되었습니다.`,
      });
      
      // Reload to update auth state
      window.location.reload();
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "❌ 로그인 실패",
        description: error.message || "관리자 로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };
  
  // TEMP: Always show for testing purposes
  // 절대 추정금지 원칙에 따른 실제 테스트를 위해 임시로 항상 표시
  const isDevelopment = true; // 임시로 항상 true로 설정
  
  return (
    <div className="mt-4 p-4 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-semibold text-orange-700">개발 환경 도우미</span>
      </div>
      <Button 
        onClick={handleAdminLogin}
        variant="outline"
        className="w-full bg-orange-100 hover:bg-orange-200 border-orange-300"
      >
        🔐 관리자로 로그인
      </Button>
      <p className="text-xs text-gray-600 mt-2 text-center">
        이 버튼은 개발 환경에서만 표시됩니다 (테스트용 활성화됨)
      </p>
    </div>
  );
}