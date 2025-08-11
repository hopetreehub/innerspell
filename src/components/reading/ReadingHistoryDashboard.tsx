'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Search, TrendingUp, Heart, Brain, Star, Clock, BarChart3 } from 'lucide-react';
import { 
  ReadingHistoryResponse, 
  ReadingAnalytics, 
  EnhancedTarotReading,
  ReadingHistoryFilter 
} from '@/types/tarot';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReadingHistoryDashboardProps {
  userId: string;
}

export function ReadingHistoryDashboard({ userId }: ReadingHistoryDashboardProps) {
  const [historyData, setHistoryData] = useState<ReadingHistoryResponse | null>(null);
  const [analytics, setAnalytics] = useState<ReadingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 필터 상태
  const [filters, setFilters] = useState<ReadingHistoryFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('3months');

  useEffect(() => {
    fetchReadingHistory();
    fetchAnalytics();
  }, [currentPage, filters, selectedPeriod]);

  const fetchReadingHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        analytics: 'true',
        ...(searchQuery && { q: searchQuery }),
        ...(filters.dateRange && {
          startDate: filters.dateRange.start.toISOString(),
          endDate: filters.dateRange.end.toISOString()
        }),
        ...(filters.spreadTypes && { spreads: filters.spreadTypes.join(',') }),
        ...(filters.mood && { mood: filters.mood.join(',') }),
        ...(filters.tags && { tags: filters.tags.join(',') })
      });

      const response = await fetch(`/api/reading/history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistoryData(data);
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      } else {
        console.error('Failed to fetch reading history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/reading/analytics?type=overview&period=${selectedPeriod}`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery }));
    setCurrentPage(1);
  };

  if (loading && !historyData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">타로 리딩 히스토리</h2>
          <p className="text-muted-foreground">
            나의 타로 여정과 성장을 확인해보세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">최근 1주</SelectItem>
              <SelectItem value="month">최근 1개월</SelectItem>
              <SelectItem value="3months">최근 3개월</SelectItem>
              <SelectItem value="year">최근 1년</SelectItem>
              <SelectItem value="all">전체 기간</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="history">히스토리</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="patterns">패턴</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 리딩</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalReadings}</div>
                  <p className="text-xs text-muted-foreground">
                    이번 달 {analytics.readingsThisMonth}회
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 만족도</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.averageSatisfaction.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">5점 만점</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">성장 점수</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.growth.insightDepth}
                  </div>
                  <p className="text-xs text-muted-foreground">통찰 깊이</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">연속 일수</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.growth.readingStreak}
                  </div>
                  <p className="text-xs text-muted-foreground">일 연속</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>
                최근 리딩들의 간단한 요약입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyData?.readings.slice(0, 3).map((reading) => (
                <div key={reading.id} className="flex items-center space-x-4 mb-4 last:mb-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {reading.question}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reading.spreadType} • {formatDistanceToNow(reading.createdAt, { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </p>
                  </div>
                  {reading.satisfaction && (
                    <div className="flex-shrink-0">
                      <Badge variant="secondary">
                        {reading.satisfaction}/5
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 히스토리 탭 */}
        <TabsContent value="history" className="space-y-4">
          {/* 검색 및 필터 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="질문이나 해석 내용으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <Button onClick={handleSearch}>
                  검색
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 리딩 목록 */}
          <div className="space-y-4">
            {historyData?.readings.map((reading) => (
              <ReadingHistoryCard key={reading.id} reading={reading} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {historyData && historyData.total > historyData.limit && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                이전
              </Button>
              <span className="flex items-center px-3">
                {currentPage} / {Math.ceil(historyData.total / historyData.limit)}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= Math.ceil(historyData.total / historyData.limit)}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </TabsContent>

        {/* 분석 탭 */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* 카드 분석 */}
              <Card>
                <CardHeader>
                  <CardTitle>자주 나오는 카드들</CardTitle>
                  <CardDescription>
                    최근 가장 많이 나온 카드들과 그 의미를 확인해보세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.topCards.slice(0, 6).map((cardFreq) => (
                      <div key={cardFreq.cardId} className="flex items-center space-x-3">
                        <div className="w-12 h-20 bg-muted rounded flex items-center justify-center text-xs">
                          카드
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{cardFreq.cardId}</p>
                          <p className="text-sm text-muted-foreground">
                            {cardFreq.count}회 등장
                          </p>
                          <div className="flex space-x-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              정방향 {cardFreq.orientation.upright}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              역방향 {cardFreq.orientation.reversed}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 시간대별 패턴 */}
              <Card>
                <CardHeader>
                  <CardTitle>리딩 시간 패턴</CardTitle>
                  <CardDescription>
                    언제 타로를 가장 많이 하시나요?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(analytics.timeDistribution).map(([hour, count]) => (
                      <div key={hour} className="text-center">
                        <div 
                          className="w-full bg-muted rounded mb-1"
                          style={{ 
                            height: `${Math.max(4, (count / Math.max(...Object.values(analytics.timeDistribution))) * 40)}px` 
                          }}
                        />
                        <p className="text-xs text-muted-foreground">{hour}시</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 테마 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle>주요 관심 테마</CardTitle>
                  <CardDescription>
                    어떤 주제들에 관심이 많으신가요?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analytics.themes)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([theme, count]) => (
                        <Badge key={theme} variant="secondary">
                          {theme} ({count})
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 패턴 탭 */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>성장 패턴</CardTitle>
              <CardDescription>
                시간에 따른 변화와 성장을 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {analytics.growth.diversityScore}
                        </div>
                        <p className="text-sm text-muted-foreground">다양성 점수</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {analytics.growth.insightDepth}
                        </div>
                        <p className="text-sm text-muted-foreground">통찰 깊이</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {analytics.growth.selfReflection}
                        </div>
                        <p className="text-sm text-muted-foreground">자기성찰 점수</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">기분별 리딩 분포</h4>
                      <div className="space-y-2">
                        {Object.entries(analytics.moodDistribution).map(([mood, count]) => (
                          <div key={mood} className="flex items-center justify-between">
                            <span className="text-sm">{mood}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ 
                                    width: `${(count / Math.max(...Object.values(analytics.moodDistribution))) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReadingHistoryCard({ reading }: { reading: EnhancedTarotReading }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{reading.question}</CardTitle>
            <CardDescription>
              {reading.spreadType} • {formatDistanceToNow(reading.createdAt, { 
                addSuffix: true, 
                locale: ko 
              })}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {reading.satisfaction && (
              <Badge variant="secondary">
                {reading.satisfaction}/5
              </Badge>
            )}
            {reading.mood && (
              <Badge variant="outline">
                {reading.mood}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 카드들 */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {reading.cards.map((card, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center text-xs text-center">
                  {card.cardId}
                </div>
                <p className="text-xs text-center mt-1 w-16 truncate">
                  {card.position}
                </p>
              </div>
            ))}
          </div>

          {/* 해석 */}
          <div>
            <p className={`text-sm ${expanded ? '' : 'line-clamp-3'}`}>
              {reading.interpretation}
            </p>
            {reading.interpretation.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 h-auto p-0 text-primary"
              >
                {expanded ? '간략히 보기' : '전체 보기'}
              </Button>
            )}
          </div>

          {/* 태그들 */}
          {reading.tags && reading.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reading.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 후속 노트 */}
          {reading.followUp && expanded && (
            <div className="border-t pt-3">
              <h5 className="text-sm font-medium mb-1">후속 노트</h5>
              <p className="text-sm text-muted-foreground">
                {reading.followUp}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}