import { TarotCard } from '@/types/tarot';
import { majorArcanaCards } from './major-arcana';
import { majorArcanaCardsPart2 } from './major-arcana-part2';
import { majorArcanaCardsPart3 } from './major-arcana-part3';

// 모든 메이저 아르카나 카드를 통합
export const allMajorArcanaCards: TarotCard[] = [
  ...majorArcanaCards,
  ...majorArcanaCardsPart2,
  ...majorArcanaCardsPart3
];

// 카드 ID로 특정 카드 찾기
export function getMajorArcanaCardById(id: string): TarotCard | undefined {
  return allMajorArcanaCards.find(card => card.id === id);
}

// 번호로 카드 찾기
export function getMajorArcanaCardByNumber(number: number): TarotCard | undefined {
  return allMajorArcanaCards.find(card => card.number === number);
}

// 키워드로 카드 검색
export function searchMajorArcanaCards(keyword: string): TarotCard[] {
  const lowerKeyword = keyword.toLowerCase();
  return allMajorArcanaCards.filter(card => 
    card.name.toLowerCase().includes(lowerKeyword) ||
    card.nameKorean.includes(keyword) ||
    card.keywords.upright.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    card.keywords.reversed.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    card.meaningShort.upright.toLowerCase().includes(lowerKeyword) ||
    card.meaningShort.reversed.toLowerCase().includes(lowerKeyword)
  );
}

// 메이저 아르카나 여정 단계
export const majorArcanaJourney = [
  {
    stage: "시작과 잠재력 (0-6)",
    cards: ["major-00-fool", "major-01-magician", "major-02-high-priestess", "major-03-empress", "major-04-emperor", "major-05-hierophant", "major-06-lovers"],
    theme: "개인적 정체성과 기본 구조 형성",
    description: "자아 발견과 기본적인 인생 구조를 세우는 단계"
  },
  {
    stage: "도전과 성장 (7-13)",
    cards: ["major-07-chariot", "major-08-strength", "major-09-hermit", "major-10-wheel-of-fortune", "major-11-justice", "major-12-hanged-man", "major-13-death"],
    theme: "시련을 통한 성장과 변화",
    description: "어려움을 극복하고 진정한 힘을 찾아가는 단계"
  },
  {
    stage: "통합과 완성 (14-21)",
    cards: ["major-14-temperance", "major-15-devil", "major-16-tower", "major-17-star", "major-18-moon", "major-19-sun", "major-20-judgement", "major-21-world"],
    theme: "영적 각성과 완성",
    description: "깨달음을 통해 완전함에 도달하는 최종 단계"
  }
];

// 카드의 점성술적 대응
export const astrologicalCorrespondences = {
  "major-00-fool": { planet: "Uranus", zodiac: "Aquarius", element: "Air" },
  "major-01-magician": { planet: "Mercury", zodiac: "Gemini", element: "Mercury" },
  "major-02-high-priestess": { planet: "Moon", zodiac: "Cancer", element: "Water" },
  "major-03-empress": { planet: "Venus", zodiac: "Taurus/Libra", element: "Earth" },
  "major-04-emperor": { planet: "Mars", zodiac: "Aries", element: "Fire" },
  "major-05-hierophant": { planet: "Venus", zodiac: "Taurus", element: "Earth" },
  "major-06-lovers": { planet: "Mercury", zodiac: "Gemini", element: "Air" },
  "major-07-chariot": { planet: "Moon", zodiac: "Cancer", element: "Water" },
  "major-08-strength": { planet: "Sun", zodiac: "Leo", element: "Fire" },
  "major-09-hermit": { planet: "Mercury", zodiac: "Virgo", element: "Earth" },
  "major-10-wheel-of-fortune": { planet: "Jupiter", zodiac: "Sagittarius", element: "Fire" },
  "major-11-justice": { planet: "Venus", zodiac: "Libra", element: "Air" },
  "major-12-hanged-man": { planet: "Neptune", zodiac: "Pisces", element: "Water" },
  "major-13-death": { planet: "Pluto", zodiac: "Scorpio", element: "Water" },
  "major-14-temperance": { planet: "Jupiter", zodiac: "Sagittarius", element: "Fire" },
  "major-15-devil": { planet: "Saturn", zodiac: "Capricorn", element: "Earth" },
  "major-16-tower": { planet: "Mars", zodiac: "Aries", element: "Fire" },
  "major-17-star": { planet: "Uranus", zodiac: "Aquarius", element: "Air" },
  "major-18-moon": { planet: "Moon", zodiac: "Pisces", element: "Water" },
  "major-19-sun": { planet: "Sun", zodiac: "Leo", element: "Fire" },
  "major-20-judgement": { planet: "Pluto", zodiac: "Scorpio", element: "Fire" },
  "major-21-world": { planet: "Saturn", zodiac: "Capricorn", element: "Earth" }
};

// 카드 간 관계성 매핑
export const cardRelationships = {
  opposites: [
    ["major-01-magician", "major-02-high-priestess"], // 의식 vs 무의식
    ["major-03-empress", "major-04-emperor"], // 여성성 vs 남성성
    ["major-06-lovers", "major-15-devil"], // 진정한 사랑 vs 집착
    ["major-17-star", "major-18-moon"], // 희망 vs 환상
    ["major-19-sun", "major-18-moon"], // 의식 vs 무의식
  ],
  complementary: [
    ["major-00-fool", "major-21-world"], // 시작과 완성
    ["major-08-strength", "major-11-justice"], // 내적 힘과 외적 균형
    ["major-09-hermit", "major-05-hierophant"], // 개인적 vs 전통적 지혜
    ["major-13-death", "major-20-judgement"], // 변화와 각성
  ],
  sequential: [
    ["major-00-fool", "major-01-magician"], // 잠재력에서 실현으로
    ["major-12-hanged-man", "major-13-death"], // 기다림에서 변화로
    ["major-16-tower", "major-17-star"], // 파괴에서 희망으로
    ["major-19-sun", "major-20-judgement"], // 성취에서 각성으로
  ]
};

export default allMajorArcanaCards;