'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { allTarotCards, majorArcanaCards, minorArcanaCards, getCardsByArcana } from '@/data/all-tarot-cards';
import { TarotCard } from '@/types/tarot';

type FilterType = 'all' | 'major' | 'minor' | 'wands' | 'cups' | 'swords' | 'pentacles';
type SortType = 'number' | 'name' | 'arcana';

export default function TarotCardListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('number');

  // 필터링된 카드들
  const filteredCards = useMemo(() => {
    let cards: TarotCard[] = [];

    // 필터 적용
    switch (filter) {
      case 'all':
        cards = allTarotCards;
        break;
      case 'major':
        cards = majorArcanaCards;
        break;
      case 'minor':
        cards = minorArcanaCards;
        break;
      case 'wands':
        cards = allTarotCards.filter(card => card.suit === 'wands');
        break;
      case 'cups':
        cards = allTarotCards.filter(card => card.suit === 'cups');
        break;
      case 'swords':
        cards = allTarotCards.filter(card => card.suit === 'swords');
        break;
      case 'pentacles':
        cards = allTarotCards.filter(card => card.suit === 'pentacles');
        break;
      default:
        cards = allTarotCards;
    }

    // 검색 적용
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(card => 
        card.nameKorean.toLowerCase().includes(query) ||
        card.name.toLowerCase().includes(query) ||
        card.meaningShort.upright.toLowerCase().includes(query) ||
        card.keywords.upright.some(keyword => keyword.toLowerCase().includes(query)) ||
        card.keywords.reversed.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // 정렬 적용
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'number':
          if (a.arcana !== b.arcana) {
            return a.arcana === 'major' ? -1 : 1;
          }
          return (a.number || 0) - (b.number || 0);
        case 'name':
          return a.nameKorean.localeCompare(b.nameKorean);
        case 'arcana':
          if (a.arcana !== b.arcana) {
            return a.arcana === 'major' ? -1 : 1;
          }
          if (a.suit !== b.suit && a.suit && b.suit) {
            return a.suit.localeCompare(b.suit);
          }
          return (a.number || 0) - (b.number || 0);
        default:
          return 0;
      }
    });

    return cards;
  }, [searchQuery, filter, sortBy]);

  const getSuitKorean = (suit?: string) => {
    const suitMap: Record<string, string> = {
      'wands': '완드',
      'cups': '컵',
      'swords': '소드',
      'pentacles': '펜타클'
    };
    return suit ? suitMap[suit] || suit : '';
  };

  const getCardNumber = (card: TarotCard) => {
    if (card.arcana === 'major') {
      return `${card.number?.toString().padStart(2, '0') || '00'}`;
    }
    return card.rankKorean || card.rank || '';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full mb-4">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          타로 카드 도감
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          78장의 타로 카드를 탐색하고 각 카드의 의미와 상징을 알아보세요.
        </p>
      </header>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="카드 이름이나 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 (78장)</SelectItem>
              <SelectItem value="major">메이저 아르카나 (22장)</SelectItem>
              <SelectItem value="minor">마이너 아르카나 (56장)</SelectItem>
              <SelectItem value="wands">완드 (14장)</SelectItem>
              <SelectItem value="cups">컵 (14장)</SelectItem>
              <SelectItem value="swords">소드 (14장)</SelectItem>
              <SelectItem value="pentacles">펜타클 (14장)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">번호순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="arcana">아르카나별</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 결과 통계 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {filteredCards.length}장의 카드
        </p>
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            검색 초기화
          </Button>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <Link key={card.id} href={`/tarot/${card.id}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={card.arcana === 'major' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {card.arcana === 'major' ? '메이저' : '마이너'}
                      </Badge>
                      {card.suit && (
                        <Badge variant="outline" className="text-xs">
                          {getSuitKorean(card.suit)}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm font-semibold line-clamp-1">
                      {getCardNumber(card)}. {card.nameKorean}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {card.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-[2/3] overflow-hidden rounded-md">
                  <img
                    src={card.imageUrl || '/images/tarot/card-back.jpg'}
                    alt={card.nameKorean}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/tarot/card-back.jpg';
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-foreground/80 line-clamp-2">
                    {card.meaningShort.upright}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {card.keywords.upright.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {card.keywords.upright.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.keywords.upright.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-sm text-muted-foreground">
            다른 키워드로 검색하거나 필터를 변경해보세요.
          </p>
        </div>
      )}

      {/* 카드 통계 정보 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{allTarotCards.length}</div>
              <div className="text-sm text-muted-foreground">전체 카드</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{majorArcanaCards.length}</div>
              <div className="text-sm text-muted-foreground">메이저 아르카나</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{minorArcanaCards.length}</div>
              <div className="text-sm text-muted-foreground">마이너 아르카나</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">수트</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}