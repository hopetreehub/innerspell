// 타로 카드 관련 타입 정의

export type CardArcana = 'major' | 'minor';
export type CardSuit = 'wands' | 'cups' | 'swords' | 'pentacles' | null;
export type CardOrientation = 'upright' | 'reversed';

export interface TarotCard {
  id: string;
  number: number | null; // null for court cards
  name: string;
  nameKorean: string;
  arcana: CardArcana;
  suit: CardSuit;
  element?: string; // Fire, Water, Air, Earth
  planet?: string;
  zodiac?: string;
  numerology?: number;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  meaningShort: {
    upright: string;
    reversed: string;
  };
  meaningDetailed: {
    upright: string;
    reversed: string;
  };
  symbolism: string[];
  imageUrl: string;
  imageDescription: string;
  relatedCards: string[]; // Card IDs
  questions: string[];
  affirmations: {
    upright: string;
    reversed: string;
  };
  advice: {
    upright: string;
    reversed: string;
  };
  love: {
    upright: string;
    reversed: string;
  };
  career: {
    upright: string;
    reversed: string;
  };
  health: {
    upright: string;
    reversed: string;
  };
  spirituality: {
    upright: string;
    reversed: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TarotReading {
  id: string;
  userId?: string;
  question: string;
  spreadType: string;
  cards: ReadingCard[];
  interpretation: string;
  createdAt: Date;
}

export interface ReadingCard {
  cardId: string;
  position: string;
  orientation: CardOrientation;
  meaning: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  nameKorean: string;
  description: string;
  positions: SpreadPosition[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl?: string;
}

export interface SpreadPosition {
  id: string;
  name: string;
  nameKorean: string;
  description: string;
  x: number; // Position coordinates for display
  y: number;
}

// 필터링 및 검색용 인터페이스
export interface TarotCardFilter {
  arcana?: CardArcana;
  suit?: CardSuit;
  element?: string;
  keyword?: string;
  number?: number;
}

export interface TarotCardSearchResult {
  cards: TarotCard[];
  total: number;
  page: number;
  limit: number;
}

// 카드 해석 컨텍스트
export interface CardInterpretationContext {
  position?: string;
  question?: string;
  otherCards?: TarotCard[];
  readingType?: string;
}

// 메이저 아르카나 여정 단계
export interface MajorArcanaJourney {
  stage: string;
  cards: string[]; // Card IDs
  theme: string;
  description: string;
}

// 마이너 아르카나 수트 정보
export interface SuitInfo {
  name: string;
  nameKorean: string;
  element: string;
  themes: string[];
  description: string;
  imageUrl: string;
}

// 카드 통계 및 분석
export interface CardStats {
  cardId: string;
  viewCount: number;
  readingCount: number;
  lastViewed: Date;
  popularKeywords: string[];
}

// 리딩 히스토리 및 분석을 위한 확장된 타입들
export interface EnhancedTarotReading {
  id: string;
  userId: string;
  question: string;
  spreadType: string;
  cards: ReadingCard[];
  interpretation: string;
  interpretationMethod: string; // 해석 방식 (AI, manual, etc.)
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  mood?: string; // 질문 시 사용자 감정 상태
  satisfaction?: number; // 1-5 평점
  followUp?: string; // 후속 노트
  isPrivate: boolean;
  shareId?: string; // 공유용 ID
  metadata?: ReadingMetadata;
}

export interface ReadingMetadata {
  duration?: number; // 리딩에 소요된 시간 (초)
  device?: string; // 사용 기기
  location?: string; // 일반적 위치 (국가/도시)
  aiProvider?: string; // 사용된 AI 제공업체
  version?: string; // 앱 버전
}

// 리딩 패턴 분석
export interface ReadingPattern {
  userId: string;
  frequentCards: CardFrequency[];
  preferredSpreads: SpreadFrequency[];
  questionCategories: CategoryFrequency[];
  readingTimes: TimePattern[];
  moodPatterns: MoodPattern[];
  periodAnalysis: PeriodAnalysis;
}

export interface CardFrequency {
  cardId: string;
  card: TarotCard;
  count: number;
  lastAppeared: Date;
  orientation: {
    upright: number;
    reversed: number;
  };
  averageContext: string; // 주로 나타나는 맥락
}

export interface SpreadFrequency {
  spreadType: string;
  count: number;
  lastUsed: Date;
  averageSatisfaction?: number;
}

export interface CategoryFrequency {
  category: string;
  count: number;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface TimePattern {
  hour: number;
  count: number;
  averageMood?: string;
}

export interface MoodPattern {
  mood: string;
  count: number;
  frequentCards: string[];
  outcomes: string[];
}

export interface PeriodAnalysis {
  thisWeek: ReadingSummary;
  thisMonth: ReadingSummary;
  thisYear: ReadingSummary;
  allTime: ReadingSummary;
}

export interface ReadingSummary {
  totalReadings: number;
  uniqueCards: number;
  mostFrequentCard: string;
  averageSatisfaction: number;
  dominantThemes: string[];
  growthInsights: string[];
}

// 리딩 히스토리 필터 및 검색
export interface ReadingHistoryFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  spreadTypes?: string[];
  cards?: string[];
  tags?: string[];
  mood?: string[];
  satisfaction?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

export interface ReadingHistoryResponse {
  readings: EnhancedTarotReading[];
  total: number;
  page: number;
  limit: number;
  filters: ReadingHistoryFilter;
  analytics?: ReadingAnalytics;
}

// 리딩 분석 데이터
export interface ReadingAnalytics {
  totalReadings: number;
  readingsThisMonth: number;
  averageSatisfaction: number;
  topCards: CardFrequency[];
  topSpreads: SpreadFrequency[];
  moodDistribution: { [mood: string]: number };
  timeDistribution: { [hour: string]: number };
  themes: { [theme: string]: number };
  growth: GrowthMetrics;
}

export interface GrowthMetrics {
  readingStreak: number; // 연속 리딩 일수
  diversityScore: number; // 카드/스프레드 다양성 점수
  insightDepth: number; // 질문의 깊이 점수
  selfReflection: number; // 자기성찰 점수
  progressNotes: ProgressNote[];
}

export interface ProgressNote {
  date: Date;
  milestone: string;
  description: string;
  relatedReadings: string[];
}

// 리딩 공유 및 커뮤니티
export interface SharedReading {
  id: string;
  shareId: string;
  originalReadingId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  title: string;
  description?: string;
  reading: EnhancedTarotReading;
  likes: number;
  views: number;
  comments: Comment[];
  createdAt: Date;
  isPublic: boolean;
  tags: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies?: Comment[];
}

// 리딩 추천 시스템
export interface ReadingRecommendation {
  type: 'card' | 'spread' | 'question' | 'time';
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  relatedReadings: string[];
  suggestedAction?: string;
}