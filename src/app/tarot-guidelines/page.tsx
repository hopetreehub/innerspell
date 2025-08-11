'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock } from 'lucide-react';

export default function TarotGuidelinesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 TarotGuidelines Page - Auth Check:', { loading, user: user ? `${user.email} (${user.role})` : null });
    
    if (!loading) {
      if (!user) {
        console.log('🚨 TarotGuidelines Page: No user - redirecting to sign-in');
        router.replace('/sign-in?redirect=/tarot-guidelines');
      } else if (user.role === 'admin') {
        console.log(`✅ TarotGuidelines Page: Admin user ${user.email} - redirecting to admin dashboard`);
        router.replace('/admin?tab=tarot-guidelines');
      }
      // 관리자가 아닌 경우는 리다이렉트하지 않고 접근 제한 페이지를 보여줌
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자가 없거나 관리자가 아닌 경우 접근 제한 페이지 표시
  if (!user || user.role !== 'admin') {
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <div className="inline-flex items-center justify-center bg-red-100 p-3 rounded-full mb-4">
          <Lock className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">관리자 전용 페이지</h1>
        <p className="text-gray-600 mb-6">
          타로 지침 가이드는 관리자만 접근할 수 있습니다.
          <br />
          관리자 대시보드에서 확인해주세요.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin?tab=tarot-guidelines')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            관리자 대시보드로 이동
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
          >
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
    );
  }

  // 관리자인 경우 (이 부분은 실제로는 위의 useEffect에서 리다이렉트되므로 표시되지 않음)
  return null;
}