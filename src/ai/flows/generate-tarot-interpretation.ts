'use server';

import { z } from 'zod';
import { getTarotPromptConfig, getEnhancedTarotPromptConfig } from '@/ai/services/prompt-service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTarotGuidelineBySpreadAndStyle } from '@/actions/tarotGuidelineActions';
import type { PositionGuideline } from '@/types/tarot-guidelines';

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

// Default prompt template
const DEFAULT_PROMPT = `당신은 전문적인 타로 카드 해석사입니다. 
사용자의 질문과 뽑힌 카드들을 바탕으로 깊이 있고 의미 있는 해석을 제공해주세요.

질문: {{question}}
카드 스프레드: {{cardSpread}}
뽑힌 카드들: {{cardInterpretations}}

다음 형식으로 해석해주세요:
## 서론
질문에 대한 공감과 전체적인 흐름 소개

## 본론  
각 카드의 의미와 위치별 해석

## 실행 가능한 조언
구체적이고 실용적인 조언

## 결론
희망적이고 긍정적인 마무리`;

// Mock interpretation for fallback
function getMockInterpretation(input: GenerateTarotInterpretationInput): string {
  return `## AI 타로 해석

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
}

// Try Google AI (Gemini) first
async function tryGoogleAI(input: GenerateTarotInterpretationInput, prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('[TAROT] No Google AI API key found');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get spread and style guidelines if available
    let enhancedPrompt = prompt;
    console.log('[TAROT] Checking for guidelines:', { spreadId: input.spreadId, styleId: input.styleId });
    
    if (input.spreadId && input.styleId) {
      console.log('[TAROT] Fetching guidelines for:', input.spreadId, input.styleId);
      const guidelineResult = await getTarotGuidelineBySpreadAndStyle(input.spreadId, input.styleId);
      console.log('[TAROT] Guideline result:', guidelineResult);
      
      if (guidelineResult.success && guidelineResult.data) {
        const guideline = guidelineResult.data;
        console.log('[TAROT] Found guideline:', guideline.name);
        
        // Create structured guideline information
        const spreadGuideline = {
          name: guideline.spreadName,
          generalApproach: guideline.generalApproach,
          positions: guideline.positions.map((pos: PositionGuideline) => `
- ${pos.positionName}: ${pos.interpretationFocus}
  핵심 질문: ${pos.keyQuestions.join(', ')}`).join('\n'),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        const styleGuideline = {
          name: guideline.styleName,
          description: guideline.styleDescription || '',
          keyFocusAreas: guideline.keyFocusAreas.join(', '),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        // Add guidelines to prompt
        enhancedPrompt = prompt + `

[스프레드별 해석 지침]
스프레드 이름: ${spreadGuideline.name}
일반적 접근: ${spreadGuideline.generalApproach}

각 위치별 해석 포커스:
${spreadGuideline.positions}

해석 팁: ${spreadGuideline.interpretationTips}
[스프레드별 해석 지침 끝]

[해석 스타일 지침]
스타일 이름: ${styleGuideline.name}
설명: ${styleGuideline.description}
핵심 초점: ${styleGuideline.keyFocusAreas}
해석 팁: ${styleGuideline.interpretationTips}
[해석 스타일 지침 끝]`;
      }
    }

    // Replace template variables with proper escaping
    let finalPrompt = enhancedPrompt
      .replace(/\{\{\{question\}\}\}/g, input.question || '')
      .replace(/\{\{\{cardSpread\}\}\}/g, input.cardSpread || '')
      .replace(/\{\{\{cardInterpretations\}\}\}/g, input.cardInterpretations || '');
    
    // Handle conditional blocks
    if (input.isGuestUser) {
      finalPrompt = finalPrompt.replace(/\{\{#if isGuestUser\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    } else {
      finalPrompt = finalPrompt.replace(/\{\{#if isGuestUser\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, '$2');
    }
    
    // Remove any remaining handlebars syntax
    finalPrompt = finalPrompt.replace(/\{\{[^}]*\}\}/g, '');

    console.log('[TAROT] Calling Google AI with enhanced prompt...');
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      console.log('[TAROT] Google AI response received, length:', text.length);
      return text;
    }
    return null;
  } catch (error) {
    console.error('[TAROT] Google AI error:', error);
    return null;
  }
}

// Try OpenAI
async function tryOpenAI(input: GenerateTarotInterpretationInput, prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('[TAROT] No OpenAI API key found');
      return null;
    }

    // Get spread and style guidelines if available
    let enhancedPrompt = prompt;
    console.log('[TAROT] OpenAI - Checking for guidelines:', { spreadId: input.spreadId, styleId: input.styleId });
    
    if (input.spreadId && input.styleId) {
      console.log('[TAROT] OpenAI - Fetching guidelines for:', input.spreadId, input.styleId);
      const guidelineResult = await getTarotGuidelineBySpreadAndStyle(input.spreadId, input.styleId);
      console.log('[TAROT] OpenAI - Guideline result:', guidelineResult);
      
      if (guidelineResult.success && guidelineResult.data) {
        const guideline = guidelineResult.data;
        console.log('[TAROT] OpenAI - Found guideline:', guideline.name);
        
        // Create structured guideline information
        const spreadGuideline = {
          name: guideline.spreadName,
          generalApproach: guideline.generalApproach,
          positions: guideline.positions.map((pos: PositionGuideline) => `
- ${pos.positionName}: ${pos.interpretationFocus}
  핵심 질문: ${pos.keyQuestions.join(', ')}`).join('\n'),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        const styleGuideline = {
          name: guideline.styleName,
          description: guideline.styleDescription || '',
          keyFocusAreas: guideline.keyFocusAreas.join(', '),
          interpretationTips: guideline.interpretationTips.join(' ')
        };
        
        // Add guidelines to prompt
        enhancedPrompt = prompt + `

[스프레드별 해석 지침]
스프레드 이름: ${spreadGuideline.name}
일반적 접근: ${spreadGuideline.generalApproach}

각 위치별 해석 포커스:
${spreadGuideline.positions}

해석 팁: ${spreadGuideline.interpretationTips}
[스프레드별 해석 지침 끝]

[해석 스타일 지침]
스타일 이름: ${styleGuideline.name}
설명: ${styleGuideline.description}
핵심 초점: ${styleGuideline.keyFocusAreas}
해석 팁: ${styleGuideline.interpretationTips}
[해석 스타일 지침 끝]`;
      }
    }

    // Replace template variables with proper escaping
    let finalPrompt = enhancedPrompt
      .replace(/\{\{\{question\}\}\}/g, input.question || '')
      .replace(/\{\{\{cardSpread\}\}\}/g, input.cardSpread || '')
      .replace(/\{\{\{cardInterpretations\}\}\}/g, input.cardInterpretations || '');
    
    // Handle conditional blocks
    if (input.isGuestUser) {
      finalPrompt = finalPrompt.replace(/\{\{#if isGuestUser\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    } else {
      finalPrompt = finalPrompt.replace(/\{\{#if isGuestUser\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, '$2');
    }
    
    // Remove any remaining handlebars syntax
    finalPrompt = finalPrompt.replace(/\{\{[^}]*\}\}/g, '');

    console.log('[TAROT] Calling OpenAI with enhanced prompt...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      console.error('[TAROT] OpenAI API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (text) {
      console.log('[TAROT] OpenAI response received, length:', text.length);
      return text;
    }
    return null;
  } catch (error) {
    console.error('[TAROT] OpenAI error:', error);
    return null;
  }
}

export async function generateTarotInterpretation(input: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> {
  console.log('[TAROT] Starting interpretation generation V2...', {
    question: input.question,
    cardSpread: input.cardSpread,
    spreadId: input.spreadId,
    styleId: input.styleId,
    isGuestUser: input.isGuestUser
  });
  
  try {
    // Try to get configured prompt template
    let promptTemplate = DEFAULT_PROMPT;
    try {
      const config = await getTarotPromptConfig();
      if (config.promptTemplate) {
        promptTemplate = config.promptTemplate;
        console.log('[TAROT] Using custom prompt template');
      }
    } catch (error) {
      console.log('[TAROT] Using default prompt template');
    }

    // Try AI providers in order
    let interpretation: string | null = null;

    // 1. Try Google AI first
    interpretation = await tryGoogleAI(input, promptTemplate);

    // 2. If Google fails, try OpenAI
    if (!interpretation) {
      interpretation = await tryOpenAI(input, promptTemplate);
    }

    // 3. If all fail, use mock
    if (!interpretation) {
      console.log('[TAROT] All AI providers failed, using mock interpretation');
      interpretation = getMockInterpretation(input);
    }

    console.log('[TAROT] Returning interpretation, length:', interpretation.length);
    return { interpretation };
    
  } catch (error) {
    console.error('[TAROT] Unexpected error in generateTarotInterpretation:', error);
    return { 
      interpretation: getMockInterpretation(input)
    };
  }
}