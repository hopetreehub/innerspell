'use client';

import { useState, useEffect } from 'react';
import { getUserReadings, deleteUserReading } from '@/actions/readingActions';
import { getUserReadingsClient, deleteUserReadingClient } from '@/lib/firebase/client-read';
import { SavedReading } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Calendar, Layers, MessageSquare, Trash2 } from 'lucide-react';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function TarotReadingHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReadings();
    }
  }, [user]);

  const loadReadings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 개발 환경에서는 서버 액션 사용, 프로덕션에서는 클라이언트 Firebase 사용
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // 개발 환경: 서버 액션으로 파일에서 읽기
        const result = await getUserReadings(user.uid);
        setReadings(result);
      } else {
        // 프로덕션 환경: 클라이언트 사이드에서 직접 Firestore 조회
        const result = await getUserReadingsClient(user.uid);
        setReadings(result);
      }
    } catch (error) {
      console.error('Failed to load readings:', error);
      toast({
        variant: 'destructive',
        title: '오류',
        description: '타로리딩 기록을 불러올 수 없습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (readingId: string) => {
    if (!user) return;
    
    try {
      // 개발 환경에서는 서버 액션 사용, 프로덕션에서는 클라이언트 Firebase 사용
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let result;
      if (isDevelopment) {
        // 개발 환경: 서버 액션으로 파일에서 삭제
        result = await deleteUserReading(user.uid, readingId);
      } else {
        // 프로덕션 환경: 클라이언트 사이드에서 직접 Firestore 삭제
        result = await deleteUserReadingClient(user.uid, readingId);
      }
      
      if (result.success) {
        toast({
          title: '삭제 완료',
          description: '타로리딩 기록이 삭제되었습니다.',
        });
        setReadings(readings.filter(r => r.id !== readingId));
      } else {
        toast({
          variant: 'destructive',
          title: '삭제 실패',
          description: result.error || '타로리딩 삭제 중 오류가 발생했습니다.',
        });
      }
    } catch (error) {
      console.error('Failed to delete reading:', error);
      toast({
        variant: 'destructive',
        title: '오류',
        description: '타로리딩을 삭제할 수 없습니다.',
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">로그인 후 이용해주세요.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">아직 저장된 타로리딩이 없습니다.</p>
        <Button asChild>
          <a href="/reading">타로리딩 시작하기</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">총 {readings.length}개의 리딩</p>
      </div>

      {readings.map((reading) => (
        <Card key={reading.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2 text-foreground">{reading.question}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {reading.createdAt ? format(new Date(reading.createdAt), 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 없음'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {reading.spreadName} ({reading.drawnCards.length}장)
                  </span>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 타로리딩 기록을 삭제하면 복구할 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(reading.id)}>
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>

          <div>
            <Button 
              variant="ghost" 
              className="w-full rounded-none"
              onClick={() => setExpandedReading(expandedReading === reading.id ? null : reading.id)}
            >
              {expandedReading === reading.id ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  자세히 보기
                </>
              )}
            </Button>

            {expandedReading === reading.id && (
              <CardContent className="pt-4">
                {/* 카드 이미지들 */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">선택된 카드</h3>
                  <div className="flex flex-wrap gap-3">
                    {reading.drawnCards.map((card, index) => (
                      <div key={index} className="text-center">
                        <div className="relative w-24 h-36 mb-2">
                          <Image
                            src={card.imageSrc}
                            alt={card.name}
                            fill
                            className={`object-contain rounded ${
                              card.isReversed ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        <p className="text-xs font-medium">{card.position}</p>
                        <p className="text-xs text-foreground">
                          {card.name}
                          {card.isReversed && ' (역방향)'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 해석 내용 */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    타로 해석
                  </h3>
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <p className="whitespace-pre-wrap text-sm text-foreground dark:text-white">{reading.interpretationText}</p>
                  </ScrollArea>
                </div>
              </CardContent>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}