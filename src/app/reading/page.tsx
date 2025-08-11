
import { TarotReadingClient } from '@/components/reading/TarotReadingClient';
import type { Metadata } from 'next';
import { Wand } from 'lucide-react';

export const metadata: Metadata = {
  title: '타로 읽기 - InnerSpell',
  description: '개인 맞춤형 AI 타로 리딩을 받아보세요. 질문을 하고 스프레드를 선택하세요.',
};

export default function TarotReadingPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <Wand className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">AI 타로 리딩</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          질문을 하고, 스프레드를 선택하고, 카드가 당신을 안내하도록 하세요. AI가 메시지 해석을 도와드립니다.
        </p>
      </header>
      <TarotReadingClient />
    </div>
  );
}
