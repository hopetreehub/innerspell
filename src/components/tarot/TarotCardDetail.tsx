'use client';

import React, { useState } from 'react';
import { TarotCard, CardOrientation } from '@/types/tarot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Briefcase, 
  Heart as Health, 
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Share2,
  BookOpen,
  Star,
  Lightbulb
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TarotCardDetailProps {
  card: TarotCard;
  orientation?: CardOrientation;
  onOrientationChange?: (orientation: CardOrientation) => void;
  showBackButton?: boolean;
  relatedCards?: TarotCard[];
}

export function TarotCardDetail({ 
  card, 
  orientation = 'upright',
  onOrientationChange,
  showBackButton = true,
  relatedCards = []
}: TarotCardDetailProps) {
  const [selectedOrientation, setSelectedOrientation] = useState<CardOrientation>(orientation);

  const handleOrientationChange = (newOrientation: CardOrientation) => {
    setSelectedOrientation(newOrientation);
    onOrientationChange?.(newOrientation);
  };

  const isUpright = selectedOrientation === 'upright';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {showBackButton && (
            <Button variant="ghost" asChild>
              <Link href="/tarot">
                <ArrowLeft className="mr-2 h-4 w-4" />
                타로 카드 목록
              </Link>
            </Button>
          )}
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
          {/* 카드 이미지 및 기본 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant={card.arcana === 'major' ? 'default' : 'secondary'}>
                    {card.arcana === 'major' ? '메이저' : '마이너'} 아르카나
                  </Badge>
                  {card.suit && (
                    <Badge variant="outline">
                      {card.suit === 'wands' && '완드'}
                      {card.suit === 'cups' && '컵'}
                      {card.suit === 'swords' && '소드'}
                      {card.suit === 'pentacles' && '펜타클'}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {card.nameKorean}
                </CardTitle>
                <CardDescription className="text-lg">
                  {card.name}
                  {card.number !== null && ` (${card.number})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 카드 이미지 */}
                <div className="relative mb-6">
                  <div className={`relative w-full aspect-[2/3] mx-auto max-w-xs transition-transform duration-500 ${
                    !isUpright ? 'rotate-180' : ''
                  }`}>
                    <Image
                      src={card.imageUrl || '/images/tarot/card-back.jpg'}
                      alt={card.imageDescription}
                      fill
                      className="object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {card.imageDescription}
                  </p>
                </div>

                {/* 방향 선택 */}
                <div className="flex justify-center mb-6">
                  <div className="flex rounded-lg border p-1">
                    <Button
                      variant={isUpright ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleOrientationChange('upright')}
                      className="px-4"
                    >
                      정방향
                    </Button>
                    <Button
                      variant={!isUpright ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleOrientationChange('reversed')}
                      className="px-4"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      역방향
                    </Button>
                  </div>
                </div>

                {/* 기본 정보 */}
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

          {/* 상세 해석 */}
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
                    {isUpright ? card.meaningShort.upright : card.meaningShort.reversed}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {isUpright ? card.meaningDetailed.upright : card.meaningDetailed.reversed}
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
                  {(isUpright ? card.keywords.upright : card.keywords.reversed).map((keyword, index) => (
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
                      <Health className="h-4 w-4" />
                      건강
                    </TabsTrigger>
                    <TabsTrigger value="spirituality" className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      영성
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="love" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {isUpright ? card.love.upright : card.love.reversed}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="career" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {isUpright ? card.career.upright : card.career.reversed}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="health" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {isUpright ? card.health.upright : card.health.reversed}
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="spirituality" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {isUpright ? card.spirituality.upright : card.spirituality.reversed}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 상징과 조언 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle>조언 및 확언</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">조언</h4>
                    <p className="text-sm text-muted-foreground">
                      {isUpright ? card.advice.upright : card.advice.reversed}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">확언</h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm italic">
                        {`"${isUpright ? card.affirmations.upright : card.affirmations.reversed}"`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 성찰 질문 */}
            <Card>
              <CardHeader>
                <CardTitle>성찰을 위한 질문</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {card.questions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-sm font-medium flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{question}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 관련 카드 */}
            {relatedCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>관련 카드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {relatedCards.map((relatedCard) => (
                      <Link
                        key={relatedCard.id}
                        href={`/tarot/${relatedCard.id}`}
                        className="group"
                      >
                        <div className="text-center p-3 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="w-16 h-24 mx-auto mb-2 relative">
                            <Image
                              src={relatedCard.imageUrl || '/images/tarot/card-back.jpg'}
                              alt={relatedCard.nameKorean}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <p className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {relatedCard.nameKorean}
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