'use client';

import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-700/20">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          {/* 오프라인 아이콘 */}
          <div className="mx-auto w-24 h-24 flex items-center justify-center bg-purple-600/10 rounded-full">
            <WifiOff className="w-12 h-12 text-purple-600" />
          </div>
          
          {/* 제목 */}
          <h1 className="text-4xl font-tarot text-purple-400">
            오프라인 상태입니다
          </h1>
          
          {/* 설명 */}
          <p className="text-gray-400 text-lg">
            인터넷 연결이 필요합니다.<br />
            연결 상태를 확인해주세요.
          </p>
          
          {/* 재시도 버튼 */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            다시 시도
          </button>
          
          {/* 캐시된 페이지로 이동 */}
          <div className="pt-8 border-t border-purple-800/30">
            <p className="text-sm text-gray-500 mb-4">
              캐시된 페이지를 확인할 수 있습니다:
            </p>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-purple-400 hover:text-purple-300 transition-colors"
              >
                홈으로 가기
              </Link>
              <Link
                href="/tarot"
                className="block text-purple-400 hover:text-purple-300 transition-colors"
              >
                타로카드 백과사전
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}