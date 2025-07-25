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
  
  // Only show in development mode
  // Note: In production builds, this component won't be included at all
  // For now, always show in local development
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isDevelopment) {
    return null;
  }
  
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
        이 버튼은 개발 환경에서만 표시됩니다
      </p>
    </div>
  );
}