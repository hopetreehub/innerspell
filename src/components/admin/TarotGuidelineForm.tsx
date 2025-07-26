'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Minus, 
  Save, 
  Eye, 
  Copy,
  Lightbulb,
  AlertTriangle,
  Target,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TarotGuideline, 
  TarotSpread, 
  InterpretationStyle,
  PositionGuideline,
  ExampleReading,
  ExampleCard
} from '@/types/tarot-guidelines';
import { saveTarotGuideline, updateTarotGuideline } from '@/actions/tarotGuidelineActions';

interface TarotGuidelineFormProps {
  spreads: TarotSpread[];
  styles: InterpretationStyle[];
  guideline?: TarotGuideline | null;
  onSave: () => void;
  onCancel: () => void;
}

export function TarotGuidelineForm({ 
  spreads, 
  styles, 
  guideline, 
  onSave, 
  onCancel 
}: TarotGuidelineFormProps) {
  const [formData, setFormData] = useState<Partial<TarotGuideline>>({
    spreadId: '',
    styleId: '',
    name: '',
    description: '',
    positionGuidelines: [],
    generalApproach: '',
    keyFocusAreas: [],
    interpretationTips: [],
    commonPitfalls: [],
    difficulty: 'beginner',
    estimatedTime: 15,
    isActive: true
  });

  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<InterpretationStyle | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guideline) {
      setFormData(guideline);
      const spread = spreads.find(s => s.id === guideline.spreadId);
      const style = styles.find(s => s.id === guideline.styleId);
      setSelectedSpread(spread || null);
      setSelectedStyle(style || null);
    }
  }, [guideline, spreads, styles]);

  useEffect(() => {
    if (formData.spreadId && formData.styleId) {
      const spread = spreads.find(s => s.id === formData.spreadId);
      const style = styles.find(s => s.id === formData.styleId);
      
      if (spread && style && !guideline) {
        // 자동으로 포지션 가이드라인 생성
        const positionGuidelines: PositionGuideline[] = spread.positions.map(position => ({
          positionId: position.id,
          positionName: position.name,
          interpretationFocus: '',
          keyQuestions: [''],
          styleSpecificNotes: '',
          timeframe: '',
          emotionalAspects: '',
          practicalAspects: ''
        }));

        setFormData(prev => ({
          ...prev,
          name: `${spread.name} - ${style.name}`,
          positionGuidelines
        }));
      }
    }
  }, [formData.spreadId, formData.styleId, spreads, styles, guideline]);

  const handleSpreadChange = (spreadId: string) => {
    const spread = spreads.find(s => s.id === spreadId);
    setSelectedSpread(spread || null);
    setFormData(prev => ({ ...prev, spreadId }));
  };

  const handleStyleChange = (styleId: string) => {
    const style = styles.find(s => s.id === styleId);
    setSelectedStyle(style || null);
    setFormData(prev => ({ ...prev, styleId }));
  };

  const addArrayItem = (field: keyof TarotGuideline, item: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[] || []), item]
    }));
  };

  const updateArrayItem = (field: keyof TarotGuideline, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: keyof TarotGuideline, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updatePositionGuideline = (index: number, field: keyof PositionGuideline, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      positionGuidelines: prev.positionGuidelines?.map((pg, i) => 
        i === index ? { ...pg, [field]: value } : pg
      ) || []
    }));
  };

  const addQuestionToPosition = (positionIndex: number) => {
    updatePositionGuideline(positionIndex, 'keyQuestions', [
      ...(formData.positionGuidelines?.[positionIndex]?.keyQuestions || []),
      ''
    ]);
  };

  const updatePositionQuestion = (positionIndex: number, questionIndex: number, value: string) => {
    const questions = [...(formData.positionGuidelines?.[positionIndex]?.keyQuestions || [])];
    questions[questionIndex] = value;
    updatePositionGuideline(positionIndex, 'keyQuestions', questions);
  };

  const removePositionQuestion = (positionIndex: number, questionIndex: number) => {
    const questions = (formData.positionGuidelines?.[positionIndex]?.keyQuestions || [])
      .filter((_, i) => i !== questionIndex);
    updatePositionGuideline(positionIndex, 'keyQuestions', questions);
  };

  const generateTemplate = () => {
    if (!selectedSpread || !selectedStyle) {
      toast.error('스프레드와 해석 스타일을 먼저 선택해주세요.');
      return;
    }

    const templateData = {
      ...formData,
      generalApproach: `${selectedStyle.name} 스타일에 따른 ${selectedSpread.name} 스프레드의 해석 접근법을 설명합니다.`,
      keyFocusAreas: [
        `${selectedStyle.approach} 접근법의 핵심 원리`,
        `${selectedSpread.name}의 구조적 특성 활용`,
        '각 포지션별 세부 분석',
        '전체적 메시지 통합'
      ],
      interpretationTips: [
        '각 카드의 기본 의미를 먼저 파악',
        '포지션별 특성을 고려한 해석',
        '전체적 스토리라인 구성',
        '클라이언트의 상황에 맞는 적용'
      ],
      commonPitfalls: [
        '개별 카드에만 집중하여 전체 메시지 놓치기',
        '포지션의 의미를 무시한 해석',
        '일관성 없는 해석 스타일',
        '추상적이고 모호한 조언'
      ]
    };

    setFormData(templateData);
    toast.success('템플릿이 생성되었습니다. 내용을 수정하여 완성해주세요.');
  };

  const handleSave = async () => {
    if (!formData.spreadId || !formData.styleId || !formData.name) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const saveData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let result;
      if (guideline?.id) {
        result = await updateTarotGuideline({ 
          id: guideline.id, 
          updates: saveData 
        });
      } else {
        result = await saveTarotGuideline({ 
          guideline: saveData as Omit<TarotGuideline, 'id'> 
        });
      }

      if (result.success) {
        toast.success(result.message);
        onSave();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving guideline:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {guideline ? '지침 수정' : '새 지침 생성'}
          </h2>
          <p className="text-muted-foreground">
            스프레드와 해석 스타일 조합별 상세 지침을 생성합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? '편집 모드' : '미리보기'}
          </Button>
          <Button 
            variant="outline" 
            onClick={generateTemplate}
            disabled={!selectedSpread || !selectedStyle}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            템플릿 생성
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 편집 영역 */}
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>타로 스프레드</Label>
                  <Select value={formData.spreadId} onValueChange={handleSpreadChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="스프레드 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {spreads.map((spread) => (
                        <SelectItem key={spread.id} value={spread.id}>
                          {spread.name} ({spread.cardCount}장)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>해석 스타일</Label>
                  <Select value={formData.styleId} onValueChange={handleStyleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="해석 스타일 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>지침 이름</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 삼위일체 - 전통 라이더-웨이트"
                />
              </div>

              <div>
                <Label>설명</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="이 지침의 특징과 적용 범위를 설명해주세요"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>난이도</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초급</SelectItem>
                      <SelectItem value="intermediate">중급</SelectItem>
                      <SelectItem value="advanced">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>예상 소요 시간 (분)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedTime || 15}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimatedTime: parseInt(e.target.value) || 15 
                    }))}
                    min={5}
                    max={60}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 전반적 접근법 */}
          <Card>
            <CardHeader>
              <CardTitle>전반적 접근법</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.generalApproach || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, generalApproach: e.target.value }))}
                placeholder="이 지침의 전반적인 해석 접근법을 설명해주세요"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 핵심 포커스 영역 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                핵심 포커스 영역
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.keyFocusAreas || []).map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={area}
                    onChange={(e) => updateArrayItem('keyFocusAreas', index, e.target.value)}
                    placeholder="핵심 포커스 영역"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('keyFocusAreas', index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('keyFocusAreas')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                포커스 영역 추가
              </Button>
            </CardContent>
          </Card>

          {/* 해석 팁 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-500" />
                해석 팁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.interpretationTips || []).map((tip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={tip}
                    onChange={(e) => updateArrayItem('interpretationTips', index, e.target.value)}
                    placeholder="유용한 해석 팁"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('interpretationTips', index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('interpretationTips')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                해석 팁 추가
              </Button>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                피해야 할 실수들
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(formData.commonPitfalls || []).map((pitfall, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={pitfall}
                    onChange={(e) => updateArrayItem('commonPitfalls', index, e.target.value)}
                    placeholder="피해야 할 실수나 함정"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('commonPitfalls', index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('commonPitfalls')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                주의사항 추가
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 미리보기/포지션 가이드라인 영역 */}
        <div className="space-y-6">
          {showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  미리보기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{formData.name}</h3>
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getDifficultyColor(formData.difficulty || 'beginner')} text-white`}>
                          {formData.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formData.estimatedTime}분
                        </Badge>
                      </div>
                    </div>
                    
                    {formData.generalApproach && (
                      <div>
                        <h4 className="font-medium mb-2">전반적 접근법</h4>
                        <p className="text-sm">{formData.generalApproach}</p>
                      </div>
                    )}
                    
                    {(formData.keyFocusAreas || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">핵심 포커스 영역</h4>
                        <ul className="text-sm space-y-1">
                          {formData.keyFocusAreas?.map((area, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(formData.interpretationTips || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-green-500" />
                          해석 팁
                        </h4>
                        <ul className="text-sm space-y-1">
                          {formData.interpretationTips?.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(formData.commonPitfalls || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          피해야 할 실수들
                        </h4>
                        <ul className="text-sm space-y-1">
                          {formData.commonPitfalls?.map((pitfall, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500">⚠</span>
                              {pitfall}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            /* 포지션별 가이드라인 */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  포지션별 가이드라인
                </CardTitle>
                <CardDescription>
                  각 카드 포지션별 상세 해석 지침을 작성해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {(formData.positionGuidelines || []).map((position, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{position.positionName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-xs">해석 포커스</Label>
                            <Textarea
                              value={position.interpretationFocus}
                              onChange={(e) => updatePositionGuideline(index, 'interpretationFocus', e.target.value)}
                              placeholder="이 포지션에서 중점적으로 봐야 할 부분"
                              rows={2}
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">핵심 질문들</Label>
                            <div className="space-y-2">
                              {(position.keyQuestions || []).map((question, qIndex) => (
                                <div key={qIndex} className="flex items-center gap-2">
                                  <Input
                                    value={question}
                                    onChange={(e) => updatePositionQuestion(index, qIndex, e.target.value)}
                                    placeholder="이 포지션에서 던져야 할 핵심 질문"
                                    className="text-sm"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePositionQuestion(index, qIndex)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addQuestionToPosition(index)}
                                className="w-full"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                질문 추가
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">스타일별 특이사항</Label>
                            <Textarea
                              value={position.styleSpecificNotes}
                              onChange={(e) => updatePositionGuideline(index, 'styleSpecificNotes', e.target.value)}
                              placeholder="이 해석 스타일에서 특별히 주의할 점"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.spreadId || !formData.styleId}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}