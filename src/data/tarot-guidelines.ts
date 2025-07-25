import { TarotGuideline, SpreadStyleCombination } from '@/types/tarot-guidelines';

// 스프레드별 해석 스타일별 상세 지침
export const TAROT_GUIDELINES: TarotGuideline[] = [
  // 삼위일체 스프레드 x 전통 RWS
  {
    id: 'past-present-future-traditional-rws',
    spreadId: 'past-present-future',
    styleId: 'traditional-rws',
    name: '삼위일체 - 전통 라이더-웨이트 해석',
    description: '전통적 웨이트 체계에 따른 시간 흐름 분석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '카드의 전통적 의미를 바탕으로 현재에 영향을 준 과거 요인 분석',
        keyQuestions: [
          '이 카드의 전통적 의미가 현재 상황에 어떤 기반을 제공했는가?',
          '과거의 교훈이나 경험이 지금에 어떻게 작용하고 있는가?',
          '카발라적 관점에서 이 에너지의 근원은 무엇인가?'
        ],
        styleSpecificNotes: 'RWS 덱의 상징을 정확히 읽어내며, 웨이트의 원래 의도에 따른 해석을 우선시',
        timeframe: '3-6개월 전의 주요 사건이나 결정'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '현재 순간의 에너지와 상황을 전통적 카드 의미로 정확히 진단',
        keyQuestions: [
          '이 카드가 나타내는 현재 상황의 본질은 무엇인가?',
          '전통적 해석에 따르면 지금 어떤 에너지가 지배적인가?',
          '정립/역방향에 따른 에너지의 방향성은?'
        ],
        styleSpecificNotes: '정립/역방향의 전통적 구분을 명확히 하고, 카드의 원래 의미에 충실한 해석',
        timeframe: '현재 순간부터 향후 1-2주간'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '현재 에너지의 자연스러운 발전 방향을 전통적 예언 체계로 예측',
        keyQuestions: [
          '현재 방향대로 갔을 때 어떤 결과가 예상되는가?',
          '이 카드의 전통적 예언적 의미는 무엇인가?',
          '조정이 필요한 부분은 무엇인가?'
        ],
        styleSpecificNotes: '웨이트의 예언적 체계를 따르며, 운명론보다는 가능성과 조언에 초점',
        timeframe: '향후 2-6개월간의 전개'
      }
    ],
    generalApproach: '각 카드의 전통적 의미를 정확히 파악한 후, 시간의 흐름에 따른 인과관계를 논리적으로 연결하여 해석',
    keyFocusAreas: [
      '카드별 전통적 의미의 정확한 적용',
      '시간 연속성에 따른 인과관계 분석',
      '상징주의와 카발라적 연결고리 탐구',
      '정립/역방향에 따른 에너지 방향성'
    ],
    interpretationTips: [
      '먼저 각 카드의 기본 의미를 명확히 한 후 위치별 해석 진행',
      '과거-현재-미래의 논리적 연결고리를 찾아 스토리텔링',
      '웨이트의 『타로의 비의』 원문을 참조하여 정확성 확보',
      '개인적 직감보다는 체계적이고 전통적인 해석 우선'
    ],
    commonPitfalls: [
      '전통적 의미를 무시하고 직감에만 의존',
      '현대적 해석으로 카드 의미 왜곡',
      '시간 흐름의 논리성 무시',
      '정립/역방향 구분 소홀'
    ],
    difficulty: 'beginner',
    estimatedTime: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 삼위일체 스프레드 x 토트 크로울리
  {
    id: 'past-present-future-thoth-crowley',
    spreadId: 'past-present-future',
    styleId: 'thoth-crowley',
    name: '삼위일체 - 토트 크로울리 전통',
    description: '텔레마 철학과 카발라 생명나무를 통한 시간 에너지 분석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거 (Binah의 영역)',
        interpretationFocus: '생명나무의 이해(Understanding) 단계에서 형성된 패턴과 카르마적 배경',
        keyQuestions: [
          '이 카드가 나타내는 카르마적 패턴은 무엇인가?',
          '생명나무 경로상에서 어떤 영적 교훈이 주어졌는가?',
          '점성술적 대응에서 보는 과거의 에너지 특성은?'
        ],
        styleSpecificNotes: '토트 덱의 점성술적 대응과 카발라적 위치를 정확히 파악하여 해석',
        timeframe: '카르마적 시간대 - 과거생 포함 가능'
      },
      {
        positionId: 'present',
        positionName: '현재 (Tiphareth의 영역)',
        interpretationFocus: '아름다움과 균형의 중심에서 경험하는 현재 의식 상태',
        keyQuestions: [
          '현재 의식 상태에서 어떤 진리를 깨닫고 있는가?',
          '태양 의식(Christ Consciousness)의 관점에서 현재를 어떻게 볼 것인가?',
          '개성화 과정에서 현재 위치는?'
        ],
        styleSpecificNotes: '크로울리의 텔레마 철학에 따른 True Will(참된 의지) 발견에 초점',
        timeframe: '의식적 현재 순간'
      },
      {
        positionId: 'future',
        positionName: '미래 (Kether 방향)',
        interpretationFocus: '최고 의식으로의 진화 방향과 영적 성취 가능성',
        keyQuestions: [
          '영적 진화의 다음 단계는 무엇인가?',
          'True Will의 실현을 위해 어떤 경험이 필요한가?',
          '우주적 관점에서 개인의 역할은?'
        ],
        styleSpecificNotes: '운명론적 예측보다는 영적 진화의 가능성과 의지의 실현에 집중',
        timeframe: '영적 시간 - 현생 또는 내생의 성취'
      }
    ],
    generalApproach: '카발라 생명나무의 구조와 텔레마 철학을 바탕으로 영적 진화의 관점에서 시간을 해석',
    keyFocusAreas: [
      '카발라 생명나무와의 대응 관계',
      '점성술적 에너지와 행성 영향',
      'True Will(참된 의지)의 발견과 실현',
      '영적 진화와 개성화 과정'
    ],
    interpretationTips: [
      '각 카드의 생명나무상 위치와 점성술적 대응 확인',
      '크로울리의 『토트의 서』와 『777』 참조',
      '에고적 욕망과 True Will을 구분하여 해석',
      '카르마적 관점에서 시간의 연속성 이해'
    ],
    commonPitfalls: [
      '복잡한 상징에 매몰되어 핵심 메시지 놓침',
      '지나친 에소테릭 해석으로 실용성 상실',
      '점성술적 지식 부족으로 인한 오해석',
      'True Will과 개인적 욕망의 혼동'
    ],
    difficulty: 'advanced',
    estimatedTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 삼위일체 스프레드 x 직관적 현대 해석
  {
    id: 'past-present-future-intuitive-modern',
    spreadId: 'past-present-future',
    styleId: 'intuitive-modern',
    name: '삼위일체 - 직관적 현대 해석',
    description: '개인의 직감과 현대적 삶의 맥락을 중시한 유연한 시간 해석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '개인적 경험과 감정적 기억에 기반한 과거 에너지 파악',
        keyQuestions: [
          '이 카드 이미지가 떠올리게 하는 개인적 경험은?',
          '현재 상황과 연결되는 과거의 감정이나 패턴은?',
          '이 카드에서 느껴지는 에너지가 과거에 어떻게 작용했나?'
        ],
        styleSpecificNotes: '전통적 의미보다는 카드가 주는 직관적 느낌과 개인적 연상을 중시',
        timeframe: '감정적으로 의미 있는 과거의 순간들'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '현재 상황에서 느끼는 직관적 메시지와 감정적 상태',
        keyQuestions: [
          '지금 이 순간 이 카드가 전하는 메시지는?',
          '현재 감정 상태와 이 카드의 에너지가 어떻게 연결되나?',
          '일상적 맥락에서 이 카드의 의미는?'
        ],
        styleSpecificNotes: '현대적 삶의 상황에 맞게 카드 의미를 재해석하고 적용',
        timeframe: '지금 이 순간과 가까운 일상'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '희망과 직감을 바탕으로 한 미래 가능성과 창조적 잠재력',
        keyQuestions: [
          '이 카드가 보여주는 희망적인 미래는?',
          '창조적 잠재력을 발휘한다면 어떤 결과가 가능한가?',
          '직감적으로 느껴지는 미래의 방향은?'
        ],
        styleSpecificNotes: '운명적 예측보다는 개인의 선택과 창조력에 의한 가능성 탐구',
        timeframe: '개인이 원하고 창조할 수 있는 미래'
      }
    ],
    generalApproach: '카드의 전통적 의미에 얽매이지 않고, 개인의 직감과 현재 상황에 맞는 창조적 해석을 추구',
    keyFocusAreas: [
      '직감적 인상과 첫 느낌 활용',
      '개인적 경험과 감정적 연결',
      '현대적 삶의 맥락에서 재해석',
      '창조적이고 긍정적인 가능성 탐구'
    ],
    interpretationTips: [
      '카드를 보자마자 떠오르는 첫 인상을 중요하게 여기기',
      '개인적 경험과 감정을 카드와 연결하여 해석',
      '현대적 상황에 맞게 카드 의미를 유연하게 적용',
      '긍정적이고 창조적인 관점으로 미래 가능성 제시'
    ],
    commonPitfalls: [
      '지나친 주관성으로 객관적 통찰 부족',
      '전통적 지혜를 완전히 무시',
      '감정에 치우쳐 논리적 분석 부족',
      '현실적 제약을 고려하지 않은 해석'
    ],
    difficulty: 'beginner',
    estimatedTime: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 정신-몸-영혼 스프레드 x 심리학적 융 접근법
  {
    id: 'mind-body-spirit-psychological-jungian',
    spreadId: 'mind-body-spirit',
    styleId: 'psychological-jungian',
    name: '정신-몸-영혼 - 융 심리학적 접근',
    description: '융의 분석심리학을 통한 전인적 자기 이해와 개성화 과정 탐구',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Conscious Mind)',
        interpretationFocus: '의식적 자아와 페르소나, 그리고 집단의식에서 형성된 사고패턴',
        keyQuestions: [
          '현재 의식적 사고 패턴의 특성은?',
          '페르소나(가면)가 어떻게 사고에 영향을 주고 있나?',
          '집단의식과 개인의식의 갈등은?'
        ],
        styleSpecificNotes: '융의 의식-무의식 구조론을 바탕으로 현재 정신 상태 분석',
        emotionalAspects: '의식적 감정과 억압된 감정의 구분',
        practicalAspects: '일상적 사고 패턴과 결정 방식'
      },
      {
        positionId: 'body',
        positionName: '몸 (Somatic Experience)',
        interpretationFocus: '신체에 저장된 무의식적 기억과 현재의 에너지 상태',
        keyQuestions: [
          '신체가 경험하고 있는 에너지의 질은?',
          '몸에 저장된 과거의 트라우마나 기억은?',
          '현재 신체적 증상이 말하는 무의식의 메시지는?'
        ],
        styleSpecificNotes: '몸-마음 연결과 신체화된 무의식 내용 탐구',
        emotionalAspects: '신체적으로 느껴지는 감정의 질',
        practicalAspects: '건강 상태와 생활 습관의 심리적 의미'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Self & Transcendent)',
        interpretationFocus: '개성화 과정에서 나타나는 자기(Self)와 초월적 경험',
        keyQuestions: [
          '진정한 자기(Self)로부터 오는 메시지는?',
          '개성화 과정에서 현재 위치는?',
          '초월적 경험이나 영적 부름은?'
        ],
        styleSpecificNotes: '융의 자기(Self) 개념과 개성화 과정 관점에서 해석',
        emotionalAspects: '영혼의 갈망과 초월적 감정',
        practicalAspects: '삶의 목적과 의미, 영적 실천'
      }
    ],
    generalApproach: '융의 분석심리학 이론을 바탕으로 의식과 무의식의 통합, 개성화 과정의 관점에서 전인적 상태 파악',
    keyFocusAreas: [
      '의식과 무의식의 균형 상태',
      '그림자 통합과 투영 철회',
      '아니마/아니무스의 발달 단계',
      '개성화 과정에서의 현재 위치'
    ],
    interpretationTips: [
      '각 영역의 균형과 불균형 상태 파악',
      '그림자나 억압된 내용의 통합 필요성 확인',
      '개성화 과정의 단계적 발전 방향 제시',
      '동시성(synchronicity)의 의미 탐구'
    ],
    commonPitfalls: [
      '심리학 이론에 매몰되어 개인의 고유성 놓침',
      '병리적 관점으로만 해석',
      '영적 차원을 심리적으로만 환원',
      '지나친 분석으로 직관적 통찰 상실'
    ],
    difficulty: 'advanced',
    estimatedTime: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 관계 스프레드 x 치료적 상담 접근법
  {
    id: 'relationship-therapeutic-counseling',
    spreadId: 'relationship-spread',
    styleId: 'therapeutic-counseling',
    name: '관계 스프레드 - 치료적 상담 접근',
    description: '관계의 치유와 성장을 위한 상담 중심적 타로 해석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신',
        interpretationFocus: '관계에서 나타나는 개인의 강점과 성장 가능성',
        keyQuestions: [
          '이 관계에서 당신의 강점은 무엇인가?',
          '성장할 수 있는 영역은?',
          '자기 돌봄이 필요한 부분은?'
        ],
        styleSpecificNotes: '강점 중심 접근으로 자존감과 자기 효능감 강화',
        emotionalAspects: '안전한 감정 표현과 정서적 필요',
        practicalAspects: '건강한 경계 설정과 자기 돌봄'
      },
      {
        positionId: 'them',
        positionName: '상대방',
        interpretationFocus: '상대방에 대한 이해와 공감, 존중의 관점',
        keyQuestions: [
          '상대방의 관점에서 이해할 수 있는 부분은?',
          '그들의 감정적 필요는 무엇일까?',
          '어떤 배려가 도움이 될까?'
        ],
        styleSpecificNotes: '판단하지 않는 수용적 태도로 상대방 이해 촉진',
        emotionalAspects: '상대방의 감정적 경험에 대한 공감',
        practicalAspects: '상호 존중하는 소통 방법'
      },
      {
        positionId: 'connection',
        positionName: '연결고리',
        interpretationFocus: '관계의 건강한 기반과 성장 동력',
        keyQuestions: [
          '이 관계에서 건강한 연결 요소는?',
          '함께 성장할 수 있는 영역은?',
          '상호 지지할 수 있는 방법은?'
        ],
        styleSpecificNotes: '관계의 긍정적 측면과 건설적 가능성에 집중',
        emotionalAspects: '안전한 애착과 신뢰 형성',
        practicalAspects: '협력과 상호 지지 방안'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제',
        interpretationFocus: '성장을 위한 기회로서의 도전과 해결 자원',
        keyQuestions: [
          '이 도전이 가져다줄 성장의 기회는?',
          '극복을 위해 활용할 수 있는 자원은?',
          '건설적으로 접근할 방법은?'
        ],
        styleSpecificNotes: '문제가 아닌 성장 기회로 재프레이밍',
        emotionalAspects: '어려움을 다루는 건강한 대처 방식',
        practicalAspects: '갈등 해결과 문제 해결 전략'
      },
      {
        positionId: 'strengths',
        positionName: '강점',
        interpretationFocus: '관계의 자산과 활용 가능한 긍정적 요소들',
        keyQuestions: [
          '이 관계의 가장 큰 자산은?',
          '어떻게 이 강점을 더 키워갈 수 있나?',
          '이 강점이 다른 영역에 어떻게 도움이 될까?'
        ],
        styleSpecificNotes: '강점을 인식하고 활용하여 자신감과 희망 증진',
        emotionalAspects: '긍정적 감정과 만족감 증대',
        practicalAspects: '강점 기반 관계 발전 전략'
      },
      {
        positionId: 'advice',
        positionName: '조언',
        interpretationFocus: '치유와 성장을 위한 구체적이고 실행 가능한 지혜',
        keyQuestions: [
          '지금 가장 필요한 치유는?',
          '관계 개선을 위한 첫 걸음은?',
          '어떤 실천이 도움이 될까?'
        ],
        styleSpecificNotes: '실행 가능하고 점진적인 변화에 초점',
        emotionalAspects: '자기 돌봄과 치유적 활동',
        practicalAspects: '구체적인 행동 계획과 실천 방법'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '희망적이고 건설적인 미래 비전과 가능성',
        keyQuestions: [
          '치유와 성장 후 가능한 관계의 모습은?',
          '어떤 희망적 변화가 예상되나?',
          '장기적으로 추구할 수 있는 목표는?'
        ],
        styleSpecificNotes: '희망과 가능성 중심의 미래 지향적 접근',
        emotionalAspects: '희망, 기대, 긍정적 전망',
        practicalAspects: '장기적 관계 목표와 비전'
      }
    ],
    generalApproach: '관계의 문제보다는 치유와 성장 가능성에 초점을 맞춘 해결책 중심적 접근',
    keyFocusAreas: [
      '강점과 자원 발견 및 활용',
      '안전한 감정 표현과 소통',
      '건강한 경계와 자기 돌봄',
      '상호 성장과 지지 체계'
    ],
    interpretationTips: [
      '비판보다는 이해와 공감으로 접근',
      '각자의 고유성과 자율성 존중',
      '점진적이고 실현 가능한 변화 제안',
      '희망과 가능성 중심의 미래 설계'
    ],
    commonPitfalls: [
      '문제에만 집중하여 해결책 놓침',
      '일방적 조언으로 자율성 침해',
      '현실적 제약 무시한 이상적 제안',
      '감정적 안전성 고려 부족'
    ],
    difficulty: 'intermediate',
    estimatedTime: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

// 스프레드-스타일 조합별 특별 지침
export const SPREAD_STYLE_COMBINATIONS: SpreadStyleCombination[] = [
  {
    spreadId: 'past-present-future',
    styleId: 'traditional-rws',
    specialNotes: 'RWS 덱의 전통적 시간 해석 체계를 완전히 활용. 각 카드의 웨이트 원전 의미를 정확히 적용하되, 시간의 흐름에 따른 논리적 연결성을 중시',
    additionalConsiderations: [
      '정립/역방향에 따른 에너지 방향성 명확화',
      '카발라적 수비학과 시간 대응 고려',
      '웨이트의 예언적 체계에 따른 미래 해석'
    ],
    recommendedFor: ['타로 초보자', '전통적 해석 선호자', '체계적 학습자'],
    notRecommendedFor: ['직감적 접근 선호자', '현대적 재해석 추구자']
  },
  {
    spreadId: 'past-present-future',
    styleId: 'thoth-crowley',
    specialNotes: '텔레마 철학의 시간관을 적용. 선형적 시간보다는 영적 진화의 단계로서 시간을 이해하며, 각 카드의 카발라적 위치와 점성술적 대응을 중시',
    modifiedPositions: [
      {
        positionId: 'past',
        modifiedFocus: '카르마적 패턴과 영적 배경',
        reason: '크로울리 전통에서는 과거를 카르마적 관점에서 해석'
      },
      {
        positionId: 'future',
        modifiedFocus: 'True Will 실현의 가능성',
        reason: '운명론적 예측보다는 의지의 실현에 초점'
      }
    ],
    additionalConsiderations: [
      '생명나무 경로상의 영적 진화 단계',
      '점성술적 시기와 에너지 흐름',
      'True Will과 개인적 욕망의 구분'
    ],
    recommendedFor: ['고급 타로 학습자', '에소테릭 연구자', '영적 탐구자'],
    notRecommendedFor: ['타로 초보자', '실용적 해석 선호자', '단순한 예측 추구자']
  },
  {
    spreadId: 'mind-body-spirit',
    styleId: 'psychological-jungian',
    specialNotes: '융의 정신-신체-영혼 통합 이론을 완전히 활용. 각 영역의 무의식적 내용과 개성화 과정에서의 의미를 깊이 탐구',
    additionalConsiderations: [
      '의식과 무의식의 보상 관계 분석',
      '아니마/아니무스의 발달 단계별 특성',
      '그림자 통합과 투영 철회 과정',
      '집단무의식과 개인무의식의 구분'
    ],
    recommendedFor: ['심리학 관심자', '자기 성찰 추구자', '치료사'],
    notRecommendedFor: ['단순한 점술 추구자', '즉답 선호자']
  },
  {
    spreadId: 'relationship-spread',
    styleId: 'therapeutic-counseling',
    specialNotes: '관계 치료와 상담 이론을 완전히 적용. 병리보다는 강점과 성장 가능성에 초점을 맞추며, 안전한 치료적 관계 내에서 해석 진행',
    additionalConsiderations: [
      '애착 이론과 관계 패턴 분석',
      '의사소통 스타일과 갈등 해결 방식',
      '경계 설정과 자기 돌봄의 중요성',
      '상호 의존성과 건강한 독립성의 균형'
    ],
    recommendedFor: ['관계 고민자', '상담사', '치유 추구자'],
    notRecommendedFor: ['즉각적 답변 추구자', '일방적 조언 원하는 자']
  }
];