
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
import { getCachedInterpretation, setCachedInterpretation } from '@/ai/services/ai-cache-service';
import { retryAICall } from '@/ai/services/ai-retry-service';
import { 
  extractStyleFromQuestion, 
  extractSpreadType, 
  extractCardIds, 
  generateStyledPrompt 
} from '@/ai/services/tarot-style-service';


const GenerateTarotInterpretationInputSchema = z.object({
  question: z.string().describe('The user provided question for the tarot reading, potentially including an interpretation style cue like "(해석 스타일: 스타일 이름)".'),
  cardSpread: z.string().describe('The selected tarot card spread (e.g., 1-card, 3-card, custom). Also includes card position names if defined for the spread.'),
  cardInterpretations: z.string().describe('The interpretation of each card in the spread, including its name, orientation (upright/reversed), and potentially its position in the spread. This is a single string containing all card details.'),
  isGuestUser: z.boolean().optional().describe('Whether the user is a guest (not logged in). If true, provide a shorter, teaser interpretation.'),
});
export type GenerateTarotInterpretationInput = z.infer<typeof GenerateTarotInterpretationInputSchema>;

const GenerateTarotInterpretationOutputSchema = z.object({
  interpretation: z.string().describe('The AI-powered interpretation of the tarot card spread.'),
});
export type GenerateTarotInterpretationOutput = z.infer<typeof GenerateTarotInterpretationOutputSchema>;


export async function generateTarotInterpretation(input: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> {
  console.log('[TAROT] ========== GENERATE INTERPRETATION START ==========');
  console.log('[TAROT] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });
  
  return generateTarotInterpretationFlow(input);
}

const generateTarotInterpretationFlow = async (flowInput: GenerateTarotInterpretationInput): Promise<GenerateTarotInterpretationOutput> => {
  // Check cache first
  const cacheKey = {
    question: flowInput.question,
    cardSpread: flowInput.cardSpread,
    cardInterpretations: flowInput.cardInterpretations,
    isGuestUser: flowInput.isGuestUser || false,
  };
  
  const cachedInterpretation = getCachedInterpretation(cacheKey);
  if (cachedInterpretation) {
    console.log('[TAROT] Returning cached interpretation');
    return { interpretation: cachedInterpretation };
  }
  
  console.log('[TAROT] Initializing AI instance...');
  let ai;
  try {
    ai = await getAI();
    console.log('[TAROT] ✅ AI instance obtained successfully');
  } catch (error) {
    console.error('[TAROT] ❌ Failed to get AI instance:', error);
    console.error('[TAROT] Error details:', {
      message: error?.message,
      type: error?.constructor?.name,
      stack: error?.stack
    });
    
    // Vercel 환경에서 더 자세한 에러 메시지 제공
    if (error?.message?.includes('No AI provider API keys')) {
      return { 
        interpretation: '⚠️ AI 설정 오류: Vercel 환경변수에 AI API 키가 설정되지 않았습니다. GOOGLE_API_KEY 또는 OPENAI_API_KEY를 Vercel Dashboard에서 설정해주세요.' 
      };
    }
    
    throw error;
  }
  
  return ai.defineFlow(
    {
      name: 'generateTarotInterpretationFlow',
      inputSchema: GenerateTarotInterpretationInputSchema,
      outputSchema: GenerateTarotInterpretationOutputSchema,
    },
    async (input: GenerateTarotInterpretationInput) => {
    
    try {
      // 스타일 정보 추출
      const { styleId, styleName, cleanQuestion } = extractStyleFromQuestion(input.question);
      const spreadType = extractSpreadType(input.cardSpread);
      const cardIds = extractCardIds(input.cardInterpretations);
      
      console.log('[TAROT] Style extracted:', { styleId, styleName, spreadType, cardCount: cardIds.length });
      
      // Try to get the best available provider with automatic fallback
      let providerInfo;
      let model: string;
      let promptTemplate: string;
      let safetySettings: any[];
      
      // 🔴 CRITICAL: Vercel 환경에서는 환경변수 기반 모델 우선 사용
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isVercel || isProduction) {
        console.log('[TAROT] Vercel/Production environment detected - using environment-based configuration');
        
        // 환경변수에서 직접 모델 설정
        if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
          model = 'googleai/gemini-1.5-flash-latest';
          providerInfo = { provider: 'googleai', model: 'gemini-1.5-flash-latest' };
          console.log('[TAROT] Using Google AI/Gemini from environment');
        } else if (process.env.OPENAI_API_KEY) {
          model = 'openai/gpt-3.5-turbo';
          providerInfo = { provider: 'openai', model: 'gpt-3.5-turbo' };
          console.log('[TAROT] Using OpenAI from environment');
        } else {
          console.error('[TAROT] No API keys found in environment!');
          throw new Error('No AI API keys configured in Vercel environment');
        }
        
        // 스타일별 프롬프트 생성
        promptTemplate = await generateStyledPrompt(
          styleId,
          spreadType,
          cardIds,
          cleanQuestion,
          input.cardInterpretations
        );
        
        safetySettings = [];
      } else {
        // 개발 환경에서는 기존 로직 사용
        try {
          // First try to get configured provider
          const config = await getTarotPromptConfig();
          providerInfo = { provider: config.model.split('/')[0], model: config.model };
          model = config.model;
          
          // 스타일별 프롬프트 생성
          promptTemplate = await generateStyledPrompt(
            styleId,
            spreadType,
            cardIds,
            cleanQuestion,
            input.cardInterpretations
          );
          
          safetySettings = config.safetySettings;
        } catch (error) {
          console.log('[TAROT] Primary config failed, using fallback system:', error);
          // Use fallback system if primary config fails
          const fallbackInfo = await getProviderWithFallback();
          providerInfo = fallbackInfo;
          model = `${fallbackInfo.provider}/${fallbackInfo.model}`;
          
          // 스타일별 프롬프트 생성 (fallback의 경우도 동일하게)
          promptTemplate = await generateStyledPrompt(
            styleId,
            spreadType,
            cardIds,
            cleanQuestion,
            input.cardInterpretations
          );
          
          safetySettings = [];
          
          if (fallbackInfo.fallbackInfo.fallbackUsed) {
            console.log('[TAROT] Using fallback provider due to primary failure');
          }
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

      // Wrap the AI call with retry logic
      const llmResponse = await retryAICall(async () => {
        return await tarotPrompt(input);
      });
      const interpretationText = llmResponse.text; 

      if (!interpretationText) {
        console.error('[TAROT] AI 해석 생성 실패: 생성된 텍스트가 없습니다. 응답:', llmResponse);
        return { interpretation: 'AI 해석을 생성하는 데 문제가 발생했습니다. 생성된 내용이 없습니다.' };
      }

      console.log('[TAROT] AI interpretation generated successfully, length:', interpretationText.length);
      
      // Cache the successful interpretation
      setCachedInterpretation(cacheKey, interpretationText);
      
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
