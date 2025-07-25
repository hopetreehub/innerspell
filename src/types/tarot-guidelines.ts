// 타로 지침 시스템 타입 정의

export interface TarotSpread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'past-present-future' | 'relationship' | 'decision' | 'spiritual' | 'comprehensive';
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'situational';
}

export interface SpreadPosition {
  id: string;
  name: string;
  description: string;
  x: number; // 화면상 위치 (%)
  y: number;
  order: number;
}

export interface InterpretationStyle {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  approach: 'traditional' | 'psychological' | 'spiritual' | 'intuitive' | 'modern';
  deckType: 'rws' | 'thoth' | 'marseille' | 'universal' | 'modern' | 'any';
  philosophy: string;
  keyPrinciples: string[];
}

export interface TarotGuideline {
  id: string;
  spreadId: string;
  styleId: string;
  name: string;
  description: string;
  positionGuidelines: PositionGuideline[];
  generalApproach: string;
  keyFocusAreas: string[];
  interpretationTips: string[];
  commonPitfalls: string[];
  exampleReading?: ExampleReading;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PositionGuideline {
  positionId: string;
  positionName: string;
  interpretationFocus: string;
  keyQuestions: string[];
  styleSpecificNotes: string;
  timeframe?: string;
  emotionalAspects?: string;
  practicalAspects?: string;
}

export interface ExampleReading {
  scenario: string;
  cards: ExampleCard[];
  interpretation: string;
  keyInsights: string[];
}

export interface ExampleCard {
  positionId: string;
  cardName: string;
  cardMeaning: string;
  interpretation: string;
}

// 타로 덱 타입별 특성
export interface DeckCharacteristics {
  deckType: 'rws' | 'thoth' | 'marseille' | 'universal' | 'modern';
  name: string;
  description: string;
  symbolism: string[];
  interpretationFocus: string;
  strengthAreas: string[];
  bestFor: string[];
  colorPsychology?: string;
  artisticStyle?: string;
}

// 스프레드와 스타일 조합별 특별 지침
export interface SpreadStyleCombination {
  spreadId: string;
  styleId: string;
  specialNotes: string;
  modifiedPositions?: PositionModification[];
  additionalConsiderations: string[];
  recommendedFor: string[];
  notRecommendedFor: string[];
}

export interface PositionModification {
  positionId: string;
  modifiedFocus: string;
  reason: string;
}

// 관리자 설정용 타입
export interface TarotGuidelineSettings {
  defaultSpread: string;
  defaultStyle: string;
  enabledSpreads: string[];
  enabledStyles: string[];
  customGuidelines: TarotGuideline[];
  systemGuidelines: TarotGuideline[];
  lastUpdated: Date;
}

// API 응답 타입
export interface TarotGuidelinesResponse {
  success: boolean;
  data?: {
    spreads: TarotSpread[];
    styles: InterpretationStyle[];
    guidelines: TarotGuideline[];
    combinations: SpreadStyleCombination[];
  };
  message?: string;
}

export interface SaveGuidelineRequest {
  guideline: Omit<TarotGuideline, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateGuidelineRequest {
  id: string;
  updates: Partial<TarotGuideline>;
}