'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

export const LazyTarotCardList = dynamic(
  () => import('@/components/tarot/TarotCardList').then(mod => mod.TarotCardList),
  {
    loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
    ssr: true
  }
);

export const LazyTarotSpreadForm = dynamic(
  () => import('@/components/tarot/TarotSpreadForm').then(mod => mod.TarotSpreadForm),
  {
    loading: () => <div className="flex justify-center p-8"><Spinner /></div>,
    ssr: false
  }
);