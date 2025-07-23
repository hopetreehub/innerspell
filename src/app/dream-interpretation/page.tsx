
import { DreamInterpretationClient } from '@/components/dream/DreamInterpretationClient';
import type { Metadata } from 'next';
import { MoonStar } from 'lucide-react';

export const metadata: Metadata = {
  title: '꿈 해몽 - InnerSpell',
  description: 'AI와 함께 당신의 꿈을 해석하고 숨겨진 의미를 발견하세요.',
};

export default function DreamInterpretationPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <MoonStar className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">AI 꿈 해몽</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          당신의 꿈 이야기를 들려주세요. AI가 꿈 속에 담긴 상징과 메시지를 해석해드립니다.
        </p>
      </header>
      <DreamInterpretationClient />
    </div>
  );
}
