import { TarotCard } from '@/types/tarot';

export const majorArcanaCardsPart3: TarotCard[] = [
  {
    id: 'major-11-justice',
    number: 11,
    name: 'Justice',
    nameKorean: '정의',
    arcana: 'major',
    suit: null,
    element: 'Air',
    planet: 'Venus',
    zodiac: 'Libra',
    numerology: 11,
    keywords: {
      upright: ['정의', '균형', '공정성', '진실', '책임', '결과', '법적 문제'],
      reversed: ['불공정', '편견', '불균형', '책임 회피', '법적 문제', '부정직']
    },
    meaningShort: {
      upright: '공정한 판단과 균형 잡힌 결과를 얻는 시기',
      reversed: '불공정한 대우나 편견으로 인한 문제'
    },
    meaningDetailed: {
      upright: '정의 카드는 공정함과 균형을 상징합니다. 옳고 그름을 명확히 판단하고, 행동에 따른 정당한 결과를 받게 되는 시기를 나타냅니다. 진실이 밝혀지고, 공정한 대우를 받을 수 있으며, 도덕적 책임을 다하는 것의 중요성을 의미합니다.',
      reversed: '불공정한 판단이나 편견, 도덕적 기준의 혼란을 나타냅니다. 책임을 회피하거나 진실을 왜곡하는 경향, 또는 불평등한 대우를 받는 상황을 경고합니다.'
    },
    symbolism: [
      '저울: 균형과 공정한 판단',
      '검: 진실을 가르는 힘',
      '왕관: 권위와 지혜',
      '기둥들: 안정성과 법의 기반',
      '빨간 옷: 열정과 행동력',
      '보라색 베일: 지혜와 영성'
    ],
    imageUrl: '/images/tarot/11-Justice.jpg',
    imageDescription: '왕좌에 앉아 한 손에는 저울을, 다른 손에는 검을 든 정의의 여신.',
    relatedCards: ['major-08-strength', 'major-06-lovers', 'major-20-judgement'],
    questions: [
      '지금 상황에서 무엇이 공정한 결과일까요?',
      '어떤 책임을 져야 할까요?',
      '진실은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 공정하고 균형 잡힌 판단을 하며, 정의로운 결과를 받습니다.',
      reversed: '나는 편견을 버리고, 진실을 추구하며, 책임을 다합니다.'
    },
    advice: {
      upright: '공정하고 객관적인 관점을 유지하세요. 진실을 말하고 도덕적 책임을 다하세요.',
      reversed: '편견이나 선입견을 버리고 균형 잡힌 시각을 가지세요. 책임을 회피하지 말고 정면으로 마주하세요.'
    },
    love: {
      upright: '관계에서의 공정함과 균형. 상호 존중과 평등한 관계.',
      reversed: '관계에서의 불균형이나 불공정한 대우. 솔직한 대화가 필요.'
    },
    career: {
      upright: '공정한 평가와 정당한 대우. 법적 또는 윤리적 업무에서 성공.',
      reversed: '직장에서의 불공정한 대우나 윤리적 딜레마. 공정성을 요구해야 할 때.'
    },
    health: {
      upright: '균형 잡힌 생활 습관으로 건강 회복. 정확한 진단과 적절한 치료.',
      reversed: '건강 관리의 불균형이나 잘못된 진단. 균형 회복이 필요.'
    },
    spirituality: {
      upright: '도덕적 원칙에 따른 영적 성장. 카르마의 균형과 정화.',
      reversed: '영적 가치관의 혼란이나 도덕적 갈등. 내적 균형을 찾아야 할 때.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-12-hanged-man',
    number: 12,
    name: 'The Hanged Man',
    nameKorean: '매달린 사람',
    arcana: 'major',
    suit: null,
    element: 'Water',
    planet: 'Neptune',
    zodiac: 'Pisces',
    numerology: 12,
    keywords: {
      upright: ['희생', '기다림', '새로운 관점', '정체', '깨달음', '내려놓음', '수용'],
      reversed: ['지연', '저항', '희생 거부', '이기심', '무의미한 고통', '고집']
    },
    meaningShort: {
      upright: '기다림과 희생을 통해 새로운 깨달음을 얻는 시기',
      reversed: '불필요한 지연이나 희생을 거부하는 태도'
    },
    meaningDetailed: {
      upright: '매달린 사람은 자발적 희생과 기다림을 통한 깨달음을 상징합니다. 현재 상황을 받아들이고 다른 관점에서 바라볼 때 새로운 통찰을 얻을 수 있음을 나타냅니다. 때로는 행동보다 기다림이 필요한 시기임을 의미합니다.',
      reversed: '불필요한 지연이나 희생을 거부하는 태도, 또는 고집스럽게 기존 방식을 고수하는 경향을 나타냅니다. 변화에 저항하거나 새로운 관점을 받아들이지 않으려는 자세를 경고합니다.'
    },
    symbolism: [
      '거꾸로 매달린 모습: 새로운 관점',
      '빛나는 후광: 깨달음과 영성',
      '평온한 표정: 수용과 평화',
      '십자가 발목: 자발적 희생',
      '나무: 생명과 성장',
      '물방울: 정화와 영적 각성'
    ],
    imageUrl: '/images/tarot/12-TheHangedMan.jpg',
    imageDescription: '나무에 거꾸로 매달려 있지만 평온한 표정의 남자. 머리 주위에 후광이 있다.',
    relatedCards: ['major-09-hermit', 'major-04-emperor', 'major-13-death'],
    questions: [
      '지금 무엇을 내려놓아야 할까요?',
      '어떤 새로운 관점이 필요한가요?',
      '무엇을 위해 기다려야 할까요?'
    ],
    affirmations: {
      upright: '나는 현재 상황을 받아들이고, 새로운 관점으로 깨달음을 얻습니다.',
      reversed: '나는 불필요한 지연을 멈추고, 적극적으로 변화를 추구합니다.'
    },
    advice: {
      upright: '성급하게 행동하지 말고 현재 상황을 받아들이세요. 다른 관점에서 바라보면 새로운 해답을 찾을 수 있습니다.',
      reversed: '무의미한 희생이나 지연을 멈추세요. 때로는 적극적인 행동이 필요합니다.'
    },
    love: {
      upright: '관계에서 희생과 이해가 필요한 시기. 상대방의 입장에서 생각해볼 때.',
      reversed: '일방적인 희생이나 정체된 관계. 변화를 위한 행동이 필요.'
    },
    career: {
      upright: '승진이나 변화를 위한 대기 시간. 새로운 접근법을 고려해볼 때.',
      reversed: '무의미한 대기나 희생을 멈추고 적극적으로 기회를 찾아야 할 때.'
    },
    health: {
      upright: '휴식과 회복이 필요한 시기. 자연 치유력을 믿고 기다림.',
      reversed: '수동적 치료를 멈추고 적극적인 건강 관리가 필요한 시기.'
    },
    spirituality: {
      upright: '영적 정체기를 통한 깊은 깨달음. 수행에서의 새로운 이해.',
      reversed: '영적 성장의 정체나 잘못된 수행 방향. 새로운 접근이 필요.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-13-death',
    number: 13,
    name: 'Death',
    nameKorean: '죽음',
    arcana: 'major',
    suit: null,
    element: 'Water',
    planet: 'Pluto',
    zodiac: 'Scorpio',
    numerology: 13,
    keywords: {
      upright: ['변화', '종료', '재생', '변환', '해방', '새로운 시작', '깨달음'],
      reversed: ['변화 저항', '정체', '부분적 변화', '두려움', '집착', '재생 지연']
    },
    meaningShort: {
      upright: '근본적인 변화와 새로운 시작을 위한 끝',
      reversed: '변화에 대한 저항이나 불완전한 변환'
    },
    meaningDetailed: {
      upright: '죽음 카드는 물리적 죽음이 아닌 변화와 재생을 상징합니다. 낡은 것의 종료와 새로운 것의 시작, 근본적인 변환을 나타냅니다. 과거에 집착하지 말고 변화를 받아들일 때 진정한 성장과 해방을 경험할 수 있음을 의미합니다.',
      reversed: '변화에 대한 저항이나 두려움, 과거에 대한 집착을 나타냅니다. 불완전한 변화나 부분적인 개선에 만족하려는 경향을 경고하며, 진정한 변화를 위해서는 완전한 해방이 필요함을 시사합니다.'
    },
    symbolism: [
      '해골 기사: 피할 수 없는 변화',
      '흰 말: 순수함과 정신적 힘',
      '흰 장미: 순수한 사랑과 재생',
      '떠오르는 태양: 새로운 희망',
      '물: 무의식과 정화',
      '다양한 인물들: 모든 존재의 변화'
    ],
    imageUrl: '/images/tarot/13-Death.jpg',
    imageDescription: '흰 말을 탄 해골 기사가 다양한 사람들 앞에 나타나고, 배경에는 태양이 떠오르고 있다.',
    relatedCards: ['major-00-fool', 'major-10-wheel-of-fortune', 'major-20-judgement'],
    questions: [
      '지금 무엇을 끝내야 할까요?',
      '어떤 변화를 받아들여야 하나요?',
      '무엇으로부터 해방되어야 할까요?'
    ],
    affirmations: {
      upright: '나는 변화를 받아들이고, 새로운 시작을 위해 과거를 놓아줍니다.',
      reversed: '나는 변화에 대한 두려움을 극복하고, 완전한 변환을 추구합니다.'
    },
    advice: {
      upright: '변화를 두려워하지 말고 받아들이세요. 끝은 새로운 시작을 의미합니다.',
      reversed: '변화에 저항하지 말고 과거에 대한 집착을 버리세요. 완전한 변화가 필요합니다.'
    },
    love: {
      upright: '관계의 근본적 변화나 종료. 새로운 사랑의 가능성.',
      reversed: '이별에 대한 거부감이나 관계 변화에 대한 저항.'
    },
    career: {
      upright: '직업이나 경력의 근본적 변화. 새로운 분야로의 전환.',
      reversed: '변화를 피하려 하거나 안전지대에 머물려는 경향.'
    },
    health: {
      upright: '생활 습관의 근본적 변화나 치유를 통한 재생.',
      reversed: '건강 개선을 위한 변화를 미루거나 거부하는 태도.'
    },
    spirituality: {
      upright: '영적 각성이나 깨달음을 통한 의식의 변화.',
      reversed: '영적 성장을 위한 변화에 대한 저항이나 두려움.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-14-temperance',
    number: 14,
    name: 'Temperance',
    nameKorean: '절제',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Jupiter',
    zodiac: 'Sagittarius',
    numerology: 14,
    keywords: {
      upright: ['균형', '조화', '절제', '인내', '치유', '통합', '중용'],
      reversed: ['불균형', '과도함', '조급함', '극단', '불화', '인내 부족']
    },
    meaningShort: {
      upright: '균형과 절제를 통한 조화로운 치유의 시기',
      reversed: '균형을 잃고 극단으로 치우치는 경향'
    },
    meaningDetailed: {
      upright: '절제 카드는 균형과 조화를 상징합니다. 상반된 요소들을 조화롭게 통합하고, 인내심을 갖고 점진적으로 목표를 달성하는 것을 나타냅니다. 치유와 회복, 그리고 중용의 지혜를 통해 안정된 발전을 이루어나가는 시기를 의미합니다.',
      reversed: '균형을 잃고 극단으로 치우치거나, 조급함으로 인해 조화를 깨뜨리는 경향을 나타냅니다. 과도함이나 부족함에 빠져 있거나, 인내심을 잃고 성급하게 행동하려는 자세를 경고합니다.'
    },
    symbolism: [
      '천사: 신성한 균형과 지혜',
      '물의 흐름: 생명력의 순환',
      '두 개의 컵: 의식과 무의식의 통합',
      '한 발은 물에, 한 발은 땅에: 영성과 현실의 균형',
      '삼각형: 조화와 안정',
      '산: 높은 목표와 인내'
    ],
    imageUrl: '/images/tarot/14-Temperance.jpg',
    imageDescription: '날개 달린 천사가 두 컵 사이에서 물을 부으며, 한 발은 물에, 한 발은 땅에 딛고 있다.',
    relatedCards: ['major-02-high-priestess', 'major-06-lovers', 'major-21-world'],
    questions: [
      '어떤 균형을 맞춰야 할까요?',
      '무엇을 절제해야 하나요?',
      '어떻게 조화를 이룰 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 균형과 절제로 조화로운 삶을 만들어갑니다.',
      reversed: '나는 극단을 피하고, 중용의 지혜를 추구합니다.'
    },
    advice: {
      upright: '급하지 말고 천천히 균형을 맞춰가세요. 인내심을 갖고 조화로운 해결책을 찾으세요.',
      reversed: '극단적인 행동을 피하고 균형을 회복하세요. 절제와 중용이 필요합니다.'
    },
    love: {
      upright: '관계에서의 조화와 균형. 서로의 차이를 인정하고 통합하는 사랑.',
      reversed: '관계에서의 불균형이나 극단적 감정. 절제와 이해가 필요.'
    },
    career: {
      upright: '협력과 팀워크를 통한 성공. 점진적이고 안정적인 발전.',
      reversed: '업무에서의 불균형이나 과로. 일과 삶의 균형이 필요.'
    },
    health: {
      upright: '균형 잡힌 생활습관을 통한 건강 회복. 자연 치유와 점진적 개선.',
      reversed: '과도하거나 부족한 생활 패턴. 절제와 균형 있는 건강 관리 필요.'
    },
    spirituality: {
      upright: '영성과 현실의 조화로운 통합. 중도적 수행을 통한 성장.',
      reversed: '영적 수행에서의 극단이나 불균형. 중용의 길을 찾아야 할 때.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-15-devil',
    number: 15,
    name: 'The Devil',
    nameKorean: '악마',
    arcana: 'major',
    suit: null,
    element: 'Earth',
    planet: 'Saturn',
    zodiac: 'Capricorn',
    numerology: 15,
    keywords: {
      upright: ['유혹', '중독', '속박', '물질주의', '욕망', '무지', '현실 도피'],
      reversed: ['해방', '깨달음', '유혹 극복', '자유', '자각', '중독 회복']
    },
    meaningShort: {
      upright: '유혹과 속박에 빠져 있는 상태, 물질적 욕망에 사로잡힘',
      reversed: '유혹을 극복하고 속박에서 벗어나는 해방'
    },
    meaningDetailed: {
      upright: '악마 카드는 유혹과 속박을 상징합니다. 물질적 욕망이나 중독, 잘못된 관계에 얽매여 있는 상태를 나타냅니다. 겉보기에는 즐겁고 매력적이지만 실제로는 자유를 제한하고 성장을 방해하는 상황을 의미합니다.',
      reversed: '유혹을 극복하고 속박에서 벗어나는 해방을 나타냅니다. 자신의 약점이나 중독을 인식하고 이를 극복하려는 의지, 그리고 진정한 자유를 찾아가는 과정을 의미합니다.'
    },
    symbolism: [
      '사슬에 묶인 남녀: 자발적 속박',
      '염소 머리 악마: 물질적 욕망',
      '거꾸로 된 오각별: 영성의 왜곡',
      '횃불: 잘못된 깨달음',
      '박쥐 날개: 무지와 어둠',
      '느슨한 사슬: 스스로 만든 감옥'
    ],
    imageUrl: '/images/tarot/15-TheDevil.jpg',
    imageDescription: '왕좌에 앉은 악마 앞에 사슬로 묶인 남녀가 있지만, 사슬은 느슨하게 걸려있다.',
    relatedCards: ['major-06-lovers', 'major-16-tower', 'major-08-strength'],
    questions: [
      '무엇이 나를 속박하고 있나요?',
      '어떤 유혹에서 벗어나야 할까요?',
      '진정한 자유를 얻으려면 무엇을 포기해야 할까요?'
    ],
    affirmations: {
      upright: '나는 나를 속박하는 것들을 인식하고, 진정한 자유를 추구합니다.',
      reversed: '나는 유혹을 극복하고, 건강한 선택을 통해 자유로워집니다.'
    },
    advice: {
      upright: '자신을 속박하는 것이 무엇인지 정직하게 인식하세요. 겉보기에 매력적인 것들의 진실을 보세요.',
      reversed: '유혹을 극복할 수 있는 힘이 있습니다. 한 걸음씩 자유를 향해 나아가세요.'
    },
    love: {
      upright: '독성 있는 관계나 불건전한 집착. 진정한 사랑이 아닌 의존 관계.',
      reversed: '불건전한 관계에서 벗어나거나 건강한 관계로 변화.'
    },
    career: {
      upright: '돈이나 권력에 대한 과도한 집착. 비윤리적 방법으로 성공 추구.',
      reversed: '직업적 가치관의 변화나 윤리적 선택. 진정한 만족 추구.'
    },
    health: {
      upright: '중독이나 나쁜 습관으로 인한 건강 악화. 자기 파괴적 행동.',
      reversed: '중독이나 나쁜 습관으로부터 회복. 건강한 생활 습관 형성.'
    },
    spirituality: {
      upright: '물질주의나 거짓 영성에 사로잡힌 상태. 진정한 영적 가치 상실.',
      reversed: '영적 자유와 깨달음. 거짓된 가르침이나 신념에서 해방.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-16-tower',
    number: 16,
    name: 'The Tower',
    nameKorean: '탑',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Mars',
    zodiac: 'Aries',
    numerology: 16,
    keywords: {
      upright: ['급작스런 변화', '파괴', '깨달음', '해방', '충격', '진실 폭로', '붕괴'],
      reversed: ['변화 저항', '점진적 붕괴', '내적 변화', '재건', '회복', '교훈']
    },
    meaningShort: {
      upright: '급작스럽고 충격적인 변화와 기존 구조의 붕괴',
      reversed: '점진적 변화나 충격에서 회복되는 과정'
    },
    meaningDetailed: {
      upright: '탑 카드는 급작스럽고 예상치 못한 변화를 상징합니다. 기존의 잘못된 기반이나 허상이 무너지면서 진실이 드러나는 시기를 나타냅니다. 처음에는 충격적이고 고통스럽지만, 궁극적으로는 진정한 자유와 깨달음을 가져다주는 변화입니다.',
      reversed: '급작스러운 변화에 저항하거나, 점진적으로 일어나는 붕괴를 나타냅니다. 또한 충격적인 사건 이후의 회복과 재건 과정, 그리고 변화로부터 얻은 교훈을 의미할 수 있습니다.'
    },
    symbolism: [
      '번개: 신성한 개입과 계시',
      '무너지는 탑: 허상의 붕괴',
      '떨어지는 사람들: 기존 체계에서의 해방',
      '왕관: 거짓 권위의 상실',
      '22개의 불꽃: 히브리 문자와 영적 깨달음',
      '검은 배경: 무의식과 깊은 변화'
    ],
    imageUrl: '/images/tarot/16-TheTower.jpg',
    imageDescription: '번개에 맞아 무너지는 탑에서 두 사람이 떨어지고 있다.',
    relatedCards: ['major-13-death', 'major-00-fool', 'major-20-judgement'],
    questions: [
      '어떤 허상이나 착각에서 벗어나야 할까요?',
      '이 충격적인 변화가 주는 메시지는 무엇인가요?',
      '무엇을 새롭게 재건해야 할까요?'
    ],
    affirmations: {
      upright: '나는 변화를 받아들이고, 새로운 진실 위에 더 단단한 기반을 세웁니다.',
      reversed: '나는 충격에서 회복하고, 얻은 교훈으로 더 나은 미래를 만들어갑니다.'
    },
    advice: {
      upright: '충격적인 변화를 두려워하지 마세요. 무너지는 것은 잘못된 기반이었습니다.',
      reversed: '급작스러운 변화에서 교훈을 얻고, 천천히 재건해나가세요.'
    },
    love: {
      upright: '관계의 급작스러운 종료나 충격적인 진실 발견. 허상의 사랑에서 깨어남.',
      reversed: '이별의 충격에서 회복하거나 관계 재건. 새로운 이해와 성장.'
    },
    career: {
      upright: '직장이나 사업의 급작스러운 변화. 기존 계획의 무산.',
      reversed: '실패에서 배운 교훈으로 새로운 시작. 점진적 회복과 재건.'
    },
    health: {
      upright: '급작스러운 건강 문제나 진단. 생활 방식의 근본적 변화 필요.',
      reversed: '건강 위기에서 회복. 새로운 건강 관리 방법 모색.'
    },
    spirituality: {
      upright: '기존 신념 체계의 붕괴와 영적 각성. 깊은 깨달음의 순간.',
      reversed: '영적 위기에서 회복. 새로운 영적 이해와 성장.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-17-star',
    number: 17,
    name: 'The Star',
    nameKorean: '별',
    arcana: 'major',
    suit: null,
    element: 'Air',
    planet: 'Uranus',
    zodiac: 'Aquarius',
    numerology: 17,
    keywords: {
      upright: ['희망', '영감', '치유', '신앙', '인도', '평화', '갱신'],
      reversed: ['절망', '신앙 상실', '방향 감각 상실', '비관주의', '실망', '막힘']
    },
    meaningShort: {
      upright: '희망과 영감이 가득한 치유와 갱신의 시기',
      reversed: '희망을 잃고 방향을 찾지 못하는 절망의 상태'
    },
    meaningDetailed: {
      upright: '별 카드는 희망과 영감을 상징합니다. 어려운 시기를 지나 평화와 치유를 찾는 시기를 나타내며, 미래에 대한 희망과 영적 인도를 받을 수 있음을 의미합니다. 순수한 의도와 신앙으로 목표를 향해 나아갈 수 있는 시기입니다.',
      reversed: '희망을 잃고 절망에 빠진 상태나, 미래에 대한 불안과 방향 감각 상실을 나타냅니다. 영적 연결이 끊어졌다고 느끼거나, 꿈과 이상이 좌절된 상태를 의미할 수 있습니다.'
    },
    symbolism: [
      '큰 별: 희망과 인도',
      '7개의 작은 별: 차크라와 영적 에너지',
      '물 붓는 여인: 생명력의 순환',
      '두 개의 물병: 의식과 무의식',
      '새: 영혼과 자유',
      '산: 높은 목표와 영감'
    ],
    imageUrl: '/images/tarot/17-TheStar.jpg',
    imageDescription: '연못가에서 물을 붓고 있는 여인. 하늘에는 큰 별과 작은 별들이 빛나고 있다.',
    relatedCards: ['major-18-moon', 'major-19-sun', 'major-02-high-priestess'],
    questions: [
      '지금 나에게 필요한 희망은 무엇인가요?',
      '어떤 영감이나 인도를 받고 있나요?',
      '무엇이 나를 치유해줄 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 희망과 신앙으로 미래를 밝게 바라보며, 영적 인도를 받습니다.',
      reversed: '나는 절망을 극복하고, 다시 희망을 찾아 앞으로 나아갑니다.'
    },
    advice: {
      upright: '희망을 잃지 마세요. 직감과 영감을 믿고 따라가세요. 치유의 시간을 가지세요.',
      reversed: '절망에 빠져있더라도 포기하지 마세요. 작은 희망의 빛을 찾아보세요.'
    },
    love: {
      upright: '사랑에서의 희망과 치유. 진정한 사랑에 대한 신앙과 기대.',
      reversed: '사랑에 대한 실망이나 절망. 관계에서의 신뢰 회복이 필요.'
    },
    career: {
      upright: '창의적 영감과 새로운 비전. 이상을 현실로 만들어가는 과정.',
      reversed: '직업적 목표에 대한 의심이나 좌절. 새로운 동기 부여가 필요.'
    },
    health: {
      upright: '치유와 회복의 시기. 자연 치유력과 긍정적 에너지의 도움.',
      reversed: '건강에 대한 불안이나 치료 과정의 지연. 희망을 잃지 않는 것이 중요.'
    },
    spirituality: {
      upright: '영적 각성과 깊은 평화. 신성한 인도와 영감을 받는 시기.',
      reversed: '영적 연결의 단절이나 신앙의 위기. 다시 연결을 찾아야 할 때.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-18-moon',
    number: 18,
    name: 'The Moon',
    nameKorean: '달',
    arcana: 'major',
    suit: null,
    element: 'Water',
    planet: 'Moon',
    zodiac: 'Pisces',
    numerology: 18,
    keywords: {
      upright: ['환상', '무의식', '직감', '두려움', '혼란', '신비', '꿈'],
      reversed: ['진실 발견', '명확성', '환상 해소', '직감 신뢰', '두려움 극복']
    },
    meaningShort: {
      upright: '환상과 혼란 속에서 직감에 의존해야 하는 시기',
      reversed: '혼란에서 벗어나 진실을 발견하는 명확성의 회복'
    },
    meaningDetailed: {
      upright: '달 카드는 무의식과 환상의 세계를 상징합니다. 현실과 환상이 뒤섞여 혼란스러운 상태이지만, 동시에 직감과 꿈을 통해 중요한 메시지를 받을 수 있는 시기를 나타냅니다. 두려움과 불안을 극복하고 내면의 지혜에 귀 기울여야 합니다.',
      reversed: '혼란과 환상에서 벗어나 진실을 발견하는 시기를 나타냅니다. 두려움을 극복하고 직감을 신뢰하게 되며, 이전에 숨겨져 있던 것들이 명확해지는 과정을 의미합니다.'
    },
    symbolism: [
      '달: 무의식과 환상',
      '물방울: 영감과 직감',
      '늑대와 개: 야생성과 문명',
      '가재: 무의식에서 올라오는 것',
      '두 개의 탑: 의식의 경계',
      '구불구불한 길: 불확실한 여정'
    ],
    imageUrl: '/images/tarot/18-TheMoon.jpg',
    imageDescription: '달빛 아래 늑대와 개가 울고 있고, 연못에서 가재가 기어나오고 있다.',
    relatedCards: ['major-02-high-priestess', 'major-17-star', 'major-19-sun'],
    questions: [
      '지금 무엇이 나를 혼란스럽게 하나요?',
      '어떤 두려움을 극복해야 할까요?',
      '내 직감이 무엇을 말하고 있나요?'
    ],
    affirmations: {
      upright: '나는 혼란 속에서도 직감을 신뢰하고, 내면의 지혜에 귀 기울입니다.',
      reversed: '나는 환상에서 벗어나 진실을 보며, 두려움을 극복합니다.'
    },
    advice: {
      upright: '혼란스럽더라도 성급하게 판단하지 마세요. 직감과 꿈에 주의를 기울이세요.',
      reversed: '혼란이 걷히고 진실이 드러나고 있습니다. 자신의 직감을 믿으세요.'
    },
    love: {
      upright: '관계에서의 혼란이나 불확실성. 감정의 기복과 환상적 사랑.',
      reversed: '관계의 진실이 드러나거나 혼란이 해소됨. 현실적 사랑으로 전환.'
    },
    career: {
      upright: '직업적 방향에 대한 혼란이나 불안. 창의적 영감을 기다리는 시기.',
      reversed: '업무상 혼란이 해소되고 명확한 방향이 보임. 직감적 판단이 옳았음.'
    },
    health: {
      upright: '원인 불명의 증상이나 정신적 불안정. 수면과 휴식이 중요.',
      reversed: '건강 문제의 원인이 밝혀지거나 증상이 호전됨.'
    },
    spirituality: {
      upright: '영적 혼란이나 신비로운 경험. 꿈과 명상을 통한 메시지 수신.',
      reversed: '영적 명확성과 깨달음. 내면의 지혜에 대한 신뢰 회복.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-19-sun',
    number: 19,
    name: 'The Sun',
    nameKorean: '태양',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Sun',
    zodiac: 'Leo',
    numerology: 19,
    keywords: {
      upright: ['기쁨', '성공', '활력', '낙관주의', '성취', '명료함', '행복'],
      reversed: ['과도한 낙관', '자만', '지연된 성공', '에너지 부족', '실망']
    },
    meaningShort: {
      upright: '기쁨과 성공이 가득한 밝고 활력 넘치는 시기',
      reversed: '과도한 낙관이나 지연된 성공, 에너지 부족'
    },
    meaningDetailed: {
      upright: '태양 카드는 기쁨과 성공을 상징합니다. 모든 것이 명확해지고 긍정적 에너지가 넘치는 시기를 나타냅니다. 진정한 행복과 성취를 경험할 수 있으며, 자신감과 활력으로 모든 일을 밝게 바라볼 수 있는 때입니다.',
      reversed: '과도한 낙관주의나 자만심에 빠진 상태, 또는 기대했던 성공이 지연되는 상황을 나타냅니다. 에너지가 부족하거나 현실적 관점이 필요한 시기를 의미할 수 있습니다.'
    },
    symbolism: [
      '밝은 태양: 의식과 깨달음',
      '아이: 순수함과 기쁨',
      '흰 말: 순수한 의도',
      '해바라기: 태양을 향한 열망',
      '벽: 안전과 보호',
      '깃발: 승리와 성취'
    ],
    imageUrl: '/images/tarot/19-TheSun.jpg',
    imageDescription: '밝은 태양 아래 흰 말을 탄 아이가 기쁘게 손을 흔들고 있다.',
    relatedCards: ['major-17-star', 'major-00-fool', 'major-21-world'],
    questions: [
      '지금 나에게 기쁨을 주는 것은 무엇인가요?',
      '어떤 성공을 축하해야 할까요?',
      '내 안의 활력은 어디에서 나오나요?'
    ],
    affirmations: {
      upright: '나는 기쁨과 활력으로 가득하며, 모든 일에서 성공을 거둡니다.',
      reversed: '나는 겸손함을 유지하고, 현실적 관점에서 목표를 추구합니다.'
    },
    advice: {
      upright: '지금의 긍정적 에너지를 마음껏 누리세요. 자신감을 갖고 목표를 향해 나아가세요.',
      reversed: '과도한 낙관을 경계하고 현실적으로 접근하세요. 겸손함을 잃지 마세요.'
    },
    love: {
      upright: '사랑에서의 기쁨과 행복. 관계가 밝고 긍정적으로 발전.',
      reversed: '관계에서 과도한 기대나 현실성 부족. 균형 잡힌 시각 필요.'
    },
    career: {
      upright: '직업적 성공과 인정. 창의력과 리더십이 빛나는 시기.',
      reversed: '성공에 대한 과도한 자신감이나 예상보다 늦은 성과.'
    },
    health: {
      upright: '활력과 에너지가 넘치는 건강한 상태. 면역력 강화.',
      reversed: '과로나 과도한 활동으로 인한 에너지 소모. 적절한 휴식 필요.'
    },
    spirituality: {
      upright: '영적 깨달음과 기쁨. 의식의 확장과 높은 진동.',
      reversed: '영적 자만이나 과도한 확신. 겸손한 수행 자세 필요.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-20-judgement',
    number: 20,
    name: 'Judgement',
    nameKorean: '심판',
    arcana: 'major',
    suit: null,
    element: 'Fire',
    planet: 'Pluto',
    zodiac: 'Scorpio',
    numerology: 20,
    keywords: {
      upright: ['각성', '재생', '내적 부름', '용서', '깨달음', '새로운 시작', '해방'],
      reversed: ['자기 비판', '용서 거부', '판단 부족', '깨달음 거부', '회피']
    },
    meaningShort: {
      upright: '영적 각성과 재생을 통한 새로운 차원의 시작',
      reversed: '자기 판단이나 용서하지 못하는 마음'
    },
    meaningDetailed: {
      upright: '심판 카드는 영적 각성과 재생을 상징합니다. 과거를 정리하고 새로운 차원의 존재로 거듭나는 시기를 나타냅니다. 내적 부름에 응답하고, 용서와 해방을 통해 진정한 자유를 얻을 수 있는 때입니다.',
      reversed: '자기 비판이나 과거에 대한 죄책감에 사로잡혀 있거나, 용서하지 못하는 마음으로 인해 성장이 막힌 상태를 나타냅니다. 내적 부름을 무시하거나 변화를 거부하는 경향을 경고합니다.'
    },
    symbolism: [
      '천사 가브리엘: 신성한 메시지',
      '나팔: 깨어남의 소리',
      '부활하는 사람들: 재생과 각성',
      '십자가 깃발: 영적 승리',
      '산: 높은 의식과 깨달음',
      '물: 정화와 치유'
    ],
    imageUrl: '/images/tarot/20-Judgement.jpg',
    imageDescription: '천사가 나팔을 불고 있고, 아래에서 사람들이 무덤에서 일어나고 있다.',
    relatedCards: ['major-13-death', 'major-16-tower', 'major-21-world'],
    questions: [
      '지금 나를 부르는 내적 목소리는 무엇인가요?',
      '무엇을 용서하고 놓아줘야 할까요?',
      '어떤 새로운 시작을 준비해야 할까요?'
    ],
    affirmations: {
      upright: '나는 내적 부름에 응답하고, 용서와 해방을 통해 새롭게 거듭납니다.',
      reversed: '나는 자기 비판을 멈추고, 용서를 통해 진정한 치유를 경험합니다.'
    },
    advice: {
      upright: '내면의 목소리에 귀 기울이고 그 부름에 응답하세요. 과거를 용서하고 새로운 시작을 받아들이세요.',
      reversed: '자신에게 너무 가혹하지 마세요. 용서와 자비의 마음으로 치유의 시간을 가지세요.'
    },
    love: {
      upright: '관계에서의 용서와 새로운 시작. 더 깊은 차원의 사랑으로 발전.',
      reversed: '과거의 상처를 용서하지 못해 새로운 사랑을 받아들이기 어려운 상태.'
    },
    career: {
      upright: '천직을 찾거나 새로운 사명 발견. 과거 경험을 바탕으로 한 성장.',
      reversed: '과거 실패에 대한 자책이나 새로운 기회를 받아들이지 못하는 상태.'
    },
    health: {
      upright: '치유와 회복의 기적. 새로운 건강 관리 방법이나 치료법 발견.',
      reversed: '자기 비판이나 죄책감으로 인한 정신적 스트레스. 자기 용서가 필요.'
    },
    spirituality: {
      upright: '영적 각성과 깨달음. 높은 차원의 의식으로 상승.',
      reversed: '영적 성장을 방해하는 죄책감이나 자기 판단. 용서와 자비가 필요.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'major-21-world',
    number: 21,
    name: 'The World',
    nameKorean: '세계',
    arcana: 'major',
    suit: null,
    element: 'Earth',
    planet: 'Saturn',
    zodiac: 'Capricorn',
    numerology: 21,
    keywords: {
      upright: ['완성', '성취', '통합', '성공', '만족', '완전함', '순환의 완성'],
      reversed: ['미완성', '지연', '부분적 성공', '만족 부족', '새로운 시작 필요']
    },
    meaningShort: {
      upright: '목표의 완성과 성취, 인생 여정의 한 순환 완료',
      reversed: '목표 달성의 지연이나 만족스럽지 못한 결과'
    },
    meaningDetailed: {
      upright: '세계 카드는 완성과 성취를 상징합니다. 긴 여정의 끝에서 모든 것이 조화롭게 통합되고, 진정한 만족과 성공을 경험하는 시기를 나타냅니다. 개인적 성장의 한 단계가 완성되며, 새로운 차원의 여정을 시작할 준비가 된 상태입니다.',
      reversed: '목표 달성이 지연되거나 부분적으로만 성공한 상태를 나타냅니다. 완전한 만족을 얻지 못하거나, 아직 완성되지 않은 부분이 있어 추가적인 노력이 필요한 시기를 의미합니다.'
    },
    symbolism: [
      '춤추는 여인: 조화와 완성',
      '월계관: 승리와 성취',
      '4개 생물: 4원소의 완전한 통합',
      '보라색 천: 영적 지혜',
      '지팡이: 창조력과 의지',
      '타원형 화환: 영원한 순환'
    ],
    imageUrl: '/images/tarot/21-TheWorld.jpg',
    imageDescription: '타원형 화환 안에서 춤추는 여인과 네 모서리의 생물들.',
    relatedCards: ['major-00-fool', 'major-10-wheel-of-fortune', 'major-20-judgement'],
    questions: [
      '지금 무엇을 완성해야 할까요?',
      '어떤 성취를 축하해야 할까요?',
      '다음 단계를 위해 무엇을 준비해야 할까요?'
    ],
    affirmations: {
      upright: '나는 목표를 완성하고 성취를 통해 진정한 만족을 경험합니다.',
      reversed: '나는 인내심을 갖고 완성을 향해 계속 노력하며, 부족한 부분을 채워갑니다.'
    },
    advice: {
      upright: '성취를 축하하고 만족감을 누리세요. 동시에 새로운 여정을 위한 준비도 시작하세요.',
      reversed: '조급해하지 말고 꾸준히 노력하세요. 완성을 위해 필요한 것이 무엇인지 점검해보세요.'
    },
    love: {
      upright: '관계의 완전함과 조화. 영혼의 동반자와의 완벽한 결합.',
      reversed: '관계에서 아직 해결되지 않은 부분이나 더 깊어져야 할 영역.'
    },
    career: {
      upright: '직업적 목표의 완성과 큰 성공. 인정받고 만족스러운 성취.',
      reversed: '목표 달성이 거의 완료되었지만 마지막 단계가 남음. 인내가 필요.'
    },
    health: {
      upright: '완전한 건강 회복과 전체적 웰빙. 몸과 마음의 완전한 조화.',
      reversed: '건강 회복이 거의 완료되었지만 지속적 관리가 필요한 상태.'
    },
    spirituality: {
      upright: '영적 여정의 한 단계 완성과 깨달음. 우주와의 완전한 조화.',
      reversed: '영적 성장이 거의 완료되었지만 더 깊은 통합이 필요한 시기.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 전체 메이저 아르카나 카드 배열을 내보내기 위한 통합 함수
export function getAllMajorArcanaCards(): TarotCard[] {
  // 이 함수는 main 파일에서 모든 파트를 합쳐서 사용할 예정
  return [];
}