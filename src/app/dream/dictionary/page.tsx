'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Moon, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface DreamSymbol {
  id: string;
  symbol: string;
  category: string;
  meanings: {
    positive: string[];
    negative: string[];
    general: string;
  };
  keywords: string[];
  relatedSymbols: string[];
}

// 꿈 사전 데이터 (실제로는 데이터베이스나 별도 파일에서 가져올 수 있음)
const dreamSymbols: DreamSymbol[] = [
  {
    id: 'water',
    symbol: '물',
    category: '자연',
    meanings: {
      positive: ['정화', '새로운 시작', '감정적 치유', '풍요로움'],
      negative: ['감정적 혼란', '압도감', '불안정'],
      general: '물은 무의식, 감정, 정화를 상징합니다. 꿈에서의 물의 상태와 흐름에 따라 해석이 달라집니다.'
    },
    keywords: ['무의식', '감정', '정화', '흐름', '생명력'],
    relatedSymbols: ['바다', '강', '비', '호수']
  },
  {
    id: 'fire',
    symbol: '불',
    category: '자연',
    meanings: {
      positive: ['열정', '변화', '창조적 에너지', '정화'],
      negative: ['분노', '파괴', '통제 불가능한 상황'],
      general: '불은 열정, 변화, 창조적 에너지를 상징하지만 때로는 파괴적인 힘을 나타내기도 합니다.'
    },
    keywords: ['열정', '변화', '에너지', '정화', '파괴'],
    relatedSymbols: ['태양', '번개', '촛불', '폭발']
  },
  {
    id: 'flying',
    symbol: '날기',
    category: '행동',
    meanings: {
      positive: ['자유', '해방', '목표 달성', '영적 상승'],
      negative: ['현실 도피', '불안정', '통제력 상실'],
      general: '날기는 자유에 대한 갈망, 제약으로부터의 해방, 또는 높은 관점에서 사물을 보고자 하는 욕구를 나타냅니다.'
    },
    keywords: ['자유', '해방', '상승', '관점', '꿈'],
    relatedSymbols: ['새', '날개', '하늘', '구름']
  },
  {
    id: 'house',
    symbol: '집',
    category: '장소',
    meanings: {
      positive: ['안전', '가족', '자아', '안정감'],
      negative: ['갇힘', '과거에 얽매임', '고립'],
      general: '집은 자아, 무의식, 가족 관계를 상징합니다. 집의 상태와 방의 종류에 따라 의미가 달라집니다.'
    },
    keywords: ['자아', '가족', '안전', '무의식', '과거'],
    relatedSymbols: ['방', '문', '창문', '지하실']
  },
  {
    id: 'car',
    symbol: '자동차',
    category: '교통수단',
    meanings: {
      positive: ['진전', '독립성', '목표 달성', '제어력'],
      negative: ['방향성 상실', '통제력 부족', '인생의 속도감'],
      general: '자동차는 인생의 여정, 목표를 향한 진전, 개인의 제어력을 상징합니다.'
    },
    keywords: ['여정', '진전', '제어', '독립', '방향'],
    relatedSymbols: ['길', '운전', '기차', '버스']
  },
  {
    id: 'death',
    symbol: '죽음',
    category: '생명',
    meanings: {
      positive: ['변화', '새로운 시작', '과거와의 결별', '성장'],
      negative: ['상실', '두려움', '끝남'],
      general: '죽음은 실제 죽음보다는 변화, 끝남, 새로운 시작을 상징하는 경우가 많습니다.'
    },
    keywords: ['변화', '끝남', '새시작', '변환', '해방'],
    relatedSymbols: ['장례식', '관', '무덤', '부활']
  },
  {
    id: 'money',
    symbol: '돈',
    category: '물질',
    meanings: {
      positive: ['풍요', '성취', '가치 인정', '자원'],
      negative: ['욕심', '불안', '가치관 혼란'],
      general: '돈은 개인의 가치, 자존감, 물질적 욕구와 불안을 나타냅니다.'
    },
    keywords: ['가치', '자존감', '풍요', '욕구', '불안'],
    relatedSymbols: ['금', '보석', '지갑', '은행']
  },
  {
    id: 'baby',
    symbol: '아기',
    category: '사람',
    meanings: {
      positive: ['새로운 시작', '순수함', '창조성', '잠재력'],
      negative: ['미성숙', '의존성', '책임감 부담'],
      general: '아기는 새로운 시작, 순수함, 창조적 잠재력, 또는 보살핌이 필요한 부분을 상징합니다.'
    },
    keywords: ['새시작', '순수', '창조', '잠재력', '보살핌'],
    relatedSymbols: ['임신', '출산', '어머니', '젖병']
  },
  {
    id: 'animal',
    symbol: '동물',
    category: '생물',
    meanings: {
      positive: ['본능', '자연스러움', '직관', '생명력'],
      negative: ['야성', '통제되지 않는 감정', '원시적 욕구'],
      general: '동물은 본능, 직관, 억압된 감정이나 욕구를 나타냅니다. 동물의 종류에 따라 의미가 달라집니다.'
    },
    keywords: ['본능', '직관', '감정', '야성', '자연'],
    relatedSymbols: ['개', '고양이', '늑대', '사자']
  },
  {
    id: 'school',
    symbol: '학교',
    category: '장소',
    meanings: {
      positive: ['학습', '성장', '준비', '사회적 관계'],
      negative: ['압박감', '평가 불안', '과거 트라우마'],
      general: '학교는 학습, 성장, 사회적 관계, 때로는 과거의 경험이나 현재의 평가 상황을 나타냅니다.'
    },
    keywords: ['학습', '성장', '평가', '사회', '과거'],
    relatedSymbols: ['시험', '교사', '교실', '책']
  }
];

const categories = [
  { value: 'all', label: '전체' },
  { value: '자연', label: '자연' },
  { value: '행동', label: '행동' },
  { value: '장소', label: '장소' },
  { value: '교통수단', label: '교통수단' },
  { value: '생명', label: '생명' },
  { value: '물질', label: '물질' },
  { value: '사람', label: '사람' },
  { value: '생물', label: '생물' }
];

export default function DreamDictionaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSymbol, setSelectedSymbol] = useState<DreamSymbol | null>(null);

  // 필터링된 심볼들
  const filteredSymbols = useMemo(() => {
    let symbols = dreamSymbols;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      symbols = symbols.filter(symbol => symbol.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      symbols = symbols.filter(symbol => 
        symbol.symbol.toLowerCase().includes(query) ||
        symbol.meanings.general.toLowerCase().includes(query) ||
        symbol.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    return symbols.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full mb-4">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          꿈 사전
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          꿈 속 상징들의 의미를 찾아보세요. 각 상징이 가진 깊은 메시지를 이해해보세요.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 검색 및 목록 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="꿈 상징을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 카테고리 필터 */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 심볼 목록 */}
          <Card className="max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                꿈 상징 ({filteredSymbols.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredSymbols.map((symbol) => (
                <button
                  key={symbol.id}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedSymbol?.id === symbol.id
                      ? 'bg-primary/10 border-primary/20 border'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{symbol.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {symbol.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {symbol.meanings.general}
                  </p>
                </button>
              ))}
              
              {filteredSymbols.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>검색 결과가 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 상세 정보 */}
        <div className="lg:col-span-2">
          {selectedSymbol ? (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {selectedSymbol.symbol}
                  </CardTitle>
                  <Badge>{selectedSymbol.category}</Badge>
                </div>
                <CardDescription className="text-base">
                  {selectedSymbol.meanings.general}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 긍정적 의미 */}
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    긍정적 의미
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymbol.meanings.positive.map((meaning, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {meaning}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 부정적 의미 */}
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    부정적 의미
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymbol.meanings.negative.map((meaning, index) => (
                      <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        {meaning}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 키워드 */}
                <div>
                  <h3 className="font-semibold text-primary mb-2">관련 키워드</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymbol.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 관련 상징 */}
                <div>
                  <h3 className="font-semibold text-primary mb-2">관련 상징</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymbol.relatedSymbols.map((relatedSymbol, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const symbol = dreamSymbols.find(s => s.symbol === relatedSymbol);
                          if (symbol) setSelectedSymbol(symbol);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        {relatedSymbol}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* AI 해석 링크 */}
                <div className="pt-4 border-t">
                  <Link href="/dream-interpretation">
                    <Button className="w-full">
                      <Moon className="mr-2 h-4 w-4" />
                      이 상징이 포함된 꿈 해석받기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">꿈 상징을 선택하세요</h3>
                  <p className="text-sm">
                    왼쪽 목록에서 꿈 상징을 클릭하면 자세한 의미를 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 사용 안내 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">꿈 사전 사용법</h3>
              <div className="text-sm text-foreground/80 space-y-1">
                <p>• 꿈에서 본 상징들을 검색하거나 카테고리별로 찾아보세요</p>
                <p>• 각 상징은 긍정적/부정적 의미를 모두 가질 수 있습니다</p>
                <p>• 꿈의 전체적인 맥락과 함께 해석하는 것이 중요합니다</p>
                <p>• 더 정확한 해석을 원한다면 AI 꿈해몽 서비스를 이용해보세요</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}