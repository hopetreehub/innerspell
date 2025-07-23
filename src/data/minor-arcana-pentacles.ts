import { TarotCard } from '@/types/tarot';

// 펜타클(Pentacles) 수트 - 흙의 원소, 물질과 실용성
export const pentaclesCards: TarotCard[] = [
  {
    id: 'pentacles-ace',
    number: 1,
    name: 'Ace of Pentacles',
    nameKorean: '펜타클 에이스',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['새로운 기회', '물질적 시작', '번영', '안정', '투자', '실용성', '성과'],
      reversed: ['기회 상실', '금전 문제', '불안정', '탐욕', '물질주의', '계획 부족']
    },
    meaningShort: {
      upright: '새로운 물질적 기회와 번영의 시작',
      reversed: '물질적 불안정이나 기회 상실'
    },
    meaningDetailed: {
      upright: '펜타클 에이스는 새로운 물질적 기회와 번영의 시작을 상징합니다. 새로운 사업, 투자, 또는 안정적인 수입원이 생길 수 있습니다. 실용적이고 구체적인 계획으로 성공의 기초를 다지는 시기입니다.',
      reversed: '물질적 기회를 놓치거나 금전적 문제가 발생하는 상황을 나타냅니다. 계획이 부족하거나 너무 물질주의적인 접근으로 인해 진정한 가치를 잃을 수 있습니다.'
    },
    symbolism: [
      '구름에서 나온 손: 신성한 선물',
      '황금 펜타클: 물질적 풍요',
      '정원: 성장과 번영',
      '아치형 길: 새로운 기회',
      '산: 안정적 기반',
      '꽃과 백합: 순수한 의도'
    ],
    imageUrl: '/images/tarot/Pentacles01.jpg',
    imageDescription: '아름다운 정원에서 구름 손이 황금 펜타클을 제시하고 있다.',
    relatedCards: ['pentacles-10', 'major-21-world', 'pentacles-03'],
    questions: [
      '어떤 새로운 기회가 있나요?',
      '물질적 목표는 무엇인가요?',
      '어떻게 안정적 기반을 만들 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 새로운 기회를 잡고, 안정적인 번영을 만들어갑니다.',
      reversed: '나는 진정한 가치를 추구하며, 물질과 정신의 균형을 찾습니다.'
    },
    advice: {
      upright: '새로운 기회를 놓치지 말고 실용적으로 접근하세요.',
      reversed: '물질적 욕심을 줄이고 진정한 가치에 집중하세요.'
    },
    love: {
      upright: '안정적인 관계나 물질적 안정을 바탕으로 한 사랑.',
      reversed: '관계에서 물질적 문제나 가치관 충돌.'
    },
    career: {
      upright: '새로운 직업 기회나 사업 시작. 재정적 성공.',
      reversed: '직업 기회 상실이나 금전적 불안정.'
    },
    health: {
      upright: '건강한 라이프스타일 시작이나 웰빙 투자.',
      reversed: '건강 관리 소홀이나 스트레스.'
    },
    spirituality: {
      upright: '물질과 영성의 조화. 실용적 영성.',
      reversed: '물질주의로 인한 영적 공허함.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-02',
    number: 2,
    name: 'Two of Pentacles',
    nameKorean: '펜타클 2',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['균형', '다중 작업', '우선순위', '적응력', '유연성', '시간 관리', '결정'],
      reversed: ['불균형', '과부하', '혼란', '우선순위 혼란', '재정 관리 실패', '스트레스']
    },
    meaningShort: {
      upright: '여러 책임 사이의 균형과 우선순위 조정',
      reversed: '균형 상실과 과부하 상태'
    },
    meaningDetailed: {
      upright: '펜타클 2는 여러 책임이나 프로젝트 사이의 균형을 상징합니다. 시간과 자원을 효율적으로 관리하며, 변화하는 상황에 유연하게 적응합니다. 우선순위를 정하고 조화를 유지하는 능력이 필요합니다.',
      reversed: '너무 많은 일을 떠안아 균형을 잃은 상태를 나타냅니다. 우선순위가 혼란스럽고 재정 관리에 실패하거나, 스트레스로 인해 모든 것이 엉망이 될 수 있습니다.'
    },
    symbolism: [
      '저글링하는 인물: 균형과 기술',
      '두 개의 펜타클: 이중 책임',
      '무한대 끈: 영원한 순환',
      '파도치는 바다: 변화하는 상황',
      '배들: 오고 가는 기회',
      '춤추는 자세: 유연성'
    ],
    imageUrl: '/images/tarot/Pentacles02.jpg',
    imageDescription: '바다를 배경으로 두 개의 펜타클을 저글링하는 인물.',
    relatedCards: ['major-14-temperance', 'pentacles-07', 'swords-02'],
    questions: [
      '어떤 균형을 맞춰야 하나요?',
      '우선순위는 무엇인가요?',
      '시간을 더 효율적으로 관리하려면?'
    ],
    affirmations: {
      upright: '나는 유연하게 적응하며, 모든 책임을 균형 있게 처리합니다.',
      reversed: '나는 우선순위를 정하고, 균형을 회복합니다.'
    },
    advice: {
      upright: '유연성을 유지하면서도 우선순위를 명확히 하세요.',
      reversed: '너무 많은 일을 줄이고 중요한 것에 집중하세요.'
    },
    love: {
      upright: '관계와 다른 책임들 사이의 균형.',
      reversed: '관계 소홀이나 일과 사랑의 불균형.'
    },
    career: {
      upright: '여러 프로젝트의 성공적 관리. 멀티태스킹.',
      reversed: '업무 과부하나 프로젝트 관리 실패.'
    },
    health: {
      upright: '일과 휴식의 균형. 건강한 라이프스타일.',
      reversed: '스트레스나 과로로 인한 건강 문제.'
    },
    spirituality: {
      upright: '물질과 영성의 균형 잡힌 추구.',
      reversed: '영적 불균형이나 세속적 집착.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-03',
    number: 3,
    name: 'Three of Pentacles',
    nameKorean: '펜타클 3',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['협력', '팀워크', '기술', '학습', '계획', '건설', '인정'],
      reversed: ['협력 부족', '기술 부족', '게으름', '품질 저하', '팀워크 실패', '인정 부족']
    },
    meaningShort: {
      upright: '협력과 기술을 통한 프로젝트 성공',
      reversed: '협력 실패나 기술 부족'
    },
    meaningDetailed: {
      upright: '펜타클 3은 협력과 기술을 통한 성공을 상징합니다. 팀워크와 전문성이 결합되어 훌륭한 결과를 만들어내는 시기입니다. 학습과 경험을 통해 기술을 발전시키고 인정받습니다.',
      reversed: '팀워크의 부족이나 개인적 기술 부족으로 인한 실패를 나타냅니다. 게으름이나 품질에 대한 무관심으로 인해 기대에 못 미치는 결과가 나올 수 있습니다.'
    },
    symbolism: [
      '건축가와 승려들: 협력과 계획',
      '교회 건설: 장기적 프로젝트',
      '설계도: 계획과 기술',
      '세 개의 펜타클: 삼위일체의 협력',
      '아치형 구조: 안정성',
      '토론하는 모습: 소통과 협의'
    ],
    imageUrl: '/images/tarot/Pentacles03.jpg',
    imageDescription: '교회에서 건축가와 승려들이 설계를 논의하고 있다.',
    relatedCards: ['pentacles-08', 'major-05-hierophant', 'pentacles-06'],
    questions: [
      '누구와 협력해야 하나요?',
      '어떤 기술을 배워야 하나요?',
      '팀워크를 어떻게 개선할 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 다른 사람들과 협력하여 훌륭한 결과를 만들어냅니다.',
      reversed: '나는 기술을 연마하고, 효과적인 협력 방법을 배웁니다.'
    },
    advice: {
      upright: '전문가들과 협력하고 지속적으로 학습하세요.',
      reversed: '기술을 향상시키고 협력 정신을 기르세요.'
    },
    love: {
      upright: '관계에서의 상호 협력과 기술 교환.',
      reversed: '관계에서의 소통 부족이나 노력 부족.'
    },
    career: {
      upright: '팀 프로젝트 성공이나 기술적 성취.',
      reversed: '직장에서의 협력 문제나 기술 부족.'
    },
    health: {
      upright: '건강 관리에서의 전문가 협력.',
      reversed: '건강 관리 소홀이나 전문가 조언 무시.'
    },
    spirituality: {
      upright: '영적 공동체에서의 학습과 성장.',
      reversed: '영적 성장의 게으름이나 공동체 문제.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-04',
    number: 4,
    name: 'Four of Pentacles',
    nameKorean: '펜타클 4',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['보수성', '안정', '절약', '통제', '보안', '인색함', '소유욕'],
      reversed: ['관대함', '위험 감수', '투자', '나눔', '자유로움', '변화', '손실']
    },
    meaningShort: {
      upright: '보수적인 안정과 소유에 대한 집착',
      reversed: '관대함과 변화에 대한 개방'
    },
    meaningDetailed: {
      upright: '펜타클 4는 보수적인 안정과 소유에 대한 집착을 상징합니다. 재정적 안정을 위해 위험을 피하고 절약하지만, 지나치면 인색함이나 변화에 대한 두려움으로 발전할 수 있습니다.',
      reversed: '소유욕에서 벗어나 관대함을 보이거나, 안정을 포기하고 새로운 기회에 투자하는 상태를 나타냅니다. 변화를 받아들이고 나눔의 기쁨을 발견할 수 있습니다.'
    },
    symbolism: [
      '왕관을 쓴 인물: 소유와 지위',
      '꽉 잡은 펜타클: 소유욕',
      '발 아래 펜타클: 기반과 토대',
      '머리 위 펜타클: 집착과 보호',
      '도시 배경: 물질적 성취',
      '경직된 자세: 유연성 부족'
    ],
    imageUrl: '/images/tarot/Pentacles04.jpg',
    imageDescription: '왕관을 쓰고 네 개의 펜타클을 꽉 잡고 있는 인물.',
    relatedCards: ['pentacles-05', 'major-04-emperor', 'pentacles-king'],
    questions: [
      '무엇을 너무 꽉 잡고 있나요?',
      '안정과 성장의 균형은 어떤가요?',
      '나눔의 기쁨을 경험해본 적이 있나요?'
    ],
    affirmations: {
      upright: '나는 안정을 유지하되, 유연성도 잃지 않습니다.',
      reversed: '나는 관대하게 나누며, 새로운 기회에 열려있습니다.'
    },
    advice: {
      upright: '안정은 좋지만 성장 기회도 놓치지 마세요.',
      reversed: '나눔의 기쁨을 경험하고 새로운 투자를 고려하세요.'
    },
    love: {
      upright: '관계에서의 소유욕이나 과도한 보호.',
      reversed: '관계에서 자유를 주고 신뢰를 보임.'
    },
    career: {
      upright: '안정적인 직업이나 보수적인 투자.',
      reversed: '새로운 직업 기회나 위험한 투자.'
    },
    health: {
      upright: '건강에 대한 과도한 걱정이나 보수적 접근.',
      reversed: '새로운 치료법 시도나 건강 투자.'
    },
    spirituality: {
      upright: '물질적 안정에 대한 집착.',
      reversed: '영적 성장을 위한 물질적 희생.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-05',
    number: 5,
    name: 'Five of Pentacles',
    nameKorean: '펜타클 5',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['빈곤', '어려움', '배제', '건강 문제', '영적 빈곤', '고립', '도움 필요'],
      reversed: ['회복', '도움 받기', '개선', '영적 위안', '공동체 지원', '회복력']
    },
    meaningShort: {
      upright: '물질적, 정신적 어려움과 고립',
      reversed: '어려움에서 벗어나 회복 시작'
    },
    meaningDetailed: {
      upright: '펜타클 5는 물질적, 정신적 어려움을 상징합니다. 빈곤, 실업, 건강 문제로 인한 고립감을 나타내며, 도움이 가까이 있음에도 불구하고 자존심이나 절망으로 인해 받아들이지 못할 수 있습니다.',
      reversed: '어려운 상황에서 벗어나기 시작하거나 도움을 받아들이는 상태를 나타냅니다. 공동체의 지원을 받거나 영적 위안을 찾아 회복의 길을 걷기 시작합니다.'
    },
    symbolism: [
      '두 명의 가난한 사람: 어려움과 고립',
      '눈과 추위: 시련과 어려움',
      '교회 창문: 가까운 도움',
      '빛나는 창문: 희망과 위안',
      '다친 발: 건강 문제',
      '목발: 지지와 도움'
    ],
    imageUrl: '/images/tarot/Pentacles05.jpg',
    imageDescription: '눈 내리는 밤에 교회 창문 밑을 지나가는 가난한 두 사람.',
    relatedCards: ['pentacles-04', 'major-16-tower', 'pentacles-06'],
    questions: [
      '어떤 어려움을 겪고 있나요?',
      '누구의 도움이 필요한가요?',
      '자존심이 도움 받기를 방해하고 있나요?'
    ],
    affirmations: {
      upright: '나는 어려움 속에서도 희망을 잃지 않고, 도움을 요청할 용기를 냅니다.',
      reversed: '나는 도움을 받아들이고, 어려움을 극복해나갑니다.'
    },
    advice: {
      upright: '자존심을 버리고 도움을 요청하세요. 희망을 잃지 마세요.',
      reversed: '도움을 받아들이고 감사하며, 회복에 집중하세요.'
    },
    love: {
      upright: '관계에서의 소외감이나 정서적 빈곤.',
      reversed: '관계 회복이나 새로운 사랑의 위안.'
    },
    career: {
      upright: '실업이나 직업적 어려움. 재정 문제.',
      reversed: '직업 기회 발견이나 재정 상황 개선.'
    },
    health: {
      upright: '건강 문제나 의료비 부담.',
      reversed: '건강 회복이나 의료 지원 받기.'
    },
    spirituality: {
      upright: '영적 공허함이나 신앙의 위기.',
      reversed: '영적 위안과 공동체의 지원.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-06',
    number: 6,
    name: 'Six of Pentacles',
    nameKorean: '펜타클 6',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['관대함', '나눔', '자선', '균형', '상호부조', '공정성', '지원'],
      reversed: ['불공정', '이기심', '부채', '의존성', '조건부 도움', '착취']
    },
    meaningShort: {
      upright: '관대한 나눔과 균형 잡힌 주고받음',
      reversed: '불공정한 교환이나 의존적 관계'
    },
    meaningDetailed: {
      upright: '펜타클 6은 관대한 나눔과 균형 잡힌 주고받음을 상징합니다. 여유가 있을 때 도움이 필요한 사람들을 돕고, 서로 상호부조하는 건강한 관계를 나타냅니다. 공정하고 균형 잡힌 교환이 이루어집니다.',
      reversed: '불공정한 교환이나 일방적인 의존 관계를 나타냅니다. 도움을 조건부로 제공하거나 받는 쪽이 지나치게 의존적이 되어 불균형이 생길 수 있습니다.'
    },
    symbolism: [
      '저울을 든 부자: 공정한 분배',
      '구걸하는 사람들: 도움이 필요한 자',
      '동전을 주는 행위: 나눔과 자선',
      '저울: 균형과 공정성',
      '부유한 옷차림: 풍요와 여유',
      '겸손한 자세: 감사와 겸손'
    ],
    imageUrl: '/images/tarot/Pentacles06.jpg',
    imageDescription: '저울을 들고 구걸하는 사람들에게 동전을 나누어주는 부자.',
    relatedCards: ['pentacles-05', 'major-11-justice', 'pentacles-10'],
    questions: [
      '누구와 나눌 수 있나요?',
      '주고받음의 균형이 맞나요?',
      '어떤 도움을 줄 수 있나요?'
    ],
    affirmations: {
      upright: '나는 관대하게 나누며, 균형 잡힌 관계를 만들어갑니다.',
      reversed: '나는 공정한 교환을 추구하고, 건강한 경계를 설정합니다.'
    },
    advice: {
      upright: '여유가 있을 때 나누되, 균형을 잊지 마세요.',
      reversed: '일방적인 관계를 피하고 상호 존중하는 관계를 만드세요.'
    },
    love: {
      upright: '관계에서의 균형 잡힌 주고받음.',
      reversed: '관계에서 일방적 희생이나 의존.'
    },
    career: {
      upright: '직장에서의 멘토링이나 공정한 대우.',
      reversed: '직장에서의 불공정한 대우나 착취.'
    },
    health: {
      upright: '건강 정보나 지원의 나눔.',
      reversed: '건강 관리에서의 불균형이나 의존.'
    },
    spirituality: {
      upright: '영적 지혜의 나눔과 상호 성장.',
      reversed: '영적 관계에서의 불균형이나 착취.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-07',
    number: 7,
    name: 'Seven of Pentacles',
    nameKorean: '펜타클 7',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['평가', '인내', '장기 투자', '성과 검토', '지속성', '수확 준비', '성찰'],
      reversed: ['조급함', '즉각적 만족', '계획 포기', '성과 부족', '투자 실패', '인내 부족']
    },
    meaningShort: {
      upright: '인내심을 갖고 성과를 평가하는 시기',
      reversed: '조급함으로 인한 성과 부족'
    },
    meaningDetailed: {
      upright: '펜타클 7은 지금까지의 노력을 평가하고 미래를 계획하는 시기를 상징합니다. 인내심을 갖고 장기적 관점에서 투자의 성과를 기다리며, 필요시 방향을 조정합니다.',
      reversed: '조급함으로 인해 아직 익지 않은 열매를 따려고 하거나, 즉각적인 만족을 위해 장기 계획을 포기하는 상태를 나타냅니다. 성과에 대한 불만이나 투자 실패를 경험할 수 있습니다.'
    },
    symbolism: [
      '농부와 펜타클 나무: 노력과 성과',
      '자라는 펜타클들: 투자의 결실',
      '호미를 든 자세: 지속적 노력',
      '성찰하는 표정: 평가와 계획',
      '푸른 잎: 성장과 생명력',
      '기다리는 자세: 인내와 시간'
    ],
    imageUrl: '/images/tarot/Pentacles07.jpg',
    imageDescription: '펜타클이 열린 나무를 바라보며 호미에 기대어 서 있는 농부.',
    relatedCards: ['pentacles-02', 'major-09-hermit', 'pentacles-08'],
    questions: [
      '지금까지의 성과는 어떤가요?',
      '더 기다려야 할까요, 방향을 바꿔야 할까요?',
      '장기적 목표는 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 인내심을 갖고 장기적 성과를 위해 노력합니다.',
      reversed: '나는 조급함을 버리고 현실적인 기대를 갖습니다.'
    },
    advice: {
      upright: '인내심을 갖고 장기적 관점에서 평가하세요.',
      reversed: '너무 조급해하지 말고 꾸준히 노력하세요.'
    },
    love: {
      upright: '관계의 장기적 발전과 성과 평가.',
      reversed: '관계에서 조급함이나 즉각적 만족 추구.'
    },
    career: {
      upright: '장기 프로젝트의 중간 평가와 조정.',
      reversed: '직업적 조급함이나 성과에 대한 불만.'
    },
    health: {
      upright: '건강 계획의 장기적 효과 평가.',
      reversed: '즉각적 효과 기대나 건강 관리 포기.'
    },
    spirituality: {
      upright: '영적 성장의 과정과 성과 성찰.',
      reversed: '영적 조급함이나 즉각적 깨달음 추구.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-08',
    number: 8,
    name: 'Eight of Pentacles',
    nameKorean: '펜타클 8',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['기술 향상', '전문성', '헌신', '완벽주의', '숙련', '학습', '집중'],
      reversed: ['기술 부족', '게으름', '완벽주의 과도', '지루함', '품질 저하', '산만함']
    },
    meaningShort: {
      upright: '전문성 개발과 기술 향상에 대한 헌신',
      reversed: '기술 개발 소홀이나 완벽주의의 함정'
    },
    meaningDetailed: {
      upright: '펜타클 8은 기술 향상과 전문성 개발에 대한 헌신을 상징합니다. 끊임없는 연습과 학습을 통해 숙련도를 높이며, 완벽에 가까운 품질을 추구합니다. 집중력과 인내심이 뛰어난 성과를 만들어냅니다.',
      reversed: '기술 개발을 소홀히 하거나 과도한 완벽주의로 인한 문제를 나타냅니다. 게으름이나 산만함으로 품질이 저하되거나, 지나친 세부사항에 매몰되어 전체를 놓칠 수 있습니다.'
    },
    symbolism: [
      '작업하는 장인: 전문성과 헌신',
      '여덟 개의 펜타클: 완성된 작품들',
      '조각 도구: 기술과 도구',
      '완성된 펜타클들: 숙련도의 증거',
      '집중하는 자세: 몰입과 정밀함',
      '도시 배경: 문명과 발전'
    ],
    imageUrl: '/images/tarot/Pentacles08.jpg',
    imageDescription: '작업대에서 펜타클을 정교하게 조각하는 집중된 장인.',
    relatedCards: ['pentacles-03', 'major-09-hermit', 'pentacles-07'],
    questions: [
      '어떤 기술을 개발하고 있나요?',
      '전문성을 어떻게 향상시킬 수 있을까요?',
      '완벽주의가 방해가 되고 있지는 않나요?'
    ],
    affirmations: {
      upright: '나는 꾸준한 연습과 학습으로 전문성을 키워갑니다.',
      reversed: '나는 적당한 완벽주의를 유지하며, 지속적으로 발전합니다.'
    },
    advice: {
      upright: '꾸준한 연습과 학습으로 전문성을 기르세요.',
      reversed: '완벽을 추구하되 과도하지 않게 균형을 맞추세요.'
    },
    love: {
      upright: '관계 기술 향상이나 상대방을 위한 노력.',
      reversed: '관계에서 완벽주의나 노력 부족.'
    },
    career: {
      upright: '전문 기술 개발이나 품질 향상.',
      reversed: '기술 개발 소홀이나 과도한 완벽주의.'
    },
    health: {
      upright: '건강 기술 학습이나 꾸준한 관리.',
      reversed: '건강 관리 소홀이나 과도한 집착.'
    },
    spirituality: {
      upright: '영적 수행의 정진과 기술 향상.',
      reversed: '영적 게으름이나 과도한 완벽주의.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-09',
    number: 9,
    name: 'Nine of Pentacles',
    nameKorean: '펜타클 9',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['독립성', '풍요', '자립', '성취', '세련됨', '품격', '자유'],
      reversed: ['허영', '물질주의', '고립', '성취 부족', '의존성', '표면적 풍요']
    },
    meaningShort: {
      upright: '독립적인 성취와 세련된 풍요',
      reversed: '표면적 풍요나 허영심'
    },
    meaningDetailed: {
      upright: '펜타클 9는 독립적인 노력으로 이룬 풍요와 성취를 상징합니다. 자립적이고 세련된 라이프스타일을 누리며, 물질적 안정과 정신적 만족을 모두 갖춘 상태입니다. 품격 있는 독립성을 보여줍니다.',
      reversed: '겉보기만 화려한 허영이나 지나친 물질주의를 나타냅니다. 진정한 만족 없이 외적 성취만 추구하거나, 고립된 상태에서 혼자만의 성취에 매몰될 수 있습니다.'
    },
    symbolism: [
      '우아한 여성: 독립성과 품격',
      '풍성한 포도원: 풍요와 성취',
      '매: 고귀함과 통제력',
      '아홉 개의 펜타클: 거의 완성된 성취',
      '화려한 옷: 물질적 성공',
      '혼자 있는 모습: 독립성'
    ],
    imageUrl: '/images/tarot/Pentacles09.jpg',
    imageDescription: '포도원에서 매와 함께 있는 우아한 여성.',
    relatedCards: ['pentacles-10', 'major-09-hermit', 'major-17-star'],
    questions: [
      '독립적인 성취는 무엇인가요?',
      '진정한 만족을 느끼고 있나요?',
      '혼자만의 성취에 만족하고 있나요?'
    ],
    affirmations: {
      upright: '나는 독립적으로 성취하며, 품격 있는 삶을 살아갑니다.',
      reversed: '나는 진정한 만족을 추구하고, 허영을 버립니다.'
    },
    advice: {
      upright: '독립성을 유지하되 고립되지 않도록 주의하세요.',
      reversed: '외적 성취보다 내적 만족에 집중하세요.'
    },
    love: {
      upright: '독립적이면서도 성숙한 관계.',
      reversed: '관계에서 허영이나 물질적 조건 중시.'
    },
    career: {
      upright: '독립적인 사업이나 전문직에서의 성공.',
      reversed: '직업적 허영이나 표면적 성공.'
    },
    health: {
      upright: '건강한 독립적 라이프스타일.',
      reversed: '건강에 대한 허영이나 과시.'
    },
    spirituality: {
      upright: '독립적인 영적 성취와 내적 풍요.',
      reversed: '영적 허영이나 고립된 수행.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-10',
    number: 10,
    name: 'Ten of Pentacles',
    nameKorean: '펜타클 10',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['가족 부', '유산', '전통', '안정', '세대 계승', '공동체', '영구성'],
      reversed: ['가족 갈등', '유산 분쟁', '전통 파괴', '불안정', '가치관 충돌', '일시적 부']
    },
    meaningShort: {
      upright: '가족의 번영과 세대를 넘나드는 안정',
      reversed: '가족 갈등이나 유산 문제'
    },
    meaningDetailed: {
      upright: '펜타클 10은 가족의 번영과 세대를 넘나드는 안정을 상징합니다. 장기적인 부와 전통이 후손에게 전해지며, 가족과 공동체의 유대가 강합니다. 물질적 성공이 정신적 만족과 조화를 이룹니다.',
      reversed: '가족 내 갈등이나 유산을 둘러싼 분쟁을 나타냅니다. 전통적 가치관의 충돌이나 세대 간 갈등으로 인해 가족의 안정이 흔들릴 수 있습니다.'
    },
    symbolism: [
      '세 세대 가족: 연속성과 전통',
      '열 개의 펜타클: 완전한 물질적 성취',
      '아치형 문: 가족의 보호',
      '노인: 지혜와 경험',
      '아이들: 미래와 희망',
      '가족 문장: 전통과 유산'
    ],
    imageUrl: '/images/tarot/Pentacles10.jpg',
    imageDescription: '아치형 문 아래 세 세대가 함께 있는 부유한 가족.',
    relatedCards: ['pentacles-09', 'major-21-world', 'pentacles-04'],
    questions: [
      '가족의 진정한 부는 무엇인가요?',
      '후대에 무엇을 남기고 싶나요?',
      '전통과 혁신의 균형은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 가족과 함께 번영하며, 소중한 유산을 만들어갑니다.',
      reversed: '나는 가족 갈등을 해결하고, 새로운 전통을 만들어갑니다.'
    },
    advice: {
      upright: '가족의 번영을 감사하고 후대를 위해 투자하세요.',
      reversed: '가족 갈등을 해결하고 새로운 관계를 구축하세요.'
    },
    love: {
      upright: '가족의 축복을 받는 안정적인 관계.',
      reversed: '가족의 반대나 가치관 충돌이 있는 관계.'
    },
    career: {
      upright: '가족 사업이나 전통 있는 기업에서의 성공.',
      reversed: '가족 사업의 갈등이나 전통 산업의 쇠퇴.'
    },
    health: {
      upright: '가족의 건강한 유전과 생활 습관.',
      reversed: '유전적 건강 문제나 가족 스트레스.'
    },
    spirituality: {
      upright: '가족과 공동체의 영적 전통.',
      reversed: '영적 전통의 갈등이나 새로운 길 모색.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-page',
    number: 11,
    name: 'Page of Pentacles',
    nameKorean: '펜타클 시종',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['학습', '실용성', '목표', '계획', '야망', '성실함', '새로운 기회'],
      reversed: ['비현실적', '게으름', '계획 부족', '기회 놓침', '물질주의', '미성숙']
    },
    meaningShort: {
      upright: '실용적 학습과 새로운 기회에 대한 열정',
      reversed: '비현실적 계획이나 기회 놓침'
    },
    meaningDetailed: {
      upright: '펜타클 시종은 실용적 학습과 새로운 기회에 대한 열정을 상징합니다. 구체적인 목표를 설정하고 체계적으로 계획을 세우며, 물질적 성공을 위한 기초를 다집니다. 성실하고 근면한 태도를 보입니다.',
      reversed: '비현실적인 계획이나 기초 부족으로 인한 실패를 나타냅니다. 게으름이나 계획 부족으로 좋은 기회를 놓치거나, 물질적 욕심만 앞서서 실제 행동이 뒤따르지 않을 수 있습니다.'
    },
    symbolism: [
      '펜타클을 든 젊은이: 새로운 기회',
      '꽃이 핀 들판: 성장 가능성',
      '멀리 있는 산: 높은 목표',
      '집중하는 표정: 진지한 태도',
      '견고한 발걸음: 실용적 접근',
      '푸른 하늘: 밝은 전망'
    ],
    imageUrl: '/images/tarot/Pentacles11.jpg',
    imageDescription: '꽃밭에서 펜타클을 들고 진지하게 바라보는 젊은 시종.',
    relatedCards: ['pentacles-ace', 'major-00-fool', 'pentacles-knight'],
    questions: [
      '어떤 새로운 기회를 탐색하고 있나요?',
      '실용적인 계획은 무엇인가요?',
      '어떤 기술을 배우고 싶나요?'
    ],
    affirmations: {
      upright: '나는 실용적으로 계획하고, 꾸준히 목표를 향해 나아갑니다.',
      reversed: '나는 현실적인 계획을 세우고, 게으름을 극복합니다.'
    },
    advice: {
      upright: '구체적인 계획을 세우고 꾸준히 실행하세요.',
      reversed: '비현실적인 꿈보다 실현 가능한 목표를 설정하세요.'
    },
    love: {
      upright: '관계에서 실용적이고 미래 지향적인 계획.',
      reversed: '관계에서 비현실적 기대나 물질적 조건만 중시.'
    },
    career: {
      upright: '새로운 직업 기회나 기술 학습.',
      reversed: '직업 계획의 비현실성이나 기회 놓침.'
    },
    health: {
      upright: '건강한 생활습관 계획이나 새로운 운동.',
      reversed: '건강 계획의 비현실성이나 실행 부족.'
    },
    spirituality: {
      upright: '실용적 영성이나 구체적 수행 계획.',
      reversed: '영적 계획의 비현실성이나 실행 부족.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-knight',
    number: 12,
    name: 'Knight of Pentacles',
    nameKorean: '펜타클 기사',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['신뢰성', '근면', '인내', '책임감', '안정성', '꾸준함', '실용성'],
      reversed: ['게으름', '고집', '정체', '지루함', '과도한 신중함', '변화 거부']
    },
    meaningShort: {
      upright: '신뢰할 수 있는 근면함과 꾸준한 진전',
      reversed: '지나친 신중함이나 정체 상태'
    },
    meaningDetailed: {
      upright: '펜타클 기사는 신뢰할 수 있는 근면함과 꾸준한 진전을 상징합니다. 책임감이 강하고 인내심이 있어 장기적 목표를 달성합니다. 빠르지는 않지만 확실하고 안정적인 방법으로 성과를 냅니다.',
      reversed: '지나친 신중함으로 인한 정체나 변화에 대한 거부를 나타냅니다. 게으름이나 고집으로 인해 기회를 놓치거나, 너무 안전한 방법만 고집하여 성장이 제한될 수 있습니다.'
    },
    symbolism: [
      '무거운 말: 안정성과 신중함',
      '밭을 가는 모습: 근면과 준비',
      '검은 말: 흙의 원소',
      '갑옷: 보호와 준비',
      '펜타클: 물질적 목표',
      '느린 걸음: 신중한 진행'
    ],
    imageUrl: '/images/tarot/Pentacles12.jpg',
    imageDescription: '밭에서 검은 말을 타고 펜타클을 든 신중한 기사.',
    relatedCards: ['pentacles-page', 'major-09-hermit', 'pentacles-04'],
    questions: [
      '꾸준히 진행하고 있는 일은 무엇인가요?',
      '너무 신중해서 기회를 놓치고 있지는 않나요?',
      '책임감과 모험심의 균형은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 신뢰할 수 있고 꾸준하며, 목표를 향해 착실히 나아갑니다.',
      reversed: '나는 적절한 위험을 감수하고, 변화에 열려있습니다.'
    },
    advice: {
      upright: '꾸준함을 유지하되 때로는 속도를 내는 것도 필요합니다.',
      reversed: '너무 신중하지 말고 새로운 방법도 시도해보세요.'
    },
    love: {
      upright: '신뢰할 수 있고 안정적인 관계.',
      reversed: '관계에서 지루함이나 변화 거부.'
    },
    career: {
      upright: '꾸준한 직업적 성장과 신뢰받는 업무.',
      reversed: '직업적 정체나 변화에 대한 두려움.'
    },
    health: {
      upright: '꾸준한 건강 관리와 안정적 상태.',
      reversed: '건강 관리 소홀이나 변화 거부.'
    },
    spirituality: {
      upright: '꾸준한 영적 수행과 점진적 성장.',
      reversed: '영적 정체나 새로운 방법 거부.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-queen',
    number: 13,
    name: 'Queen of Pentacles',
    nameKorean: '펜타클 여왕',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['풍요', '양육', '실용성', '안전', '관대함', '자연', '돌봄'],
      reversed: ['물질주의', '질투', '의존성', '과보호', '탐욕', '불안정']
    },
    meaningShort: {
      upright: '풍요로운 양육과 실용적 지혜',
      reversed: '과도한 물질주의나 질투심'
    },
    meaningDetailed: {
      upright: '펜타클 여왕은 풍요로운 양육과 실용적 지혜를 상징합니다. 물질적 안정을 바탕으로 다른 사람들을 돌보며, 자연과 조화를 이루는 삶을 살아갑니다. 관대하고 실용적인 지혜로 모든 것을 풍요롭게 만듭니다.',
      reversed: '과도한 물질주의나 소유욕으로 인한 문제를 나타냅니다. 질투심이나 의존성으로 인해 관계가 악화되거나, 과보호로 인해 다른 사람의 성장을 방해할 수 있습니다.'
    },
    symbolism: [
      '왕좌의 토끼: 풍요와 번식',
      '장미 정원: 아름다움과 풍요',
      '펜타클: 물질적 성공',
      '자연 속 왕좌: 자연과의 조화',
      '황금 옷: 풍요와 안정',
      '열린 자세: 관대함'
    ],
    imageUrl: '/images/tarot/Pentacles13.jpg',
    imageDescription: '장미 정원에서 펜타클을 든 채 자연과 조화를 이루는 여왕.',
    relatedCards: ['major-03-empress', 'pentacles-king', 'pentacles-10'],
    questions: [
      '어떻게 다른 사람들을 돌볼 수 있나요?',
      '물질적 풍요를 어떻게 나눌 수 있을까요?',
      '자연과의 연결은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 풍요롭게 나누며, 실용적 지혜로 모든 것을 돌봅니다.',
      reversed: '나는 건전한 물질관을 갖고, 질투심을 버립니다.'
    },
    advice: {
      upright: '풍요를 나누고 실용적 지혜를 활용하세요.',
      reversed: '물질적 집착을 줄이고 진정한 가치에 집중하세요.'
    },
    love: {
      upright: '안정적이고 양육적인 관계.',
      reversed: '관계에서 질투나 물질적 조건 중시.'
    },
    career: {
      upright: '돌봄이나 서비스업에서의 성공.',
      reversed: '직장에서 질투나 물질적 갈등.'
    },
    health: {
      upright: '자연적이고 풍요로운 건강 관리.',
      reversed: '과도한 물질적 건강 추구나 질투로 인한 스트레스.'
    },
    spirituality: {
      upright: '자연과 조화로운 실용적 영성.',
      reversed: '물질주의로 인한 영적 불균형.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'pentacles-king',
    number: 14,
    name: 'King of Pentacles',
    nameKorean: '펜타클 왕',
    arcana: 'minor',
    suit: 'pentacles',
    element: 'Earth',
    keywords: {
      upright: ['재정적 성공', '안정성', '관대함', '신뢰성', '기업가 정신', '실용성', '멘토'],
      reversed: ['탐욕', '완고함', '물질주의', '부패', '권위주의', '낭비']
    },
    meaningShort: {
      upright: '재정적 성공과 안정적인 리더십',
      reversed: '탐욕이나 물질주의적 권위'
    },
    meaningDetailed: {
      upright: '펜타클 왕은 재정적 성공과 안정적인 리더십을 상징합니다. 사업적 수완과 실용적 지혜로 부를 쌓았으며, 그 부를 관대하게 나누며 다른 사람들을 돕습니다. 신뢰할 수 있는 멘토이자 성공한 기업가입니다.',
      reversed: '탐욕이나 완고함으로 인한 문제를 나타냅니다. 권위를 남용하거나 부를 독점하려 하며, 물질적 성공에만 매몰되어 인간적 가치를 잃을 수 있습니다.'
    },
    symbolism: [
      '풍성한 포도와 성: 성공과 안정',
      '황소: 힘과 끈기',
      '화려한 왕좌: 물질적 성취',
      '펜타클과 홀: 부와 권력',
      '갑옷 위 로브: 실용성과 위엄',
      '풍요로운 배경: 번영과 성공'
    ],
    imageUrl: '/images/tarot/Pentacles14.jpg',
    imageDescription: '풍요로운 성에서 펜타클과 홀을 든 위엄 있는 왕.',
    relatedCards: ['pentacles-queen', 'major-04-emperor', 'pentacles-10'],
    questions: [
      '재정적 성공을 어떻게 활용하고 있나요?',
      '다른 사람들에게 어떤 멘토가 될 수 있나요?',
      '물질과 정신의 균형은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 재정적으로 성공하며, 그 부를 현명하게 활용합니다.',
      reversed: '나는 탐욕을 버리고, 진정한 가치를 추구합니다.'
    },
    advice: {
      upright: '성공을 다른 사람들과 나누고 현명한 멘토가 되세요.',
      reversed: '물질적 집착을 줄이고 인간적 가치를 되찾으세요.'
    },
    love: {
      upright: '안정적이고 관대한 파트너십.',
      reversed: '관계에서 물질적 조건만 중시하거나 권위적 태도.'
    },
    career: {
      upright: '사업이나 재정 분야에서의 큰 성공.',
      reversed: '사업에서의 탐욕이나 부정행위.'
    },
    health: {
      upright: '풍요로운 건강과 최고의 의료 서비스.',
      reversed: '과잉으로 인한 건강 문제나 건강 무시.'
    },
    spirituality: {
      upright: '물질적 성공과 영적 지혜의 조화.',
      reversed: '물질주의로 인한 영적 공허함.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];