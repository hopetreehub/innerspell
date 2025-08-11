
import { DreamInterpretationClient } from '@/components/dream/DreamInterpretationClient';
import type { Metadata } from 'next';
import { MoonStar } from 'lucide-react';

export const metadata: Metadata = {
  title: '꿈 해몽',
  description: '무료 AI 꿈해몽 서비스. 꿈의 상징과 의미를 심층 분석하여 무의식의 메시지를 해석해드립니다. 악몽, 길몽, 예지몽 등 모든 꿈의 의미를 알아보세요.',
  keywords: ['꿈해몽', '무료꿈해몽', 'AI꿈해석', '꿈의미', '꿈풀이', '악몽해석', '길몽', '예지몽', '꿈상징', '무의식'],
  openGraph: {
    title: '무료 AI 꿈해몽 서비스 - InnerSpell',
    description: 'AI가 분석하는 정확한 꿈 해석. 당신의 무의식이 전하는 메시지를 발견하세요.',
    images: [
      {
        url: '/images/dream-og.png',
        width: 1200,
        height: 630,
        alt: 'InnerSpell AI 꿈해몽',
      },
    ],
  },
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
