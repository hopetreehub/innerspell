'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, Sparkles, Filter } from 'lucide-react';
import { type TarotCard } from '@/data/tarot-cards';

interface TarotCardsGridProps {
  cards: TarotCard[];
}

export function TarotCardsGrid({ cards }: TarotCardsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuit, setSelectedSuit] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // 수트별 색상 매핑
  const suitColors = {
    major: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    wands: 'bg-gradient-to-br from-red-500 to-orange-600',
    cups: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    swords: 'bg-gradient-to-br from-gray-500 to-slate-600',
    pentacles: 'bg-gradient-to-br from-green-500 to-emerald-600'
  };

  const suitNames = {
    major: '메이저 아르카나',
    wands: '완드 (지팡이)',
    cups: '컵 (성배)',
    swords: '소드 (검)',
    pentacles: '펜타클 (금화)'
  };

  // 필터링된 카드들
  const filteredCards = useMemo(() => {
    let filtered = cards;

    // 탭 필터
    if (activeTab !== 'all') {
      if (activeTab === 'featured') {
        filtered = filtered.filter(card => card.featured);
      } else {
        filtered = filtered.filter(card => card.suit === activeTab);
      }
    }

    // 수트 필터
    if (selectedSuit !== 'all') {
      filtered = filtered.filter(card => card.suit === selectedSuit);
    }

    // 검색 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.nameEn.toLowerCase().includes(searchLower) ||
        card.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }

    // 정렬 (메이저 아르카나 먼저, 그 다음 번호순)
    return filtered.sort((a, b) => {
      if (a.suit === 'major' && b.suit !== 'major') return -1;
      if (a.suit !== 'major' && b.suit === 'major') return 1;
      if (a.number !== null && b.number !== null) return a.number - b.number;
      return 0;
    });
  }, [cards, activeTab, selectedSuit, searchTerm]);

  // 수트별 통계
  const suitStats = useMemo(() => {
    const stats: Record<string, number> = {};
    cards.forEach(card => {
      stats[card.suit] = (stats[card.suit] || 0) + 1;
    });
    return stats;
  }, [cards]);

  return (
    <div className="space-y-8">
      {/* 필터 및 검색 */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="카드 이름이나 키워드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSuit} onValueChange={setSelectedSuit}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="수트 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 수트</SelectItem>
              <SelectItem value="major">메이저 아르카나</SelectItem>
              <SelectItem value="wands">완드 (지팡이)</SelectItem>
              <SelectItem value="cups">컵 (성배)</SelectItem>
              <SelectItem value="swords">소드 (검)</SelectItem>
              <SelectItem value="pentacles">펜타클 (금화)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              전체
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-xs md:text-sm">
              <Star className="h-3 w-3 mr-1" />
              추천
            </TabsTrigger>
            <TabsTrigger value="major" className="text-xs md:text-sm">
              메이저
            </TabsTrigger>
            <TabsTrigger value="wands" className="text-xs md:text-sm">
              완드
            </TabsTrigger>
            <TabsTrigger value="cups" className="text-xs md:text-sm">
              컵
            </TabsTrigger>
            <TabsTrigger value="swords" className="text-xs md:text-sm">
              소드
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 검색 결과 정보 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredCards.length}개의 카드가 발견되었습니다
          {searchTerm && ` "${searchTerm}" 검색 결과`}
        </div>
        <div className="flex gap-2">
          {Object.entries(suitStats).map(([suit, count]) => (
            <Badge key={suit} variant="outline" className="text-xs">
              {suitNames[suit as keyof typeof suitNames]}: {count}
            </Badge>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCards.map((card) => (
          <Link key={card.id} href={`/tarot/cards/${card.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              {/* 카드 이미지 */}
              <div className="relative h-64 overflow-hidden">
                <div className={`absolute inset-0 ${suitColors[card.suit]} opacity-20`} />
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* 배지들 */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge 
                    className={`${suitColors[card.suit]} text-white border-0`}
                  >
                    {suitNames[card.suit]}
                  </Badge>
                  {card.featured && (
                    <Badge className="bg-yellow-500 text-black border-0">
                      <Star className="h-3 w-3 mr-1" />
                      추천
                    </Badge>
                  )}
                </div>

                {/* 카드 번호 */}
                {card.number !== null && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {card.number}
                  </div>
                )}
              </div>

              {/* 카드 정보 */}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {card.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.nameEn}
                </p>
              </CardHeader>

              <CardContent>
                {/* 핵심 키워드 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {card.keywords.slice(0, 3).map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {card.keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{card.keywords.length - 3}
                    </Badge>
                  )}
                </div>

                {/* 간단한 설명 */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {card.upright.meaning}
                </p>

                {/* 정보 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{card.type === 'major' ? '메이저' : card.type === 'pip' ? '숫자' : '궁정'}</span>
                  {card.element && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {card.element === 'fire' ? '불' : card.element === 'water' ? '물' : 
                       card.element === 'air' ? '바람' : '땅'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 검색 결과가 없을 때 */}
      {filteredCards.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              다른 키워드로 검색하거나 필터를 변경해보세요.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSuit('all');
                setActiveTab('all');
              }}
              variant="outline"
            >
              필터 초기화
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}