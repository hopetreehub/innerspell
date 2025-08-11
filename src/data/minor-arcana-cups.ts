import { TarotCard } from '@/types/tarot';

// 컵(Cups) 수트 - 물의 원소, 감정과 직관
export const cupsCards: TarotCard[] = [
  {
    id: 'cups-ace',
    number: 1,
    name: 'Ace of Cups',
    nameKorean: '컵 에이스',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['새로운 사랑', '감정적 시작', '직관', '창조성', '영적 깨달음', '기쁨', '풍요'],
      reversed: ['감정 차단', '빈 컵', '억압된 감정', '창조력 막힘', '우울', '사랑의 지연']
    },
    meaningShort: {
      upright: '감정적 충만과 새로운 사랑의 시작',
      reversed: '감정적 공허함이나 막힌 감정'
    },
    meaningDetailed: {
      upright: '컵 에이스는 순수한 감정과 사랑의 시작을 상징합니다. 마음이 열리고 새로운 관계나 창조적 영감이 샘솟는 시기입니다. 영적 깨달음과 직관적 통찰이 일어나며, 감정적으로 충만한 상태입니다.',
      reversed: '감정이 막히거나 억압된 상태를 나타냅니다. 사랑을 주고받는 것이 어렵거나, 창조적 영감이 고갈된 상태입니다. 감정적 공허함이나 우울감을 경험할 수 있습니다.'
    },
    symbolism: [
      '구름에서 나온 손: 신성한 은총',
      '넘치는 컵: 감정의 충만',
      '비둘기: 평화와 영적 메시지',
      '다섯 개의 물줄기: 오감의 축복',
      '연꽃: 영적 깨달음',
      '맑은 물: 순수한 감정'
    ],
    imageUrl: '/images/tarot/Cups01.jpg',
    imageDescription: '구름에서 나온 손이 넘치는 컵을 들고 있고, 비둘기가 날아든다.',
    relatedCards: ['major-02-priestess', 'cups-02', 'major-17-star'],
    questions: [
      '어떤 새로운 감정을 경험하고 있나요?',
      '내 직관은 무엇을 말하고 있나요?',
      '어떻게 마음을 열 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 사랑과 기쁨으로 충만하며, 새로운 감정적 경험을 환영합니다.',
      reversed: '나는 막힌 감정을 해소하고, 다시 사랑할 수 있는 용기를 찾습니다.'
    },
    advice: {
      upright: '마음을 열고 새로운 감정적 경험을 받아들이세요. 직관을 신뢰하세요.',
      reversed: '감정을 억압하지 말고 표현하세요. 자기 사랑부터 시작하세요.'
    },
    love: {
      upright: '새로운 사랑의 시작이나 감정적 갱신. 깊은 연결.',
      reversed: '감정 표현의 어려움이나 사랑의 지연.'
    },
    career: {
      upright: '창조적 프로젝트나 감정적 만족을 주는 일.',
      reversed: '일에서의 감정적 소진이나 창의력 부족.'
    },
    health: {
      upright: '감정적 건강과 활력. 치유의 시작.',
      reversed: '감정적 스트레스나 우울증 위험.'
    },
    spirituality: {
      upright: '영적 각성이나 직관력 향상. 깊은 명상 경험.',
      reversed: '영적 연결 상실이나 직관 차단.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-02',
    number: 2,
    name: 'Two of Cups',
    nameKorean: '컵 2',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['파트너십', '연합', '사랑', '조화', '상호 이해', '연결', '약속'],
      reversed: ['불균형', '부조화', '오해', '이별', '일방적 사랑', '신뢰 부족']
    },
    meaningShort: {
      upright: '조화로운 파트너십과 상호 사랑',
      reversed: '관계의 불균형이나 오해'
    },
    meaningDetailed: {
      upright: '컵 2는 균형 잡힌 파트너십과 상호 사랑을 상징합니다. 두 사람 사이의 깊은 이해와 조화로운 연결을 나타내며, 서로에 대한 약속과 헌신이 있는 관계입니다. 로맨틱한 사랑뿐만 아니라 깊은 우정이나 사업 파트너십도 의미합니다.',
      reversed: '관계의 불균형이나 부조화를 나타냅니다. 일방적인 사랑이나 오해로 인한 갈등, 신뢰 부족으로 인한 문제가 발생할 수 있습니다. 파트너십이 깨지거나 약속이 지켜지지 않을 수 있습니다.'
    },
    symbolism: [
      '두 개의 컵: 상호 교류',
      '카두세우스: 치유와 균형',
      '날개 달린 사자: 열정과 보호',
      '빨간 옷과 파란 옷: 열정과 감정의 조화',
      '서로 바라보는 시선: 상호 이해',
      '교환하는 제스처: 주고받음'
    ],
    imageUrl: '/images/tarot/Cups02.jpg',
    imageDescription: '두 사람이 컵을 들고 서로를 바라보며 맹세를 나눈다.',
    relatedCards: ['major-06-lovers', 'cups-ace', 'cups-10'],
    questions: [
      '내 관계는 균형 잡혀 있나요?',
      '어떻게 더 깊은 연결을 만들 수 있을까요?',
      '상대방을 진정으로 이해하고 있나요?'
    ],
    affirmations: {
      upright: '나는 사랑을 주고받으며, 조화로운 관계를 만들어갑니다.',
      reversed: '나는 관계의 균형을 회복하고, 진정한 소통을 추구합니다.'
    },
    advice: {
      upright: '상호 존중과 이해를 바탕으로 관계를 발전시키세요.',
      reversed: '관계의 불균형을 인식하고 솔직한 대화를 나누세요.'
    },
    love: {
      upright: '새로운 로맨스나 관계의 심화. 약혼이나 결합.',
      reversed: '관계의 위기나 이별. 일방적 감정.'
    },
    career: {
      upright: '성공적인 파트너십이나 협력. 팀워크.',
      reversed: '파트너십 문제나 협력 실패.'
    },
    health: {
      upright: '감정적 안정과 균형. 치유적 관계.',
      reversed: '관계 스트레스로 인한 건강 문제.'
    },
    spirituality: {
      upright: '영적 파트너나 소울메이트 만남.',
      reversed: '영적 연결의 불균형이나 오해.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-03',
    number: 3,
    name: 'Three of Cups',
    nameKorean: '컵 3',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['축하', '우정', '공동체', '창조성', '협력', '기쁨', '풍요'],
      reversed: ['과잉', '삼각관계', '고립', '과음', '표면적 관계', '질투']
    },
    meaningShort: {
      upright: '우정과 공동체의 축하와 기쁨',
      reversed: '과도한 파티나 표면적 관계'
    },
    meaningDetailed: {
      upright: '컵 3은 우정과 공동체의 축하를 상징합니다. 친구들과 함께 성취를 축하하고 기쁨을 나누는 시기입니다. 창조적 협력과 팀워크가 좋은 결과를 가져오며, 사회적 활동이 활발해집니다.',
      reversed: '과도한 사교 활동이나 표면적인 관계를 나타냅니다. 삼각관계나 질투로 인한 문제, 또는 과음과 같은 과잉 행동이 문제가 될 수 있습니다. 진정한 우정보다는 겉치레에 치중할 수 있습니다.'
    },
    symbolism: [
      '세 명의 여성: 우정과 협력',
      '들어올린 컵: 축하와 건배',
      '과일과 꽃: 풍요와 성취',
      '춤추는 자세: 기쁨과 활력',
      '원형 구도: 평등과 조화',
      '밝은 색 옷: 다양성 속의 조화'
    ],
    imageUrl: '/images/tarot/Cups03.jpg',
    imageDescription: '세 명의 여성이 컵을 들어 건배하며 춤추고 있다.',
    relatedCards: ['cups-02', 'wands-04', 'major-21-world'],
    questions: [
      '무엇을 축하해야 하나요?',
      '누구와 기쁨을 나누고 싶나요?',
      '내 우정은 진실한가요?'
    ],
    affirmations: {
      upright: '나는 친구들과 기쁨을 나누며, 함께 성장합니다.',
      reversed: '나는 진정한 관계에 집중하고, 균형 잡힌 사교 생활을 유지합니다.'
    },
    advice: {
      upright: '친구들과 성취를 축하하고 협력의 힘을 활용하세요.',
      reversed: '과도한 사교 활동을 줄이고 깊이 있는 관계에 집중하세요.'
    },
    love: {
      upright: '사회적 만남을 통한 로맨스. 친구의 지지.',
      reversed: '삼각관계나 질투. 친구와의 경쟁.'
    },
    career: {
      upright: '팀 프로젝트 성공이나 직장 내 좋은 분위기.',
      reversed: '직장 내 파벌이나 표면적 관계.'
    },
    health: {
      upright: '사회 활동을 통한 정신 건강 향상.',
      reversed: '과음이나 과도한 파티로 인한 건강 문제.'
    },
    spirituality: {
      upright: '영적 공동체와의 연결과 축하.',
      reversed: '영적 공동체에서의 표면적 관계.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-04',
    number: 4,
    name: 'Four of Cups',
    nameKorean: '컵 4',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['무관심', '권태', '성찰', '재평가', '내면 탐구', '기회 무시', '불만족'],
      reversed: ['새로운 가능성', '동기 부여', '깨달음', '기회 인식', '행동', '각성']
    },
    meaningShort: {
      upright: '현재 상황에 대한 무관심과 내면 성찰',
      reversed: '새로운 기회의 인식과 동기 부여'
    },
    meaningDetailed: {
      upright: '컵 4는 현재 상황에 대한 무관심과 권태를 상징합니다. 제공되는 기회를 무시하고 내면으로 침잠하는 시기입니다. 깊은 성찰이 필요하지만, 너무 오래 머물면 좋은 기회를 놓칠 수 있습니다.',
      reversed: '무관심에서 벗어나 새로운 가능성을 인식하는 상태를 나타냅니다. 동기가 다시 생기고 행동할 준비가 되었습니다. 놓쳤던 기회를 다시 볼 수 있는 눈이 열립니다.'
    },
    symbolism: [
      '나무 아래 앉은 인물: 고립과 성찰',
      '팔짱 낀 자세: 방어적 태도',
      '세 개의 컵: 현재의 기회들',
      '구름에서 나온 네 번째 컵: 새로운 제안',
      '무표정: 무관심과 권태',
      '강물: 감정의 흐름'
    ],
    imageUrl: '/images/tarot/Cups04.jpg',
    imageDescription: '나무 아래 앉아 팔짱을 낀 채 구름에서 나온 컵을 무시하는 인물.',
    relatedCards: ['major-09-hermit', 'cups-05', 'swords-04'],
    questions: [
      '무엇에 지쳐있나요?',
      '놓치고 있는 기회는 무엇인가요?',
      '내면의 목소리는 무엇을 말하나요?'
    ],
    affirmations: {
      upright: '나는 내면의 목소리에 귀 기울이며, 진정한 만족을 찾습니다.',
      reversed: '나는 새로운 기회를 인식하고, 열린 마음으로 받아들입니다.'
    },
    advice: {
      upright: '성찰은 좋지만 너무 오래 머물지 마세요. 주변을 둘러보세요.',
      reversed: '이제 행동할 때입니다. 새로운 기회를 잡으세요.'
    },
    love: {
      upright: '관계에 대한 무관심이나 권태. 재평가 필요.',
      reversed: '관계의 새로운 가능성 발견. 재연결.'
    },
    career: {
      upright: '직업적 권태나 동기 부족. 새 기회 무시.',
      reversed: '새로운 직업 기회 인식. 동기 회복.'
    },
    health: {
      upright: '우울이나 무기력. 정신적 피로.',
      reversed: '활력 회복과 새로운 건강 계획.'
    },
    spirituality: {
      upright: '깊은 명상과 내면 탐구. 영적 재평가.',
      reversed: '영적 각성과 새로운 길 발견.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-05',
    number: 5,
    name: 'Five of Cups',
    nameKorean: '컵 5',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['상실', '슬픔', '후회', '실망', '애도', '집착', '과거'],
      reversed: ['수용', '용서', '회복', '앞으로 나아감', '희망', '새로운 시작']
    },
    meaningShort: {
      upright: '상실과 슬픔에 대한 애도',
      reversed: '상실을 수용하고 앞으로 나아감'
    },
    meaningDetailed: {
      upright: '컵 5는 상실과 슬픔을 상징합니다. 무언가를 잃고 애도하는 시기로, 후회와 실망에 빠져있습니다. 엎질러진 것에만 집중하여 아직 남아있는 것을 보지 못하고 있습니다.',
      reversed: '상실을 수용하고 치유가 시작되는 단계를 나타냅니다. 과거를 놓아주고 미래를 향해 나아갈 준비가 되었습니다. 아직 남아있는 희망과 기회를 인식하기 시작합니다.'
    },
    symbolism: [
      '검은 망토: 애도와 슬픔',
      '엎어진 세 개의 컵: 상실과 실패',
      '서 있는 두 개의 컵: 남은 희망',
      '다리: 새로운 길로의 전환',
      '멀리 있는 성: 미래의 가능성',
      '구부러진 자세: 슬픔에 잠김'
    ],
    imageUrl: '/images/tarot/Cups05.jpg',
    imageDescription: '검은 망토를 입은 인물이 엎질러진 컵들을 바라보고 있다.',
    relatedCards: ['cups-03', 'major-13-death', 'swords-03'],
    questions: [
      '무엇을 애도하고 있나요?',
      '아직 남아있는 것은 무엇인가요?',
      '언제 앞으로 나아갈 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 상실을 인정하고, 치유의 시간을 갖습니다.',
      reversed: '나는 과거를 놓아주고, 새로운 희망을 향해 나아갑니다.'
    },
    advice: {
      upright: '슬픔을 느끼는 것은 자연스럽지만, 남은 것도 보세요.',
      reversed: '이제 과거를 놓아주고 새로운 시작을 준비하세요.'
    },
    love: {
      upright: '이별이나 실연. 관계에서의 상실감.',
      reversed: '상처 치유와 새로운 사랑의 가능성.'
    },
    career: {
      upright: '직업적 실패나 실망. 기회 상실.',
      reversed: '실패에서 배우고 새로운 기회 모색.'
    },
    health: {
      upright: '감정적 스트레스로 인한 건강 문제.',
      reversed: '정신적 회복과 치유의 시작.'
    },
    spirituality: {
      upright: '영적 상실감이나 신앙의 위기.',
      reversed: '영적 치유와 새로운 믿음 발견.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-06',
    number: 6,
    name: 'Six of Cups',
    nameKorean: '컵 6',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['향수', '어린 시절', '순수함', '재회', '선물', '추억', '안전감'],
      reversed: ['과거 집착', '미성숙', '현실 도피', '과거와의 결별', '성장', '독립']
    },
    meaningShort: {
      upright: '즐거운 추억과 순수한 기쁨의 재발견',
      reversed: '과거에 대한 집착이나 성장의 필요성'
    },
    meaningDetailed: {
      upright: '컵 6은 어린 시절의 순수함과 즐거운 추억을 상징합니다. 오래된 친구와의 재회나 과거의 좋은 기억이 현재에 위안을 줍니다. 순수한 마음으로 주고받는 선물과 같은 관계를 나타냅니다.',
      reversed: '과거에 지나치게 집착하거나 현실을 도피하는 상태를 나타냅니다. 어린아이 같은 미성숙함이 문제가 되거나, 반대로 과거와 결별하고 성장해야 할 시기일 수 있습니다.'
    },
    symbolism: [
      '어린이들: 순수함과 과거',
      '꽃이 담긴 컵: 아름다운 추억',
      '마을 광장: 안전한 공간',
      '주고받는 제스처: 순수한 교류',
      '노란색 옷: 기쁨과 행복',
      '오래된 건물: 과거의 배경'
    ],
    imageUrl: '/images/tarot/Cups06.jpg',
    imageDescription: '한 아이가 다른 아이에게 꽃이 담긴 컵을 건네주고 있다.',
    relatedCards: ['cups-10', 'major-17-star', 'cups-ace'],
    questions: [
      '어떤 추억이 당신을 위로하나요?',
      '과거의 누구를 다시 만나고 싶나요?',
      '어린 시절의 꿈은 무엇이었나요?'
    ],
    affirmations: {
      upright: '나는 순수한 기쁨을 다시 발견하고, 아름다운 추억을 소중히 합니다.',
      reversed: '나는 과거를 놓아주고, 현재에 충실하게 살아갑니다.'
    },
    advice: {
      upright: '과거의 좋은 기억에서 위안을 찾되, 현재도 소중히 하세요.',
      reversed: '과거에 얽매이지 말고 성장과 변화를 받아들이세요.'
    },
    love: {
      upright: '과거 연인과의 재회나 순수한 사랑.',
      reversed: '과거 관계에 대한 집착이나 미성숙한 사랑.'
    },
    career: {
      upright: '과거 동료와의 협력이나 안정적 환경.',
      reversed: '구식 방법에 대한 집착이나 성장 정체.'
    },
    health: {
      upright: '어린 시절처럼 건강한 상태. 정서적 안정.',
      reversed: '퇴행이나 성장 거부로 인한 문제.'
    },
    spirituality: {
      upright: '순수한 영성으로의 회귀. 동심의 지혜.',
      reversed: '영적 미성숙이나 과거 신념 집착.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-07',
    number: 7,
    name: 'Seven of Cups',
    nameKorean: '컵 7',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['환상', '선택', '가능성', '상상력', '소망', '혼란', '유혹'],
      reversed: ['명확성', '결정', '현실 직시', '환상 깨짐', '집중', '선택']
    },
    meaningShort: {
      upright: '많은 선택지와 환상적인 가능성들',
      reversed: '환상에서 깨어나 현실적 선택하기'
    },
    meaningDetailed: {
      upright: '컵 7은 다양한 가능성과 환상을 상징합니다. 많은 선택지가 있지만 무엇이 진짜이고 무엇이 환상인지 구분하기 어렵습니다. 상상력이 풍부하지만 결정을 내리기 어려운 상태입니다.',
      reversed: '환상에서 깨어나 현실을 직시하는 상태를 나타냅니다. 명확한 비전을 갖고 실질적인 선택을 할 수 있게 됩니다. 우선순위를 정하고 집중할 수 있습니다.'
    },
    symbolism: [
      '구름 위의 일곱 컵: 환상과 꿈',
      '성: 안정과 성취',
      '보석: 물질적 부',
      '월계관: 명예와 성공',
      '용: 두려움과 도전',
      '뱀: 지혜나 유혹',
      '가려진 얼굴: 신비와 미지'
    ],
    imageUrl: '/images/tarot/Cups07.jpg',
    imageDescription: '실루엣 인물 앞에 구름 위 일곱 개의 컵이 다양한 것들을 담고 있다.',
    relatedCards: ['major-18-moon', 'cups-ace', 'swords-02'],
    questions: [
      '어떤 선택지들이 있나요?',
      '무엇이 진짜이고 무엇이 환상인가요?',
      '진정으로 원하는 것은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 모든 가능성을 탐색하며, 직관을 믿습니다.',
      reversed: '나는 환상과 현실을 구분하고, 명확한 선택을 합니다.'
    },
    advice: {
      upright: '모든 옵션을 검토하되, 환상에 빠지지 마세요.',
      reversed: '이제 결정을 내릴 때입니다. 현실적으로 접근하세요.'
    },
    love: {
      upright: '여러 로맨틱한 가능성이나 환상적 기대.',
      reversed: '환상에서 깨어나 진실한 사랑 발견.'
    },
    career: {
      upright: '다양한 직업 기회나 비현실적 기대.',
      reversed: '명확한 커리어 방향 설정.'
    },
    health: {
      upright: '건강에 대한 혼란이나 다양한 치료법.',
      reversed: '명확한 건강 계획과 실행.'
    },
    spirituality: {
      upright: '다양한 영적 길이나 환상적 경험.',
      reversed: '진정한 영적 길 발견과 집중.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-08',
    number: 8,
    name: 'Eight of Cups',
    nameKorean: '컵 8',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['포기', '떠남', '영적 탐구', '환멸', '더 높은 목적', '전환', '용기'],
      reversed: ['회피', '두려움', '미련', '표류', '포기 거부', '정체']
    },
    meaningShort: {
      upright: '더 높은 목적을 위해 현재를 떠나는 용기',
      reversed: '떠나야 할 때를 놓치거나 도피하는 상황'
    },
    meaningDetailed: {
      upright: '컵 8은 현재 상황을 떠나 더 높은 목적을 추구하는 것을 상징합니다. 감정적으로 충족되지 않는 상황에서 벗어나 영적 성장을 추구합니다. 용기 있는 결단과 새로운 여정의 시작을 나타냅니다.',
      reversed: '떠나야 할 상황에서 벗어나지 못하거나, 반대로 책임을 회피하는 상태를 나타냅니다. 두려움이나 미련으로 인해 정체되어 있거나, 목적 없이 표류하고 있을 수 있습니다.'
    },
    symbolism: [
      '떠나는 인물: 결단과 용기',
      '여덟 개의 정렬된 컵: 뒤에 남겨둔 것',
      '빈 공간: 무언가 부족함',
      '산을 향한 길: 영적 여정',
      '달: 직관과 내면의 부름',
      '지팡이: 여행자의 도구'
    ],
    imageUrl: '/images/tarot/Cups08.jpg',
    imageDescription: '달빛 아래 여덟 개의 컵을 뒤로 하고 산을 향해 떠나는 인물.',
    relatedCards: ['major-09-hermit', 'cups-05', 'swords-06'],
    questions: [
      '무엇을 떠나야 하나요?',
      '더 높은 목적은 무엇인가요?',
      '무엇이 당신을 붙잡고 있나요?'
    ],
    affirmations: {
      upright: '나는 더 큰 성장을 위해 용기 있게 떠납니다.',
      reversed: '나는 진정한 동기를 파악하고, 올바른 결정을 내립니다.'
    },
    advice: {
      upright: '때로는 떠나는 것이 최선입니다. 내면의 부름을 따르세요.',
      reversed: '도피가 아닌 진정한 해결책을 찾으세요.'
    },
    love: {
      upright: '충족되지 않는 관계를 떠남. 더 깊은 사랑 추구.',
      reversed: '관계에서 떠나지 못함. 회피적 태도.'
    },
    career: {
      upright: '의미 없는 직업을 떠남. 소명 추구.',
      reversed: '직업 전환 실패나 책임 회피.'
    },
    health: {
      upright: '건강을 위한 환경 변화. 치유 여행.',
      reversed: '필요한 변화를 거부. 치료 회피.'
    },
    spirituality: {
      upright: '깊은 영적 탐구를 위한 여정.',
      reversed: '영적 성장 회피나 표면적 탐구.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-09',
    number: 9,
    name: 'Nine of Cups',
    nameKorean: '컵 9',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['소원 성취', '만족', '행복', '풍요', '감사', '성공', '기쁨'],
      reversed: ['허영', '과잉', '표면적 행복', '탐욕', '미충족', '자만']
    },
    meaningShort: {
      upright: '소원 성취와 감정적 만족',
      reversed: '표면적 만족이나 과도한 욕심'
    },
    meaningDetailed: {
      upright: '컵 9는 소원 성취와 감정적 만족을 상징합니다. 바라던 것이 이루어지고 행복과 풍요를 누리는 시기입니다. 자신의 성취에 대한 정당한 자부심과 감사함을 느낍니다.',
      reversed: '물질적 성공에도 불구하고 내면의 공허함을 느끼거나, 과도한 탐욕으로 인한 문제를 나타냅니다. 겉으로는 행복해 보이지만 진정한 만족을 느끼지 못하는 상태입니다.'
    },
    symbolism: [
      '만족한 표정의 인물: 성취감',
      '아홉 개의 컵: 감정적 충만',
      '팔짱 낀 자세: 자신감과 만족',
      '붉은 모자: 열정의 성취',
      '파란 옷: 감정적 안정',
      '아치형 컵 배열: 완성과 보호'
    ],
    imageUrl: '/images/tarot/Cups09.jpg',
    imageDescription: '만족스러운 표정으로 팔짱을 낀 채 아홉 개의 컵 앞에 앉아있는 인물.',
    relatedCards: ['major-17-star', 'cups-10', 'major-21-world'],
    questions: [
      '무엇이 당신을 진정으로 행복하게 하나요?',
      '어떤 소원이 이루어졌나요?',
      '감사할 것은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 풍요롭고 만족스러우며, 모든 축복에 감사합니다.',
      reversed: '나는 진정한 행복이 무엇인지 알고, 내면의 충족을 추구합니다.'
    },
    advice: {
      upright: '성취를 즐기고 감사하세요. 당신은 그럴 자격이 있습니다.',
      reversed: '물질적 성공 너머의 진정한 행복을 찾으세요.'
    },
    love: {
      upright: '행복한 관계와 감정적 충족. 사랑의 성취.',
      reversed: '표면적 관계나 과도한 기대.'
    },
    career: {
      upright: '직업적 성공과 만족. 목표 달성.',
      reversed: '직업적 성공에도 불구한 공허함.'
    },
    health: {
      upright: '건강한 상태와 활력. 치유 완성.',
      reversed: '과식이나 과음. 건강 자만.'
    },
    spirituality: {
      upright: '영적 충족과 깨달음. 내적 평화.',
      reversed: '영적 자만이나 표면적 만족.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-10',
    number: 10,
    name: 'Ten of Cups',
    nameKorean: '컵 10',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['가족 화합', '행복', '완성', '사랑', '조화', '축복', '꿈의 실현'],
      reversed: ['가족 불화', '깨진 꿈', '부조화', '가치관 충돌', '환상', '불완전']
    },
    meaningShort: {
      upright: '완벽한 행복과 가족의 화합',
      reversed: '가족 문제나 이상과 현실의 괴리'
    },
    meaningDetailed: {
      upright: '컵 10은 감정적 충족의 정점을 상징합니다. 사랑하는 사람들과 함께하는 완벽한 행복, 가족의 화합, 그리고 꿈의 실현을 나타냅니다. 모든 것이 조화롭고 축복받은 상태입니다.',
      reversed: '이상적인 가족이나 관계에 대한 환상이 깨지는 상황을 나타냅니다. 가족 간의 불화나 가치관 충돌, 혹은 완벽한 행복을 추구하다 현실을 놓치는 상태일 수 있습니다.'
    },
    symbolism: [
      '무지개: 약속과 희망의 성취',
      '열 개의 컵: 감정의 완성',
      '행복한 가족: 조화와 사랑',
      '춤추는 아이들: 순수한 기쁨',
      '집: 안정과 안전',
      '푸른 하늘: 평화와 청명함'
    ],
    imageUrl: '/images/tarot/Cups10.jpg',
    imageDescription: '무지개 아래서 행복한 가족이 함께 있고, 아이들이 춤추고 있다.',
    relatedCards: ['cups-02', 'major-10-wheel', 'major-21-world'],
    questions: [
      '진정한 행복은 무엇인가요?',
      '가족이나 사랑하는 사람들과의 관계는 어떤가요?',
      '어떤 꿈을 실현하고 싶나요?'
    ],
    affirmations: {
      upright: '나는 사랑으로 둘러싸여 있으며, 완전한 행복을 누립니다.',
      reversed: '나는 불완전함 속에서도 진정한 사랑을 발견합니다.'
    },
    advice: {
      upright: '이 행복한 순간을 감사하고 소중히 여기세요.',
      reversed: '완벽을 추구하지 말고 있는 그대로를 사랑하세요.'
    },
    love: {
      upright: '완벽한 사랑과 관계의 성취. 결혼과 가족.',
      reversed: '관계의 이상과 현실 사이의 갈등.'
    },
    career: {
      upright: '일과 삶의 완벽한 균형. 직업적 만족.',
      reversed: '일과 가정의 불균형. 가치관 충돌.'
    },
    health: {
      upright: '전반적인 건강과 웰빙. 정서적 안정.',
      reversed: '가족 스트레스로 인한 건강 문제.'
    },
    spirituality: {
      upright: '영적 충족과 우주적 조화.',
      reversed: '영적 이상과 현실의 괴리.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-page',
    number: 11,
    name: 'Page of Cups',
    nameKorean: '컵 시종',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['감정적 메시지', '창의성', '직관', '새로운 감정', '예술적 영감', '낭만', '꿈'],
      reversed: ['감정적 미성숙', '막힌 창의성', '비현실적', '감정 기복', '나쁜 소식', '현실 도피']
    },
    meaningShort: {
      upright: '새로운 감정적 경험과 창의적 영감',
      reversed: '감정적 미성숙이나 비현실적 기대'
    },
    meaningDetailed: {
      upright: '컵 시종은 새로운 감정적 시작과 창의적 영감을 상징합니다. 예술적 재능이 꽃피거나 새로운 로맨스가 시작될 수 있습니다. 직관적 메시지나 꿈을 통한 통찰이 올 수 있습니다.',
      reversed: '감정적으로 미성숙하거나 현실과 동떨어진 상태를 나타냅니다. 창의성이 막히거나 감정 기복이 심할 수 있으며, 기대했던 좋은 소식이 실망으로 바뀔 수 있습니다.'
    },
    symbolism: [
      '물고기가 든 컵: 무의식의 메시지',
      '화려한 의상: 창의성과 상상력',
      '바다: 감정의 깊이',
      '젊은 인물: 새로운 시작',
      '놀란 표정: 예상치 못한 발견',
      '파란색과 분홍색: 감정과 사랑'
    ],
    imageUrl: '/images/tarot/Cups11.jpg',
    imageDescription: '바닷가에서 물고기가 나온 컵을 들고 놀라는 젊은 시종.',
    relatedCards: ['cups-ace', 'major-00-fool', 'cups-knight'],
    questions: [
      '어떤 창의적 아이디어가 떠오르나요?',
      '무슨 감정적 메시지를 받았나요?',
      '직관이 무엇을 말하고 있나요?'
    ],
    affirmations: {
      upright: '나는 새로운 감정적 경험에 열려있으며, 창의성이 흘러넘칩니다.',
      reversed: '나는 감정적으로 성숙해지며, 현실과 꿈의 균형을 찾습니다.'
    },
    advice: {
      upright: '창의적 영감을 따르고 감정에 귀 기울이세요.',
      reversed: '감정을 성숙하게 다루고 현실적으로 접근하세요.'
    },
    love: {
      upright: '새로운 로맨스나 사랑의 메시지. 첫사랑.',
      reversed: '미성숙한 사랑이나 일방적 감정.'
    },
    career: {
      upright: '창의적 프로젝트나 예술적 기회.',
      reversed: '비현실적 계획이나 창의성 부족.'
    },
    health: {
      upright: '감정적 치유와 새로운 시작.',
      reversed: '감정 기복으로 인한 스트레스.'
    },
    spirituality: {
      upright: '직관적 깨달음이나 영적 메시지.',
      reversed: '영적 환상이나 미성숙한 접근.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-knight',
    number: 12,
    name: 'Knight of Cups',
    nameKorean: '컵 기사',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['로맨스', '매력', '상상력', '예술성', '우아함', '초대', '이상주의'],
      reversed: ['감정적 조작', '질투', '우울', '비현실적', '변덕', '실망']
    },
    meaningShort: {
      upright: '낭만적 제안과 감정적 추구',
      reversed: '감정적 불안정이나 환상에 빠짐'
    },
    meaningDetailed: {
      upright: '컵 기사는 낭만적이고 매력적인 에너지를 상징합니다. 사랑의 제안이나 창의적 프로젝트를 가져옵니다. 이상을 추구하며 우아하고 예술적인 방식으로 목표를 추구합니다.',
      reversed: '감정적으로 불안정하거나 조작적인 행동을 나타냅니다. 비현실적인 기대나 환상에 빠져 실망할 수 있으며, 변덕스러운 감정으로 인해 관계에 문제가 생길 수 있습니다.'
    },
    symbolism: [
      '백마: 순수한 감정',
      '천천히 가는 말: 신중한 접근',
      '컵을 든 자세: 감정적 제안',
      '날개 달린 투구: 상상력',
      '강: 감정의 흐름',
      '푸른 갑옷: 감정의 보호'
    ],
    imageUrl: '/images/tarot/Cups12.jpg',
    imageDescription: '백마를 타고 컵을 든 채 천천히 전진하는 우아한 기사.',
    relatedCards: ['cups-page', 'major-06-lovers', 'cups-02'],
    questions: [
      '어떤 감정적 제안을 하고 싶나요?',
      '이상과 현실의 균형은 어떤가요?',
      '누구에게 마음을 전하고 싶나요?'
    ],
    affirmations: {
      upright: '나는 우아하게 감정을 표현하며, 이상을 추구합니다.',
      reversed: '나는 감정적 균형을 찾고, 현실적으로 사랑합니다.'
    },
    advice: {
      upright: '마음을 따르되 현실도 고려하세요. 우아하게 접근하세요.',
      reversed: '감정에 휩쓸리지 말고 안정을 찾으세요.'
    },
    love: {
      upright: '로맨틱한 제안이나 구애. 이상적 파트너.',
      reversed: '감정적 조작이나 불안정한 관계.'
    },
    career: {
      upright: '창의적 프로젝트나 예술적 추구.',
      reversed: '비현실적 계획이나 감정적 결정.'
    },
    health: {
      upright: '감정적 웰빙과 균형.',
      reversed: '우울이나 감정 기복.'
    },
    spirituality: {
      upright: '영적 이상 추구와 직관적 여정.',
      reversed: '영적 환상이나 현실 도피.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-queen',
    number: 13,
    name: 'Queen of Cups',
    nameKorean: '컵 여왕',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['직관', '연민', '감정적 성숙', '양육', '공감', '영적 지혜', '치유'],
      reversed: ['감정적 불안정', '의존성', '자기 희생', '감정 억압', '조종', '현실 도피']
    },
    meaningShort: {
      upright: '깊은 직관과 감정적 지혜의 구현',
      reversed: '감정적 불균형이나 과도한 감정 이입'
    },
    meaningDetailed: {
      upright: '컵 여왕은 감정적 성숙과 깊은 직관을 상징합니다. 타인의 감정을 이해하고 공감하며, 치유의 에너지를 가지고 있습니다. 영적 지혜와 모성적 사랑으로 다른 사람들을 돌봅니다.',
      reversed: '감정적으로 불안정하거나 타인에게 지나치게 의존하는 상태를 나타냅니다. 자신을 희생하면서까지 남을 돌보거나, 감정을 억압하여 문제가 생길 수 있습니다.'
    },
    symbolism: [
      '닫힌 컵: 내면의 비밀',
      '물가의 왕좌: 감정의 경계',
      '조개껍질 왕좌: 감정의 보호',
      '천사와 인어: 영적 연결',
      '잔잔한 물: 감정의 평온',
      '흐르는 드레스: 감정의 유동성'
    ],
    imageUrl: '/images/tarot/Cups13.jpg',
    imageDescription: '물가에서 정교한 컵을 들고 명상하는 직관적인 여왕.',
    relatedCards: ['major-02-priestess', 'cups-king', 'major-18-moon'],
    questions: [
      '직관이 무엇을 말하고 있나요?',
      '누구를 돌보고 있나요?',
      '감정적 경계는 건강한가요?'
    ],
    affirmations: {
      upright: '나는 직관을 신뢰하며, 사랑과 연민으로 행동합니다.',
      reversed: '나는 건강한 감정적 경계를 설정하고, 나 자신도 돌봅니다.'
    },
    advice: {
      upright: '직관을 따르고 연민을 베푸세요. 감정적 지혜를 활용하세요.',
      reversed: '자신을 먼저 돌보고 건강한 경계를 설정하세요.'
    },
    love: {
      upright: '깊은 감정적 연결과 양육하는 사랑.',
      reversed: '감정적 의존이나 불균형한 관계.'
    },
    career: {
      upright: '상담이나 치유 관련 직업. 직관적 결정.',
      reversed: '직장에서의 감정적 소진이나 경계 부족.'
    },
    health: {
      upright: '감정적 건강과 치유 능력.',
      reversed: '감정적 스트레스나 정신 건강 문제.'
    },
    spirituality: {
      upright: '깊은 영적 직관과 사이킥 능력.',
      reversed: '영적 혼란이나 현실과의 단절.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cups-king',
    number: 14,
    name: 'King of Cups',
    nameKorean: '컵 왕',
    arcana: 'minor',
    suit: 'cups',
    element: 'Water',
    keywords: {
      upright: ['감정적 균형', '성숙', '외교', '현명함', '관대함', '조언자', '통제'],
      reversed: ['감정 억압', '조작', '냉담', '변덕', '감정적 폭발', '불균형']
    },
    meaningShort: {
      upright: '감정과 이성의 완벽한 균형',
      reversed: '감정 억압이나 조작적 행동'
    },
    meaningDetailed: {
      upright: '컵 왕은 감정적 성숙과 지혜를 상징합니다. 감정을 이해하고 통제할 수 있으며, 다른 사람들에게 현명한 조언을 제공합니다. 외교적이고 균형 잡힌 방식으로 상황을 처리합니다.',
      reversed: '감정을 억압하거나 조작적으로 사용하는 상태를 나타냅니다. 겉으로는 침착해 보이지만 내면에는 억눌린 감정이 있을 수 있으며, 때로는 감정적으로 폭발할 수 있습니다.'
    },
    symbolism: [
      '물 위의 왕좌: 감정의 지배',
      '물고기 목걸이: 무의식과의 연결',
      '홀과 컵: 권위와 감정',
      '떠있는 배: 감정의 항해',
      '잔잔한 바다: 통제된 감정',
      '푸른 로브: 감정적 깊이'
    ],
    imageUrl: '/images/tarot/Cups14.jpg',
    imageDescription: '바다 위 왕좌에 앉아 컵과 홀을 든 균형 잡힌 왕.',
    relatedCards: ['cups-queen', 'major-14-temperance', 'major-07-chariot'],
    questions: [
      '감정을 어떻게 통제하고 있나요?',
      '누구에게 조언을 해줄 수 있나요?',
      '감정과 이성의 균형은 어떤가요?'
    ],
    affirmations: {
      upright: '나는 감정을 현명하게 다루며, 균형 잡힌 조언을 제공합니다.',
      reversed: '나는 억눌린 감정을 인정하고, 건강하게 표현합니다.'
    },
    advice: {
      upright: '감정적 지혜를 활용하여 현명하게 이끄세요.',
      reversed: '감정을 억압하지 말고 건강하게 표현하세요.'
    },
    love: {
      upright: '성숙하고 안정적인 파트너. 감정적 지지.',
      reversed: '감정적으로 거리를 두거나 조작적인 관계.'
    },
    career: {
      upright: '현명한 리더십이나 상담 역할. 외교적 성공.',
      reversed: '감정을 이용한 조작이나 리더십 문제.'
    },
    health: {
      upright: '감정적 안정과 정신 건강.',
      reversed: '억압된 감정으로 인한 건강 문제.'
    },
    spirituality: {
      upright: '영적 성숙과 감정적 지혜.',
      reversed: '영적 불균형이나 감정적 차단.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];