'use server';

import { z } from 'zod';
import { getTarotPromptConfig } from '@/ai/services/prompt-service';
import { getProviderWithFallback } from '@/ai/services/ai-provider-fallback';

const GenerateTarotInterpretationInputSchema = z.object({
  question: z.string(),
  cardSpread: z.string(),
  cardInterpretations: z.string(),
  isGuestUser: z.boolean().optional(),
  spreadId: z.string().optional(),
  styleId: z.string().optional(),
});
export type GenerateTarotInterpretationInput = z.infer<typeof GenerateTarotInterpretationInputSchema>;

const GenerateTarotInterpretationOutputSchema = z.object({
  interpretation: z.string(),
});
export type GenerateTarotInterpretationOutput = z.infer<typeof GenerateTarotInterpretationOutputSchema>;

export async function generateTarotInterpretation(input: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> {
  console.log('[TAROT] Starting interpretation generation...');
  
  try {
    // Simple mock response for now to ensure the function works
    const mockInterpretation = `## AI 타로 해석

**질문:** ${input.question}

**선택하신 카드들:**
${input.cardInterpretations}

### 카드 해석

당신이 선택한 카드들은 현재 상황에 대한 깊은 통찰을 보여줍니다. 

${input.cardSpread === '3카드 (과거-현재-미래)' ? `
**과거**: 첫 번째 카드는 지나간 경험과 교훈을 나타냅니다.
**현재**: 두 번째 카드는 현재의 상황과 도전 과제를 보여줍니다.
**미래**: 세 번째 카드는 앞으로의 가능성과 잠재력을 암시합니다.
` : `
선택하신 ${input.cardSpread} 스프레드는 당신의 질문에 대한 다각도의 관점을 제공합니다.
`}

### 조언

카드가 전하는 메시지를 통해 내면의 지혜를 발견하고, 앞으로 나아갈 방향을 찾아가세요.

💫 _타로는 미래를 예언하는 것이 아니라, 현재의 에너지와 가능성을 보여주는 거울입니다._`;
    
    console.log('[TAROT] Returning mock interpretation');
    return { interpretation: mockInterpretation };
    
  } catch (error) {
    console.error('[TAROT] Error in generateTarotInterpretation:', error);
    return { 
      interpretation: '해석 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    };
  }
}