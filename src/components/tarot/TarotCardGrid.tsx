'use client';

import { TarotCard } from '@/types/tarot';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

// Lazy load the actual card component
const TarotCardItem = dynamic(() => import('./TarotCardItem'), {
  loading: () => (
    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  ),
});

interface TarotCardGridProps {
  cards: TarotCard[];
  isLoading?: boolean;
}

export default function TarotCardGrid({ cards, isLoading }: TarotCardGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="large" />
        <p className="text-lg text-gray-500 mt-4">카드를 불러오는 중...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {cards.map((card) => (
        <Suspense
          key={card.id}
          fallback={
            <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          }
        >
          <TarotCardItem card={card} />
        </Suspense>
      ))}
    </div>
  );
}