'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings, 
  Sparkles,
  Clock,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TarotGuideline, 
  TarotSpread, 
  InterpretationStyle,
  SpreadStyleCombination 
} from '@/types/tarot-guidelines';
import { 
  getAllTarotGuidelines,
  saveTarotGuideline,
  updateTarotGuideline,
  deleteTarotGuideline,
  toggleGuidelineStatus,
  getGuidelineBySpreadAndStyle
} from '@/actions/tarotGuidelineActions';

interface TarotGuidelineManagementProps {
  className?: string;
}

export function TarotGuidelineManagement({ className }: TarotGuidelineManagementProps) {
  const [guidelines, setGuidelines] = useState<TarotGuideline[]>([]);
  const [spreads, setSpreads] = useState<TarotSpread[]>([]);
  const [styles, setStyles] = useState<InterpretationStyle[]>([]);
  const [combinations, setCombinations] = useState<SpreadStyleCombination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpread, setSelectedSpread] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedGuideline, setSelectedGuideline] = useState<TarotGuideline | null>(null);
  const [showGuidelineForm, setShowGuidelineForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAllTarotGuidelines();
      
      if (result.success && result.data) {
        setGuidelines(result.data.guidelines);
        setSpreads(result.data.spreads);
        setStyles(result.data.styles);
        setCombinations(result.data.combinations);
      } else {
        toast.error(result.message || '타로 지침 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading tarot guidelines:', error);
      toast.error('타로 지침 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpreadStyleSelect = async () => {
    if (!selectedSpread || !selectedStyle) return;
    
    try {
      const result = await getGuidelineBySpreadAndStyle(selectedSpread, selectedStyle);
      if (result.success && result.data) {
        setSelectedGuideline(result.data);
      } else {
        toast.info('해당 조합의 지침이 아직 없습니다. 새로 만들어보세요!');
        setSelectedGuideline(null);
      }
    } catch (error) {
      console.error('Error fetching guideline:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleGuidelineStatus(id, !currentStatus);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteGuideline = async (id: string) => {
    if (!confirm('정말로 이 지침을 삭제하시겠습니까?')) return;
    
    try {
      const result = await deleteTarotGuideline(id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  const getSpreadName = (spreadId: string) => {
    return spreads.find(s => s.id === spreadId)?.name || spreadId;
  };

  const getStyleName = (styleId: string) => {
    return styles.find(s => s.id === styleId)?.name || styleId;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredGuidelines = guidelines.filter(guideline =>
    guideline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guideline.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSpreadName(guideline.spreadId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStyleName(guideline.styleId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="browser" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browser">지침 탐색</TabsTrigger>
          <TabsTrigger value="management">지침 관리</TabsTrigger>
          <TabsTrigger value="analytics">통계 및 분석</TabsTrigger>
        </TabsList>

        {/* 지침 탐색 탭 */}
        <TabsContent value="browser" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">타로 지침 탐색</h3>
            <Button 
              onClick={() => setShowGuidelineForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              새 지침 생성
            </Button>
          </div>

          {/* 스프레드 및 스타일 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                스프레드 & 해석 스타일 조합
              </CardTitle>
              <CardDescription>
                원하는 스프레드와 해석 스타일을 선택하여 맞춤 지침을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spread-select">타로 스프레드</Label>
                  <Select value={selectedSpread} onValueChange={setSelectedSpread}>
                    <SelectTrigger>
                      <SelectValue placeholder="스프레드를 선택하세요" />
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
                  <Label htmlFor="style-select">해석 스타일</Label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="해석 스타일을 선택하세요" />
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
              
              <Button 
                onClick={handleSpreadStyleSelect}
                disabled={!selectedSpread || !selectedStyle}
                className="w-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                지침 찾기
              </Button>
            </CardContent>
          </Card>

          {/* 선택된 지침 표시 */}
          {selectedGuideline && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {selectedGuideline.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getDifficultyColor(selectedGuideline.difficulty)} text-white`}>
                      {selectedGuideline.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedGuideline.estimatedTime}분
                    </Badge>
                  </div>
                </div>
                <CardDescription>{selectedGuideline.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* 전반적 접근법 */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        전반적 접근법
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedGuideline.generalApproach}</p>
                    </div>

                    {/* 핵심 포커스 영역 */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        핵심 포커스 영역
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedGuideline.keyFocusAreas.map((area, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 포지션별 지침 */}
                    <div>
                      <h4 className="font-semibold mb-2">포지션별 상세 지침</h4>
                      <div className="space-y-4">
                        {selectedGuideline.positionGuidelines.map((position, index) => (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardContent className="pt-4">
                              <h5 className="font-medium mb-2">{position.positionName}</h5>
                              <p className="text-sm text-muted-foreground mb-3">{position.interpretationFocus}</p>
                              
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-primary">핵심 질문들:</span>
                                  <ul className="text-xs text-muted-foreground mt-1">
                                    {position.keyQuestions.map((question, qIndex) => (
                                      <li key={qIndex}>• {question}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {position.styleSpecificNotes && (
                                  <div>
                                    <span className="text-xs font-medium text-primary">스타일별 특이사항:</span>
                                    <p className="text-xs text-muted-foreground mt-1">{position.styleSpecificNotes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* 해석 팁 */}
                    <div>
                      <h4 className="font-semibold mb-2">해석 팁</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedGuideline.interpretationTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 주의사항 */}
                    <div>
                      <h4 className="font-semibold mb-2">피해야 할 실수들</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedGuideline.commonPitfalls.map((pitfall, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500">⚠</span>
                            {pitfall}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 지침 관리 탭 */}
        <TabsContent value="management" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">지침 관리</h3>
            <Input
              placeholder="지침 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="grid gap-4">
            {filteredGuidelines.map((guideline) => (
              <Card key={guideline.id} className="relative">
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
                        onClick={() => handleToggleStatus(guideline.id, guideline.isActive)}
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
                        onClick={() => {
                          setSelectedGuideline(guideline);
                          setShowGuidelineForm(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGuideline(guideline.id)}
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
            ))}

            {filteredGuidelines.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">지침이 없습니다</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    아직 타로 지침이 없습니다. 첫 번째 지침을 만들어보세요.
                  </p>
                  <Button onClick={() => setShowGuidelineForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    지침 생성
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* 통계 및 분석 탭 */}
        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">통계 및 분석</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{guidelines.length}</p>
                    <p className="text-xs text-muted-foreground">총 지침 수</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{spreads.length}</p>
                    <p className="text-xs text-muted-foreground">스프레드 종류</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{styles.length}</p>
                    <p className="text-xs text-muted-foreground">해석 스타일</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {guidelines.filter(g => g.isActive).length}
                    </p>
                    <p className="text-xs text-muted-foreground">활성 지침</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 난이도별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>난이도별 지침 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
                  const count = guidelines.filter(g => g.difficulty === difficulty).length;
                  const percentage = guidelines.length > 0 ? (count / guidelines.length) * 100 : 0;
                  return (
                    <div key={difficulty} className="flex items-center gap-4">
                      <span className="w-16 text-sm capitalize">{difficulty}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${getDifficultyColor(difficulty)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{count}개</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}