'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Reading {
  id: string;
  type: string;
  question: string;
  createdAt: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export default function MyReadingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/my-reading');
      return;
    }

    // TODO: 실제 API에서 리딩 데이터 가져오기
    const mockReadings: Reading[] = [
      {
        id: '1',
        type: '타로 리딩',
        question: '올해 나의 연애운은 어떤가요?',
        createdAt: '2025-01-10T10:00:00Z',
        status: 'completed'
      },
      {
        id: '2',
        type: '꿈 해몽',
        question: '반복되는 꿈의 의미가 궁금합니다',
        createdAt: '2025-01-09T15:30:00Z',
        status: 'completed'
      },
      {
        id: '3',
        type: '타로 리딩',
        question: '새로운 사업을 시작해도 될까요?',
        createdAt: '2025-01-08T09:00:00Z',
        status: 'in-progress'
      }
    ];

    setTimeout(() => {
      setReadings(mockReadings);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const getStatusBadge = (status: Reading['status']) => {
    const styles = {
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'pending': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    
    const labels = {
      'completed': '완료',
      'in-progress': '진행중',
      'pending': '대기중'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">리딩 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">내 리딩</h1>
        <p className="text-muted-foreground mb-8">
          지금까지의 타로 리딩과 꿈 해몽 기록을 확인하세요.
        </p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="tarot">타로 리딩</TabsTrigger>
            <TabsTrigger value="dream">꿈 해몽</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {readings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">아직 리딩 기록이 없습니다.</p>
                  <Button onClick={() => router.push('/tarot')}>
                    첫 타로 리딩 시작하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              readings.map((reading) => (
                <Card key={reading.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{reading.type}</CardTitle>
                        <CardDescription>{reading.question}</CardDescription>
                      </div>
                      {getStatusBadge(reading.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(reading.createdAt)}</span>
                      </div>
                    </div>
                    {reading.status === 'completed' && (
                      <Button 
                        variant="link" 
                        className="mt-4 p-0"
                        onClick={() => router.push(`/my-reading/${reading.id}`)}
                      >
                        결과 보기 →
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tarot" className="space-y-4">
            {readings.filter(r => r.type === '타로 리딩').map((reading) => (
              <Card key={reading.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reading.type}</CardTitle>
                      <CardDescription>{reading.question}</CardDescription>
                    </div>
                    {getStatusBadge(reading.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(reading.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="dream" className="space-y-4">
            {readings.filter(r => r.type === '꿈 해몽').map((reading) => (
              <Card key={reading.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reading.type}</CardTitle>
                      <CardDescription>{reading.question}</CardDescription>
                    </div>
                    {getStatusBadge(reading.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(reading.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button size="lg" onClick={() => router.push('/tarot')}>
            새로운 타로 리딩 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}