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


  // 상황-행동-결과 스프레드 x 전통 RWS
  {
    id: 'situation-action-outcome-traditional-rws',
    spreadId: 'situation-action-outcome',
    styleId: 'traditional-rws',
    name: '상황-행동-결과 - 전통 라이더-웨이트',
    description: '실용적 의사결정을 위한 전통적 3단계 분석법',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '현재 직면한 상황의 본질을 전통적 카드 의미로 명확히 진단',
        keyQuestions: [
          '이 카드의 전통적 의미가 현재 상황을 어떻게 설명하는가?',
          '웨이트의 원전에 따르면 이 상황의 핵심은 무엇인가?',
          '카발라적 관점에서 이 상황의 영적 의미는?',
          '수비학적으로 이 카드 번호가 상황에 주는 통찰은?'
        ],
        styleSpecificNotes: 'RWS 덱의 상징을 정확히 읽어내며, 아서 웨이트의 『타로의 비의』에 기록된 원래 의미를 우선시하여 해석',
        timeframe: '현재 순간의 실제 상황',
        emotionalAspects: '상황에 대한 감정적 반응과 내면 상태',
        practicalAspects: '구체적이고 측정 가능한 현실적 조건들'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '웨이트 전통에 따른 실용적이고 구체적인 행동 지침 도출',
        keyQuestions: [
          '이 카드가 제시하는 전통적 행동 원칙은 무엇인가?',
          '카드 속 인물의 자세나 행동에서 얻을 교훈은?',
          '이 카드의 원소적 특성이 제안하는 행동 방식은?',
          '정립/역방향에 따른 행동의 방향성과 에너지는?'
        ],
        styleSpecificNotes: '카드 이미지 속 인물의 자세, 손짓, 시선 방향 등 시각적 단서를 전통적 해석에 따라 행동 지침으로 변환',
        timeframe: '즉시부터 향후 1-2주간 실행할 행동',
        emotionalAspects: '행동할 때 유지해야 할 마음가짐과 감정적 준비',
        practicalAspects: '구체적인 실행 단계와 방법론'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '제시된 행동을 취했을 때 예상되는 결과를 전통적 예언 체계로 분석',
        keyQuestions: [
          '이 행동의 논리적 결과를 카드가 어떻게 예시하는가?',
          '웨이트의 예언적 체계에서 이 카드의 미래적 의미는?',
          '긍정적 결과를 위해 주의해야 할 요소는?',
          '이 결과가 장기적으로 가져올 변화는?'
        ],
        styleSpecificNotes: '운명론적 예측보다는 논리적 인과관계와 자연스러운 발전 방향을 중시하며, 개인의 선택권과 자유의지를 존중',
        timeframe: '행동 후 2-8주간의 결과 및 파급효과',
        emotionalAspects: '결과에 따른 감정적 변화와 만족도',
        practicalAspects: '측정 가능한 구체적 성과와 실질적 변화'
      }
    ],
    generalApproach: '각 단계의 논리적 연결성을 중시하며, 전통적 카드 의미에 기반한 실용적이고 실행 가능한 해결책을 제시',
    keyFocusAreas: [
      '상황 진단의 정확성과 객관성',
      '실행 가능하고 구체적인 행동 계획',
      '논리적 인과관계에 기반한 결과 예측',
      '전통적 타로 지혜의 현대적 적용'
    ],
    interpretationTips: [
      '각 카드의 웨이트 원전 의미를 먼저 확인한 후 위치별 적용',
      '상황→행동→결과의 논리적 흐름이 자연스럽게 연결되도록 해석',
      '추상적 조언보다는 구체적이고 실행 가능한 지침 제공',
      '정립/역방향에 따른 에너지 방향성을 행동 강도와 방식에 반영',
      '수비학과 원소적 특성을 활용하여 행동의 타이밍과 방법 제안'
    ],
    commonPitfalls: [
      '전통적 의미를 무시하고 직감에만 의존하는 해석',
      '세 카드 간의 논리적 연결성 부족',
      '추상적이고 모호한 조언으로 실용성 저하',
      '미래 결과를 운명론적으로 확정 지어 해석',
      '행동 카드에서 구체성 부족으로 실행 어려움 초래',
      '상황 진단에서 감정적 판단이 객관적 분석을 방해'
    ],
    exampleReading: {
      scenario: '새로운 직장으로의 이직을 고민하는 상황',
      cards: [
        {
          positionId: 'situation',
          cardName: '8 of Pentacles (정립)',
          cardMeaning: '기술 향상, 전문성 개발, 성실한 노력',
          interpretation: '현재 당신은 전문적 기술과 경험을 꾸준히 쌓아온 상태입니다. 8펜타클의 장인정신이 보여주듯, 당신의 실력은 이미 인정받을 만한 수준에 도달했습니다.'
        },
        {
          positionId: 'action',
          cardName: 'The Chariot (정립)',
          cardMeaning: '의지력, 결단력, 목표 달성을 위한 전진',
          interpretation: '전차 카드는 강한 의지로 목표를 향해 나아가라고 조언합니다. 신중한 계획과 함께 결단력 있게 이직을 추진하되, 두 마리 스핑크스처럼 상반된 요소들을 조화롭게 조절하는 지혜가 필요합니다.'
        },
        {
          positionId: 'outcome',
          cardName: '10 of Pentacles (정립)',
          cardMeaning: '물질적 안정, 가족의 번영, 장기적 성공',
          interpretation: '10펜타클은 장기적 안정과 번영을 약속합니다. 이직이 단순한 직장 변경이 아니라 가족 전체의 안정된 미래를 위한 현명한 투자가 될 것임을 보여줍니다.'
        }
      ],
      interpretation: '현재 쌓아온 전문성을 바탕으로(8펜타클) 결단력 있게 새로운 기회를 잡는다면(전차), 장기적인 안정과 번영(10펜타클)을 이룰 수 있습니다. 타이밍이 적절하며, 당신의 실력이 뒷받침되는 이직 결정입니다.',
      keyInsights: [
        '현재 전문적 실력이 이직을 뒷받침할 만한 수준에 도달',
        '결단력과 계획성을 갖춘 적극적 접근이 필요',
        '단기적 변화가 아닌 장기적 안정을 위한 현명한 선택',
        '가족 전체의 미래를 고려한 종합적 판단 권장'
      ]
    },
    difficulty: 'beginner',
    estimatedTime: 18,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 상황-행동-결과 스프레드 x 직관적 현대 해석
  {
    id: 'situation-action-outcome-intuitive-modern',
    spreadId: 'situation-action-outcome',
    styleId: 'intuitive-modern',
    name: '상황-행동-결과 - 직관적 현대 해석',
    description: '현대인의 라이프스타일에 맞춘 직감 중심의 유연한 문제 해결 접근법',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '현재 상황에 대한 직관적 감각과 개인적 경험을 통한 현실 인식',
        keyQuestions: [
          '이 카드를 보자마자 떠오르는 첫 인상은 무엇인가?',
          '현재 내 감정 상태와 이 카드 이미지가 어떻게 연결되나?',
          '일상생활의 어떤 장면이 이 카드와 비슷한 느낌인가?',
          '이 카드가 나에게 전하고 싶은 현재의 메시지는?'
        ],
        styleSpecificNotes: '전통적 의미에 얽매이지 않고 카드가 주는 시각적 임팩트와 개인적 연상을 중시. 현대적 맥락에서 카드의 의미를 재해석',
        timeframe: '지금 이 순간의 실제 느낌과 경험',
        emotionalAspects: '상황에 대한 솔직한 감정과 내면의 목소리',
        practicalAspects: '현대적 라이프스타일 맥락에서의 실제 현실'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '창조적이고 개성 있는 접근 방식으로 개인의 강점과 직감을 활용한 행동 계획',
        keyQuestions: [
          '이 카드에서 영감을 받아 어떤 창조적 아이디어가 떠오르나?',
          '내 직감이 말하는 가장 자연스러운 행동은?',
          '현재 상황에서 나다운 방식으로 접근한다면?',
          '이 카드 이미지처럼 행동한다면 어떤 느낌일까?'
        ],
        styleSpecificNotes: '정해진 규칙보다는 개인의 직감과 창조성을 신뢰. 현대적 삶의 패턴과 개인의 고유한 스타일을 존중한 행동 제안',
        timeframe: '자연스러운 타이밍에 따른 유연한 실행',
        emotionalAspects: '행동할 때의 기분과 에너지 상태',
        practicalAspects: '개인의 라이프스타일에 맞는 실현 가능한 방법'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '긍정적 가능성과 개인적 성취감에 집중한 미래 비전과 창조적 잠재력',
        keyQuestions: [
          '이 카드가 보여주는 가장 희망적인 시나리오는?',
          '내 창조적 잠재력이 발휘된다면 어떤 결과가 가능할까?',
          '이 변화가 내 삶에 가져다줄 긍정적 에너지는?',
          '이 카드처럼 살아간다면 어떤 기분일까?'
        ],
        styleSpecificNotes: '운명론적 예측보다는 개인의 선택과 창조력에 의한 긍정적 변화 가능성에 초점. 꿈과 희망을 현실화하는 관점 강조',
        timeframe: '개인이 만들어갈 수 있는 이상적 미래',
        emotionalAspects: '성취감, 만족감, 행복감 등 긍정적 감정',
        practicalAspects: '라이프스타일의 질적 향상과 개인적 성장'
      }
    ],
    generalApproach: '전통적 해석에 구애받지 않고 개인의 직감과 현대적 감각을 신뢰하며, 창조적이고 긍정적인 관점에서 문제를 바라보고 해결책을 모색',
    keyFocusAreas: [
      '직관적 인사이트와 첫 인상 활용',
      '개인적 경험과 감정적 연결',
      '창조적이고 개성 있는 접근법',
      '현대적 라이프스타일에 맞는 실용성',
      '긍정적 가능성과 희망적 미래 탐구'
    ],
    interpretationTips: [
      '카드를 보자마자 떠오르는 첫 느낌과 이미지를 소중히 여기기',
      '개인적 경험과 기억을 카드 해석에 적극 활용',
      '현대적 상황과 라이프스타일에 맞게 의미를 재창조',
      '완벽한 답보다는 개인에게 의미 있는 통찰 추구',
      '긍정적이고 희망적인 관점으로 미래 가능성 확장',
      'SNS, 디지털 라이프 등 현대적 맥락에서 카드 의미 연결'
    ],
    commonPitfalls: [
      '지나친 주관성으로 객관적 현실 무시',
      '감정에 치우쳐 논리적 판단력 상실',
      '현실적 제약과 한계를 고려하지 않은 해석',
      '전통적 지혜를 완전히 무시하여 깊이 부족',
      '단순한 희망사항으로 해석이 끝나는 경우',
      '개인적 편견이 해석에 과도하게 개입'
    ],
    exampleReading: {
      scenario: '새로운 창작 활동을 시작할지 고민하는 상황',
      cards: [
        {
          positionId: 'situation',
          cardName: '4 of Cups (정립)',
          cardMeaning: '감정적 침체, 권태, 새로운 기회에 대한 무관심',
          interpretation: '지금 당신은 일상의 반복에 지쳐있고, 뭔가 새로운 자극이 필요한 상태입니다. 카드 속 인물처럼 주어진 것들에 만족하지 못하고 있지만, 동시에 새로운 시도에 대한 두려움도 느끼고 있습니다.'
        },
        {
          positionId: 'action',
          cardName: 'The Star (정립)',
          cardMeaning: '희망, 영감, 치유, 꿈의 실현',
          interpretation: '별 카드는 당신의 내면에 있는 창조적 영감을 믿고 따라가라고 말합니다. 물을 붓는 여신처럼 당신의 창작 에너지를 자유롭게 흘려보내세요. 완벽하지 않아도 괜찮으니 일단 시작해보는 것이 중요합니다.'
        },
        {
          positionId: 'outcome',
          cardName: '3 of Wands (정립)',
          cardMeaning: '확장, 원거리 계획, 성공적인 협력',
          interpretation: '당신의 창작 활동이 예상보다 훨씬 큰 반향을 일으킬 가능성이 보입니다. 혼자 시작한 일이 다른 사람들과의 협력으로 이어지고, 더 넓은 무대로 확장될 수 있습니다. 지금의 작은 시작이 미래의 큰 성공의 씨앗이 됩니다.'
        }
      ],
      interpretation: '현재의 권태감(4컵)은 새로운 창작의 신호입니다. 내면의 영감을 믿고 용기 있게 시작한다면(별), 예상보다 훨씬 큰 성과와 확장(3완드)을 경험할 수 있습니다. 지금이 바로 당신의 창조적 여정을 시작할 완벽한 타이밍입니다.',
      keyInsights: [
        '현재의 무기력감은 변화에 대한 내면의 갈망을 나타냄',
        '완벽함보다는 시작하는 용기가 더 중요한 시점',
        '개인적 창작이 사회적 연결과 협력으로 발전할 가능성',
        '작은 시작이 큰 변화의 출발점이 될 수 있음'
      ]
    },
    difficulty: 'beginner',
    estimatedTime: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 상황-행동-결과 스프레드 x 치료적 상담 접근법
  {
    id: 'situation-action-outcome-therapeutic-counseling',
    spreadId: 'situation-action-outcome',
    styleId: 'therapeutic-counseling',
    name: '상황-행동-결과 - 치료적 상담 접근',
    description: '문제를 성장의 기회로 바라보는 강점 중심의 해결책 모색과 단계적 치유 과정',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '현재 상황을 문제가 아닌 성장과 학습의 기회로 재구성하며 내재된 자원과 강점 발견',
        keyQuestions: [
          '이 상황에서 당신이 보여준 강점과 회복력은 무엇인가?',
          '이 어려움이 가져다준 깨달음이나 성장은?',
          '이미 가지고 있는 자원 중 활용할 수 있는 것은?',
          '이 상황을 극복한 과거 경험에서 얻을 지혜는?',
          '지지해주는 사람들이나 도움이 되는 환경은?'
        ],
        styleSpecificNotes: '병리적 관점보다는 자원과 강점에 초점을 맞추며, 현재 상황을 중립적이고 수용적으로 바라보는 태도 강조',
        timeframe: '현재 순간의 실제 경험과 감정',
        emotionalAspects: '어려움 속에서도 유지되는 내적 힘과 안정감',
        practicalAspects: '이미 가진 자원과 지지 체계, 활용 가능한 강점'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '자기 돌봄과 점진적 변화를 중심으로 한 실현 가능하고 지속가능한 행동 계획',
        keyQuestions: [
          '지금 가장 필요한 자기 돌봄은 무엇인가?',
          '작지만 의미 있는 첫 걸음은?',
          '당신의 강점을 활용한 접근 방법은?',
          '안전하고 지지적인 환경에서 시도할 수 있는 것은?',
          '도움을 요청할 수 있는 사람이나 자원은?'
        ],
        styleSpecificNotes: '급진적 변화보다는 점진적이고 지속가능한 변화를 추구하며, 자기 돌봄과 자기 연민을 우선시',
        timeframe: '자신의 속도에 맞춘 점진적 실행',
        emotionalAspects: '자기 돌봄과 정서적 안전감 확보',
        practicalAspects: '작고 실현 가능한 단계별 행동 계획'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '치유와 성장을 통한 전인적 웰빙과 회복력 강화, 삶의 질 향상',
        keyQuestions: [
          '이 과정을 통해 얻게 될 내적 성장은?',
          '회복력과 자기 효능감이 어떻게 강화될까?',
          '관계와 소통에서 나타날 긍정적 변화는?',
          '이 경험이 미래의 도전에 어떤 도움이 될까?',
          '전반적인 삶의 만족도와 웰빙은 어떻게 개선될까?'
        ],
        styleSpecificNotes: '단순한 문제 해결을 넘어 전인적 성장과 웰빙 향상에 초점을 맞추며, 장기적 회복력 구축을 중시',
        timeframe: '지속적인 성장과 장기적 웰빙',
        emotionalAspects: '정서적 안정, 자존감 향상, 내적 평화',
        practicalAspects: '삶의 질 개선, 관계 향상, 스트레스 관리 능력'
      }
    ],
    generalApproach: '문제 중심이 아닌 해결책 중심 접근을 통해 개인의 강점과 자원을 활용하여 점진적이고 지속가능한 변화와 성장을 추구',
    keyFocusAreas: [
      '강점과 자원 발견 및 활용',
      '자기 돌봄과 정서적 안전감',
      '점진적이고 지속가능한 변화',
      '전인적 웰빙과 삶의 질 향상',
      '회복력과 자기 효능감 강화'
    ],
    interpretationTips: [
      '문제보다는 이미 가진 강점과 자원에 집중하기',
      '판단하지 않는 수용적 태도로 현재 상황 바라보기',
      '완벽을 추구하지 말고 작은 진전에도 의미 부여',
      '자기 돌봄을 이기주의가 아닌 필수 요소로 인식',
      '장기적 관점에서 지속가능한 변화 계획하기',
      '도움 요청을 약함이 아닌 지혜로운 선택으로 보기'
    ],
    commonPitfalls: [
      '문제에만 집중하여 강점과 자원 놓치기',
      '급진적 변화를 강요하여 스트레스 증가',
      '완벽주의로 인한 좌절감과 포기',
      '자기 돌봄을 소홀히 하며 타인만 배려',
      '외부 도움 없이 혼자 해결하려는 강박',
      '즉각적 결과를 기대하여 인내심 부족'
    ],
    exampleReading: {
      scenario: '직장에서의 갈등으로 인한 스트레스와 번아웃 상황',
      cards: [
        {
          positionId: 'situation',
          cardName: '5 of Pentacles (정립)',
          cardMeaning: '물질적 어려움, 고립감, 도움 요청의 필요성',
          interpretation: '현재 직장에서 어려움을 겪고 있지만, 이 카드는 당신이 이미 많은 어려움을 견뎌온 강인함을 보여줍니다. 5펜타클 속 두 사람처럼 서로 의지하며 이겨낼 수 있는 관계와 자원이 있음을 알려줍니다. 완전히 고립된 것이 아니라 도움의 손길이 가까이 있습니다.'
        },
        {
          positionId: 'action',
          cardName: '4 of Swords (정립)',
          cardMeaning: '휴식, 명상, 내적 평화, 재충전',
          interpretation: '지금 가장 필요한 것은 자기 돌봄과 충분한 휴식입니다. 4검 카드는 전투를 잠시 멈추고 내면의 평화를 찾으라고 조언합니다. 완벽한 해결책을 찾으려 애쓰지 말고, 먼저 자신을 돌보고 마음의 안정을 되찾는 것이 우선입니다.'
        },
        {
          positionId: 'outcome',
          cardName: '9 of Cups (정립)',
          cardMeaning: '감정적 만족, 소원 성취, 내적 행복',
          interpretation: '자기 돌봄과 적절한 휴식을 통해 내적 평화를 되찾는다면, 진정한 만족감과 행복을 경험할 수 있습니다. 9컵은 외부 상황에 의존하지 않는 내적 충만함을 보여주며, 이 과정을 통해 더욱 성숙하고 지혜로운 자신으로 성장할 것임을 약속합니다.'
        }
      ],
      interpretation: '현재의 어려움(5펜타클)은 당신의 회복력을 증명하는 기회입니다. 자기 돌봄과 충분한 휴식(4검)을 통해 내적 평화를 되찾는다면, 더 깊은 만족과 행복(9컵)을 경험할 수 있습니다. 이는 단순한 문제 해결을 넘어 전인적 성장의 여정입니다.',
      keyInsights: [
        '어려움 속에서도 이미 가진 강점과 지지 체계 인식',
        '완벽한 해결보다는 자기 돌봄이 우선순위',
        '휴식과 재충전이 약함이 아닌 지혜로운 선택',
        '외부 변화보다 내적 성장을 통한 진정한 행복 추구'
      ]
    },
    difficulty: 'intermediate',
    estimatedTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 정신-몸-영혼 스프레드 x 전통 RWS
  {
    id: 'mind-body-spirit-traditional-rws',
    spreadId: 'mind-body-spirit',
    styleId: 'traditional-rws',
    name: '정신-몸-영혼 - 전통 라이더-웨이트',
    description: '웨이트의 전통적 상징 체계를 통한 전인적 자기 진단과 균형 회복',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Mind)',
        interpretationFocus: '전통적 카드 의미를 바탕으로 한 정신적 상태, 사고 패턴, 의식적 의도의 진단',
        keyQuestions: [
          '이 카드의 전통적 의미가 현재 정신 상태를 어떻게 설명하는가?',
          '웨이트의 체계에서 이 카드가 나타내는 의식적 에너지는?',
          '정립/역방향이 사고 패턴에 주는 의미는?',
          '카발라적 관점에서 이 정신 상태의 영적 의미는?',
          '이 카드의 수비학적 특성이 사고방식에 주는 통찰은?'
        ],
        styleSpecificNotes: 'RWS 덱의 상징을 정확히 읽어내어 정신적 상태를 진단하되, 웨이트의 원래 의도에 따른 해석을 우선시',
        timeframe: '현재의 의식적 사고와 정신적 상태',
        emotionalAspects: '의식적 감정과 정신적 반응 패턴',
        practicalAspects: '일상적 사고 습관과 결정 방식'
      },
      {
        positionId: 'body',
        positionName: '몸 (Body)',
        interpretationFocus: '전통적 해석을 통한 신체적 상태, 에너지 수준, 물질적 현실의 파악',
        keyQuestions: [
          '이 카드가 나타내는 신체적 에너지의 전통적 의미는?',
          '웨이트 체계에서 이 카드의 원소적 특성이 몸에 주는 영향은?',
          '정립/역방향이 신체적 활력과 건강에 시사하는 바는?',
          '이 카드의 상징이 물질적 현실과 어떻게 연결되는가?',
          '전통적 관점에서 몸과 마음의 연결고리는?'
        ],
        styleSpecificNotes: '각 카드의 원소적 특성과 전통적 의미를 신체적 상태와 연결하여 해석하되, 의학적 진단이 아닌 에너지적 관점 유지',
        timeframe: '현재의 신체적 상태와 에너지 수준',
        emotionalAspects: '신체를 통해 표현되는 감정적 에너지',
        practicalAspects: '건강 관리, 물질적 안정, 일상적 활력'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Spirit)',
        interpretationFocus: '웨이트의 영적 체계를 통한 영혼의 상태, 직관적 지혜, 초월적 연결의 탐구',
        keyQuestions: [
          '이 카드의 전통적 영적 의미는 무엇인가?',
          '웨이트의 카발라적 체계에서 이 카드의 영적 위치는?',
          '정립/역방향이 영적 성장과 직감에 주는 메시지는?',
          '이 카드가 나타내는 초월적 경험이나 영적 부름은?',
          '전통적 관점에서 이 카드의 신성한 상징은?'
        ],
        styleSpecificNotes: '웨이트의 신비주의적 배경과 카발라적 상징을 활용하여 영적 상태를 해석하되, 교조적이지 않은 포용적 관점 유지',
        timeframe: '영원한 현재와 영적 시간',
        emotionalAspects: '영혼의 갈망, 초월적 감정, 신성한 사랑',
        practicalAspects: '영적 실천, 명상, 의미 있는 삶의 추구'
      }
    ],
    generalApproach: '웨이트의 전통적 해석 체계를 바탕으로 정신-몸-영혼의 상호 연결성을 이해하고, 전인적 균형과 조화를 추구하는 통합적 접근',
    keyFocusAreas: [
      '전통적 상징 체계의 정확한 적용',
      '정신-몸-영혼의 상호 연결성 탐구',
      '카발라적 원리와 수비학적 의미',
      '원소적 균형과 에너지 조화',
      '영적 성장과 현실적 실천의 통합'
    ],
    interpretationTips: [
      '각 영역의 전통적 의미를 먼저 파악한 후 상호 연결성 탐구',
      '정립/역방향에 따른 에너지 방향성을 각 영역별로 분석',
      '원소적 균형(불, 물, 공기, 흙)을 고려한 전체적 조화 평가',
      '카발라 생명나무의 구조를 활용한 영적 위치 파악',
      '웨이트의 『타로의 비의』 원문을 참조하여 정확성 확보',
      '추상적 영성과 현실적 삶의 균형점 찾기'
    ],
    commonPitfalls: [
      '한 영역에만 집중하여 전체적 균형 놓치기',
      '전통적 의미를 무시하고 현대적으로만 해석',
      '영적 차원을 과도하게 강조하여 현실성 상실',
      '신체적 측면을 소홀히 하여 통합성 결여',
      '정신적 분석에만 치우쳐 감정과 직관 무시',
      '교조적 해석으로 개인의 고유성 무시'
    ],
    exampleReading: {
      scenario: '인생의 중요한 전환점에서 전반적인 자기 점검이 필요한 상황',
      cards: [
        {
          positionId: 'mind',
          cardName: 'The Hermit (정립)',
          cardMeaning: '내적 탐구, 지혜 추구, 고독한 성찰',
          interpretation: '현재 당신의 정신은 깊은 성찰과 내적 탐구를 추구하고 있습니다. 은둔자 카드는 외부의 소음보다는 내면의 지혜에 귀 기울이는 시기임을 보여줍니다. 전통적으로 이 카드는 진리 탐구와 영적 성숙을 의미하며, 현재 당신의 의식이 더 깊은 이해를 향해 나아가고 있음을 나타냅니다.'
        },
        {
          positionId: 'body',
          cardName: '4 of Pentacles (정립)',
          cardMeaning: '안정성 추구, 보존, 물질적 안전',
          interpretation: '신체적으로는 안정성과 보안을 추구하는 상태입니다. 4펜타클은 물질적 기반이 견고하지만, 동시에 변화에 대한 두려움도 있음을 보여줍니다. 전통적으로 이 카드는 현실적 안정성을 나타내지만, 과도한 보수성으로 인한 정체를 경계해야 함을 알려줍니다.'
        },
        {
          positionId: 'spirit',
          cardName: 'The Star (정립)',
          cardMeaning: '희망, 영감, 영적 인도, 치유',
          interpretation: '영적으로는 매우 밝고 희망적인 에너지가 흐르고 있습니다. 별 카드는 우주적 인도와 영적 치유를 나타내며, 내면의 빛이 어둠을 밝히고 있음을 보여줍니다. 웨이트의 전통에서 이 카드는 신성한 영감과 직관적 지혜의 각성을 의미합니다.'
        }
      ],
      interpretation: '현재 정신적으로는 깊은 성찰기(은둔자)에 있고, 물질적으로는 안정을 추구(4펜타클)하지만, 영적으로는 큰 희망과 영감(별)을 받고 있습니다. 이는 내적 성장을 위한 완벽한 조건으로, 안정된 기반 위에서 영적 각성을 경험할 수 있는 시기임을 보여줍니다.',
      keyInsights: [
        '내적 성찰과 영적 성장을 위한 최적의 시기',
        '물질적 안정을 바탕으로 한 영적 탐구 가능',
        '외부 변화보다 내면 변화에 집중할 때',
        '직관과 영감을 신뢰하며 새로운 방향 모색'
      ]
    },
    difficulty: 'intermediate',
    estimatedTime: 22,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 정신-몸-영혼 스프레드 x 직관적 현대 해석
  {
    id: 'mind-body-spirit-intuitive-modern',
    spreadId: 'mind-body-spirit',
    styleId: 'intuitive-modern',
    name: '정신-몸-영혼 - 직관적 현대 해석',
    description: '현대적 웰빙 관점에서 바라본 직감 중심의 전인적 자기 돌봄과 라이프스타일 개선',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Mind)',
        interpretationFocus: '현대적 멘탈 헬스 관점에서 정신적 웰빙과 마음가짐, 사고 패턴의 직관적 파악',
        keyQuestions: [
          '이 카드가 주는 첫 인상이 현재 마음 상태와 어떻게 연결되나?',
          '현재 스트레스나 걱정거리와 이 카드의 관계는?',
          '이 카드를 보며 떠오르는 개인적 경험이나 기억은?',
          '현대적 관점에서 이 카드가 제안하는 멘탈 케어는?',
          '일상생활에서 이런 에너지를 어떻게 느꼈던 적이 있나?'
        ],
        styleSpecificNotes: '전통적 의미보다는 현대인의 정신 건강과 라이프스타일 관점에서 직관적으로 해석. SNS, 업무 스트레스, 인간관계 등 현대적 맥락 반영',
        timeframe: '현재의 일상적 마음 상태',
        emotionalAspects: '솔직한 감정 인식과 감정적 자기 돌봄',
        practicalAspects: '멘탈 헬스 관리, 스트레스 해소, 마음챙김 실천'
      },
      {
        positionId: 'body',
        positionName: '몸 (Body)',
        interpretationFocus: '현대적 웰빙과 자기 돌봄 관점에서 신체적 건강과 에너지, 라이프스타일의 직감적 이해',
        keyQuestions: [
          '이 카드의 이미지가 현재 몸의 컨디션과 어떻게 연결되나?',
          '최근 몸이 보내는 신호나 메시지가 있다면?',
          '이 카드가 제안하는 신체적 자기 돌봄은?',
          '현재 운동, 식사, 수면 패턴과 이 카드의 관계는?',
          '몸의 직감으로 느끼는 이 카드의 메시지는?'
        ],
        styleSpecificNotes: '의학적 진단이 아닌 직관적 몸 인식에 집중. 현대인의 라이프스타일, 운동, 영양, 수면 등 웰빙 트렌드와 연결',
        timeframe: '현재의 신체적 컨디션과 라이프스타일',
        emotionalAspects: '몸을 통해 느끼는 감정과 에너지',
        practicalAspects: '운동, 영양, 수면, 자기 돌봄 루틴'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Spirit)',
        interpretationFocus: '현대적 영성과 개인적 의미 추구 관점에서 내면의 목소리와 삶의 방향성 탐구',
        keyQuestions: [
          '이 카드가 내 영혼에게 전하는 개인적 메시지는?',
          '현재 삶의 의미나 목적과 관련해 떠오르는 직감은?',
          '이 카드가 제안하는 영적 실천이나 자기 성찰은?',
          '내면의 목소리가 현재 무엇을 말하고 있나?',
          '진정한 나다움과 관련해 이 카드가 주는 통찰은?'
        ],
        styleSpecificNotes: '종교적 교리보다는 개인적 영성과 의미 추구에 집중. 명상, 요가, 자연 연결 등 현대적 영적 실천과 연결',
        timeframe: '지속적인 영적 여정과 성장',
        emotionalAspects: '영혼의 갈망, 내적 평화, 감사와 연결감',
        practicalAspects: '명상, 자연 시간, 창조적 활동, 의미 있는 관계'
      }
    ],
    generalApproach: '전통적 체계에 얽매이지 않고 개인의 직감과 현대적 웰빙 관점을 중심으로 정신-몸-영혼의 조화로운 통합을 추구',
    keyFocusAreas: [
      '직관적 자기 인식과 몸의 지혜',
      '현대적 웰빙과 라이프스타일 개선',
      '개인적 영성과 의미 추구',
      '일상 속 마음챙김과 자기 돌봄',
      '창조적이고 개성 있는 접근법'
    ],
    interpretationTips: [
      '카드를 보자마자 느끼는 신체적 반응과 감정 변화 주목하기',
      '현대적 웰빙 트렌드와 개인 경험을 카드 해석에 활용',
      '완벽한 균형보다는 자연스러운 흐름과 변화 수용',
      '일상생활에서 실천 가능한 구체적 자기 돌봄 방법 제안',
      '개인의 고유한 라이프스타일과 가치관 존중',
      '소셜미디어, 디지털 웰빙 등 현대적 이슈와 연결'
    ],
    commonPitfalls: [
      '지나친 이상화로 현실적 한계 무시',
      '개인적 편견이 해석에 과도하게 개입',
      '트렌드에만 의존하여 개인의 고유성 놓침',
      '영적 차원을 지나치게 단순화',
      '즉흥적 판단으로 일관성 부족',
      '현실적 제약 고려 없는 비현실적 제안'
    ],
    exampleReading: {
      scenario: '바쁜 직장생활로 인한 워라밸 불균형과 전반적인 웰빙 개선 필요',
      cards: [
        {
          positionId: 'mind',
          cardName: '8 of Swords (정립)',
          cardMeaning: '제약감, 혼란, 자기 제한적 사고',
          interpretation: '현재 마음이 업무와 책임감에 갇혀있는 느낌입니다. 8검의 눈가린 여인처럼 실제로는 빠져나갈 길이 있지만 스스로 제한하고 있는 상태입니다. 현대인의 번아웃과 비슷한 에너지로, 마음의 여유와 관점의 전환이 필요한 시기입니다.'
        },
        {
          positionId: 'body',
          cardName: '4 of Cups (정립)',
          cardMeaning: '무관심, 권태, 새로운 기회에 대한 둔감',
          interpretation: '몸이 피로와 무기력을 호소하고 있습니다. 4컵의 인물처럼 주어진 기회나 에너지를 제대로 받아들이지 못하는 상태입니다. 규칙적인 운동, 충분한 수면, 영양 관리 등 기본적인 자기 돌봄이 필요합니다.'
        },
        {
          positionId: 'spirit',
          cardName: 'The Sun (정립)',
          cardMeaning: '기쁨, 활력, 순수한 에너지, 성공',
          interpretation: '영혼 깊은 곳에서는 여전히 밝고 긍정적인 에너지가 빛나고 있습니다. 태양 카드는 본래의 밝은 자신으로 돌아갈 수 있음을 보여줍니다. 작은 기쁨들을 발견하고, 감사를 실천하며, 자연과 연결되는 시간이 영혼에 활력을 불어넣을 것입니다.'
        }
      ],
      interpretation: '현재 마음은 제약감을 느끼고(8검), 몸은 피로와 무기력에 시달리지만(4컵), 영혼은 여전히 밝은 에너지를 품고 있습니다(태양). 작은 변화부터 시작해서 자기 돌봄을 실천하고, 일상 속 작은 기쁨들을 발견한다면 전반적인 웰빙을 회복할 수 있습니다.',
      keyInsights: [
        '현재 상황은 일시적이며 변화 가능함을 인식',
        '기본적인 자기 돌봄(수면, 운동, 영양)이 우선',
        '일상 속 작은 기쁨과 감사 실천의 중요성',
        '자연과의 연결을 통한 에너지 회복'
      ]
    },
    difficulty: 'beginner',
    estimatedTime: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 삼위일체 스프레드 x 심리학적 융 접근법
  {
    id: 'past-present-future-psychological-jungian',
    spreadId: 'past-present-future',
    styleId: 'psychological-jungian',
    name: '삼위일체 - 융 심리학적 접근',
    description: '무의식의 원형과 개성화 과정을 통한 시간적 자기 발견',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '집단무의식에서 개인무의식으로 전이된 원형적 경험 분석',
        keyQuestions: [
          '어떤 원형적 패턴이 과거부터 작용해왔는가?',
          '개성화 과정에서 이 경험이 갖는 의미는?',
          '그림자 투영이나 아니마/아니무스 투영이 있었는가?'
        ],
        styleSpecificNotes: '융의 원형 이론과 개성화 과정의 관점에서 과거 경험을 재해석',
        timeframe: '유년기부터 현재까지의 원형적 패턴'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '현재 의식과 무의식의 균형 상태, 개성화의 현단계 진단',
        keyQuestions: [
          '지금 어떤 무의식적 내용이 의식화를 요구하고 있는가?',
          '페르소나와 그림자의 균형은 어떠한가?',
          '현재 직면한 심리적 과제는 무엇인가?'
        ],
        styleSpecificNotes: '의식과 무의식의 대립과 통합 과정에 초점을 맞춘 현재 상황 분석',
        timeframe: '현재의 심리적 상태와 무의식적 동향'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '개성화 과정의 다음 단계와 자기실현의 방향성 제시',
        keyQuestions: [
          '개성화 과정에서 다음에 통합해야 할 요소는?',
          '자기(Self) 원형과의 관계는 어떻게 발전할 것인가?',
          '심리적 성장을 위해 필요한 태도 변화는?'
        ],
        styleSpecificNotes: '운명론적 예측보다는 심리적 발달의 자연스러운 과정으로 해석',
        timeframe: '개성화 과정의 다음 발달 단계'
      }
    ],
    generalApproach: '융의 분석심리학 이론을 바탕으로 개인의 심리적 발달과 무의식의 메시지를 해석하며, 치료적 관점에서 성장 방향을 제시',
    keyFocusAreas: [
      '집단무의식과 개인무의식의 상호작용',
      '원형적 패턴과 개성화 과정',
      '의식과 무의식의 균형과 통합',
      '그림자와 페르소나의 인식',
      '자기실현과 심리적 성장'
    ],
    interpretationTips: [
      '카드의 상징을 융의 원형 이론으로 해석하세요',
      '개성화 과정의 어느 단계에 있는지 파악하세요',
      '무의식의 보상적 기능을 고려하세요',
      '동시성(synchronicity)의 의미를 탐구하세요',
      '심리적 대립물의 통합 가능성을 찾으세요'
    ],
    commonPitfalls: [
      '지나치게 학술적이거나 이론적인 해석',
      '개성화를 완성으로 보는 목표 지향적 사고',
      '무의식 내용을 의식의 기준으로 판단하기',
      '원형을 고정된 틀로 한정하여 해석',
      '개인의 고유성을 무시한 일반화'
    ],
    difficulty: 'advanced',
    estimatedTime: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 삼위일체 스프레드 x 치료적 상담 접근법
  {
    id: 'past-present-future-therapeutic-counseling',
    spreadId: 'past-present-future',
    styleId: 'therapeutic-counseling',
    name: '삼위일체 - 치료적 상담 접근',
    description: '치유와 성장을 위한 시간적 관점의 상담적 타로 해석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '치유가 필요한 과거 경험과 성장의 자원 발견',
        keyQuestions: [
          '과거에서 치유되지 않은 상처나 트라우마는 무엇인가?',
          '어떤 강점과 자원이 과거에 형성되었는가?',
          '과거 경험에서 배울 수 있는 지혜는 무엇인가?'
        ],
        styleSpecificNotes: '비판하지 않는 수용적 태도로 과거를 재해석하고 치유의 관점 제공',
        timeframe: '치유가 필요한 과거 경험들'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '현재의 강점과 자원 활용, 치유의 기회 포착',
        keyQuestions: [
          '지금 활용할 수 있는 내적 자원과 강점은 무엇인가?',
          '현재 상황에서 성장의 기회는 어디에 있는가?',
          '치유와 회복을 위해 필요한 것은 무엇인가?'
        ],
        styleSpecificNotes: '문제보다는 해결책과 강점에 초점, 내담자의 역량 강화',
        timeframe: '현재 활용 가능한 치유 자원'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '희망적 미래상과 치유 후의 성장 모습 제시',
        keyQuestions: [
          '치유와 성장 후 어떤 모습이 될 것인가?',
          '미래를 위해 지금 심어야 할 씨앗은 무엇인가?',
          '지속적인 성장을 위한 방향성은?'
        ],
        styleSpecificNotes: '현실적이면서도 희망적인 미래상 제시, 작은 변화부터 시작',
        timeframe: '치유와 성장 과정의 결과'
      }
    ],
    generalApproach: '상담 이론을 바탕으로 내담자의 치유와 성장을 돕는 관점에서 해석하며, 강점 중심의 긍정적 접근을 통해 희망과 용기를 제공',
    keyFocusAreas: [
      '트라우마 치유와 회복력 강화',
      '내적 자원과 강점 발견',
      '자기효능감과 자존감 향상',
      '관계 개선과 소통 능력',
      '지속적 성장과 자기돌봄'
    ],
    interpretationTips: [
      '내담자의 강점과 자원에 집중하세요',
      '비판 없는 수용적 태도를 유지하세요',
      '작은 변화와 진전을 인정하고 격려하세요',
      '현실적이면서도 희망적인 관점을 제공하세요',
      '내담자가 스스로 답을 찾도록 도우세요'
    ],
    commonPitfalls: [
      '조급하게 해결책을 제시하려 하기',
      '내담자의 감정을 무시하거나 성급하게 위로하기',
      '전문가 역할을 넘어선 개입',
      '부정적 측면만 강조하여 절망감 조성',
      '일방적 조언이나 지시적 태도'
    ],
    difficulty: 'intermediate',
    estimatedTime: 40,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 삼위일체 스프레드 x 원소와 계절 중심
  {
    id: 'past-present-future-elemental-seasonal',
    spreadId: 'past-present-future',
    styleId: 'elemental-seasonal',
    name: '삼위일체 - 원소와 계절 중심 해석',
    description: '자연의 순환과 원소 에너지를 통한 시간적 리듬 분석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '과거에 지배적이었던 원소 에너지와 계절적 패턴 분석',
        keyQuestions: [
          '과거에 어떤 원소 에너지가 주도했는가? (불/물/공기/흙)',
          '그 시기의 계절적 특성은 무엇이었는가?',
          '자연의 순환에서 어떤 단계였는가?'
        ],
        styleSpecificNotes: '카드의 원소적 속성과 계절적 의미를 중시하여 과거의 에너지 패턴 파악',
        timeframe: '과거의 원소적 주기와 계절적 패턴'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '현재 활성화된 원소 에너지와 계절적 시기의 의미',
        keyQuestions: [
          '지금 어떤 원소 에너지가 필요하고 활성화되어 있는가?',
          '현재 계절이 주는 메시지와 기회는 무엇인가?',
          '자연의 리듬과 개인의 리듬이 조화를 이루고 있는가?'
        ],
        styleSpecificNotes: '현재 시점의 계절적 에너지와 원소적 균형을 고려한 해석',
        timeframe: '현재의 원소적 균형과 계절적 흐름'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '다가올 원소적 전환과 계절적 변화의 예고',
        keyQuestions: [
          '어떤 원소 에너지로 전환이 필요한가?',
          '다음 계절이 가져올 변화와 기회는?',
          '자연의 순환에 맞춰 어떻게 흘러가야 하는가?'
        ],
        styleSpecificNotes: '자연의 순환에 따른 자연스러운 변화와 적응의 필요성 강조',
        timeframe: '다가올 원소적 순환과 계절적 전환'
      }
    ],
    generalApproach: '자연의 사원소(불, 물, 공기, 흙)와 계절의 순환을 기반으로 개인의 에너지 패턴을 해석하며, 자연과의 조화로운 삶을 추구',
    keyFocusAreas: [
      '사원소 에너지의 균형과 조화',
      '계절적 리듬과 개인적 주기',
      '자연과의 연결과 생태적 의식',
      '순환과 변화의 자연스러운 수용',
      '환경과 에너지의 상호작용'
    ],
    interpretationTips: [
      '카드의 원소적 속성을 정확히 파악하세요',
      '현재 계절의 에너지를 해석에 반영하세요',
      '자연의 순환과 개인의 리듬을 연결하세요',
      '원소 간의 상호작용과 균형을 고려하세요',
      '생태적 관점에서 조화로운 삶을 제안하세요'
    ],
    commonPitfalls: [
      '원소를 지나치게 단순화하여 해석',
      '계절을 기계적으로 적용하는 오류',
      '개인의 특성을 무시한 일반적 자연 해석',
      '원소 간의 복잡한 상호작용 무시',
      '실제 자연과의 연결 없는 이론적 접근'
    ],
    difficulty: 'intermediate',
    estimatedTime: 35,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 정신-몸-영혼 x 토트 크로울리 전통
  {
    id: 'mind-body-spirit-thoth-crowley',
    spreadId: 'mind-body-spirit',
    styleId: 'thoth-crowley',
    name: '정신-몸-영혼 - 토트 크로울리 전통',
    description: '텔레마 철학과 카발라적 나무 구조를 통한 삼체 균형 분석',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Mind)',
        interpretationFocus: '티페렛 중심의 의식 상태와 카발라적 지성 분석',
        keyQuestions: [
          '현재 의식의 세피로트는 어느 위치에 있는가?',
          '루아흐(중간 영혼)의 상태와 균형은?',
          '아비스를 넘어서는 고등 지성과의 연결은?'
        ],
        styleSpecificNotes: '크로울리의 의식 발달 단계와 카발라 생명나무 대응으로 해석',
        timeframe: '현재의 의식 진화 단계'
      },
      {
        positionId: 'body',
        positionName: '몸 (Body)',
        interpretationFocus: '말쿠트(왕국)와 물질계 에너지의 현현과 점성술적 대응',
        keyQuestions: [
          '물질계에서의 의지 실현 상태는?',
          '행성 에너지와 신체적 대응은 어떠한가?',
          '네페쉬(동물 영혼)의 건강 상태는?'
        ],
        styleSpecificNotes: '토트 덱의 점성술적 대응과 행성 에너지를 통한 신체 해석',
        timeframe: '현재의 물질적 현현 상태'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Spirit)',
        interpretationFocus: '케테르를 향한 영적 상승과 성스러운 수호천사와의 소통',
        keyQuestions: [
          '성스러운 수호천사(HGA)와의 연결 상태는?',
          '네샤마(고등 영혼)의 활성화 정도는?',
          '대사업(Great Work) 진행 상황은?'
        ],
        styleSpecificNotes: '텔레마 전통의 영적 실천과 의지 실현을 중심으로 해석',
        timeframe: '영적 진화의 전체 여정'
      }
    ],
    generalApproach: '크로울리의 텔레마 철학과 토트 타로의 깊이 있는 상징 체계를 통해 정신-몸-영혼의 통합적 발전 방향을 제시',
    keyFocusAreas: [
      '카발라 생명나무와 의식 진화',
      '점성술적 대응과 행성 에너지',
      '텔레마 철학과 참의지 실현',
      '성스러운 수호천사와의 소통',
      '대사업을 통한 전인적 발전'
    ],
    interpretationTips: [
      '토트 덱의 점성술적 대응을 정확히 파악하세요',
      '카발라 생명나무의 세피로트 위치를 고려하세요',
      '텔레마의 핵심 원리 "Do what thou wilt"를 적용하세요',
      '행성과 별자리의 영향을 해석에 반영하세요',
      '에소테릭한 상징의 깊은 의미를 탐구하세요'
    ],
    commonPitfalls: [
      '지나치게 복잡한 카발라 이론에만 의존',
      '텔레마 철학을 도덕적 방임으로 오해',
      '점성술적 대응을 기계적으로 적용',
      '개인의 발달 수준을 무시한 고차원 해석',
      '실용적 조언 없는 추상적 이론만 제시'
    ],
    difficulty: 'advanced',
    estimatedTime: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 정신-몸-영혼 x 치료적 상담 접근법
  {
    id: 'mind-body-spirit-therapeutic-counseling',
    spreadId: 'mind-body-spirit',
    styleId: 'therapeutic-counseling',
    name: '정신-몸-영혼 - 치료적 상담 접근',
    description: '홀리스틱 치료 관점에서 정신-신체-영성의 통합적 치유',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Mind)',
        interpretationFocus: '정신 건강과 인지적 자원 발견을 통한 치유',
        keyQuestions: [
          '현재 정신적 스트레스와 치유가 필요한 부분은?',
          '인지적 강점과 대처 능력은 무엇인가?',
          '정신적 회복력을 높이는 방법은?'
        ],
        styleSpecificNotes: '인지행동치료, 마음챙김 등 현대 심리치료 접근법 활용',
        timeframe: '현재의 정신건강 상태'
      },
      {
        positionId: 'body',
        positionName: '몸 (Body)',
        interpretationFocus: '신체적 증상과 치유, 자기돌봄을 통한 회복',
        keyQuestions: [
          '몸이 보내는 신호와 치유 메시지는?',
          '신체적 자기돌봄에서 부족한 부분은?',
          '몸과 마음의 연결을 강화하는 방법은?'
        ],
        styleSpecificNotes: '신체 기반 치료와 전인적 건강 접근법 반영',
        timeframe: '현재의 신체건강과 자기돌봄'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Spirit)',
        interpretationFocus: '영적 자원과 의미, 목적의식을 통한 치유',
        keyQuestions: [
          '삶의 의미와 목적에서 치유가 필요한 부분은?',
          '영적 자원과 지지체계는 무엇인가?',
          '내면의 지혜와 직감을 어떻게 활용할 수 있나?'
        ],
        styleSpecificNotes: '영성 기반 치료와 의미요법적 접근 통합',
        timeframe: '지속적인 영적 성장과 치유'
      }
    ],
    generalApproach: '정신-신체-영성의 상호연결성을 인정하고 전인적 치유를 목표로 하는 통합적 상담 접근',
    keyFocusAreas: [
      '트라우마 인식 치료(trauma-informed care)',
      '신체-마음 연결과 체화된 치유',
      '영적 자원과 의미 중심 치료',
      '회복력과 성장 후 스트레스',
      '전인적 웰빙과 자기돌봄'
    ],
    interpretationTips: [
      '정신-신체-영성의 상호연결성을 강조하세요',
      '강점 기반 접근으로 치유 자원을 발견하세요',
      '트라우마에 민감한 해석을 제공하세요',
      '실용적이고 실행 가능한 치유 방법을 제안하세요',
      '개인의 고유한 치유 여정을 존중하세요'
    ],
    commonPitfalls: [
      '의료적 진단이나 처방을 시도하는 것',
      '영적 차원을 종교적 교리로 한정하기',
      '빠른 치유를 약속하는 비현실적 기대',
      '개인의 치유 속도를 재촉하기',
      '전문적 치료의 필요성을 간과하기'
    ],
    difficulty: 'intermediate',
    estimatedTime: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 정신-몸-영혼 x 원소와 계절 중심
  {
    id: 'mind-body-spirit-elemental-seasonal',
    spreadId: 'mind-body-spirit',
    styleId: 'elemental-seasonal',
    name: '정신-몸-영혼 - 원소와 계절 중심',
    description: '자연의 사원소를 통한 정신-신체-영성의 균형과 조화',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신 (Mind)',
        interpretationFocus: '공기 원소와 사고, 소통의 자연적 흐름',
        keyQuestions: [
          '현재 정신적 에너지는 어떤 원소와 연결되어 있는가?',
          '사고의 흐름이 자연스럽고 균형 잡혀 있는가?',
          '계절적 변화가 정신상태에 미치는 영향은?'
        ],
        styleSpecificNotes: '공기 원소(사고, 소통)를 중심으로 하되 다른 원소와의 균형 고려',
        timeframe: '현재의 정신적 계절과 원소적 균형'
      },
      {
        positionId: 'body',
        positionName: '몸 (Body)',
        interpretationFocus: '흙 원소와 신체의 안정성, 자연과의 연결',
        keyQuestions: [
          '몸의 에너지는 어떤 원소적 특성을 보이는가?',
          '자연의 리듬과 몸의 리듬이 조화를 이루고 있는가?',
          '계절 변화에 따른 신체적 적응은 어떠한가?'
        ],
        styleSpecificNotes: '흙 원소(안정, 실용)를 기본으로 하되 계절적 원소 변화 반영',
        timeframe: '현재의 신체적 계절 적응'
      },
      {
        positionId: 'spirit',
        positionName: '영혼 (Spirit)',
        interpretationFocus: '불과 물 원소의 균형을 통한 영적 역동성',
        keyQuestions: [
          '영적 에너지에서 불(열정)과 물(직감)의 균형은?',
          '자연과의 영적 연결과 교감은 어떠한가?',
          '계절의 영적 메시지를 어떻게 받아들이고 있는가?'
        ],
        styleSpecificNotes: '불(열정, 창조)과 물(직감, 감정)의 균형을 중심으로 해석',
        timeframe: '지속적인 영적 자연 연결'
      }
    ],
    generalApproach: '사원소(불, 물, 공기, 흙)의 균형을 통해 정신-신체-영성의 자연스러운 조화를 추구하고 계절적 리듬과의 동조를 중시',
    keyFocusAreas: [
      '사원소의 개인적 균형과 조화',
      '계절적 변화와 내적 적응',
      '자연과의 깊은 연결과 교감',
      '생태적 의식과 환경 감수성',
      '원소적 치유와 에너지 조율'
    ],
    interpretationTips: [
      '개인의 원소적 성향과 필요를 파악하세요',
      '현재 계절의 원소적 특성을 반영하세요',
      '원소 간의 상호보완과 균형을 강조하세요',
      '자연과의 실질적 연결 방법을 제안하세요',
      '원소적 불균형의 조화 방법을 안내하세요'
    ],
    commonPitfalls: [
      '원소를 지나치게 단순하게 분류하기',
      '개인차를 무시한 일반적 원소 적용',
      '계절을 기계적으로 대입하는 오류',
      '실제 자연 경험 없는 이론적 접근',
      '원소 간의 복잡한 상호작용 무시'
    ],
    difficulty: 'intermediate',
    estimatedTime: 40,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 상황-행동-결과 x 심리학적 융 접근법
  {
    id: 'situation-action-outcome-psychological-jungian',
    spreadId: 'situation-action-outcome',
    styleId: 'psychological-jungian',
    name: '상황-행동-결과 - 융 심리학적 접근',
    description: '개성화 과정과 무의식적 동향을 통한 의사결정 분석',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '현재 상황의 무의식적 배경과 원형적 패턴 분석',
        keyQuestions: [
          '이 상황에 작용하는 무의식적 동력은 무엇인가?',
          '어떤 원형적 에너지가 상황을 주도하고 있는가?',
          '의식과 무의식 사이의 갈등이 상황에 어떻게 반영되는가?'
        ],
        styleSpecificNotes: '융의 원형 이론으로 상황의 심층 구조를 파악하고 무의식적 동기 분석',
        timeframe: '현재 상황의 심리적 구조'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '개성화 과정에 부합하는 의식적 선택과 무의식의 통합',
        keyQuestions: [
          '개성화 과정에서 취해야 할 의식적 행동은?',
          '그림자나 아니마/아니무스를 통합하는 행동은?',
          '자기(Self)의 목소리에 따른 행동 방향은?'
        ],
        styleSpecificNotes: '개성화를 촉진하고 무의식적 내용을 의식화하는 행동 제시',
        timeframe: '개성화 과정에서의 의식적 선택'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '심리적 성장과 개성화 진전의 결과',
        keyQuestions: [
          '이 행동이 개성화 과정에 미칠 영향은?',
          '의식과 무의식의 새로운 균형은 어떻게 형성될 것인가?',
          '자기실현에 어떤 진전이 있을 것인가?'
        ],
        styleSpecificNotes: '심리적 발달과 전인적 성장의 관점에서 결과를 예측',
        timeframe: '심리적 성장의 장기적 결과'
      }
    ],
    generalApproach: '융의 분석심리학을 바탕으로 상황-행동-결과를 개성화 과정의 한 단계로 이해하고, 무의식의 보상적 기능을 활용한 성장 방향 제시',
    keyFocusAreas: [
      '무의식적 동기와 원형적 패턴',
      '개성화 과정과 의식적 선택',
      '그림자와 아니마/아니무스 통합',
      '자기(Self) 원형과의 연결',
      '심리적 성장과 전인적 발달'
    ],
    interpretationTips: [
      '상황의 무의식적 배경을 깊이 탐구하세요',
      '개성화를 촉진하는 행동을 제안하세요',
      '무의식의 보상적 메시지에 주목하세요',
      '장기적 심리적 발달을 고려하세요',
      '개인의 고유한 개성화 과정을 존중하세요'
    ],
    commonPitfalls: [
      '복잡한 심리학 이론으로 상황을 과도하게 분석',
      '개성화를 목표로 하는 성취 지향적 사고',
      '무의식 내용을 의식적 기준으로 판단',
      '개인의 발달 수준을 무시한 고차원 해석',
      '즉각적 해결책 대신 장기적 관점만 제시'
    ],
    difficulty: 'advanced',
    estimatedTime: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 상황-행동-결과 x 토트 크로울리 전통
  {
    id: 'situation-action-outcome-thoth-crowley',
    spreadId: 'situation-action-outcome',
    styleId: 'thoth-crowley',
    name: '상황-행동-결과 - 토트 크로울리 전통',
    description: '텔레마 철학과 의지의 실현을 통한 마법적 의사결정',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '카발라적 맥락에서 현재 상황의 에너지적 구조 분석',
        keyQuestions: [
          '이 상황이 생명나무의 어느 세피로트에 대응하는가?',
          '현재 작용하는 행성과 별자리 영향은?',
          '우주적 의지와 개인적 의지의 관계는?'
        ],
        styleSpecificNotes: '토트 타로의 점성술적 대응과 카발라적 의미를 통한 상황 분석',
        timeframe: '현재의 에너지적 배치와 우주적 타이밍'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '참의지(True Will) 실현을 위한 마법적 행동',
        keyQuestions: [
          '참의지에 부합하는 행동은 무엇인가?',
          '어떤 에너지를 호출하고 방향을 설정해야 하는가?',
          '대사업(Great Work)에 기여하는 행동은?'
        ],
        styleSpecificNotes: 'Do what thou wilt의 원리에 따른 의지적 행동과 마법적 실천',
        timeframe: '의지 실현의 현재적 행동'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '의지 실현의 결과와 우주적 조화의 성취',
        keyQuestions: [
          '이 행동이 참의지 실현에 미칠 영향은?',
          '우주적 질서와의 조화는 어떻게 이루어질 것인가?',
          '마법적 작업의 성과와 진전은?'
        ],
        styleSpecificNotes: '텔레마의 우주적 조화와 개인적 성취의 통합적 결과',
        timeframe: '의지 실현의 장기적 성과'
      }
    ],
    generalApproach: '크로울리의 텔레마 철학과 토트 타로의 에소테릭 체계를 통해 상황을 마법적 작업으로 접근하고 참의지 실현을 추구',
    keyFocusAreas: [
      '텔레마 철학과 참의지(True Will)',
      '카발라 생명나무와 에너지 흐름',
      '점성술적 대응과 우주적 타이밍',
      '마법적 의지와 에너지 조작',
      '대사업을 통한 영적 진화'
    ],
    interpretationTips: [
      '토트 덱의 점성술적 대응을 정확히 활용하세요',
      '참의지와 소망을 명확히 구분하세요',
      '카발라적 에너지 흐름을 고려하세요',
      '마법적 타이밍과 우주적 리듬을 반영하세요',
      '에소테릭한 상징의 깊은 의미를 탐구하세요'
    ],
    commonPitfalls: [
      '텔레마를 이기적 욕망 실현으로 오해',
      '복잡한 카발라 이론에만 의존',
      '마법적 사고를 비현실적 기대로 연결',
      '개인적 발달 수준을 무시한 고차원 해석',
      '실용적 행동 없는 이론적 접근'
    ],
    difficulty: 'advanced',
    estimatedTime: 55,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 상황-행동-결과 x 원소와 계절 중심
  {
    id: 'situation-action-outcome-elemental-seasonal',
    spreadId: 'situation-action-outcome',
    styleId: 'elemental-seasonal',
    name: '상황-행동-결과 - 원소와 계절 중심',
    description: '자연의 리듬과 원소 에너지를 통한 의사결정과 실행',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '현재 상황의 원소적 특성과 계절적 에너지 분석',
        keyQuestions: [
          '이 상황은 어떤 원소 에너지가 지배적인가?',
          '현재 계절이 상황에 미치는 영향은?',
          '자연의 순환에서 이 상황의 의미는?'
        ],
        styleSpecificNotes: '카드의 원소적 속성과 현재 계절의 에너지를 통한 상황 해석',
        timeframe: '현재의 원소적 상태와 계절적 맥락'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '자연의 리듬에 맞는 조화로운 행동',
        keyQuestions: [
          '현재 계절에 가장 적합한 행동은?',
          '어떤 원소 에너지를 활용해야 하는가?',
          '자연의 순환과 조화를 이루는 행동은?'
        ],
        styleSpecificNotes: '계절적 타이밍과 원소적 균형을 고려한 행동 제시',
        timeframe: '자연 리듬에 따른 최적 행동 시기'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '자연과의 조화를 통한 지속 가능한 결과',
        keyQuestions: [
          '이 행동이 자연의 순환에 미칠 영향은?',
          '계절 변화에 따른 결과의 변화는?',
          '원소적 균형이 어떻게 회복될 것인가?'
        ],
        styleSpecificNotes: '생태적 관점에서 장기적이고 지속 가능한 결과 예측',
        timeframe: '자연 순환의 완성과 다음 주기'
      }
    ],
    generalApproach: '자연의 사원소와 계절적 리듬을 기반으로 의사결정을 내리고, 생태적 지혜와 조화로운 삶을 추구하는 관점',
    keyFocusAreas: [
      '사원소 에너지와 계절적 타이밍',
      '자연 순환과 개인적 리듬의 조화',
      '생태적 의식과 지속 가능성',
      '원소적 균형과 에너지 조율',
      '환경과의 상호작용과 적응'
    ],
    interpretationTips: [
      '현재 계절의 에너지 특성을 반영하세요',
      '카드의 원소적 속성을 정확히 파악하세요',
      '자연의 타이밍과 개인의 리듬을 연결하세요',
      '생태적 관점에서 지속 가능한 해결책을 제안하세요',
      '원소 간의 상호작용과 균형을 고려하세요'
    ],
    commonPitfalls: [
      '계절을 기계적으로 적용하는 오류',
      '원소를 단순화하여 해석하는 실수',
      '개인적 특성을 무시한 일반적 자연 적용',
      '실제 자연 경험 없는 이론적 접근',
      '현실적 제약을 고려하지 않은 이상적 제안'
    ],
    difficulty: 'intermediate',
    estimatedTime: 35,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 전통 라이더-웨이트
  {
    id: 'cross-spread-traditional-rws',
    spreadId: 'cross-spread',
    styleId: 'traditional-rws',
    name: '십자가 스프레드 - 전통 라이더-웨이트',
    description: '웨이트 전통에 따른 5방향 종합 상황 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (현재 상황)',
        interpretationFocus: '현재 상황의 핵심과 중심 에너지',
        keyQuestions: ['현재 상황의 본질은 무엇인가?', '가장 중요한 요소는?'],
        styleSpecificNotes: '전통적 카드 의미를 정확히 적용'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (과거/원인)',
        interpretationFocus: '상황의 근본 원인과 과거 영향',
        keyQuestions: ['무엇이 이 상황을 만들었는가?', '과거의 교훈은?'],
        styleSpecificNotes: '시간적 인과관계 중심 해석'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (미래/결과)',
        interpretationFocus: '현재 방향의 자연스러운 결과',
        keyQuestions: ['현재 방향대로 가면 어떻게 될 것인가?'],
        styleSpecificNotes: '전통적 예언 체계 적용'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (의식적/목표)',
        interpretationFocus: '의식적 목표와 높은 이상',
        keyQuestions: ['의식적으로 추구하는 목표는?'],
        styleSpecificNotes: '영적 차원과 높은 목적 강조'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (무의식/기반)',
        interpretationFocus: '무의식적 동기와 숨겨진 기반',
        keyQuestions: ['무의식적 동기는 무엇인가?'],
        styleSpecificNotes: '숨겨진 영향과 기반 해석'
      }
    ],
    generalApproach: '전통적 십자가 구조로 상황을 다면적으로 분석하고 균형잡힌 해석 제공',
    keyFocusAreas: ['상황의 전체적 맥락', '과거-현재-미래 연결', '의식-무의식 균형'],
    interpretationTips: ['중심 카드를 기준으로 다른 카드들과의 관계 파악', '십자가의 균형과 조화 확인'],
    commonPitfalls: ['복잡성에 압도되어 핵심 놓치기', '포지션별 의미를 기계적으로 적용'],
    difficulty: 'intermediate',
    estimatedTime: 35,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 심리학적 융 접근법
  {
    id: 'cross-spread-psychological-jungian',
    spreadId: 'cross-spread',
    styleId: 'psychological-jungian',
    name: '십자가 스프레드 - 융 심리학적 접근',
    description: '무의식의 구조와 개성화 과정을 통한 5차원 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (자기)',
        interpretationFocus: '자기(Self) 원형과 개성화의 현재 상태',
        keyQuestions: ['자기 원형이 어떻게 나타나고 있는가?'],
        styleSpecificNotes: '융의 자기(Self) 개념 중심 해석'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (과거 콤플렉스)',
        interpretationFocus: '과거에서 형성된 콤플렉스와 원형적 패턴',
        keyQuestions: ['어떤 콤플렉스가 작용하고 있는가?'],
        styleSpecificNotes: '개인적 무의식의 콤플렉스 분석'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (개성화 방향)',
        interpretationFocus: '개성화 과정의 다음 단계',
        keyQuestions: ['개성화를 위해 통합해야 할 요소는?'],
        styleSpecificNotes: '개성화 과정의 전개 방향'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (페르소나)',
        interpretationFocus: '의식적 페르소나와 사회적 가면',
        keyQuestions: ['현재 페르소나는 적절한가?'],
        styleSpecificNotes: '페르소나의 기능과 한계 분석'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (그림자)',
        interpretationFocus: '억압된 그림자와 무의식적 내용',
        keyQuestions: ['어떤 그림자 요소가 통합을 기다리고 있는가?'],
        styleSpecificNotes: '그림자의 건설적 통합 방안'
      }
    ],
    generalApproach: '융의 분석심리학 구조로 개성화 과정의 현재 위치와 발전 방향 제시',
    keyFocusAreas: ['개성화 과정', '의식-무의식 균형', '원형과 콤플렉스', '그림자 통합'],
    interpretationTips: ['자기 원형을 중심으로 다른 요소들의 관계 파악', '개성화의 발달 단계 고려'],
    commonPitfalls: ['심리학 용어의 기계적 적용', '개성화를 완성 목표로 오해'],
    difficulty: 'advanced',
    estimatedTime: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 토트 크로울리 전통
  {
    id: 'cross-spread-thoth-crowley',
    spreadId: 'cross-spread',
    styleId: 'thoth-crowley',
    name: '십자가 스프레드 - 토트 크로울리 전통',
    description: '카발라 생명나무와 텔레마 철학을 통한 5차원 에너지 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (티페렛)',
        interpretationFocus: '균형과 조화의 중심, 아름다움의 구현',
        keyQuestions: ['의지와 사랑의 균형은?', '참의지가 어떻게 나타나는가?'],
        styleSpecificNotes: '티페렛의 조화와 균형 원리 적용'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (호드)',
        interpretationFocus: '엄격함과 구조, 제한과 형태',
        keyQuestions: ['어떤 구조와 제한이 작용하는가?'],
        styleSpecificNotes: '호드 기둥의 형태 부여 원리'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (야킨)',
        interpretationFocus: '자비와 확장, 창조적 힘',
        keyQuestions: ['어떤 창조적 에너지가 활성화되어야 하는가?'],
        styleSpecificNotes: '야킨 기둥의 확장 원리'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (케테르)',
        interpretationFocus: '최고의 이상과 근원적 의지',
        keyQuestions: ['최고의 목적과 이상은?'],
        styleSpecificNotes: '케테르의 순수 의지와 근원'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (말쿠트)',
        interpretationFocus: '물질적 현현과 현실 세계',
        keyQuestions: ['물질 세계에서 어떻게 현현되는가?'],
        styleSpecificNotes: '말쿠트의 현실 구현 원리'
      }
    ],
    generalApproach: '카발라 생명나무의 구조를 통해 에너지의 흐름과 균형을 분석하고 텔레마적 실현 방향 제시',
    keyFocusAreas: ['카발라적 에너지 흐름', '텔레마 철학', '의지의 실현', '우주적 조화'],
    interpretationTips: ['생명나무의 에너지 흐름 고려', '세피로트 간의 균형과 조화', '점성술적 대응 활용'],
    commonPitfalls: ['카발라 이론의 기계적 적용', '복잡성에 압도되어 실용성 잃기'],
    difficulty: 'advanced',
    estimatedTime: 55,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 직관적 현대 해석
  {
    id: 'cross-spread-intuitive-modern',
    spreadId: 'cross-spread',
    styleId: 'intuitive-modern',
    name: '십자가 스프레드 - 직관적 현대 해석',
    description: '현대적 삶의 맥락에서 직감적이고 창의적인 5방향 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (현재 에너지)',
        interpretationFocus: '지금 이 순간의 핵심 에너지와 분위기',
        keyQuestions: ['지금 가장 강하게 느껴지는 에너지는?', '카드가 주는 첫 인상은?'],
        styleSpecificNotes: '직관적 느낌과 현대적 맥락 중시'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (뒤돌아봄)',
        interpretationFocus: '놓아줘야 할 것, 과거의 패턴',
        keyQuestions: ['무엇을 놓아줘야 하는가?', '반복되는 패턴은?'],
        styleSpecificNotes: '현대적 자기성찰과 성장 관점'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (앞으로 나아감)',
        interpretationFocus: '새로운 가능성과 창의적 방향',
        keyQuestions: ['새롭게 시도할 수 있는 것은?', '창의적 해결책은?'],
        styleSpecificNotes: '혁신과 창의성 강조'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (이상과 영감)',
        interpretationFocus: '영감과 비전, 높은 목표',
        keyQuestions: ['어떤 비전이 나를 이끄는가?', '영감의 원천은?'],
        styleSpecificNotes: '개인적 비전과 창조적 영감'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (실용적 기반)',
        interpretationFocus: '현실적 기반과 실용적 자원',
        keyQuestions: ['실제로 활용할 수 있는 자원은?', '현실적 제약은?'],
        styleSpecificNotes: '현대적 라이프스타일과 실용성'
      }
    ],
    generalApproach: '전통적 구조를 현대적 감각으로 재해석하고 개인의 직감과 창의성을 최대한 활용',
    keyFocusAreas: ['직관적 통찰', '창의적 해결책', '현대적 삶의 적용', '개인적 성장'],
    interpretationTips: ['첫 인상과 직감을 중시', '현대적 상황과 연결', '창의적 관점 제시'],
    commonPitfalls: ['지나친 주관성으로 일관성 부족', '실용적 조언 없는 추상적 해석'],
    difficulty: 'beginner',
    estimatedTime: 25,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 치료적 상담 접근법
  {
    id: 'cross-spread-therapeutic-counseling',
    spreadId: 'cross-spread',
    styleId: 'therapeutic-counseling',
    name: '십자가 스프레드 - 치료적 상담 접근',
    description: '치유와 회복을 위한 5방향 통합적 상담 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (현재 상태)',
        interpretationFocus: '현재의 전반적 웰빙과 치유 필요 영역',
        keyQuestions: ['현재 가장 주의가 필요한 영역은?', '치유의 우선순위는?'],
        styleSpecificNotes: '강점 기반 접근으로 현재 상태 평가'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (치유할 과거)',
        interpretationFocus: '치유가 필요한 과거 경험과 트라우마',
        keyQuestions: ['어떤 과거 경험이 치유를 기다리고 있는가?'],
        styleSpecificNotes: '트라우마 인식 치료 관점 적용'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (회복의 방향)',
        interpretationFocus: '치유와 회복의 구체적 방향',
        keyQuestions: ['어떤 회복과 성장이 가능한가?'],
        styleSpecificNotes: '회복탄력성과 성장 후 스트레스 고려'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (치유 자원)',
        interpretationFocus: '활용 가능한 내적 외적 치유 자원',
        keyQuestions: ['어떤 치유 자원을 활용할 수 있는가?'],
        styleSpecificNotes: '강점과 자원 중심 접근'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (안전한 기반)',
        interpretationFocus: '치유를 위한 안전한 기반과 지지체계',
        keyQuestions: ['어떤 안전한 기반이 필요한가?'],
        styleSpecificNotes: '안전감과 안정성 확보 중심'
      }
    ],
    generalApproach: '치유 중심의 관점에서 과거-현재-미래를 통합하고 회복과 성장을 위한 실용적 방향 제시',
    keyFocusAreas: ['트라우마 치유', '회복탄력성', '치유 자원', '안전한 기반', '통합적 웰빙'],
    interpretationTips: ['강점과 자원에 집중', '안전감 우선 고려', '점진적 치유 과정 존중'],
    commonPitfalls: ['빠른 치유 기대', '전문적 치료 영역 침범', '부정적 측면에만 집중'],
    difficulty: 'intermediate',
    estimatedTime: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 십자가 스프레드 x 원소와 계절 중심
  {
    id: 'cross-spread-elemental-seasonal',
    spreadId: 'cross-spread',
    styleId: 'elemental-seasonal',
    name: '십자가 스프레드 - 원소와 계절 중심',
    description: '사원소의 균형과 계절적 리듬을 통한 5방향 조화 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 (원소적 균형)',
        interpretationFocus: '현재 사원소의 균형 상태와 조화',
        keyQuestions: ['어떤 원소가 과도하거나 부족한가?', '균형 회복을 위해 필요한 것은?'],
        styleSpecificNotes: '사원소의 전체적 균형과 조화 평가'
      },
      {
        positionId: 'left',
        positionName: '왼쪽 (흙 - 안정)',
        interpretationFocus: '안정성과 실용성, 물질적 기반',
        keyQuestions: ['현재 안정성과 실용적 기반은?'],
        styleSpecificNotes: '흙 원소의 안정화와 근거 제공'
      },
      {
        positionId: 'right',
        positionName: '오른쪽 (불 - 열정)',
        interpretationFocus: '열정과 창조성, 행동 에너지',
        keyQuestions: ['어떤 열정과 행동 에너지가 필요한가?'],
        styleSpecificNotes: '불 원소의 추진력과 창조성'
      },
      {
        positionId: 'top',
        positionName: '위쪽 (공기 - 사고)',
        interpretationFocus: '사고와 소통, 정신적 명료성',
        keyQuestions: ['사고의 명료성과 소통은?'],
        styleSpecificNotes: '공기 원소의 지성과 소통'
      },
      {
        positionId: 'bottom',
        positionName: '아래쪽 (물 - 감정)',
        interpretationFocus: '감정과 직감, 내면의 흐름',
        keyQuestions: ['감정의 흐름과 직감은?'],
        styleSpecificNotes: '물 원소의 감정과 직관'
      }
    ],
    generalApproach: '사원소의 균형을 통해 전인적 조화를 추구하고 자연의 리듬과 동조하는 삶의 방향 제시',
    keyFocusAreas: ['사원소 균형', '자연과의 조화', '계절적 적응', '에너지 조율', '전인적 웰빙'],
    interpretationTips: ['사원소의 상호작용 관찰', '계절적 에너지 반영', '균형과 조화 추구'],
    commonPitfalls: ['원소의 기계적 분류', '개인차 무시', '실제 자연과의 단절'],
    difficulty: 'intermediate',
    estimatedTime: 40,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 전통 라이더-웨이트
  {
    id: 'relationship-spread-traditional-rws',
    spreadId: 'relationship-spread',
    styleId: 'traditional-rws',
    name: '관계 스프레드 - 전통 라이더-웨이트',
    description: '전통적 웨이트 체계로 관계의 역학과 발전 방향 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신',
        interpretationFocus: '관계에서 당신의 역할과 에너지 상태',
        keyQuestions: ['관계에서 내가 가져오는 에너지는?', '내 역할과 기여는?'],
        styleSpecificNotes: '전통적 카드 의미로 개인의 관계적 특성 분석'
      },
      {
        positionId: 'them',
        positionName: '상대방',
        interpretationFocus: '상대방의 관계 내 역할과 에너지',
        keyQuestions: ['상대방이 가져오는 에너지는?', '그들의 역할은?'],
        styleSpecificNotes: '객관적이고 균형잡힌 상대방 이해'
      },
      {
        positionId: 'connection',
        positionName: '연결고리',
        interpretationFocus: '두 사람을 연결하는 핵심 에너지',
        keyQuestions: ['우리를 연결하는 본질적 끈은?'],
        styleSpecificNotes: '관계의 영적이고 감정적 연결 분석'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제',
        interpretationFocus: '관계에서 극복해야 할 장애물',
        keyQuestions: ['우리가 함께 극복해야 할 과제는?'],
        styleSpecificNotes: '건설적 관점에서 도전을 성장 기회로 해석'
      },
      {
        positionId: 'strengths',
        positionName: '강점',
        interpretationFocus: '관계의 장점과 강화할 요소',
        keyQuestions: ['우리 관계의 가장 큰 강점은?'],
        styleSpecificNotes: '관계의 긍정적 측면과 발전 가능성'
      },
      {
        positionId: 'advice',
        positionName: '조언',
        interpretationFocus: '관계 개선을 위한 구체적 지혜',
        keyQuestions: ['관계 발전을 위한 조언은?'],
        styleSpecificNotes: '실용적이고 적용 가능한 관계 조언'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '관계의 발전 방향과 잠재력',
        keyQuestions: ['이 관계는 어떻게 발전할 것인가?'],
        styleSpecificNotes: '희망적이면서도 현실적인 미래 전망'
      }
    ],
    generalApproach: '전통적 타로 지혜로 관계의 복잡한 역학을 분석하고 조화로운 발전 방향 제시',
    keyFocusAreas: ['관계 역학', '상호 이해', '소통 개선', '갈등 해결', '관계 발전'],
    interpretationTips: ['양쪽 모두에게 공정한 해석', '건설적 관점 유지', '실용적 조언 제공'],
    commonPitfalls: ['편향적 해석', '관계 파괴적 조언', '지나친 이상화'],
    difficulty: 'advanced',
    estimatedTime: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 심리학적 융 접근법
  {
    id: 'relationship-spread-psychological-jungian',
    spreadId: 'relationship-spread',
    styleId: 'psychological-jungian',
    name: '관계 스프레드 - 융 심리학적 접근',
    description: '무의식적 투영과 원형적 패턴을 통한 관계 심층 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신 (의식적 태도)',
        interpretationFocus: '관계에서 당신의 의식적 태도와 페르소나',
        keyQuestions: ['관계에서 내 의식적 태도는?', '어떤 페르소나를 사용하는가?'],
        styleSpecificNotes: '의식적 관계 태도와 무의식적 동기의 차이 분석'
      },
      {
        positionId: 'them',
        positionName: '상대방 (투영된 이미지)',
        interpretationFocus: '상대방에 대한 투영과 실제 모습의 차이',
        keyQuestions: ['상대방에게 무엇을 투영하고 있는가?'],
        styleSpecificNotes: '아니마/아니무스 투영과 실제 상대방 구분'
      },
      {
        positionId: 'connection',
        positionName: '연결고리 (원형적 끌림)',
        interpretationFocus: '무의식적 원형 차원의 연결',
        keyQuestions: ['어떤 원형적 패턴이 우리를 끌어당기는가?'],
        styleSpecificNotes: '집단무의식 차원의 원형적 매력'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제 (그림자 갈등)',
        interpretationFocus: '상호 그림자 투영과 갈등',
        keyQuestions: ['서로의 그림자가 어떻게 충돌하는가?'],
        styleSpecificNotes: '그림자 투영을 인식하고 통합하는 방안'
      },
      {
        positionId: 'strengths',
        positionName: '강점 (상호 보완)',
        interpretationFocus: '심리적 상호 보완과 성장 잠재력',
        keyQuestions: ['서로의 개성화를 어떻게 도울 수 있는가?'],
        styleSpecificNotes: '상호 개성화 과정에서의 긍정적 기여'
      },
      {
        positionId: 'advice',
        positionName: '조언 (통합의 길)',
        interpretationFocus: '무의식적 갈등의 의식화와 통합',
        keyQuestions: ['투영을 거두고 진정한 만남을 위한 방법은?'],
        styleSpecificNotes: '투영 인식과 진정한 관계로의 발전'
      },
      {
        positionId: 'future',
        positionName: '미래 (개성화 여정)',
        interpretationFocus: '관계를 통한 상호 개성화의 가능성',
        keyQuestions: ['이 관계가 우리의 개성화에 어떻게 기여할 것인가?'],
        styleSpecificNotes: '관계를 통한 심리적 성장과 자기실현'
      }
    ],
    generalApproach: '융의 분석심리학으로 관계의 무의식적 역학을 이해하고 투영을 넘어선 진정한 만남 추구',
    keyFocusAreas: ['무의식적 투영', '아니마/아니무스', '그림자 갈등', '원형적 매력', '상호 개성화'],
    interpretationTips: ['투영과 실제 구분', '무의식적 동기 탐구', '개성화 관점에서 해석'],
    commonPitfalls: ['심리학적 진단', '투영을 완전히 부정적으로 봄', '개성화를 관계 목표로 설정'],
    difficulty: 'advanced',
    estimatedTime: 55,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 토트 크로울리 전통
  {
    id: 'relationship-spread-thoth-crowley',
    spreadId: 'relationship-spread',
    styleId: 'thoth-crowley',
    name: '관계 스프레드 - 토트 크로울리 전통',
    description: '텔레마 철학과 카발라적 에너지 교류를 통한 관계 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신 (의지의 표현)',
        interpretationFocus: '관계에서 당신의 참의지와 에너지 표현',
        keyQuestions: ['관계에서 내 참의지는 어떻게 표현되는가?'],
        styleSpecificNotes: '텔레마의 참의지 관점에서 관계 내 역할 분석'
      },
      {
        positionId: 'them',
        positionName: '상대방 (의지의 만남)',
        interpretationFocus: '상대방의 의지와 에너지적 특성',
        keyQuestions: ['상대방의 참의지는 무엇인가?'],
        styleSpecificNotes: '상대방의 고유한 의지와 에너지 패턴 이해'
      },
      {
        positionId: 'connection',
        positionName: '연결고리 (에너지 교류)',
        interpretationFocus: '두 의지 간의 에너지적 연결과 교류',
        keyQuestions: ['우리의 에너지는 어떻게 상호작용하는가?'],
        styleSpecificNotes: '카발라적 에너지 흐름과 점성술적 조화'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제 (의지의 충돌)',
        interpretationFocus: '서로 다른 의지 간의 갈등과 조화 방안',
        keyQuestions: ['의지의 충돌을 어떻게 조화시킬 것인가?'],
        styleSpecificNotes: '대립하는 에너지의 창조적 통합'
      },
      {
        positionId: 'strengths',
        positionName: '강점 (시너지 효과)',
        interpretationFocus: '결합된 의지의 창조적 힘과 시너지',
        keyQuestions: ['우리의 결합된 의지가 창조할 수 있는 것은?'],
        styleSpecificNotes: '상호 보완적 에너지의 마법적 결합'
      },
      {
        positionId: 'advice',
        positionName: '조언 (조화의 공식)',
        interpretationFocus: '의지의 조화와 창조적 협력을 위한 방법',
        keyQuestions: ['진정한 조화를 위한 마법적 공식은?'],
        styleSpecificNotes: '텔레마적 사랑과 의지의 실현 방안'
      },
      {
        positionId: 'future',
        positionName: '미래 (대사업의 기여)',
        interpretationFocus: '관계가 대사업에 기여하는 바',
        keyQuestions: ['이 관계가 우주적 진화에 어떻게 기여할 것인가?'],
        styleSpecificNotes: '개인적 관계를 넘어선 우주적 의미와 기여'
      }
    ],
    generalApproach: '텔레마 철학의 사랑과 의지 개념으로 관계를 우주적 차원에서 이해하고 창조적 협력 추구',
    keyFocusAreas: ['참의지의 만남', '에너지적 조화', '창조적 시너지', '우주적 기여', '마법적 협력'],
    interpretationTips: ['참의지와 소망 구분', '에너지적 상호작용 분석', '우주적 관점 제시'],
    commonPitfalls: ['텔레마를 개인적 욕망으로 축소', '과도한 이론화', '실용적 관계 조언 부족'],
    difficulty: 'advanced',
    estimatedTime: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 직관적 현대 해석
  {
    id: 'relationship-spread-intuitive-modern',
    spreadId: 'relationship-spread',
    styleId: 'intuitive-modern',
    name: '관계 스프레드 - 직관적 현대 해석',
    description: '현대적 관계 관점과 직감적 통찰로 관계 역학 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신 (현재 에너지)',
        interpretationFocus: '관계에서 당신이 가져오는 현재 에너지와 분위기',
        keyQuestions: ['지금 관계에서 내가 주는 느낌은?', '내 에너지의 특징은?'],
        styleSpecificNotes: '직관적 자기 인식과 현대적 개성 표현'
      },
      {
        positionId: 'them',
        positionName: '상대방 (상대의 바이브)',
        interpretationFocus: '상대방의 에너지와 관계에서의 분위기',
        keyQuestions: ['상대방에게서 느껴지는 바이브는?'],
        styleSpecificNotes: '선입견 없는 직관적 상대방 이해'
      },
      {
        positionId: 'connection',
        positionName: '연결고리 (케미)',
        interpretationFocus: '두 사람 사이의 화학적 반응과 케미',
        keyQuestions: ['우리 사이의 특별한 케미는?', '무엇이 우리를 끌어당기는가?'],
        styleSpecificNotes: '현대적 관계 언어로 연결감 표현'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제 (현실적 이슈)',
        interpretationFocus: '관계에서 직면하는 현실적 문제들',
        keyQuestions: ['실제로 우리가 해결해야 할 이슈는?'],
        styleSpecificNotes: '현대적 관계 문제와 솔직한 소통'
      },
      {
        positionId: 'strengths',
        positionName: '강점 (서로의 매력)',
        interpretationFocus: '서로에게 끌리는 매력 포인트',
        keyQuestions: ['서로에게서 가장 매력적인 부분은?'],
        styleSpecificNotes: '긍정적 상호 인정과 애정 표현'
      },
      {
        positionId: 'advice',
        positionName: '조언 (관계 팁)',
        interpretationFocus: '관계 개선을 위한 실용적 팁',
        keyQuestions: ['관계를 더 좋게 만들 수 있는 현실적 방법은?'],
        styleSpecificNotes: '일상에서 적용 가능한 관계 개선 방법'
      },
      {
        positionId: 'future',
        positionName: '미래 (관계 전망)',
        interpretationFocus: '관계의 자연스러운 발전 방향',
        keyQuestions: ['이 관계는 어떤 방향으로 흘러갈까?'],
        styleSpecificNotes: '희망적이고 열린 미래 가능성'
      }
    ],
    generalApproach: '현대적 관계 감각과 직관적 통찰로 관계를 자연스럽고 건강하게 발전시키는 방향 제시',
    keyFocusAreas: ['직관적 관계 이해', '현대적 소통', '자연스러운 발전', '실용적 개선', '긍정적 에너지'],
    interpretationTips: ['직감과 첫 인상 중시', '현대적 관계 언어 사용', '실용적 조언 제공'],
    commonPitfalls: ['지나친 주관성', '이론 없는 피상적 해석', '현실 도피적 조언'],
    difficulty: 'beginner',
    estimatedTime: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 치료적 상담 접근법
  {
    id: 'relationship-spread-therapeutic-counseling',
    spreadId: 'relationship-spread',
    styleId: 'therapeutic-counseling',
    name: '관계 스프레드 - 치료적 상담 접근',
    description: '관계 치료 관점에서 건강한 관계 구축을 위한 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신 (관계 패턴)',
        interpretationFocus: '당신의 관계 패턴과 애착 스타일',
        keyQuestions: ['내 관계 패턴은?', '건강한 관계를 위해 필요한 성장은?'],
        styleSpecificNotes: '애착 이론과 관계 패턴을 중심으로 분석'
      },
      {
        positionId: 'them',
        positionName: '상대방 (상대의 필요)',
        interpretationFocus: '상대방의 관계적 필요와 취약점',
        keyQuestions: ['상대방이 관계에서 필요로 하는 것은?'],
        styleSpecificNotes: '공감과 이해 중심의 상대방 인식'
      },
      {
        positionId: 'connection',
        positionName: '연결고리 (안전한 유대)',
        interpretationFocus: '안전하고 건강한 유대감의 기초',
        keyQuestions: ['우리 사이의 안전한 연결은 어떻게 구축되는가?'],
        styleSpecificNotes: '안전한 애착과 신뢰 기반 관계'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제 (치유할 상처)',
        interpretationFocus: '관계에 영향을 주는 과거 상처와 트라우마',
        keyQuestions: ['치유가 필요한 관계적 상처는?'],
        styleSpecificNotes: '트라우마 인식 관계 치료 접근'
      },
      {
        positionId: 'strengths',
        positionName: '강점 (회복력)',
        interpretationFocus: '관계의 회복력과 치유 자원',
        keyQuestions: ['우리 관계의 치유하는 힘은?'],
        styleSpecificNotes: '상호 치유와 성장 가능성'
      },
      {
        positionId: 'advice',
        positionName: '조언 (소통 방법)',
        interpretationFocus: '건강한 소통과 갈등 해결 방법',
        keyQuestions: ['더 건강한 소통을 위한 방법은?'],
        styleSpecificNotes: '비폭력 소통과 감정 코칭 기법'
      },
      {
        positionId: 'future',
        positionName: '미래 (치유된 관계)',
        interpretationFocus: '치유와 성장을 통한 관계의 발전',
        keyQuestions: ['치유된 관계는 어떤 모습일 것인가?'],
        styleSpecificNotes: '희망적이고 현실적인 관계 발전 방향'
      }
    ],
    generalApproach: '관계 치료와 상담 이론을 바탕으로 건강하고 지속 가능한 관계 구축을 위한 구체적 방향 제시',
    keyFocusAreas: ['안전한 애착', '건강한 소통', '갈등 해결', '상호 치유', '관계 성장'],
    interpretationTips: ['안전감 우선 고려', '비판 없는 수용', '구체적 소통 방법 제시'],
    commonPitfalls: ['관계 치료사 역할 과잉', '빠른 변화 기대', '개인 치료 영역 침범'],
    difficulty: 'intermediate',
    estimatedTime: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 관계 스프레드 x 원소와 계절 중심
  {
    id: 'relationship-spread-elemental-seasonal',
    spreadId: 'relationship-spread',
    styleId: 'elemental-seasonal',
    name: '관계 스프레드 - 원소와 계절 중심',
    description: '자연의 원소와 계절적 리듬을 통한 관계의 조화 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신 (개인 원소)',
        interpretationFocus: '당신의 주요 원소 에너지와 계절적 성향',
        keyQuestions: ['내 주요 원소 에너지는?', '어떤 계절적 특성을 가지고 있나?'],
        styleSpecificNotes: '개인의 원소적 성향과 자연적 리듬'
      },
      {
        positionId: 'them',
        positionName: '상대방 (상대 원소)',
        interpretationFocus: '상대방의 원소 에너지와 자연적 특성',
        keyQuestions: ['상대방의 원소적 특성은?'],
        styleSpecificNotes: '상대방의 자연적 에너지와 계절적 성향'
      },
      {
        positionId: 'connection',
        positionName: '연결고리 (원소 조화)',
        interpretationFocus: '두 원소 간의 자연스러운 조화와 균형',
        keyQuestions: ['우리의 원소는 어떻게 조화를 이루는가?'],
        styleSpecificNotes: '원소 간 상호 보완과 자연적 균형'
      },
      {
        positionId: 'challenges',
        positionName: '도전과제 (원소 갈등)',
        interpretationFocus: '원소 간 불균형과 조화의 필요성',
        keyQuestions: ['원소적 불균형을 어떻게 조화시킬 것인가?'],
        styleSpecificNotes: '원소 간 갈등의 창조적 해결'
      },
      {
        positionId: 'strengths',
        positionName: '강점 (자연적 시너지)',
        interpretationFocus: '원소의 결합이 만드는 자연적 시너지',
        keyQuestions: ['우리 원소의 결합이 창조하는 힘은?'],
        styleSpecificNotes: '원소적 결합의 창조적 잠재력'
      },
      {
        positionId: 'advice',
        positionName: '조언 (자연의 지혜)',
        interpretationFocus: '자연의 지혜를 통한 관계 조화 방법',
        keyQuestions: ['자연의 리듬에 맞춘 관계 발전 방법은?'],
        styleSpecificNotes: '계절과 자연 주기를 활용한 관계 개선'
      },
      {
        positionId: 'future',
        positionName: '미래 (계절적 순환)',
        interpretationFocus: '관계의 자연스러운 계절적 발전',
        keyQuestions: ['우리 관계는 어떤 계절을 맞이할 것인가?'],
        styleSpecificNotes: '자연의 순환에 따른 관계 발전'
      }
    ],
    generalApproach: '자연의 원소와 계절적 지혜를 통해 관계의 자연스러운 조화와 지속 가능한 발전 추구',
    keyFocusAreas: ['원소적 조화', '자연적 리듬', '계절적 적응', '생태적 관계', '자연의 지혜'],
    interpretationTips: ['원소의 상호작용 관찰', '계절적 에너지 활용', '자연의 지혜 적용'],
    commonPitfalls: ['원소의 기계적 적용', '개인차 무시', '자연과 단절된 해석'],
    difficulty: 'intermediate',
    estimatedTime: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 켈틱 크로스 x 전통 라이더-웨이트
  {
    id: 'celtic-cross-traditional-rws',
    spreadId: 'celtic-cross',
    styleId: 'traditional-rws',
    name: '켈틱 크로스 - 전통 라이더-웨이트',
    description: '가장 포괄적인 전통 웨이트 체계의 10카드 완전 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '현재 상황',
        interpretationFocus: '현재 상황의 핵심과 중심 에너지',
        keyQuestions: ['지금 상황의 본질은?'],
        styleSpecificNotes: '전통적 의미 정확히 적용'
      },
      {
        positionId: 'challenge',
        positionName: '도전/장애',
        interpretationFocus: '극복해야 할 핵심 장애물',
        keyQuestions: ['가장 큰 도전은?'],
        styleSpecificNotes: '건설적 성장 기회로 해석'
      },
      {
        positionId: 'distant-past',
        positionName: '먼 과거',
        interpretationFocus: '근본적 원인과 깊은 배경',
        keyQuestions: ['근본 원인은?'],
        styleSpecificNotes: '카르마적 배경 고려'
      },
      {
        positionId: 'recent-past',
        positionName: '가까운 과거',
        interpretationFocus: '최근의 직접적 영향',
        keyQuestions: ['최근 무엇이 영향을 주었나?'],
        styleSpecificNotes: '현재와의 직접적 연결'
      },
      {
        positionId: 'possible-outcome',
        positionName: '가능한 결과',
        interpretationFocus: '현재 방향의 자연스러운 결과',
        keyQuestions: ['이대로 가면?'],
        styleSpecificNotes: '조건부 미래 예측'
      },
      {
        positionId: 'near-future',
        positionName: '가까운 미래',
        interpretationFocus: '임박한 전개 상황',
        keyQuestions: ['곧 일어날 일은?'],
        styleSpecificNotes: '단기적 전망'
      },
      {
        positionId: 'your-approach',
        positionName: '당신의 접근',
        interpretationFocus: '취해야 할 태도와 접근법',
        keyQuestions: ['어떤 태도로?'],
        styleSpecificNotes: '실용적 행동 지침'
      },
      {
        positionId: 'external-influences',
        positionName: '외부 영향',
        interpretationFocus: '환경과 타인의 영향',
        keyQuestions: ['외부에서 오는 영향은?'],
        styleSpecificNotes: '객관적 환경 요인'
      },
      {
        positionId: 'hopes-fears',
        positionName: '희망과 두려움',
        interpretationFocus: '내면의 희망과 두려움',
        keyQuestions: ['진정한 바람과 걱정은?'],
        styleSpecificNotes: '무의식적 동기 분석'
      },
      {
        positionId: 'final-outcome',
        positionName: '최종 결과',
        interpretationFocus: '모든 요소를 종합한 최종 결과',
        keyQuestions: ['최종적으로는?'],
        styleSpecificNotes: '통합적 결론'
      }
    ],
    generalApproach: '전통적 켈틱 크로스의 완전한 체계로 상황을 다각도로 분석하고 포괄적 지혜 제공',
    keyFocusAreas: ['종합적 상황 분석', '과거-현재-미래 통합', '내외부 요인 균형'],
    interpretationTips: ['카드 간 상호관계 중시', '전체적 스토리 구성', '단계적 해석'],
    commonPitfalls: ['정보 과부하', '포지션별 기계적 해석', '일관성 부족'],
    difficulty: 'advanced',
    estimatedTime: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 켈틱 크로스 x 심리학적 융 접근법
  {
    id: 'celtic-cross-psychological-jungian',
    spreadId: 'celtic-cross',
    styleId: 'psychological-jungian',
    name: '켈틱 크로스 - 융 심리학적 접근',
    description: '개성화 과정의 완전한 지도를 통한 심층 심리 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '현재 자기(Self)',
        interpretationFocus: '현재 개성화 과정의 중심',
        keyQuestions: ['자기 원형이 어떻게 나타나는가?'],
        styleSpecificNotes: '융의 자기(Self) 중심 해석'
      },
      {
        positionId: 'challenge',
        positionName: '그림자 과제',
        interpretationFocus: '직면해야 할 그림자 요소',
        keyQuestions: ['어떤 그림자가 통합을 기다리는가?'],
        styleSpecificNotes: '그림자 통합의 기회'
      },
      {
        positionId: 'distant-past',
        positionName: '원형적 기반',
        interpretationFocus: '집단무의식의 원형적 패턴',
        keyQuestions: ['어떤 원형이 기반을 이루는가?'],
        styleSpecificNotes: '깊은 무의식 구조'
      },
      {
        positionId: 'recent-past',
        positionName: '콤플렉스 활성화',
        interpretationFocus: '최근 활성화된 콤플렉스',
        keyQuestions: ['어떤 콤플렉스가 작용했나?'],
        styleSpecificNotes: '개인무의식의 영향'
      },
      {
        positionId: 'possible-outcome',
        positionName: '개성화 전망',
        interpretationFocus: '개성화 과정의 가능한 발전',
        keyQuestions: ['개성화는 어떻게 진전될 것인가?'],
        styleSpecificNotes: '심리적 성장의 방향'
      },
      {
        positionId: 'near-future',
        positionName: '의식화 과정',
        interpretationFocus: '곧 의식화될 무의식 내용',
        keyQuestions: ['무엇이 의식으로 떠오를 것인가?'],
        styleSpecificNotes: '무의식의 의식화'
      },
      {
        positionId: 'your-approach',
        positionName: '개성화 태도',
        interpretationFocus: '개성화를 위한 의식적 태도',
        keyQuestions: ['어떤 태도로 개성화에 임할 것인가?'],
        styleSpecificNotes: '능동적 상상과 성찰'
      },
      {
        positionId: 'external-influences',
        positionName: '집단 압력',
        interpretationFocus: '사회와 집단의 영향',
        keyQuestions: ['집단 압력은 어떻게 작용하는가?'],
        styleSpecificNotes: '페르소나와 사회적 기대'
      },
      {
        positionId: 'hopes-fears',
        positionName: '아니마/아니무스',
        interpretationFocus: '내면의 대극적 요소',
        keyQuestions: ['아니마/아니무스가 어떻게 나타나는가?'],
        styleSpecificNotes: '내적 대극의 통합'
      },
      {
        positionId: 'final-outcome',
        positionName: '전체성 실현',
        interpretationFocus: '개성화를 통한 전체성 달성',
        keyQuestions: ['전체성은 어떻게 실현될 것인가?'],
        styleSpecificNotes: '자기실현의 최종 형태'
      }
    ],
    generalApproach: '융의 분석심리학 체계로 개성화 과정을 완전히 지도화하고 무의식의 통합적 이해 제공',
    keyFocusAreas: ['개성화 과정', '무의식 통합', '원형과 콤플렉스', '전체성 실현'],
    interpretationTips: ['개성화 단계 추적', '무의식-의식 관계', '원형적 패턴 인식'],
    commonPitfalls: ['과도한 이론화', '개성화 목표화', '개인성 무시'],
    difficulty: 'advanced',
    estimatedTime: 70,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 켈틱 크로스 x 토트 크로울리 전통
  {
    id: 'celtic-cross-thoth-crowley',
    spreadId: 'celtic-cross',
    styleId: 'thoth-crowley',
    name: '켈틱 크로스 - 토트 크로울리 전통',
    description: '텔레마 철학과 카발라 생명나무를 통한 우주적 차원의 완전 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '티페렛 (중심)',
        interpretationFocus: '의지와 사랑의 균형, 아름다움의 현현',
        keyQuestions: ['참의지가 어떻게 나타나는가?'],
        styleSpecificNotes: '티페렛의 조화와 균형'
      },
      {
        positionId: 'challenge',
        positionName: '아비스 건너기',
        interpretationFocus: '영적 발전을 위한 근본적 도전',
        keyQuestions: ['어떤 영적 시험을 통과해야 하는가?'],
        styleSpecificNotes: '영적 성장의 시험'
      },
      {
        positionId: 'distant-past',
        positionName: '케테르 (근원)',
        interpretationFocus: '근원적 의지와 최초 충동',
        keyQuestions: ['근원적 의지는 무엇인가?'],
        styleSpecificNotes: '순수 의지의 근원'
      },
      {
        positionId: 'recent-past',
        positionName: '달의 경로',
        interpretationFocus: '최근의 에너지 흐름과 변화',
        keyQuestions: ['어떤 에너지적 변화가 있었나?'],
        styleSpecificNotes: '생명나무상의 에너지 이동'
      },
      {
        positionId: 'possible-outcome',
        positionName: '대사업의 진전',
        interpretationFocus: '대사업(Great Work)의 가능한 성취',
        keyQuestions: ['대사업은 어떻게 진전될 것인가?'],
        styleSpecificNotes: '영적 진화의 방향'
      },
      {
        positionId: 'near-future',
        positionName: '행성 운행',
        interpretationFocus: '임박한 점성술적 영향',
        keyQuestions: ['어떤 천체 에너지가 작용할 것인가?'],
        styleSpecificNotes: '점성술적 타이밍'
      },
      {
        positionId: 'your-approach',
        positionName: '마법적 의지',
        interpretationFocus: '의지를 실현하는 마법적 접근',
        keyQuestions: ['어떤 마법적 실천이 필요한가?'],
        styleSpecificNotes: '텔레마적 실천 방법'
      },
      {
        positionId: 'external-influences',
        positionName: '우주적 흐름',
        interpretationFocus: '우주적 질서와 천체 영향',
        keyQuestions: ['우주적 흐름은 어떠한가?'],
        styleSpecificNotes: '거시적 에너지 패턴'
      },
      {
        positionId: 'hopes-fears',
        positionName: '성스러운 수호천사',
        interpretationFocus: 'HGA와의 소통과 내적 갈등',
        keyQuestions: ['성스러운 수호천사의 메시지는?'],
        styleSpecificNotes: '고등 자아와의 관계'
      },
      {
        positionId: 'final-outcome',
        positionName: '말쿠트 실현',
        interpretationFocus: '물질계에서의 의지 완전 실현',
        keyQuestions: ['의지는 어떻게 완전히 실현될 것인가?'],
        styleSpecificNotes: '영적 작업의 물질적 완성'
      }
    ],
    generalApproach: '텔레마 철학과 카발라 체계로 개인의 의지를 우주적 차원에서 이해하고 대사업의 완성을 추구',
    keyFocusAreas: ['참의지 실현', '카발라적 에너지', '점성술적 타이밍', '마법적 실천', '우주적 조화'],
    interpretationTips: ['생명나무 에너지 흐름', '점성술적 대응', 'HGA와의 소통'],
    commonPitfalls: ['과도한 복잡성', '실용성 부족', '개인 수준 무시'],
    difficulty: 'advanced',
    estimatedTime: 75,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 켈틱 크로스 x 직관적 현대 해석
  {
    id: 'celtic-cross-intuitive-modern',
    spreadId: 'celtic-cross',
    styleId: 'intuitive-modern',
    name: '켈틱 크로스 - 직관적 현대 해석',
    description: '현대적 직감과 개인적 통찰로 삶의 전체적 그림 그리기',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '지금 이 순간',
        interpretationFocus: '현재의 전체적 에너지와 분위기',
        keyQuestions: ['지금 내 삶의 전체적 느낌은?'],
        styleSpecificNotes: '직관적 현재 인식'
      },
      {
        positionId: 'challenge',
        positionName: '성장 포인트',
        interpretationFocus: '성장을 위해 극복할 지점',
        keyQuestions: ['어떤 부분에서 성장이 필요한가?'],
        styleSpecificNotes: '긍정적 성장 관점'
      },
      {
        positionId: 'distant-past',
        positionName: '깊은 뿌리',
        interpretationFocus: '나를 형성한 깊은 배경',
        keyQuestions: ['나를 만든 깊은 영향은?'],
        styleSpecificNotes: '개인사의 핵심 테마'
      },
      {
        positionId: 'recent-past',
        positionName: '최근 변화',
        interpretationFocus: '최근 삶의 중요한 변화',
        keyQuestions: ['최근 삶에서 중요한 변화는?'],
        styleSpecificNotes: '직접적 경험과 연결'
      },
      {
        positionId: 'possible-outcome',
        positionName: '가능한 미래',
        interpretationFocus: '현재 흐름이 이끄는 가능성',
        keyQuestions: ['이대로 가면 어떤 미래가?'],
        styleSpecificNotes: '희망적이고 열린 가능성'
      },
      {
        positionId: 'near-future',
        positionName: '다가올 기회',
        interpretationFocus: '곧 다가올 새로운 기회',
        keyQuestions: ['어떤 새로운 기회가 올까?'],
        styleSpecificNotes: '구체적이고 실현 가능한 기회'
      },
      {
        positionId: 'your-approach',
        positionName: '내 스타일',
        interpretationFocus: '나다운 접근 방식',
        keyQuestions: ['가장 나다운 방법은?'],
        styleSpecificNotes: '개성과 강점 활용'
      },
      {
        positionId: 'external-influences',
        positionName: '주변 환경',
        interpretationFocus: '주변 사람과 환경의 영향',
        keyQuestions: ['주변에서 오는 에너지는?'],
        styleSpecificNotes: '현실적 환경 요인'
      },
      {
        positionId: 'hopes-fears',
        positionName: '속마음',
        interpretationFocus: '진정한 바람과 우려',
        keyQuestions: ['내 마음 깊은 곳의 진짜 생각은?'],
        styleSpecificNotes: '솔직한 내면 탐색'
      },
      {
        positionId: 'final-outcome',
        positionName: '궁극적 방향',
        interpretationFocus: '삶의 궁극적 발전 방향',
        keyQuestions: ['내 삶은 궁극적으로 어디로?'],
        styleSpecificNotes: '개인적 성취와 행복'
      }
    ],
    generalApproach: '복잡한 전통 구조를 현대적 감각으로 해석하고 개인의 직감과 현실을 중시하는 통합적 접근',
    keyFocusAreas: ['직관적 통찰', '개인적 성장', '현실적 적용', '창의적 해결', '전체적 조화'],
    interpretationTips: ['첫 인상과 느낌 중시', '개인 경험과 연결', '실용적 조언'],
    commonPitfalls: ['일관성 부족', '깊이 부족', '지나친 단순화'],
    difficulty: 'intermediate',
    estimatedTime: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 켈틱 크로스 x 치료적 상담 접근법
  {
    id: 'celtic-cross-therapeutic-counseling',
    spreadId: 'celtic-cross',
    styleId: 'therapeutic-counseling',
    name: '켈틱 크로스 - 치료적 상담 접근',
    description: '전인적 치유와 회복을 위한 포괄적 상담적 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '현재 웰빙 상태',
        interpretationFocus: '전반적 정신건강과 웰빙 수준',
        keyQuestions: ['현재 전체적인 웰빙 상태는?'],
        styleSpecificNotes: '강점 기반 현재 상태 평가'
      },
      {
        positionId: 'challenge',
        positionName: '치유 과제',
        interpretationFocus: '가장 우선적인 치유 영역',
        keyQuestions: ['가장 치유가 필요한 부분은?'],
        styleSpecificNotes: '치유 우선순위 설정'
      },
      {
        positionId: 'distant-past',
        positionName: '핵심 트라우마',
        interpretationFocus: '근본적 상처와 트라우마',
        keyQuestions: ['치유가 필요한 깊은 상처는?'],
        styleSpecificNotes: '트라우마 인식 치료 접근'
      },
      {
        positionId: 'recent-past',
        positionName: '최근 스트레스',
        interpretationFocus: '최근의 스트레스 요인',
        keyQuestions: ['최근 스트레스 요인은?'],
        styleSpecificNotes: '현재 영향을 주는 요인'
      },
      {
        positionId: 'possible-outcome',
        positionName: '회복 가능성',
        interpretationFocus: '치유와 회복의 가능한 결과',
        keyQuestions: ['어떤 회복이 가능한가?'],
        styleSpecificNotes: '희망적 회복 전망'
      },
      {
        positionId: 'near-future',
        positionName: '치유 기회',
        interpretationFocus: '곧 다가올 치유의 기회',
        keyQuestions: ['어떤 치유 기회가 올까?'],
        styleSpecificNotes: '구체적 치유 경로'
      },
      {
        positionId: 'your-approach',
        positionName: '자기돌봄 방법',
        interpretationFocus: '효과적인 자기돌봄 전략',
        keyQuestions: ['어떤 자기돌봄이 필요한가?'],
        styleSpecificNotes: '실천 가능한 자기돌봄'
      },
      {
        positionId: 'external-influences',
        positionName: '지지체계',
        interpretationFocus: '외부 지지와 치유 자원',
        keyQuestions: ['어떤 외부 지지가 있는가?'],
        styleSpecificNotes: '사회적 지지 자원'
      },
      {
        positionId: 'hopes-fears',
        positionName: '치유에 대한 감정',
        interpretationFocus: '치유 과정에 대한 희망과 두려움',
        keyQuestions: ['치유에 대한 진정한 마음은?'],
        styleSpecificNotes: '치유 동기와 저항 탐색'
      },
      {
        positionId: 'final-outcome',
        positionName: '통합적 웰빙',
        interpretationFocus: '완전한 치유와 전인적 웰빙',
        keyQuestions: ['궁극적인 웰빙은 어떤 모습인가?'],
        styleSpecificNotes: '전인적 치유의 완성'
      }
    ],
    generalApproach: '트라우마 인식 치료와 강점 기반 접근으로 전인적 치유와 회복을 위한 포괄적 방향 제시',
    keyFocusAreas: ['전인적 치유', '트라우마 회복', '자기돌봄', '지지체계', '통합적 웰빙'],
    interpretationTips: ['안전감 우선', '강점 중심', '점진적 치유'],
    commonPitfalls: ['전문 치료 영역 침범', '빠른 치유 압박', '부정적 집중'],
    difficulty: 'advanced',
    estimatedTime: 65,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
  },
  {
    spreadId: 'situation-action-outcome',
    styleId: 'traditional-rws',
    specialNotes: '실용적 의사결정에 최적화된 조합. 웨이트의 전통적 해석 체계를 현대적 문제 해결에 적용하며, 논리적 인과관계를 중시한 단계별 분석 제공',
    additionalConsiderations: [
      '각 단계별 전통적 의미의 정확한 적용',
      '상황-행동-결과의 논리적 연결성 확보',
      '실행 가능한 구체적 조언 제공',
      '정립/역방향에 따른 행동 강도 조절',
      '수비학과 원소 이론을 활용한 타이밍 제안'
    ],
    recommendedFor: [
      '타로 초보자 (체계적 학습)',
      '실용적 조언 필요자',
      '비즈니스 의사결정자',
      '구체적 행동 계획 수립자',
      '전통적 타로 선호자'
    ],
    notRecommendedFor: [
      '감정적/직관적 접근 선호자',
      '추상적 영성 탐구자',
      '즉흥적 결정 선호자'
    ]
  },
  {
    spreadId: 'situation-action-outcome',
    styleId: 'intuitive-modern',
    specialNotes: '현대인의 감성과 라이프스타일에 최적화된 직관 중심 접근법. 전통적 규칙에 얽매이지 않고 개인의 창조성과 직감을 신뢰한 자유로운 해석',
    additionalConsiderations: [
      '첫 인상과 직관적 느낌의 중요성',
      '개인적 경험과 감정적 연결 활용',
      '현대적 라이프스타일과 디지털 문화 반영',
      '창조적이고 개성 있는 접근법 장려',
      '긍정적 가능성과 희망적 미래 지향'
    ],
    recommendedFor: [
      '창조적 직업군 (예술가, 디자이너, 작가)',
      '직감적 결정을 선호하는 사람',
      '현대적 감각의 젊은 층',
      '개인적 성장과 자기계발 추구자',
      '유연하고 자유로운 사고를 선호하는 사람'
    ],
    notRecommendedFor: [
      '체계적이고 논리적 접근 선호자',
      '전통적 타로 해석 추구자',
      '구체적이고 확실한 답변 원하는 자',
      '감정적 접근을 불편해하는 사람'
    ]
  },
  {
    spreadId: 'situation-action-outcome',
    styleId: 'therapeutic-counseling',
    specialNotes: '문제 해결을 치유와 성장의 관점에서 접근하는 강점 중심 상담법. 병리보다는 자원에 집중하며 점진적이고 지속가능한 변화를 추구',
    additionalConsiderations: [
      '강점과 자원 발견에 우선순위 두기',
      '자기 돌봄과 정서적 안전감 확보',
      '판단하지 않는 수용적 태도 유지',
      '점진적이고 지속가능한 변화 계획',
      '전인적 웰빙과 장기적 회복력 구축'
    ],
    recommendedFor: [
      '스트레스나 번아웃 경험자',
      '자존감이나 자신감 회복이 필요한 사람',
      '완벽주의 성향으로 고민하는 사람',
      '관계에서 어려움을 겪는 사람',
      '치유와 성장을 추구하는 사람',
      '상담이나 치료 경험이 있는 사람'
    ],
    notRecommendedFor: [
      '즉각적이고 구체적인 답변을 원하는 자',
      '감정적 접근을 회피하는 사람',
      '자기 성찰에 관심이 없는 사람',
      '변화에 대한 저항이 강한 사람'
    ]
  },
  {
    spreadId: 'mind-body-spirit',
    styleId: 'traditional-rws',
    specialNotes: '웨이트의 전통적 상징 체계를 활용한 전인적 진단. 정신-몸-영혼의 균형을 카발라적 원리와 원소 이론으로 체계적으로 분석',
    additionalConsiderations: [
      '각 영역의 전통적 의미 정확한 적용',
      '원소적 균형(불, 물, 공기, 흙) 분석',
      '카발라 생명나무와의 대응 관계',
      '정립/역방향에 따른 에너지 흐름',
      '영적 성장과 현실적 실천의 통합'
    ],
    recommendedFor: [
      '타로 전통에 관심 있는 학습자',
      '체계적이고 깊이 있는 자기 진단 원하는 자',
      '영성과 현실의 균형 추구자',
      '전인적 웰빙과 성장 관심자',
      '상징학과 신비주의 연구자'
    ],
    notRecommendedFor: [
      '즉각적이고 단순한 답변 원하는 자',
      '영적 접근을 회피하는 사람',
      '전통적 체계를 복잡하게 느끼는 사람'
    ]
  },
  {
    spreadId: 'mind-body-spirit',
    styleId: 'intuitive-modern',
    specialNotes: '현대적 웰빙과 라이프스타일 관점에서 직관적으로 접근하는 전인적 자기 돌봄. 전통적 체계보다는 개인의 직감과 현대적 감각을 중시',
    additionalConsiderations: [
      '직관적 자기 인식과 몸의 지혜 활용',
      '현대적 웰빙 트렌드와 라이프스타일 반영',
      '멘탈 헬스와 자기 돌봄 우선순위',
      '개인적 영성과 의미 추구 지원',
      '일상 실천 가능한 구체적 방법 제안'
    ],
    recommendedFor: [
      '현대적 웰빙과 자기 돌봄에 관심 있는 사람',
      '워라밸과 스트레스 관리가 필요한 직장인',
      '직관적이고 감성적인 접근을 선호하는 사람',
      '개인적 영성과 의미 추구자',
      '전통적 체계보다 자유로운 해석 선호자',
      '현대적 라이프스타일을 추구하는 젊은 층'
    ],
    notRecommendedFor: [
      '체계적이고 전통적인 접근 선호자',
      '구체적이고 논리적인 답변 원하는 자',
      '영적 접근을 회피하는 사람',
      '즉각적인 해결책만을 원하는 사람'
    ]
  },

  // 켈틱 크로스 x 원소 계절 접근법
  {
    id: 'celtic-cross-elemental-seasonal',
    spreadId: 'celtic-cross',
    styleId: 'elemental-seasonal',
    name: '켈틱 크로스 - 원소 계절 접근',
    description: '사계절과 네 원소의 순환 리듬을 통한 심층적 생명 여정 탐구',
    positionGuidelines: [
      {
        positionId: 'present-situation',
        positionName: '현재 상황 (대지의 토대)',
        interpretationFocus: '현재 경험하고 있는 원소적 에너지와 계절적 단계',
        keyQuestions: [
          '지금 내 삶에서 지배적인 원소 에너지는 무엇인가?',
          '현재 나는 어떤 계절적 단계에 있는가?',
          '이 에너지가 나에게 주는 메시지는 무엇인가?'
        ],
        styleSpecificNotes: '카드의 원소적 속성과 계절적 특성을 파악하여 현재 생명 에너지의 질과 방향 진단',
        timeframe: '현재 진행 중인 원소적 주기'
      },
      {
        positionId: 'challenge',
        positionName: '도전과 장애물 (역풍의 원소)',
        interpretationFocus: '현재 균형을 깨뜨리거나 성장을 방해하는 원소적 불균형',
        keyQuestions: [
          '어떤 원소 에너지가 과잉이거나 부족한가?',
          '이 불균형이 어떤 계절적 패턴과 연결되는가?',
          '자연의 순환에서 이 도전이 주는 의미는?'
        ],
        styleSpecificNotes: '원소 간 갈등이나 계절적 저항을 파악하여 자연스러운 해결 방향 모색',
        timeframe: '현재 겪고 있는 원소적 갈등'
      },
      {
        positionId: 'distant-past',
        positionName: '먼 과거 (뿌리의 계절)',
        interpretationFocus: '현재 상황의 원소적 뿌리와 계절적 기원',
        keyQuestions: [
          '이 상황의 씨앗이 뿌려진 계절은 언제였나?',
          '과거 어떤 원소 경험이 지금까지 영향을 주는가?',
          '조상이나 가족의 원소적 패턴은 무엇인가?'
        ],
        styleSpecificNotes: '원소의 순환 관점에서 과거의 에너지가 현재까지 어떻게 흘러왔는지 추적',
        timeframe: '생명 주기의 근본적 원소 패턴'
      },
      {
        positionId: 'recent-past',
        positionName: '최근 과거 (전환의 바람)',
        interpretationFocus: '현재로 이어진 최근의 원소적 변화와 계절적 전환',
        keyQuestions: [
          '최근 어떤 원소적 변화를 겪었는가?',
          '지난 계절에서 현재로 무엇이 이어졌나?',
          '이 전환기의 에너지적 의미는?'
        ],
        styleSpecificNotes: '계절 전환의 역학을 통해 최근 변화의 자연스러운 흐름 이해',
        timeframe: '최근 1-3개월간의 원소적 변화'
      },
      {
        positionId: 'possible-outcome',
        positionName: '가능한 결과 (미래의 씨앗)',
        interpretationFocus: '현재 원소적 흐름이 자연스럽게 이끌 수 있는 계절적 결과',
        keyQuestions: [
          '현재 에너지가 어떤 계절로 이끌고 있나?',
          '이 원소적 흐름의 자연스러운 결실은?',
          '어떤 새로운 순환이 시작될 것인가?'
        ],
        styleSpecificNotes: '자연 순환의 법칙에 따른 가능성 탐구, 강제하지 않는 자연스러운 발전',
        timeframe: '향후 한 계절(3개월) 내 자연적 발전'
      },
      {
        positionId: 'near-future',
        positionName: '가까운 미래 (다가오는 바람)',
        interpretationFocus: '곧 다가올 원소적 변화와 계절적 에너지 전환',
        keyQuestions: [
          '다음 단계에서 어떤 원소 에너지가 중요해질까?',
          '어떤 계절적 변화에 준비해야 하나?',
          '이 전환을 어떻게 자연스럽게 맞이할까?'
        ],
        styleSpecificNotes: '다가오는 원소적 변화를 미리 감지하고 조화롭게 적응하는 방법 제시',
        timeframe: '향후 4-8주간의 원소적 전환'
      },
      {
        positionId: 'your-approach',
        positionName: '당신의 접근법 (내면의 원소)',
        interpretationFocus: '현재 상황에서 자신이 취하고 있는 원소적 자세와 에너지',
        keyQuestions: [
          '나는 어떤 원소적 특성으로 상황에 접근하고 있나?',
          '내 안의 계절적 리듬은 어떤 상태인가?',
          '이 접근 방식이 자연의 흐름과 조화를 이루는가?'
        ],
        styleSpecificNotes: '개인의 원소적 성향과 현재 상황의 원소적 요구 사이의 조화 분석',
        timeframe: '현재 취하고 있는 원소적 자세'
      },
      {
        positionId: 'external-influences',
        positionName: '외부 영향 (환경의 원소)',
        interpretationFocus: '주변 환경과 타인들이 만들어내는 원소적 영향과 계절적 압력',
        keyQuestions: [
          '주변에서 어떤 원소 에너지가 나에게 영향을 주는가?',
          '환경의 계절적 리듬이 나와 어떻게 상호작용하나?',
          '이 외부 에너지들과 어떻게 조화를 이룰 수 있나?'
        ],
        styleSpecificNotes: '환경과 개인의 원소적 에너지 교류, 생태적 관점에서의 상호작용 이해',
        timeframe: '현재 영향을 주는 환경적 원소'
      },
      {
        positionId: 'hopes-fears',
        positionName: '희망과 두려움 (감정의 물)',
        interpretationFocus: '원소적 변화와 계절적 전환에 대한 깊은 감정과 직감',
        keyQuestions: [
          '어떤 계절적 변화를 가장 원하거나 두려워하나?',
          '내 안의 원소적 갈망과 저항은 무엇인가?',
          '이 감정들이 자연스러운 성장을 돕는가 방해하는가?'
        ],
        styleSpecificNotes: '감정과 직감의 물 원소적 지혜를 통해 진정한 욕구와 두려움의 뿌리 탐구',
        timeframe: '내면 깊은 곳의 원소적 감정'
      },
      {
        positionId: 'final-outcome',
        positionName: '최종 결과 (완성의 불)',
        interpretationFocus: '모든 원소가 조화롭게 통합된 최종적 변화와 성장의 완성',
        keyQuestions: [
          '이 전체 순환이 완성되었을 때 어떤 새로운 나를 만나게 될까?',
          '모든 원소가 조화를 이룬 상태는 어떤 모습인가?',
          '이 성장이 다음 큰 생명 주기에 어떻게 기여할까?'
        ],
        styleSpecificNotes: '원소들의 완전한 통합과 새로운 계절적 주기의 시작을 나타내는 변화의 완성',
        timeframe: '전체 원소적 순환의 완성 (6-12개월)'
      }
    ],
    generalApproach: '켈틱 크로스의 복잡한 구조를 네 원소(불, 물, 공기, 흙)와 사계절의 자연 순환으로 해석하여, 인생의 큰 흐름을 자연의 리듬과 조화시키는 심층적 접근. 각 위치를 원소와 계절의 특성으로 읽어내어 자연스러운 성장과 변화의 방향을 찾아가는 생태영성적 타로 리딩',
    keyFocusAreas: [
      '네 원소 에너지의 균형과 상호작용',
      '계절적 순환과 생명 주기의 조화',
      '자연 리듬과 개인 성장의 동조화',
      '원소별 특성과 위치별 의미의 융합',
      '생태적 관점에서의 전인적 치유',
      '순환적 시간 인식과 지속가능한 변화'
    ],
    interpretationTips: [
      '각 카드를 원소적 관점에서 먼저 분석한 후 위치의 의미와 결합',
      '사계절의 특성을 카드 해석에 적극 반영 (봄=시작, 여름=성장, 가을=수확, 겨울=휴식)',
      '원소 간 상호작용과 균형/불균형 패턴을 전체적으로 파악',
      '자연의 순환 법칙에 맞는 조언과 타이밍 제시',
      '강제적 변화보다는 자연스러운 흐름과 조화 강조',
      '계절적 의식과 원소별 실천법을 구체적으로 제안'
    ],
    commonPitfalls: [
      '원소와 계절을 단순히 상징으로만 취급',
      '자연 순환의 실제 리듬을 무시한 해석',
      '원소 균형보다는 특정 원소만 강조',
      '계절감과 맞지 않는 타이밍 조언',
      '생태적 감수성 없는 기계적 해석',
      '개인의 자연적 리듬 무시'
    ],
    difficulty: 'advanced',
    estimatedTime: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];