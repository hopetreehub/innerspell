'use client';

import { useState, useEffect } from 'react';
import { getUserReadings, deleteUserReading } from '@/actions/readingActions';
import { getUserReadingsClient, deleteUserReadingClient } from '@/lib/firebase/client-read';
import { SavedReading } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Layers, MessageSquare, Trash2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TarotHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<SavedReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReadings();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // readings가 배열인지 확인 후 필터링 실행
    if (Array.isArray(readings)) {
      filterAndSortReadings();
    }
  }, [readings, searchQuery, filterType, sortOrder]);

  const loadReadings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let result;
      if (isDevelopment) {
        result = await getUserReadings(user.uid);
      } else {
        result = await getUserReadingsClient(user.uid);
      }
      
      // 결과가 배열인지 확인
      if (Array.isArray(result)) {
        setReadings(result);
      } else {
        console.error('getUserReadings returned non-array:', result);
        setReadings([]);
        toast({
          variant: 'destructive',
          title: '데이터 오류',
          description: '타로리딩 데이터 형식이 올바르지 않습니다.',
        });
      }
    } catch (error) {
      console.error('Failed to load readings:', error);
      setReadings([]); // 안전한 기본값
      toast({
        variant: 'destructive',
        title: '오류',
        description: '타로리딩 기록을 불러올 수 없습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReadings = () => {
    // 방어적 프로그래밍: readings가 배열인지 확인
    if (!Array.isArray(readings)) {
      console.warn('readings is not an array:', readings);
      setFilteredReadings([]);
      return;
    }

    let filtered = [...readings];

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(reading => 
        reading.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reading.interpretation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reading.cards?.some(card => card.card.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 타입 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(reading => {
        const cardCount = reading.cards?.length || 0;
        if (filterType === 'single') return cardCount === 1;
        if (filterType === 'three') return cardCount === 3;
        if (filterType === 'celtic') return cardCount >= 10;
        return true;
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredReadings(filtered);
  };

  const handleDelete = async () => {
    if (!user || !readingToDelete) return;
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let result;
      if (isDevelopment) {
        result = await deleteUserReading(user.uid, readingToDelete);
      } else {
        result = await deleteUserReadingClient(user.uid, readingToDelete);
      }
      
      if (result.success) {
        toast({
          title: '삭제 완료',
          description: '타로리딩 기록이 삭제되었습니다.',
        });
        setReadings(readings.filter(r => r.id !== readingToDelete));
      } else {
        toast({
          variant: 'destructive',
          title: '삭제 실패',
          description: result.error || '타로리딩 삭제 중 오류가 발생했습니다.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '삭제 중 오류가 발생했습니다.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setReadingToDelete(null);
    }
  };

  const getSpreadTypeName = (cardCount: number) => {
    if (cardCount === 1) return '일일 카드';
    if (cardCount === 3) return '3장 스프레드';
    if (cardCount >= 10) return '켈틱 크로스';
    return `${cardCount}장 스프레드`;
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              타로 리딩 기록을 확인하려면 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full">로그인하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">나의 타로 리딩 기록</h1>
          <p className="text-muted-foreground">과거의 타로 리딩을 다시 확인하고 통찰을 얻어보세요.</p>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="질문, 해석, 카드 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="스프레드 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 스프레드</SelectItem>
                  <SelectItem value="single">일일 카드</SelectItem>
                  <SelectItem value="three">3장 스프레드</SelectItem>
                  <SelectItem value="celtic">켈틱 크로스</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 순서" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 리딩 목록 */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReadings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterType !== 'all' ? '검색 결과가 없습니다' : '아직 타로 리딩 기록이 없습니다'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all' ? '다른 검색어나 필터를 시도해보세요.' : '새로운 타로 리딩을 시작해보세요!'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Link href="/tarot/new-reading">
                  <Button>타로 리딩 시작하기</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReadings.map((reading) => (
              <Card key={reading.id} className="overflow-hidden">
                <CardHeader className="cursor-pointer" onClick={() => setExpandedReading(expandedReading === reading.id ? null : reading.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {getSpreadTypeName(reading.cards?.length || 0)}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(reading.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {reading.question || '질문 없음'}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReadingToDelete(reading.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {expandedReading === reading.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedReading === reading.id && (
                  <CardContent className="pt-0">
                    {/* 카드 이미지 */}
                    {reading.cards && reading.cards.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          뽑은 카드
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {reading.cards.map((cardInfo, idx) => (
                            <div key={idx} className="text-center">
                              <div className="relative aspect-[2/3] mb-2">
                                <Image
                                  src={cardInfo.card.image}
                                  alt={cardInfo.card.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <p className="text-sm font-medium">{cardInfo.card.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {cardInfo.isReversed ? '역방향' : '정방향'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 해석 */}
                    {reading.interpretation && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          타로 해석
                        </h4>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{reading.interpretation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>타로 리딩 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 타로 리딩 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}