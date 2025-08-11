export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number | null; // null for court cards
  type: 'major' | 'pip' | 'court'; // pip = 숫자카드, court = 궁정카드
  keywords: string[];
  upright: {
    meaning: string;
    love: string;
    career: string;
    health: string;
    advice: string;
  };
  reversed: {
    meaning: string;
    love: string;
    career: string;
    health: string;
    advice: string;
  };
  description: string;
  symbolism: string[];
  numerology?: string;
  astrology?: string;
  element?: 'fire' | 'water' | 'air' | 'earth';
  planet?: string;
  zodiac?: string;
  image: string;
  featured: boolean;
}

// Major Arcana (메이저 아르카나) - 22장
export const majorArcana: TarotCard[] = [
  {
    id: 'the-fool',
    name: '바보',
    nameEn: 'The Fool',
    suit: 'major',
    number: 0,
    type: 'major',
    keywords: ['새로운 시작', '순수함', '모험', '자유', '무지', '경험'],
    upright: {
      meaning: '새로운 출발과 무한한 가능성. 순수한 마음으로 새로운 여행을 시작할 준비가 되어있음.',
      love: '새로운 연애의 시작이나 관계에서의 새로운 단계. 순수한 사랑과 설렘.',
      career: '새로운 직업이나 프로젝트의 시작. 창의적이고 혁신적인 접근이 필요.',
      health: '새로운 건강 루틴의 시작. 몸과 마음의 균형을 찾는 여정.',
      advice: '과거의 경험에 얽매이지 말고 열린 마음으로 새로운 기회를 받아들이세요.'
    },
    reversed: {
      meaning: '무모함, 경솔함, 방향성 부족. 충분한 준비 없이 성급하게 행동하는 경향.',
      love: '관계에서의 성급함이나 무책임함. 진지함이 부족한 상태.',
      career: '계획 없는 행동으로 인한 실패 가능성. 더 신중한 접근이 필요.',
      health: '건강에 대한 무관심이나 위험한 행동. 주의가 필요한 상태.',
      advice: '행동하기 전에 충분히 생각하고 계획을 세우세요. 무모함을 경계하세요.'
    },
    description: '바보는 타로의 여행을 시작하는 첫 번째 카드로, 무한한 가능성과 새로운 시작을 상징합니다. 절벽 끝에 서있지만 두려움 없이 앞으로 나아가는 모습은 신뢰와 순수한 믿음을 나타냅니다.',
    symbolism: [
      '흰 장미: 순수함과 열정',
      '작은 가방: 과거의 경험과 지혜',
      '하얀 개: 본능과 충성심',
      '노란 하늘: 의식과 깨달음',
      '절벽: 미지의 영역으로의 도약'
    ],
    numerology: '0번은 무한한 잠재력과 순환을 의미합니다. 시작과 끝이 만나는 지점.',
    astrology: '천왕성의 영향으로 혁신과 자유로움을 상징',
    element: 'air',
    planet: '천왕성',
    image: '/images/tarot/major/00-fool.jpg',
    featured: true
  },
  {
    id: 'the-magician',
    name: '마법사',
    nameEn: 'The Magician',
    suit: 'major',
    number: 1,
    type: 'major',
    keywords: ['의지력', '창조', '집중', '기술', '소통', '현실화'],
    upright: {
      meaning: '강한 의지력과 집중력으로 목표를 달성할 수 있는 능력. 창조적 에너지의 현실화.',
      love: '적극적인 구애와 매력적인 소통. 관계에서 주도권을 가지고 발전시킬 능력.',
      career: '리더십과 전문성을 발휘할 기회. 새로운 프로젝트나 사업의 성공 가능성.',
      health: '자기 치유 능력과 건강 관리에 대한 강한 의지. 몸과 마음의 균형.',
      advice: '당신의 능력을 믿고 목표를 향해 집중하세요. 의지력이 현실을 만듭니다.'
    },
    reversed: {
      meaning: '능력의 오용이나 목표 부족. 자신감 부족이나 에너지의 분산.',
      love: '관계에서의 조작이나 거짓말. 진실하지 못한 소통.',
      career: '기술 부족이나 집중력 결핍. 목표가 불분명한 상태.',
      health: '건강 관리 소홀이나 스트레스로 인한 불균형.',
      advice: '진정한 목표를 찾고 정직한 방법으로 능력을 발휘하세요.'
    },
    description: '마법사는 의지력과 창조력을 상징하는 카드입니다. 네 원소(불, 물, 공기, 땅)를 모두 다루며, 위와 아래를 연결하는 중재자 역할을 합니다.',
    symbolism: [
      '무한대 기호: 무한한 가능성',
      '지팡이: 의지력과 창조력',
      '네 원소 도구: 완전한 능력',
      '장미와 백합: 열정과 순수함의 조화',
      '빨간 외투: 열정과 행동력'
    ],
    numerology: '1번은 시작, 리더십, 개성을 의미합니다.',
    astrology: '수성의 영향으로 소통과 지성을 상징',
    element: 'air',
    planet: '수성',
    image: '/images/tarot/major/01-magician.jpg',
    featured: true
  },
  {
    id: 'the-high-priestess',
    name: '여교황',
    nameEn: 'The High Priestess',
    suit: 'major',
    number: 2,
    type: 'major',
    keywords: ['직감', '무의식', '신비', '내면의 지혜', '수동성', '비밀'],
    upright: {
      meaning: '직관과 내면의 지혜를 따르라는 메시지. 숨겨진 지식이나 무의식의 깨달음.',
      love: '깊은 감정적 연결과 영적 유대. 직관으로 상대방을 이해하는 능력.',
      career: '창의적이고 직관적인 접근이 필요. 연구나 상담 분야에서의 성공.',
      health: '몸의 신호에 귀 기울이고 내면의 치유력을 활용해야 함.',
      advice: '논리보다는 직감을 따르세요. 내면의 목소리에 귀 기울이세요.'
    },
    reversed: {
      meaning: '직관 무시, 감정적 불균형, 비밀이 드러남. 내면의 지혜와의 단절.',
      love: '감정적 거리감이나 소통 부족. 상대방의 마음을 읽지 못함.',
      career: '직감을 무시한 판단으로 인한 실수. 창의성 부족.',
      health: '스트레스나 감정적 불균형으로 인한 건강 문제.',
      advice: '내면의 목소리를 다시 듣고 감정의 균형을 찾으세요.'
    },
    description: '여교황은 무의식과 직관의 영역을 다스리는 신성한 여성성을 상징합니다. 베일 뒤의 신비로운 지혜와 달의 순환적 에너지를 대변합니다.',
    symbolism: [
      '베일: 숨겨진 지식과 신비',
      '달: 직관과 무의식',
      '물: 감정과 영성',
      '석류: 풍요와 여성성',
      '파란 옷: 평화와 영성'
    ],
    numerology: '2번은 이원성, 균형, 협력을 의미합니다.',
    astrology: '달의 영향으로 직감과 감정을 상징',
    element: 'water',
    planet: '달',
    image: '/images/tarot/major/02-high-priestess.jpg',
    featured: true
  }
];

// Wands (완드) - 불의 원소, 열정과 창조력
export const wands: TarotCard[] = [
  {
    id: 'ace-of-wands',
    name: '완드 에이스',
    nameEn: 'Ace of Wands',
    suit: 'wands',
    number: 1,
    type: 'pip',
    keywords: ['새로운 시작', '창조적 에너지', '영감', '열정', '기회'],
    upright: {
      meaning: '새로운 창조적 프로젝트나 열정적인 시작. 영감과 동기가 넘치는 상태.',
      love: '새로운 연애의 시작이나 관계에 새로운 활력. 열정적인 사랑.',
      career: '새로운 직업 기회나 창업. 창조적 프로젝트의 시작.',
      health: '에너지 증가와 활력. 새로운 운동이나 건강 루틴의 시작.',
      advice: '지금이 새로운 시작을 위한 완벽한 타이밍입니다.'
    },
    reversed: {
      meaning: '창조적 막힘, 에너지 부족, 기회를 놓침. 동기 부족.',
      love: '관계에서의 열정 부족이나 새로운 시작의 지연.',
      career: '프로젝트 지연이나 창의적 아이디어 부족.',
      health: '에너지 부족이나 의욕 상실.',
      advice: '내면의 열정을 다시 찾고 동기를 회복하세요.'
    },
    description: '완드 에이스는 창조적 에너지와 새로운 시작의 순수한 잠재력을 나타냅니다.',
    symbolism: ['완드: 창조력과 의지', '손: 신성한 선물', '구름: 영적 영감'],
    element: 'fire',
    image: '/images/tarot/wands/ace-of-wands.jpg',
    featured: false
  }
];

// 모든 카드를 통합하는 배열
export const allTarotCards: TarotCard[] = [
  ...majorArcana,
  ...wands,
  // 추후 cups, swords, pentacles 추가 예정
];

// 카드 검색 함수
export const findCardById = (id: string): TarotCard | undefined => {
  return allTarotCards.find(card => card.id === id);
};

// 수트별 카드 가져오기
export const getCardsBySuit = (suit: string): TarotCard[] => {
  return allTarotCards.filter(card => card.suit === suit);
};

// 추천 카드 가져오기
export const getFeaturedCards = (): TarotCard[] => {
  return allTarotCards.filter(card => card.featured);
};