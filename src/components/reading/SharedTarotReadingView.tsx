'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Eye, Calendar, Wand, Share2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { allTarotCards } from '@/data/all-tarot-cards';
import type { TarotCard } from '@/types/tarot';

interface SharedReading {
  id: string;
  question: string;
  spreadName: string;
  spreadNumCards: number;
  drawnCards: Array<{
    id: string;
    isReversed: boolean;
    position: string;
  }>;
  interpretationText: string;
  timestamp: string;
  createdAt: string;
  viewCount: number;
}

interface SharedTarotReadingViewProps {
  reading: SharedReading;
}

export function SharedTarotReadingView({ reading }: SharedTarotReadingViewProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  // Get full card data from IDs
  const getCardData = (cardId: string): TarotCard | undefined => {
    return allTarotCards.find(card => card.id === cardId);
  };

  const handleShareAgain = async () => {
    setIsSharing(true);
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: '공유 링크 복사됨',
        description: '이 타로 리딩 링크가 클립보드에 복사되었습니다.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '공유 실패',
        description: '링크 복사 중 오류가 발생했습니다.',
      });
    }
    setIsSharing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reading">
                <ArrowLeft className="mr-2 h-4 w-4" />
                새 리딩하기
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{reading.viewCount}회 조회</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">공유된 AI 타로 리딩</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              누군가가 당신과 공유한 특별한 타로 리딩 결과입니다.
            </p>
          </div>
        </div>

        {/* Reading Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand className="h-5 w-5 text-primary" />
              리딩 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">질문</h3>
              <p className="text-foreground bg-muted p-4 rounded-lg">
                {reading.question}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant="secondary" className="px-3 py-1">
                <span className="font-semibold">{reading.spreadName}</span>
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(reading.timestamp)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>선택된 카드 ({reading.drawnCards.length}장)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reading.drawnCards.map((drawnCard, index) => {
                const cardData = getCardData(drawnCard.id);
                if (!cardData) return null;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-52 relative">
                        {cardData.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name}
                            fill
                            className={`object-contain rounded-lg shadow-lg ${
                              drawnCard.isReversed ? 'rotate-180' : ''
                            }`}
                            sizes="128px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center p-4">
                              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                              <p className="text-lg font-bold text-primary">
                                {cardData.number !== null ? cardData.number.toString().padStart(2, '0') : '?'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {drawnCard.isReversed && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive">
                          역방향
                        </Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm mb-1">
                        {cardData.nameKorean || cardData.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {drawnCard.position}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {cardData.keywords.upright.slice(0, 2).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Interpretation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 해석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-headline prose-headings:text-primary prose-headings:text-xl sm:prose-headings:text-2xl prose-headings:mb-3 prose-headings:mt-5 prose-p:text-foreground dark:prose-p:text-white prose-strong:text-primary dark:prose-strong:text-white leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reading.interpretationText}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={handleShareAgain} disabled={isSharing} variant="outline">
            {isSharing ? (
              <>처리 중...</>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                이 리딩 다시 공유하기
              </>
            )}
          </Button>
          <Button asChild>
            <Link href="/reading">
              <Wand className="mr-2 h-4 w-4" />
              나만의 타로 리딩 받기
            </Link>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            이 타로 리딩은 InnerSpell AI에 의해 생성되었으며, 
            {' '}
            <strong>30일간</strong> 공유 가능합니다.
          </p>
          <p className="mt-2">
            타로는 자기 성찰과 영감을 위한 도구입니다. 
            중요한 결정은 신중하게 고려하여 내리시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}