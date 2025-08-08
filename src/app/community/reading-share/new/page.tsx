'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Sparkles,
  Plus,
  X,
  Hash,
  CreditCard,
  Save,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { createReadingExperience } from '@/actions/readingExperienceActions';
import { ReadingExperienceFormSchema } from '@/types';
import { useAuth } from '@/context/AuthContext';

// 스프레드 타입 옵션
const spreadTypes = [
  { value: 'one-card', label: '원 카드' },
  { value: 'three-card', label: '3카드 스프레드' },
  { value: 'celtic-cross', label: '켈틱 크로스' },
  { value: 'relationship', label: '관계 스프레드' },
  { value: 'year-ahead', label: '연간 스프레드' },
  { value: 'custom', label: '커스텀 스프레드' }
];

// 추천 태그
const suggestedTags = [
  '첫리딩', '데일리카드', '연애운', '직업운', '재물운',
  '메이저아르카나', '리버스카드', '적중', '신기한경험'
];

export default function NewReadingSharePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    spreadType: '',
    content: '',
    cards: [] as string[],
    tags: [] as string[]
  });
  
  const [newCard, setNewCard] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 리딩 공유 데이터 자동 입력
  useEffect(() => {
    const pendingData = sessionStorage.getItem('pendingReadingShare');
    
    if (pendingData) {
      try {
        const readingData = JSON.parse(pendingData);
        
        // 자동 생성된 제목
        const autoTitle = `🔮 ${readingData.spreadName} 타로 리딩 경험!`;
        
        // 자동 생성된 내용
        const autoContent = `타로 리딩 경험을 공유합니다!

📋 **질문**: ${readingData.question}
🃏 **스프레드**: ${readingData.spreadName} (${readingData.spreadNumCards}장)
📅 **리딩 날짜**: ${new Date(readingData.timestamp).toLocaleDateString('ko-KR')}

🔗 **리딩 결과 보기**: ${readingData.shareUrl}

위 링크를 클릭하시면 제가 받은 실제 타로 리딩 결과를 볼 수 있어요!
정말 놀라운 해석이 나왔네요 ✨

여러분도 한번 확인해보시고 의견을 남겨주세요!`;

        // 스프레드 타입 매핑
        const spreadTypeMapping: { [key: string]: string } = {
          '삼위일체 조망': 'three-card',
          '상황-행동-결과': 'three-card', 
          '정신-몸-영혼': 'three-card',
          '십자 스프레드': 'custom',
          '관계 스프레드': 'relationship',
          '켈틱 크로스': 'celtic-cross'
        };

        // 폼 데이터 자동 설정
        setFormData({
          title: autoTitle,
          spreadType: spreadTypeMapping[readingData.spreadName] || 'custom',
          content: autoContent,
          cards: readingData.cards || [],
          tags: ['타로리딩', '타로경험', readingData.spreadName.replace(/\s+/g, '')]
        });

        // 세션 스토리지에서 데이터 제거
        sessionStorage.removeItem('pendingReadingShare');
        
        // 성공 토스트
        toast({
          title: '리딩 정보 자동 입력됨',
          description: '타로 리딩 정보가 자동으로 입력되었습니다. 내용을 확인하고 수정하세요.',
          duration: 5000,
        });

      } catch (error) {
        console.error('Failed to parse pending reading data:', error);
        // 에러 시 데이터 정리
        sessionStorage.removeItem('pendingReadingShare');
      }
    }
  }, [toast]);

  const handleAddCard = () => {
    if (newCard.trim() && !formData.cards.includes(newCard.trim())) {
      setFormData(prev => ({
        ...prev,
        cards: [...prev.cards, newCard.trim()]
      }));
      setNewCard('');
    }
  };

  const handleRemoveCard = (card: string) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c !== card)
    }));
  };

  const handleAddTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "리딩 경험을 공유하려면 먼저 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 폼 데이터 검증
      const validatedData = ReadingExperienceFormSchema.parse(formData);
      
      // Firebase에 저장
      const result = await createReadingExperience(validatedData, user.uid);
      
      if (result.success) {
        toast({
          title: "공유 완료!",
          description: "리딩 경험이 성공적으로 공유되었습니다.",
        });
        
        router.push('/community/reading-share');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      
      if (error instanceof Error) {
        toast({
          title: "오류 발생",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "오류 발생",
          description: "공유 중 문제가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <header className="text-center">
        <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">
          리딩 경험 공유하기
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          당신의 특별한 타로 리딩 경험을 다른 사람들과 나누어보세요
        </p>
      </header>

      {/* 뒤로가기 버튼 */}
      <div>
        <Button variant="ghost" asChild>
          <Link href="/community/reading-share">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </Button>
      </div>

      {/* 폼 또는 미리보기 */}
      {!isPreview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>리딩 경험의 기본 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  placeholder="예: 첫 켈틱 크로스 리딩으로 얻은 놀라운 통찰"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spreadType">스프레드 종류 *</Label>
                <Select 
                  value={formData.spreadType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, spreadType: value }))}
                >
                  <SelectTrigger id="spreadType">
                    <SelectValue placeholder="스프레드를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {spreadTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>리딩 내용</CardTitle>
              <CardDescription>리딩 경험을 자세히 공유해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">경험 내용 *</Label>
                <Textarea
                  id="content"
                  placeholder="리딩의 배경, 질문, 나온 카드들의 의미, 받은 통찰 등을 자유롭게 작성해주세요..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  최소 50자 이상 작성해주세요 ({formData.content.length}자)
                </p>
              </div>

              <div className="space-y-2">
                <Label>사용한 카드들 *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="예: The Fool, Three of Cups..."
                    value={newCard}
                    onChange={(e) => setNewCard(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCard())}
                  />
                  <Button type="button" onClick={handleAddCard} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cards.map(card => (
                    <Badge key={card} variant="secondary" className="pr-1">
                      <CreditCard className="h-3 w-3 mr-1" />
                      {card}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => handleRemoveCard(card)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>태그</CardTitle>
              <CardDescription>관련 태그를 추가해 다른 사람들이 찾기 쉽게 해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>태그 추가</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="태그 입력..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(newTag))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleAddTag(newTag)} 
                    size="icon"
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">추천 태그:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAddTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">선택된 태그:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} className="pr-1">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              공유하신 경험은 다른 사용자들에게 공개되며, 커뮤니티 가이드라인을 준수해야 합니다.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreview(true)}
              disabled={!formData.title || !formData.content}
            >
              <Eye className="mr-2 h-4 w-4" />
              미리보기
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? '공유 중...' : '경험 공유하기'}
            </Button>
          </div>
        </form>
      ) : (
        // 미리보기
        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              이렇게 게시물이 표시됩니다. 수정하려면 돌아가기를 클릭하세요.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{formData.title}</h3>
                <Badge variant="outline">
                  {spreadTypes.find(t => t.value === formData.spreadType)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="whitespace-pre-wrap">{formData.content}</div>
              
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">사용 카드:</span>
                {formData.cards.map((card, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {card}
                  </Badge>
                ))}
              </div>

              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              돌아가기
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? '공유 중...' : '경험 공유하기'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}