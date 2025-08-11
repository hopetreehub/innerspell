import { Metadata } from 'next';
import { TarotReadingHistory } from './TarotReadingHistory';

export const metadata: Metadata = {
  title: '타로리딩 기록 - InnerSpell',
  description: '나의 타로리딩 기록을 확인하세요',
};

export default function ReadingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">나의 타로리딩 기록</h1>
      <TarotReadingHistory />
    </div>
  );
}