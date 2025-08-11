'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit3, Trash2, Clock, Users } from 'lucide-react';
import { TarotGuideline } from '@/types/tarot-guidelines';

interface TarotGuidelineCardProps {
  guideline: TarotGuideline;
  getSpreadName: (spreadId: string) => string;
  getStyleName: (styleId: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onEdit: (guideline: TarotGuideline) => void;
  onDelete: (id: string) => void;
}

export const TarotGuidelineCard = memo(function TarotGuidelineCard({
  guideline,
  getSpreadName,
  getStyleName,
  getDifficultyColor,
  onToggleStatus,
  onEdit,
  onDelete
}: TarotGuidelineCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <CardTitle className="text-lg">{guideline.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {getSpreadName(guideline.spreadId)} × {getStyleName(guideline.styleId)}
                <Badge className={`${getDifficultyColor(guideline.difficulty)} text-white text-xs`}>
                  {guideline.difficulty}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(guideline.id, guideline.isActive)}
            >
              {guideline.isActive ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(guideline)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(guideline.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{guideline.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guideline.estimatedTime}분
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {guideline.positionGuidelines.length}개 포지션
          </span>
          <Badge variant={guideline.isActive ? 'default' : 'secondary'}>
            {guideline.isActive ? '활성' : '비활성'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});