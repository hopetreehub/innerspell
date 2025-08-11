import { TarotCard } from '@/types/tarot';

export const majorArcanaCards: TarotCard[] = [
  {
    id: 'major-00-fool',
    number: 0,
    name: 'The Fool',
    nameKorean: '바보',
    arcana: 'major',
    suit: null,
    element: 'Air',
    planet: 'Uranus',
    zodiac: 'Aquarius',
    numerology: 0,
    keywords: {
      upright: ['새로운 시작', '순수함', '자발성', '모험', '믿음', '잠재력', '순진함'],
      reversed: ['무모함', '경솔함', '위험한 선택', '준비 부족', '어리석음', '현실 도피']
    },
    meaningShort: {
      upright: '새로운 여정의 시작, 순수한 마음으로 모험을 떠날 때',
      reversed: '성급한 결정, 준비 없는 행동으로 인한 위험'
    },
    meaningDetailed: {
      upright: '바보 카드는 타로의 여정을 시작하는 카드로, 새로운 모험과 가능성을 상징합니다. 순수한 마음과 열린 정신으로 미지의 세계에 발을 내딛는 용기를 나타냅니다. 과거의 경험이나 선입견에 얽매이지 않고 자유롭게 행동할 수 있는 상태를 의미합니다.',
      reversed: '무모하거나 경솔한 행동, 충분한 계획 없이 중요한 결정을 내리려는 경향을 경고합니다. 현실을 무시하거나 위험을 간과하는 태도가 문제를 일으킬 수 있습니다.'
    },
    symbolism: [
      '절벽 가장자리: 미지의 영역으로의 도약',
      '흰 장미: 순수함과 새로운 시작',
      '작은 가방: 과거의 경험과 지혜',
      '개: 본능과 충성심',
      '태양: 낙관주의와 활력',
      '산: 앞으로의 도전과 성장'
    ],
    imageUrl: '/images/tarot/00-TheFool.jpg',
    imageDescription: '절벽 가장자리에서 한 발을 내디디려는 젊은 남성. 하얀 장미를 들고 작은 개가 뒤따르고 있다.',
    relatedCards: ['major-21-world', 'major-13-death', 'major-10-wheel'],
    questions: [
      '새로운 시작을 위해 무엇을 포기해야 할까요?',
      '지금 나에게 필요한 용기는 무엇인가요?',
      '어떤 모험이 나를 기다리고 있을까요?'
    ],
    affirmations: {
      upright: '나는 새로운 가능성에 열려있고, 미지의 여정을 기꺼이 받아들입니다.',
      reversed: '나는 신중하게 계획을 세우고, 현실적인 관점을 유지합니다.'
    },
    advice: {
      upright: '새로운 기회를 두려워하지 말고 용기를 내어 첫 걸음을 내디디세요. 순수한 마음으로 접근하면 예상치 못한 좋은 결과를 얻을 수 있습니다.',
      reversed: '성급한 결정보다는 충분한 준비와 계획이 필요합니다. 현실적인 관점을 유지하며 신중하게 행동하세요.'
    },
    love: {
      upright: '새로운 만남이나 관계의 시작. 순수한 사랑과 로맨틱한 감정이 싹트는 시기.',
      reversed: '성급한 연애나 현실성 없는 로맨스에 대한 경고. 상대방을 제대로 알아가는 시간이 필요.'
    },
    career: {
      upright: '새로운 직업이나 프로젝트의 시작. 창의적이고 혁신적인 아이디어로 성공할 가능성.',
      reversed: '준비 부족으로 인한 실패 위험. 더 많은 경험과 기술 습득이 필요한 상황.'
    },
    health: {
      upright: '새로운 건강 관리 방법이나 치료법을 시도하기 좋은 시기. 전반적으로 활력이 넘치는 상태.',
      reversed: '무리한 활동이나 건강을 소홀히 하는 태도에 대한 경고. 기본적인 건강 관리가 필요.'
    },
    spirituality: {
      upright: '영적 여정의 시작. 새로운 철학이나 영적 수행에 대한 관심이 생기는 시기.',
      reversed: '영적 성장보다 현실적인 문제에 집중할 필요가 있는 상황.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-01-magician',
    number: 1,
    name: 'The Magician',
    nameKorean: '마법사',
    arcana: 'major',
    suit: null,
    element: 'Mercury',
    planet: 'Mercury',
    zodiac: 'Gemini',
    numerology: 1,
    keywords: {
      upright: ['의지력', '창조력', '행동력', '집중', '기술', '자신감', '리더십'],
      reversed: ['조작', '속임수', '자만', '에너지 낭비', '목적 부족', '재능 남용']
    },
    meaningShort: {
      upright: '강한 의지력과 창조력으로 목표를 달성할 수 있는 시기',
      reversed: '재능을 잘못 사용하거나 자만에 빠질 위험'
    },
    meaningDetailed: {
      upright: '마법사는 의지력과 행동력을 상징하는 카드입니다. 하늘과 땅을 연결하는 존재로서, 영적 에너지를 현실로 구현할 수 있는 능력을 나타냅니다. 목표를 향한 강한 의지와 집중력, 그리고 그것을 실현할 수 있는 기술과 자원을 모두 갖춘 상태를 의미합니다.',
      reversed: '재능이나 능력을 잘못된 목적으로 사용하거나, 다른 사람을 조작하려는 경향을 경고합니다. 자만심이나 과신으로 인해 실패할 가능성도 있습니다.'
    },
    symbolism: [
      '무한대 기호: 무한한 가능성과 영원한 지혜',
      '지팡이: 의지력과 남성적 에너지',
      '4원소 도구: 완전한 준비와 균형',
      '빨간 장미: 열정과 욕망',
      '흰 백합: 순수함과 지혜',
      '한 손은 위로, 한 손은 아래로: 하늘과 땅의 연결'
    ],
    imageUrl: '/images/tarot/01-TheMagician.jpg',
    imageDescription: '제단 앞에 서서 한 손은 하늘을, 한 손은 땅을 가리키는 마법사. 4원소의 도구들이 제단 위에 놓여있다.',
    relatedCards: ['major-02-high-priestess', 'major-08-strength', 'major-21-world'],
    questions: [
      '나의 진정한 재능과 능력은 무엇인가요?',
      '목표를 달성하기 위해 어떤 행동을 취해야 할까요?',
      '지금 내가 집중해야 할 것은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 내 안의 힘을 믿고, 의지력으로 꿈을 현실로 만들어갑니다.',
      reversed: '나는 겸손함을 유지하고, 내 능력을 올바른 목적으로 사용합니다.'
    },
    advice: {
      upright: '지금이 행동할 때입니다. 당신의 의지력과 기술을 활용하여 목표를 향해 나아가세요. 모든 필요한 자원이 준비되어 있습니다.',
      reversed: '능력을 과시하기보다는 겸손한 마음으로 접근하세요. 다른 사람을 조작하거나 속이려 하지 말고 정직하게 행동하세요.'
    },
    love: {
      upright: '적극적인 어프로치와 매력으로 연애에서 주도권을 잡을 수 있는 시기. 상대방을 매혹시킬 능력.',
      reversed: '상대방을 조종하려 하거나 진실하지 못한 관계. 진정성 있는 소통이 필요.'
    },
    career: {
      upright: '리더십을 발휘하여 프로젝트를 성공으로 이끌 수 있는 시기. 창의적이고 혁신적인 아이디어가 인정받음.',
      reversed: '동료들과의 갈등이나 과도한 자신감으로 인한 실수. 팀워크의 중요성을 인식해야 함.'
    },
    health: {
      upright: '강한 의지력으로 건강 목표를 달성할 수 있는 시기. 새로운 치료법이나 운동법이 효과적.',
      reversed: '스트레스나 과로로 인한 건강 악화. 일과 휴식의 균형이 필요.'
    },
    spirituality: {
      upright: '영적 능력이 깨어나고 있으며, 명상이나 영적 수행에서 큰 진전을 보일 수 있는 시기.',
      reversed: '영적 교만이나 능력 남용에 대한 경고. 겸손한 마음으로 수행해야 함.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-02-high-priestess',
    number: 2,
    name: 'The High Priestess',
    nameKorean: '여교황',
    arcana: 'major',
    suit: null,
    element: 'Water',
    planet: 'Moon',
    zodiac: 'Cancer',
    numerology: 2,
    keywords: {
      upright: ['직감', '내면의 지혜', '무의식', '신비', '수용성', '여성성', '영성'],
      reversed: ['직감 무시', '감정 억압', '비밀', '혼란', '내적 갈등', '단절']
    },
    meaningShort: {
      upright: '직감과 내면의 목소리에 귀 기울여야 할 때',
      reversed: '직감을 무시하거나 내면과 단절된 상태'
    },
    meaningDetailed: {
      upright: '여교황은 직감과 내면의 지혜를 상징합니다. 의식적인 사고를 넘어선 무의식의 영역에서 오는 통찰력과 영적 지혜를 나타냅니다. 조용히 명상하고 내면의 목소리에 귀 기울일 때 진정한 답을 찾을 수 있음을 의미합니다.',
      reversed: '직감을 무시하고 논리적 사고에만 의존하거나, 감정을 억압하여 내면과 단절된 상태를 나타냅니다. 비밀이나 숨겨진 정보로 인한 혼란도 의미할 수 있습니다.'
    },
    symbolism: [
      '베일: 의식과 무의식 사이의 경계',
      '기둥들: 대립하는 힘들의 균형',
      '달: 직감과 여성성',
      '석류: 풍요로움과 신성한 여성성',
      '십자가: 영성과 물질의 결합',
      '물: 무의식과 감정의 흐름'
    ],
    imageUrl: '/images/tarot/02-TheHighPriestess.jpg',
    imageDescription: '두 기둥 사이에 앉아있는 여교황. 달관과 베일, 석류가 그려진 커튼이 뒤에 있다.',
    relatedCards: ['major-01-magician', 'major-18-moon', 'major-03-empress'],
    questions: [
      '지금 내 직감이 무엇을 말하고 있나요?',
      '내면 깊숙이 숨겨진 지혜는 무엇인가요?',
      '어떤 비밀이나 숨겨진 정보가 있나요?'
    ],
    affirmations: {
      upright: '나는 내면의 지혜를 신뢰하고, 직감의 목소리에 귀 기울입니다.',
      reversed: '나는 감정을 받아들이고, 내면과 다시 연결됩니다.'
    },
    advice: {
      upright: '논리적 분석보다는 직감에 의존하세요. 조용한 시간을 가지고 명상하며 내면의 목소리를 들어보세요.',
      reversed: '억압된 감정이나 무시해온 직감에 주의를 기울이세요. 숨겨진 정보나 진실을 찾아야 할 때입니다.'
    },
    love: {
      upright: '깊은 감정적 연결과 영적 유대감. 상대방의 마음을 직감적으로 이해할 수 있는 시기.',
      reversed: '감정을 숨기거나 상대방과의 소통 부족. 진실한 대화가 필요한 상황.'
    },
    career: {
      upright: '직감을 활용한 창의적 업무나 상담, 치료 관련 분야에서 성공. 뛰어난 통찰력 발휘.',
      reversed: '업무에서 감정을 무시하거나 직감을 신뢰하지 않아 기회를 놓칠 가능성.'
    },
    health: {
      upright: '몸의 신호에 귀 기울이고 자연 치유력을 믿는 것이 도움. 명상이나 요가 등이 효과적.',
      reversed: '스트레스나 감정 억압으로 인한 건강 문제. 마음의 치유가 우선 필요.'
    },
    spirituality: {
      upright: '깊은 영적 통찰과 신비로운 경험을 할 수 있는 시기. 명상과 내면 성찰이 중요.',
      reversed: '영적 성장이 정체되거나 내면과의 연결이 끊어진 상태. 다시 자신과 연결되는 시간 필요.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-03-empress',
    number: 3,
    name: 'The Empress',
    nameKorean: '여황제',
    arcana: 'major',
    suit: null,
    element: 'Earth',
    planet: 'Venus',
    zodiac: 'Taurus/Libra',
    numerology: 3,
    keywords: {
      upright: ['풍요', '창조성', '모성', '자연', '감성', '양육', '아름다움'],
      reversed: ['창조성 부족', '과잉보호', '의존성', '물질주의', '자기관리 소홀']
    },
    meaningShort: {
      upright: '창조력과 풍요로움이 넘치는 시기, 모성적 사랑과 보살핌',
      reversed: '창조력 저하나 과도한 의존, 물질적 욕심'
    },
    meaningDetailed: {
      upright: '여황제는 창조력과 풍요로움의 상징입니다. 모든 것을 낳고 기르는 어머니 대지의 에너지를 나타내며, 예술적 창조력, 자연과의 조화, 그리고 따뜻한 사랑과 보살핌을 의미합니다. 물질적, 정서적 풍요로움을 누릴 수 있는 시기를 나타냅니다.',
      reversed: '창조적 에너지가 막히거나 과도한 물질주의에 빠진 상태를 의미합니다. 또한 지나친 보호욕이나 의존성, 자기 관리 소홀 등의 문제를 나타낼 수 있습니다.'
    },
    symbolism: [
      '왕관의 12개 별: 12개월과 시간의 순환',
      '비너스 기호: 사랑과 아름다움',
      '밀밭: 풍요로운 수확',
      '물: 감정과 생명력',
      '쿠션: 편안함과 사치',
      '석류: 다산과 풍요'
    ],
    imageUrl: '/images/tarot/03-TheEmpress.jpg',
    imageDescription: '자연 속에서 왕좌에 앉아있는 여황제. 주변에는 풍성한 곡물과 물이 흐르고 있다.',
    relatedCards: ['major-04-emperor', 'major-02-high-priestess', 'major-06-lovers'],
    questions: [
      '내 안의 창조적 에너지를 어떻게 표현할 수 있을까요?',
      '지금 무엇을 양육하고 키워나가야 할까요?',
      '어떤 풍요로움을 받아들일 준비가 되어있나요?'
    ],
    affirmations: {
      upright: '나는 무한한 창조력을 가지고 있으며, 사랑으로 모든 것을 풍요롭게 만듭니다.',
      reversed: '나는 건강한 경계를 설정하고, 균형 잡힌 삶을 추구합니다.'
    },
    advice: {
      upright: '창조적인 프로젝트를 시작하거나 자연과 가까워지세요. 다른 사람을 돌보고 사랑을 표현하는 것이 좋습니다.',
      reversed: '과도한 보호욕이나 물질적 욕심을 경계하세요. 자신을 돌보는 시간을 가지고 균형을 찾으세요.'
    },
    love: {
      upright: '따뜻하고 양육적인 사랑. 임신이나 출산, 가족 확장의 가능성. 깊은 감정적 만족.',
      reversed: '과잉보호나 질투, 의존적인 관계. 건강한 독립성이 필요한 상황.'
    },
    career: {
      upright: '창조적 분야나 돌봄 관련 직업에서 성공. 예술, 디자인, 교육, 의료 분야 등이 유리.',
      reversed: '번아웃이나 과로로 인한 창조력 저하. 일과 삶의 균형을 맞춰야 할 때.'
    },
    health: {
      upright: '전반적으로 건강하고 활력이 넘치는 상태. 자연 요법이나 전통적인 치료법이 효과적.',
      reversed: '스트레스나 과로로 인한 건강 악화. 특히 여성 건강 문제에 주의가 필요.'
    },
    spirituality: {
      upright: '자연과의 깊은 연결감과 대지의 에너지를 느끄는 시기. 창조와 생명에 대한 경외감.',
      reversed: '물질주의에 치우쳐 영적 성장이 소홀해진 상태. 내면의 균형을 되찾아야 함.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-04-emperor',
    number: 4,
    name: 'The Emperor',
    nameKorean: '황제',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Mars',
    zodiac: 'Aries',
    numerology: 4,
    keywords: {
      upright: ['권위', '안정성', '리더십', '구조', '질서', '아버지상', '책임감'],
      reversed: ['독재', '경직성', '권위주의', '통제 과잉', '책임 회피', '무질서']
    },
    meaningShort: {
      upright: '강한 리더십과 안정된 구조를 통한 성공',
      reversed: '과도한 통제나 권위주의적 태도의 문제'
    },
    meaningDetailed: {
      upright: '황제는 안정성과 질서를 상징하는 카드입니다. 강한 리더십과 책임감으로 조직이나 상황을 안정적으로 이끌어나가는 능력을 나타냅니다. 명확한 구조와 규칙을 통해 목표를 달성하고, 다른 사람들에게 보호와 안정감을 제공하는 역할을 의미합니다.',
      reversed: '과도한 통제욕이나 독재적 성향, 경직된 사고방식을 경고합니다. 권위를 남용하거나 규칙에만 얽매여 융통성을 잃은 상태를 나타낼 수 있습니다.'
    },
    symbolism: [
      '왕좌: 확고한 권위와 안정성',
      '숫양 머리: 리더십과 전진하는 힘',
      '철제 갑옷: 보호와 방어',
      '홀: 남성적 힘과 권위',
      '산: 불변하는 기반과 안정성',
      '빨간 옷: 열정과 행동력'
    ],
    imageUrl: '/images/tarot/04-TheEmperor.jpg',
    imageDescription: '돌로 만든 왕좌에 앉아 홀을 든 황제. 배경에는 험준한 산들이 보인다.',
    relatedCards: ['major-03-empress', 'major-05-hierophant', 'major-08-strength'],
    questions: [
      '내가 책임져야 할 것들은 무엇인가요?',
      '어떤 구조나 계획이 필요한가요?',
      '리더로서 어떤 역할을 해야 할까요?'
    ],
    affirmations: {
      upright: '나는 책임감 있는 리더로서 안정적인 기반을 만들어갑니다.',
      reversed: '나는 융통성을 갖고, 다른 사람의 의견도 존중합니다.'
    },
    advice: {
      upright: '명확한 계획과 체계적인 접근으로 목표를 달성하세요. 리더십을 발휘하되 책임감을 잊지 마세요.',
      reversed: '지나친 통제욕을 버리고 유연한 사고를 가지세요. 다른 사람의 자율성을 존중하세요.'
    },
    love: {
      upright: '안정적이고 책임감 있는 관계. 상대방에게 보호받는다는 느낌과 안정감을 주는 사랑.',
      reversed: '지나친 통제나 소유욕으로 인한 갈등. 상대방의 자유를 인정해야 할 필요.'
    },
    career: {
      upright: '관리직이나 리더십 포지션에서 성공. 체계적인 업무 처리와 책임감 있는 태도가 인정받음.',
      reversed: '동료들과의 갈등이나 독선적인 업무 처리로 인한 문제. 협력의 중요성을 인식해야 함.'
    },
    health: {
      upright: '규칙적인 생활과 체계적인 건강 관리로 좋은 결과를 얻을 수 있는 시기.',
      reversed: '스트레스나 과도한 업무로 인한 건강 악화. 휴식과 여유가 필요.'
    },
    spirituality: {
      upright: '전통적인 영적 수행이나 체계적인 종교 활동을 통한 성장. 안정된 신앙심.',
      reversed: '교리나 규칙에만 얽매여 진정한 영적 성장을 놓치고 있는 상태.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-05-hierophant',
    number: 5,
    name: 'The Hierophant',
    nameKorean: '교황',
    arcana: 'major',
    suit: null,
    element: 'Earth',
    planet: 'Venus',
    zodiac: 'Taurus',
    numerology: 5,
    keywords: {
      upright: ['전통', '가르침', '영성', '종교', '규범', '지혜', '멘토'],
      reversed: ['고정관념', '독단', '반항', '혁신', '자유사상', '전통 거부']
    },
    meaningShort: {
      upright: '전통적 지혜와 가르침을 통한 영적 성장',
      reversed: '기존 관념에 대한 반발이나 독선적 태도'
    },
    meaningDetailed: {
      upright: '교황은 전통적 지혜와 영적 가르침을 상징합니다. 종교적 또는 철학적 가르침을 통해 더 높은 이해에 도달하거나, 멘토나 스승으로부터 중요한 지혜를 얻을 수 있는 시기를 나타냅니다. 기존의 체계와 전통 안에서 영적 성장을 이루어나가는 것을 의미합니다.',
      reversed: '기존의 관습이나 전통에 대한 반발, 또는 지나치게 교조적이고 융통성 없는 태도를 나타냅니다. 새로운 방식을 추구하거나 기존 체계를 거부하는 경향을 의미할 수 있습니다.'
    },
    symbolism: [
      '삼중관: 영적 권위와 지혜',
      '두 기둥: 균형과 안정',
      '십자가: 영적 연결',
      '두 제자: 가르침의 전수',
      '열쇠: 영적 지식의 문',
      '손가락: 축복과 지도'
    ],
    imageUrl: '/images/tarot/05-TheHierophant.jpg',
    imageDescription: '왕좌에 앉아 두 제자에게 가르침을 주고 있는 교황. 손에는 십자가가 들려있다.',
    relatedCards: ['major-02-high-priestess', 'major-04-emperor', 'major-09-hermit'],
    questions: [
      '어떤 가르침이나 지혜가 필요한가요?',
      '누구에게서 조언을 구해야 할까요?',
      '어떤 전통이나 관습을 따라야 할까요?'
    ],
    affirmations: {
      upright: '나는 지혜로운 가르침에 열려있고, 전통의 가치를 인정합니다.',
      reversed: '나는 나만의 길을 찾아가며, 새로운 관점을 받아들입니다.'
    },
    advice: {
      upright: '경험 많은 멘토나 스승으로부터 조언을 구하세요. 전통적인 방법이나 기존의 체계를 활용하는 것이 도움이 됩니다.',
      reversed: '고정관념에서 벗어나 새로운 접근법을 시도해보세요. 하지만 모든 전통을 무시하지는 마세요.'
    },
    love: {
      upright: '전통적인 가치관에 기반한 안정적인 관계. 결혼이나 공식적인 약속의 가능성.',
      reversed: '관습에 얽매이지 않는 자유로운 관계. 새로운 형태의 파트너십 추구.'
    },
    career: {
      upright: '교육, 종교, 상담 분야에서의 성공. 멘토나 스승의 역할을 하게 될 가능성.',
      reversed: '기존 방식에 도전하는 혁신적인 업무. 새로운 분야나 방법론 개척.'
    },
    health: {
      upright: '전통적인 치료법이나 검증된 의료 시스템을 통한 건강 회복.',
      reversed: '대안적 치료법이나 새로운 건강 관리 방법에 대한 관심.'
    },
    spirituality: {
      upright: '종교적 가르침이나 전통적 영적 수행을 통한 성장. 스승이나 공동체와의 연결.',
      reversed: '기존 종교나 영적 체계에 대한 의문. 개인적이고 독창적인 영적 탐구.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 나머지 메이저 아르카나 카드들 (6-21번)은 다음 파일에서 계속...