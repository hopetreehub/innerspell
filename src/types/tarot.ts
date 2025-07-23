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