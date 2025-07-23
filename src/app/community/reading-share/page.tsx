'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar,
  User,
  Hash,
  Filter,
  Search,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ReadingExperience } from '@/types';
import { ReadingExperienceService } from '@/services/reading-experience-service';
import { toggleLike } from '@/actions/readingExperienceActions';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DocumentSnapshot } from 'firebase/firestore';

const popularTags = [
  '켈틱크로스', '3카드스프레드', '연애운', '직업운', 
  '데일리카드', '첫리딩', '리버스카드', '메이저아르카나'
];

export default function ReadingSharePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [experiences, setExperiences] = useState<ReadingExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes' | 'comments'>('latest');
  const [activeTab, setActiveTab] = useState('all');

  // 초기 데이터 로드
  useEffect(() => {
    loadExperiences();
  }, [sortBy, selectedTag]);

  // 검색어 변경 시 필터링
  const filteredExperiences = searchTerm 
    ? experiences.filter(exp => 
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : experiences;

  // 탭별 필터링
  const tabFilteredExperiences = filteredExperiences.filter(exp => {
    if (activeTab === 'popular') {
      return exp.views >= 100; // 조회수 100 이상
    }
    if (activeTab === 'following') {
      // 팔로잉 기능 구현 시 필터링 (현재는 좋아요한 게시물)
      return exp.author?.id && user; // 임시 조건
    }
    return true;
  });

  // 데이터 로드 함수
  const loadExperiences = async (reset = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        setExperiences([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await ReadingExperienceService.getExperiences(
        sortBy,
        selectedTag || undefined,
        reset ? undefined : lastDoc || undefined
      );

      if (result.success) {
        if (reset) {
          setExperiences(result.experiences);
        } else {
          setExperiences(prev => [...prev, ...result.experiences]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        toast({
          title: "데이터 로드 실패",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      toast({
        title: "오류 발생",
        description: "데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 더 보기 함수
  const loadMore = () => {
    if (!isLoadingMore && hasMore && lastDoc) {
      loadExperiences(false);
    }
  };

  // 좋아요 토글 함수
  const handleLike = async (experienceId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 먼저 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await toggleLike(experienceId, user.uid);
      
      if (result.success) {
        // UI 즉시 업데이트
        setExperiences(prev =>
          prev.map(exp =>
            exp.id === experienceId
              ? {
                  ...exp,
                  likes: result.isLiked ? exp.likes + 1 : exp.likes - 1,
                  // isLiked: result.isLiked
                }
              : exp
          )
        );
      } else {
        toast({
          title: "오류 발생",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      toast({
        title: "오류 발생",
        description: "좋아요 처리 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <header className="text-center">
        <Share2 className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">리딩 경험 공유</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          나만의 특별한 타로 리딩 경험을 공유하고, 다른 사람들의 이야기에서 영감을 받아보세요
        </p>
      </header>

      {/* 검색 및 필터 */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="리딩 경험 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">조회순</SelectItem>
              <SelectItem value="likes">좋아요순</SelectItem>
              <SelectItem value="comments">댓글순</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/community/reading-share/new">
              <Plus className="mr-2 h-4 w-4" />
              경험 공유하기
            </Link>
          </Button>
        </div>

        {/* 인기 태그 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">인기 태그:</span>
          {popularTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              <Hash className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="popular">인기</TabsTrigger>
          <TabsTrigger value="following">팔로잉</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* 경험 목록 */}
              <div className="grid gap-6">
                {tabFilteredExperiences.map(experience => (
              <Card key={experience.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={experience.author?.avatar} />
                        <AvatarFallback>{experience.author?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{experience.author?.name || '알 수 없는 사용자'}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {experience.author?.level || '초급'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(experience.createdAt, 'yyyy년 M월 d일', { locale: ko })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {experience.spreadType}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <Link href={`/community/reading-share/${experience.id}`} className="block">
                    <h3 className="text-xl font-bold mb-2 hover:text-primary cursor-pointer">
                      {experience.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {experience.content}
                    </p>
                  </Link>

                  {/* 카드 미리보기 */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">사용 카드:</span>
                    {experience.cards.slice(0, 3).map((card, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {card}
                      </Badge>
                    ))}
                    {experience.cards.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{experience.cards.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* 태그 */}
                  <div className="flex gap-2 flex-wrap">
                    {experience.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(experience.id)}
                        className={experience.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${experience.isLiked ? 'fill-current' : ''}`} />
                        {experience.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {experience.commentsCount}
                      </Button>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {experience.views}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/community/reading-share/${experience.id}`}>
                        자세히 보기
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

              {/* 더 보기 버튼 */}
              {hasMore && (
                <div className="text-center py-8">
                  <Button 
                    onClick={loadMore} 
                    variant="outline" 
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        불러오는 중...
                      </>
                    ) : (
                      '더 보기'
                    )}
                  </Button>
                </div>
              )}

              {/* 빈 상태 */}
              {tabFilteredExperiences.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm || selectedTag ? '검색 결과가 없습니다.' : '아직 공유된 경험이 없습니다.'}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* 사이드바 - 인기 리더 */}
      <aside className="max-w-6xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              이번 주 인기 리더
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '달빛마녀', level: '전문가', posts: 23, likes: 892 },
                { name: '영혼의향기', level: '고급', posts: 18, likes: 734 },
                { name: '타로일기', level: '초급', posts: 45, likes: 612 }
              ].map((reader, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{reader.name}</p>
                      <p className="text-xs text-muted-foreground">{reader.level}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{reader.posts} 게시물</p>
                    <p className="text-muted-foreground">{reader.likes} 좋아요</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* 하단 네비게이션 */}
      <div className="flex justify-center gap-4 pt-8">
        <Button variant="outline" asChild>
          <Link href="/community">
            <MessageCircle className="mr-2 h-4 w-4" />
            커뮤니티 홈
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/community/tarot-education">
            <Sparkles className="mr-2 h-4 w-4" />
            타로 교육 문의
          </Link>
        </Button>
      </div>
    </div>
  );
}