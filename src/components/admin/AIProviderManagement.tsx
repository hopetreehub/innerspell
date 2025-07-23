'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, Eye, EyeOff, TestTube, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { AIProviderConfig, AIProvider, AIFeatureMapping } from '@/types';
import { 
  getAllAIProviderConfigs, 
  deleteAIProviderConfig, 
  testAIProviderConnection,
  getAIFeatureMappings 
} from '@/actions/aiProviderActions';
import { AIProviderConfigForm } from './AIProviderConfigForm';
import { AIFeatureMappingForm } from './AIFeatureMappingForm';

interface AIProviderManagementProps {
  className?: string;
}

export function AIProviderManagement({ className }: AIProviderManagementProps) {
  const [providers, setProviders] = useState<Array<AIProviderConfig & { maskedApiKey: string }>>([]);
  const [featureMappings, setFeatureMappings] = useState<AIFeatureMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providerConfigs, mappings] = await Promise.all([
        getAllAIProviderConfigs(),
        getAIFeatureMappings()
      ]);
      
      if (providerConfigs.success) {
        setProviders(providerConfigs.data?.map(config => ({
          ...config,
          maskedApiKey: config.apiKey
        })) || []);
      }
      
      if (mappings.success) {
        setFeatureMappings(mappings.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('AI 공급자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    try {
      const providerConfig = providers.find(p => p.provider === provider);
      if (!providerConfig) return;
      
      const result = await testAIProviderConnection(provider, providerConfig.apiKey, providerConfig.baseUrl);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('연결 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDeleteProvider = async (provider: AIProvider) => {
    if (!confirm(`${provider} 공급자 설정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await deleteAIProviderConfig(provider);
      
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('공급자 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'gemini': return '💎';
      case 'grok': return '🚀';
      case 'openrouter': return '🔀';
      case 'huggingface': return '🤗';
      default: return '⚡';
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return 'bg-green-500';
      case 'gemini': return 'bg-blue-500';
      case 'grok': return 'bg-purple-500';
      case 'openrouter': return 'bg-orange-500';
      case 'huggingface': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">AI 공급자</TabsTrigger>
          <TabsTrigger value="mappings">기능 매핑</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI 공급자 설정</h3>
            <Button 
              onClick={() => {
                setEditingProvider(null);
                setShowConfigForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              공급자 추가
            </Button>
          </div>

          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.provider} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getProviderColor(provider.provider)} flex items-center justify-center text-white font-bold`}>
                        {getProviderIcon(provider.provider)}
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{provider.provider}</CardTitle>
                        <CardDescription>
                          {provider.models.length}개 모델 • {provider.isActive ? '활성' : '비활성'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                        {provider.isActive ? '활성' : '비활성'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(provider.provider)}
                        disabled={testingProvider === provider.provider}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        {testingProvider === provider.provider ? '테스트 중...' : '테스트'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProvider(provider.provider);
                          setShowConfigForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.provider)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API 키:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {showApiKeys[provider.provider] 
                            ? provider.maskedApiKey || '••••••••••••••••' 
                            : '••••••••••••••••'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(provider.provider)}
                          className="h-6 w-6 p-0"
                        >
                          {showApiKeys[provider.provider] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {provider.baseUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Base URL:</span>
                        <span className="text-sm text-muted-foreground">{provider.baseUrl}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">모델:</span>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.slice(0, 3).map((model) => (
                          <Badge key={model.id} variant="outline" className="text-xs">
                            {model.name}
                          </Badge>
                        ))}
                        {provider.models.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.models.length - 3}개 더
                          </Badge>
                        )}
                      </div>
                    </div>

                    {(provider as any).organizationId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">조직:</span>
                        <span className="text-sm text-muted-foreground">{(provider as any).organizationId}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">마지막 업데이트:</span>
                      <span className="text-sm text-muted-foreground">
                        {provider.updatedAt ? new Date(provider.updatedAt).toLocaleDateString() : '없음'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {providers.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI 공급자가 설정되지 않았습니다</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    AI 기능을 사용하려면 첫 번째 AI 공급자를 추가하세요
                  </p>
                  <Button onClick={() => setShowConfigForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    공급자 추가
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">기능 매핑</h3>
            <Button 
              onClick={() => setShowMappingForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              매핑 추가
            </Button>
          </div>

          <div className="grid gap-4">
            {featureMappings.map((mapping) => (
              <Card key={mapping.feature}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {mapping.feature.replace('-', ' ')}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {mapping.provider}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">모델:</span>
                      <span className="text-sm">{mapping.modelId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">우선순위:</span>
                      <span className="text-sm">{mapping.priority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">활성:</span>
                      <span className="text-sm">{mapping.isActive ? '예' : '아니오'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {featureMappings.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">기능 매핑이 없습니다</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    다양한 기능에 사용할 AI 모델을 설정하세요
                  </p>
                  <Button onClick={() => setShowMappingForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    매핑 추가
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showConfigForm && (
        <AIProviderConfigForm
          editingProvider={editingProvider}
          onClose={() => {
            setShowConfigForm(false);
            setEditingProvider(null);
          }}
          onSave={() => {
            setShowConfigForm(false);
            setEditingProvider(null);
            loadData();
          }}
        />
      )}

      {showMappingForm && (
        <AIFeatureMappingForm
          providers={providers}
          onClose={() => setShowMappingForm(false)}
          onSave={() => {
            setShowMappingForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}