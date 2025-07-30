import { TarotSpread, InterpretationStyle, DeckCharacteristics } from '@/types/tarot-guidelines';

// 기본 타로 스프레드 정의
export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: 'trinity-view',
    name: '삼위일체 조망 (Trinity View)',
    nameEn: 'Trinity View',
    description: '시간의 흐름에 따른 상황 분석과 미래 전망을 위한 기본 스프레드',
    cardCount: 3,
    positions: [
      {
        id: 'past',
        name: '과거',
        description: '현재 상황에 영향을 준 과거의 요인들',
        x: 20,
        y: 50,
        order: 1
      },
      {
        id: 'present',
        name: '현재',
        description: '지금 당신이 처한 상황과 현재의 에너지',
        x: 50,
        y: 50,
        order: 2
      },
      {
        id: 'future',
        name: '미래',
        description: '현재 방향대로 갔을 때의 결과와 가능성',
        x: 80,
        y: 50,
        order: 3
      }
    ],
    difficulty: 'beginner',
    category: 'past-present-future',
    timeFrame: 'situational'
  },
  {
    id: 'mind-body-spirit',
    name: '정신-몸-영혼',
    nameEn: 'Mind-Body-Spirit',
    description: '전인적 관점에서 현재 상태를 파악하는 홀리스틱 스프레드',
    cardCount: 3,
    positions: [
      {
        id: 'mind',
        name: '정신 (Mind)',
        description: '당신의 생각, 신념, 정신적 상태',
        x: 20,
        y: 50,
        order: 1
      },
      {
        id: 'body',
        name: '몸 (Body)',
        description: '물리적 상태, 건강, 현실적 상황',
        x: 50,
        y: 50,
        order: 2
      },
      {
        id: 'spirit',
        name: '영혼 (Spirit)',
        description: '영적 상태, 직감, 내면의 지혜',
        x: 80,
        y: 50,
        order: 3
      }
    ],
    difficulty: 'intermediate',
    category: 'spiritual',
    timeFrame: 'situational'
  },
  {
    id: 'situation-action-outcome',
    name: '상황-행동-결과',
    nameEn: 'Situation-Action-Outcome',
    description: '현재 상황에서 취할 행동과 그 결과를 예측하는 실용적 스프레드',
    cardCount: 3,
    positions: [
      {
        id: 'situation',
        name: '상황',
        description: '현재 직면한 상황의 본질',
        x: 20,
        y: 50,
        order: 1
      },
      {
        id: 'action',
        name: '행동',
        description: '취해야 할 행동이나 접근 방식',
        x: 50,
        y: 50,
        order: 2
      },
      {
        id: 'outcome',
        name: '결과',
        description: '그 행동을 취했을 때의 예상 결과',
        x: 80,
        y: 50,
        order: 3
      }
    ],
    difficulty: 'beginner',
    category: 'decision',
    timeFrame: 'situational'
  },
  {
    id: 'cross-spread',
    name: '십자가 스프레드',
    nameEn: 'Cross Spread',
    description: '상황을 다각도로 분석하는 5장 스프레드',
    cardCount: 5,
    positions: [
      {
        id: 'center',
        name: '중심 (현재 상황)',
        description: '현재 상황의 핵심',
        x: 50,
        y: 50,
        order: 1
      },
      {
        id: 'left',
        name: '왼쪽 (과거/원인)',
        description: '과거의 영향이나 근본 원인',
        x: 20,
        y: 50,
        order: 2
      },
      {
        id: 'right',
        name: '오른쪽 (미래/결과)',
        description: '미래의 가능성이나 결과',
        x: 80,
        y: 50,
        order: 3
      },
      {
        id: 'top',
        name: '위쪽 (의식적/목표)',
        description: '의식적 목표나 높은 이상',
        x: 50,
        y: 20,
        order: 4
      },
      {
        id: 'bottom',
        name: '아래쪽 (무의식/기반)',
        description: '무의식적 동기나 기반',
        x: 50,
        y: 80,
        order: 5
      }
    ],
    difficulty: 'intermediate',
    category: 'comprehensive',
    timeFrame: 'situational'
  },
  {
    id: 'relationship-spread',
    name: '관계 스프레드',
    nameEn: 'Relationship Spread',
    description: '두 사람 사이의 관계를 분석하는 전문 스프레드',
    cardCount: 7,
    positions: [
      {
        id: 'you',
        name: '당신',
        description: '관계에서 당신의 상태와 에너지',
        x: 20,
        y: 30,
        order: 1
      },
      {
        id: 'them',
        name: '상대방',
        description: '관계에서 상대방의 상태와 에너지',
        x: 80,
        y: 30,
        order: 2
      },
      {
        id: 'connection',
        name: '연결고리',
        description: '두 사람을 연결하는 에너지',
        x: 50,
        y: 30,
        order: 3
      },
      {
        id: 'challenges',
        name: '도전과제',
        description: '관계에서 직면한 어려움',
        x: 30,
        y: 60,
        order: 4
      },
      {
        id: 'strengths',
        name: '강점',
        description: '관계의 장점과 강한 부분',
        x: 70,
        y: 60,
        order: 5
      },
      {
        id: 'advice',
        name: '조언',
        description: '관계 개선을 위한 지혜',
        x: 50,
        y: 75,
        order: 6
      },
      {
        id: 'future',
        name: '미래',
        description: '관계의 미래 전망',
        x: 50,
        y: 90,
        order: 7
      }
    ],
    difficulty: 'advanced',
    category: 'relationship',
    timeFrame: 'situational'
  },
  {
    id: 'celtic-cross',
    name: '켈틱 크로스',
    nameEn: 'Celtic Cross',
    description: '가장 포괄적이고 전통적인 10장 스프레드',
    cardCount: 10,
    positions: [
      {
        id: 'present',
        name: '현재 상황',
        description: '현재의 상황과 에너지',
        x: 40,
        y: 50,
        order: 1
      },
      {
        id: 'challenge',
        name: '도전/장애',
        description: '직면한 도전이나 장애',
        x: 55,
        y: 50,
        order: 2
      },
      {
        id: 'distant-past',
        name: '먼 과거',
        description: '근본적 원인이나 먼 과거',
        x: 40,
        y: 70,
        order: 3
      },
      {
        id: 'recent-past',
        name: '가까운 과거',
        description: '최근의 영향',
        x: 25,
        y: 50,
        order: 4
      },
      {
        id: 'possible-outcome',
        name: '가능한 결과',
        description: '현재 방향대로 갔을 때의 결과',
        x: 40,
        y: 30,
        order: 5
      },
      {
        id: 'near-future',
        name: '가까운 미래',
        description: '가까운 미래의 전개',
        x: 55,
        y: 50,
        order: 6
      },
      {
        id: 'your-approach',
        name: '당신의 접근',
        description: '상황에 대한 당신의 접근 방식',
        x: 75,
        y: 80,
        order: 7
      },
      {
        id: 'external-influences',
        name: '외부 영향',
        description: '주변 환경과 타인의 영향',
        x: 75,
        y: 60,
        order: 8
      },
      {
        id: 'hopes-fears',
        name: '희망과 두려움',
        description: '내면의 희망과 두려움',
        x: 75,
        y: 40,
        order: 9
      },
      {
        id: 'final-outcome',
        name: '최종 결과',
        description: '모든 요소를 종합한 최종 결과',
        x: 75,
        y: 20,
        order: 10
      }
    ],
    difficulty: 'advanced',
    category: 'comprehensive',
    timeFrame: 'situational'
  }
];

// 해석 스타일 정의
export const INTERPRETATION_STYLES: InterpretationStyle[] = [
  {
    id: 'traditional-rws',
    name: '전통 라이더-웨이트',
    nameEn: 'Traditional Rider-Waite-Smith',
    description: '아서 에드워드 웨이트의 전통적 해석을 기반으로 한 정통 접근법',
    approach: 'traditional',
    deckType: 'rws',
    philosophy: '카드의 상징과 전통적 의미를 중시하며, 웨이트의 원래 의도를 존중하는 해석',
    keyPrinciples: [
      '각 카드의 전통적 의미 준수',
      '상징주의와 기독교적 신비주의 요소 중시',
      '카발라와 연금술적 상징 해석',
      '정립/역방향의 명확한 구분',
      '체계적이고 학술적 접근'
    ]
  },
  {
    id: 'psychological-jungian',
    name: '심리학적 융 접근법',
    nameEn: 'Psychological Jungian Approach',
    description: '칼 융의 분석심리학을 기반으로 한 현대적 타로 해석',
    approach: 'psychological',
    deckType: 'any',
    philosophy: '무의식의 원형과 개성화 과정을 통한 자기 이해와 성장 추구',
    keyPrinciples: [
      '집단무의식과 원형 분석',
      '개성화 과정의 단계 추적',
      '그림자, 아니마/아니무스 투영 분석',
      '동시성(synchronicity) 인정',
      '치료적 관점에서의 접근'
    ]
  },
  {
    id: 'thoth-crowley',
    name: '토트 크로울리 전통',
    nameEn: 'Thoth Crowley Tradition',
    description: '알레이스터 크로울리의 토트 타로 철학을 기반으로 한 해석',
    approach: 'spiritual',
    deckType: 'thoth',
    philosophy: '텔레마 철학과 카발라적 나무 구조를 통한 영적 진화 추구',
    keyPrinciples: [
      '카발라 생명나무와의 대응',
      '점성술적 대응 관계 중시',
      '원소와 행성 에너지 분석',
      '영적 진화와 의지의 실현',
      '에소테릭한 상징 해석'
    ]
  },
  {
    id: 'intuitive-modern',
    name: '직관적 현대 해석',
    nameEn: 'Intuitive Modern Interpretation',
    description: '직감과 개인적 경험을 중시하는 현대적 타로 접근법',
    approach: 'intuitive',
    deckType: 'any',
    philosophy: '개인의 직감과 현재 상황에 맞는 유연하고 창조적인 해석',
    keyPrinciples: [
      '직감과 첫 인상 중시',
      '개인적 경험과 연결',
      '현대적 삶의 맥락에서 해석',
      '카드 이미지의 감정적 반응 활용',
      '유연하고 창의적인 접근'
    ]
  },
  {
    id: 'therapeutic-counseling',
    name: '치료적 상담 접근법',
    nameEn: 'Therapeutic Counseling Approach',
    description: '상담과 치료 목적으로 특화된 타로 해석 방법',
    approach: 'psychological',
    deckType: 'any',
    philosophy: '내담자의 치유와 성장을 돕는 도구로서의 타로 활용',
    keyPrinciples: [
      '치료적 관계 형성',
      '내담자 중심의 해석',
      '강점과 자원 발견',
      '안전한 공간 제공',
      '점진적 인사이트 도출'
    ]
  },
  {
    id: 'elemental-seasonal',
    name: '원소와 계절 중심',
    nameEn: 'Elemental and Seasonal Focus',
    description: '자연의 원소와 계절 에너지를 중심으로 한 해석',
    approach: 'spiritual',
    deckType: 'any',
    philosophy: '자연의 리듬과 원소 에너지를 통한 삶의 균형과 조화 추구',
    keyPrinciples: [
      '사원소(불, 물, 공기, 흙) 에너지 분석',
      '계절적 주기와 연결',
      '자연의 리듬 존중',
      '생태적 관점 통합',
      '순환과 변화의 이해'
    ]
  },
  {
    id: 'spiritual-growth-reflection',
    name: '영적 성장과 자기 성찰',
    nameEn: 'Spiritual Growth and Self-Reflection',
    description: '내면의 영적 성장과 자기 이해를 깊이 있게 탐구하는 해석 방법',
    approach: 'spiritual',
    deckType: 'any',
    philosophy: '타로를 통한 내면 탐구와 영혼의 진화, 자기 발견의 여정을 추구',
    keyPrinciples: [
      '영혼의 여정과 성장 단계 인식',
      '내면의 지혜와 직관 개발',
      '카르마적 교훈과 영적 의미 탐구',
      '자기 성찰을 통한 의식 확장',
      '영적 가르침과 삶의 목적 발견',
      '내면의 빛과 그림자 통합',
      '고차원적 관점에서의 삶 이해'
    ]
  }
];

// 덱 특성 정의
export const DECK_CHARACTERISTICS: DeckCharacteristics[] = [
  {
    deckType: 'rws',
    name: '라이더-웨이트-스미스',
    description: '가장 널리 사용되는 전통적인 타로 덱',
    symbolism: ['기독교 신비주의', '카발라', '연금술', '점성술'],
    interpretationFocus: '전통적 상징과 체계적 의미',
    strengthAreas: ['초보자 학습', '전통적 해석', '체계적 접근'],
    bestFor: ['타로 입문', '전통적 리딩', '학술적 연구'],
    colorPsychology: '원색과 대비를 통한 명확한 메시지 전달',
    artisticStyle: '중세 회화 스타일과 상징적 도상'
  },
  {
    deckType: 'thoth',
    name: '토트 타로',
    description: '크로울리와 해리스가 만든 에소테릭 타로',
    symbolism: ['카발라 생명나무', '이집트 신화', '텔레마 철학', '점성술'],
    interpretationFocus: '에소테릭한 상징과 영적 진화',
    strengthAreas: ['깊은 영성 탐구', '점성술 연계', '고급 해석'],
    bestFor: ['영적 탐구', '에소테릭 연구', '고급자 해석'],
    colorPsychology: '강렬한 색채를 통한 에너지 전달',
    artisticStyle: '아르데코와 초현실주의적 예술 스타일'
  },
  {
    deckType: 'marseille',
    name: '마르세유 타로',
    description: '유럽의 가장 오래된 타로 전통',
    symbolism: ['중세 유럽 상징', '기독교 도상', '민속 전통'],
    interpretationFocus: '순수한 상징과 직관적 해석',
    strengthAreas: ['역사적 전통', '순수 상징 해석', '직관 개발'],
    bestFor: ['전통주의자', '역사 연구', '순수 상징 해석'],
    colorPsychology: '단순하고 강렬한 원색 사용',
    artisticStyle: '중세 목판화 스타일'
  }
];