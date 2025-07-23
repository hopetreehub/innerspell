'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AIProviderConfig,
  AIFeatureMapping,
  AIFeature,
  PROVIDER_MODELS
} from '@/types';
import { saveAIFeatureMapping } from '@/actions/aiProviderActions';

interface AIFeatureMappingFormProps {
  providers: Array<AIProviderConfig & { maskedApiKey: string }>;
  mapping?: AIFeatureMapping | null;
  onClose: () => void;
  onSave: () => void;
}

const FEATURE_INFO = {
  'tarot-reading': {
    name: '타로 리딩',
    description: '상세한 타로 카드 해석을 생성합니다',
    icon: '🔮',
  },
  'dream-interpretation': {
    name: '꿈 해석',
    description: '꿈을 분석하고 해석합니다',
    icon: '💭',
  },
  'general-chat': {
    name: '일반 채팅',
    description: '일반적인 대화를 처리합니다',
    icon: '💬',
  },
};

export function AIFeatureMappingForm({ 
  providers, 
  mapping, 
  onClose, 
  onSave 
}: AIFeatureMappingFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<AIFeatureMapping>({
    defaultValues: {
      feature: mapping?.feature || 'tarot-reading',
      provider: mapping?.provider || 'openai',
      modelId: mapping?.modelId || '',
      isActive: mapping?.isActive ?? true,
      priority: mapping?.priority || 1,
    },
  });

  const watchedProvider = form.watch('provider');
  const watchedFeature = form.watch('feature');
  
  const activeProviders = providers.filter(p => p.isActive);
  const selectedProvider = activeProviders.find(p => p.provider === watchedProvider);
  const availableModels = selectedProvider?.models || PROVIDER_MODELS[watchedProvider] || [];
  const featureInfo = FEATURE_INFO[watchedFeature];

  useEffect(() => {
    // Set first available model when provider changes
    if (availableModels.length > 0 && !form.getValues('modelId')) {
      form.setValue('modelId', availableModels[0].id);
    }
  }, [watchedProvider, availableModels]);

  const onSubmit = async (data: AIFeatureMapping) => {
    try {
      setLoading(true);
      const result = await saveAIFeatureMapping([data]);
      
      if (result.success) {
        toast.success(result.message);
        onSave();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving feature mapping:', error);
      toast.error('기능 매핑 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mapping ? '기능 매핑 편집' : '기능 매핑 추가'}
          </DialogTitle>
          <DialogDescription>
            특정 기능에 사용할 AI 모델을 설정합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="feature">기능</Label>
              <select
                id="feature"
                {...form.register('feature')}
                disabled={!!mapping}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {Object.entries(FEATURE_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{featureInfo.icon}</span>
                  {featureInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {featureInfo.description}
                </p>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="provider">AI 공급자</Label>
              <select
                id="provider"
                {...form.register('provider')}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {activeProviders.map((provider) => (
                  <option key={provider.provider} value={provider.provider}>
                    {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="modelId">모델</Label>
              <select
                id="modelId"
                {...form.register('modelId')}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="priority">우선순위</Label>
              <Input
                id="priority"
                type="number"
                {...form.register('priority', { valueAsNumber: true })}
                placeholder="1"
                min="1"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                낮은 숫자가 높은 우선순위입니다
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">이 매핑 활성화</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mapping ? '업데이트' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}