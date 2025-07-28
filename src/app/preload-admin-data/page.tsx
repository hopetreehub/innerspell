'use client';

import { useEffect, useState } from 'react';
import { getAllAIProviderConfigs } from '@/actions/aiProviderActions';
import { getAllTarotGuidelines } from '@/actions/tarotGuidelineActions';
import { clearAllCache } from '@/lib/cache';

export default function PreloadAdminDataPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string[]>([]);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const preloadData = async () => {
    setLoading(true);
    addStatus('데이터 사전 로딩 시작...');

    try {
      // 기존 캐시 클리어
      addStatus('기존 캐시 클리어 중...');
      await clearAllCache();

      // AI 공급자 데이터 로드
      addStatus('AI 공급자 데이터 로딩 중...');
      const aiResult = await getAllAIProviderConfigs(true); // 강제 새로고침
      
      if (aiResult.success) {
        addStatus(`✅ AI 공급자 ${aiResult.data?.length || 0}개 로드 완료`);
      } else {
        addStatus(`❌ AI 공급자 로드 실패: ${aiResult.message}`);
      }

      // 타로 지침 데이터 로드
      addStatus('타로 지침 데이터 로딩 중...');
      const tarotResult = await getAllTarotGuidelines(true); // 강제 새로고침
      
      if (tarotResult.success) {
        const guidelines = tarotResult.data?.guidelines?.length || 0;
        const spreads = tarotResult.data?.spreads?.length || 0;
        const styles = tarotResult.data?.styles?.length || 0;
        addStatus(`✅ 타로 지침 ${guidelines}개, 스프레드 ${spreads}개, 스타일 ${styles}개 로드 완료`);
      } else {
        addStatus(`❌ 타로 지침 로드 실패: ${tarotResult.message}`);
      }

      addStatus('🎉 모든 데이터 사전 로딩 완료! 관리자 페이지가 더 빠르게 로드될 것입니다.');
      
      // 3초 후 관리자 페이지로 리디렉션
      setTimeout(() => {
        window.location.href = '/admin';
      }, 3000);

    } catch (error) {
      addStatus(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    preloadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            관리자 데이터 최적화
          </h1>
          <p className="text-gray-600">
            더 빠른 관리자 페이지 경험을 위해 데이터를 사전 로딩하고 있습니다.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">로딩 상태</h3>
          <div className="space-y-2">
            {status.map((msg, index) => (
              <div 
                key={index} 
                className={`text-sm p-2 rounded ${
                  msg.includes('✅') ? 'bg-green-100 text-green-800' :
                  msg.includes('❌') ? 'bg-red-100 text-red-800' :
                  msg.includes('🎉') ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>

        {!loading && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              관리자 페이지로 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}