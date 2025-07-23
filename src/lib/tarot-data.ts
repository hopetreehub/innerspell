
import type { TarotCard } from '@/types';

// 참고: 전체 78장의 카드 데이터와 한국어 번역이 필요합니다.
// 아래는 예시이며, 이미지 경로는 public/images/tarot/ 폴더에 맞게 설정해야 합니다.
export const tarotDeck: TarotCard[] = [
  // Major Arcana
  {
    id: 'major-0',
    name: 'The Fool (광대)',
    suit: 'major',
    number: 0,
    imageSrc: '/images/tarot/00-TheFool.jpg',
    dataAiHint: 'fool 광대',
    keywordsUpright: ['시작', '순수', '자발성', '자유로운 영혼', '믿음', '독창성'],
    keywordsReversed: ['순진함', '어리석음', '무모함', '위험 감수', '주저함', '우둔함'],
    meaningUpright: '새로운 시작, 순수함, 모험심을 상징합니다. 미지의 세계로 나아가는 여정의 첫걸음입니다.',
    meaningReversed: '무모함, 경솔함, 어리석은 선택을 의미할 수 있습니다. 현실을 직시해야 합니다.',
    description: '광대는 경험을 찾아 나서는 영혼입니다. 그는 우리 내면의 이성을 초월한 신비로운 영리함, 세상의 내적 작용에 동조하는 어린아이 같은 능력을 나타냅니다.',
    fortuneTelling: ['새로운 모험이 눈앞에 있습니다.', '열린 마음으로 미지의 세계를 받아들이세요.'],
    questionsToAsk: ['나는 어떤 새로운 여정을 시작하고 있는가?', '나는 믿음의 도약을 할 준비가 되었는가?'],
    astrology: '천왕성',
    affirmation: '나는 열린 마음과 정신으로 새로운 시작을 받아들인다.',
    element: '공기'
  },
  {
    id: 'major-1',
    name: 'The Magician (마법사)',
    suit: 'major',
    number: 1,
    imageSrc: '/images/tarot/01-TheMagician.jpg',
    dataAiHint: 'magician 마법사',
    keywordsUpright: ['현현', '수완', '힘', '영감받은 행동', '기술', '집중'],
    keywordsReversed: ['조작', '부실한 계획', '미개발된 재능', '기만', '환상'],
    meaningUpright: '창의력, 의지력, 기술을 통해 원하는 것을 현실로 만드는 능력을 나타냅니다.',
    meaningReversed: '재능을 낭비하거나, 속임수, 조작에 주의해야 함을 의미합니다.',
    description: '마법사는 현현의 달인이며, 의지력과 아이디어를 현실로 바꾸는 능력의 상징입니다. 그는 우리에게 자신만의 세계를 창조할 힘이 있음을 상기시킵니다.',
    fortuneTelling: ['당신은 원하는 것을 현실로 만들 힘이 있습니다.', '숙련된 사람이 당신의 삶에 나타날 것입니다.'],
    questionsToAsk: ['나는 무엇을 현현시키려 하는가?', '목표 달성을 위해 어떤 기술을 활용해야 하는가?'],
    astrology: '수성',
    affirmation: '나는 나의 욕망을 현현시키고 원하는 현실을 창조할 힘이 있다.',
    element: '공기'
  },
  {
    id: 'major-2',
    name: 'The High Priestess (여사제)',
    suit: 'major',
    number: 2,
    imageSrc: '/images/tarot/02-TheHighPriestess.jpg',
    dataAiHint: 'priestess 여사제',
    keywordsUpright: ['직관', '무의식', '신비', '비밀', '지혜', '내면의 목소리'],
    keywordsReversed: ['억압된 직관', '비밀 유지', '표면적 지식', '혼란', '침묵'],
    meaningUpright: '직관, 비밀, 내면의 지혜를 상징합니다. 숨겨진 진실을 탐구해야 할 때입니다.',
    meaningReversed: '직관을 무시하거나, 비밀이 드러날 수 있음을 암시합니다.',
    description: '여사제는 베일 뒤에 숨겨진 지혜의 수호자입니다. 그녀는 직관의 힘과 잠재의식의 깊이를 나타냅니다.',
    fortuneTelling: ['당신의 직관을 믿으세요, 그것이 당신을 진실로 인도할 것입니다.', '숨겨진 정보가 곧 드러날 수 있습니다.'],
    questionsToAsk: ['나의 직관이 무엇을 말하고 있는가?', '내가 무시하고 있는 내면의 목소리는 무엇인가?'],
    astrology: '달',
    affirmation: '나는 나의 직관을 신뢰하고 내면의 지혜에 귀 기울인다.',
    element: '물'
  },
  {
    id: 'major-3',
    name: 'The Empress (여황제)',
    suit: 'major',
    number: 3,
    imageSrc: '/images/tarot/03-TheEmpress.jpg',
    dataAiHint: 'empress 여황제',
    keywordsUpright: ['풍요', '모성애', '아름다움', '자연', '창조성', '관능'],
    keywordsReversed: ['창조적 막힘', '의존', '나태함', '불균형'],
    meaningUpright: '풍요, 모성, 창조성, 아름다움을 상징합니다. 관능적이고 풍요로운 시기입니다.',
    meaningReversed: '창의력 저하, 과잉보호, 물질에 대한 집착을 의미할 수 있습니다.',
    element: '흙'
  },
  {
    id: 'major-4',
    name: 'The Emperor (황제)',
    suit: 'major',
    number: 4,
    imageSrc: '/images/tarot/04-TheEmperor.jpg',
    dataAiHint: 'emperor 황제',
    keywordsUpright: ['권위', '구조', '통제', '아버지상', '리더십', '안정'],
    keywordsReversed: ['독재', '경직됨', '통제력 상실', '무책임'],
    meaningUpright: '권위, 질서, 안정, 리더십을 나타냅니다. 확고한 기반을 다질 때입니다.',
    meaningReversed: '권위 남용, 경직된 사고, 통제력 상실을 의미할 수 있습니다.',
    element: '불'
  },
  {
    id: 'major-5',
    name: 'The Hierophant (교황)',
    suit: 'major',
    number: 5,
    imageSrc: '/images/tarot/05-TheHierophant.jpg',
    dataAiHint: 'hierophant 교황',
    keywordsUpright: ['전통', '관습', '신념 체계', '교육', '멘토링', '영적 지도'],
    keywordsReversed: ['인습 타파', '제한', '도전적인 전통', '자유로운 사고'],
    meaningUpright: '전통, 교육, 영적 지혜, 관습을 상징합니다. 기존의 가르침을 따르거나 배울 때입니다.',
    meaningReversed: '전통에 얽매이거나, 독선적인 태도를 경계해야 함을 의미합니다.',
    element: '흙'
  },
  {
    id: 'major-6',
    name: 'The Lovers (연인)',
    suit: 'major',
    number: 6,
    imageSrc: '/images/tarot/06-TheLovers.jpg',
    dataAiHint: 'lovers 연인',
    keywordsUpright: ['사랑', '조화', '관계', '선택', '가치관 정립', '결합'],
    keywordsReversed: ['불화', '잘못된 선택', '관계의 어려움', '가치관 충돌'],
    meaningUpright: '사랑, 관계, 조화, 중요한 선택을 의미합니다. 가치관에 따른 결정을 내려야 합니다.',
    meaningReversed: '관계의 갈등, 잘못된 선택, 내부적 불균형을 나타낼 수 있습니다.',
    element: '공기'
  },
  {
    id: 'major-7',
    name: 'The Chariot (전차)',
    suit: 'major',
    number: 7,
    imageSrc: '/images/tarot/07-TheChariot.jpg',
    dataAiHint: 'chariot 전차',
    keywordsUpright: ['의지력', '승리', '결단력', '자기 통제', '진취성', '성공'],
    keywordsReversed: ['방향성 상실', '자기 통제 부족', '장애물', '공격성'],
    meaningUpright: '강한 의지력, 결단력, 성공적인 전진을 상징합니다. 목표를 향해 나아가세요.',
    meaningReversed: '통제력 상실, 방향성 부재, 무모한 돌진을 경계해야 합니다.',
    element: '물'
  },
  {
    id: 'major-8',
    name: 'Strength (힘)',
    suit: 'major',
    number: 8,
    imageSrc: '/images/tarot/08-Strength.jpg',
    dataAiHint: 'strength 힘',
    keywordsUpright: ['용기', '인내', '연민', '내면의 힘', '영향력', '자기 확신'],
    keywordsReversed: ['나약함', '자기 의심', '두려움', '억압된 본능'],
    meaningUpright: '내면의 힘, 용기, 인내, 연민을 나타냅니다. 부드러움이 강함을 이깁니다.',
    meaningReversed: '자신감 부족, 두려움, 내면의 약점을 극복해야 함을 의미합니다.',
    element: '불'
  },
  {
    id: 'major-9',
    name: 'The Hermit (은둔자)',
    suit: 'major',
    number: 9,
    imageSrc: '/images/tarot/09-TheHermit.jpg',
    dataAiHint: 'hermit 은둔자',
    keywordsUpright: ['자기 성찰', '내면 탐구', '지혜', '안내', '고독', '명상'],
    keywordsReversed: ['고립', '외로움', '사회성 부족', '회피'],
    meaningUpright: '내면 성찰, 지혜 탐구, 고독을 통한 깨달음을 상징합니다. 내면의 목소리에 귀 기울이세요.',
    meaningReversed: '지나친 고립, 외로움, 사회와의 단절을 의미할 수 있습니다.',
    element: '흙'
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune (운명의 수레바퀴)',
    suit: 'major',
    number: 10,
    imageSrc: '/images/tarot/10-WheelOfFortune.jpg',
    dataAiHint: 'wheel fortune',
    keywordsUpright: ['운명', '전환점', '변화', '행운', '주기', '기회'],
    keywordsReversed: ['불운', '통제 불능', '저항', '정체'],
    meaningUpright: '운명의 전환점, 변화, 행운, 삶의 순환을 나타냅니다. 새로운 기회가 다가옵니다.',
    meaningReversed: '예상치 못한 불운, 변화에 대한 저항, 상황 통제 불가를 의미합니다.',
    element: '불'
  },
  {
    id: 'major-11',
    name: 'Justice (정의)',
    suit: 'major',
    number: 11,
    imageSrc: '/images/tarot/11-Justice.jpg',
    dataAiHint: 'justice 정의',
    keywordsUpright: ['정의', '공정함', '진실', '법', '균형', '책임'],
    keywordsReversed: ['불공정', '편견', '부정직', '책임 회피'],
    meaningUpright: '공정함, 정의, 진실, 균형, 인과응보를 상징합니다. 행동의 결과를 책임져야 합니다.',
    meaningReversed: '불공평, 편견, 법적 문제, 책임 회피를 의미할 수 있습니다.',
    element: '공기'
  },
  {
    id: 'major-12',
    name: 'The Hanged Man (매달린 남자)',
    suit: 'major',
    number: 12,
    imageSrc: '/images/tarot/12-TheHangedMan.jpg',
    dataAiHint: 'hanged man',
    keywordsUpright: ['희생', '내려놓음', '새로운 관점', '정지', '인내', '지혜'],
    keywordsReversed: ['정체', '저항', '무의미한 희생', '막다른 골목'],
    meaningUpright: '희생, 관점의 전환, 정체, 새로운 깨달음을 얻기 위한 기다림을 나타냅니다.',
    meaningReversed: '불필요한 희생, 정체, 상황을 바꾸려는 노력의 부재를 의미합니다.',
    element: '물'
  },
  {
    id: 'major-13',
    name: 'Death (죽음)',
    suit: 'major',
    number: 13,
    imageSrc: '/images/tarot/13-Death.jpg',
    dataAiHint: 'death 죽음',
    keywordsUpright: ['끝', '변화', '변형', '전환', '놓아줌', '새로운 시작'],
    keywordsReversed: ['변화에 대한 저항', '정체', '두려움', '과거에 얽매임'],
    meaningUpright: '끝과 새로운 시작, 피할 수 없는 변화, 변형을 상징합니다. 과거를 놓아주세요.',
    meaningReversed: '변화에 대한 두려움, 과거에 대한 집착, 정체를 의미합니다.',
    element: '물'
  },
  {
    id: 'major-14',
    name: 'Temperance (절제)',
    suit: 'major',
    number: 14,
    imageSrc: '/images/tarot/14-Temperance.jpg',
    dataAiHint: 'temperance 절제',
    keywordsUpright: ['균형', '조화', '인내', '중용', '협력', '목적의식'],
    keywordsReversed: ['불균형', '극단', '갈등', '과잉', '조급함'],
    meaningUpright: '균형, 조화, 인내, 중용을 나타냅니다. 서로 다른 요소들을 통합하여 안정을 찾습니다.',
    meaningReversed: '불균형, 극단적인 행동, 조급함, 내부적 갈등을 의미합니다.',
    element: '불'
  },
  {
    id: 'major-15',
    name: 'The Devil (악마)',
    suit: 'major',
    number: 15,
    imageSrc: '/images/tarot/15-TheDevil.jpg',
    dataAiHint: 'devil 악마',
    keywordsUpright: ['속박', '중독', '부정적 패턴', '물질주의', '유혹', '그림자 자아'],
    keywordsReversed: ['자유', '해방', '인식', '자각', '속박에서 벗어남'],
    meaningUpright: '속박, 중독, 물질주의, 부정적인 생각이나 습관에 얽매임을 상징합니다.',
    meaningReversed: '속박으로부터의 해방, 부정적 패턴을 인식하고 끊어냄을 의미합니다.',
    element: '흙'
  },
  {
    id: 'major-16',
    name: 'The Tower (탑)',
    suit: 'major',
    number: 16,
    imageSrc: '/images/tarot/16-TheTower.jpg',
    dataAiHint: 'tower 탑',
    keywordsUpright: ['갑작스러운 변화', '파괴', '계시', '혼돈', '각성', '진실의 순간'],
    keywordsReversed: ['변화 회피', '재앙 방지', '두려움', '점진적 변화'],
    meaningUpright: '갑작스럽고 충격적인 변화, 기존 구조의 붕괴, 진실의 드러남을 상징합니다.',
    meaningReversed: '변화를 두려워하거나 피하려 함, 위기를 모면함을 의미할 수 있습니다.',
    element: '불'
  },
  {
    id: 'major-17',
    name: 'The Star (별)',
    suit: 'major',
    number: 17,
    imageSrc: '/images/tarot/17-TheStar.jpg',
    dataAiHint: 'star 별',
    keywordsUpright: ['희망', '믿음', '영감', '치유', '평온', '낙관주의'],
    keywordsReversed: ['절망', '믿음 부족', '실망', '비관주의'],
    meaningUpright: '희망, 영감, 치유, 긍정적인 미래에 대한 믿음을 상징합니다. 평화와 평온의 시기입니다.',
    meaningReversed: '희망을 잃거나, 부정적인 생각에 빠짐, 실망감을 느낄 수 있습니다.',
    element: '공기'
  },
  {
    id: 'major-18',
    name: 'The Moon (달)',
    suit: 'major',
    number: 18,
    imageSrc: '/images/tarot/18-TheMoon.jpg',
    dataAiHint: 'moon 달',
    keywordsUpright: ['환상', '두려움', '불안', '무의식', '직관', '속임수'],
    keywordsReversed: ['두려움 해소', '명확성', '진실 발견', '혼란 극복'],
    meaningUpright: '환상, 불안, 무의식의 세계, 숨겨진 두려움을 나타냅니다. 상황이 명확하지 않을 수 있습니다.',
    meaningReversed: '혼란이 걷히고 진실이 드러나며, 두려움을 극복함을 의미합니다.',
    element: '물'
  },
  {
    id: 'major-19',
    name: 'The Sun (태양)',
    suit: 'major',
    number: 19,
    imageSrc: '/images/tarot/19-TheSun.jpg',
    dataAiHint: 'sun 태양',
    keywordsUpright: ['기쁨', '성공', '활력', '긍정', '명확성', '성취'],
    keywordsReversed: ['일시적 우울', '에너지 부족', '지연된 성공', '비관'],
    meaningUpright: '기쁨, 성공, 활력, 긍정적인 에너지, 명확성을 상징합니다. 모든 것이 밝고 좋습니다.',
    meaningReversed: '일시적인 어려움이나 즐거움의 부족, 성공이 지연될 수 있음을 의미합니다.',
    element: '불'
  },
  {
    id: 'major-20',
    name: 'Judgement (심판)',
    suit: 'major',
    number: 20,
    imageSrc: '/images/tarot/20-Judgement.jpg',
    dataAiHint: 'judgement 심판',
    keywordsUpright: ['심판', '부활', '내면의 부름', '용서', '결산', '새로운 시작'],
    keywordsReversed: ['자기 비판', '후회', '기회 놓침', '과거에 얽매임'],
    meaningUpright: '중요한 결정, 부활, 내면의 부름, 과거를 평가하고 새로운 단계로 나아감을 상징합니다.',
    meaningReversed: '자기 의심, 과거에 대한 후회, 중요한 결정을 내리지 못함을 의미합니다.',
    element: '물'
  },
  {
    id: 'major-21',
    name: 'The World (세계)',
    suit: 'major',
    number: 21,
    imageSrc: '/images/tarot/21-TheWorld.jpg',
    dataAiHint: 'world 세계',
    keywordsUpright: ['완성', '성취', '통합', '여행', '성공', '만족'],
    keywordsReversed: ['미완성', '정체', '목표 달성 실패', '제한된 시야'],
    meaningUpright: '완성, 성취, 통합, 만족스러운 결말, 새로운 시작을 위한 준비를 상징합니다.',
    meaningReversed: '미완성의 느낌, 목표 달성의 지연, 과정의 어려움을 의미할 수 있습니다.',
    element: '흙'
  },

  // Wands
  {
    id: 'wands-ace',
    name: 'Ace of Wands (완드 에이스)',
    suit: 'wands',
    number: 'ace',
    imageSrc: '/images/tarot/Wands01.jpg',
    dataAiHint: 'ace wands',
    keywordsUpright: ['영감', '새로운 기회', '성장', '잠재력', '창의성', '행동'],
    keywordsReversed: ['지연', '동기 부족', '망설임', '창의적 막힘', '잘못된 시작'],
    meaningUpright: '새로운 시작, 창의적 에너지, 열정, 영감을 상징합니다. 행동을 취할 때입니다.',
    meaningReversed: '기회가 지연되거나, 열정 부족, 창의력 고갈을 의미할 수 있습니다.',
    element: '불'
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const num = i + 2;
    return {
      id: `wands-${num}`,
      name: `${num} of Wands (완드 ${num})`,
      suit: 'wands' as const,
      number: num,
      imageSrc: `/images/tarot/Wands${num.toString().padStart(2, '0')}.jpg`,
      dataAiHint: `wands ${num}`,
      keywordsUpright: [`완드${num} 정방향 키워드1`, `완드${num} 정방향 키워드2`],
      keywordsReversed: [`완드${num} 역방향 키워드1`, `완드${num} 역방향 키워드2`],
      meaningUpright: `완드 ${num} 카드는 정방향에서 [의미]를 나타냅니다.`,
      meaningReversed: `완드 ${num} 카드는 역방향에서 [의미]를 나타냅니다.`,
      element: '불' as const
    };
  }),
  {
    id: 'wands-page',
    name: 'Page of Wands (완드 시종)',
    suit: 'wands',
    number: 'page',
    imageSrc: '/images/tarot/Wands11.jpg',
    dataAiHint: 'page wands',
    keywordsUpright: ['열정적인 탐험가', '자유로운 영혼', '새로운 아이디어', '영감', '뉴스'],
    keywordsReversed: ['미성숙', '충동성', '나쁜 소식', '창의력 부족'],
    meaningUpright: '새로운 기회, 영감, 창의적 아이디어, 열정적인 시작을 의미합니다.',
    meaningReversed: '미성숙함, 충동적인 행동, 좋지 않은 소식을 암시할 수 있습니다.',
    element: '불'
  },
  {
    id: 'wands-knight',
    name: 'Knight of Wands (완드 기사)',
    suit: 'wands',
    number: 'knight',
    imageSrc: '/images/tarot/Wands12.jpg',
    dataAiHint: 'knight wands',
    keywordsUpright: ['에너지', '열정', '행동', '모험', '충동', '빠른 움직임'],
    keywordsReversed: ['조급함', '무모함', '지연', '좌절'],
    meaningUpright: '에너지 넘치는 행동, 열정, 모험심, 빠른 변화를 상징합니다.',
    meaningReversed: '성급함, 무모한 도전, 예상치 못한 지연을 의미할 수 있습니다.',
    element: '불'
  },
  {
    id: 'wands-queen',
    name: 'Queen of Wands (완드 여왕)',
    suit: 'wands',
    number: 'queen',
    imageSrc: '/images/tarot/Wands13.jpg',
    dataAiHint: 'queen wands',
    keywordsUpright: ['용기', '자신감', '독립심', '열정', '결단력', '매력'],
    keywordsReversed: ['요구성', '질투', '자기중심적', '변덕스러움'],
    meaningUpright: '자신감, 열정, 독립심, 창의적인 에너지를 가진 매력적인 인물을 나타냅니다.',
    meaningReversed: '자기중심적이거나, 질투심이 강하고, 변덕스러운 모습을 보일 수 있습니다.',
    element: '불'
  },
  {
    id: 'wands-king',
    name: 'King of Wands (완드 왕)',
    suit: 'wands',
    number: 'king',
    imageSrc: '/images/tarot/Wands14.jpg',
    dataAiHint: 'king wands',
    keywordsUpright: ['비전', '리더십', '영감', '대담함', '기업가 정신', '명예'],
    keywordsReversed: ['독재적', '무자비함', '높은 기대치', '성급함'],
    meaningUpright: '비전을 가진 리더, 영감을 주는 인물, 대담하고 창의적인 추진력을 상징합니다.',
    meaningReversed: '권위적이거나, 성급하고, 타인에게 지나치게 높은 기준을 요구할 수 있습니다.',
    element: '불'
  },

  // Cups
  {
    id: 'cups-ace',
    name: 'Ace of Cups (컵 에이스)',
    suit: 'cups',
    number: 'ace',
    imageSrc: '/images/tarot/Cups01.jpg',
    dataAiHint: 'ace cups',
    keywordsUpright: ['사랑', '새로운 관계', '연민', '창의성', '감정적 시작', '기쁨'],
    keywordsReversed: ['감정적 상실', '막힌 창의성', '공허함', '억압된 감정'],
    meaningUpright: '새로운 감정의 시작, 사랑, 기쁨, 창의성을 상징합니다.',
    meaningReversed: '감정적인 공허함, 사랑의 어려움, 창의력 부족을 의미할 수 있습니다.',
    element: '물'
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const num = i + 2;
    return {
      id: `cups-${num}`,
      name: `${num} of Cups (컵 ${num})`,
      suit: 'cups' as const,
      number: num,
      imageSrc: `/images/tarot/Cups${num.toString().padStart(2, '0')}.jpg`,
      dataAiHint: `cups ${num}`,
      keywordsUpright: [`컵${num} 정방향 키워드1`, `컵${num} 정방향 키워드2`],
      keywordsReversed: [`컵${num} 역방향 키워드1`, `컵${num} 역방향 키워드2`],
      meaningUpright: `컵 ${num} 카드는 정방향에서 [의미]를 나타냅니다.`,
      meaningReversed: `컵 ${num} 카드는 역방향에서 [의미]를 나타냅니다.`,
      element: '물' as const
    };
  }),
  {
    id: 'cups-page',
    name: 'Page of Cups (컵 시종)',
    suit: 'cups',
    number: 'page',
    imageSrc: '/images/tarot/Cups11.jpg',
    dataAiHint: 'page cups',
    keywordsUpright: ['창의적인 메시지', '직관', '감수성', '몽상가', '새로운 감정'],
    keywordsReversed: ['감정적 미성숙', '현실 도피', '창의력 막힘', '상상력 부족'],
    meaningUpright: '새로운 감정적 기회, 창의적 영감, 기분 좋은 소식을 의미합니다.',
    meaningReversed: '감정적으로 미숙하거나, 현실을 외면하려는 경향을 보일 수 있습니다.',
    element: '물'
  },
  {
    id: 'cups-knight',
    name: 'Knight of Cups (컵 기사)',
    suit: 'cups',
    number: 'knight',
    imageSrc: '/images/tarot/Cups12.jpg',
    dataAiHint: 'knight cups',
    keywordsUpright: ['로맨스', '매력', '상상력', '제안', '초대', '몽상'],
    keywordsReversed: ['비현실적', '기분파', '실망', '거짓된 매력'],
    meaningUpright: '로맨틱한 제안, 감성적인 접근, 예술적 영감을 상징합니다.',
    meaningReversed: '감정에 휘둘리거나, 비현실적인 기대, 실망스러운 제안을 의미할 수 있습니다.',
    element: '물'
  },
  {
    id: 'cups-queen',
    name: 'Queen of Cups (컵 여왕)',
    suit: 'cups',
    number: 'queen',
    imageSrc: '/images/tarot/Cups13.jpg',
    dataAiHint: 'queen cups',
    keywordsUpright: ['연민', '보살핌', '직관', '감정적 안정', '공감', '치유'],
    keywordsReversed: ['감정 과잉', '의존성', '경계 부족', '우울함'],
    meaningUpright: '따뜻한 마음, 공감 능력, 직관력, 감정적 지지를 주는 인물을 나타냅니다.',
    meaningReversed: '감정적으로 불안정하거나, 타인에게 지나치게 의존하는 모습을 보일 수 있습니다.',
    element: '물'
  },
  {
    id: 'cups-king',
    name: 'King of Cups (컵 왕)',
    suit: 'cups',
    number: 'king',
    imageSrc: '/images/tarot/Cups14.jpg',
    dataAiHint: 'king cups',
    keywordsUpright: ['감정적 균형', '연민', '외교', '관용', '지혜', '침착함'],
    keywordsReversed: ['감정 조작', '기분 변화', '냉담함', '회피'],
    meaningUpright: '감정적으로 성숙하고 균형 잡힌 리더, 타인에게 관대하고 이해심 깊은 인물을 상징합니다.',
    meaningReversed: '감정을 억누르거나, 타인을 감정적으로 조종하려는 경향을 보일 수 있습니다.',
    element: '물'
  },

  // Swords
  {
    id: 'swords-ace',
    name: 'Ace of Swords (검 에이스)',
    suit: 'swords',
    number: 'ace',
    imageSrc: '/images/tarot/Swords01.jpg',
    dataAiHint: 'ace swords',
    keywordsUpright: ['돌파구', '새로운 아이디어', '정신적 명료함', '진실', '성공', '집중'],
    keywordsReversed: ['혼란', '잘못된 정보', '명확성 부족', '정신적 막힘', '잘못된 결정'],
    meaningUpright: '새로운 아이디어, 명확한 사고, 진실, 정의, 지적인 돌파구를 상징합니다.',
    meaningReversed: '혼란, 잘못된 판단, 의사소통의 어려움을 의미할 수 있습니다.',
    element: '공기'
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const num = i + 2;
    return {
      id: `swords-${num}`,
      name: `${num} of Swords (검 ${num})`,
      suit: 'swords' as const,
      number: num,
      imageSrc: `/images/tarot/Swords${num.toString().padStart(2, '0')}.jpg`,
      dataAiHint: `swords ${num}`,
      keywordsUpright: [`검${num} 정방향 키워드1`, `검${num} 정방향 키워드2`],
      keywordsReversed: [`검${num} 역방향 키워드1`, `검${num} 역방향 키워드2`],
      meaningUpright: `검 ${num} 카드는 정방향에서 [의미]를 나타냅니다.`,
      meaningReversed: `검 ${num} 카드는 역방향에서 [의미]를 나타냅니다.`,
      element: '공기' as const
    };
  }),
  {
    id: 'swords-page',
    name: 'Page of Swords (검 시종)',
    suit: 'swords',
    number: 'page',
    imageSrc: '/images/tarot/Swords11.jpg',
    dataAiHint: 'page swords',
    keywordsUpright: ['호기심 많은', '에너지 넘치는', '진실 추구', '새로운 소식', '경계심'],
    keywordsReversed: ['가십', '방어적', '성급함', '부주의한 말'],
    meaningUpright: '새로운 정보, 호기심, 진실을 탐구하는 에너지를 의미합니다.',
    meaningReversed: '성급한 판단, 가십, 방어적인 태도를 경계해야 합니다.',
    element: '공기'
  },
  {
    id: 'swords-knight',
    name: 'Knight of Swords (검 기사)',
    suit: 'swords',
    number: 'knight',
    imageSrc: '/images/tarot/Swords12.jpg',
    dataAiHint: 'knight swords',
    keywordsUpright: ['야망 있는', '행동 지향적인', '빠른 사고', '결단력 있는', '직설적'],
    keywordsReversed: ['공격적', '충동적', '무모함', '판단 부족'],
    meaningUpright: '목표를 향해 빠르게 돌진하는 에너지, 결단력, 야망을 상징합니다.',
    meaningReversed: '충동적이고 공격적인 행동, 무모한 도전을 경계해야 합니다.',
    element: '공기'
  },
  {
    id: 'swords-queen',
    name: 'Queen of Swords (검 여왕)',
    suit: 'swords',
    number: 'queen',
    imageSrc: '/images/tarot/Swords13.jpg',
    dataAiHint: 'queen swords',
    keywordsUpright: ['독립적인', '지적인', '명료한', '정직한', '공정한', '경험 많은'],
    keywordsReversed: ['냉소적인', '비판적인', '고독한', '감정 표현 부족'],
    meaningUpright: '지적이고 독립적이며, 명확한 판단력을 가진 공정한 인물을 나타냅니다.',
    meaningReversed: '지나치게 비판적이거나, 감정적으로 차갑고, 고립된 모습을 보일 수 있습니다.',
    element: '공기'
  },
  {
    id: 'swords-king',
    name: 'King of Swords (검 왕)',
    suit: 'swords',
    number: 'king',
    imageSrc: '/images/tarot/Swords14.jpg',
    dataAiHint: 'king swords',
    keywordsUpright: ['지적인 권위', '진실', '정의', '분석적인', '윤리적인', '결단력 있는'],
    keywordsReversed: ['독단적인', '권위 남용', '냉담함', '가혹함'],
    meaningUpright: '지적 권위, 명확한 판단, 정의로운 리더십, 논리적인 사고를 상징합니다.',
    meaningReversed: '지나치게 엄격하거나, 독단적이고, 타인의 감정을 고려하지 않을 수 있습니다.',
    element: '공기'
  },

  // Pentacles
  {
    id: 'pentacles-ace',
    name: 'Ace of Pentacles (펜타클 에이스)',
    suit: 'pentacles',
    number: 'ace',
    imageSrc: '/images/tarot/Pentacles01.jpg',
    dataAiHint: 'ace pentacles',
    keywordsUpright: ['새로운 재정적 기회', '현현', '번영', '풍요', '안정', '새로운 사업'],
    keywordsReversed: ['잃어버린 기회', '계획 부족', '재정적 불안정', '놓친 기회', '잘못된 투자'],
    meaningUpright: '새로운 물질적 기회, 풍요, 안정, 현실적인 성취를 상징합니다.',
    meaningReversed: '재정적 어려움, 기회를 놓침, 불안정한 상황을 의미할 수 있습니다.',
    element: '흙'
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const num = i + 2;
    return {
      id: `pentacles-${num}`,
      name: `${num} of Pentacles (펜타클 ${num})`,
      suit: 'pentacles' as const,
      number: num,
      imageSrc: `/images/tarot/Pentacles${num.toString().padStart(2, '0')}.jpg`,
      dataAiHint: `pentacles ${num}`,
      keywordsUpright: [`펜타클${num} 정방향 키워드1`, `펜타클${num} 정방향 키워드2`],
      keywordsReversed: [`펜타클${num} 역방향 키워드1`, `펜타클${num} 역방향 키워드2`],
      meaningUpright: `펜타클 ${num} 카드는 정방향에서 [의미]를 나타냅니다.`,
      meaningReversed: `펜타클 ${num} 카드는 역방향에서 [의미]를 나타냅니다.`,
      element: '흙' as const
    };
  }),
  {
    id: 'pentacles-page',
    name: 'Page of Pentacles (펜타클 시종)',
    suit: 'pentacles',
    number: 'page',
    imageSrc: '/images/tarot/Pentacles11.jpg',
    dataAiHint: 'page pentacles',
    keywordsUpright: ['새로운 기술 학습', '야망', '실용성', '근면함', '기초 다지기'],
    keywordsReversed: ['나태함', '실패에 대한 두려움', '단기적 시각', '미루는 습관'],
    meaningUpright: '새로운 학습 기회, 실용적인 계획, 목표를 향한 꾸준한 노력을 의미합니다.',
    meaningReversed: '게으름, 목표 의식 부족, 현실적인 계획의 부재를 암시할 수 있습니다.',
    element: '흙'
  },
  {
    id: 'pentacles-knight',
    name: 'Knight of Pentacles (펜타클 기사)',
    suit: 'pentacles',
    number: 'knight',
    imageSrc: '/images/tarot/Pentacles12.jpg',
    dataAiHint: 'knight pentacles',
    keywordsUpright: ['책임감 있는', '신뢰할 수 있는', '근면한', '현실적인', '인내심 있는'],
    keywordsReversed: ['지루함', '완고함', '게으름', '변화 부족'],
    meaningUpright: '꾸준함, 책임감, 현실적인 목표 추구, 인내심을 상징합니다.',
    meaningReversed: '지루함, 정체, 변화를 꺼리는 완고함을 의미할 수 있습니다.',
    element: '흙'
  },
  {
    id: 'pentacles-queen',
    name: 'Queen of Pentacles (펜타클 여왕)',
    suit: 'pentacles',
    number: 'queen',
    imageSrc: '/images/tarot/Pentacles13.jpg',
    dataAiHint: 'queen pentacles',
    keywordsUpright: ['실용적인', '자상한', '안정적인', '풍요로운', '현실 감각 있는'],
    keywordsReversed: ['물질주의적인', '일 중독', '불안정한', '자기 관리 부족'],
    meaningUpright: '현실적이고 안정적이며, 주변을 잘 보살피는 풍요로운 인물을 나타냅니다.',
    meaningReversed: '지나치게 물질적이거나, 일에만 몰두하여 자신을 돌보지 못할 수 있습니다.',
    element: '흙'
  },
  {
    id: 'pentacles-king',
    name: 'King of Pentacles (펜타클 왕)',
    suit: 'pentacles',
    number: 'king',
    imageSrc: '/images/tarot/Pentacles14.jpg',
    dataAiHint: 'king pentacles',
    keywordsUpright: ['풍요', '안정', '성공', '사업가', '현실적인', '관대한'],
    keywordsReversed: ['탐욕스러운', '보수적인', '위험 회피', '완고함'],
    meaningUpright: '물질적 성공, 안정, 풍요, 현실적이고 신뢰할 수 있는 리더십을 상징합니다.',
    meaningReversed: '지나치게 보수적이거나, 탐욕스럽고, 변화를 두려워할 수 있습니다.',
    element: '흙'
  },
];

export const getCardById = (id: string): TarotCard | undefined => {
  return tarotDeck.find(card => card.id === id);
};

export const suits = ['major', 'wands', 'cups', 'swords', 'pentacles'];


export function getPreviousCard(currentCardId: string): TarotCard | undefined {
  const currentIndex = tarotDeck.findIndex(card => card.id === currentCardId);
  if (currentIndex > 0) {
    return tarotDeck[currentIndex - 1];
  }
  return undefined;
}

export function getNextCard(currentCardId: string): TarotCard | undefined {
  const currentIndex = tarotDeck.findIndex(card => card.id === currentCardId);
  if (currentIndex !== -1 && currentIndex < tarotDeck.length - 1) {
    return tarotDeck[currentIndex + 1];
  }
  return undefined;
}
