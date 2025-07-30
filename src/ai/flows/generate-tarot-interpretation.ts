
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
import { ensureModelHasProviderPrefix } from '@/lib/ensure-model-prefix';


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
  const ai = await getAI();
  
  const flow = ai.defineFlow(
    {
      name: 'generateTarotInterpretationFlow',
      inputSchema: GenerateTarotInterpretationInputSchema,
      outputSchema: GenerateTarotInterpretationOutputSchema,
    },
    async (flowInput: GenerateTarotInterpretationInput) => {
    
    try {
      // 🔍 타로 지침 가져오기
      let guidelineInstructions = '';
      if (flowInput.spreadId && flowInput.styleId) {
        try {
          const guidelineResult = await getGuidelineBySpreadAndStyle(flowInput.spreadId, flowInput.styleId);
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
            console.log('[TAROT] No specific guideline found for', flowInput.spreadId, flowInput.styleId);
          }
        } catch (guidelineError) {
          console.warn('[TAROT] Failed to load guideline:', guidelineError);
        }
      }
      
      // 🔄 ROBUST FALLBACK SYSTEM - No assumptions, only verified providers
      let model: string;
      let promptTemplate: string;
      let safetySettings: any[];
      let finalProviderInfo: any;
      
      try {
        console.log('[TAROT] 🔍 Starting robust provider detection...');
        
        // Step 1: Get available active providers from Firestore
        const activeModels = await getActiveAIModels();
        console.log('[TAROT] ✅ Available active models:', activeModels);
        
        if (activeModels.length === 0) {
          throw new Error('No active AI models configured. Please configure at least one AI provider in admin settings.');
        }
        
        // Step 2: Try to get configured prompt settings
        let config;
        try {
          config = await getTarotPromptConfig();
          console.log('[TAROT] 📋 Got prompt config with model:', config.model);
        } catch (configError) {
          console.log('[TAROT] ⚠️ No prompt config found, using first available model');
          config = {
            model: activeModels[0].id, // Use first available active model
            promptTemplate: '',
            safetySettings: []
          };
        }
        
        // Step 3: Validate if configured model is actually available
        const configuredModelAvailable = activeModels.find(m => 
          m.id === config.model || 
          ensureModelHasProviderPrefix(config.model) === m.id
        );
        
        if (configuredModelAvailable) {
          // Use configured model
          model = ensureModelHasProviderPrefix(config.model);
          finalProviderInfo = { 
            provider: configuredModelAvailable.provider, 
            model: config.model,
            fallbackInfo: { fallbackUsed: false }
          };
          console.log('[TAROT] ✅ Using configured model:', model);
        } else {
          // Use first available model as fallback
          const fallbackModel = activeModels[0];
          model = fallbackModel.id;
          finalProviderInfo = { 
            provider: fallbackModel.provider, 
            model: fallbackModel.id,
            fallbackInfo: { fallbackUsed: true, reason: 'Configured model not available' }
          };
          console.log('[TAROT] 🔄 Using fallback model:', model, 'because configured model not available');
        }
        
        // Step 4: Set prompt template and safety settings
        promptTemplate = config.promptTemplate || `당신은 전문적인 타로 카드 해석사입니다. 
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
        
        safetySettings = config.safetySettings || [];
        
      } catch (error) {
        console.error('[TAROT] 🚨 CRITICAL: All provider detection failed:', error);
        throw new Error(`AI provider configuration error: ${error.message}. Please configure AI providers in admin settings.`);
      }
      
      // Pass the model ID for getProviderConfig (model already contains correct format)
      const providerConfig = getProviderConfig(model);
      
      // Configure prompt based on provider capabilities
      // IMPORTANT: Genkit expects the full model ID with provider prefix
      const modelForPrompt = model;
      
      console.log('[TAROT] 🚀 Final configuration:');
      console.log('[TAROT] Model for prompt:', modelForPrompt);
      console.log('[TAROT] Provider info:', finalProviderInfo);
      console.log('[TAROT] Is fallback:', finalProviderInfo.fallbackInfo?.fallbackUsed || false);
      console.log('[TAROT] Provider config:', providerConfig);
      
      const promptConfig: any = {
        name: 'generateTarotInterpretationRuntimePrompt', 
        input: { schema: GenerateTarotInterpretationInputSchema }, 
        prompt: promptTemplate, 
        model: modelForPrompt,
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

      const tarotPrompt = await ai.definePrompt(promptConfig);

      console.log('[TAROT] Calling AI with input:', {
        questionLength: flowInput.question.length,
        cardSpread: flowInput.cardSpread,
        cardsCount: flowInput.cardInterpretations.split('\n').length,
        isGuestUser: flowInput.isGuestUser
      });

      const llmResponse = await tarotPrompt(flowInput); 
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
      } else if (e.message && (e.message.includes("Model 'gpt-3.5-turbo' not found") || 
                                e.message.includes("Model ") && e.message.includes(" not found"))) {
        // Specific handling for model not found errors
        console.error('[TAROT] ❌ Model not found error:', e.message);
        userMessage = `🤖 AI 모델을 찾을 수 없습니다. 관리자 페이지에서 AI 제공업체 설정을 확인하거나, 다른 AI 모델을 활성화해주세요. 현재 사용 가능한 모델이 없거나 API 키가 잘못 설정되었을 수 있습니다.`;
      } else if (e.message && e.message.includes("AI provider configuration error")) {
        // Configuration errors
        userMessage = `⚙️ ${e.message}`;
      } else if (e.message && e.message.includes("No active AI models configured")) {
        // No models configured
        userMessage = `🚫 활성화된 AI 모델이 없습니다. 관리자 페이지에서 적어도 하나의 AI 제공업체를 설정하고 활성화해주세요.`;
      } else {
        userMessage = `🤖 AI 해석 생성 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}. 잠시 후 다시 시도해주세요.`;
      }
      return { interpretation: userMessage };
    }
    }
  );
  
  // Execute the flow with the input
  return flow(input);
}
