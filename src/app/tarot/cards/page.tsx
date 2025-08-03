import { Metadata } from 'next';
import { TarotCardsGrid } from '@/components/tarot/TarotCardsGrid';
import { allTarotCards } from '@/data/tarot-cards';

export const metadata: Metadata = {
  title: '타로 카드 사전 | InnerSpell - 78장 카드 완전 해석',
  description: '메이저 아르카나 22장과 마이너 아르카나 56장, 총 78장의 타로 카드 의미를 상세히 해석합니다. 정방향, 역방향, 연애, 사업, 건강 운세까지.',
  keywords: [
    '타로카드', '타로사전', '카드해석', '메이저아르카나', '마이너아르카나',
    '타로의미', '카드뜻', '정방향', '역방향', '연애타로', '사업타로'
  ],
  openGraph: {
    title: 'InnerSpell 타로 카드 사전 - 78장 완전 해석',
    description: '바보부터 세계까지, 모든 타로 카드의 의미와 해석을 상세하게 제공합니다.',
    type: 'website',
    url: 'https://innerspell.com/tarot/cards',
    images: [
      {
        url: '/images/tarot-cards-og.jpg',
        width: 1200,
        height: 630,
        alt: '타로 카드 사전',
      },
    ],
  },
};

export default function TarotCardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full mb-6">
            <span className="text-4xl">🔮</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
            타로 카드 사전
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            78장의 타로 카드 완전 해석 가이드. 메이저 아르카나 22장과 마이너 아르카나 56장의 
            정방향, 역방향 의미와 연애, 사업, 건강 운세를 상세히 알아보세요.
          </p>
          
          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">78</div>
              <div className="text-sm text-muted-foreground">전체 카드</div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">22</div>
              <div className="text-sm text-muted-foreground">메이저 아르카나</div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">56</div>
              <div className="text-sm text-muted-foreground">마이너 아르카나</div>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">수트</div>
            </div>
          </div>
        </header>

        {/* 카드 그리드 */}
        <TarotCardsGrid cards={allTarotCards} />
      </div>
    </div>
  );
}