'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface EnvVariable {
  key: string;
  value: string;
  category: 'ai' | 'firebase' | 'system' | 'other';
  required: boolean;
  description: string;
  isSet: boolean;
}

const ENV_VARIABLES: Omit<EnvVariable, 'value' | 'isSet'>[] = [
  // AI 공급자
  { key: 'OPENAI_API_KEY', category: 'ai', required: false, description: 'OpenAI API 키 (GPT 모델용)' },
  { key: 'GEMINI_API_KEY', category: 'ai', required: false, description: 'Google Gemini API 키' },
  { key: 'GOOGLE_API_KEY', category: 'ai', required: false, description: 'Google AI API 키' },
  { key: 'ANTHROPIC_API_KEY', category: 'ai', required: false, description: 'Anthropic Claude API 키' },
  { key: 'GROK_API_KEY', category: 'ai', required: false, description: 'xAI Grok API 키' },
  { key: 'OPENROUTER_API_KEY', category: 'ai', required: false, description: 'OpenRouter API 키' },
  { key: 'HUGGINGFACE_API_KEY', category: 'ai', required: false, description: 'Hugging Face API 키' },
  
  // Firebase
  { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', category: 'firebase', required: true, description: 'Firebase API 키 (공개)' },
  { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', category: 'firebase', required: true, description: 'Firebase 인증 도메인' },
  { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', category: 'firebase', required: true, description: 'Firebase 프로젝트 ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', category: 'firebase', required: true, description: 'Firebase 스토리지 버킷' },
  { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', category: 'firebase', required: true, description: 'Firebase 메시징 센더 ID' },
  { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', category: 'firebase', required: true, description: 'Firebase 앱 ID' },
  
  // 시스템
  { key: 'ADMIN_EMAILS', category: 'system', required: true, description: '관리자 이메일 목록 (쉼표로 구분)' },
  { key: 'ENCRYPTION_KEY', category: 'system', required: true, description: '데이터 암호화 키' },
  { key: 'BLOG_API_SECRET_KEY', category: 'system', required: false, description: '블로그 API 비밀 키' },
  { key: 'NODE_ENV', category: 'system', required: true, description: '환경 설정 (production/development)' },
  
  // 기타
  { key: 'NEXT_PUBLIC_USE_REAL_AUTH', category: 'other', required: false, description: '실제 인증 사용 여부' },
  { key: 'VERCEL_URL', category: 'other', required: false, description: 'Vercel 배포 URL' },
];

export function EnvironmentManager() {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnvironmentVariables();
  }, []);

  const loadEnvironmentVariables = () => {
    // 클라이언트에서는 NEXT_PUBLIC_ 변수만 접근 가능
    const vars: EnvVariable[] = ENV_VARIABLES.map(envDef => {
      let value = '';
      let isSet = false;
      
      // NEXT_PUBLIC_ 변수는 클라이언트에서 확인 가능
      if (envDef.key.startsWith('NEXT_PUBLIC_')) {
        value = process.env[envDef.key] || '';
        isSet = !!value;
      } else {
        // 서버 전용 변수는 상태만 표시
        isSet = false; // 클라이언트에서는 확인 불가
        value = isSet ? '••••••••••••••••' : '';
      }
      
      return {
        ...envDef,
        value,
        isSet
      };
    });
    
    setEnvVars(vars);
  };

  const toggleValueVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다');
  };

  const generateEnvTemplate = () => {
    const template = ENV_VARIABLES
      .map(env => `# ${env.description}\n${env.key}=${env.required ? 'REQUIRED_VALUE' : 'OPTIONAL_VALUE'}`)
      .join('\n\n');
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local.template';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('환경변수 템플릿이 다운로드되었습니다');
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'ai': return 'bg-blue-100 text-blue-800';
      case 'firebase': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return '🤖';
      case 'firebase': return '🔥';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const filterByCategory = (category: string) => {
    return envVars.filter(env => env.category === category);
  };

  const getHealthStatus = () => {
    const requiredVars = envVars.filter(env => env.required);
    const setRequiredVars = requiredVars.filter(env => env.isSet);
    
    if (setRequiredVars.length === requiredVars.length) {
      return { status: 'healthy', message: '모든 필수 환경변수가 설정되었습니다' };
    } else {
      return { 
        status: 'warning', 
        message: `${requiredVars.length - setRequiredVars.length}개의 필수 환경변수가 누락되었습니다` 
      };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* 상태 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            환경변수 상태
          </CardTitle>
          <CardDescription>
            애플리케이션 환경변수 설정 상태를 확인합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {healthStatus.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className={healthStatus.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}>
                {healthStatus.message}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateEnvTemplate}>
                <Download className="h-4 w-4 mr-2" />
                템플릿 다운로드
              </Button>
              <Button variant="outline" size="sm" onClick={loadEnvironmentVariables}>
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 환경변수 */}
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">AI 공급자</TabsTrigger>
          <TabsTrigger value="firebase">Firebase</TabsTrigger>
          <TabsTrigger value="system">시스템</TabsTrigger>
          <TabsTrigger value="other">기타</TabsTrigger>
        </TabsList>

        {(['ai', 'firebase', 'system', 'other'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {filterByCategory(category).map((env) => (
                <Card key={env.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{getCategoryIcon(env.category)}</span>
                          <h3 className="font-medium">{env.key}</h3>
                          <div className="flex gap-1">
                            {env.required && (
                              <Badge variant="destructive" className="text-xs">
                                필수
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryBadgeColor(env.category)}`}
                            >
                              {env.category.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={env.isSet ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {env.isSet ? "설정됨" : "미설정"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {env.description}
                        </p>
                        
                        {env.key.startsWith('NEXT_PUBLIC_') && env.value && (
                          <div className="flex items-center gap-2">
                            <Input
                              value={showValues[env.key] ? env.value : '••••••••••••••••'}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleValueVisibility(env.key)}
                            >
                              {showValues[env.key] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(env.value)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {!env.key.startsWith('NEXT_PUBLIC_') && (
                          <div className="text-sm text-muted-foreground">
                            서버 전용 환경변수 - 클라이언트에서 접근 불가
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 도움말 */}
      <Card>
        <CardHeader>
          <CardTitle>환경변수 설정 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>로컬 개발:</strong> 프로젝트 루트에 <code>.env.local</code> 파일을 생성하세요.</p>
            <p><strong>Vercel 배포:</strong> Vercel 대시보드의 환경변수 설정에서 추가하세요.</p>
            <p><strong>보안:</strong> API 키와 같은 민감한 정보는 절대 Git에 커밋하지 마세요.</p>
            <p><strong>NEXT_PUBLIC_:</strong> 이 접두사가 있는 변수만 클라이언트에서 접근 가능합니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}