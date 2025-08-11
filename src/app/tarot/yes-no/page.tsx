'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Shuffle, HelpCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface YesNoResult {
  answer: 'YES' | 'NO';
  card: {
    name: string;
    nameKorean: string;
    meaning: string;
    advice: string;
    imageUrl: string;
  };
  interpretation: string;
}

const SignUpPrompt = () => (
  <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center animate-fade-in">
    <h4 className="font-headline text-lg text-primary">더 정확한 예/아니오 리딩을 원하시나요?</h4>
    <p className="text-sm text-foreground/80 mt-1 mb-3">무료로 회원가입하고 AI 해석과 상세한 조언까지 받아보세요!</p>
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <Button asChild className="w-full sm:w-auto">
        <Link href="/sign-up?redirect=/tarot/yes-no">무료 회원가입</Link>
      </Button>
      <Button variant="ghost" asChild className="w-full sm:w-auto">
        <Link href="/sign-in?redirect=/tarot/yes-no">로그인</Link>
      </Button>
    </div>
  </div>
);

export default function YesNoTarotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<YesNoResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 예/아니오 타로 카드 데이터 (메이저 아르카나 기반)
  const yesNoCards = [
    {
      name: 'The Fool', nameKorean: '바보', answer: 'YES' as const,
      meaning: '새로운 시작과 모험', advice: '망설이지 말고 도전하세요',
      imageUrl: '/images/tarot/major-00-fool.jpg'
    },
    {
      name: 'The Magician', nameKorean: '마법사', answer: 'YES' as const,
      meaning: '창조력과 실행력', advice: '당신의 능력을 믿고 실행하세요',
      imageUrl: '/images/tarot/major-01-magician.jpg'
    },
    {
      name: 'The High Priestess', nameKorean: '여교황', answer: 'NO' as const,
      meaning: '신중함과 내면의 지혜', advice: '더 깊이 생각해보세요',
      imageUrl: '/images/tarot/major-02-high-priestess.jpg'
    },
    {
      name: 'The Empress', nameKorean: '여황제', answer: 'YES' as const,
      meaning: '풍요로움과 성장', advice: '자연스럽게 흘러가도록 하세요',
      imageUrl: '/images/tarot/major-03-empress.jpg'
    },
    {
      name: 'The Emperor', nameKorean: '황제', answer: 'YES' as const,
      meaning: '권위와 안정성', advice: '계획적으로 추진하세요',
      imageUrl: '/images/tarot/major-04-emperor.jpg'
    },
    {
      name: 'The Hierophant', nameKorean: '교황', answer: 'NO' as const,
      meaning: '전통과 규칙', advice: '기존 방식을 따르는 것이 좋겠습니다',
      imageUrl: '/images/tarot/major-05-hierophant.jpg'
    },
    {
      name: 'The Lovers', nameKorean: '연인', answer: 'YES' as const,
      meaning: '조화와 선택', advice: '마음이 이끄는 대로 하세요',
      imageUrl: '/images/tarot/major-06-lovers.jpg'
    },
    {
      name: 'The Chariot', nameKorean: '전차', answer: 'YES' as const,
      meaning: '의지력과 승리', advice: '강한 의지로 밀어붙이세요',
      imageUrl: '/images/tarot/major-07-chariot.jpg'
    },
    {
      name: 'Strength', nameKorean: '힘', answer: 'YES' as const,
      meaning: '내면의 힘과 용기', advice: '인내심을 가지고 접근하세요',
      imageUrl: '/images/tarot/major-08-strength.jpg'
    },
    {
      name: 'The Hermit', nameKorean: '은둔자', answer: 'NO' as const,
      meaning: '성찰과 고독', advice: '혼자만의 시간이 필요합니다',
      imageUrl: '/images/tarot/major-09-hermit.jpg'
    },
  ];

  const handleDrawCard = async () => {
    if (!question.trim()) {
      toast({
        title: '질문을 입력해주세요',
        description: '예/아니오로 답할 수 있는 명확한 질문을 작성해주세요.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 랜덤하게 카드 선택
      const randomIndex = Math.floor(Math.random() * yesNoCards.length);
      const selectedCard = yesNoCards[randomIndex];
      
      // 간단한 해석 생성 (실제로는 AI API 호출 가능)
      const interpretations = {
        'YES': [
          '긍정적인 결과가 예상됩니다. 지금이 행동할 때입니다.',
          '상황이 당신에게 유리하게 흘러갈 것입니다.',
          '당신의 직감이 옳습니다. 자신감을 가지세요.',
          '기회의 문이 열려있습니다. 주저하지 마세요.'
        ],
        'NO': [
          '지금은 아닌 것 같습니다. 다른 방법을 고려해보세요.',
          '더 신중하게 접근하는 것이 좋겠습니다.',
          '타이밍이 맞지 않습니다. 조금 더 기다려보세요.',
          '다른 관점에서 상황을 바라볼 필요가 있습니다.'
        ]
      };
      
      const randomInterpretation = interpretations[selectedCard.answer][
        Math.floor(Math.random() * interpretations[selectedCard.answer].length)
      ];

      // 결과 설정 (1.5초 후)
      setTimeout(() => {
        setResult({
          answer: selectedCard.answer,
          card: selectedCard,
          interpretation: randomInterpretation
        });
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating yes/no reading:', error);
      toast({
        title: '오류가 발생했습니다',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full mb-4">
          <HelpCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          예/아니오 타로
        </h1>
        <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
          간단한 질문에 대한 명확한 답을 얻어보세요. 타로 카드가 당신의 길을 안내합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 질문 입력 섹션 */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Sparkles className="mr-2 h-5 w-5" />
              질문하기
            </CardTitle>
            <CardDescription>
              예 또는 아니오로 답할 수 있는 구체적인 질문을 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="예: 이직을 지금 해도 될까요? 이 사람과 사귀어도 될까요?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleDrawCard}
                disabled={isLoading || !question.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Shuffle className="mr-2 h-4 w-4 animate-spin" />
                    카드 뽑는 중...
                  </>
                ) : (
                  <>
                    <Shuffle className="mr-2 h-4 w-4" />
                    카드 뽑기
                  </>
                )}
              </Button>
              
              {result && (
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  다시하기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 결과 섹션 */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <HelpCircle className="mr-2 h-5 w-5" />
              타로의 답
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">우주의 메시지를 받고 있습니다...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex px-4 py-2 rounded-full text-lg font-bold ${
                    result.answer === 'YES' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {result.answer === 'YES' ? '예 (YES)' : '아니오 (NO)'}
                  </div>
                </div>
                
                <div className="text-center">
                  <img 
                    src={result.card.imageUrl} 
                    alt={result.card.nameKorean}
                    className="w-32 h-48 mx-auto rounded-lg shadow-md object-cover mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/tarot/card-back.jpg';
                    }}
                  />
                  <h3 className="font-semibold text-lg">{result.card.nameKorean}</h3>
                  <p className="text-sm text-muted-foreground">{result.card.name}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-primary mb-1">카드의 의미</h4>
                    <p className="text-sm text-foreground/80">{result.card.meaning}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-1">조언</h4>
                    <p className="text-sm text-foreground/80">{result.card.advice}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-1">해석</h4>
                    <p className="text-sm text-foreground/80">{result.interpretation}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p>질문을 입력하고 카드를 뽑아보세요</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 회원가입 프롬프트 (비로그인 사용자) */}
      {!user && result && <SignUpPrompt />}

      {/* 안내 정보 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
            </div>
            <div className="space-y-2 text-sm text-foreground/80">
              <p><strong>예/아니오 타로 가이드:</strong></p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>명확하고 구체적인 질문을 하세요</li>
                <li>열린 마음으로 카드의 메시지를 받아들이세요</li>
                <li>같은 질문을 반복하기보다는 하루 정도 간격을 두세요</li>
                <li>결과는 참고용이며, 최종 결정은 본인의 의지에 달려있습니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}