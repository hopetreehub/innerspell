
'use server';

/**
 * @fileOverview Generates an AI-powered interpretation of a user's dream.
 *
 * - generateDreamInterpretation - A function that handles the dream interpretation process.
 * - GenerateDreamInterpretationInput - The input type for the function.
 * - GenerateDreamInterpretationOutput - The return type for the function.
 */

import {getAI} from '@/ai/genkit';
import {z} from 'genkit';
import { getDreamPromptConfig } from '@/ai/services/prompt-service';
import { getProviderConfig } from '@/lib/ai-utils';
// SafetySetting import removed due to version compatibility

const ClarificationSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const GenerateDreamInterpretationInputSchema = z.object({
  dreamDescription: z.string().describe("The user's initial, free-form description of their dream."),
  clarifications: z.array(ClarificationSchema).optional().describe("A structured set of answers to AI-generated clarification questions about the dream."),
  additionalInfo: z.string().optional().describe("Any additional details or thoughts the user provided after answering the clarification questions."),
  sajuInfo: z.string().optional().describe("The user's Saju (Four Pillars of Destiny) information, if provided."),
  isGuestUser: z.boolean().optional().describe('Whether the user is a guest (not logged in). If true, provide a shorter, teaser interpretation.'),
});
export type GenerateDreamInterpretationInput = z.infer<typeof GenerateDreamInterpretationInputSchema>;

const GenerateDreamInterpretationOutputSchema = z.object({
  interpretation: z.string().describe('The AI-powered interpretation of the dream.'),
});
export type GenerateDreamInterpretationOutput = z.infer<typeof GenerateDreamInterpretationOutputSchema>;

const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

export async function generateDreamInterpretation(input: GenerateDreamInterpretationInput): Promise<GenerateDreamInterpretationOutput> {
  return generateDreamInterpretationFlow(input);
}

const generateDreamInterpretationFlow = async (flowInput: GenerateDreamInterpretationInput): Promise<GenerateDreamInterpretationOutput> => {
  const ai = await getAI();
  
  return ai.defineFlow(
    {
      name: 'generateDreamInterpretationFlow',
      inputSchema: GenerateDreamInterpretationInputSchema,
      outputSchema: GenerateDreamInterpretationOutputSchema,
    },
    async (input: GenerateDreamInterpretationInput) => {
    try {
      // Fetch dynamic prompt template and model from the centralized service
      const { promptTemplate, model } = await getDreamPromptConfig();
      const providerConfig = getProviderConfig(model);
      
      // Configure prompt based on provider capabilities
      const promptConfig: any = {
        name: 'generateDreamInterpretationRuntimePrompt',
        input: { schema: GenerateDreamInterpretationInputSchema },
        prompt: promptTemplate,
        model: model,
      };
      
      // Add provider-specific configuration
      if (providerConfig.supportsSafetySettings) {
        promptConfig.config = {
          safetySettings: DEFAULT_SAFETY_SETTINGS,
        };
      }

      const dreamPrompt = await ai.definePrompt(promptConfig);

      const llmResponse = await dreamPrompt(input);
      const interpretationText = llmResponse.text;

      if (!interpretationText) {
        return { interpretation: 'AI 해석을 생성하는 데 문제가 발생했습니다. 생성된 내용이 없습니다.' };
      }

      return { interpretation: interpretationText };
    } catch (e: any) {
      console.error('Error executing dream interpretation prompt:', e);
      const errorMessage = e.toString();
      
      // API 키 오류 처리 - 개발 모드에서는 폴백 해석 반환
      if (errorMessage.includes('401') || errorMessage.includes('Incorrect API key')) {
        console.log('[DREAM INTERPRETATION] API key error detected');
        if (process.env.NODE_ENV === 'development') {
          return {
            interpretation: `### 💭 **당신의 꿈 해몽**

**[꿈의 요약 및 전반적 분석]**
${input.dreamDescription}에서 나타나는 상징들을 살펴보면, 이 꿈은 현재 당신의 내면 상태와 무의식의 메시지를 담고 있는 것으로 보입니다.

**[주요 상징 분석]**
- **꿈의 주요 요소**: 무의식이 전달하고자 하는 중요한 메시지
  - **동양 철학적 의미**: 음양의 조화와 변화의 징조
  - **서양 신화적 의미**: 새로운 시작과 성장의 가능성
  - **심리학적 의미**: 자아 발견과 내적 성숙의 과정

**[심리적/영적 통찰]**
이 꿈은 당신이 현재 겪고 있는 변화의 시기를 반영하며, 내면의 지혜가 새로운 방향을 제시하고 있음을 의미합니다.

**[현실적 조언 및 방향 제시]**
- 직관에 더 많이 의존해보세요
- 새로운 도전을 두려워하지 말고 받아들이세요
- 내면의 소리에 귀 기울이는 시간을 가져보세요

*개발 모드에서 생성된 기본 해석입니다. 실제 환경에서는 더 정확한 AI 분석이 제공됩니다.*`
          };
        } else {
          // 프로덕션에서는 API 키 오류 메시지
          return { interpretation: "AI API 키가 올바르지 않습니다. 관리자에게 문의해주세요." };
        }
      }
      
      // 다른 오류들 처리
      let userMessage = 'AI 해석 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

      if (errorMessage.includes('429')) {
        userMessage = 'Gemini API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나, 관리자에게 문의하여 API 키를 확인해주세요. (오류 코드: 429)';
      } else if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
        userMessage = 'AI 모델에 대한 요청이 많아 현재 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      } else if (errorMessage.includes("SAFETY")) {
         userMessage = "생성된 콘텐츠가 안전 기준에 부합하지 않아 차단되었습니다. 꿈 내용을 수정해 보세요.";
      } else {
        // API 키 오류나 기타 오류의 경우 사용자에게 친화적인 메시지만 표시
        userMessage = 'AI 해석 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      return { interpretation: userMessage };
    }
    }
  )(flowInput);
};
