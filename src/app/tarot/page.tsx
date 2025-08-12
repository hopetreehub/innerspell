'use client';

import { useState, useEffect } from 'react';
import { allTarotCards, majorArcanaCards, minorArcanaCards, minorArcanaBySuit, tarotStats } from '@/data/all-tarot-cards';
import { majorArcanaJourney } from '@/data/all-major-arcana';
import { TarotCard } from '@/types/tarot';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export default function TarotPage() {
  const [allCards, setAllCards] = useState<TarotCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('major');

  useEffect(() => {
    // 모든 타로 카드 로드
    try {
      setAllCards(allTarotCards);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load tarot cards:', error);
      setIsLoading(false);
    }
  }, []);

  // 현재 탭에 따른 카드 필터링
  const getCurrentCards = () => {
    switch (activeTab) {
      case 'major':
        return majorArcanaCards;
      case 'minor':
        return minorArcanaCards;
      case 'wands':
        return minorArcanaBySuit.wands;
      case 'cups':
        return minorArcanaBySuit.cups;
      case 'swords':
        return minorArcanaBySuit.swords;
      case 'pentacles':
        return minorArcanaBySuit.pentacles;
      default:
        return majorArcanaCards;
    }
  };

  // 검색 필터링
  const filteredCards = getCurrentCards().filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.name.toLowerCase().includes(query) ||
      card.nameKorean.includes(searchQuery) ||
      card.keywords.upright.some(k => k.toLowerCase().includes(query)) ||
      card.meaningShort.upright.toLowerCase().includes(query)
    );
  });
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            타로 카드 아카이브
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {tarotStats.total}장의 타로 카드 각각의 깊은 의미와 상징을 탐험해보세요.
            메이저 아르카나 {tarotStats.majorArcana}장과 마이너 아르카나 {tarotStats.minorArcana}장으로 구성되어 있습니다.
          </p>
          
          {/* 검색 바 */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="카드 이름, 키워드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
        </div>
        
        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-6 mb-8">
            <TabsTrigger value="major">메이저 아르카나</TabsTrigger>
            <TabsTrigger value="minor">마이너 아르카나</TabsTrigger>
            <TabsTrigger value="wands">완드</TabsTrigger>
            <TabsTrigger value="cups">컵</TabsTrigger>
            <TabsTrigger value="swords">소드</TabsTrigger>
            <TabsTrigger value="pentacles">펜타클</TabsTrigger>
          </TabsList>
          
          <TabsContent value="major" className="mt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="large" />
                <p className="text-lg text-gray-500 mt-4">카드를 불러오는 중...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 {filteredCards.length}장의 카드
                  </p>
                </div>
                
                {/* 메이저 아르카나 여정 단계 */}
                {searchQuery === '' && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-center mb-6">메이저 아르카나의 여정</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {majorArcanaJourney.map((stage, idx) => (
                        <Card key={idx} className="p-6 bg-card">
                          <h3 className="font-semibold text-lg mb-2">{stage.stage}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{stage.description}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">{stage.theme}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 카드 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards.map((card) => (
                    <Link key={card.id} href={`/tarot/${card.id}`}>
                      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-card">
                        <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800">
                          {card.imageUrl ? (
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <div className="text-center p-4">
                                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-1">
                                  {card.number !== null ? card.number.toString().padStart(2, '0') : '?'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{card.nameKorean}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* 카드 번호 배지 */}
                          <Badge className="absolute top-2 left-2 bg-purple-900/90 text-white backdrop-blur-sm">
                            {card.number !== null ? card.number.toString().padStart(2, '0') : 'Court'}
                          </Badge>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                            {card.nameKorean}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {card.name}
                          </p>
                          
                          {/* 주요 키워드 */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {card.keywords.upright.slice(0, 2).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                {filteredCards.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="minor" className="mt-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="large" />
                <p className="text-lg text-gray-500 mt-4">카드를 불러오는 중...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">마이너 아르카나 (56장)</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    총 {filteredCards.length}장의 카드 | 완드 {minorArcanaBySuit.wands.length}장 · 컵 {minorArcanaBySuit.cups.length}장 · 소드 {minorArcanaBySuit.swords.length}장 · 펜타클 {minorArcanaBySuit.pentacles.length}장
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <h3 className="font-semibold text-red-600 dark:text-red-400">완드 (불)</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">열정, 창조, 행동</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400">컵 (물)</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">감정, 직관, 관계</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">소드 (공기)</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">정신, 갈등, 소통</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <h3 className="font-semibold text-green-600 dark:text-green-400">펜타클 (흙)</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">물질, 실용, 안정</p>
                    </div>
                  </div>
                </div>
                
                {/* 카드 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredCards.map((card) => (
                    <Link key={card.id} href={`/tarot/${card.id}`}>
                      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-card">
                        <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800">
                          {card.imageUrl ? (
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <div className="text-center p-4">
                                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-1">
                                  {card.number !== null ? card.number.toString().padStart(2, '0') : card.name.split(' ')[0]}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{card.nameKorean}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* 수트 및 번호 배지 */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <Badge className={`text-white backdrop-blur-sm ${
                              card.suit === 'wands' ? 'bg-red-600/90' :
                              card.suit === 'cups' ? 'bg-blue-600/90' :
                              card.suit === 'swords' ? 'bg-yellow-600/90' :
                              card.suit === 'pentacles' ? 'bg-green-600/90' :
                              'bg-purple-900/90'
                            }`}>
                              {card.suit === 'wands' && '완드'}
                              {card.suit === 'cups' && '컵'}
                              {card.suit === 'swords' && '소드'}
                              {card.suit === 'pentacles' && '펜타클'}
                            </Badge>
                            {card.number !== null && (
                              <Badge className="bg-gray-900/90 text-white backdrop-blur-sm">
                                {card.number}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                            {card.nameKorean}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {card.name}
                          </p>
                          
                          {/* 주요 키워드 */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {card.keywords.upright.slice(0, 2).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                {filteredCards.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* 개별 수트 탭들 */}
          {(['wands', 'cups', 'swords', 'pentacles'] as const).map((suit) => (
            <TabsContent key={suit} value={suit} className="mt-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size="large" />
                  <p className="text-lg text-gray-500 mt-4">카드를 불러오는 중...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">
                      {suit === 'wands' && '완드 수트 (불의 원소)'}
                      {suit === 'cups' && '컵 수트 (물의 원소)'}
                      {suit === 'swords' && '소드 수트 (공기의 원소)'}
                      {suit === 'pentacles' && '펜타클 수트 (흙의 원소)'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      총 {filteredCards.length}장의 카드 · 
                      {suit === 'wands' && ' 열정, 창조력, 행동력을 나타내는 수트'}
                      {suit === 'cups' && ' 감정, 직감, 관계를 나타내는 수트'}
                      {suit === 'swords' && ' 정신, 갈등, 의사소통을 나타내는 수트'}
                      {suit === 'pentacles' && ' 물질, 실용성, 안정을 나타내는 수트'}
                    </p>
                  </div>
                  
                  {/* 카드 그리드 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredCards.map((card) => (
                      <Link key={card.id} href={`/tarot/${card.id}`}>
                        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-card">
                          <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800">
                            {card.imageUrl ? (
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted">
                                <div className="text-center p-4">
                                  <Sparkles className={`w-12 h-12 mx-auto mb-2 ${
                                    suit === 'wands' ? 'text-red-400' :
                                    suit === 'cups' ? 'text-blue-400' :
                                    suit === 'swords' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`} />
                                  <p className={`text-3xl font-bold mb-1 ${
                                    suit === 'wands' ? 'text-red-600 dark:text-red-300' :
                                    suit === 'cups' ? 'text-blue-600 dark:text-blue-300' :
                                    suit === 'swords' ? 'text-yellow-600 dark:text-yellow-300' :
                                    'text-green-600 dark:text-green-300'
                                  }`}>
                                    {card.number !== null ? card.number.toString().padStart(2, '0') : card.name.split(' ')[0]}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.nameKorean}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* 번호 배지 */}
                            <Badge className={`absolute top-2 left-2 text-white backdrop-blur-sm ${
                              suit === 'wands' ? 'bg-red-600/90' :
                              suit === 'cups' ? 'bg-blue-600/90' :
                              suit === 'swords' ? 'bg-yellow-600/90' :
                              'bg-green-600/90'
                            }`}>
                              {card.number !== null ? card.number.toString().padStart(2, '0') : 'Court'}
                            </Badge>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                              {card.nameKorean}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {card.name}
                            </p>
                            
                            {/* 주요 키워드 */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {card.keywords.upright.slice(0, 2).map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  
                  {filteredCards.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-500">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}