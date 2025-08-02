'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Star, 
  Clock, 
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UserStats {
  totalReadings: number;
  monthlyReadings: number;
  favoriteCards: string[];
  streakDays: number;
  level: number;
  experience: number;
  nextLevelXP: number;
}

interface ReadingHistory {
  id: string;
  date: string;
  cards: string[];
  question: string;
  mood: 'positive' | 'neutral' | 'negative';
  accuracy: number;
}

export default function UserDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalReadings: 0,
    monthlyReadings: 0,
    favoriteCards: [],
    streakDays: 0,
    level: 1,
    experience: 0,
    nextLevelXP: 100
  });

  const [recentReadings, setRecentReadings] = useState<ReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 모의 데이터 로드
    const loadUserData = async () => {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserStats({
        totalReadings: 47,
        monthlyReadings: 12,
        favoriteCards: ['The Star', 'Ten of Cups', 'The Sun'],
        streakDays: 7,
        level: 3,
        experience: 245,
        nextLevelXP: 300
      });

      setRecentReadings([
        {
          id: '1',
          date: '2025-07-29',
          cards: ['The Hermit', 'Three of Pentacles'],
          question: '새로운 프로젝트 시작에 대한 조언',
          mood: 'positive',
          accuracy: 85
        },
        {
          id: '2',
          date: '2025-07-28',
          cards: ['Queen of Wands', 'Ace of Swords'],
          question: '리더십 향상 방법',
          mood: 'positive',
          accuracy: 92
        },
        {
          id: '3',
          date: '2025-07-27',
          cards: ['Five of Cups', 'The Tower'],
          question: '최근 실패에서 배울 점',
          mood: 'neutral',
          accuracy: 78
        }
      ]);

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const progressPercentage = (userStats.experience / userStats.nextLevelXP) * 100;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 상단 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 리딩 횟수</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{userStats.totalReadings}</div>
            <p className="text-xs text-muted-foreground">
              이번 달 +{userStats.monthlyReadings}회
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 리딩</CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{userStats.streakDays}일</div>
            <p className="text-xs text-muted-foreground">
              꾸준한 성장 중!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 레벨</CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">레벨 {userStats.level}</div>
            <div className="mt-2">
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {userStats.experience}/{userStats.nextLevelXP} XP
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">선호 카드</CardTitle>
            <Star className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-rose-700 mb-2">
              {userStats.favoriteCards[0]}
            </div>
            <div className="flex flex-wrap gap-1">
              {userStats.favoriteCards.slice(1).map((card, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-rose-100 text-rose-700"
                >
                  {card}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">최근 리딩</TabsTrigger>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
          <TabsTrigger value="goals">목표</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                최근 타로 리딩 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReadings.map((reading) => (
                  <div key={reading.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{reading.question}</div>
                      <Badge 
                        variant={reading.mood === 'positive' ? 'default' : reading.mood === 'neutral' ? 'secondary' : 'destructive'}
                        className="ml-2"
                      >
                        {reading.mood === 'positive' ? '긍정적' : reading.mood === 'neutral' ? '중립적' : '부정적'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {format(new Date(reading.date), 'yyyy년 MM월 dd일', { locale: ko })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {reading.cards.map((card, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {card}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        정확도: {reading.accuracy}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                개인화된 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    📈 성장 패턴 분석
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    최근 7일간 긍정적인 카드가 64% 증가했습니다. 
                    현재 삶의 방향이 올바른 길로 향하고 있음을 시사합니다.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    🌟 주요 테마
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    &quot;성장&quot;과 &quot;변화&quot;가 이달의 핵심 키워드입니다. 
                    새로운 도전을 받아들일 준비가 되어 있는 시기입니다.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    💡 추천 행동
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    명상과 자기 성찰 시간을 늘려보세요. 
                    The Hermit 카드가 자주 나타나는 것은 내면의 지혜를 탐구할 때임을 의미합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                개인 목표 및 도전
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">주간 리딩 목표</h4>
                    <Badge variant="outline">진행 중</Badge>
                  </div>
                  <Progress value={85} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    이번 주 6/7일 완료 - 거의 다 왔어요!
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">월간 다양성 챌린지</h4>
                    <Badge variant="secondary">새로운</Badge>
                  </div>
                  <Progress value={40} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    22가지 중 9가지 카드 경험 - 다양한 상황을 탐험해보세요!
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">타로 마스터 레벨</h4>
                    <Badge>완료</Badge>
                  </div>
                  <Progress value={100} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    축하합니다! 모든 메이저 아르카나를 경험했습니다.
                  </p>
                </div>

                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  새로운 목표 설정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}