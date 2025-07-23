import { TarotCard } from '@/types/tarot';
import { allMajorArcanaCards } from './all-major-arcana';
import { wandsCards } from './minor-arcana-wands';
import { cupsCards } from './minor-arcana-cups';
import { swordsCards } from './minor-arcana-swords';
import { pentaclesCards } from './minor-arcana-pentacles';

// 모든 타로 카드 (78장) 통합
export const allTarotCards: TarotCard[] = [
  ...allMajorArcanaCards,    // 22장
  ...wandsCards,             // 14장
  ...cupsCards,              // 14장
  ...swordsCards,            // 14장
  ...pentaclesCards,         // 14장
];

// 메이저 아르카나만 (22장)
export const majorArcanaCards = allMajorArcanaCards;

// 마이너 아르카나만 (56장)
export const minorArcanaCards: TarotCard[] = [
  ...wandsCards,
  ...cupsCards,
  ...swordsCards,
  ...pentaclesCards,
];

// 수트별 카드들
export const minorArcanaBySuit = {
  wands: wandsCards,
  cups: cupsCards,
  swords: swordsCards,
  pentacles: pentaclesCards,
};

// 카드 검색 헬퍼 함수
export const findCardById = (id: string): TarotCard | undefined => {
  return allTarotCards.find(card => card.id === id);
};

export const getCardsByArcana = (arcana: 'major' | 'minor'): TarotCard[] => {
  return allTarotCards.filter(card => card.arcana === arcana);
};

export const getCardsBySuit = (suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCard[] => {
  return allTarotCards.filter(card => card.suit === suit);
};

// 통계 정보
export const tarotStats = {
  total: allTarotCards.length,
  majorArcana: majorArcanaCards.length,
  minorArcana: minorArcanaCards.length,
  suits: {
    wands: wandsCards.length,
    cups: cupsCards.length,
    swords: swordsCards.length,
    pentacles: pentaclesCards.length,
  }
};