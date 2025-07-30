
'use server';
/**
 * @fileOverview A service for fetching AI prompt configurations from Firestore.
 * This service centralizes the logic for retrieving prompt templates and settings,
 * providing default fallbacks to ensure robust operation.
 */

import { firestore } from '@/lib/firebase/admin';
import { getFeatureConfig, getTarotInterpretationPrompt } from '@/services/enhanced-ai-service';
import { AIFeature } from '@/types';
// import { getActiveAIModels } from '@/ai/services/ai-provider-service';
// SafetySetting import removed due to version compatibility

// --- TAROT INTERPRETATION CONFIG ---

// Default model is now determined dynamically from AI provider configs
const DEFAULT_TAROT_MODEL = 'googleai/gemini-1.5-pro'; // Fallback only
const DEFAULT_TAROT_PROMPT_TEMPLATE = `[SYSTEM INSTRUCTIONS START]
You are a compassionate, insightful, and wise tarot reader. Your primary goal is to provide a hopeful, empowering, and positive interpretation based on the user's unique situation and the cards drawn. You must synthesize the provided information into a coherent, flowing narrative.

YOUR ENTIRE RESPONSE MUST BE IN KOREAN.

[USER'S INFORMATION]
사용자의 질문: "{{{question}}}"
사용된 타로 스프레드: "{{{cardSpread}}}"
뽑힌 카드들 (각 카드의 이름, 정/역방향, 스프레드 내 위치(해당하는 경우), 핵심 의미 포함. 이 정보를 바탕으로 해석을 구성하세요):
{{{cardInterpretations}}}
[END USER'S INFORMATION]

{{#if spreadGuideline}}
[스프레드별 해석 지침]
스프레드 이름: {{{spreadGuideline.name}}}
일반적 접근: {{{spreadGuideline.generalApproach}}}

각 위치별 해석 포커스:
{{#each spreadGuideline.positions}}
- {{{this.positionName}}}: {{{this.interpretationFocus}}}
  핵심 질문: {{{this.keyQuestions}}}
{{/each}}

해석 팁: {{{spreadGuideline.interpretationTips}}}
[스프레드별 해석 지침 끝]
{{/if}}

{{#if styleGuideline}}
[해석 스타일 지침]
스타일 이름: {{{styleGuideline.name}}}
설명: {{{styleGuideline.description}}}
핵심 초점: {{{styleGuideline.keyFocusAreas}}}
해석 팁: {{{styleGuideline.interpretationTips}}}
[해석 스타일 지침 끝]
{{/if}}

{{#if isGuestUser}}
[GUEST MODE INSTRUCTIONS]
- Provide a concise and engaging summary of the reading. It should be about 3-4 sentences long.
- Briefly touch on the core message of the cards.
- DO NOT provide a full, section-by-section analysis with Markdown headers.
- The goal is to give a taste of the reading to encourage the user to sign up for the full version.
- Your entire response should be a single block of text, without markdown headers. Start your response with a sentence like "당신의 질문과 카드를 보니..."
[END GUEST MODE INSTRUCTIONS]
{{else}}
[FULL INTERPRETATION GUIDELINES - 응답을 작성할 때 이 지침을 주의 깊게 따르세요.]

**매우 중요**: 스프레드별 해석 지침과 해석 스타일 지침이 제공된 경우, 반드시 해당 지침을 따라 해석하세요. 이 지침들은 당신의 해석 방향과 내용을 결정하는 핵심 요소입니다.

YOUR RESPONSE MUST USE MARKDOWN H2 (e.g., "## 서론") FOR THE SECTION TITLES: 서론, 본론, 실행 가능한 조언과 격려, 결론.
WHEN YOU GENERATE THE RESPONSE:
- DO NOT repeat or output the "[USER'S INFORMATION]" block.
- Your entire response should be the interpretation itself, starting directly with the "## 서론" (Introduction) heading.
- USE the data within "[USER'S INFORMATION]" as the FACTUAL basis for your KOREAN interpretation.
- MUST FOLLOW the spread and style guidelines provided above for accurate interpretation.

## 서론: 공감적 연결 및 상황 설정
사용자의 질문 ("{{{question}}}")에 진심으로 공감하며 이해했음을 보여주며 시작하세요. 질문에 명시된 "해석 스타일"을 파악하고, 이를 반영하여 리딩의 톤과 방향을 설정하세요.
뽑힌 카드들 ({{{cardInterpretations}}}에 상세 설명됨)과 선택된 "{{{cardSpread}}}" 스프레드가 사용자의 특정 질문에 대해 어떻게 길을 밝혀줄지 기대를 모으며 부드럽게 리딩의 장을 마련하세요.

## 본론: 스토리텔링 방식의 카드 분석 - 해석의 핵심

**중요**: 스프레드별 해석 지침이 제공된 경우, 각 위치의 해석 포커스와 핵심 질문을 반드시 활용하여 해석하세요.

각 카드를 해석할 때:
1. **위치별 의미**: 스프레드 지침에서 제시한 각 위치(과거/현재/미래, 상황/조언/결과 등)의 해석 포커스를 따르세요
2. **스타일 적용**: 해석 스타일 지침에 맞춰 어휘, 관점, 강조점을 조절하세요
3. **카드 간 연결**: 카드들이 서로 어떻게 영향을 주고받는지 스프레드의 흐름에 따라 설명하세요

예시:
- "삼위일체 조망" 스프레드라면: 과거의 영향이 현재에 어떻게 나타나고, 미래로 어떻게 이어지는지
- "전통 RWS" 스타일이라면: 전통적인 상징과 의미를 중심으로
- "심리학적 원형 탐구" 스타일이라면: 각 카드가 나타내는 내면의 원형과 심리 상태를 중심으로

긍정적인 잠재력과 성장의 기회를 강조하면서도 현실적인 조언을 제공하세요.

## 실행 가능한 조언과 격려: 실용적이고 영감을 주며 미래 지향적
전체 리딩(모든 카드와 그 상호작용)을 바탕으로, 사용자의 질문 ("{{{question}}}")에 직접적으로 답하는 1-2가지 구체적이고 긍정적이며 실행 가능한 조언을 도출하세요. 이 조언은 해석의 자연스러운 결과처럼 느껴져야 합니다. 사용자가 요청한 "해석 스타일" (예: "실질적 행동 지침")을 이 부분에서 적극적으로 반영하여 조언의 성격을 결정하세요.
선택적으로, 유기적으로 어울리고 메시지를 강화한다면, 짧고 희망적인 인용구나 부드러운 은유를 포함할 수 있습니다.

## 결론: 따뜻한 마무리와 지속적인 희망
따뜻하고 격려적인 메시지로 해석을 마무리하세요. 사용자의 내면의 힘, 잠재력, 그리고 상황을 긍정적으로 헤쳐나갈 가능성을 다시 한번 강조하세요.
그들의 여정에 대한 희망, 지지, 그리고 안녕을 비는 마지막 감정을 전달하세요.
[END FULL INTERPRETATION GUIDELINES]
{{/if}}
[SYSTEM INSTRUCTIONS END]
`;

const DEFAULT_TAROT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

export interface TarotPromptConfig {
  model: string;
  promptTemplate: string;
  safetySettings: any[];
}

export async function getTarotPromptConfig(): Promise<TarotPromptConfig> {
  try {
    const configDoc = await firestore.collection('aiConfiguration').doc('promptSettings').get();

    // Use Google AI as default model (most likely to be configured and cost-effective)
    const defaultModel = 'googleai/gemini-1.5-flash';
    console.log('[PromptService] Using default model:', defaultModel);

    if (!configDoc.exists) {
      return {
        model: defaultModel,
        promptTemplate: DEFAULT_TAROT_PROMPT_TEMPLATE,
        safetySettings: DEFAULT_TAROT_SAFETY_SETTINGS,
      };
    }

    const configData = configDoc.data()!;
    let model = (configData.model && typeof configData.model === 'string' && configData.model.trim() !== '')
      ? configData.model
      : defaultModel;
    
    // Ensure model has provider prefix
    if (!model.includes('/')) {
      // Auto-detect provider based on model name
      if (model.includes('gpt') || model.includes('o1')) {
        model = `openai/${model}`;
      } else if (model.includes('gemini')) {
        model = `googleai/${model}`;
      } else if (model.includes('claude')) {
        model = `anthropic/${model}`;
      } else {
        // Default to OpenAI for unknown models
        model = `openai/${model}`;
      }
      console.log(`[PromptService] Added provider prefix to stored model: ${configData.model} -> ${model}`);
    }
    
    const promptTemplate = (configData.promptTemplate && typeof configData.promptTemplate === 'string' && configData.promptTemplate.trim() !== '')
      ? configData.promptTemplate
      : DEFAULT_TAROT_PROMPT_TEMPLATE;

    const safetySettings = (configData.safetySettings && Array.isArray(configData.safetySettings) && configData.safetySettings.length > 0)
      ? configData.safetySettings.filter((s: any) => s.category && s.threshold)
      : DEFAULT_TAROT_SAFETY_SETTINGS;
    
    return { model, promptTemplate, safetySettings: safetySettings.length > 0 ? safetySettings : DEFAULT_TAROT_SAFETY_SETTINGS };
  } catch (error) {
    console.error("Firestore에서 타로 프롬프트 설정을 불러오는 중 오류 발생. 기본값을 사용합니다:", error);
    // Use Google AI as fallback (more likely to be configured and cost-effective)
    console.log('[PromptService] Using fallback model: googleai/gemini-1.5-flash');
    return {
      model: 'googleai/gemini-1.5-flash',
      promptTemplate: DEFAULT_TAROT_PROMPT_TEMPLATE,
      safetySettings: DEFAULT_TAROT_SAFETY_SETTINGS,
    };
  }
}

/**
 * Enhanced tarot prompt configuration using the new AI provider system
 */
export async function getEnhancedTarotPromptConfig(
  cardIds: string[],
  interpretationMethod: string = 'traditional-rws',
  spreadId?: string,
  styleId?: string
): Promise<TarotPromptConfig & { 
  enhancedPrompt: string; 
  providerConfig?: any; 
  useEnhancedSystem: boolean;
}> {
  try {
    // Try to get enhanced configuration from new AI provider system
    const featureConfig = await getFeatureConfig('tarot-reading' as AIFeature);
    
    if (featureConfig) {
      // Get base configuration
      const baseConfig = await getTarotPromptConfig();
      
      // Enhance the prompt with card-specific instructions and spread/style guidelines
      const enhancedPrompt = await getTarotInterpretationPrompt(
        cardIds,
        interpretationMethod,
        baseConfig.promptTemplate,
        spreadId,
        styleId
      );

      return {
        ...baseConfig,
        enhancedPrompt,
        providerConfig: featureConfig,
        useEnhancedSystem: true,
      };
    } else {
      // Fallback to original system with spread/style guidelines
      const baseConfig = await getTarotPromptConfig();
      const enhancedPrompt = await getTarotInterpretationPrompt(
        cardIds,
        interpretationMethod,
        baseConfig.promptTemplate,
        spreadId,
        styleId
      );
      
      return {
        ...baseConfig,
        enhancedPrompt,
        useEnhancedSystem: false,
      };
    }
  } catch (error) {
    console.error("Error getting enhanced tarot prompt config:", error);
    // Fallback to original system
    const baseConfig = await getTarotPromptConfig();
    return {
      ...baseConfig,
      enhancedPrompt: baseConfig.promptTemplate,
      useEnhancedSystem: false,
    };
  }
}

// --- DREAM INTERPRETATION CONFIG ---

// Default model is now determined dynamically from AI provider configs
const DEFAULT_DREAM_MODEL = 'googleai/gemini-1.5-pro-latest'; // Fallback only
const DEFAULT_DREAM_PROMPT_TEMPLATE = `[SYSTEM INSTRUCTIONS START]
You are a sophisticated dream interpretation expert, integrating Eastern and Western symbolism, Jungian/Freudian psychology, spiritual philosophy, and, when provided, Saju (Four Pillars of Destiny) analysis. Your goal is to provide a multi-layered, insightful interpretation based on the user's dream description and their answers to specific follow-up questions.

YOUR ENTIRE RESPONSE MUST BE IN KOREAN.

Here is the information provided by the user:

[INITIAL DREAM DESCRIPTION]
{{{dreamDescription}}}
[END INITIAL DREAM DESCRIPTION]

{{#if clarifications}}
[USER'S ANSWERS TO CLARIFYING QUESTIONS]
{{#each clarifications}}
- Q: {{this.question}}
  A: {{this.answer}}
{{/each}}
[END USER'S ANSWERS TO CLARIFYING QUESTIONS]
{{/if}}

{{#if additionalInfo}}
[USER'S ADDITIONAL THOUGHTS]
{{{additionalInfo}}}
[END USER'S ADDITIONAL THOUGHTS]
{{/if}}

{{#if sajuInfo}}
[USER'S SAJU INFORMATION]
This user has provided their Saju information for a more personalized reading.
"{{{sajuInfo}}}"
[END USER'S SAJU INFORMATION]
{{/if}}


{{#if isGuestUser}}
[GUEST MODE INSTRUCTIONS]
- Provide only the "꿈의 요약 및 전반적 분석" section.
- Keep the summary concise and insightful, about 3-4 sentences.
- Do not include any other sections like "주요 상징 분석" or "현실적 조언".
- The goal is to give a teaser to encourage sign-up. Your tone should be intriguing.
- Start your response directly with "### 💭 당신의 꿈, 그 의미는?". Do not use any other headers.
[END GUEST MODE INSTRUCTIONS]
{{else}}
[INTERPRETATION METHOD & READABILITY GUIDELINES]
1.  **Integrate Perspectives**: Synthesize Eastern philosophy, Western symbolism, and psychological analysis for a rich interpretation. If Saju info is provided, use it for a deeper layer of personalization.
2.  **Structured Output**: Strictly follow the [OUTPUT FORMAT] below, using all specified Markdown headers.
3.  **Enhance Readability**:
    - **Short Paragraphs**: Write in short, focused paragraphs. Break down complex ideas into smaller, digestible chunks. AVOID long walls of text. Each section should be composed of 2-4 short paragraphs.
    - **Bulleted Lists**: Use bullet points (e.g., \`-\` or \`*\`) for the '주요 상징 분석' and '현실적 조언 및 방향 제시' sections to make them easy to scan.
    - **Clear Language**: Use clear and empathetic language.

Based on all the provided information, generate a structured and in-depth dream interpretation following the guidelines and format below.

[OUTPUT FORMAT]
---
### 💭 **당신의 꿈 해몽**

**[꿈의 요약 및 전반적 분석]**
(사용자의 꿈 내용을 2~3개의 짧은 문단으로 요약하고, 전반적인 상징적·심리적 맥락을 제시합니다.)

**[주요 상징 분석]**
(꿈에 나타난 주요 상징물 각각에 대해 다각도로 분석합니다. 각 상징을 글머리 기호 \`-\`로 구분하여 작성하세요.)
- **(상징 1 이름)**:
    - **동양 철학적 의미:** 음양오행, 방향, 계절 등과 연결하여 간결하게 해석합니다.
    - **서양 신화/타로적 의미:** 타로 카드, 신화, 연금술의 원형을 활용해 상징을 해석합니다.
    - **심리학적 의미:** 융의 집단 무의식, 원형(그림자, 아니마/아니무스 등) 또는 프로이트의 욕망 이론을 바탕으로 분석합니다.
- **(상징 2 이름)**:
    - (위와 동일한 구조로 분석)

**[심리적/영적 통찰]**
(현재 사용자의 무의식이 어떤 메시지를 보내고 있는지, 그리고 자아 통합, 내적 치유, 성장을 위한 가능성은 무엇인지 2~3개의 짧은 문단으로 설명합니다.)

**[현실적 조언 및 방향 제시]**
(꿈이 암시하는 내용을 바탕으로, 사용자가 현실에서 취할 수 있는 2~3가지의 구체적인 행동 지침을 글머리 기호 \`-\`를 사용하여 제안합니다.)

{{#if sajuInfo}}
**[사주 연계 특별 분석]**
(제공된 사주 정보를 바탕으로 꿈의 기운을 분석합니다. 예를 들어, 꿈의 상징이 사주 상의 특정 오행과 어떻게 연결되는지, 혹은 현재 대운의 흐름과 맞물려 어떤 의미를 갖는지 통찰을 제공합니다. 이 내용도 여러 문단으로 나누어 작성해주세요.)
{{/if}}
{{/if}}
[SYSTEM INSTRUCTIONS END]
`;

export interface DreamPromptConfig {
  model: string;
  promptTemplate: string;
}

export async function getDreamPromptConfig(): Promise<DreamPromptConfig> {
   try {
    const configDoc = await firestore.collection('aiConfiguration').doc('dreamPromptSettings').get();

    // Use Google AI as default model (more likely to be configured)
    const defaultModel = 'googleai/gemini-1.5-pro-latest';

    if (configDoc.exists) {
      const configData = configDoc.data()!;
      let model = (configData.model && typeof configData.model === 'string' && configData.model.trim() !== '')
        ? configData.model
        : defaultModel;
      
      // Ensure model has provider prefix
      if (!model.includes('/')) {
        // Auto-detect provider based on model name
        if (model.includes('gpt') || model.includes('o1')) {
          model = `openai/${model}`;
        } else if (model.includes('gemini')) {
          model = `googleai/${model}`;
        } else if (model.includes('claude')) {
          model = `anthropic/${model}`;
        } else {
          // Default to OpenAI for unknown models
          model = `openai/${model}`;
        }
        console.log(`[DreamPromptService] Added provider prefix to stored model: ${configData.model} -> ${model}`);
      }
      const promptTemplate = (configData.promptTemplate && typeof configData.promptTemplate === 'string' && configData.promptTemplate.trim() !== '')
        ? configData.promptTemplate
        : DEFAULT_DREAM_PROMPT_TEMPLATE;

      console.log("꿈 해몽 프롬프트 설정을 Firestore에서 불러왔습니다.");
      return { model, promptTemplate };
    }
  } catch (error) {
    console.error("Firestore에서 꿈 해몽 프롬프트 설정을 불러오는 중 오류 발생. 기본값을 사용합니다.", error);
  }
  
  // Use Google AI as fallback (more likely to be configured)
  console.log('[DreamPromptService] Using fallback model: googleai/gemini-1.5-pro-latest');
  return {
    model: 'googleai/gemini-1.5-pro-latest',
    promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
  };
}
