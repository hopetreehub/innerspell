
'use server';

/**
 * @fileOverview Generates clarifying multiple-choice questions about a user's dream.
 *
 * - generateDreamClarificationQuestions: A function that handles generating questions.
 * - GenerateDreamClarificationQuestionsInput: The input type for the function.
 * - GenerateDreamClarificationQuestionsOutput: The return type for the function.
 * - ClarificationQuestion: The type for a single question object.
 */

import {getAI} from '@/ai/genkit';
import {z} from 'genkit';
// SafetySetting import removed due to version compatibility
import { getDreamPromptConfig } from '@/ai/services/prompt-service';

const GenerateDreamClarificationQuestionsInputSchema = z.object({
  dreamDescription: z.string().describe("The user's initial, free-form description of their dream."),
});
export type GenerateDreamClarificationQuestionsInput = z.infer<typeof GenerateDreamClarificationQuestionsInputSchema>;

const ClarificationQuestionSchema = z.object({
  question: z.string().describe("A question to ask the user to clarify a specific part of their dream."),
  options: z.array(z.string()).length(4).describe("Four plausible, distinct, multiple-choice options for the question."),
});
export type ClarificationQuestion = z.infer<typeof ClarificationQuestionSchema>;

const GenerateDreamClarificationQuestionsOutputSchema = z.object({
  questions: z.array(ClarificationQuestionSchema).min(2).max(4).describe("An array of 2 to 4 clarification questions."),
});
export type GenerateDreamClarificationQuestionsOutput = z.infer<typeof GenerateDreamClarificationQuestionsOutputSchema>;

export async function generateDreamClarificationQuestions(
  input: GenerateDreamClarificationQuestionsInput
): Promise<GenerateDreamClarificationQuestionsOutput> {
  const ai = await getAI();
  return generateDreamClarificationQuestionsFlow(ai, input);
}

const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

const PROMPT_TEMPLATE = `You are a helpful assistant for a dream interpretation service. Your task is to analyze a user's initial dream description and generate 2 to 4 insightful, multiple-choice questions to gather more specific details. These questions will help provide a more accurate and personalized dream interpretation.

RULES:
1.  Generate between 2 and 4 questions.
2.  Each question MUST have exactly 4 multiple-choice options.
3.  The questions should focus on the most ambiguous or symbolically important parts of the dream. Ask about key characters, emotions, settings, or objects.
4.  The options should be distinct, plausible, and cover a range of possibilities (e.g., different emotions, motivations, or outcomes).
5.  Frame the questions in a gentle and inquisitive tone.
6.  Everything MUST be in KOREAN.

User's Dream Description:
"{{{dreamDescription}}}"

Generate the clarification questions now.`;


async function generateDreamClarificationQuestionsFlow(ai: any, input: GenerateDreamClarificationQuestionsInput): Promise<GenerateDreamClarificationQuestionsOutput> {
  const flow = ai.defineFlow(
    {
      name: 'generateDreamClarificationQuestionsFlow',
      inputSchema: GenerateDreamClarificationQuestionsInputSchema,
      outputSchema: GenerateDreamClarificationQuestionsOutputSchema,
    },
    async (flowInput: GenerateDreamClarificationQuestionsInput) => {
      try {
        const { model } = await getDreamPromptConfig();
        const isGoogleModel = model.startsWith('googleai/');

        const prompt = ai.definePrompt({
          name: 'generateDreamClarificationQuestionsRuntimePrompt',
          input: { schema: GenerateDreamClarificationQuestionsInputSchema },
          output: { schema: GenerateDreamClarificationQuestionsOutputSchema },
          prompt: PROMPT_TEMPLATE,
          model: model,
          config: {
            safetySettings: isGoogleModel ? DEFAULT_SAFETY_SETTINGS : undefined,
          },
        });

        const { output } = await prompt(flowInput);
        if (!output) {
          throw new Error('AI가 추가 질문을 생성하지 못했습니다.');
        }
        return output;
      } catch (e: any) {
        console.error('Error generating clarification questions:', e);
        
        let userMessage = 'AI 질문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        const errorMessage = e.toString();

        if (errorMessage.includes('429')) {
          userMessage = 'Gemini API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나, 관리자에게 문의하여 API 키를 확인해주세요. (오류 코드: 429)';
        } else if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
          userMessage = 'AI 모델에 대한 요청이 많아 현재 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.';
        } else if (errorMessage.includes("SAFETY")) {
           userMessage = "생성된 질문이 안전 기준에 부합하지 않아 차단되었습니다. 꿈 내용을 수정해 보세요.";
        } else if (errorMessage.includes("no valid candidates")) {
           userMessage = "AI가 현재 요청에 대해 적절한 질문을 찾지 못했습니다. 꿈 내용을 조금 다르게 해보거나, 나중에 다시 시도해주세요.";
        } else {
           userMessage = `AI 질문 생성 오류: ${e.message || '알 수 없는 오류'}.`;
        }
        
        throw new Error(userMessage);
      }
    }
  );
  
  return flow(input);
}
