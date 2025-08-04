import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ReadingPattern, ReadingAnalytics, EnhancedTarotReading, ReadingCard, TarotCard, ReadingSummary } from '@/types/tarot';
import { db } from '@/lib/firebase/admin';

/**
 * 사용자 리딩 패턴 및 심화 분석 API
 * GET /api/reading/analytics
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '인증이 필요합니다' }, 
        { status: 401 }
      );
    }

    // 사용자 인증 확인 (간단한 검증)
    const userId = 'temp-user'; // 실제로는 세션에서 추출

    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type') || 'overview';
    const period = searchParams.get('period') || '3months'; // week, month, 3months, year, all

    let startDate: Date;
    const endDate = new Date();

    // 기간 설정
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date('2020-01-01'); // 전체 기간
    }

    // 분석 타입에 따른 분기
    switch (analysisType) {
      case 'patterns':
        const patterns = await generatePatternAnalysis(userId, startDate, endDate);
        return NextResponse.json(patterns);
      
      case 'growth':
        const growth = await generateGrowthAnalysis(userId, startDate, endDate);
        return NextResponse.json(growth);
      
      case 'recommendations':
        const recommendations = await generateRecommendations(userId);
        return NextResponse.json(recommendations);
      
      case 'comparison':
        const comparison = await generatePeriodComparison(userId);
        return NextResponse.json(comparison);
      
      default:
        // 전체 개요
        const overview = await generateOverviewAnalysis(userId, startDate, endDate);
        return NextResponse.json(overview);
    }

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: '분석 데이터를 생성하는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * 패턴 분석 생성
 */
async function generatePatternAnalysis(userId: string, startDate: Date, endDate: Date): Promise<ReadingPattern> {
  const snapshot = await db.collection('users')
    .doc(userId)
    .collection('tarotReadings')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .orderBy('createdAt', 'desc')
    .get();

  const readings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));

  // 카드 빈도 분석
  const cardFrequencyMap = new Map<string, {
    cardId: string;
    count: number;
    upright: number;
    reversed: number;
    contexts: string[];
    lastAppeared?: Date;
  }>();
  const spreadFrequencyMap = new Map<string, {
    spreadType: string;
    count: number;
    satisfactions: number[];
    lastUsed: Date;
  }>();
  const questionCategories = new Map<string, {
    category: string;
    count: number;
    keywords: Set<string>;
    sentiments: ('positive' | 'neutral' | 'negative')[];
  }>();
  const timePatterns = new Array(24).fill(0);
  const moodPatterns = new Map<string, {
    mood: string;
    count: number;
    cards: Set<string>;
    outcomes: string[];
  }>();

  readings.forEach((reading: EnhancedTarotReading) => {
    // 카드 빈도
    reading.cards?.forEach((card: ReadingCard) => {
      const existing = cardFrequencyMap.get(card.cardId) || {
        cardId: card.cardId,
        count: 0,
        upright: 0,
        reversed: 0,
        contexts: [],
        lastAppeared: undefined
      };
      
      existing.count++;
      if (card.orientation === 'upright') existing.upright++;
      else existing.reversed++;
      existing.contexts.push(reading.question);
      existing.lastAppeared = reading.createdAt;
      
      cardFrequencyMap.set(card.cardId, existing);
    });

    // 스프레드 빈도
    const spreadData = spreadFrequencyMap.get(reading.spreadType) || {
      spreadType: reading.spreadType,
      count: 0,
      satisfactions: [],
      lastUsed: reading.createdAt
    };
    spreadData.count++;
    if (reading.satisfaction) spreadData.satisfactions.push(reading.satisfaction);
    spreadFrequencyMap.set(reading.spreadType, spreadData);

    // 질문 카테고리 분석
    const category = categorizeQuestion(reading.question);
    const categoryData = questionCategories.get(category) || {
      category,
      count: 0,
      keywords: new Set(),
      sentiments: []
    };
    categoryData.count++;
    categoryData.sentiments.push(analyzeSentiment(reading.question));
    extractKeywords(reading.question).forEach(keyword => categoryData.keywords.add(keyword));
    questionCategories.set(category, categoryData);

    // 시간 패턴
    const hour = reading.createdAt.getHours();
    timePatterns[hour]++;

    // 기분 패턴
    if (reading.mood) {
      const moodData = moodPatterns.get(reading.mood) || {
        mood: reading.mood,
        count: 0,
        cards: new Set(),
        outcomes: []
      };
      moodData.count++;
      reading.cards?.forEach((card: ReadingCard) => moodData.cards.add(card.cardId));
      moodData.outcomes.push(reading.interpretation.slice(0, 100));
      moodPatterns.set(reading.mood, moodData);
    }
  });

  // 기간별 분석
  const periodAnalysis = await generatePeriodAnalysis(userId);

  const pattern: ReadingPattern = {
    userId,
    frequentCards: Array.from(cardFrequencyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(card => ({
        cardId: card.cardId,
        card: {} as TarotCard, // 실제로는 카드 정보 조회
        count: card.count,
        lastAppeared: card.lastAppeared,
        orientation: {
          upright: card.upright,
          reversed: card.reversed
        },
        averageContext: getMostCommonContext(card.contexts)
      })),
    
    preferredSpreads: Array.from(spreadFrequencyMap.values())
      .sort((a, b) => b.count - a.count)
      .map(spread => ({
        spreadType: spread.spreadType,
        count: spread.count,
        lastUsed: spread.lastUsed,
        averageSatisfaction: spread.satisfactions.length > 0 
          ? spread.satisfactions.reduce((a, b) => a + b, 0) / spread.satisfactions.length 
          : undefined
      })),
    
    questionCategories: Array.from(questionCategories.values()).map(cat => ({
      category: cat.category,
      count: cat.count,
      keywords: Array.from(cat.keywords),
      sentiment: getMostCommonSentiment(cat.sentiments)
    })),
    
    readingTimes: timePatterns.map((count, hour) => ({
      hour,
      count,
      averageMood: undefined // 복잡한 계산 필요
    })),
    
    moodPatterns: Array.from(moodPatterns.values()).map(mood => ({
      mood: mood.mood,
      count: mood.count,
      frequentCards: Array.from(mood.cards),
      outcomes: mood.outcomes
    })),
    
    periodAnalysis
  };

  return pattern;
}

/**
 * 성장 분석 생성
 */
async function generateGrowthAnalysis(userId: string, startDate: Date, endDate: Date) {
  // 전체 리딩 조회
  const allReadingsSnapshot = await db.collection('users')
    .doc(userId)
    .collection('tarotReadings')
    .orderBy('createdAt', 'asc')
    .get();

  const readings = allReadingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));

  // 시간별 성장 지표 계산
  const timelineAnalysis = generateTimelineAnalysis(readings);
  const skillProgression = calculateSkillProgression(readings);
  const insightEvolution = analyzeInsightEvolution(readings);
  const thematicJourney = trackThematicJourney(readings);

  return {
    timeline: timelineAnalysis,
    skills: skillProgression,
    insights: insightEvolution,
    themes: thematicJourney,
    milestones: generateMilestones(readings),
    projections: generateGrowthProjections(readings)
  };
}

/**
 * 추천 시스템
 */
async function generateRecommendations(userId: string) {
  const recentReadingsSnapshot = await db.collection('users')
    .doc(userId)
    .collection('tarotReadings')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const readings = recentReadingsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));

  const recommendations = [];

  // 다양성 기반 추천
  const cardUsage = new Map();
  readings.forEach((reading: any) => {
    reading.cards?.forEach((card: any) => {
      cardUsage.set(card.cardId, (cardUsage.get(card.cardId) || 0) + 1);
    });
  });

  // 잘 안 나온 카드들 추천
  const underusedCards = Array.from(cardUsage.entries())
    .filter(([_, count]) => count < 2)
    .slice(0, 5);

  if (underusedCards.length > 0) {
    recommendations.push({
      type: 'card',
      title: '새로운 관점 탐구',
      description: '최근에 많이 나오지 않은 카드들을 의식적으로 탐구해보세요',
      reason: '다양한 아키타입과 에너지를 경험하여 내면의 균형을 찾을 수 있습니다',
      confidence: 0.8,
      relatedReadings: [],
      suggestedAction: '3장 스프레드로 이 카드들의 메시지를 탐구해보세요'
    });
  }

  // 시간 패턴 기반 추천
  const hourCounts = new Array(24).fill(0);
  readings.forEach((reading: EnhancedTarotReading) => {
    hourCounts[reading.createdAt.getHours()]++;
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const lowHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(({ count }) => count === 0)
    .slice(0, 3);

  if (lowHours.length > 0) {
    recommendations.push({
      type: 'time',
      title: '새로운 시간대 탐구',
      description: `평소와 다른 시간대(${lowHours.map(h => h.hour + '시').join(', ')})에 리딩을 해보세요`,
      reason: '하루 중 다른 시간대의 에너지는 새로운 통찰을 제공할 수 있습니다',
      confidence: 0.6,
      relatedReadings: [],
      suggestedAction: '아침이나 늦은 밤 시간에 간단한 일일 카드를 뽑아보세요'
    });
  }

  return recommendations;
}

/**
 * 기간별 비교 분석
 */
async function generatePeriodComparison(userId: string) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const [lastMonthData, thisMonthData] = await Promise.all([
    generatePeriodSummary(userId, lastMonth, thisMonth),
    generatePeriodSummary(userId, thisMonth, now)
  ]);

  return {
    current: thisMonthData,
    previous: lastMonthData,
    comparison: {
      readingCountChange: thisMonthData.totalReadings - lastMonthData.totalReadings,
      satisfactionChange: thisMonthData.averageSatisfaction - lastMonthData.averageSatisfaction,
      diversityChange: thisMonthData.uniqueCards - lastMonthData.uniqueCards,
      newThemes: thisMonthData.themes.filter(theme => 
        !lastMonthData.themes.includes(theme)
      ),
      insights: generateComparisonInsights(lastMonthData, thisMonthData)
    }
  };
}

/**
 * 전체 개요 분석
 */
async function generateOverviewAnalysis(userId: string, startDate: Date, endDate: Date) {
  const snapshot = await db.collection('users')
    .doc(userId)
    .collection('tarotReadings')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const readings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  }));

  return {
    summary: {
      totalReadings: readings.length,
      averagePerWeek: readings.length / Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
      uniqueCards: new Set(readings.flatMap((r: EnhancedTarotReading) => r.cards?.map((c: ReadingCard) => c.cardId) || [])).size,
      averageSatisfaction: readings
        .filter((r: EnhancedTarotReading) => r.satisfaction)
        .reduce((sum: number, r: EnhancedTarotReading) => sum + (r.satisfaction || 0), 0) / 
        readings.filter((r: EnhancedTarotReading) => r.satisfaction).length || 0
    },
    topInsights: generateTopInsights(readings),
    growthHighlights: generateGrowthHighlights(readings),
    nextSteps: generateNextSteps(readings)
  };
}

// 헬퍼 함수들
function categorizeQuestion(question: string): string {
  const lowerQ = question.toLowerCase();
  if (lowerQ.includes('사랑') || lowerQ.includes('연애') || lowerQ.includes('관계')) return '사랑과 관계';
  if (lowerQ.includes('직업') || lowerQ.includes('일') || lowerQ.includes('커리어')) return '직업과 커리어';
  if (lowerQ.includes('건강') || lowerQ.includes('몸') || lowerQ.includes('컨디션')) return '건강과 웰빙';
  if (lowerQ.includes('돈') || lowerQ.includes('재정') || lowerQ.includes('투자')) return '재정과 물질';
  if (lowerQ.includes('가족') || lowerQ.includes('부모') || lowerQ.includes('자녀')) return '가족과 가정';
  if (lowerQ.includes('성장') || lowerQ.includes('발전') || lowerQ.includes('배움')) return '개인 성장';
  if (lowerQ.includes('미래') || lowerQ.includes('앞으로') || lowerQ.includes('계획')) return '미래와 계획';
  return '일반적 질문';
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['좋', '행복', '성공', '발전', '희망', '기쁨'];
  const negativeWords = ['나쁘', '슬프', '실패', '걱정', '두려', '불안'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractKeywords(text: string): string[] {
  // 간단한 키워드 추출 (실제로는 더 정교한 NLP 필요)
  const words = text.split(' ').filter(word => word.length > 2);
  return words.slice(0, 5);
}

function getMostCommonContext(contexts: string[]): string {
  if (contexts.length === 0) return '';
  return contexts[0]; // 간단히 첫 번째 컨텍스트 반환
}

function getMostCommonSentiment(sentiments: string[]): 'positive' | 'neutral' | 'negative' {
  const counts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as 'positive' | 'neutral' | 'negative';
}

// 나머지 헬퍼 함수들은 간단히 구현
async function generatePeriodAnalysis(userId: string) {
  return {
    thisWeek: { totalReadings: 0, uniqueCards: 0, mostFrequentCard: '', averageSatisfaction: 0, dominantThemes: [], growthInsights: [] },
    thisMonth: { totalReadings: 0, uniqueCards: 0, mostFrequentCard: '', averageSatisfaction: 0, dominantThemes: [], growthInsights: [] },
    thisYear: { totalReadings: 0, uniqueCards: 0, mostFrequentCard: '', averageSatisfaction: 0, dominantThemes: [], growthInsights: [] },
    allTime: { totalReadings: 0, uniqueCards: 0, mostFrequentCard: '', averageSatisfaction: 0, dominantThemes: [], growthInsights: [] }
  };
}

function generateTimelineAnalysis(readings: EnhancedTarotReading[]) { return []; }
function calculateSkillProgression(readings: EnhancedTarotReading[]) { return {}; }
function analyzeInsightEvolution(readings: EnhancedTarotReading[]) { return []; }
function trackThematicJourney(readings: EnhancedTarotReading[]) { return []; }
function generateMilestones(readings: EnhancedTarotReading[]) { return []; }
function generateGrowthProjections(readings: EnhancedTarotReading[]) { return {}; }
async function generatePeriodSummary(userId: string, start: Date, end: Date): Promise<ReadingSummary> { 
  return { 
    totalReadings: 0, 
    averageSatisfaction: 0, 
    uniqueCards: 0, 
    themes: [],
    mostFrequentCard: '',
    dominantThemes: [],
    growthInsights: []
  }; 
}
function generateComparisonInsights(prev: ReadingSummary, curr: ReadingSummary) { return []; }
function generateTopInsights(readings: EnhancedTarotReading[]) { return []; }
function generateGrowthHighlights(readings: EnhancedTarotReading[]) { return []; }
function generateNextSteps(readings: EnhancedTarotReading[]) { return []; }