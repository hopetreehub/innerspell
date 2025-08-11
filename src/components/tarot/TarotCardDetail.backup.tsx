'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Briefcase, 
  Activity, 
  Lightbulb, 
  RotateCcw, 
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { type TarotCard } from '@/data/tarot-cards';

interface TarotCardDetailProps {
  card: TarotCard;
  allCards?: TarotCard[];
  relatedCards?: TarotCard[];
  showBackButton?: boolean;
}

export function TarotCardDetail({ card, allCards, relatedCards, showBackButton = false }: TarotCardDetailProps) {
  const [currentOrientation, setCurrentOrientation] = useState<'upright' | 'reversed'>('upright');

  // Memoize expensive calculations
  const memoizedCardData = useMemo(() => {
    if (!card) return null;
    
    return {
      currentMeaning: card.meanings?.[currentOrientation] || card.meaning,
      currentKeywords: Array.isArray(card.keywords) 
        ? card.keywords 
        : (card.keywords?.[currentOrientation] || []),
      isReversed: currentOrientation === 'reversed'
    };
  }, [card, currentOrientation]);

  // Card가 없으면 로딩 또는 에러 상태 표시
  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">카드를 찾을 수 없습니다.</p>
            <Button asChild className="mt-4">
              <Link href="/tarot">타로 카드 목록으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // 이전/다음 카드 찾기 (방어 코드 추가)
  const currentIndex = allCards?.findIndex(c => c.id === card.id) ?? -1;
  const previousCard = (allCards && currentIndex > 0) ? allCards[currentIndex - 1] : null;
  const nextCard = (allCards && currentIndex < allCards.length - 1) ? allCards[currentIndex + 1] : null;

  // 관련 카드 (props에서 받거나 같은 수트의 카드들)
  const displayRelatedCards = relatedCards || (allCards
    ?.filter(c => c.suit === card.suit && c.id !== card.id)
    ?.slice(0, 4)) || [];

  // 공유하기 함수
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card.name} 타로 카드 해석`,
        text: card.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // 토스트 메시지 표시 (구현 필요)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/tarot"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            카드 목록으로 돌아가기
          </Link>
          
          <div className="flex items-center gap-2">
            {previousCard && (
              <Link href={`/tarot/${previousCard.id}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
              </Link>
            )}
            {nextCard && (
              <Link href={`/tarot/${nextCard.id}`}>
                <Button variant="outline" size="sm">
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 카드 이미지 및 기본 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-0">
                {/* 카드 이미지 */}
                <div className="relative aspect-[297/521] overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                  <div className={`absolute inset-0 ${suitColors[card.suit]} opacity-20`} />
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className={`object-contain transition-transform duration-500 ${
                      currentOrientation === 'reversed' ? 'rotate-180' : ''
                    }`}
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                    quality={85}
                    loading="eager"
                  />
                  
                  {/* 배지들 */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className={`${suitColors[card.suit]} text-white border-0`}>
                      {suitNames[card.suit]}
                    </Badge>
                    {card.featured && (
                      <Badge className="bg-yellow-500 text-black border-0">
                        <Star className="h-3 w-3 mr-1" />
                        추천 카드
                      </Badge>
                    )}
                  </div>

                  {/* 카드 번호 */}
                  {card.number !== null && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {card.number}
                    </div>
                  )}
                </div>

                {/* 카드 기본 정보 */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-primary mb-2">{card.name}</h1>
                    <p className="text-lg text-muted-foreground">{card.nameEn}</p>
                  </div>

                  {/* 방향 토글 */}
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={currentOrientation === 'upright' ? 'default' : 'outline'}
                      onClick={() => setCurrentOrientation('upright')}
                      className="flex-1"
                    >
                      정방향
                    </Button>
                    <Button
                      variant={currentOrientation === 'reversed' ? 'default' : 'outline'}
                      onClick={() => setCurrentOrientation('reversed')}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      역방향
                    </Button>
                  </div>

                  {/* 핵심 키워드 */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">핵심 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(card.keywords) 
                        ? card.keywords 
                        : (card.keywords?.[currentOrientation] || [])).map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="space-y-3 text-sm">
                    {card.element && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">원소</span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {card.element === 'fire' ? '불' : 
                           card.element === 'water' ? '물' : 
                           card.element === 'air' ? '바람' : '땅'}
                        </span>
                      </div>
                    )}
                    {card.planet && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">행성</span>
                        <span>{card.planet}</span>
                      </div>
                    )}
                    {card.zodiac && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">별자리</span>
                        <span>{card.zodiac}</span>
                      </div>
                    )}
                    {card.numerology && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">수비학</span>
                        <span>{card.numerology}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 상세 해석 */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* 카드 설명 */}
              <Card>
                <CardHeader>
                  <CardTitle>카드 설명</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>

              {/* 의미 해석 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentOrientation === 'upright' ? (
                      <>정방향 의미</>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5" />
                        역방향 의미
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="general" className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        전체
                      </TabsTrigger>
                      <TabsTrigger value="love" className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        연애
                      </TabsTrigger>
                      <TabsTrigger value="career" className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        사업
                      </TabsTrigger>
                      <TabsTrigger value="health" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        건강
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">일반적 의미</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {currentOrientation === 'upright' 
                              ? card.meaningDetailed?.upright || card.meaning?.upright || '정방향 의미가 준비 중입니다.'
                              : card.meaningDetailed?.reversed || card.meaning?.reversed || '역방향 의미가 준비 중입니다.'}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">조언</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {currentOrientation === 'upright' 
                              ? card.advice?.upright || '정방향 조언이 준비 중입니다.'
                              : card.advice?.reversed || '역방향 조언이 준비 중입니다.'}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="love" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="h-5 w-5 text-red-500" />
                          <h4 className="font-semibold">연애 운세</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {currentOrientation === 'upright' 
                            ? card.love?.upright || '정방향 연애 운세가 준비 중입니다.'
                            : card.love?.reversed || '역방향 연애 운세가 준비 중입니다.'}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="career" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Briefcase className="h-5 w-5 text-blue-500" />
                          <h4 className="font-semibold">사업 & 직업 운세</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {currentOrientation === 'upright' 
                            ? card.career?.upright || '정방향 직업 운세가 준비 중입니다.'
                            : card.career?.reversed || '역방향 직업 운세가 준비 중입니다.'}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="health" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-green-500" />
                          <h4 className="font-semibold">건강 운세</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {currentOrientation === 'upright' 
                            ? card.health?.upright || '정방향 건강 운세가 준비 중입니다.'
                            : card.health?.reversed || '역방향 건강 운세가 준비 중입니다.'}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 상징과 의미 */}
              <Card>
                <CardHeader>
                  <CardTitle>상징과 의미</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(card.symbolism || []).map((symbol, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-muted-foreground">{symbol}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 관련 카드 */}
              {displayRelatedCards.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>같은 수트의 다른 카드들</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {displayRelatedCards.map((relatedCard) => (
                        <Link key={relatedCard.id} href={`/tarot/${relatedCard.id}`}>
                          <div className="group cursor-pointer">
                            <div className="relative aspect-[297/521] rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                              <Image
                                src={relatedCard.image}
                                alt={relatedCard.name}
                                fill
                                className="object-contain group-hover:scale-105 transition-transform duration-200"
                                style={{ objectFit: 'contain' }}
                                sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw"
                                loading="lazy"
                              />
                            </div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                              {relatedCard.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {relatedCard.nameEn}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}