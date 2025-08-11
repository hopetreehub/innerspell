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
    description: 'Access GPT-4, GPT-3.5, and other OpenAI models',
    website: 'https://openai.com',
    keyFormat: 'sk-...',
    requiresOrganization: true,
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Access Gemini Pro, Flash, and other Google AI models',
    website: 'https://ai.google.dev',
    keyFormat: 'AI...',
    requiresOrganization: false,
  },
  grok: {
    name: 'xAI Grok',
    description: 'Access Grok and other xAI models',
    website: 'https://x.ai',
    keyFormat: 'xai-...',
    requiresOrganization: false,
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Access multiple AI models through OpenRouter',
    website: 'https://openrouter.ai',
    keyFormat: 'sk-or-...',
    requiresOrganization: false,
  },
  huggingface: {
    name: 'Hugging Face',
    description: 'Access open-source models from Hugging Face',
    website: 'https://huggingface.co',
    keyFormat: 'hf_...',
    requiresOrganization: false,
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    {providerInfo.name.charAt(0)}
                  </div>
                  {providerInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {providerInfo.description}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">
                    {PROVIDER_MODELS[selectedProvider].length}개 모델 사용 가능
                  </Badge>
                  <a
                    href={providerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    웹사이트 방문
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  예상되는 API 키 형식: <code className="bg-muted px-1 py-0.5 rounded">
                    {providerInfo.keyFormat}
                  </code>
                </p>
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
              <Label>사용할 모델 선택</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PROVIDER_MODELS[selectedProvider].map((model) => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`model-${model.id}`}
                      value={model.id}
                      {...form.register('selectedModels')}
                      className="rounded border-gray-300"
                    />
                    <Label 
                      htmlFor={`model-${model.id}`} 
                      className="text-sm cursor-pointer"
                    >
                      {model.name}
                    </Label>
                  </div>
                ))}
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