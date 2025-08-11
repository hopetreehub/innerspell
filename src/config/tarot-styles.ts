/**
 * 타로 해석 스타일 설정
 * UI와 AI 프롬프트 간의 매핑
 */

export const TAROT_STYLE_MAPPINGS = {
  // 기존 스타일 ID -> 새로운 차별화된 스타일 ID
  'traditional': 'traditional-rws',
  'intuitive': 'spiritual-growth',
  'psychological': 'psychological-jungian',
  'practical': 'practical-action',
  'shadow-work': 'shadow-work',
  'realistic': 'realistic-insight',
  
  // 한글명 매핑
  '전통적': 'traditional-rws',
  '직관적': 'spiritual-growth',
  '심리학적': 'psychological-jungian',
  '실용적': 'practical-action',
  '그림자 작업': 'shadow-work',
  '현실적': 'realistic-insight'
};

// UI에 표시할 스타일 정보
export const TAROT_STYLE_INFO = [
  {
    id: 'traditional-rws',
    name: '전통적 해석',
    description: '웨이트 전통의 정통 타로 해석'
  },
  {
    id: 'spiritual-growth',
    name: '영적 성장',
    description: '내면의 성장과 영적 깨달음 중심'
  },
  {
    id: 'psychological-jungian',
    name: '심리학적 분석',
    description: '융의 분석심리학 기반 깊이 있는 해석'
  },
  {
    id: 'practical-action',
    name: '실용적 조언',
    description: '구체적이고 실행 가능한 행동 지침'
  },
  {
    id: 'shadow-work',
    name: '그림자 작업',
    description: '억압된 무의식과의 대면과 통합'
  },
  {
    id: 'realistic-insight',
    name: '현실적 통찰',
    description: '직설적이고 객관적인 상황 분석'
  }
];

/**
 * 기존 스타일 ID를 새로운 차별화된 스타일 ID로 변환
 */
export function mapToNewStyleId(oldStyleId: string): string {
  return TAROT_STYLE_MAPPINGS[oldStyleId] || 'traditional-rws';
}