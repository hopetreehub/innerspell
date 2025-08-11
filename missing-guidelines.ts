import { TarotGuideline } from '@/types/tarot-guidelines';

// 누락된 7개의 타로 지침
export const MISSING_TAROT_GUIDELINES: TarotGuideline[] = [
  // 1. 삼위일체 x 현실적 통찰
  {
    id: 'past-present-future-realistic-insight',
    spreadId: 'past-present-future',
    styleId: 'realistic-insight',
    name: '삼위일체 - 현실적 통찰',
    description: '과거의 실수, 현재의 문제, 미래의 위험을 직설적으로 분석',
    positionGuidelines: [
      {
        positionId: 'past',
        positionName: '과거',
        interpretationFocus: '현재 문제의 근본 원인이 된 과거의 실수나 잘못된 선택',
        keyQuestions: [
          '어떤 실수가 현재 상황을 만들었는가?',
          '무시했던 경고 신호는 무엇이었나?',
          '반복되는 실패 패턴은 무엇인가?'
        ],
        styleSpecificNotes: '미화하지 않고 실패와 실수를 직시',
        timeframe: '문제가 시작된 시점'
      },
      {
        positionId: 'present',
        positionName: '현재',
        interpretationFocus: '직면해야 할 불편한 현실과 즉각적인 문제점',
        keyQuestions: [
          '지금 가장 큰 문제는 무엇인가?',
          '회피하고 있는 현실은 무엇인가?',
          '즉시 해결해야 할 위기는?'
        ],
        styleSpecificNotes: '현실의 어려움을 있는 그대로 전달',
        timeframe: '지금 당장'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '현재 방향대로 갔을 때의 현실적 결과와 위험',
        keyQuestions: [
          '최악의 시나리오는 무엇인가?',
          '준비해야 할 현실적 어려움은?',
          '피할 수 없는 결과는 무엇인가?'
        ],
        styleSpecificNotes: '낙관적 희망보다 현실적 대비 강조',
        timeframe: '예상되는 결과'
      }
    ],
    generalApproach: '희망적 메시지를 배제하고 현실적 문제와 위험을 직설적으로 지적. 실용적 대처 방안 제시',
    keyFocusAreas: [
      '불편한 진실 직시',
      '현실적 위험 경고',
      '실패 패턴 분석',
      '즉각적 대처 필요성',
      '최악 시나리오 대비'
    ],
    interpretationTips: [
      '감정적 위로보다 현실적 조언 우선',
      '문제의 심각성을 숨기지 말 것',
      '구체적이고 실행 가능한 대안 제시',
      '긍정적 포장 없이 직설적으로 전달'
    ],
    commonPitfalls: [
      '지나친 비관주의',
      '건설적 대안 없는 비판',
      '개인 공격으로 변질',
      '희망의 완전한 차단'
    ],
    difficulty: 'intermediate',
    estimatedTime: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 2. 상황-행동-결과 x 현실적 통찰
  {
    id: 'situation-action-outcome-realistic-insight',
    spreadId: 'situation-action-outcome',
    styleId: 'realistic-insight',
    name: '상황-행동-결과 - 현실적 통찰',
    description: '현재 상황의 냉정한 분석과 실질적 행동 방안',
    positionGuidelines: [
      {
        positionId: 'situation',
        positionName: '상황',
        interpretationFocus: '미화되지 않은 현재 상황의 실제 모습',
        keyQuestions: [
          '상황이 실제로 얼마나 심각한가?',
          '숨겨진 위험 요소는 무엇인가?',
          '통제 불가능한 요인은?'
        ],
        styleSpecificNotes: '상황의 부정적 측면을 명확히 지적'
      },
      {
        positionId: 'action',
        positionName: '행동',
        interpretationFocus: '현실적으로 가능한 행동과 그 한계',
        keyQuestions: [
          '실제로 할 수 있는 것은 무엇인가?',
          '피해야 할 행동은?',
          '자원과 능력의 한계는?'
        ],
        styleSpecificNotes: '이상적 행동보다 현실적 가능성 중시'
      },
      {
        positionId: 'outcome',
        positionName: '결과',
        interpretationFocus: '예상되는 현실적 결과와 부작용',
        keyQuestions: [
          '최선을 다해도 한계는 무엇인가?',
          '예상되는 부작용은?',
          '받아들여야 할 손실은?'
        ],
        styleSpecificNotes: '과도한 기대를 경계하고 현실적 결과 제시'
      }
    ],
    generalApproach: '상황의 어려움을 인정하고, 제한된 선택지 내에서 최선의 현실적 대안 모색',
    keyFocusAreas: [
      '상황의 실제 심각성',
      '행동의 현실적 제약',
      '예상 가능한 어려움',
      '손실 최소화 전략',
      '기대치 조정'
    ],
    interpretationTips: [
      '무리한 해결책 제시 금지',
      '한계와 제약을 명확히 인정',
      '작은 개선도 가치 있음을 강조',
      '장기적 인내의 필요성 언급'
    ],
    commonPitfalls: [
      '완전한 해결 불가능으로 단정',
      '노력의 무의미함 강조',
      '대안 제시 없는 비판만',
      '개인의 노력 폄하'
    ],
    difficulty: 'intermediate',
    estimatedTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 3. 정신-몸-영혼 x 현실적 통찰
  {
    id: 'mind-body-spirit-realistic-insight',
    spreadId: 'mind-body-spirit',
    styleId: 'realistic-insight',
    name: '정신-몸-영혼 - 현실적 통찰',
    description: '정신적 한계, 신체적 제약, 영적 환상을 직시하는 통합적 현실 체크',
    positionGuidelines: [
      {
        positionId: 'mind',
        positionName: '정신',
        interpretationFocus: '정신적 문제와 인지적 왜곡의 현실적 파악',
        keyQuestions: [
          '어떤 착각이나 환상에 빠져 있는가?',
          '정신적 한계는 무엇인가?',
          '부정하고 있는 심리적 문제는?'
        ],
        styleSpecificNotes: '정신적 문제를 회피하지 않고 직면'
      },
      {
        positionId: 'body',
        positionName: '몸',
        interpretationFocus: '신체적 한계와 건강 문제의 현실적 인식',
        keyQuestions: [
          '무시하고 있는 신체 신호는?',
          '신체적 한계는 어디까지인가?',
          '건강상 위험 요소는?'
        ],
        styleSpecificNotes: '신체적 제약과 한계를 명확히 인정'
      },
      {
        positionId: 'spirit',
        positionName: '영혼',
        interpretationFocus: '영적 환상과 비현실적 기대의 현실적 조정',
        keyQuestions: [
          '비현실적인 영적 기대는 무엇인가?',
          '회피하는 실존적 문제는?',
          '받아들여야 할 한계는?'
        ],
        styleSpecificNotes: '영적 도피가 아닌 현실적 성장 강조'
      }
    ],
    generalApproach: '정신-몸-영혼의 실제 상태를 냉정하게 평가하고 현실적 균형점 모색',
    keyFocusAreas: [
      '각 영역의 실제 한계',
      '통합의 현실적 어려움',
      '즉각적 개선 필요 영역',
      '장기적 관리 필요성',
      '수용해야 할 제약'
    ],
    interpretationTips: [
      '이상적 통합보다 현실적 균형',
      '각 영역의 문제를 숨기지 않기',
      '작은 개선의 중요성 강조',
      '전문가 도움의 필요성 언급'
    ],
    commonPitfalls: [
      '영적 차원으로의 도피',
      '신체 문제 과소평가',
      '정신적 문제 부정',
      '즉각적 치유 약속'
    ],
    difficulty: 'intermediate',
    estimatedTime: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 4. 십자 스프레드 x 현실적 통찰
  {
    id: 'cross-spread-realistic-insight',
    spreadId: 'cross-spread',
    styleId: 'realistic-insight',
    name: '십자 스프레드 - 현실적 통찰',
    description: '중심 문제와 주변 영향력의 현실적 분석',
    positionGuidelines: [
      {
        positionId: 'center',
        positionName: '중심 문제',
        interpretationFocus: '핵심 문제의 실제 심각성과 복잡성',
        keyQuestions: [
          '문제의 실제 규모는?',
          '해결 가능성은 얼마나 되는가?',
          '피할 수 없는 측면은?'
        ],
        styleSpecificNotes: '문제의 심각성을 축소하지 않고 전달'
      },
      {
        positionId: 'cross-top',
        positionName: '상부 (목표/이상)',
        interpretationFocus: '비현실적 목표와 과도한 기대의 조정',
        keyQuestions: [
          '목표가 현실적인가?',
          '조정이 필요한 기대치는?',
          '포기해야 할 환상은?'
        ],
        styleSpecificNotes: '이상과 현실의 격차 직시'
      },
      {
        positionId: 'cross-bottom',
        positionName: '하부 (기반/자원)',
        interpretationFocus: '실제 가용 자원과 기반의 한계',
        keyQuestions: [
          '실제로 의지할 수 있는 것은?',
          '부족한 자원은 무엇인가?',
          '약한 기반은 어디인가?'
        ],
        styleSpecificNotes: '자원과 지원의 실제 한계 인정'
      },
      {
        positionId: 'cross-left',
        positionName: '좌측 (과거 영향)',
        interpretationFocus: '과거로부터의 부정적 영향과 제약',
        keyQuestions: [
          '과거의 어떤 문제가 여전히 영향을 주는가?',
          '극복하지 못한 트라우마는?',
          '반복되는 실패 패턴은?'
        ],
        styleSpecificNotes: '과거 문제의 지속적 영향 인정'
      },
      {
        positionId: 'cross-right',
        positionName: '우측 (미래 가능성)',
        interpretationFocus: '현실적으로 예상되는 미래와 제약',
        keyQuestions: [
          '실제로 가능한 변화는?',
          '극복할 수 없는 한계는?',
          '받아들여야 할 현실은?'
        ],
        styleSpecificNotes: '미래 가능성의 현실적 평가'
      }
    ],
    generalApproach: '문제의 복잡성과 해결의 어려움을 인정하면서 현실적 대처 방안 모색',
    keyFocusAreas: [
      '문제의 실제 복잡성',
      '각 방향의 제약과 한계',
      '현실적 해결 가능성',
      '수용해야 할 부분',
      '장기적 관리 전략'
    ],
    interpretationTips: [
      '문제 해결의 어려움 인정',
      '부분적 개선도 가치 있음',
      '외부 도움의 필요성',
      '인내와 끈기의 중요성'
    ],
    commonPitfalls: [
      '완전한 해결 불가능 단정',
      '모든 방향의 부정적 해석',
      '희망의 완전 차단',
      '노력의 무의미함 강조'
    ],
    difficulty: 'advanced',
    estimatedTime: 40,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 5. 관계 스프레드 x 현실적 통찰
  {
    id: 'relationship-spread-realistic-insight',
    spreadId: 'relationship-spread',
    styleId: 'realistic-insight',
    name: '관계 스프레드 - 현실적 통찰',
    description: '관계의 실제 문제와 한계를 직시하는 냉정한 분석',
    positionGuidelines: [
      {
        positionId: 'you',
        positionName: '당신',
        interpretationFocus: '관계에서 당신의 실제 문제와 한계',
        keyQuestions: [
          '당신의 관계 패턴의 문제는?',
          '반복하는 실수는 무엇인가?',
          '변화하기 어려운 부분은?'
        ],
        styleSpecificNotes: '자기 문제를 회피하지 않고 직면'
      },
      {
        positionId: 'them',
        positionName: '상대방',
        interpretationFocus: '상대방의 실제 모습과 변화 가능성',
        keyQuestions: [
          '상대방의 변하지 않을 부분은?',
          '무시하고 있던 문제는?',
          '기대할 수 없는 것은?'
        ],
        styleSpecificNotes: '상대방에 대한 환상 제거'
      },
      {
        positionId: 'connection',
        positionName: '연결고리',
        interpretationFocus: '관계의 실제 기반과 취약점',
        keyQuestions: [
          '관계의 실제 기반은 무엇인가?',
          '가장 약한 연결고리는?',
          '지속 가능성은 얼마나 되는가?'
        ],
        styleSpecificNotes: '관계의 현실적 한계 인정'
      },
      {
        positionId: 'challenge',
        positionName: '도전과제',
        interpretationFocus: '극복하기 어려운 근본적 문제',
        keyQuestions: [
          '해결 불가능한 문제는?',
          '타협할 수 없는 차이는?',
          '받아들여야 할 한계는?'
        ],
        styleSpecificNotes: '문제의 심각성을 축소하지 않음'
      },
      {
        positionId: 'future',
        positionName: '미래',
        interpretationFocus: '관계의 현실적 미래와 가능한 결말',
        keyQuestions: [
          '현실적으로 예상되는 결과는?',
          '준비해야 할 시나리오는?',
          '수용해야 할 가능성은?'
        ],
        styleSpecificNotes: '낙관적 희망보다 현실적 준비'
      }
    ],
    generalApproach: '관계의 문제를 미화하지 않고 현실적 한계와 가능성을 균형있게 제시',
    keyFocusAreas: [
      '개인의 관계 패턴',
      '상대방의 실제 모습',
      '관계의 구조적 문제',
      '변화의 현실적 한계',
      '수용과 결정의 필요성'
    ],
    interpretationTips: [
      '양측의 문제를 공평하게 지적',
      '변화 가능성의 현실적 평가',
      '관계 유지와 종료 모두 언급',
      '전문 상담의 필요성 제시'
    ],
    commonPitfalls: [
      '일방적 비난',
      '관계의 완전한 부정',
      '비현실적 낙관주의',
      '감정적 조작'
    ],
    difficulty: 'advanced',
    estimatedTime: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 6. 켈틱 크로스 x 원소와 계절
  {
    id: 'celtic-cross-elemental-seasonal',
    spreadId: 'celtic-cross',
    styleId: 'elemental-seasonal',
    name: '켈틱 크로스 - 원소와 계절',
    description: '10장의 카드를 통한 원소 균형과 계절적 에너지의 종합 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '현재 (중심 원소)',
        interpretationFocus: '현재 지배적인 원소 에너지와 계절적 상태',
        keyQuestions: [
          '어떤 원소가 가장 강한가?',
          '현재의 계절적 에너지는?',
          '원소 불균형이 있는가?'
        ],
        styleSpecificNotes: '현재 상황의 원소적 본질 파악'
      },
      {
        positionId: 'challenge',
        positionName: '도전 (대립 원소)',
        interpretationFocus: '균형을 깨뜨리는 대립적 원소 에너지',
        keyQuestions: [
          '어떤 원소가 충돌하는가?',
          '계절적 부조화는 무엇인가?',
          '조화가 필요한 부분은?'
        ],
        styleSpecificNotes: '원소 간 충돌과 해결 방안'
      },
      {
        positionId: 'distant-past',
        positionName: '원초적 뿌리 (흙)',
        interpretationFocus: '과거로부터의 흙 원소적 기반과 겨울의 에너지',
        keyQuestions: [
          '어떤 물질적 기반이 형성되었나?',
          '겨울의 침잠 에너지는?',
          '뿌리의 강도는?'
        ],
        styleSpecificNotes: '흙 원소의 안정성과 지속성'
      },
      {
        positionId: 'recent-past',
        positionName: '최근 흐름 (물)',
        interpretationFocus: '최근의 감정적 흐름과 물의 원소',
        keyQuestions: [
          '감정의 흐름은 어떠했나?',
          '물의 정화 작용은?',
          '가을의 수확 에너지는?'
        ],
        styleSpecificNotes: '물 원소의 감정적 영향'
      },
      {
        positionId: 'possible-outcome',
        positionName: '잠재적 결실 (불)',
        interpretationFocus: '열정과 창조의 불 원소가 만들 수 있는 결과',
        keyQuestions: [
          '어떤 열정이 타오를 수 있나?',
          '여름의 절정 에너지는?',
          '창조적 가능성은?'
        ],
        styleSpecificNotes: '불 원소의 변화와 성장 잠재력'
      },
      {
        positionId: 'near-future',
        positionName: '다가올 바람 (공기)',
        interpretationFocus: '곧 불어올 변화의 바람과 공기 원소',
        keyQuestions: [
          '어떤 새로운 아이디어가 오는가?',
          '봄의 시작 에너지는?',
          '소통과 움직임은?'
        ],
        styleSpecificNotes: '공기 원소의 변화와 소통'
      },
      {
        positionId: 'your-approach',
        positionName: '내적 원소 균형',
        interpretationFocus: '당신의 원소적 성향과 균형 상태',
        keyQuestions: [
          '내 안의 원소 균형은?',
          '부족한 원소는 무엇인가?',
          '강화할 원소는?'
        ],
        styleSpecificNotes: '개인의 원소적 특성과 조화'
      },
      {
        positionId: 'external-influences',
        positionName: '외부 자연력',
        interpretationFocus: '주변 환경의 원소적 영향과 자연의 힘',
        keyQuestions: [
          '환경의 원소적 영향은?',
          '자연의 리듬과 조화는?',
          '외부 에너지의 흐름은?'
        ],
        styleSpecificNotes: '환경과 자연의 원소적 영향'
      },
      {
        positionId: 'hopes-fears',
        positionName: '원소적 소망과 두려움',
        interpretationFocus: '원소 에너지에 대한 내적 소망과 두려움',
        keyQuestions: [
          '어떤 원소를 갈망하는가?',
          '두려워하는 자연력은?',
          '원소적 균형의 소망은?'
        ],
        styleSpecificNotes: '원소에 대한 심리적 관계'
      },
      {
        positionId: 'final-outcome',
        positionName: '원소의 대통합',
        interpretationFocus: '모든 원소가 통합된 최종적 균형 상태',
        keyQuestions: [
          '최종적 원소 균형은?',
          '계절의 완전한 순환은?',
          '자연과의 조화는?'
        ],
        styleSpecificNotes: '원소와 계절의 완전한 통합'
      }
    ],
    generalApproach: '10장의 카드를 통해 4원소와 계절 에너지의 복잡한 상호작용을 분석하고 자연의 지혜를 통한 조화 추구',
    keyFocusAreas: [
      '원소별 에너지 분포',
      '계절적 순환과 리듬',
      '자연과의 조화',
      '원소 균형 회복',
      '순환과 변화의 수용'
    ],
    interpretationTips: [
      '각 위치의 원소적 특성 파악',
      '계절 에너지와 연결',
      '자연의 리듬 존중',
      '원소 의식이나 명상 제안',
      '계절별 실천 사항 포함'
    ],
    commonPitfalls: [
      '원소 대응의 기계적 적용',
      '계절과 현실의 불일치',
      '추상적 설명만 나열',
      '실용적 조언 부재',
      '문화적 계절 차이 무시'
    ],
    difficulty: 'advanced',
    estimatedTime: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },

  // 7. 켈틱 크로스 x 현실적 통찰
  {
    id: 'celtic-cross-realistic-insight',
    spreadId: 'celtic-cross',
    styleId: 'realistic-insight',
    name: '켈틱 크로스 - 현실적 통찰',
    description: '10장을 통한 상황의 포괄적이고 냉정한 현실 분석',
    positionGuidelines: [
      {
        positionId: 'present',
        positionName: '현재 상황',
        interpretationFocus: '현재 상황의 실제 심각성과 복잡성',
        keyQuestions: [
          '상황이 정말 얼마나 어려운가?',
          '직면한 현실은 무엇인가?',
          '부정하고 있는 것은?'
        ],
        styleSpecificNotes: '상황의 어려움을 축소하지 않음'
      },
      {
        positionId: 'challenge',
        positionName: '핵심 문제',
        interpretationFocus: '가장 큰 장애물과 극복의 현실적 어려움',
        keyQuestions: [
          '정말 극복 가능한가?',
          '문제의 뿌리는 얼마나 깊은가?',
          '회피할 수 없는 것은?'
        ],
        styleSpecificNotes: '문제의 심각성을 명확히 전달'
      },
      {
        positionId: 'distant-past',
        positionName: '뿌리 깊은 원인',
        interpretationFocus: '현재 문제의 오래된 원인과 고착된 패턴',
        keyQuestions: [
          '얼마나 오래된 문제인가?',
          '바꾸기 어려운 패턴은?',
          '대물림된 문제는?'
        ],
        styleSpecificNotes: '문제의 역사적 깊이 인식'
      },
      {
        positionId: 'recent-past',
        positionName: '최근 악화 요인',
        interpretationFocus: '상황을 악화시킨 최근의 실수와 선택',
        keyQuestions: [
          '어떤 실수가 있었나?',
          '놓친 기회는 무엇인가?',
          '되돌릴 수 없는 것은?'
        ],
        styleSpecificNotes: '최근 실패와 실수 인정'
      },
      {
        positionId: 'possible-outcome',
        positionName: '가능한 시나리오',
        interpretationFocus: '현실적으로 예상되는 결과와 한계',
        keyQuestions: [
          '최선의 경우라도 한계는?',
          '현실적 기대치는?',
          '받아들여야 할 손실은?'
        ],
        styleSpecificNotes: '과도한 희망 경계'
      },
      {
        positionId: 'near-future',
        positionName: '임박한 도전',
        interpretationFocus: '곧 맞이할 어려움과 시련',
        keyQuestions: [
          '다가오는 어려움은?',
          '준비해야 할 시련은?',
          '피할 수 없는 대면은?'
        ],
        styleSpecificNotes: '다가올 어려움에 대한 경고'
      },
      {
        positionId: 'your-approach',
        positionName: '당신의 한계',
        interpretationFocus: '개인적 한계와 능력의 현실적 평가',
        keyQuestions: [
          '실제 능력은 어디까지인가?',
          '인정해야 할 약점은?',
          '혼자 할 수 없는 것은?'
        ],
        styleSpecificNotes: '개인 능력의 현실적 한계'
      },
      {
        positionId: 'external-influences',
        positionName: '외부 제약',
        interpretationFocus: '통제 불가능한 외부 요인과 제약',
        keyQuestions: [
          '통제할 수 없는 것은?',
          '의존할 수 없는 것은?',
          '기대할 수 없는 도움은?'
        ],
        styleSpecificNotes: '외부 환경의 비협조성'
      },
      {
        positionId: 'hopes-fears',
        positionName: '환상과 현실',
        interpretationFocus: '비현실적 희망과 정당한 두려움의 구분',
        keyQuestions: [
          '어떤 희망이 환상인가?',
          '정당한 두려움은 무엇인가?',
          '직시해야 할 현실은?'
        ],
        styleSpecificNotes: '희망과 두려움의 현실성 평가'
      },
      {
        positionId: 'final-outcome',
        positionName: '최종 현실',
        interpretationFocus: '모든 요소를 고려한 현실적 최종 전망',
        keyQuestions: [
          '결국 받아들여야 할 것은?',
          '변하지 않을 것은 무엇인가?',
          '장기적 대처 방안은?'
        ],
        styleSpecificNotes: '장기적 현실 수용의 필요성'
      }
    ],
    generalApproach: '10장 전체를 통해 상황의 복잡성과 어려움을 포괄적으로 분석하되, 작은 개선의 가능성도 놓치지 않음',
    keyFocusAreas: [
      '문제의 다층적 복잡성',
      '개인과 환경의 한계',
      '현실적 기대치 설정',
      '장기적 대처 전략',
      '수용과 적응의 필요성'
    ],
    interpretationTips: [
      '각 위치에서 현실적 제약 강조',
      '작은 개선도 의미 있음을 언급',
      '전문가 도움의 필요성',
      '장기전 대비의 중요성',
      '부분적 성공도 가치 인정'
    ],
    commonPitfalls: [
      '완전한 절망으로 귀결',
      '노력의 무의미함만 강조',
      '모든 가능성 차단',
      '개인 공격으로 변질',
      '건설적 대안 없는 비판'
    ],
    difficulty: 'advanced',
    estimatedTime: 65,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];