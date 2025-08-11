'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Heart, 
  Target, 
  Moon, 
  Zap,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 스타일 정보
const TAROT_STYLES = [
  {
    id: 'traditional-rws',
    name: '고전적 해석',
    icon: BookOpen,
    description: '웨이트 전통의 정통 해석',
    keywords: ['격식', '신비', '전통'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    example: '이 카드는 고대로부터 전해진 지혜를 담고 있습니다...'
  },
  {
    id: 'thoth-crowley',
    name: '토트 크로울리',
    icon: Sparkles,
    description: '카발라와 점성술의 심오한 분석',
    keywords: ['학술적', '에소테릭', '심오함'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    example: '화성의 에너지가 빈트리의 세피로트와 만나며...'
  },
  {
    id: 'psychological-jungian',
    name: '심리학적 해석',
    icon: Brain,
    description: '융의 분석심리학 기반 내면 탐구',
    keywords: ['무의식', '원형', '개성화'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    example: '당신의 무의식에 잠재된 그림자 원형이...'
  },
  {
    id: 'spiritual-growth',
    name: '영적 성장',
    icon: Heart,
    description: '사랑과 지혜의 영성 가이드',
    keywords: ['따뜻함', '격려', '성장'],
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    example: '이 순간은 당신의 영혼이 한 단계 도약하는...'
  },
  {
    id: 'practical-action',
    name: '실용적 조언',
    icon: Target,
    description: '구체적이고 실행 가능한 가이드',
    keywords: ['명확함', '실용성', '행동'],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    example: '다음 3가지를 실천하세요: 1)... 2)... 3)...'
  },
  {
    id: 'shadow-work',
    name: '그림자 작업',
    icon: Moon,
    description: '억압된 무의식과의 대면',
    keywords: ['도전적', '직면', '통합'],
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    example: '당신이 회피하고 있는 진실은...'
  },
  {
    id: 'realistic-insight',
    name: '현실적 통찰',
    icon: Zap,
    description: '직설적이고 현실적인 분석',
    keywords: ['직설적', '현실적', '객관적'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    example: '솔직히 말하면, 이 상황은 쉽지 않습니다...'
  }
];

interface StyleSelectorProps {
  selectedStyle?: string;
  onStyleSelect: (styleId: string) => void;
  disabled?: boolean;
}

export default function StyleSelector({ 
  selectedStyle = 'traditional-rws', 
  onStyleSelect,
  disabled = false 
}: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">해석 스타일 선택</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>각 스타일은 고유한 관점과 언어로 타로를 해석합니다. 
              당신의 현재 상황과 필요에 가장 적합한 스타일을 선택하세요.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TAROT_STYLES.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;
          
          return (
            <Card
              key={style.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? `ring-2 ring-offset-2 ring-${style.color} ${style.borderColor}` 
                  : 'hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onStyleSelect(style.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${style.bgColor}`}>
                      <Icon className={`h-5 w-5 ${style.color}`} />
                    </div>
                    <CardTitle className="text-base">{style.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      선택됨
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-2">
                  {style.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1 mb-2">
                  {style.keywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "{style.example}"
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedStyle && (
        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            💡 선택하신 <strong>{TAROT_STYLES.find(s => s.id === selectedStyle)?.name}</strong> 스타일로 
            타로 카드를 해석합니다. 질문 입력 시 자동으로 적용됩니다.
          </p>
        </div>
      )}
    </div>
  );
}