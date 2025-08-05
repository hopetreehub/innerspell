'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Heart, 
  Briefcase, 
  Activity, 
  Lightbulb, 
  RotateCcw, 
  Star,
  Sparkles,
  Share2,
  BookOpen
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

  // 현재 방향에 따른 데이터
  const currentMeaning = currentOrientation === 'upright' ? card.upright : card.reversed;
  const currentKeywords = Array.isArray(card.keywords) 
    ? card.keywords 
    : (card.keywords?.[currentOrientation] || []);

  // 관련 카드 필터링
  const displayRelatedCards = relatedCards || [];

  // 타로카드 종류별 색상
  const suitColors = {
    major: 'bg-purple-600',
    wands: 'bg-red-600',
    cups: 'bg-blue-600',
    swords: 'bg-yellow-600',
    pentacles: 'bg-green-600'
  };

  const suitNames = {
    major: '메이저 아르카나',
    wands: '완드',
    cups: '컵',
    swords: '소드',
    pentacles: '펜타클'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="ghost">
            <Link href="/tarot">
              <ArrowLeft className="mr-2 h-4 w-4" />
              타로 카드 목록
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              해석 요청
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 카드 이미지 및 기본 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className={`${suitColors[card.suit]} text-white`}>
                    {suitNames[card.suit]}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{card.name}</CardTitle>
                <p className="text-muted-foreground text-lg">
                  {card.nameEn} {card.number !== null && `(${card.number})`}
                </p>
              </CardHeader>
              
              <CardContent>
                {/* 카드 이미지 */}
                <div className="relative mb-6">
                  <div className={`relative w-full aspect-[2/3] mx-auto max-w-xs transition-transform duration-500 ${
                    currentOrientation === 'reversed' ? 'rotate-180' : ''
                  }`}>
                    <Image
                      src={card.image}
                      alt={card.description || card.name}
                      fill
                      className="object-cover rounded-lg shadow-lg"
                      sizes="100vw"
                      priority
                    />
                  </div>
                  {card.description && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* 정방향/역방향 토글 */}
                <div className="flex justify-center mb-6">
                  <div className="flex rounded-lg border p-1">
                    <Button
                      variant={currentOrientation === 'upright' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentOrientation('upright')}
                      className="rounded-md"
                    >
                      정방향
                    </Button>
                    <Button
                      variant={currentOrientation === 'reversed' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentOrientation('reversed')}
                      className="rounded-md"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      역방향
                    </Button>
                  </div>
                </div>

                {/* 카드 속성 정보 */}
                <div className="space-y-4">
                  {card.element && (
                    <div>
                      <h4 className="font-semibold mb-1">원소</h4>
                      <Badge variant="outline">{card.element}</Badge>
                    </div>
                  )}
                  {card.planet && (
                    <div>
                      <h4 className="font-semibold mb-1">행성</h4>
                      <Badge variant="outline">{card.planet}</Badge>
                    </div>
                  )}
                  {card.zodiac && (
                    <div>
                      <h4 className="font-semibold mb-1">별자리</h4>
                      <Badge variant="outline">{card.zodiac}</Badge>
                    </div>
                  )}
                  {card.numerology && (
                    <div>
                      <h4 className="font-semibold mb-1">수비학</h4>
                      <Badge variant="outline">{card.numerology}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 카드 해석 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 핵심 의미 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  핵심 의미
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg font-medium">
                    {currentOrientation === 'upright' 
                      ? '강한 의지력과 창조력으로 목표를 달성할 수 있는 시기'
                      : '의지력이 약해지거나 잘못된 방향으로 사용될 수 있는 시기'}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {currentMeaning.meaning}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 키워드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  키워드
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 생활 영역별 해석 */}
            <Card>
              <CardHeader>
                <CardTitle>생활 영역별 해석</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="love" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="love" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      연애
                    </TabsTrigger>
                    <TabsTrigger value="career" className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      직업
                    </TabsTrigger>
                    <TabsTrigger value="health" className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      건강
                    </TabsTrigger>
                    <TabsTrigger value="spirituality" className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      영성
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="love" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentMeaning.love}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="career" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentMeaning.career}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="health" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentMeaning.health}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="spirituality" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {currentOrientation === 'upright' 
                        ? '영적 능력이 깨어나고 있으며, 명상이나 영적 수행에서 큰 진전을 보일 수 있는 시기.'
                        : '영적 혼란이나 방향성 상실. 내면의 목소리에 귀 기울이는 시간이 필요.'}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 상징적 의미와 조언 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 상징적 의미 */}
              {card.symbolism && card.symbolism.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>상징적 의미</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {card.symbolism.map((symbol, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{symbol}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 조언 및 확언 */}
              <Card>
                <CardHeader>
                  <CardTitle>조언 및 확언</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">조언</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentMeaning.advice}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">확언</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm italic">
                        {currentOrientation === 'upright'
                          ? "나는 내 안의 힘을 믿고, 의지력으로 꿈을 현실로 만들어갑니다."
                          : "나는 내면의 균형을 찾고, 올바른 방향으로 나아갑니다."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 성찰을 위한 질문 */}
            <Card>
              <CardHeader>
                <CardTitle>성찰을 위한 질문</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-medium flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    <span className="text-muted-foreground">
                      {currentOrientation === 'upright'
                        ? "나의 진정한 재능과 능력은 무엇인가요?"
                        : "내가 놓치고 있는 것은 무엇인가요?"}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-medium flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    <span className="text-muted-foreground">
                      {currentOrientation === 'upright'
                        ? "목표를 달성하기 위해 어떤 행동을 취해야 할까요?"
                        : "무엇이 나를 방해하고 있나요?"}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-medium flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    <span className="text-muted-foreground">
                      {currentOrientation === 'upright'
                        ? "지금 내가 집중해야 할 것은 무엇인가요?"
                        : "어떻게 균형을 회복할 수 있을까요?"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 관련 카드 */}
            {displayRelatedCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>관련 카드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayRelatedCards.map((relatedCard) => (
                      <Link key={relatedCard.id} href={`/tarot/${relatedCard.id}`} className="group">
                        <div className="text-center p-3 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="w-16 h-24 mx-auto mb-2 relative">
                            <Image
                              src={relatedCard.image}
                              alt={relatedCard.name}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          </div>
                          <p className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {relatedCard.name}
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
  );
}