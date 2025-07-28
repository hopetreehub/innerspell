import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  ReadingHistoryFilter, 
  ReadingHistoryResponse, 
  ReadingAnalytics,
  EnhancedTarotReading 
} from '@/types/tarot';
import { db } from '@/lib/firebase/admin';

/**
 * 사용자 리딩 히스토리 조회 API
 * GET /api/reading/history
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '인증이 필요합니다' }, 
        { status: 401 }
      );
    }

    // 사용자 인증 확인
    const decodedToken = await fetch('http://localhost:4000/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionCookie })
    }).then(res => res.json());

    if (!decodedToken.success) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다' }, 
        { status: 401 }
      );
    }

    const userId = decodedToken.user.uid;
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // 필터 파라미터
    const filters: ReadingHistoryFilter = {
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
        start: new Date(searchParams.get('startDate')!),
        end: new Date(searchParams.get('endDate')!)
      } : undefined,
      spreadTypes: searchParams.get('spreads')?.split(','),
      cards: searchParams.get('cards')?.split(','),
      tags: searchParams.get('tags')?.split(','),
      mood: searchParams.get('mood')?.split(','),
      satisfaction: searchParams.get('minSatisfaction') && searchParams.get('maxSatisfaction') ? {
        min: parseInt(searchParams.get('minSatisfaction')!),
        max: parseInt(searchParams.get('maxSatisfaction')!)
      } : undefined,
      searchQuery: searchParams.get('q') || undefined
    };

    // Firestore 쿼리 구성
    let query = db.collection('users').doc(userId).collection('tarotReadings');

    // 날짜 필터 적용
    if (filters.dateRange) {
      query = query
        .where('createdAt', '>=', filters.dateRange.start)
        .where('createdAt', '<=', filters.dateRange.end);
    }

    // 스프레드 타입 필터
    if (filters.spreadTypes && filters.spreadTypes.length > 0) {
      query = query.where('spreadType', 'in', filters.spreadTypes);
    }

    // 만족도 필터
    if (filters.satisfaction) {
      query = query
        .where('satisfaction', '>=', filters.satisfaction.min)
        .where('satisfaction', '<=', filters.satisfaction.max);
    }

    // 태그 필터 (배열 필드에서 검색)
    if (filters.tags && filters.tags.length > 0) {
      query = query.where('tags', 'array-contains-any', filters.tags);
    }

    // 정렬 및 페이징
    query = query.orderBy('createdAt', 'desc');
    
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const startAfterDoc = await query.limit(offset).get();
      if (!startAfterDoc.empty) {
        const lastDoc = startAfterDoc.docs[startAfterDoc.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();
    
    // 데이터 변환
    const readings: EnhancedTarotReading[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as EnhancedTarotReading;
    });

    // 검색어 필터링 (클라이언트 사이드 - 성능상 제한적)
    let filteredReadings = readings;
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filteredReadings = readings.filter(reading => 
        reading.question.toLowerCase().includes(searchLower) ||
        reading.interpretation.toLowerCase().includes(searchLower) ||
        reading.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 카드 필터링
    if (filters.cards && filters.cards.length > 0) {
      filteredReadings = filteredReadings.filter(reading =>
        reading.cards.some(card => filters.cards!.includes(card.cardId))
      );
    }

    // 기분 필터링
    if (filters.mood && filters.mood.length > 0) {
      filteredReadings = filteredReadings.filter(reading =>
        reading.mood && filters.mood!.includes(reading.mood)
      );
    }

    // 전체 카운트 계산 (간단한 추정)
    const totalCountSnapshot = await db.collection('users')
      .doc(userId)
      .collection('tarotReadings')
      .count()
      .get();
    
    const total = totalCountSnapshot.data().count;

    // 응답 데이터 구성
    const response: ReadingHistoryResponse = {
      readings: filteredReadings,
      total,
      page,
      limit,
      filters
    };

    // 분석 데이터 포함 요청 시
    if (includeAnalytics) {
      response.analytics = await generateAnalytics(userId);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching reading history:', error);
    return NextResponse.json(
      { error: '리딩 히스토리를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * 사용자의 리딩 분석 데이터 생성
 */
async function generateAnalytics(userId: string): Promise<ReadingAnalytics> {
  try {
    // 최근 한 달과 전체 리딩 데이터 조회
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [allReadingsSnapshot, recentReadingsSnapshot] = await Promise.all([
      db.collection('users').doc(userId).collection('tarotReadings')
        .orderBy('createdAt', 'desc')
        .limit(1000)
        .get(),
      db.collection('users').doc(userId).collection('tarotReadings')
        .where('createdAt', '>=', oneMonthAgo)
        .get()
    ]);

    const allReadings = allReadingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as EnhancedTarotReading[];

    const recentReadings = recentReadingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as EnhancedTarotReading[];

    // 카드 빈도 분석
    const cardFrequency = new Map<string, number>();
    const spreadFrequency = new Map<string, number>();
    const moodDistribution: { [mood: string]: number } = {};
    const timeDistribution: { [hour: string]: number } = {};
    const themes: { [theme: string]: number } = {};

    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    allReadings.forEach(reading => {
      // 카드 빈도
      reading.cards.forEach(card => {
        cardFrequency.set(card.cardId, (cardFrequency.get(card.cardId) || 0) + 1);
      });

      // 스프레드 빈도
      spreadFrequency.set(reading.spreadType, (spreadFrequency.get(reading.spreadType) || 0) + 1);

      // 기분 분포
      if (reading.mood) {
        moodDistribution[reading.mood] = (moodDistribution[reading.mood] || 0) + 1;
      }

      // 시간 분포
      const hour = reading.createdAt.getHours().toString();
      timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;

      // 만족도 평균
      if (reading.satisfaction) {
        totalSatisfaction += reading.satisfaction;
        satisfactionCount++;
      }

      // 태그/테마 분포
      reading.tags?.forEach(tag => {
        themes[tag] = (themes[tag] || 0) + 1;
      });
    });

    // 상위 카드들
    const topCards = Array.from(cardFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([cardId, count]) => ({
        cardId,
        card: {} as any, // 실제로는 카드 정보를 조회해야 함
        count,
        lastAppeared: new Date(),
        orientation: { upright: 0, reversed: 0 },
        averageContext: ''
      }));

    // 상위 스프레드들
    const topSpreads = Array.from(spreadFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([spreadType, count]) => ({
        spreadType,
        count,
        lastUsed: new Date(),
        averageSatisfaction: 0
      }));

    // 성장 지표
    const growth = {
      readingStreak: calculateReadingStreak(allReadings),
      diversityScore: calculateDiversityScore(allReadings),
      insightDepth: calculateInsightDepth(allReadings),
      selfReflection: calculateSelfReflectionScore(allReadings),
      progressNotes: []
    };

    const analytics: ReadingAnalytics = {
      totalReadings: allReadings.length,
      readingsThisMonth: recentReadings.length,
      averageSatisfaction: satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0,
      topCards,
      topSpreads,
      moodDistribution,
      timeDistribution,
      themes,
      growth
    };

    return analytics;

  } catch (error) {
    console.error('Error generating analytics:', error);
    // 기본값 반환
    return {
      totalReadings: 0,
      readingsThisMonth: 0,
      averageSatisfaction: 0,
      topCards: [],
      topSpreads: [],
      moodDistribution: {},
      timeDistribution: {},
      themes: {},
      growth: {
        readingStreak: 0,
        diversityScore: 0,
        insightDepth: 0,
        selfReflection: 0,
        progressNotes: []
      }
    };
  }
}

// 헬퍼 함수들
function calculateReadingStreak(readings: EnhancedTarotReading[]): number {
  if (readings.length === 0) return 0;
  
  const sortedReadings = readings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  let streak = 1;
  let currentDate = new Date(sortedReadings[0].createdAt);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < sortedReadings.length; i++) {
    const readingDate = new Date(sortedReadings[i].createdAt);
    readingDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - readingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = readingDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
}

function calculateDiversityScore(readings: EnhancedTarotReading[]): number {
  if (readings.length === 0) return 0;
  
  const uniqueCards = new Set<string>();
  const uniqueSpreads = new Set<string>();
  
  readings.forEach(reading => {
    reading.cards.forEach(card => uniqueCards.add(card.cardId));
    uniqueSpreads.add(reading.spreadType);
  });
  
  // 78장 카드 중에서 몇 장을 사용했는지, 스프레드 다양성 등을 고려
  const cardDiversity = Math.min(uniqueCards.size / 78, 1);
  const spreadDiversity = Math.min(uniqueSpreads.size / 10, 1); // 가정: 10가지 스프레드
  
  return Math.round((cardDiversity * 0.7 + spreadDiversity * 0.3) * 100);
}

function calculateInsightDepth(readings: EnhancedTarotReading[]): number {
  if (readings.length === 0) return 0;
  
  // 질문의 복잡성, 해석의 길이, 후속 노트 등을 고려
  let totalScore = 0;
  
  readings.forEach(reading => {
    let score = 0;
    
    // 질문 복잡성 (길이와 내용으로 간단히 판단)
    if (reading.question.length > 20) score += 1;
    if (reading.question.includes('왜') || reading.question.includes('어떻게')) score += 1;
    
    // 해석 길이
    if (reading.interpretation.length > 500) score += 1;
    if (reading.interpretation.length > 1000) score += 1;
    
    // 후속 노트 존재
    if (reading.followUp && reading.followUp.length > 0) score += 1;
    
    // 태그 사용
    if (reading.tags && reading.tags.length > 0) score += 1;
    
    totalScore += Math.min(score / 6, 1); // 정규화
  });
  
  return Math.round((totalScore / readings.length) * 100);
}

function calculateSelfReflectionScore(readings: EnhancedTarotReading[]): number {
  if (readings.length === 0) return 0;
  
  // 자기성찰 관련 키워드 체크, 정기적 리딩 패턴 등
  const reflectionKeywords = ['나', '내', '자신', '성장', '변화', '배움', '깨달음'];
  let reflectionCount = 0;
  
  readings.forEach(reading => {
    const text = (reading.question + ' ' + reading.interpretation + ' ' + (reading.followUp || '')).toLowerCase();
    if (reflectionKeywords.some(keyword => text.includes(keyword))) {
      reflectionCount++;
    }
  });
  
  return Math.round((reflectionCount / readings.length) * 100);
}