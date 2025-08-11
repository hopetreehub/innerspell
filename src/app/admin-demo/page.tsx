'use client';

import { useState } from 'react';

export default function AdminDemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데모 모드 배너 */}
      <div className="bg-yellow-500 text-white text-center py-2 px-4">
        <p className="text-sm font-medium">
          🔒 데모 모드 - 이것은 시연용 관리자 페이지입니다
        </p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              실시간 모니터링
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              사용량 통계
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">대시보드 개요</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">전체 사용자</h3>
                  <p className="text-3xl font-bold text-blue-600">1,234</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">오늘 방문자</h3>
                  <p className="text-3xl font-bold text-green-600">456</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900">총 리딩 수</h3>
                  <p className="text-3xl font-bold text-purple-600">789</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">실시간 모니터링</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-500">2분 전</p>
                  <p className="font-medium">사용자가 타로 리딩을 시작했습니다</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-500">5분 전</p>
                  <p className="font-medium">새로운 사용자가 가입했습니다</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-gray-500">10분 전</p>
                  <p className="font-medium">블로그 포스트가 조회되었습니다</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">사용량 통계</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">일일 사용량</h3>
                  <div className="bg-gray-200 rounded-full h-8 relative">
                    <div className="bg-blue-500 rounded-full h-8 w-3/4 flex items-center justify-end pr-4">
                      <span className="text-white text-sm font-medium">75%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">API 호출 횟수</h3>
                  <p className="text-2xl font-bold">12,345 / 20,000</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">저장 공간</h3>
                  <p className="text-2xl font-bold">8.5 GB / 10 GB</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}