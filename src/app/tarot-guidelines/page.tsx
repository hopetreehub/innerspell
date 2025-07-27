'use client';

import { useState, useMemo, useEffect } from 'react';
import { TarotGuideline } from '@/types/tarot-guidelines';

interface TarotSpread {
  id: string;
  name: string;
}

interface Style {
  id: string;
  name: string;
}

export default function TarotGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<TarotGuideline[]>([]);
  const [spreads, setSpreads] = useState<TarotSpread[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSpread, setSelectedSpread] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await fetch('/api/tarot-guidelines');
        if (!response.ok) {
          throw new Error('Failed to fetch guidelines');
        }
        const data = await response.json();
        
        console.log('Fetched guidelines:', data.total); // 디버깅
        
        setGuidelines(data.guidelines || []);
        setSpreads(data.spreads || []);
        setStyles(data.styles || []);
      } catch (err) {
        console.error('Error fetching guidelines:', err);
        setError('타로 지침을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, []);

  const filteredGuidelines = useMemo(() => {
    return guidelines.filter(guideline => {
      const matchesSpread = !selectedSpread || guideline.spreadId === selectedSpread;
      const matchesStyle = !selectedStyle || guideline.styleId === selectedStyle;
      const matchesSearch = !searchTerm || 
        guideline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guideline.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSpread && matchesStyle && matchesSearch;
    });
  }, [guidelines, selectedSpread, selectedStyle, searchTerm]);

  const getSpreadName = (spreadId: string) => {
    return spreads.find(s => s.id === spreadId)?.name || spreadId;
  };

  const getStyleName = (styleId: string) => {
    return styles.find(s => s.id === styleId)?.name || styleId;
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">타로 지침을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            타로 지침 가이드
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            6개 스프레드 × 6개 해석 스타일로 구성된 {guidelines.length}개 전문 지침
          </p>
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            총 {guidelines.length}개 지침 완성 (100%)
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                placeholder="지침 이름이나 설명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Spread Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스프레드 필터
              </label>
              <select
                value={selectedSpread}
                onChange={(e) => setSelectedSpread(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">모든 스프레드</option>
                {spreads.map(spread => (
                  <option key={spread.id} value={spread.id}>
                    {spread.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                해석 스타일 필터
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">모든 스타일</option>
                {styles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredGuidelines.length}개 지침이 검색되었습니다
          </div>
        </div>

        {/* Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuidelines.map((guideline) => (
            <GuidelineCard 
              key={guideline.id} 
              guideline={guideline}
              spreadName={getSpreadName(guideline.spreadId)}
              styleName={getStyleName(guideline.styleId)}
            />
          ))}
        </div>

        {filteredGuidelines.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-gray-600 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 사용해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuidelineCard({ 
  guideline, 
  spreadName, 
  styleName 
}: { 
  guideline: TarotGuideline;
  spreadName: string;
  styleName: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {guideline.name}
            </h3>
            <div className="text-sm text-gray-600 mb-2">
              {spreadName} × {styleName}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guideline.difficulty)}`}>
              {getDifficultyText(guideline.difficulty)}
            </span>
            <span className="text-xs text-gray-500">
              {guideline.estimatedTime}분
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">
          {guideline.description}
        </p>

        {/* Quick Info */}
        <div className="border-t pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">핵심 영역:</span>
              <div className="text-gray-600 mt-1">
                {guideline.keyFocusAreas.slice(0, 2).map((area, index) => (
                  <div key={index} className="text-xs">• {area}</div>
                ))}
                {guideline.keyFocusAreas.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{guideline.keyFocusAreas.length - 2}개 더
                  </div>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">포지션:</span>
              <div className="text-gray-600 mt-1 text-xs">
                {guideline.positionGuidelines.length}개 포지션
              </div>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          {isExpanded ? '간단히 보기' : '자세히 보기'}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* General Approach */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">전반적 접근법</h4>
              <p className="text-sm text-gray-600">{guideline.generalApproach}</p>
            </div>

            {/* Position Guidelines */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">포지션별 가이드</h4>
              <div className="space-y-2">
                {guideline.positionGuidelines.slice(0, 3).map((position, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="font-medium text-sm text-gray-800">
                      {position.positionName}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {position.interpretationFocus}
                    </div>
                  </div>
                ))}
                {guideline.positionGuidelines.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{guideline.positionGuidelines.length - 3}개 포지션 더
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h4 className="font-medium text-gray-800 mb-2">해석 팁</h4>
              <div className="space-y-1">
                {guideline.interpretationTips.slice(0, 3).map((tip, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}