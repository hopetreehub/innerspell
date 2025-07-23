import { TarotCard } from '@/types/tarot';

// 소드(Swords) 수트 - 공기의 원소, 정신과 갈등
export const swordsCards: TarotCard[] = [
  {
    id: 'swords-ace',
    number: 1,
    name: 'Ace of Swords',
    nameKorean: '소드 에이스',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['정신적 명료함', '새로운 아이디어', '진실', '정의', '돌파구', '의사소통', '승리'],
      reversed: ['혼란', '잘못된 정보', '정신적 차단', '부정의', '폭력', '오해']
    },
    meaningShort: {
      upright: '정신적 명료함과 진실의 발견',
      reversed: '정신적 혼란이나 잘못된 정보'
    },
    meaningDetailed: {
      upright: '소드 에이스는 정신적 명료함과 새로운 아이디어의 돌파구를 상징합니다. 진실이 드러나고 정의가 실현되는 시기입니다. 강력한 의사소통 능력과 지적 통찰력이 승리를 가져다줍니다.',
      reversed: '정신적 혼란이나 잘못된 정보로 인한 오해를 나타냅니다. 진실이 왜곡되거나 의사소통에 문제가 생겨 갈등이 발생할 수 있습니다.'
    },
    symbolism: [
      '구름에서 나온 손: 신성한 지혜',
      '왕관이 꽂힌 소드: 정신적 승리',
      '월계수와 종려나무: 평화와 승리',
      '산: 도전과 극복',
      '날카로운 검: 명확한 판단',
      '하얀 구름: 순수한 진실'
    ],
    imageUrl: '/images/tarot/Swords01.jpg',
    imageDescription: '구름에서 나온 손이 왕관이 씌워진 소드를 들고 있다.',
    relatedCards: ['major-08-strength', 'major-11-justice', 'swords-02'],
    questions: [
      '어떤 진실이 드러나고 있나요?',
      '새로운 아이디어는 무엇인가요?',
      '정의를 실현하려면 어떻게 해야 할까요?'
    ],
    affirmations: {
      upright: '나는 명확한 정신으로 진실을 보고, 정의를 추구합니다.',
      reversed: '나는 혼란을 정리하고, 올바른 정보를 추구합니다.'
    },
    advice: {
      upright: '명확한 사고로 진실을 추구하고 정의를 실현하세요.',
      reversed: '정보의 진위를 확인하고 오해를 풀어나가세요.'
    },
    love: {
      upright: '관계에서의 진실한 소통. 새로운 이해.',
      reversed: '오해나 거짓말로 인한 관계 문제.'
    },
    career: {
      upright: '새로운 프로젝트나 아이디어의 성공. 법적 승리.',
      reversed: '직장에서의 오해나 부정의한 대우.'
    },
    health: {
      upright: '정신적 명료함과 새로운 치료법 발견.',
      reversed: '스트레스나 정신적 혼란으로 인한 건강 문제.'
    },
    spirituality: {
      upright: '영적 통찰과 진리 발견.',
      reversed: '영적 혼란이나 잘못된 가르침.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-02',
    number: 2,
    name: 'Two of Swords',
    nameKorean: '소드 2',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['결정 불가', '균형', '정보 부족', '중립', '막힘', '평화로운 정체', '명상'],
      reversed: ['혼란', '결정', '정보 과부하', '거짓 평화', '압도됨', '편향']
    },
    meaningShort: {
      upright: '어려운 선택 앞에서의 균형과 정체',
      reversed: '혼란 속에서 결정을 내리거나 압도당함'
    },
    meaningDetailed: {
      upright: '소드 2는 결정을 내리기 어려운 상황을 상징합니다. 두 선택지 사이에서 균형을 유지하고 있지만, 충분한 정보가 없어 결정을 미루고 있습니다. 평화로운 정체 상태이지만 진전이 없습니다.',
      reversed: '정보 과부하나 혼란으로 인해 잘못된 결정을 내리거나, 반대로 강제로 결정을 내려야 하는 상황을 나타냅니다. 거짓된 평화가 깨지거나 편향된 판단을 할 수 있습니다.'
    },
    symbolism: [
      '눈을 가린 여성: 객관적 판단의 어려움',
      '교차된 두 소드: 대립하는 선택',
      '초승달: 무의식과 직감',
      '바다: 감정의 깊이',
      '바위들: 장애물',
      '균형 잡힌 자세: 중립성'
    ],
    imageUrl: '/images/tarot/Swords02.jpg',
    imageDescription: '눈을 가리고 두 개의 소드를 가슴에 안고 있는 여성.',
    relatedCards: ['major-02-priestess', 'swords-07', 'major-11-justice'],
    questions: [
      '어떤 결정을 내려야 하나요?',
      '더 필요한 정보는 무엇인가요?',
      '직감은 무엇을 말하고 있나요?'
    ],
    affirmations: {
      upright: '나는 충분한 정보를 수집하고, 균형 잡힌 결정을 내립니다.',
      reversed: '나는 혼란을 정리하고, 명확한 선택을 합니다.'
    },
    advice: {
      upright: '서두르지 말고 충분한 정보를 수집한 후 결정하세요.',
      reversed: '더 이상 미루지 말고 결정을 내리세요.'
    },
    love: {
      upright: '관계에서의 애매한 상황. 결정 유보.',
      reversed: '관계 결정을 강요받거나 혼란 상태.'
    },
    career: {
      upright: '직업 선택의 고민. 정보 수집 필요.',
      reversed: '직장에서 강제 결정이나 혼란.'
    },
    health: {
      upright: '치료법 선택의 고민. 세컨드 오피니언 필요.',
      reversed: '건강 정보의 혼란이나 잘못된 치료.'
    },
    spirituality: {
      upright: '영적 길의 선택. 내면의 평화.',
      reversed: '영적 혼란이나 강요된 신념.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-03',
    number: 3,
    name: 'Three of Swords',
    nameKorean: '소드 3',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['가슴 아픔', '이별', '배신', '슬픔', '상실', '치유 시작', '감정적 고통'],
      reversed: ['치유', '용서', '회복', '낙관주의', '화해', '상처 극복']
    },
    meaningShort: {
      upright: '깊은 상처와 감정적 고통',
      reversed: '상처의 치유와 회복 시작'
    },
    meaningDetailed: {
      upright: '소드 3은 깊은 감정적 고통과 상처를 상징합니다. 이별, 배신, 또는 큰 상실로 인한 가슴 아픔을 나타냅니다. 고통스럽지만 이것이 치유의 첫 단계이기도 합니다.',
      reversed: '상처가 치유되기 시작하고 회복의 징조를 보이는 상태를 나타냅니다. 용서와 화해의 가능성이 있으며, 과거의 고통에서 벗어나 새로운 시작을 준비합니다.'
    },
    symbolism: [
      '세 개의 소드: 삼중의 고통',
      '관통된 심장: 깊은 상처',
      '먹구름: 슬픔과 우울',
      '비: 눈물과 정화',
      '붉은 심장: 사랑과 고통',
      '회색 하늘: 우울한 감정'
    ],
    imageUrl: '/images/tarot/Swords03.jpg',
    imageDescription: '세 개의 소드가 빨간 심장을 관통하고 있고, 비가 내리고 있다.',
    relatedCards: ['cups-05', 'major-13-death', 'swords-05'],
    questions: [
      '어떤 상처를 치유해야 하나요?',
      '무엇이 당신을 아프게 하나요?',
      '어떻게 이 고통을 극복할 수 있을까요?'
    ],
    affirmations: {
      upright: '나는 고통을 인정하고, 치유의 과정을 받아들입니다.',
      reversed: '나는 상처를 치유하고, 더 강해져서 일어납니다.'
    },
    advice: {
      upright: '고통을 억누르지 말고 자연스럽게 흘려보내세요.',
      reversed: '이제 치유의 시간입니다. 과거를 놓아주세요.'
    },
    love: {
      upright: '이별이나 불륜으로 인한 배신. 관계의 종료.',
      reversed: '관계 회복이나 새로운 사랑의 가능성.'
    },
    career: {
      upright: '직장에서의 배신이나 해고. 프로젝트 실패.',
      reversed: '직업적 상처의 치유. 새로운 기회.'
    },
    health: {
      upright: '심장 관련 문제나 우울증. 스트레스.',
      reversed: '정신적 회복과 치유의 시작.'
    },
    spirituality: {
      upright: '영적 시련이나 신앙의 위기.',
      reversed: '영적 치유와 새로운 깨달음.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-04',
    number: 4,
    name: 'Four of Swords',
    nameKorean: '소드 4',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['휴식', '명상', '평화', '회복', '고립', '성찰', '정적'],
      reversed: ['불안', '정신적 과로', '재시작', '각성', '활동', '복귀']
    },
    meaningShort: {
      upright: '평화로운 휴식과 명상의 시간',
      reversed: '휴식의 끝과 활동 재개'
    },
    meaningDetailed: {
      upright: '소드 4는 평화로운 휴식과 명상을 상징합니다. 분투 후 얻은 고요한 시간으로, 정신적 회복과 성찰이 필요한 시기입니다. 의도적인 고립과 내면의 평화를 추구합니다.',
      reversed: '휴식이 끝나고 다시 활동해야 할 시기를 나타냅니다. 정신적 불안이나 과로로 인해 제대로 쉬지 못하거나, 반대로 너무 오래 쉬어서 행동에 옮길 때가 되었습니다.'
    },
    symbolism: [
      '누워있는 기사: 휴식과 평화',
      '석관: 일시적 죽음과 재생',
      '세 개의 벽 소드: 과거의 투쟁',
      '한 개의 바닥 소드: 남은 과제',
      '스테인드글라스: 영적 보호',
      '기도하는 자세: 명상과 평화'
    ],
    imageUrl: '/images/tarot/Swords04.jpg',
    imageDescription: '교회에서 평화롭게 누워있는 기사와 세 개의 소드.',
    relatedCards: ['major-12-hangedman', 'major-09-hermit', 'swords-02'],
    questions: [
      '어떤 휴식이 필요한가요?',
      '무엇을 성찰해야 하나요?',
      '언제까지 쉬어야 할까요?'
    ],
    affirmations: {
      upright: '나는 평화로운 휴식을 취하며, 내면의 지혜를 찾습니다.',
      reversed: '나는 충분히 쉬었고, 이제 행동할 준비가 되었습니다.'
    },
    advice: {
      upright: '무리하지 말고 충분한 휴식을 취하세요. 명상하세요.',
      reversed: '이제 행동할 때입니다. 휴식을 끝내세요.'
    },
    love: {
      upright: '관계에서 시간을 갖기. 거리 두기.',
      reversed: '관계 재개나 새로운 만남 준비.'
    },
    career: {
      upright: '휴직이나 안식년. 재충전 시간.',
      reversed: '업무 복귀나 새로운 프로젝트 시작.'
    },
    health: {
      upright: '회복을 위한 휴식. 병원이나 요양.',
      reversed: '건강 회복과 활동 재개.'
    },
    spirituality: {
      upright: '깊은 명상과 영적 휴식.',
      reversed: '영적 각성과 실천 시작.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-05',
    number: 5,
    name: 'Five of Swords',
    nameKorean: '소드 5',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['갈등', '패배', '자기중심', '배신', '승리의 공허함', '불명예', '복수'],
      reversed: ['화해', '용서', '교훈', '겸손', '패배 인정', '평화 추구']
    },
    meaningShort: {
      upright: '갈등과 배신으로 인한 공허한 승리',
      reversed: '화해와 용서를 통한 평화 추구'
    },
    meaningDetailed: {
      upright: '소드 5는 불명예스러운 갈등과 공허한 승리를 상징합니다. 이기기 위해 수단과 방법을 가리지 않아 도덕적 패배를 당했거나, 다른 사람의 배신으로 인해 상처받은 상태입니다.',
      reversed: '갈등에서 물러나 화해를 추구하거나, 패배를 인정하고 교훈을 얻는 상태를 나타냅니다. 겸손함을 배우고 평화로운 해결책을 찾으려 노력합니다.'
    },
    symbolism: [
      '승리자의 냉소적 표정: 공허한 승리',
      '다섯 개의 소드: 완전한 갈등',
      '떠나는 패배자들: 굴욕과 상실',
      '흐린 하늘: 불길한 분위기',
      '바람에 나는 머리카락: 혼란',
      '버려진 소드: 포기'
    ],
    imageUrl: '/images/tarot/Swords05.jpg',
    imageDescription: '소드를 모으는 승리자와 등을 돌리고 떠나는 패배자들.',
    relatedCards: ['swords-03', 'major-15-devil', 'swords-07'],
    questions: [
      '어떤 갈등을 겪고 있나요?',
      '승리가 정말 가치 있었나요?',
      '화해할 수 있는 방법은 무엇인가요?'
    ],
    affirmations: {
      upright: '나는 갈등에서 교훈을 얻고, 더 나은 사람이 됩니다.',
      reversed: '나는 용서하고 화해하며, 평화를 추구합니다.'
    },
    advice: {
      upright: '승리에 집착하지 말고 도덕성을 유지하세요.',
      reversed: '자존심을 내려놓고 화해의 손을 내미세요.'
    },
    love: {
      upright: '관계에서의 배신이나 불명예스러운 승리.',
      reversed: '관계 회복을 위한 노력과 용서.'
    },
    career: {
      upright: '직장에서의 정치적 갈등이나 불의한 승리.',
      reversed: '직장 갈등 해결과 협력 추구.'
    },
    health: {
      upright: '스트레스로 인한 건강 악화. 정신적 상처.',
      reversed: '스트레스 해소와 정신적 회복.'
    },
    spirituality: {
      upright: '영적 갈등이나 도덕적 타락.',
      reversed: '영적 화해와 겸손한 자세.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-06',
    number: 6,
    name: 'Six of Swords',
    nameKorean: '소드 6',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['전환', '여행', '회복', '평온한 물', '도움', '진전', '희망'],
      reversed: ['정체', '저항', '과거 회귀', '개인적 전환', '내적 여정', '지연']
    },
    meaningShort: {
      upright: '평온한 전환과 더 나은 곳으로의 이동',
      reversed: '전환의 저항이나 내적 여정'
    },
    meaningDetaile: {
      upright: '소드 6은 어려운 시기를 벗어나 더 평온한 곳으로 이동하는 것을 상징합니다. 과거의 문제들을 뒤로 하고 새로운 시작을 향해 나아가며, 도움을 받아 안전하게 전환됩니다.',
      reversed: '변화에 저항하거나 과거로 돌아가려는 경향을 나타냅니다. 외부 도움보다는 내적 변화에 집중하거나, 전환이 지연되어 답답함을 느낄 수 있습니다.'
    },
    symbolism: [
      '배: 전환과 여행',
      '잔잔한 물: 평온한 미래',
      '여섯 개의 소드: 과거의 문제들',
      '베일 쓴 인물: 슬픔과 보호',
      '아이: 새로운 시작',
      '사공: 안내자와 도움'
    ],
    imageUrl: '/images/tarot/Swords06.jpg',
    imageDescription: '배를 타고 여섯 개의 소드와 함께 평온한 물을 건너는 가족.',
    relatedCards: ['major-13-death', 'cups-08', 'major-06-lovers'],
    questions: [
      '무엇을 뒤로 하고 있나요?',
      '어디로 향하고 있나요?',
      '누구의 도움이 필요한가요?'
    ],
    affirmations: {
      upright: '나는 과거를 뒤로 하고, 평온한 미래를 향해 나아갑니다.',
      reversed: '나는 내면의 변화를 통해 진정한 전환을 이룹니다.'
    },
    advice: {
      upright: '과거에 얽매이지 말고 새로운 시작을 위해 떠나세요.',
      reversed: '외부 변화보다 내면의 변화에 집중하세요.'
    },
    love: {
      upright: '관계의 전환이나 새로운 곳에서의 만남.',
      reversed: '관계 변화에 대한 저항이나 내적 성장.'
    },
    career: {
      upright: '직장 이동이나 새로운 직업 환경.',
      reversed: '직업 변화의 지연이나 내적 준비.'
    },
    health: {
      upright: '회복을 위한 환경 변화나 요양.',
      reversed: '내적 치유나 정신적 회복.'
    },
    spirituality: {
      upright: '영적 여정이나 새로운 가르침.',
      reversed: '내면의 영적 변화와 성장.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-07',
    number: 7,
    name: 'Seven of Swords',
    nameKorean: '소드 7',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['기만', '계략', '도둑질', '혼자 행동', '전략', '회피', '속임수'],
      reversed: ['정직', '고백', '양심의 가책', '협력', '도덕적 선택', '속임수 발각']
    },
    meaningShort: {
      upright: '교묘한 계략과 혼자만의 행동',
      reversed: '정직함과 협력으로의 회귀'
    },
    meaningDetailed: {
      upright: '소드 7은 기만과 계략을 상징합니다. 목적 달성을 위해 교묘한 방법을 사용하거나, 혼자서 몰래 행동하는 상황을 나타냅니다. 완전한 성공은 어렵지만 부분적 목표는 달성할 수 있습니다.',
      reversed: '속임수가 발각되거나 양심의 가책을 느끼는 상태를 나타냅니다. 정직한 방법으로 돌아가거나 협력을 통해 문제를 해결하려고 노력합니다.'
    },
    symbolism: [
      '몰래 도망가는 인물: 기만과 도피',
      '다섯 개의 훔친 소드: 부분적 성공',
      '두 개의 남은 소드: 완전하지 못한 계획',
      '군대 텐트: 적의 영역',
      '발끝으로 걷기: 조심스런 행동',
      '뒤돌아보는 시선: 경계심'
    ],
    imageUrl: '/images/tarot/Swords07.jpg',
    imageDescription: '군대 진영에서 몰래 소드를 훔쳐 도망가는 인물.',
    relatedCards: ['major-15-devil', 'swords-05', 'major-07-chariot'],
    questions: [
      '어떤 계략을 사용하고 있나요?',
      '정직한 방법은 없을까요?',
      '무엇을 숨기고 있나요?'
    ],
    affirmations: {
      upright: '나는 창의적 전략을 사용하되, 도덕성을 유지합니다.',
      reversed: '나는 정직하게 행동하고, 협력을 통해 목표를 달성합니다.'
    },
    advice: {
      upright: '전략적으로 행동하되 완전한 기만은 피하세요.',
      reversed: '정직함이 최선의 정책입니다. 협력하세요.'
    },
    love: {
      upright: '관계에서의 속임수나 숨김. 바람.',
      reversed: '진실 고백이나 정직한 관계 추구.'
    },
    career: {
      upright: '직장에서의 정치적 계략이나 경쟁.',
      reversed: '정직한 업무 수행과 팀워크.'
    },
    health: {
      upright: '건강 정보 은폐나 치료 회피.',
      reversed: '정직한 건강 관리와 전문가 상담.'
    },
    spirituality: {
      upright: '영적 기만이나 거짓 가르침.',
      reversed: '진정한 영적 길과 정직한 수행.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-08',
    number: 8,
    name: 'Eight of Swords',
    nameKorean: '소드 8',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['제약', '속박', '무력감', '두려움', '자기 제한', '갇힌 기분', '희생자 의식'],
      reversed: ['자유', '해방', '통제력 회복', '내적 힘', '제약 극복', '자기 구원']
    },
    meaningShort: {
      upright: '제약과 무력감에 갇힌 상태',
      reversed: '제약에서 벗어나 자유를 찾음'
    },
    meaningDetailed: {
      upright: '소드 8은 제약과 속박감을 상징합니다. 실제로는 선택의 여지가 있지만 두려움이나 자기 제한으로 인해 갇혀있다고 느끼는 상태입니다. 희생자 의식이나 무력감에 빠져있습니다.',
      reversed: '제약에서 벗어나 자유를 찾는 상태를 나타냅니다. 자신의 힘을 인식하고 스스로를 구원하며, 제한이 대부분 마음의 산물임을 깨닫습니다.'
    },
    symbolism: [
      '눈을 가린 여성: 옵션을 보지 못함',
      '묶인 손: 무력감',
      '여덟 개의 소드: 완전한 포위',
      '진흙 바닥: 갇힌 상황',
      '성: 안전한 곳이 가까이',
      '비어있는 공간: 탈출구'
    ],
    imageUrl: '/images/tarot/Swords08.jpg',
    imageDescription: '여덟 개의 소드에 둘러싸여 눈을 가리고 묶여있는 여성.',
    relatedCards: ['major-12-hangedman', 'swords-09', 'major-15-devil'],
    questions: [
      '무엇이 당신을 제약하나요?',
      '어떤 두려움이 있나요?',
      '탈출구는 어디에 있나요?'
    ],
    affirmations: {
      upright: '나는 내 제약이 무엇인지 인식하고, 해결책을 찾습니다.',
      reversed: '나는 자유롭고 강력하며, 내 삶을 스스로 통제합니다.'
    },
    advice: {
      upright: '제약이 진짜인지 확인하고, 작은 단계부터 시작하세요.',
      reversed: '자신의 힘을 믿고 용기 있게 행동하세요.'
    },
    love: {
      upright: '관계에서 갇힌 느낌이나 제약.',
      reversed: '관계의 자유와 새로운 가능성.'
    },
    career: {
      upright: '직업적 제약이나 갇힌 상황.',
      reversed: '새로운 기회와 직업적 자유.'
    },
    health: {
      upright: '건강상 제약이나 치료의 한계.',
      reversed: '건강 회복과 활동 증가.'
    },
    spirituality: {
      upright: '영적 제약이나 신념의 감옥.',
      reversed: '영적 자유와 해방.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-09',
    number: 9,
    name: 'Nine of Swords',
    nameKorean: '소드 9',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['악몽', '불안', '죄책감', '절망', '정신적 고통', '우울', '자책'],
      reversed: ['회복', '희망', '용서', '치유', '악몽 극복', '내적 평화', '새로운 시작']
    },
    meaningShort: {
      upright: '깊은 불안과 정신적 고통',
      reversed: '불안에서 벗어나 회복과 희망'
    },
    meaningDetailed: {
      upright: '소드 9는 깊은 불안과 정신적 고통을 상징합니다. 악몽, 죄책감, 후회로 인해 잠 못 이루는 밤을 보내며, 절망과 우울에 빠져있습니다. 대부분의 고통은 실제보다 마음에서 만들어진 것입니다.',
      reversed: '악몽과 불안에서 벗어나 회복하기 시작하는 상태를 나타냅니다. 자신을 용서하고 희망을 찾으며, 정신적 치유와 내적 평화를 추구합니다.'
    },
    symbolism: [
      '침대에서 일어나는 인물: 악몽에서 깨어남',
      '머리를 감싸 안는 자세: 절망과 고통',
      '아홉 개의 소드: 압도적 걱정',
      '어둠: 우울과 절망',
      '침대보의 장미: 숨겨진 희망',
      '점성술 기호: 운명과 순환'
    ],
    imageUrl: '/images/tarot/Swords09.jpg',
    imageDescription: '침대에서 머리를 감싸 안고 절망하는 인물과 벽의 소드들.',
    relatedCards: ['major-18-moon', 'swords-03', 'cups-05'],
    questions: [
      '무엇이 당신을 괴롭히나요?',
      '어떤 죄책감을 갖고 있나요?',
      '실제 위험과 상상의 두려움을 구분할 수 있나요?'
    ],
    affirmations: {
      upright: '나는 내 고통을 인정하고, 도움을 요청합니다.',
      reversed: '나는 과거를 용서하고, 새로운 희망을 품습니다.'
    },
    advice: {
      upright: '혼자 고민하지 말고 도움을 요청하세요. 대부분은 상상입니다.',
      reversed: '이제 회복할 때입니다. 자신을 용서하세요.'
    },
    love: {
      upright: '관계에 대한 불안이나 죄책감.',
      reversed: '관계 불안 해소와 새로운 시작.'
    },
    career: {
      upright: '직업적 스트레스나 실패에 대한 두려움.',
      reversed: '직업적 불안 극복과 자신감 회복.'
    },
    health: {
      upright: '정신 건강 문제나 불면증.',
      reversed: '정신적 회복과 치유의 시작.'
    },
    spirituality: {
      upright: '영적 절망이나 어둠의 밤.',
      reversed: '영적 치유와 새로운 깨달음.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-10',
    number: 10,
    name: 'Ten of Swords',
    nameKorean: '소드 10',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['배신', '종료', '바닥', '희생', '극단적 고통', '한계', '파멸'],
      reversed: ['회복', '재생', '새로운 시작', '극복', '교훈', '회복력', '일어섬']
    },
    meaningShort: {
      upright: '극한의 고통과 상황의 완전한 종료',
      reversed: '바닥에서 일어나 새로운 시작'
    },
    meaningDetailed: {
      upright: '소드 10은 극한의 고통과 완전한 패배를 상징합니다. 배신당하고 더 이상 내려갈 곳이 없는 바닥 상태입니다. 하지만 이것이 끝이 아니라 새로운 시작의 전제 조건이기도 합니다.',
      reversed: '바닥에서 일어나 회복하기 시작하는 상태를 나타냅니다. 극한의 고통에서 교훈을 얻고, 놀라운 회복력으로 새로운 시작을 준비합니다.'
    },
    symbolism: [
      '열 개의 소드: 완전한 파괴',
      '엎드린 인물: 극한의 고통',
      '빨간 하늘: 고통과 종료',
      '검은 구름: 절망',
      '노란 하늘: 새벽과 희망',
      '멀리 있는 산: 새로운 시작'
    ],
    imageUrl: '/images/tarot/Swords10.jpg',
    imageDescription: '열 개의 소드에 찔려 엎드려진 인물과 새벽 하늘.',
    relatedCards: ['major-13-death', 'swords-03', 'major-16-tower'],
    questions: [
      '무엇이 완전히 끝났나요?',
      '이 경험에서 무엇을 배웠나요?',
      '새로운 시작을 위해 무엇을 해야 하나요?'
    ],
    affirmations: {
      upright: '나는 이 고통이 끝의 시작임을 압니다.',
      reversed: '나는 바닥에서 일어나 더 강해집니다.'
    },
    advice: {
      upright: '지금이 바닥입니다. 더 이상 내려갈 곳은 없습니다.',
      reversed: '이제 일어날 때입니다. 교훈을 가지고 새로 시작하세요.'
    },
    love: {
      upright: '관계의 완전한 종료나 극심한 배신.',
      reversed: '관계 상처에서 회복하고 새로운 사랑 준비.'
    },
    career: {
      upright: '직업적 파멸이나 완전한 실패.',
      reversed: '실패에서 배우고 새로운 기회 모색.'
    },
    health: {
      upright: '건강의 극한 상태나 위기.',
      reversed: '위기에서 회복하고 건강 되찾기.'
    },
    spirituality: {
      upright: '영적 파괴나 신앙의 완전한 상실.',
      reversed: '영적 재생과 새로운 믿음 발견.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-page',
    number: 11,
    name: 'Page of Swords',
    nameKorean: '소드 시종',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['호기심', '정보 수집', '감시', '새로운 아이디어', '의사소통', '민첩함', '학습'],
      reversed: ['가십', '나쁜 소식', '사기', '무모함', '계획 부족', '산만함']
    },
    meaningShort: {
      upright: '호기심 많은 정보 수집과 새로운 학습',
      reversed: '잘못된 정보나 산만한 의사소통'
    },
    meaningDetailed: {
      upright: '소드 시종은 호기심과 새로운 학습을 상징합니다. 정보를 수집하고 새로운 아이디어를 탐구하며, 민첩한 사고로 상황을 파악합니다. 소통과 학습에 대한 열정이 넘칩니다.',
      reversed: '정보의 오용이나 가십으로 인한 문제를 나타냅니다. 무모한 계획이나 산만한 의사소통으로 인해 문제가 생기거나, 나쁜 소식이 전해질 수 있습니다.'
    },
    symbolism: [
      '들어올린 소드: 경계와 준비',
      '바람에 나는 머리카락: 민첩한 사고',
      '언덕: 높은 전망',
      '구름과 새: 아이디어의 흐름',
      '젊은 모습: 새로운 시작',
      '동적인 자세: 활발한 에너지'
    ],
    imageUrl: '/images/tarot/Swords11.jpg',
    imageDescription: '언덕 위에서 소드를 들고 경계하는 젊은 시종.',
    relatedCards: ['swords-ace', 'major-00-fool', 'swords-knight'],
    questions: [
      '어떤 새로운 정보를 찾고 있나요?',
      '무엇을 배우고 싶나요?',
      '어떤 메시지를 전하려고 하나요?'
    ],
    affirmations: {
      upright: '나는 호기심을 가지고 학습하며, 효과적으로 소통합니다.',
      reversed: '나는 신중하게 정보를 검증하고, 건설적으로 소통합니다.'
    },
    advice: {
      upright: '호기심을 유지하고 새로운 것을 배우세요. 적극적으로 소통하세요.',
      reversed: '정보의 진위를 확인하고 신중하게 소통하세요.'
    },
    love: {
      upright: '관계에서의 새로운 발견이나 솔직한 대화.',
      reversed: '관계에서의 가십이나 오해.'
    },
    career: {
      upright: '새로운 아이디어나 정보 관련 업무.',
      reversed: '직장에서의 루머나 잘못된 정보.'
    },
    health: {
      upright: '건강 정보 탐구나 새로운 치료법 학습.',
      reversed: '잘못된 건강 정보나 과도한 걱정.'
    },
    spirituality: {
      upright: '새로운 영적 지식이나 가르침 탐구.',
      reversed: '잘못된 영적 정보나 산만한 수행.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-knight',
    number: 12,
    name: 'Knight of Swords',
    nameKorean: '소드 기사',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['행동', '충동', '용감함', '빠른 변화', '도전', '직접적', '결단력'],
      reversed: ['무모함', '성급함', '공격성', '계획 부족', '파괴적', '통제 불능']
    },
    meaningShort: {
      upright: '빠르고 직접적인 행동과 용기',
      reversed: '무모하고 파괴적인 행동'
    },
    meaningDetailed: {
      upright: '소드 기사는 빠르고 직접적인 행동을 상징합니다. 목표를 향해 용감하게 돌진하며, 신속한 결정과 변화를 가져옵니다. 도전을 두려워하지 않고 적극적으로 나아갑니다.',
      reversed: '무모하고 파괴적인 행동을 나타냅니다. 계획 없이 성급하게 행동하여 자신과 타인에게 해를 끼치거나, 공격적인 태도로 인해 갈등을 만들 수 있습니다.'
    },
    symbolism: [
      '질주하는 말: 빠른 행동',
      '휘날리는 깃털: 바람과 속도',
      '구름과 새: 변화하는 상황',
      '갑옷: 보호와 전투 준비',
      '들어올린 소드: 공격적 자세',
      '앞으로 기울어진 자세: 추진력'
    ],
    imageUrl: '/images/tarot/Swords12.jpg',
    imageDescription: '구름 속을 질주하며 소드를 든 용감한 기사.',
    relatedCards: ['swords-page', 'major-07-chariot', 'wands-knight'],
    questions: [
      '어떤 것에 급하게 돌진하고 있나요?',
      '계획이 충분한가요?',
      '이 속도가 적절한가요?'
    ],
    affirmations: {
      upright: '나는 용기를 가지고 빠르게 행동하되, 현명하게 판단합니다.',
      reversed: '나는 속도를 조절하고, 계획적으로 행동합니다.'
    },
    advice: {
      upright: '용기 있게 행동하되 방향을 잃지 마세요.',
      reversed: '속도를 늦추고 계획을 세운 후 행동하세요.'
    },
    love: {
      upright: '열정적인 구애나 관계의 빠른 진전.',
      reversed: '성급한 관계나 공격적인 태도.'
    },
    career: {
      upright: '빠른 승진이나 적극적인 프로젝트 추진.',
      reversed: '무모한 비즈니스 결정이나 직장 갈등.'
    },
    health: {
      upright: '빠른 회복이나 적극적인 치료.',
      reversed: '과도한 운동이나 스트레스로 인한 부상.'
    },
    spirituality: {
      upright: '빠른 영적 성장이나 적극적 수행.',
      reversed: '극단적인 영성이나 균형 상실.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-queen',
    number: 13,
    name: 'Queen of Swords',
    nameKorean: '소드 여왕',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['독립성', '명확한 사고', '직접적', '정직', '지적', '객관적', '정의'],
      reversed: ['냉정함', '복수심', '잔인함', '편향', '감정 억압', '고립']
    },
    meaningShort: {
      upright: '명확한 판단력과 독립적인 지적 여성',
      reversed: '냉정하고 복수심에 찬 태도'
    },
    meaningDetailed: {
      upright: '소드 여왕은 명확한 사고와 독립성을 상징합니다. 감정에 휘둘리지 않고 객관적으로 판단하며, 직접적이고 정직한 의사소통을 합니다. 지적이고 정의로운 리더십을 발휘합니다.',
      reversed: '지나치게 냉정하거나 복수심에 차있는 상태를 나타냅니다. 감정을 억압하여 잔인해지거나, 편향된 판단으로 인해 고립될 수 있습니다.'
    },
    symbolism: [
      '높은 왕좌: 권위와 관점',
      '들어올린 소드: 정의와 진실',
      '펼쳐진 손: 개방성',
      '구름: 지적 영역',
      '새: 높은 사고',
      '푸른 하늘: 명료한 정신'
    ],
    imageUrl: '/images/tarot/Swords13.jpg',
    imageDescription: '구름 위 왕좌에서 소드를 든 채 똑바로 앉아있는 지적인 여왕.',
    relatedCards: ['major-11-justice', 'swords-king', 'major-02-priestess'],
    questions: [
      '객관적으로 보면 상황이 어떤가요?',
      '감정과 이성의 균형은 어떤가요?',
      '진실을 말할 용기가 있나요?'
    ],
    affirmations: {
      upright: '나는 명확하게 사고하고, 정직하게 소통합니다.',
      reversed: '나는 감정과 이성의 균형을 찾고, 연민을 실천합니다.'
    },
    advice: {
      upright: '객관적으로 판단하고 직접적으로 소통하세요.',
      reversed: '너무 냉정하지 말고 감정도 고려하세요.'
    },
    love: {
      upright: '솔직하고 독립적인 관계. 지적 교감.',
      reversed: '감정적 냉담이나 복수심 있는 관계.'
    },
    career: {
      upright: '리더십이나 법률, 상담 관련 업무 성공.',
      reversed: '직장에서의 냉정함이나 갈등.'
    },
    health: {
      upright: '명확한 건강 계획과 객관적 판단.',
      reversed: '감정 억압으로 인한 건강 문제.'
    },
    spirituality: {
      upright: '지적 영성과 객관적 깨달음.',
      reversed: '영적 냉정함이나 교조주의.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'swords-king',
    number: 14,
    name: 'King of Swords',
    nameKorean: '소드 왕',
    arcana: 'minor',
    suit: 'swords',
    element: 'Air',
    keywords: {
      upright: ['권위', '지적 능력', '진실', '정의', '리더십', '엄격함', '공정함'],
      reversed: ['독재', '잔인함', '편향', '권력 남용', '냉혹함', '불의']
    },
    meaningShort: {
      upright: '지적 권위와 공정한 판단력',
      reversed: '권력 남용과 독재적 태도'
    },
    meaningDetailed: {
      upright: '소드 왕은 지적 권위와 공정한 판단력을 상징합니다. 진실과 정의를 추구하며, 엄격하지만 공정한 리더십을 발휘합니다. 논리적 사고와 명확한 의사결정으로 존경받습니다.',
      reversed: '권력을 남용하거나 독재적인 태도를 나타냅니다. 지나치게 냉혹하거나 편향된 판단으로 불의를 저지르며, 잔인한 방식으로 권위를 행사할 수 있습니다.'
    },
    symbolism: [
      '엄격한 표정: 권위와 엄정함',
      '소드와 홀: 정의와 권력',
      '나비 장식: 변화와 영혼',
      '구름: 지적 영역',
      '푸른 왕좌: 차가운 이성',
      '직선적 구도: 명확함과 엄격함'
    ],
    imageUrl: '/images/tarot/Swords14.jpg',
    imageDescription: '구름 위 왕좌에서 소드와 홀을 든 위엄 있는 왕.',
    relatedCards: ['swords-queen', 'major-04-emperor', 'major-11-justice'],
    questions: [
      '어떻게 공정하게 판단할 수 있나요?',
      '권위를 올바르게 사용하고 있나요?',
      '진실을 추구하고 있나요?'
    ],
    affirmations: {
      upright: '나는 지혜롭게 판단하고, 공정하게 이끕니다.',
      reversed: '나는 권력을 겸손하게 사용하고, 연민을 잃지 않습니다.'
    },
    advice: {
      upright: '공정하고 논리적으로 판단하여 정의를 실현하세요.',
      reversed: '권위를 남용하지 말고 인간적 온정도 보이세요.'
    },
    love: {
      upright: '성숙하고 공정한 관계. 지적 존중.',
      reversed: '관계에서의 지배나 냉정한 태도.'
    },
    career: {
      upright: '법률, 경영, 학계에서의 성공적 리더십.',
      reversed: '권력 남용이나 독재적 경영.'
    },
    health: {
      upright: '건강에 대한 체계적이고 논리적 접근.',
      reversed: '스트레스나 권위주의로 인한 건강 문제.'
    },
    spirituality: {
      upright: '지적 영성과 진리 추구.',
      reversed: '영적 독재나 교조주의.'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];