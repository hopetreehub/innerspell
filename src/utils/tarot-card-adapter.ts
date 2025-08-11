import { TarotCard as NewTarotCard } from '@/types/tarot';
import { TarotCard as OldTarotCard } from '@/data/tarot-cards';

// TarotCardDetail이 기대하는 확장된 타입
export interface ExtendedOldTarotCard extends OldTarotCard {
  meaning?: {
    upright: string;
    reversed: string;
  };
  meaningDetailed?: {
    upright: string;
    reversed: string;
  };
  love?: {
    upright: string;
    reversed: string;
  };
  career?: {
    upright: string;
    reversed: string;
  };
  health?: {
    upright: string;
    reversed: string;
  };
  advice?: {
    upright: string;
    reversed: string;
  };
  keywords?: {
    upright: string[];
    reversed: string[];
  };
}

/**
 * 새로운 타로카드 타입을 기존 타로카드 타입으로 변환
 */
export function adaptNewToOldCard(newCard: NewTarotCard): ExtendedOldTarotCard {
  return {
    id: newCard.id,
    name: newCard.nameKorean,
    nameEn: newCard.name,
    suit: (newCard.suit || 'major') as 'major' | 'wands' | 'cups' | 'swords' | 'pentacles',
    number: newCard.number,
    type: newCard.arcana === 'major' ? 'major' : 
          newCard.number && newCard.number <= 10 ? 'pip' : 'court',
    keywords: [...(newCard.keywords?.upright || []), ...(newCard.keywords?.reversed || [])],
    upright: {
      meaning: newCard.meaningDetailed.upright || newCard.meaningShort.upright,
      love: newCard.love.upright,
      career: newCard.career.upright,
      health: newCard.health.upright,
      advice: newCard.advice.upright
    },
    reversed: {
      meaning: newCard.meaningDetailed.reversed || newCard.meaningShort.reversed,
      love: newCard.love.reversed,
      career: newCard.career.reversed,
      health: newCard.health.reversed,
      advice: newCard.advice.reversed
    },
    description: newCard.meaningShort.upright,
    symbolism: newCard.symbolism,
    numerology: newCard.numerology?.toString(),
    astrology: newCard.zodiac,
    element: newCard.element as 'fire' | 'water' | 'air' | 'earth' | undefined,
    planet: newCard.planet,
    zodiac: newCard.zodiac,
    image: newCard.imageUrl,
    featured: false,
    // 새로운 필드들 추가
    meaning: {
      upright: newCard.meaningShort.upright,
      reversed: newCard.meaningShort.reversed
    },
    meaningDetailed: {
      upright: newCard.meaningDetailed.upright,
      reversed: newCard.meaningDetailed.reversed
    },
    love: newCard.love,
    career: newCard.career,
    health: newCard.health,
    advice: newCard.advice,
    keywords: newCard.keywords
  };
}

/**
 * 기존 타로카드 타입을 새로운 타로카드 타입으로 변환
 */
export function adaptOldToNewCard(oldCard: OldTarotCard): NewTarotCard {
  return {
    id: oldCard.id,
    number: oldCard.number,
    name: oldCard.nameEn,
    nameKorean: oldCard.name,
    arcana: oldCard.suit === 'major' ? 'major' : 'minor',
    suit: oldCard.suit === 'major' ? null : oldCard.suit,
    element: oldCard.element,
    planet: oldCard.planet,
    zodiac: oldCard.zodiac,
    numerology: oldCard.numerology ? parseInt(oldCard.numerology) : undefined,
    keywords: {
      upright: oldCard.keywords.filter((_, i) => i % 2 === 0),
      reversed: oldCard.keywords.filter((_, i) => i % 2 === 1)
    },
    meaningShort: {
      upright: oldCard.description || oldCard.upright.meaning,
      reversed: oldCard.reversed.meaning
    },
    meaningDetailed: {
      upright: oldCard.upright.meaning,
      reversed: oldCard.reversed.meaning
    },
    symbolism: oldCard.symbolism,
    imageUrl: oldCard.image,
    imageDescription: '',
    relatedCards: [],
    questions: [],
    affirmations: {
      upright: '',
      reversed: ''
    },
    advice: {
      upright: oldCard.upright.advice,
      reversed: oldCard.reversed.advice
    },
    love: {
      upright: oldCard.upright.love,
      reversed: oldCard.reversed.love
    },
    career: {
      upright: oldCard.upright.career,
      reversed: oldCard.reversed.career
    },
    health: {
      upright: oldCard.upright.health,
      reversed: oldCard.reversed.health
    },
    spirituality: {
      upright: '',
      reversed: ''
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}