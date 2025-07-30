
'use server';

/**
 * @fileOverview Generates an AI-powered interpretation of a tarot card spread based on a user's question.
 *
 * - generateTarotInterpretation - A function that handles the tarot card interpretation process.
 * - GenerateTarotInterpretationInput - The input type for the generateTarotInterpretation function.
 * - GenerateTarotInterpretationOutput - The return type for the generateTarotInterpretation function.
 */

import {getAI} from '@/ai/genkit';
import {z} from 'genkit';
import { getTarotPromptConfig } from '@/ai/services/prompt-service';
import { getProviderConfig } from '@/lib/ai-utils';
import { getProviderWithFallback } from '@/ai/services/ai-provider-fallback';
import { getAllTarotGuidelines, getGuidelineBySpreadAndStyle } from '@/actions/tarotGuidelineActions';


const GenerateTarotInterpretationInputSchema = z.object({
  question: z.string().describe('The user provided question for the tarot reading, potentially including an interpretation style cue like "(해석 스타일: 스타일 이름)".'),
  cardSpread: z.string().describe('The selected tarot card spread (e.g., 1-card, 3-card, custom). Also includes card position names if defined for the spread.'),
  cardInterpretations: z.string().describe('The interpretation of each card in the spread, including its name, orientation (upright/reversed), and potentially its position in the spread. This is a single string containing all card details.'),
  isGuestUser: z.boolean().optional().describe('Whether the user is a guest (not logged in). If true, provide a shorter, teaser interpretation.'),
  spreadId: z.string().optional().describe('The ID of the tarot spread being used for guideline lookup.'),
  styleId: z.string().optional().describe('The ID of the interpretation style being used for guideline lookup.'),
});
export type GenerateTarotInterpretationInput = z.infer<typeof GenerateTarotInterpretationInputSchema>;

const GenerateTarotInterpretationOutputSchema = z.object({
  interpretation: z.string().describe('The AI-powered interpretation of the tarot card spread.'),
});
export type GenerateTarotInterpretationOutput = z.infer<typeof GenerateTarotInterpretationOutputSchema>;


export async function generateTarotInterpretation(input: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> {
  return generateTarotInterpretationFlow(input);
}

const generateTarotInterpretationFlow = async (flowInput: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> => {
  const ai = await getAI();
  
  return ai.defineFlow(
    {
      name: 'generateTarotInterpretationFlow',
      inputSchema: GenerateTarotInterpretationInputSchema,
      outputSchema: GenerateTarotInterpretationOutputSchema,
    },
    async (input: GenerateTarotInterpretationInput) => {
    
    try {
      // 🔍 타로 지침 가져오기
      let guidelineInstructions = '';
      if (input.spreadId && input.styleId) {
        try {
          const guidelineResult = await getGuidelineBySpreadAndStyle(input.spreadId, input.styleId);
          if (guidelineResult.success && guidelineResult.data) {
            const guideline = guidelineResult.data;
            
            // 지침을 프롬프트에 통합할 형태로 변환
            guidelineInstructions = `
# 전문 타로 지침 (${guideline.name})

## 전반적 접근법
${guideline.generalApproach}

## 핵심 포커스 영역
${guideline.keyFocusAreas.map(area => `- ${area}`).join('\n')}

## 포지션별 상세 지침
${guideline.positionGuidelines.map(pos => `
**${pos.positionName}**: ${pos.interpretationFocus}
핵심 질문들: ${pos.keyQuestions.join(', ')}
${pos.styleSpecificNotes ? `특이사항: ${pos.styleSpecificNotes}` : ''}
`).join('\n')}

## 해석 팁
${guideline.interpretationTips.map(tip => `- ${tip}`).join('\n')}

## 피해야 할 실수들
${guideline.commonPitfalls.map(pitfall => `- ${pitfall}`).join('\n')}

예상 소요 시간: ${guideline.estimatedTime}분 | 난이도: ${guideline.difficulty}
`;
            
            console.log('[TAROT] Using tarot guideline:', guideline.name);
          } else {
            console.log('[TAROT] No specific guideline found for', input.spreadId, input.styleId);
          }
        } catch (guidelineError) {
          console.warn('[TAROT] Failed to load guideline:', guidelineError);
        }
      }
      
      // Try to get the best available provider with automatic fallback
      let providerInfo;
      let model: string;
      let promptTemplate: string;
      let safetySettings: any[];
      
      try {
        // First try to get configured provider
        const config = await getTarotPromptConfig();
        // Fix model format - remove provider prefix for Genkit
        const modelParts = config.model.split('/');
        const cleanModelId = modelParts.length > 1 ? modelParts[1] : config.model;
        
        // Map provider names correctly
        let providerName = modelParts[0] || 'openai';
        if (providerName === 'gemini') {
          providerName = 'googleai';
        }
        
        // Fix model names that don't exist
        if (cleanModelId === 'gemini-1.5-pro') {
          console.log('[TAROT] Mapping gemini-1.5-pro to gemini-1.5-flash');
          model = 'gemini-1.5-flash';
        } else {
          model = cleanModelId;
        }
        
        providerInfo = { provider: providerName, model: model };
        promptTemplate = config.promptTemplate;
        safetySettings = config.safetySettings;
      } catch (error) {
        console.log('[TAROT] Primary config failed, using fallback system:', error);
        
        try {
          // Use fallback system if primary config fails
          const fallbackInfo = await getProviderWithFallback();
          providerInfo = fallbackInfo;
          model = fallbackInfo.model; // Don't add provider prefix
        } catch (fallbackError) {
          console.log('[TAROT] Fallback system also failed, using mock response:', fallbackError);
          // Ultimate fallback: Return a mock response when no API is available
          const mockInterpretation = `## AI 타로 해석 (데모 모드)

현재 AI 서비스가 일시적으로 사용할 수 없습니다. 

**선택하신 카드들:**
${input.cardInterpretations}

**질문:** ${input.question}

이 카드들은 당신의 상황에 대한 깊은 통찰을 제공합니다. 정식 AI 해석을 받으시려면 관리자에게 AI API 설정을 요청해주세요.

💫 타로는 내면의 지혜를 일깨우는 도구입니다. 카드가 보여주는 메시지를 통해 자신만의 답을 찾아가세요.`;
          
          return { interpretation: mockInterpretation };
        }
        
        // Use enhanced prompt template with guideline integration
        promptTemplate = `당신은 전문적인 타로 카드 해석사입니다. 
${guidelineInstructions ? '다음 전문 지침을 따라 해석해주세요:\n\n' + guidelineInstructions + '\n\n위 지침을 바탕으로, ' : ''}사용자의 질문과 뽑힌 카드들을 바탕으로 깊이 있고 의미 있는 해석을 제공해주세요.

질문: {{question}}
카드 스프레드: {{cardSpread}}
뽑힌 카드들: {{cardInterpretations}}

다음 형식으로 해석해주세요:
## 서론
질문에 대한 공감과 전체적인 흐름 소개

## 본론  
각 카드의 의미와 위치별 해석${guidelineInstructions ? ' (위의 포지션별 지침을 참고하여)' : ''}

## 실행 가능한 조언과 격려
구체적이고 실용적인 조언${guidelineInstructions ? ' (위의 해석 팁을 활용하여)' : ''}

## 결론
희망적이고 긍정적인 마무리`;
        safetySettings = [];
        
        if (fallbackInfo.fallbackInfo.fallbackUsed) {
          console.log('[TAROT] Using fallback provider due to primary failure');
        }
      }
      
      const providerConfig = getProviderConfig(model);
      
      // Configure prompt based on provider capabilities
      const promptConfig: any = {
        name: 'generateTarotInterpretationRuntimePrompt', 
        input: { schema: GenerateTarotInterpretationInputSchema }, 
        prompt: promptTemplate, 
        model: model,
      };
      
      // Add provider-specific configuration
      if (providerConfig.supportsSafetySettings && safetySettings.length > 0) {
        promptConfig.config = {
          safetySettings: safetySettings,
        };
      }
      
      // For OpenAI models, we might need to adjust the prompt format
      if (providerConfig.provider === 'openai') {
        // OpenAI models work better with system messages
        // But since definePrompt doesn't support system messages directly,
        // we'll keep the prompt as is
      }

      console.log('[TAROT] Creating prompt with model:', model);
      const tarotPrompt = await ai.definePrompt(promptConfig);

      console.log('[TAROT] Calling AI with input:', {
        questionLength: input.question.length,
        cardSpread: input.cardSpread,
        cardsCount: input.cardInterpretations.split('\n').length,
        isGuestUser: input.isGuestUser
      });

      const llmResponse = await tarotPrompt(input); 
      const interpretationText = llmResponse.text; 

      if (!interpretationText) {
        console.error('[TAROT] AI 해석 생성 실패: 생성된 텍스트가 없습니다. 응답:', llmResponse);
        return { interpretation: 'AI 해석을 생성하는 데 문제가 발생했습니다. 생성된 내용이 없습니다.' };
      }

      console.log('[TAROT] AI interpretation generated successfully, length:', interpretationText.length);
      return { interpretation: interpretationText };

    } catch (e: any) {
      console.error('[TAROT] AI 프롬프트 실행 중 오류 발생:', e);
      console.error('[TAROT] Error details:', {
        name: e.name,
        message: e.message,
        stack: e.stack,
        fullError: JSON.stringify(e, null, 2)
      });
      
      let userMessage = 'AI 해석 생성 중 일반 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      const errorMessage = e.toString();

      // Check for missing API key error
      if (errorMessage.includes('API key not found') || errorMessage.includes('Missing API key') || 
          errorMessage.includes('No AI provider plugins available') || e.message?.includes('No AI providers')) {
        userMessage = 'AI API 키가 설정되지 않았습니다. 관리자 페이지에서 AI 제공업체 설정을 확인해주세요.';
      } else if (errorMessage.includes('429')) {
        userMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나, 관리자에게 문의하여 주세요.';
      } else if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
        userMessage = 'AI 모델에 대한 요청이 많아 현재 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      } else if ((e as any).finishReason && (e as any).finishReason !== 'STOP') {
         userMessage = `AI 생성이 완료되지 못했습니다 (이유: ${(e as any).finishReason}). 콘텐츠 안전 문제 또는 다른 제약 때문일 수 있습니다. 프롬프트를 조정하거나 안전 설정을 확인해보세요.`;
      } else if (errorMessage.includes("SAFETY")) {
         userMessage = "생성된 콘텐츠가 안전 기준에 부합하지 않아 차단되었습니다. 질문이나 해석 요청 내용을 수정해 보세요.";
      } else if (errorMessage.includes("no valid candidates")) {
         userMessage = "AI가 현재 요청에 대해 적절한 답변을 찾지 못했습니다. 질문을 조금 다르게 해보거나, 나중에 다시 시도해주세요. (No Valid Candidates)";
      } else {
        userMessage = `AI 해석 오류: ${e.message || '알 수 없는 오류'}.`;
      }
      return { interpretation: userMessage };
    }
    }
  )(flowInput);
};
