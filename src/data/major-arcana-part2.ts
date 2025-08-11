import { TarotCard } from '@/types/tarot';

export const majorArcanaCardsPart2: TarotCard[] = [
  {
    id: 'major-06-lovers',
    number: 6,
    name: 'The Lovers',
    nameKorean: '연인들',
    arcana: 'major',
    suit: null,
    element: 'Air',
    planet: 'Mercury',
    zodiac: 'Gemini',
    numerology: 6,
    keywords: {
      upright: ['사랑', '선택', '관계', '조화', '결합', '가치관', '결정'],
      reversed: ['불화', '갈등', '잘못된 선택', '가치관 충돌', '관계 문제', '우유부단']
    },
    meaningShort: {
      upright: '중요한 선택이나 관계에서의 조화와 사랑',
      reversed: '관계의 갈등이나 잘못된 선택으로 인한 문제'
    },
    meaningDetailed: {
      upright: '연인들 카드는 사랑과 선택을 상징합니다. 깊은 관계에서의 조화와 결합, 또는 인생의 중요한 기로에서 내려야 할 결정을 나타냅니다. 진정한 사랑과 파트너십, 그리고 자신의 가치관에 따른 올바른 선택을 의미합니다.',
      reversed: '관계에서의 갈등이나 불화, 잘못된 선택으로 인한 후회를 나타냅니다. 가치관의 차이나 우유부단함으로 인해 중요한 기회를 놓칠 수 있음을 경고합니다.'
    },
    symbolism: [
      '천사: 신성한 축복과 지도',
      '아담과 이브: 순수한 사랑과 선택',
      '생명나무와 지식나무: 직감과 이성의 균형',
      '뱀: 유혹과 지혜',
      '산: 도전과 시련',
      '태양: 의식적 깨달음'
    ],
    imageUrl: '/images/tarot/06-TheLovers.jpg',
    imageDescription: '천사가 축복하는 아래에서 서로를 바라보는 남녀. 생명나무와 지식나무가 배경에 있다.',
    relatedCards: ['major-02-high-priestess', 'major-03-empress', 'major-15-devil'],
    questions: [
      '지금 어떤 중요한 선택을 해야 하나요?',
      '내 관계에서 진정으로 원하는 것은 무엇인가요?',
      '어떤 가치관이 나를 이끌고 있나요?'
    ],
    affirmations: {
      upright: '나는 사랑과 조화 속에서 올바른 선택을 합니다.',
      reversed: '나는 갈등을 해결하고, 진정한 가치를 찾아갑니다.'
    },
    advice: {
      upright: '마음의 소리에 귀 기울이고, 사랑과 조화를 바탕으로 결정하세요. 진정한 파트너십을 추구하세요.',
      reversed: '관계의 문제를 정면으로 마주하고 해결하세요. 성급한 결정보다는 신중한 선택이 필요합니다.'
    },
    love: {
      upright: '깊은 사랑과 영혼의 동반자를 만날 수 있는 시기. 진정한 관계의 조화와 결합.',
      reversed: '관계에서의 갈등이나 삼각관계. 가치관의 차이로 인한 어려움.'
    },
    career: {
      upright: '팀워크와 협력을 통한 성공. 중요한 비즈니스 파트너십이나 계약.',
      reversed: '동료와의 갈등이나 잘못된 비즈니스 결정. 파트너십 문제.'
    },
    health: {
      upright: '전체적인 건강 균형. 파트너나 가족의 지원으로 건강 회복.',
      reversed: '스트레스나 관계 문제로 인한 건강 악화. 정신적 균형이 필요.'
    },
    spirituality: {
      upright: '영적 파트너십이나 소울메이트와의 만남. 사랑을 통한 영적 성장.',
      reversed: '영적 갈등이나 가치관의 혼란. 내면의 균형을 되찾아야 할 때.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-07-chariot',
    number: 7,
    name: 'The Chariot',
    nameKorean: '전차',
    arcana: 'major',
    suit: null,
    element: 'Water',
    planet: 'Moon',
    zodiac: 'Cancer',
    numerology: 7,
    keywords: {
      upright: ['승리', '의지력', '통제', '진전', '결정력', '성공', '극복'],
      reversed: ['통제 상실', '방향성 부족', '좌절', '내적 갈등', '과로', '공격성']
    },
    meaningShort: {
      upright: '강한 의지력과 통제력으로 목표를 향해 승리하는 시기',
      reversed: '방향성을 잃고 통제력을 상실한 상태'
    },
    meaningDetailed: {
      upright: '전차는 승리와 성공을 향한 강한 추진력을 상징합니다. 상반된 힘들을 조화롭게 통제하며 목표를 향해 나아가는 능력을 나타냅니다. 자신감과 결단력으로 어려움을 극복하고 승리를 거둘 수 있는 시기를 의미합니다.',
      reversed: '방향성을 잃고 내적 갈등에 휩싸여 있거나, 과도한 통제욕으로 인해 오히려 상황이 악화되는 것을 경고합니다. 감정적 폭발이나 무리한 추진으로 인한 문제가 발생할 수 있습니다.'
    },
    symbolism: [
      '전차: 의지력과 진전',
      '흑백 스핑크스: 대립하는 힘의 균형',
      '왕관: 승리와 성취',
      '갑옷: 보호와 준비',
      '별: 신성한 인도',
      '도시: 문명과 질서'
    ],
    imageUrl: '/images/tarot/07-TheChariot.jpg',
    imageDescription: '전차를 타고 있는 전사. 흑백의 스핑크스가 전차를 끌고 있다.',
    relatedCards: ['major-01-magician', 'major-08-strength', 'major-21-world'],
    questions: [
      '지금 무엇을 향해 나아가야 하나요?',
      '어떤 힘들을 균형 맞춰야 할까요?',
      '승리를 위해 무엇이 필요한가요?'
    ],
    affirmations: {
      upright: '나는 강한 의지력으로 모든 장애물을 극복하고 목표를 달성합니다.',
      reversed: '나는 내적 갈등을 해결하고 올바른 방향을 찾아갑니다.'
    },
    advice: {
      upright: '자신감을 가지고 목표를 향해 전진하세요. 상반된 요소들을 조화롭게 통합하여 활용하세요.',
      reversed: '너무 성급하게 추진하지 말고, 먼저 내적 갈등을 해결하세요. 방향성을 재검토할 필요가 있습니다.'
    },
    love: {
      upright: '관계에서 주도권을 잡고 적극적으로 행동하는 시기. 장거리 연애나 어려움 극복.',
      reversed: '관계에서의 통제욕이나 질투로 인한 문제. 감정적 충돌.'
    },
    career: {
      upright: '목표 달성과 승진, 프로젝트 성공. 리더십을 발휘하여 팀을 이끄는 시기.',
      reversed: '업무 과부하나 방향성 상실. 동료들과의 갈등이나 번아웃.'
    },
    health: {
      upright: '강한 의지력으로 건강 목표를 달성. 적극적인 치료나 운동의 효과.',
      reversed: '스트레스나 과로로 인한 건강 악화. 감정적 문제가 신체에 영향.'
    },
    spirituality: {
      upright: '영적 목표를 향한 강한 추진력. 수행에서의 돌파구나 성취.',
      reversed: '영적 갈등이나 방향성 혼란. 균형 잡힌 수행이 필요한 시기.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-08-strength',
    number: 8,
    name: 'Strength',
    nameKorean: '힘',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Sun',
    zodiac: 'Leo',
    numerology: 8,
    keywords: {
      upright: ['내적 힘', '용기', '인내', '자제력', '연민', '부드러운 힘', '극복'],
      reversed: ['분노', '통제 부족', '약함', '두려움', '자신감 부족', '공격성']
    },
    meaningShort: {
      upright: '부드럽지만 강한 내적 힘으로 어려움을 극복하는 시기',
      reversed: '감정 통제의 어려움이나 내적 힘의 부족'
    },
    meaningDetailed: {
      upright: '힘 카드는 물리적 힘이 아닌 내적 힘과 정신적 강인함을 상징합니다. 사랑과 연민, 인내심으로 어려운 상황을 극복하는 능력을 나타냅니다. 자신의 본능과 감정을 부드럽게 통제하며, 어떤 도전에도 굴복하지 않는 용기를 의미합니다.',
      reversed: '감정을 통제하지 못하거나 내적 힘이 부족한 상태를 나타냅니다. 분노나 두려움에 휩싸여 있거나, 자신감 부족으로 인해 도전을 회피하는 경향을 경고합니다.'
    },
    symbolism: [
      '여인과 사자: 내적 힘과 본능의 조화',
      '무한대 기호: 영원한 힘과 가능성',
      '꽃다발: 부드러움과 아름다움',
      '흰 옷: 순수함과 영성',
      '산: 도전과 시련',
      '부드러운 손길: 사랑으로 다스리는 힘'
    ],
    imageUrl: '/images/tarot/08-Strength.jpg',
    imageDescription: '여인이 사자의 입을 부드럽게 다루고 있다. 머리 위에는 무한대 기호가 있다.',
    relatedCards: ['major-01-magician', 'major-07-chariot', 'major-11-justice'],
    questions: [
      '어떤 내적 힘이 나를 지탱해주고 있나요?',
      '지금 어떤 용기가 필요한가요?',
      '무엇을 극복해야 할까요?'
    ],
    affirmations: {
      upright: '나는 사랑과 연민의 힘으로 모든 어려움을 극복합니다.',
      reversed: '나는 내 감정을 인정하고, 내적 힘을 기릅니다.'
    },
    advice: {
      upright: '부드럽지만 확고한 태도로 문제에 접근하세요. 인내심과 연민으로 상황을 개선할 수 있습니다.',
      reversed: '감정적 반응보다는 침착함을 유지하세요. 내적 힘을 기르기 위한 시간이 필요합니다.'
    },
    love: {
      upright: '무조건적 사랑과 이해로 관계가 깊어지는 시기. 어려움을 함께 극복.',
      reversed: '감정적 폭발이나 질투로 인한 관계 악화. 자제력이 필요한 상황.'
    },
    career: {
      upright: '인내심과 꾸준함으로 어려운 프로젝트를 완수. 팀의 갈등을 조율하는 역할.',
      reversed: '스트레스나 압박감으로 인한 업무 효율 저하. 감정 관리가 필요.'
    },
    health: {
      upright: '강한 의지력과 긍정적 마음가짐으로 건강 회복. 면역력 강화.',
      reversed: '스트레스나 감정적 문제로 인한 건강 악화. 마음의 치유가 우선.'
    },
    spirituality: {
      upright: '내적 힘과 영적 용기의 성장. 시련을 통한 영혼의 단련.',
      reversed: '영적 좌절이나 신앙의 흔들림. 인내심을 갖고 꾸준히 수행해야 할 때.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-09-hermit',
    number: 9,
    name: 'The Hermit',
    nameKorean: '은둔자',
    arcana: 'major',
    suit: null,
    element: 'Earth',
    planet: 'Mercury',
    zodiac: 'Virgo',
    numerology: 9,
    keywords: {
      upright: ['내적 탐구', '지혜', '성찰', '고독', '영적 여행', '깨달음', '안내'],
      reversed: ['고립', '외로움', '방향성 상실', '도피', '조급함', '내적 혼란']
    },
    meaningShort: {
      upright: '내면의 지혜를 찾기 위한 고독한 성찰의 시간',
      reversed: '고립감이나 방향성을 잃고 헤매는 상태'
    },
    meaningDetailed: {
      upright: '은둔자는 내적 탐구와 영적 성장을 상징합니다. 혼자만의 시간을 통해 진정한 자아를 발견하고, 깊은 지혜와 통찰을 얻는 시기를 나타냅니다. 다른 사람들에게 등불이 되어 길을 안내하는 현명한 조언자의 역할도 의미합니다.',
      reversed: '과도한 고립이나 사회적 단절, 또는 성급함으로 인해 내적 성찰의 기회를 놓치는 상태를 나타냅니다. 방향성을 잃고 혼란스러워하거나 도피하려는 경향을 경고합니다.'
    },
    symbolism: [
      '등불: 내적 지혜와 깨달음',
      '지팡이: 지혜와 권위',
      '회색 망토: 겸손함과 은밀함',
      '산 정상: 높은 경지와 성취',
      '별: 신성한 인도',
      '홀로 선 모습: 자기 의존과 내적 탐구'
    ],
    imageUrl: '/images/tarot/09-TheHermit.jpg',
    imageDescription: '산 정상에서 등불을 들고 서있는 노인. 긴 지팡이를 짚고 있다.',
    relatedCards: ['major-02-high-priestess', 'major-05-hierophant', 'major-18-moon'],
    questions: [
      '지금 내가 찾고 있는 답은 무엇인가요?',
      '어떤 내적 성찰이 필요한가요?',
      '누구에게 지혜를 구해야 할까요?'
    ],
    affirmations: {
      upright: '나는 고독 속에서 진정한 지혜를 발견하고, 내 안의 빛을 찾습니다.',
      reversed: '나는 고립에서 벗어나 다른 사람들과 연결되며, 방향을 찾아갑니다.'
    },
    advice: {
      upright: '혼자만의 시간을 가지고 깊이 성찰하세요. 내면의 목소리에 귀 기울이고 지혜를 찾으세요.',
      reversed: '과도한 고립을 피하고 다른 사람들과의 교류를 늘리세요. 조급해하지 말고 천천히 방향을 찾아가세요.'
    },
    love: {
      upright: '혼자만의 시간이 필요한 시기. 자신을 이해한 후에야 진정한 사랑을 찾을 수 있음.',
      reversed: '외로움이나 고립감으로 인한 관계 문제. 소통과 연결이 필요한 상황.'
    },
    career: {
      upright: '멘토나 조언자의 역할. 연구나 분석, 상담 분야에서의 성공.',
      reversed: '팀워크 부족이나 소통 문제. 혼자서 해결하려 하지 말고 협력이 필요.'
    },
    health: {
      upright: '자기 치유력과 내적 회복. 명상이나 휴식을 통한 건강 회복.',
      reversed: '우울감이나 고립으로 인한 건강 악화. 사회적 지원이 필요.'
    },
    spirituality: {
      upright: '깊은 영적 통찰과 깨달음의 시기. 개인적 수행을 통한 성장.',
      reversed: '영적 방향성 상실이나 혼란. 스승이나 공동체의 도움이 필요.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-10-wheel-of-fortune',
    number: 10,
    name: 'Wheel of Fortune',
    nameKorean: '운명의 수레바퀴',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Jupiter',
    zodiac: 'Sagittarius',
    numerology: 10,
    keywords: {
      upright: ['운명', '순환', '변화', '행운', '기회', '카르마', '전환점'],
      reversed: ['불운', '통제 불가', '정체', '나쁜 타이밍', '카르마 부채', '저항']
    },
    meaningShort: {
      upright: '운명의 전환점과 새로운 기회의 순환',
      reversed: '어려운 시기나 통제할 수 없는 변화'
    },
    meaningDetailed: {
      upright: '운명의 수레바퀴는 인생의 순환과 변화를 상징합니다. 운명적 전환점이나 중요한 기회가 찾아오는 시기를 나타내며, 과거의 행동에 따른 카르마적 결과가 나타날 수 있습니다. 긍정적 변화와 행운의 흐름을 의미합니다.',
      reversed: '예상치 못한 어려움이나 불운한 시기를 나타냅니다. 변화에 저항하거나 부정적 카르마의 결과에 직면할 수 있습니다. 통제할 수 없는 상황에 좌절감을 느낄 수 있습니다.'
    },
    symbolism: [
      '수레바퀴: 인생의 순환과 변화',
      '스핑크스: 운명의 수수께끼',
      '뱀: 하강과 변화',
      '아누비스: 상승과 진화',
      '구름 속 천사들: 신성한 개입',
      '히브리어와 연금술 기호: 우주의 법칙'
    ],
    imageUrl: '/images/tarot/10-WheelOfFortune.jpg',
    imageDescription: '큰 수레바퀴 주위에 스핑크스, 뱀, 아누비스가 배치되어 있고, 구름 속에 천사들이 있다.',
    relatedCards: ['major-00-fool', 'major-13-death', 'major-21-world'],
    questions: [
      '지금 어떤 변화가 일어나고 있나요?',
      '어떤 기회를 놓치지 말아야 할까요?',
      '과거의 어떤 행동이 지금 결과로 나타나고 있나요?'
    ],
    affirmations: {
      upright: '나는 변화의 흐름에 맞춰 새로운 기회를 받아들입니다.',
      reversed: '나는 어려운 시기를 견디며, 더 나은 때를 기다립니다.'
    },
    advice: {
      upright: '변화의 흐름에 맞춰 행동하세요. 새로운 기회를 놓치지 말고 적극적으로 활용하세요.',
      reversed: '현재의 어려움이 영원하지 않음을 기억하세요. 인내심을 갖고 변화의 때를 기다리세요.'
    },
    love: {
      upright: '운명적 만남이나 관계의 긍정적 전환점. 새로운 사랑의 기회.',
      reversed: '관계에서의 예상치 못한 어려움이나 이별. 시간이 해결해줄 문제.'
    },
    career: {
      upright: '승진이나 새로운 기회, 사업의 전환점. 과거 노력의 결실.',
      reversed: '예상치 못한 변화나 좌절. 재기를 위한 준비 시간.'
    },
    health: {
      upright: '건강 상태의 호전이나 치료법 발견. 자연 치유력의 회복.',
      reversed: '예상치 못한 건강 문제나 치료 과정의 지연. 인내가 필요.'
    },
    spirituality: {
      upright: '영적 각성이나 깨달음의 순간. 카르마의 긍정적 해소.',
      reversed: '영적 시련이나 믿음의 시험. 더 깊은 성장을 위한 과정.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 11번부터 21번까지의 카드들은 다음 파일에서 계속...