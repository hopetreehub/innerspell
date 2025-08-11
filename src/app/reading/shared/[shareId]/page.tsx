'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SharedTarotReadingView } from '@/components/reading/SharedTarotReadingView';
import { getSharedReadingClient } from '@/lib/firebase/client-share';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SharedReadingPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReading() {
      if (!shareId) {
        setError('공유 ID가 제공되지 않았습니다.');
        setLoading(false);
        return;
      }

      try {
        const result = await getSharedReadingClient(shareId);
        
        if (result.success && result.reading) {
          setReading(result.reading);
        } else {
          setError(result.error || '공유된 리딩을 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching shared reading:', err);
        setError('공유된 리딩을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchReading();
  }, [shareId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h1 className="text-lg font-semibold">공유된 리딩을 찾을 수 없습니다</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              {error || '요청하신 타로 리딩 공유 링크가 만료되었거나 존재하지 않습니다.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SharedTarotReadingView reading={reading} />;
}