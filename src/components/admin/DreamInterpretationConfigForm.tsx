
'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  configureDreamPromptSettings,
  ConfigureDreamPromptSettingsInput,
} from '@/ai/flows/configure-dream-prompt-settings';

const DEFAULT_PROMPT = `[SYSTEM INSTRUCTIONS START]
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

const FormSchema = z.object({
  model: z.string().min(1, { message: 'AI 모델을 선택해주세요.' }),
  promptTemplate: z.string().min(10, {
    message: "프롬프트 템플릿은 최소 10자 이상이어야 합니다.",
  }),
});

export function DreamInterpretationConfigForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; provider: string }[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  
  // Use static model list instead of fetching from getActiveAIModels to avoid dependency issues
  useEffect(() => {
    const defaultModels = [
      { id: 'googleai/gemini-1.5-pro', name: 'Gemini 1.5 Pro (Google AI)', provider: 'googleai' },
      { id: 'googleai/gemini-1.5-flash', name: 'Gemini 1.5 Flash (Google AI)', provider: 'googleai' },
      { id: 'googleai/gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro Latest (Google AI)', provider: 'googleai' },
      { id: 'googleai/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash Latest (Google AI)', provider: 'googleai' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)', provider: 'openai' },
      { id: 'openai/gpt-4', name: 'GPT-4 (OpenAI)', provider: 'openai' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'openai' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)', provider: 'openai' },
      { id: 'anthropic/claude-3-haiku-20240307', name: 'Claude 3 Haiku (Anthropic)', provider: 'anthropic' },
      { id: 'anthropic/claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (Anthropic)', provider: 'anthropic' },
      { id: 'anthropic/claude-3-opus-20240229', name: 'Claude 3 Opus (Anthropic)', provider: 'anthropic' }
    ];
    
    console.log('[DreamInterpretationConfigForm] Using static model list:', defaultModels);
    setAvailableModels(defaultModels);
    setModelsLoading(false);
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model: availableModels.length > 0 ? availableModels[0].id : '',
      promptTemplate: DEFAULT_PROMPT,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    try {
      const result = await configureDreamPromptSettings(data);
      
      toast({
        variant: result.success ? 'default' : 'destructive',
        title: result.success ? '성공' : '오류',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error?.message || '설정 업데이트에 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-foreground/90">
                AI 모델 선택
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={modelsLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={modelsLoading ? "모델 목록 로딩중..." : "AI 모델을 선택하세요"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                꿈 해몽에 사용할 AI 모델을 선택합니다. Pro 모델은 더 높은 품질의 결과를 제공합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="promptTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-foreground/90">
                꿈 해몽 프롬프트 템플릿
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="AI 꿈 해몽 프롬프트 템플릿을 입력하세요…"
                  className="min-h-[300px] bg-background/70 text-sm leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                &#96;{"{{{dreamDescription}}}"}&#96;, &#96;{"{{{clarifications}}}"}&#96;, &#96;{"{{{sajuInfo}}}"}&#96;와 같은 플레이스홀더(placeholder)를 사용하여 AI가 동적으로 내용을 채울 수 있도록 하세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {loading ? '저장 중…' : '꿈 해몽 AI 설정 저장'}
        </Button>
      </form>
    </Form>
  );
}
