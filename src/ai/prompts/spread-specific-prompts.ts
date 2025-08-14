/**
 * Spread-specific prompt templates to ensure proper interpretation for each spread type
 */

export const SPREAD_SPECIFIC_PROMPTS = {
  // 1장 스프레드 - 한 장의 불꽃
  'single-spark': `
[스프레드 특성]
이것은 한 장의 불꽃(Single Spark) 리딩입니다. 
단일 카드가 제공하는 즉각적이고 명확한 통찰에 집중하세요.

[해석 규칙]
- 정확히 1장의 카드만 해석하세요
- 다른 카드나 "나머지 카드"를 절대 언급하지 마세요
- "트리니티 뷰" 등 다른 스프레드를 언급하지 마세요
- 단일 카드의 깊이 있는 의미에 집중하세요
- 질문에 대한 직접적이고 핵심적인 답변을 제공하세요

[해석 구조]
1. 카드의 즉각적 메시지
2. 현재 상황과의 연결
3. 실천 가능한 조언
4. 핵심 키워드 (3-5개)
`,

  // 3장 스프레드 - 삼위일체 조망
  'trinity-view': `
[스프레드 특성]
이것은 삼위일체 조망(Trinity View) 리딩입니다.
3장의 카드가 과거-현재-미래의 흐름을 보여줍니다.

[해석 규칙]
- 정확히 3장의 카드를 해석하세요
- 각 카드를 과거/현재/미래 위치에 맞게 해석하세요
- 3장의 카드가 만드는 완전한 이야기를 구성하세요
- "카드가 부족하다" 같은 표현을 절대 사용하지 마세요
- 다른 스프레드나 추가 카드를 언급하지 마세요

[해석 구조]
1. 전체적인 흐름 (3장이 그리는 이야기)
2. 과거 - 첫 번째 카드의 메시지
3. 현재 - 두 번째 카드의 메시지
4. 미래 - 세 번째 카드의 메시지
5. 카드 간의 연결성
6. 종합적인 조언
`,

  // 5장 스프레드 - 오각별 통찰
  'pentagram-insight': `
[스프레드 특성]
이것은 오각별 통찰(Pentagram Insight) 리딩입니다.
5장의 카드가 상황의 다양한 측면을 보여줍니다.

[해석 규칙]
- 정확히 5장의 카드를 해석하세요
- 각 위치의 의미를 명확히 구분하세요
- 5장의 카드가 만드는 완전한 그림을 제시하세요
- 모든 카드를 균형 있게 다루세요

[위치별 의미]
1. 상황의 핵심
2. 내적 영향
3. 외적 영향
4. 극복할 과제
5. 잠재적 결과

[해석 구조]
1. 전체 상황 개요
2. 각 위치별 카드 해석
3. 카드들의 상호작용
4. 통합적 조언
5. 행동 계획
`,

  // 7장 스프레드 - 일곱 별의 길
  'seven-stars-path': `
[스프레드 특성]
이것은 일곱 별의 길(Seven Stars Path) 리딩입니다.
7장의 카드가 심층적인 분석을 제공합니다.

[해석 규칙]
- 정확히 7장의 카드를 해석하세요
- 각 위치의 고유한 의미를 살리세요
- 7장이 만드는 완전한 여정을 그려내세요

[위치별 의미]
1. 현재 상황
2. 즉각적 과거
3. 가까운 미래
4. 핵심 문제
5. 주변 환경
6. 희망과 두려움
7. 최종 결과

[해석 구조]
1. 전체 여정의 개요
2. 각 별(카드)의 메시지
3. 패턴과 연결고리
4. 심층 통찰
5. 변화를 위한 지침
`,

  // 9장 스프레드 - 아홉 영역의 여정
  'nine-realms-journey': `
[스프레드 특성]
이것은 아홉 영역의 여정(Nine Realms Journey) 리딩입니다.
9장의 카드가 포괄적인 이해를 제공합니다.

[해석 규칙]
- 정확히 9장의 카드를 해석하세요
- 9개 영역을 균형 있게 다루세요
- 과거-현재-미래의 3x3 매트릭스로 이해하세요

[해석 구조]
1. 아홉 영역의 전체 지도
2. 과거의 차원 (카드 1-3)
3. 현재의 차원 (카드 4-6)
4. 미래의 차원 (카드 7-9)
5. 수직/수평 연결성
6. 통합적 시각
7. 영적 성장의 길
`,

  // 10장 스프레드 - 켈틱 크로스
  'celtic-cross-wisdom': `
[스프레드 특성]
이것은 켈틱 크로스 지혜(Celtic Cross Wisdom) 리딩입니다.
10장의 카드가 가장 포괄적이고 전통적인 해석을 제공합니다.

[해석 규칙]
- 정확히 10장의 카드를 해석하세요
- 전통적인 켈틱 크로스 위치를 준수하세요
- 10장이 만드는 완전한 십자가를 구성하세요

[위치별 의미]
1. 현재 상황
2. 도전 과제 (십자가)
3. 과거의 기반
4. 가까운 미래
5. 의식적 목표
6. 무의식적 영향
7. 자기 자신
8. 외부 영향
9. 희망과 두려움
10. 최종 결과

[해석 구조]
1. 전체 상황 개요
2. 중심축 해석 (1-2번)
3. 시간축 해석 (3-4번)
4. 의식/무의식 축 (5-6번)
5. 내부/외부 축 (7-8번)
6. 최종 전망 (9-10번)
7. 십자가의 통합적 지혜
8. 변화의 열쇠
`,

  // 기본값
  'default': `
[해석 규칙]
- 제공된 카드 수에 정확히 맞게 해석하세요
- 다른 카드나 부족한 카드를 언급하지 마세요
- 주어진 카드만으로 완전한 해석을 제공하세요
- 스프레드 이름이나 다른 리딩 방식을 언급하지 마세요
`
};

/**
 * Get spread-specific prompt based on spread ID
 */
export function getSpreadSpecificPrompt(spreadId: string): string {
  return SPREAD_SPECIFIC_PROMPTS[spreadId as keyof typeof SPREAD_SPECIFIC_PROMPTS] || SPREAD_SPECIFIC_PROMPTS.default;
}

/**
 * Enhance the prompt with spread-specific instructions
 */
export function enhancePromptWithSpreadInfo(
  basePrompt: string,
  spreadId: string,
  numCards: number
): string {
  console.log(`[SPREAD-PROMPT] Enhancing prompt for spread: ${spreadId}, cards: ${numCards}`);
  
  // 스프레드별 전용 프롬프트가 있으면 기본 프롬프트를 완전히 대체
  const spreadSpecificPrompt = SPREAD_SPECIFIC_PROMPTS[spreadId as keyof typeof SPREAD_SPECIFIC_PROMPTS];
  
  if (spreadSpecificPrompt && spreadId !== 'default') {
    // 스프레드별 전용 프롬프트로 완전히 대체
    const fullPrompt = `당신은 전문적인 타로 카드 해석사입니다.

${spreadSpecificPrompt}

질문: {{question}}
카드 스프레드: {{cardSpread}}
뽑힌 카드들: {{cardInterpretations}}

위의 스프레드 특성과 해석 규칙을 반드시 준수하여 해석을 제공하세요.
반드시 한국어로 작성하고, 따뜻하고 희망적인 톤을 유지하세요.`;
    
    console.log(`[SPREAD-PROMPT] Using spread-specific prompt for: ${spreadId}`);
    return fullPrompt;
  }
  
  // 스프레드 ID가 없지만 카드 수로 추론 가능한 경우
  const inferredSpreadId = inferSpreadIdFromCardCount(numCards);
  if (inferredSpreadId && SPREAD_SPECIFIC_PROMPTS[inferredSpreadId as keyof typeof SPREAD_SPECIFIC_PROMPTS]) {
    console.log(`[SPREAD-PROMPT] Inferred spread type: ${inferredSpreadId} from ${numCards} cards`);
    return enhancePromptWithSpreadInfo(basePrompt, inferredSpreadId, numCards);
  }
  
  // 기본 프롬프트에 일반적인 지침 추가
  const enhancedPrompt = `
[중요한 스프레드 지침]
${getSpreadSpecificPrompt('default')}
선택된 카드 수: ${numCards}장
[스프레드 지침 끝]

${basePrompt}
`;

  console.log(`[SPREAD-PROMPT] Using enhanced base prompt for unknown spread`);
  return enhancedPrompt;
}

/**
 * 카드 수로부터 스프레드 타입을 추론합니다.
 */
function inferSpreadIdFromCardCount(numCards: number): string | null {
  switch (numCards) {
    case 1:
      return 'single-spark';
    case 3:
      return 'trinity-view';
    case 5:
      return 'pentagram-insight';
    case 7:
      return 'seven-stars-path';
    case 9:
      return 'nine-realms-journey';
    case 10:
      return 'celtic-cross-wisdom';
    default:
      return null;
  }
}