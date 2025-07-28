'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AIProvider, 
  AIProviderFormData, 
  AIProviderFormSchema,
  PROVIDER_MODELS
} from '@/types';
import { 
  saveAIProviderConfig, 
  getAIProviderConfig, 
  testAIProviderConnection 
} from '@/actions/aiProviderActions';

interface AIProviderConfigFormProps {
  editingProvider?: AIProvider | null;
  onClose: () => void;
  onSave: () => void;
}

const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 및 기타 OpenAI 모델에 접근',
    website: 'https://openai.com',
    keyFormat: 'sk-...',
    requiresOrganization: true,
    icon: '🤖',
    color: 'bg-green-500',
    features: ['GPT-4 Turbo', 'Vision API', 'Function Calling', 'DALL-E 3'],
    pricing: '$0.01 ~ $0.03 / 1K 토큰',
    keyGuide: 'https://platform.openai.com/api-keys',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini Pro, Flash 및 기타 Google AI 모델에 접근',
    website: 'https://ai.google.dev',
    keyFormat: 'AI...',
    requiresOrganization: false,
    icon: '💎',
    color: 'bg-blue-500',
    features: ['Gemini Pro', 'Gemini Flash', 'Vision 지원', '무료 티어 제공'],
    pricing: '무료 ~ $0.002 / 1K 토큰',
    keyGuide: 'https://makersuite.google.com/app/apikey',
  },
  googleai: {
    name: 'Google AI Studio',
    description: '최신 Gemini 1.5 Pro/Flash 모델 사용',
    website: 'https://ai.google.dev',
    keyFormat: 'AIza...',
    requiresOrganization: false,
    icon: '🌟',
    color: 'bg-indigo-500',
    features: ['Gemini 1.5 Pro', '2M 토큰 컨텍스트', '최첨단 Vision', '무료 사용'],
    pricing: '무료 ~ $0.001 / 1K 토큰',
    keyGuide: 'https://aistudio.google.com/app/apikey',
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Claude 3 Opus, Sonnet, Haiku 모델 사용',
    website: 'https://anthropic.com',
    keyFormat: 'sk-ant-...',
    requiresOrganization: false,
    icon: '🧠',
    color: 'bg-violet-500',
    features: ['Claude 3 Opus', '200K 토큰', 'Vision 지원', '안전성 우선'],
    pricing: '$0.00025 ~ $0.015 / 1K 토큰',
    keyGuide: 'https://console.anthropic.com/settings/keys',
  },
  grok: {
    name: 'xAI Grok',
    description: 'Grok 및 기타 xAI 모델에 접근',
    website: 'https://x.ai',
    keyFormat: 'xai-...',
    requiresOrganization: false,
    icon: '🚀',
    color: 'bg-purple-500',
    features: ['Grok-2', 'Grok-2 mini', '실시간 정보', 'X 연동'],
    pricing: '$2.00 ~ $5.00 / 1K 토큰',
    keyGuide: 'https://x.ai/api',
  },
  openrouter: {
    name: 'OpenRouter',
    description: '여러 AI 모델을 하나의 API로 사용',
    website: 'https://openrouter.ai',
    keyFormat: 'sk-or-...',
    requiresOrganization: false,
    icon: '🔀',
    color: 'bg-orange-500',
    features: ['다중 모델 지원', '자동 라우팅', '통합 결제', '모델 비교'],
    pricing: '모델별 상이',
    keyGuide: 'https://openrouter.ai/keys',
  },
  huggingface: {
    name: 'Hugging Face',
    description: '오픈소스 모델에 접근',
    website: 'https://huggingface.co',
    keyFormat: 'hf_...',
    requiresOrganization: false,
    icon: '🤗',
    color: 'bg-yellow-500',
    features: ['Llama 2', 'Mistral', 'Falcon', '무료 인프런스'],
    pricing: '무료 ~ $0.001 / 1K 토큰',
    keyGuide: 'https://huggingface.co/settings/tokens',
  },
};

export function AIProviderConfigForm({ editingProvider, onClose, onSave }: AIProviderConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidation, setKeyValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const form = useForm<AIProviderFormData>({
    resolver: zodResolver(AIProviderFormSchema),
    defaultValues: {
      provider: 'openai',
      apiKey: '',
      baseUrl: '',
      isActive: true,
      maxRequestsPerMinute: 60,
      selectedModels: [],
    },
  });

  const selectedProvider = form.watch('provider');
  const apiKey = form.watch('apiKey');
  const providerInfo = PROVIDER_INFO[selectedProvider];

  useEffect(() => {
    if (editingProvider) {
      loadProviderConfig();
    }
  }, [editingProvider]);

  useEffect(() => {
    // Simple API key validation
    if (apiKey) {
      const isValid = apiKey.length > 10; // Basic validation
      setKeyValidation({
        isValid,
        message: isValid ? 'API 키 형식이 유효합니다' : 'API 키 형식이 올바르지 않습니다'
      });
    } else {
      setKeyValidation(null);
    }
  }, [apiKey, selectedProvider]);

  const loadProviderConfig = async () => {
    if (!editingProvider) return;

    try {
      setLoading(true);
      const result = await getAIProviderConfig(editingProvider);
      if (result.success && result.data) {
        const config = result.data;
        form.reset({
          provider: config.provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || '',
          isActive: config.isActive,
          maxRequestsPerMinute: config.maxRequestsPerMinute,
          selectedModels: config.models.map(m => m.id),
        });
      }
    } catch (error) {
      console.error('Error loading provider config:', error);
      toast.error('공급자 설정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AIProviderFormData) => {
    try {
      setLoading(true);
      const result = await saveAIProviderConfig(data);
      
      if (result.success) {
        toast.success(result.message);
        onSave();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving provider config:', error);
      toast.error('공급자 설정을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const currentData = form.getValues();
    
    if (!currentData.apiKey) {
      toast.error('먼저 API 키를 입력해주세요.');
      return;
    }

    try {
      setValidatingKey(true);
      const result = await testAIProviderConnection(currentData.provider, currentData.apiKey, currentData.baseUrl);
      
      setKeyValidation({
        isValid: result.success,
        message: result.message
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      setKeyValidation({
        isValid: false,
        message: '연결 테스트에 실패했습니다'
      });
      toast.error('연결 테스트에 실패했습니다.');
    } finally {
      setValidatingKey(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProvider ? 'AI 공급자 편집' : 'AI 공급자 추가'}
          </DialogTitle>
          <DialogDescription>
            애플리케이션 기능에 사용할 AI 공급자를 설정합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">공급자</Label>
              <select
                id="provider"
                {...form.register('provider')}
                disabled={!!editingProvider}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.provider && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.provider.message}
                </p>
              )}
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-8 h-8 ${providerInfo.color} rounded-full flex items-center justify-center text-white text-lg`}>
                    {providerInfo.icon}
                  </div>
                  {providerInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {providerInfo.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">🌟 주요 기능</h4>
                    <ul className="space-y-1">
                      {providerInfo.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="text-green-500">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">💰 가격</h4>
                    <p className="text-xs text-muted-foreground">{providerInfo.pricing}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {PROVIDER_MODELS[selectedProvider].length}개 모델
                  </Badge>
                  <a
                    href={providerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    웹사이트 <span className="text-xs">↗</span>
                  </a>
                  <a
                    href={providerInfo.keyGuide}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    API 키 받기 <span className="text-xs">↗</span>
                  </a>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs font-semibold mb-1">API 키 형식</p>
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                    {providerInfo.keyFormat}
                  </code>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="apiKey">API 키</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  {...form.register('apiKey')}
                  placeholder="API 키를 입력하세요"
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {keyValidation && (
                    <div className="flex items-center">
                      {keyValidation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 w-8 p-0"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {keyValidation && (
                <p className={`text-sm mt-1 ${keyValidation.isValid ? 'text-green-600' : 'text-destructive'}`}>
                  {keyValidation.message}
                </p>
              )}
              {form.formState.errors.apiKey && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.apiKey.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="baseUrl">Base URL (선택사항)</Label>
              <Input
                id="baseUrl"
                {...form.register('baseUrl')}
                placeholder="https://api.openrouter.ai/api/v1"
              />
              {form.formState.errors.baseUrl && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.baseUrl.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="maxRequestsPerMinute">분당 최대 요청 수</Label>
              <Input
                id="maxRequestsPerMinute"
                type="number"
                {...form.register('maxRequestsPerMinute', { valueAsNumber: true })}
                placeholder="60"
                min="1"
                max="1000"
              />
              {form.formState.errors.maxRequestsPerMinute && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.maxRequestsPerMinute.message}
                </p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <span>🤖</span> 사용할 모델 선택
              </Label>
              <div className="space-y-3 mt-3">
                {PROVIDER_MODELS[selectedProvider].map((model) => {
                  const isSelected = form.watch('selectedModels')?.includes(model.id);
                  return (
                    <div 
                      key={model.id} 
                      className={`border rounded-lg p-3 transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={`model-${model.id}`}
                          value={model.id}
                          {...form.register('selectedModels')}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`model-${model.id}`} 
                            className="text-sm font-semibold cursor-pointer flex items-center gap-2"
                          >
                            {model.name}
                            {model.capabilities?.includes('vision') && 
                              <Badge variant="outline" className="text-xs">👁️ Vision</Badge>
                            }
                            {model.capabilities?.includes('function-calling') && 
                              <Badge variant="outline" className="text-xs">🔧 Functions</Badge>
                            }
                          </Label>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              📝 {model.maxTokens?.toLocaleString()} 토큰
                            </span>
                            {model.costPer1kTokens && (
                              <span className="text-xs text-muted-foreground">
                                💰 ${model.costPer1kTokens}/1K
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.selectedModels && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.selectedModels.message}
                </p>
              )}
            </div>


            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">이 공급자 활성화</Label>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={loading || validatingKey || !apiKey}
            >
              {validatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              연결 테스트
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProvider ? '업데이트' : '추가'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}