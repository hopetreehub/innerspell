
'use server';
/**
 * @fileOverview A service for fetching AI prompt configurations from Firestore.
 * This service centralizes the logic for retrieving prompt templates and settings,
 * providing default fallbacks to ensure robust operation.
 */

import { firestore } from '@/lib/firebase/admin';
import { getFeatureConfig, getTarotInterpretationPrompt } from '@/services/enhanced-ai-service';
import { AIFeature } from '@/types';
import { getActiveAIModels } from '@/ai/services/ai-provider-service';
// SafetySetting import removed due to version compatibility

// --- TAROT INTERPRETATION CONFIG ---

// Default model is now determined dynamically from AI provider configs
const DEFAULT_TAROT_MODEL = 'googleai/gemini-1.5-flash-latest'; // Fallback only
const DEFAULT_TAROT_PROMPT_TEMPLATE = `[SYSTEM INSTRUCTIONS START]
You are a compassionate, insightful, and wise tarot reader. Your primary goal is to provide a hopeful, empowering, and positive interpretation based on the user's unique situation and the cards drawn. You must synthesize the provided information into a coherent, flowing narrative.

YOUR ENTIRE RESPONSE MUST BE IN KOREAN.

[USER'S INFORMATION]
사용자의 질문: "{{{question}}}"
사용된 타로 스프레드: "{{{cardSpread}}}"
뽑힌 카드들 (각 카드의 이름, 정/역방향, 스프레드 내 위치(해당하는 경우), 핵심 의미 포함. 이 정보를 바탕으로 해석을 구성하세요):
{{{cardInterpretations}}}
[END USER'S INFORMATION]

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
YOUR RESPONSE MUST USE MARKDOWN H2 (e.g., "## 서론") FOR THE SECTION TITLES: 서론, 본론, 실행 가능한 조언과 격려, 결론.
WHEN YOU GENERATE THE RESPONSE:
- DO NOT repeat or output the "[USER'S INFORMATION]" block.
- Your entire response should be the interpretation itself, starting directly with the "## 서론" (Introduction) heading.
- USE the data within "[USER'S INFORMATION]" as the FACTUAL basis for your KOREAN interpretation.
- PAY CLOSE ATTENTION to the "해석 스타일" (interpretation style) if mentioned within the "{{{question}}}". This style is CRUCIAL for shaping your response.

## 서론: 공감적 연결 및 상황 설정
사용자의 질문 ("{{{question}}}")에 진심으로 공감하며 이해했음을 보여주며 시작하세요. 질문에 명시된 "해석 스타일"을 파악하고, 이를 반영하여 리딩의 톤과 방향을 설정하세요.
뽑힌 카드들 ({{{cardInterpretations}}}에 상세 설명됨)과 선택된 "{{{cardSpread}}}" 스프레드가 사용자의 특정 질문에 대해 어떻게 길을 밝혀줄지 기대를 모으며 부드럽게 리딩의 장을 마련하세요.

## 본론: 스토리텔링 방식의 카드 분석 - 해석의 핵심
"{{{cardInterpretations}}}"에 나열된 각 카드에 대해, 그 카드가 사용자의 질문 ("{{{question}}}")과 어떤 관련이 있는지 설명하세요. 카드의 이름, 정/역방향, 그리고 "{{{cardSpread}}}" 내에서의 특정 위치(예: "과거", "현재", "도전 과제", "결과" - "{{{cardInterpretations}}}"에 위치명이 제공된 경우 사용)를 반드시 고려해야 합니다. 주어진 카드 정보를 바탕으로 새로운 문장과 이야기를 만드세요. 단순히 카드 정보를 나열하지 마세요.
***매우 중요:*** 사용자의 질문에 포함된 "해석 스타일" 지침이 있다면, 그 스타일에 맞춰 카드 분석의 깊이, 사용하는 어휘, 강조점을 적극적으로 조절하세요. 예를 들어, "실질적 행동 지침" 스타일이라면 각 카드가 어떤 행동을 암시하는지, "심리학적 원형 탐구" 스타일이라면 각 카드가 어떤 내면의 상태나 원형을 나타내는지 등을 구체적으로 연결하여 설명해야 합니다.
"{{{cardSpread}}}"의 전체적인 의미나 흐름을 당신의 이야기에 엮어 넣으세요. 예를 들어, "{{{cardSpread}}}"가 "과거-현재-미래" 구조를 나타낸다면, 이 타임라인을 따라 이야기를 구성하고 이전 카드가 이후 카드에 어떻게 영향을 미치는지 설명하세요.
개별 카드 해석을 하나의 흐르는, 통일된 이야기로 연결하세요. 카드들이 서로 어떻게 영향을 주고받으며 "{{{question}}}"에 답하는지 보여주세요.
긍정적인 잠재력, 강점, 성장의 기회를 강조하세요. 도전적인 카드가 나타나면, 그것을 교훈, 인식해야 할 영역, 또는 통찰과 노력으로 극복할 수 있는 장애물로 건설적으로 해석하세요. 전반적인 메시지는 힘을 실어주고 희망을 심어주면서도 현실을 인정해야 합니다. 풍부하고 묘사적이며 사려 깊은 언어를 사용하세요.

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

    // Get active AI models to find a suitable default
    const activeModels = await getActiveAIModels();
    // Prefer Gemini models if available
    const geminiModel = activeModels.find(m => m.provider === 'gemini' || m.provider === 'googleai');
    const openaiModel = activeModels.find(m => m.provider === 'openai');
    const defaultModel = geminiModel ? geminiModel.id : (openaiModel ? openaiModel.id : (activeModels.length > 0 ? activeModels[0].id : DEFAULT_TAROT_MODEL));

    if (!configDoc.exists) {
      return {
        model: defaultModel,
        promptTemplate: DEFAULT_TAROT_PROMPT_TEMPLATE,
        safetySettings: DEFAULT_TAROT_SAFETY_SETTINGS,
      };
    }

    const configData = configDoc.data()!;
    const model = (configData.model && typeof configData.model === 'string' && configData.model.trim() !== '')
      ? configData.model
      : defaultModel;
    
    const promptTemplate = (configData.promptTemplate && typeof configData.promptTemplate === 'string' && configData.promptTemplate.trim() !== '')
      ? configData.promptTemplate
      : DEFAULT_TAROT_PROMPT_TEMPLATE;

    const safetySettings = (configData.safetySettings && Array.isArray(configData.safetySettings) && configData.safetySettings.length > 0)
      ? configData.safetySettings.filter((s: any) => s.category && s.threshold)
      : DEFAULT_TAROT_SAFETY_SETTINGS;
    
    return { model, promptTemplate, safetySettings: safetySettings.length > 0 ? safetySettings : DEFAULT_TAROT_SAFETY_SETTINGS };
  } catch (error) {
    console.error("Firestore에서 타로 프롬프트 설정을 불러오는 중 오류 발생. 기본값을 사용합니다:", error);
    // Try to get active models as fallback
    try {
      const activeModels = await getActiveAIModels();
      // Prefer Gemini models if available
      const geminiModel = activeModels.find(m => m.provider === 'gemini' || m.provider === 'googleai');
      const openaiModel = activeModels.find(m => m.provider === 'openai');
      const fallbackModel = geminiModel ? geminiModel.id : (openaiModel ? openaiModel.id : (activeModels.length > 0 ? activeModels[0].id : DEFAULT_TAROT_MODEL));
      return {
        model: fallbackModel,
        promptTemplate: DEFAULT_TAROT_PROMPT_TEMPLATE,
        safetySettings: DEFAULT_TAROT_SAFETY_SETTINGS,
      };
    } catch {
      // Use Gemini as absolute fallback
      return {
        model: 'googleai/gemini-1.5-flash-latest',
        promptTemplate: DEFAULT_TAROT_PROMPT_TEMPLATE,
        safetySettings: DEFAULT_TAROT_SAFETY_SETTINGS,
      };
    }
  }
}

/**
 * Enhanced tarot prompt configuration using the new AI provider system
 */
export async function getEnhancedTarotPromptConfig(
  cardIds: string[],
  interpretationMethod: string = 'traditional-rws'
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
      
      // Enhance the prompt with card-specific instructions
      const enhancedPrompt = await getTarotInterpretationPrompt(
        cardIds,
        interpretationMethod,
        baseConfig.promptTemplate
      );

      return {
        ...baseConfig,
        enhancedPrompt,
        providerConfig: featureConfig,
        useEnhancedSystem: true,
      };
    } else {
      // Fallback to original system
      const baseConfig = await getTarotPromptConfig();
      return {
        ...baseConfig,
        enhancedPrompt: baseConfig.promptTemplate,
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
[INTERPRETATION METHOD & STORYTELLING GUIDELINES]
1. **깊이 있는 통합적 해석**: 동양철학, 서양 상징학, 심리학적 분석을 하나의 이야기로 엮어내세요. 15년 경력의 꿈 분석 전문가처럼 따뜻하고 지혜로운 목소리로 이야기하세요.

2. **스토리텔링과 가독성의 균형**:
   - 긴 내용을 담되, 적절한 문단 나누기로 읽기 쉽게 구성
   - 중요한 통찰은 별도 줄로 강조
   - 자연스러운 흐름을 위해 연결어 활용
   - 시적이면서도 명확한 언어 사용

3. **섹션별 작성 지침**:
   - 각 섹션은 하나의 완결된 이야기처럼 작성
   - 단순 나열이 아닌 서사적 흐름 유지
   - 독자와 대화하듯 친밀한 어조 사용

Based on all the provided information, create a rich, narrative-style dream interpretation following the enhanced format below.

[OUTPUT FORMAT]
---
### 💭 **당신의 꿈 해몽**

**[꿈의 여정 - 전체적인 이야기]**

이 꿈이 들려주는 이야기를 천천히 풀어보겠습니다. {{{dreamDescription}}}에서 시작된 당신의 꿈은...

(첫 문단: 꿈의 전체적인 분위기와 흐름을 시적으로 묘사)

(둘째 문단: 꿈의 핵심 메시지를 은유적으로 풀어내기)

(셋째 문단: 현재 삶의 상황과 꿈의 연결고리 제시)

**[꿈속 상징들의 깊은 의미]**

당신의 꿈에 나타난 상징들은 각각 특별한 메시지를 품고 있습니다.

• **첫 번째 상징 - (상징 이름)**

  동양의 지혜로 보면, 이 상징은... (음양오행, 계절, 방향 등과 연결하여 2-3문장으로 풀어내기)
  
  서양의 신화와 타로의 눈으로는... (신화적 원형, 타로 카드와 연결하여 2-3문장으로 설명)
  
  심리학적으로 들여다보면... (융/프로이트 이론을 삶의 이야기로 풀어내기)

• **두 번째 상징 - (상징 이름)**

  (위와 같은 방식으로 스토리텔링하되, 첫 번째 상징과의 연결성도 언급)

**[마음의 소리 - 심리적/영적 통찰]**

이 꿈을 통해 당신의 무의식이 전하고자 하는 깊은 메시지가 있습니다.

(첫 번째 통찰: 현재 내면의 상태를 따뜻하게 짚어주기)

당신의 영혼은 지금... (성장의 과정을 은유적으로 표현)

(두 번째 통찰: 치유와 통합의 가능성을 희망적으로 제시)

이는 마치... (일상적인 비유를 들어 쉽게 설명)

(세 번째 통찰: 앞으로의 성장 방향을 시적으로 그려내기)

**[삶으로의 초대 - 현실적 조언과 실천]**

이제 이 꿈의 지혜를 당신의 일상으로 가져가는 방법을 안내해드리겠습니다.

• **첫 번째 길 - (구체적인 실천 제목)**
  
  당신의 일상에서... (구체적인 상황을 그리며 3-4문장으로 실천 방법 제시)
  
  예를 들어... (실제 적용 예시를 스토리로 풀어내기)

• **두 번째 길 - (구체적인 실천 제목)**
  
  또 다른 아름다운 실천은... (변화의 과정을 단계별로 그려내기)
  
  이를 통해 당신은... (기대되는 변화를 희망적으로 묘사)

• **세 번째 길 - (구체적인 실천 제목)**
  
  마지막으로... (일상 속 작은 의식이나 습관을 제안)
  
  이 작은 실천이 가져올 변화는... (미래의 가능성을 그려내기)

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
  // 개발 모드에서는 환경 변수 기반 설정 우선 사용
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  const fileStorageEnabled = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true';
  const useMockAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false';
  
  if (isDevelopmentMode && fileStorageEnabled && useMockAuth) {
    console.log('[PROMPT SERVICE] Development mode - using Gemini priority config');
    // Gemini API를 우선으로 설정
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      return {
        model: 'googleai/gemini-1.5-flash-latest',
        promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
      };
    } else if (process.env.OPENAI_API_KEY) {
      return {
        model: 'openai/gpt-4',
        promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
      };
    } else {
      // 기본값 - Gemini 우선
      return {
        model: 'googleai/gemini-1.5-flash-latest',
        promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
      };
    }
  }

   try {
    const configDoc = await firestore.collection('aiConfiguration').doc('dreamPromptSettings').get();

    // Get active AI models to find a suitable default
    const activeModels = await getActiveAIModels();
    const defaultModel = activeModels.length > 0 ? activeModels[0].id : DEFAULT_DREAM_MODEL;

    if (configDoc.exists) {
      const configData = configDoc.data()!;
      const model = (configData.model && typeof configData.model === 'string' && configData.model.trim() !== '')
        ? configData.model
        : defaultModel;
      const promptTemplate = (configData.promptTemplate && typeof configData.promptTemplate === 'string' && configData.promptTemplate.trim() !== '')
        ? configData.promptTemplate
        : DEFAULT_DREAM_PROMPT_TEMPLATE;

      console.log("꿈 해몽 프롬프트 설정을 Firestore에서 불러왔습니다.");
      return { model, promptTemplate };
    }
  } catch (error) {
    console.error("Firestore에서 꿈 해몽 프롬프트 설정을 불러오는 중 오류 발생. 기본값을 사용합니다.", error);
  }
  
  // Try to get active models as fallback
  try {
    const activeModels = await getActiveAIModels();
    // Prefer Gemini models if available
    const geminiModel = activeModels.find(m => m.provider === 'gemini' || m.provider === 'googleai');
    const openaiModel = activeModels.find(m => m.provider === 'openai');
    const fallbackModel = geminiModel ? geminiModel.id : (openaiModel ? openaiModel.id : (activeModels.length > 0 ? activeModels[0].id : DEFAULT_DREAM_MODEL));
    return {
      model: fallbackModel,
      promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
    };
  } catch {
    // Use Gemini as absolute fallback
    return {
      model: 'googleai/gemini-1.5-flash-latest',
      promptTemplate: DEFAULT_DREAM_PROMPT_TEMPLATE,
    };
  }
}
