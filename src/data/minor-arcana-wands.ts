import { TarotCard } from '@/types/tarot';

// 완드(Wands) 수트 - 불의 원소, 열정과 창조력
export const wandsCards: TarotCard[] = [
  {
    id: 'wands-ace',
    number: 1,
    name: 'Ace of Wands',
    nameKorean: '완드 에이스',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['새로운 시작', '창조적 에너지', '영감', '열정', '잠재력', '기회', '동기'],
      reversed: ['지연', '좌절', '에너지 부족', '창조력 막힘', '방향성 상실', '미완성']
    },
    meaningShort: {
      upright: '새로운 창조적 프로젝트의 시작과 열정적 에너지',
      reversed: '창조적 에너지의 막힘이나 시작의 지연'
    },
    meaningDetailed: {
      upright: '완드 에이스는 순수한 창조적 에너지와 새로운 시작을 상징합니다. 열정적인 프로젝트나 아이디어가 시작되는 시기로, 무한한 잠재력과 가능성을 나타냅니다. 영감이 넘치고 새로운 모험을 시작할 준비가 된 상태입니다.',
      reversed: '창조적 에너지가 막히거나 새로운 시작이 지연되는 상태를 나타냅니다. 동기 부족이나 방향성을 찾지 못해 프로젝트가 정체되어 있을 수 있습니다.'
    },
    symbolism: [
      '손에서 나오는 완드: 신성한 영감',
      '새싹과 잎: 새로운 성장',
      '구름: 무한한 가능성',
      '산: 도전과 목표',
      '성: 성취할 목표',
      '요드: 창조의 씨앗'
    ],
    imageUrl: '/images/tarot/Wands01.jpg',
    imageDescription: '구름에서 나온 손이 잎이 돋아나는 완드를 들고 있다.',
    relatedCards: ['major-01-magician', 'wands-03', 'wands-08'],
    questions: [
      '어떤 새로운 프로젝트를 시작해야 할까요?',
      '내 안의 창조적 에너지를 어떻게 활용할 수 있을까요?',
      '지금 나에게 필요한 영감은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 무한한 창조적 잠재력을 가지고 있으며, 새로운 시작을 기꺼이 받아들입니다.',
      reversed: '나는 창조적 막힘을 극복하고, 새로운 영감을 찾아갑니다.'
    },
    advice: {
      upright: '새로운 아이디어나 프로젝트에 대한 영감을 놓치지 마세요. 지금이 시작하기 좋은 시기입니다.',
      reversed: '창조적 에너지를 되찾기 위해 휴식을 취하거나 새로운 자극을 찾아보세요.'
    },
    love: {
      upright: '새로운 사랑의 시작이나 관계에서의 열정적 에너지. 로맨틱한 새로운 단계.',
      reversed: '관계에서의 열정 부족이나 새로운 시작에 대한 주저함.'
    },
    career: {
      upright: '새로운 직업이나 프로젝트의 시작. 창조적 업무에서의 성공 가능성.',
      reversed: '직업적 아이디어의 지연이나 창조적 업무에서의 막힘.'
    },
    health: {
      upright: '새로운 건강 계획의 시작이나 활력 넘치는 에너지.',
      reversed: '에너지 부족이나 새로운 건강 계획 실행의 어려움.'
    },
    spirituality: {
      upright: '새로운 영적 여정의 시작이나 영감적 깨달음.',
      reversed: '영적 에너지의 막힘이나 수행 동기의 부족.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-02',
    number: 2,
    name: 'Two of Wands',
    nameKorean: '완드 2',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['계획', '미래 전망', '개인적 힘', '결정', '통제', '야망', '발견'],
      reversed: ['계획 부족', '두려움', '개인적 목표 부족', '무계획적 행동', '현실 도피']
    },
    meaningShort: {
      upright: '미래에 대한 계획과 개인적 힘으로 새로운 길을 모색',
      reversed: '계획 부족이나 미래에 대한 두려움으로 인한 정체'
    },
    meaningDetailed: {
      upright: '완드 2는 개인적 힘과 미래 계획을 상징합니다. 자신만의 비전을 가지고 미래를 설계하며, 새로운 가능성을 탐색하는 시기를 나타냅니다. 통제력을 가지고 자신의 운명을 개척해나가는 상태입니다.',
      reversed: '미래에 대한 명확한 계획이 없거나 두려움으로 인해 행동을 미루는 상태를 나타냅니다. 개인적 힘을 제대로 활용하지 못하고 있을 수 있습니다.'
    },
    symbolism: [
      '지구본: 세계에 대한 통제와 가능성',
      '성벽: 안전한 기반',
      '바다: 무의식과 감정',
      '산: 원거리 목표',
      '붉은 옷: 열정과 힘',
      '한 손의 완드: 개인적 힘'
    ],
    imageUrl: '/images/tarot/Wands02.jpg',
    imageDescription: '성벽에서 지구본을 바라보며 완드를 든 남자.',
    relatedCards: ['wands-ace', 'wands-03', 'major-01-magician'],
    questions: [
      '내 미래에 대한 비전은 무엇인가요?',
      '어떤 계획을 세워야 할까요?',
      '내 개인적 힘을 어떻게 활용할 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 명확한 비전을 가지고 미래를 계획하며, 내 힘으로 목표를 달성합니다.',
      reversed: '나는 두려움을 극복하고 구체적인 계획을 세워 실행합니다.'
    },
    advice: {
      upright: '장기적 관점에서 계획을 세우고 개인적 힘을 활용하여 목표를 향해 나아가세요.',
      reversed: '구체적인 계획을 세우고 두려움보다는 가능성에 집중하세요.'
    },
    love: {
      upright: '관계의 미래에 대한 계획이나 장거리 연애. 관계에서의 주도권.',
      reversed: '관계 미래에 대한 불확실성이나 계획 부족.'
    },
    career: {
      upright: '경력 계획과 미래 비전. 리더십 역할이나 독립적 업무.',
      reversed: '직업적 방향성 혼란이나 장기 계획 부족.'
    },
    health: {
      upright: '장기적 건강 계획이나 예방적 건강 관리.',
      reversed: '건강 관리 계획 부족이나 미래 건강에 대한 불안.'
    },
    spirituality: {
      upright: '영적 성장에 대한 장기적 계획이나 개인적 영적 여정.',
      reversed: '영적 방향성 혼란이나 개인적 수행 계획 부족.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-03',
    number: 3,
    name: 'Three of Wands',
    nameKorean: '완드 3',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['확장', '전망', '해외 기회', '예견', '리더십', '진전', '탐험'],
      reversed: ['좌절', '지연', '계획 실패', '개인적 집중', '국내 문제', '기회 상실']
    },
    meaningShort: {
      upright: '계획의 확장과 새로운 기회에 대한 전망',
      reversed: '확장 계획의 좌절이나 기회를 놓치는 상황'
    },
    meaningDetailed: {
      upright: '완드 3은 확장과 진전을 상징합니다. 초기 계획이 성공적으로 진행되어 더 큰 기회를 모색하는 시기를 나타냅니다. 해외 진출이나 새로운 영역으로의 확장, 그리고 미래에 대한 긍정적 전망을 의미합니다.',
      reversed: '확장 계획이 좌절되거나 기대했던 기회가 지연되는 상황을 나타냅니다. 너무 성급한 확장이나 준비 부족으로 인한 문제가 발생할 수 있습니다.'
    },
    symbolism: [
      '세 개의 완드: 확립된 기반',
      '배들: 새로운 기회와 여행',
      '바다: 무한한 가능성',
      '높은 곳: 전망과 통찰',
      '붉은 망토: 열정과 행동력',
      '원거리 땅: 미래 목표'
    ],
    imageUrl: '/images/tarot/Wands03.jpg',
    imageDescription: '높은 곳에서 바다를 바라보며 배들을 지켜보는 남자.',
    relatedCards: ['wands-02', 'wands-04', 'major-07-chariot'],
    questions: [
      '어떤 새로운 기회가 기다리고 있나요?',
      '내 계획을 어떻게 확장할 수 있을까요?',
      '미래에 대한 전망은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 성공적으로 계획을 확장하고, 새로운 기회를 적극 활용합니다.',
      reversed: '나는 인내심을 갖고 기회를 기다리며, 현재 상황을 개선해나갑니다.'
    },
    advice: {
      upright: '더 큰 기회를 위해 시야를 넓히고 확장을 고려해보세요.',
      reversed: '성급한 확장보다는 현재 기반을 더 탄탄히 하는 것이 좋습니다.'
    },
    love: {
      upright: '관계의 발전이나 새로운 단계로의 진전. 장거리 연애 가능성.',
      reversed: '관계 발전의 지연이나 거리로 인한 어려움.'
    },
    career: {
      upright: '사업 확장이나 해외 진출. 새로운 협력 관계나 파트너십.',
      reversed: '확장 계획의 지연이나 협력 관계에서의 문제.'
    },
    health: {
      upright: '건강 상태의 개선이나 새로운 치료법 발견.',
      reversed: '건강 개선 계획의 지연이나 예상보다 느린 회복.'
    },
    spirituality: {
      upright: '영적 시야의 확장이나 새로운 영적 경험.',
      reversed: '영적 성장의 지연이나 확장에 대한 두려움.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-04',
    number: 4,
    name: 'Four of Wands',
    nameKorean: '완드 4',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['축하', '안정성', '성취', '화합', '가정', '공동체', '기쁨'],
      reversed: ['불안정', '불화', '가정 문제', '지연된 축하', '부조화', '일시적 기쁨']
    },
    meaningShort: {
      upright: '성취의 축하와 안정적인 기반 구축',
      reversed: '불안정한 기반이나 화합의 부족'
    },
    meaningDetailed: {
      upright: '완드 4는 축하와 안정성을 상징합니다. 힘든 노력 끝에 얻은 성취를 축하하는 시기로, 안정적인 기반이 마련되었음을 나타냅니다. 가정이나 공동체에서의 화합과 기쁨을 의미합니다.',
      reversed: '기대했던 축하나 안정성이 지연되거나 불안정한 상태를 나타냅니다. 가정이나 공동체에서의 불화나 일시적인 기쁨만을 경험할 수 있습니다.'
    },
    symbolism: [
      '네 개의 완드: 안정적 구조',
      '화환: 축하와 성취',
      '성: 안전한 기반',
      '춤추는 인물들: 기쁨과 축하',
      '빨간 지붕: 열정적 안정',
      '다리: 연결과 통합'
    ],
    imageUrl: '/images/tarot/Wands04.jpg',
    imageDescription: '화환으로 장식된 네 개의 완드 아래에서 춤추는 사람들.',
    relatedCards: ['wands-03', 'major-21-world', 'cups-03'],
    questions: [
      '무엇을 축하해야 할까요?',
      '어떻게 안정적인 기반을 만들 수 있을까요?',
      '가정이나 공동체에서 화합을 이루려면?'
    ],
    affirmations: {
      upright: '나는 성취를 축하하고 안정적인 기반 위에서 성장합니다.',
      reversed: '나는 불안정을 극복하고 진정한 화합을 추구합니다.'
    },
    advice: {
      upright: '성취를 축하하고 감사하며, 안정적인 기반을 더욱 강화하세요.',
      reversed: '불안정한 요소를 찾아 해결하고, 진정한 화합을 위해 노력하세요.'
    },
    love: {
      upright: '관계의 안정과 약혼이나 결혼. 함께하는 축하.',
      reversed: '관계의 불안정이나 결혼 계획의 지연.'
    },
    career: {
      upright: '프로젝트 완성이나 팀의 성공. 안정적 직장 환경.',
      reversed: '직장에서의 불안정이나 팀워크 문제.'
    },
    health: {
      upright: '건강 회복의 축하나 안정적 건강 상태.',
      reversed: '건강의 일시적 개선이나 불안정한 상태.'
    },
    spirituality: {
      upright: '영적 공동체와의 화합이나 수행의 성취.',
      reversed: '영적 불안정이나 공동체와의 불화.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-05',
    number: 5,
    name: 'Five of Wands',
    nameKorean: '완드 5',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['갈등', '경쟁', '도전', '투쟁', '의견 차이', '혼란', '건전한 경쟁'],
      reversed: ['갈등 회피', '내적 갈등', '합의', '경쟁 종료', '화해', '혼란 정리']
    },
    meaningShort: {
      upright: '경쟁과 갈등 속에서의 성장과 도전',
      reversed: '갈등의 해결이나 내적 투쟁'
    },
    meaningDetailed: {
      upright: '완드 5는 갈등과 경쟁을 상징합니다. 다양한 의견과 에너지가 충돌하는 시기로, 건전한 경쟁을 통해 성장할 수 있는 기회를 나타냅니다. 혼란스럽지만 역동적인 상황입니다.',
      reversed: '갈등을 회피하거나 해결하려는 노력을 나타냅니다. 외부 갈등보다는 내적 투쟁이 있을 수 있으며, 경쟁이 끝나고 합의점을 찾는 시기입니다.'
    },
    symbolism: [
      '다섯 명의 싸우는 인물: 다양한 의견',
      '얽힌 완드들: 복잡한 갈등',
      '다양한 옷: 서로 다른 관점',
      '움직임: 역동적 에너지',
      '열린 공간: 해결 가능성',
      '서있는 자세: 굳건한 입장'
    ],
    imageUrl: '/images/tarot/Wands05.jpg',
    imageDescription: '다섯 명이 완드를 들고 서로 경쟁하는 모습.',
    relatedCards: ['wands-07', 'swords-05', 'major-15-devil'],
    questions: [
      '어떤 갈등을 해결해야 하나요?',
      '경쟁을 통해 무엇을 배울 수 있을까요?',
      '다양한 의견을 어떻게 조화시킬까요?'
    ],
    affirmations: {
      upright: '나는 건전한 경쟁을 통해 성장하고, 갈등에서 배움을 얻습니다.',
      reversed: '나는 내적 갈등을 해결하고, 평화로운 합의점을 찾습니다.'
    },
    advice: {
      upright: '갈등을 두려워하지 말고 건설적인 경쟁으로 전환하세요.',
      reversed: '불필요한 갈등은 피하고, 내면의 평화를 찾으세요.'
    },
    love: {
      upright: '관계에서의 의견 차이나 경쟁. 열정적 논쟁.',
      reversed: '갈등 해결이나 화해. 논쟁의 종료.'
    },
    career: {
      upright: '직장에서의 경쟁이나 의견 충돌. 프로젝트 갈등.',
      reversed: '팀워크 개선이나 갈등 해결. 협력 증진.'
    },
    health: {
      upright: '스트레스나 긴장으로 인한 건강 문제.',
      reversed: '스트레스 해소나 긴장 완화.'
    },
    spirituality: {
      upright: '영적 신념의 갈등이나 다양한 가르침 사이의 혼란.',
      reversed: '영적 갈등 해결이나 명확한 방향 설정.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-06',
    number: 6,
    name: 'Six of Wands',
    nameKorean: '완드 6',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['승리', '인정', '성공', '리더십', '자신감', '대중적 인기', '성취'],
      reversed: ['개인적 승리', '자만', '인정 부족', '실패', '명성 하락', '겸손']
    },
    meaningShort: {
      upright: '노력의 결실로 얻은 승리와 대중의 인정',
      reversed: '개인적 성취나 인정받지 못하는 성공'
    },
    meaningDetailed: {
      upright: '완드 6은 승리와 인정을 상징합니다. 힘든 경쟁과 도전을 극복하고 얻은 성공으로, 대중의 인정과 찬사를 받는 시기입니다. 자신감이 넘치고 리더십을 발휘하는 때입니다.',
      reversed: '외부 인정보다는 개인적 만족에 집중하거나, 기대했던 인정을 받지 못하는 상황을 나타냅니다. 겸손을 유지하고 자만을 경계해야 할 때입니다.'
    },
    symbolism: [
      '월계관: 승리와 성취',
      '말을 탄 인물: 높은 지위',
      '여섯 개의 완드: 지지와 구조',
      '환호하는 군중: 대중의 인정',
      '빨간 망토: 열정과 힘',
      '높은 완드: 리더십'
    ],
    imageUrl: '/images/tarot/Wands06.jpg',
    imageDescription: '월계관을 쓰고 말을 탄 승리자를 환호하는 군중.',
    relatedCards: ['major-07-chariot', 'wands-03', 'major-11-strength'],
    questions: [
      '어떤 성취를 인정받고 싶나요?',
      '승리를 어떻게 나눌 수 있을까요?',
      '리더십을 어떻게 발휘할까요?'
    ],
    affirmations: {
      upright: '나는 노력의 결실을 거두고, 당당히 성공을 받아들입니다.',
      reversed: '나는 겸손함을 유지하며, 개인적 성장에 집중합니다.'
    },
    advice: {
      upright: '성공을 즐기되 겸손함을 잃지 말고, 다른 이들과 나누세요.',
      reversed: '외부 인정에 연연하지 말고 내면의 만족에 집중하세요.'
    },
    love: {
      upright: '관계에서의 승리나 공개적 인정. 성공적 프로포즈.',
      reversed: '관계에서 인정받지 못하거나 개인적 만족.'
    },
    career: {
      upright: '승진이나 공개적 인정. 프로젝트 성공과 찬사.',
      reversed: '인정받지 못한 성과나 개인적 성취감.'
    },
    health: {
      upright: '건강 목표 달성이나 회복의 성공.',
      reversed: '개인적 건강 개선이나 남들이 모르는 성취.'
    },
    spirituality: {
      upright: '영적 성취의 인정이나 가르침에서의 성공.',
      reversed: '개인적 영적 성장이나 내면의 승리.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-07',
    number: 7,
    name: 'Seven of Wands',
    nameKorean: '완드 7',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['방어', '도전', '입장 고수', '경쟁', '용기', '끈기', '우위'],
      reversed: ['압도됨', '포기', '자신감 상실', '타협', '방어 실패', '후퇴']
    },
    meaningShort: {
      upright: '자신의 입장을 방어하고 도전에 맞서는 용기',
      reversed: '압도당하거나 방어를 포기하는 상황'
    },
    meaningDetailed: {
      upright: '완드 7은 방어와 도전을 상징합니다. 힘들게 얻은 위치나 신념을 지키기 위해 맞서 싸우는 상황을 나타냅니다. 용기와 끈기로 우위를 유지하려는 노력이 필요한 때입니다.',
      reversed: '도전에 압도당하거나 더 이상 싸울 힘이 없는 상태를 나타냅니다. 타협이 필요하거나 전략적 후퇴를 고려해야 할 수도 있습니다.'
    },
    symbolism: [
      '높은 곳의 인물: 우위와 전략적 위치',
      '여섯 개의 공격 완드: 다수의 도전',
      '한 개의 방어 완드: 개인의 힘',
      '다른 신발: 준비 부족',
      '절벽: 위태로운 상황',
      '결연한 표정: 의지력'
    ],
    imageUrl: '/images/tarot/Wands07.jpg',
    imageDescription: '높은 곳에서 여러 완드의 공격을 막아내는 인물.',
    relatedCards: ['wands-05', 'major-11-strength', 'wands-09'],
    questions: [
      '무엇을 지켜야 하나요?',
      '어떤 도전에 맞서고 있나요?',
      '언제까지 버틸 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 용기를 가지고 내 신념과 위치를 지켜냅니다.',
      reversed: '나는 현명하게 물러날 때를 알고, 새로운 전략을 모색합니다.'
    },
    advice: {
      upright: '당신의 입장을 굳건히 지키되, 유연한 전략을 사용하세요.',
      reversed: '무리한 방어보다는 전략적 후퇴나 타협을 고려하세요.'
    },
    love: {
      upright: '관계를 지키기 위한 노력이나 경쟁자로부터의 방어.',
      reversed: '관계 방어의 포기나 경쟁에서의 패배.'
    },
    career: {
      upright: '직위 방어나 경쟁에서의 우위 유지.',
      reversed: '직장에서의 압박감이나 위치 상실.'
    },
    health: {
      upright: '건강을 지키기 위한 적극적 노력.',
      reversed: '건강 관리 포기나 질병에 압도됨.'
    },
    spirituality: {
      upright: '신념을 지키거나 영적 도전에 맞섬.',
      reversed: '영적 신념의 흔들림이나 의심.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-08',
    number: 8,
    name: 'Eight of Wands',
    nameKorean: '완드 8',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['신속함', '움직임', '빠른 행동', '메시지', '여행', '진전', '가속'],
      reversed: ['지연', '좌절', '서두름', '나쁜 타이밍', '장애물', '인내 필요']
    },
    meaningShort: {
      upright: '빠른 진전과 신속한 메시지의 도착',
      reversed: '지연과 장애물로 인한 진행 방해'
    },
    meaningDetailed: {
      upright: '완드 8은 신속함과 움직임을 상징합니다. 상황이 빠르게 전개되고 목표를 향해 순조롭게 나아가는 시기입니다. 중요한 메시지나 소식이 도착하고, 여행이나 이동이 있을 수 있습니다.',
      reversed: '예상치 못한 지연이나 장애물로 인해 진행이 방해받는 상황을 나타냅니다. 서두르다 실수하거나 타이밍이 맞지 않을 수 있으며, 인내가 필요한 때입니다.'
    },
    symbolism: [
      '여덟 개의 날아가는 완드: 빠른 움직임',
      '맑은 하늘: 장애물 없는 길',
      '강: 흐름과 진행',
      '원거리 성: 목표와 목적지',
      '열린 풍경: 가능성과 기회',
      '대각선 방향: 역동적 에너지'
    ],
    imageUrl: '/images/tarot/Wands08.jpg',
    imageDescription: '맑은 하늘을 가로질러 날아가는 여덟 개의 완드.',
    relatedCards: ['major-08-strength', 'swords-08', 'major-00-fool'],
    questions: [
      '어떤 것이 빠르게 진행되고 있나요?',
      '기다리던 소식은 무엇인가요?',
      '어디로 여행을 가야 할까요?'
    ],
    affirmations: {
      upright: '나는 신속하게 행동하고, 기회를 놓치지 않습니다.',
      reversed: '나는 지연을 받아들이고, 적절한 타이밍을 기다립니다.'
    },
    advice: {
      upright: '지금이 행동할 때입니다. 신속하게 움직이세요.',
      reversed: '서두르지 말고 장애물을 제거한 후 진행하세요.'
    },
    love: {
      upright: '관계의 빠른 진전이나 열정적 만남. 연락의 증가.',
      reversed: '관계 진전의 지연이나 연락 두절.'
    },
    career: {
      upright: '프로젝트의 빠른 진행이나 긍정적 소식.',
      reversed: '업무 지연이나 프로젝트 장애물.'
    },
    health: {
      upright: '빠른 회복이나 건강 개선의 가속.',
      reversed: '회복 지연이나 치료 과정의 장애.'
    },
    spirituality: {
      upright: '영적 통찰의 빠른 도래나 급속한 성장.',
      reversed: '영적 성장의 정체나 깨달음의 지연.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-09',
    number: 9,
    name: 'Nine of Wands',
    nameKorean: '완드 9',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['인내', '끈기', '마지막 시련', '경계', '회복력', '용기', '준비'],
      reversed: ['소진', '편집증', '완고함', '포기', '방어벽', '피로']
    },
    meaningShort: {
      upright: '마지막 시련을 견디는 인내와 끈기',
      reversed: '소진되어 더 이상 버티기 힘든 상태'
    },
    meaningDetailed: {
      upright: '완드 9는 인내와 끈기를 상징합니다. 많은 도전을 겪었지만 아직 포기하지 않고 마지막까지 버티는 강인함을 나타냅니다. 목표 달성이 가까워졌지만 마지막 시련이 남아있습니다.',
      reversed: '오랜 투쟁으로 인한 소진과 피로를 나타냅니다. 지나친 경계심이나 편집증적 태도로 인해 도움을 거부하거나, 더 이상 버틸 힘이 없어 포기를 고려하는 상황입니다.'
    },
    symbolism: [
      '머리의 붕대: 과거의 상처',
      '아홉 개의 완드: 거의 완성된 여정',
      '경계하는 자세: 방어적 태도',
      '언덕 지형: 힘든 여정',
      '한 손의 완드: 마지막 힘',
      '피곤한 표정: 긴 투쟁의 흔적'
    ],
    imageUrl: '/images/tarot/Wands09.jpg',
    imageDescription: '상처 입은 채 완드를 들고 경계하는 인물.',
    relatedCards: ['wands-07', 'major-09-hermit', 'wands-10'],
    questions: [
      '무엇을 위해 계속 버티고 있나요?',
      '언제 쉬어야 할까요?',
      '마지막 시련은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 강인한 인내력으로 마지막까지 목표를 향해 나아갑니다.',
      reversed: '나는 적절한 휴식을 취하고, 도움을 받아들입니다.'
    },
    advice: {
      upright: '조금만 더 버티세요. 목표가 가까이 있습니다.',
      reversed: '무리하지 말고 휴식을 취하거나 도움을 요청하세요.'
    },
    love: {
      upright: '관계에서의 인내나 시련 극복. 상처에도 불구한 사랑.',
      reversed: '관계에 지치거나 방어적 태도로 인한 문제.'
    },
    career: {
      upright: '프로젝트 완성 직전이나 마지막 난관.',
      reversed: '업무 소진이나 번아웃 상태.'
    },
    health: {
      upright: '회복 과정의 마지막 단계나 재활의 끈기.',
      reversed: '치료 포기나 건강 관리 소홀.'
    },
    spirituality: {
      upright: '영적 시련의 극복이나 수행의 마지막 단계.',
      reversed: '영적 피로나 수행 포기의 유혹.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-10',
    number: 10,
    name: 'Ten of Wands',
    nameKorean: '완드 10',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['부담', '책임', '과로', '압박', '완성', '무거운 짐', '의무'],
      reversed: ['부담 경감', '위임', '해방', '책임 회피', '포기', '재정리']
    },
    meaningShort: {
      upright: '과도한 책임과 부담으로 인한 압박',
      reversed: '부담을 덜거나 책임을 재조정하는 시기'
    },
    meaningDetailed: {
      upright: '완드 10은 과도한 부담과 책임을 상징합니다. 너무 많은 일을 떠안아 압박감을 느끼는 상황으로, 성공에 가까워졌지만 그 무게가 너무 무거운 상태입니다. 완성은 가까이 있지만 대가가 큽니다.',
      reversed: '무거운 짐을 내려놓거나 책임을 다른 사람과 나누는 시기를 나타냅니다. 우선순위를 재정리하거나 불필요한 부담을 버리고 해방감을 느낄 수 있습니다.'
    },
    symbolism: [
      '열 개의 완드: 과도한 부담',
      '구부러진 자세: 무게에 짓눌림',
      '집을 향한 걸음: 목표는 가까이',
      '보이지 않는 얼굴: 개인 상실',
      '멀리 있는 집: 아직 도달하지 못함',
      '맑은 하늘: 희망은 있음'
    ],
    imageUrl: '/images/tarot/Wands10.jpg',
    imageDescription: '열 개의 완드를 힘겹게 운반하는 구부러진 인물.',
    relatedCards: ['wands-09', 'pentacles-10', 'major-21-world'],
    questions: [
      '어떤 짐을 내려놓아야 할까요?',
      '책임을 어떻게 나눌 수 있을까요?',
      '정말 모든 것을 혼자 해야 하나요?'
    ],
    affirmations: {
      upright: '나는 책임을 다하면서도 자신을 돌볼 줄 압니다.',
      reversed: '나는 불필요한 부담을 내려놓고 도움을 받아들입니다.'
    },
    advice: {
      upright: '우선순위를 정하고 도움을 요청하세요. 모든 것을 혼자 할 수 없습니다.',
      reversed: '부담을 덜고 새롭게 시작할 때입니다. 위임하는 법을 배우세요.'
    },
    love: {
      upright: '관계에서의 과도한 책임이나 일방적 부담.',
      reversed: '관계 부담의 경감이나 책임 분담.'
    },
    career: {
      upright: '업무 과부하나 과도한 책임. 번아웃 위험.',
      reversed: '업무 재분배나 부담 경감. 사직 고려.'
    },
    health: {
      upright: '과로로 인한 건강 문제나 스트레스.',
      reversed: '스트레스 해소나 건강 회복의 시작.'
    },
    spirituality: {
      upright: '영적 의무의 부담이나 과도한 수행.',
      reversed: '영적 부담 경감이나 수행 방식 변경.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-page',
    number: 11,
    name: 'Page of Wands',
    nameKorean: '완드 시종',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['열정적 메시지', '새로운 아이디어', '탐험', '자유로운 영혼', '영감', '발견', '모험'],
      reversed: ['나쁜 소식', '무모함', '아이디어 부족', '지연된 메시지', '미성숙', '충동']
    },
    meaningShort: {
      upright: '새로운 창조적 아이디어와 열정적 시작',
      reversed: '미성숙한 계획이나 충동적 행동'
    },
    meaningDetailed: {
      upright: '완드 시종은 새로운 창조적 에너지와 열정을 상징합니다. 신선한 아이디어나 영감적인 메시지가 도착하며, 모험을 향한 열망이 생깁니다. 자유롭고 탐험적인 정신으로 새로운 가능성을 발견하는 시기입니다.',
      reversed: '충동적이고 무모한 행동이나 제대로 준비되지 않은 계획을 나타냅니다. 기대했던 좋은 소식이 지연되거나 나쁜 소식이 올 수 있으며, 미성숙한 접근으로 인한 문제가 발생할 수 있습니다.'
    },
    symbolism: [
      '젊은 인물: 새로운 시작과 열정',
      '빨간 깃털 모자: 창조적 에너지',
      '도롱뇽 무늬: 불의 정령',
      '완드를 든 자세: 준비와 기대',
      '사막 배경: 도전과 모험',
      '피라미드: 고대의 지혜'
    ],
    imageUrl: '/images/tarot/Wands11.jpg',
    imageDescription: '사막에서 완드를 들고 서 있는 젊은 시종.',
    relatedCards: ['wands-ace', 'major-00-fool', 'wands-knight'],
    questions: [
      '어떤 새로운 아이디어가 떠오르나요?',
      '무엇을 탐험하고 싶나요?',
      '어떤 메시지를 기다리고 있나요?'
    ],
    affirmations: {
      upright: '나는 열정적으로 새로운 아이디어를 탐구하고 실현합니다.',
      reversed: '나는 충동을 조절하고 신중하게 계획을 세웁니다.'
    },
    advice: {
      upright: '새로운 아이디어에 열린 마음을 가지고 탐험하세요.',
      reversed: '충동적 행동을 자제하고 계획을 더 다듬으세요.'
    },
    love: {
      upright: '새로운 로맨스의 시작이나 열정적 메시지.',
      reversed: '미성숙한 접근이나 충동적 고백.'
    },
    career: {
      upright: '새로운 프로젝트 아이디어나 창조적 기회.',
      reversed: '준비 부족한 제안이나 무모한 도전.'
    },
    health: {
      upright: '새로운 운동이나 건강 계획의 열정적 시작.',
      reversed: '무리한 운동이나 준비 없는 건강 계획.'
    },
    spirituality: {
      upright: '새로운 영적 탐구나 영감적 발견.',
      reversed: '피상적 영성이나 충동적 수행.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-knight',
    number: 12,
    name: 'Knight of Wands',
    nameKorean: '완드 기사',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['모험', '충동적 행동', '열정', '여행', '대담함', '카리스마', '행동력'],
      reversed: ['무모함', '성급함', '분노', '지연', '방향 상실', '충동 조절 실패']
    },
    meaningShort: {
      upright: '열정적이고 모험적인 행동과 대담한 추진력',
      reversed: '무모하고 성급한 행동으로 인한 문제'
    },
    meaningDetailed: {
      upright: '완드 기사는 열정적 행동과 모험을 상징합니다. 대담하고 카리스마 넘치는 에너지로 목표를 향해 돌진하며, 새로운 경험과 모험을 추구합니다. 빠른 행동력과 열정으로 상황을 주도합니다.',
      reversed: '충동적이고 무모한 행동으로 인한 문제를 나타냅니다. 성급한 결정이나 분노 조절 실패로 인해 갈등이 생기거나, 방향성을 잃고 에너지를 낭비할 수 있습니다.'
    },
    symbolism: [
      '빨간 갑옷: 열정과 행동력',
      '날뛰는 말: 통제되지 않은 에너지',
      '사막 배경: 도전적 환경',
      '불꽃 망토: 불타는 열정',
      '도롱뇽 장식: 불의 정령',
      '전진하는 자세: 적극적 추진'
    ],
    imageUrl: '/images/tarot/Wands12.jpg',
    imageDescription: '빨간 갑옷을 입고 날뛰는 말을 탄 열정적인 기사.',
    relatedCards: ['wands-page', 'major-07-chariot', 'wands-08'],
    questions: [
      '어떤 모험을 시작해야 할까요?',
      '열정을 어디에 쏟아야 할까요?',
      '너무 성급하게 행동하고 있지는 않나요?'
    ],
    affirmations: {
      upright: '나는 열정과 용기로 새로운 모험을 시작합니다.',
      reversed: '나는 충동을 조절하고 신중하게 행동합니다.'
    },
    advice: {
      upright: '열정을 가지고 대담하게 행동하되, 방향을 잃지 마세요.',
      reversed: '속도를 늦추고 계획을 세운 후 행동하세요.'
    },
    love: {
      upright: '열정적 로맨스나 모험적 관계. 적극적 구애.',
      reversed: '충동적 관계나 성급한 결정. 분노 문제.'
    },
    career: {
      upright: '새로운 사업 벤처나 대담한 프로젝트 추진.',
      reversed: '무모한 사업 결정이나 충동적 퇴사.'
    },
    health: {
      upright: '활력 넘치는 에너지나 적극적 운동.',
      reversed: '무리한 활동이나 사고 위험.'
    },
    spirituality: {
      upright: '열정적 영적 탐구나 적극적 수행.',
      reversed: '극단적 수행이나 균형 잃은 영성.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-queen',
    number: 13,
    name: 'Queen of Wands',
    nameKorean: '완드 여왕',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['자신감', '독립성', '창조성', '카리스마', '열정', '리더십', '매력'],
      reversed: ['질투', '자기중심적', '까다로움', '자신감 부족', '조종', '변덕']
    },
    meaningShort: {
      upright: '자신감 넘치는 창조적 리더십과 독립적 매력',
      reversed: '자기중심적 태도나 자신감 부족'
    },
    meaningDetailed: {
      upright: '완드 여왕은 자신감과 창조성을 상징합니다. 독립적이고 카리스마 넘치는 여성 에너지로, 열정적으로 자신의 비전을 실현합니다. 다른 사람들을 격려하고 영감을 주는 천부적 리더입니다.',
      reversed: '자신감 부족이나 반대로 지나친 자기중심적 태도를 나타냅니다. 질투심이나 조종욕으로 인해 관계에 문제가 생기거나, 변덕스러운 행동으로 신뢰를 잃을 수 있습니다.'
    },
    symbolism: [
      '검은 고양이: 직관과 독립성',
      '해바라기: 긍정적 에너지',
      '완드: 창조적 힘',
      '사자 왕좌: 용기와 힘',
      '노란 드레스: 지성과 창조성',
      '사막: 열정의 영역'
    ],
    imageUrl: '/images/tarot/Wands13.jpg',
    imageDescription: '해바라기를 든 자신감 넘치는 여왕과 검은 고양이.',
    relatedCards: ['major-11-strength', 'wands-king', 'major-03-empress'],
    questions: [
      '내 안의 자신감을 어떻게 표현할까요?',
      '창조적 에너지를 어디에 집중할까요?',
      '어떻게 다른 사람들에게 영감을 줄까요?'
    ],
    affirmations: {
      upright: '나는 자신감을 가지고 창조적으로 살아가며, 다른 이들에게 영감을 줍니다.',
      reversed: '나는 겸손함을 유지하며, 진정한 자신감을 기릅니다.'
    },
    advice: {
      upright: '자신감을 가지고 창조적 프로젝트를 추진하세요.',
      reversed: '타인을 배려하고 진정한 자신감을 찾으세요.'
    },
    love: {
      upright: '열정적이고 독립적인 사랑. 자신감 있는 매력.',
      reversed: '질투나 조종욕으로 인한 관계 문제.'
    },
    career: {
      upright: '창조적 리더십이나 독립적 사업. 카리스마로 인한 성공.',
      reversed: '직장에서의 대인관계 문제나 리더십 부족.'
    },
    health: {
      upright: '활력 넘치는 건강과 긍정적 에너지.',
      reversed: '스트레스나 번아웃. 에너지 불균형.'
    },
    spirituality: {
      upright: '자신감 있는 영적 실천과 창조적 영성.',
      reversed: '영적 자만이나 균형 잃은 수행.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'wands-king',
    number: 14,
    name: 'King of Wands',
    nameKorean: '완드 왕',
    arcana: 'minor',
    suit: 'wands',
    element: 'Fire',
    keywords: {
      upright: ['리더십', '비전', '성취', '카리스마', '기업가 정신', '영감', '멘토'],
      reversed: ['독재', '오만', '충동적 결정', '비전 부족', '무책임', '폭군']
    },
    meaningShort: {
      upright: '비전을 가진 카리스마 넘치는 리더십',
      reversed: '독재적 태도나 무책임한 리더십'
    },
    meaningDetailed: {
      upright: '완드 왕은 성숙한 리더십과 비전을 상징합니다. 카리스마와 열정으로 다른 사람들을 이끌며, 큰 그림을 보는 기업가적 정신을 가지고 있습니다. 자신의 경험과 지혜로 다른 이들에게 영감을 주는 멘토 역할을 합니다.',
      reversed: '권력을 남용하거나 독재적인 태도를 나타냅니다. 충동적인 결정으로 인한 실패나 비전 없는 리더십으로 조직을 혼란에 빠뜨릴 수 있습니다. 책임감 없는 행동이 문제가 됩니다.'
    },
    symbolism: [
      '도롱뇽 장식: 불의 지배자',
      '사자 왕좌: 용기와 권위',
      '완드 홀: 창조적 권력',
      '빨간 로브: 열정과 행동',
      '왕관: 성취와 권위',
      '사막 왕국: 열정의 영역'
    ],
    imageUrl: '/images/tarot/Wands14.jpg',
    imageDescription: '도롱뇽이 장식된 왕좌에 앉은 카리스마 넘치는 왕.',
    relatedCards: ['wands-queen', 'major-04-emperor', 'major-11-strength'],
    questions: [
      '어떤 비전을 실현하고 싶나요?',
      '리더십을 어떻게 발휘할까요?',
      '누구에게 멘토가 될 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 비전과 열정으로 다른 사람들을 이끌고 영감을 줍니다.',
      reversed: '나는 겸손한 리더십을 배우고 책임감 있게 행동합니다.'
    },
    advice: {
      upright: '비전을 명확히 하고 열정적으로 리더십을 발휘하세요.',
      reversed: '독재적 태도를 버리고 협력적 리더십을 추구하세요.'
    },
    love: {
      upright: '열정적이고 보호적인 파트너. 관계에서의 리더십.',
      reversed: '지배적이거나 무책임한 파트너십.'
    },
    career: {
      upright: 'CEO나 기업가로서의 성공. 비전 있는 리더십.',
      reversed: '리더십 실패나 사업 실패. 독재적 경영.'
    },
    health: {
      upright: '강한 생명력과 활력. 건강한 에너지.',
      reversed: '스트레스로 인한 건강 문제. 번아웃.'
    },
    spirituality: {
      upright: '영적 리더나 멘토. 영감을 주는 가르침.',
      reversed: '영적 오만이나 잘못된 가르침.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];