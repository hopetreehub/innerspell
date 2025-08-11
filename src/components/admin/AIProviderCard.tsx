'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { AIProvider, AIProviderConfig } from '@/types/ai-providers';

interface AIProviderCardProps {
  provider: AIProviderConfig & { maskedApiKey?: string };
  showApiKey: boolean;
  testResult?: boolean;
  isTesting: boolean;
  onToggleApiKey: () => void;
  onTest: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getProviderIcon: (provider: AIProvider) => string;
  getProviderColor: (provider: AIProvider) => string;
}

export const AIProviderCard = memo(function AIProviderCard({
  provider,
  showApiKey,
  testResult,
  isTesting,
  onToggleApiKey,
  onTest,
  onEdit,
  onDelete,
  getProviderIcon,
  getProviderColor
}: AIProviderCardProps) {
  return (
    <Card className="relative">
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
            {testResult !== undefined && (
              <Badge 
                variant={testResult ? 'outline' : 'destructive'} 
                className={testResult ? 'text-green-600 border-green-600' : ''}
              >
                {testResult ? '✓ 연결됨' : '✗ 실패'}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onTest}
              disabled={isTesting}
            >
              <TestTube className="h-4 w-4 mr-1" />
              {isTesting ? '테스트 중...' : '테스트'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <span className="text-sm font-medium flex items-center gap-1">
              <span className="text-xs">🔑</span> API 키
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-background px-2 py-1 rounded border">
                {showApiKey 
                  ? provider.apiKey 
                  : (provider.maskedApiKey || '••••••••••••••••')
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleApiKey}
                className="h-6 w-6 p-0"
              >
                {showApiKey ? (
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <span className="text-xs">🤖</span> 모델
              </span>
              <Badge variant="secondary" className="text-xs">
                {provider.models.length}개 활성
              </Badge>
            </div>
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
  );
});