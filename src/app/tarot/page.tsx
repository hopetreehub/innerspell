'use client';

import { useState, useEffect, useMemo } from 'react';
import { TarotCard } from '@/types/tarot';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import dynamic from 'next/dynamic';
import { 
  loadMajorArcanaCards, 
  loadMinorArcanaBySuit, 
  loadMajorArcanaJourney, 
  getTarotStats,
  TarotStats 
} from '@/lib/tarot-data-loader';

// Lazy load heavy components
const TarotCardGrid = dynamic(() => import('@/components/tarot/TarotCardGrid'), {
  loading: () => (
    <div className="flex justify-center py-8">
      <Spinner size="large" />
    </div>
  ),
});

export default function TarotPage() {
  const [currentCards, setCurrentCards] = useState<TarotCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('major');
  const [stats, setStats] = useState<TarotStats | null>(null);
  const [journeyData, setJourneyData] = useState<any[]>([]);

  // Load data based on active tab
  useEffect(() => {
    const loadTabData = async () => {
      setIsLoading(true);
      try {
        let cards: TarotCard[] = [];

        switch (activeTab) {
          case 'major':
            cards = await loadMajorArcanaCards();
            if (journeyData.length === 0) {
              const journey = await loadMajorArcanaJourney();
              setJourneyData(journey);
            }
            break;
          case 'minor':
            const [wands, cups, swords, pentacles] = await Promise.all([
              loadMinorArcanaBySuit('wands'),
              loadMinorArcanaBySuit('cups'),
              loadMinorArcanaBySuit('swords'),
              loadMinorArcanaBySuit('pentacles'),
            ]);
            cards = [...wands, ...cups, ...swords, ...pentacles];
            break;
          case 'wands':
            cards = await loadMinorArcanaBySuit('wands');
            break;
          case 'cups':
            cards = await loadMinorArcanaBySuit('cups');
            break;
          case 'swords':
            cards = await loadMinorArcanaBySuit('swords');
            break;
          case 'pentacles':
            cards = await loadMinorArcanaBySuit('pentacles');
            break;
        }

        setCurrentCards(cards);
      } catch (error) {
        console.error('Failed to load tarot cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, journeyData.length]);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const tarotStats = await getTarotStats();
        setStats(tarotStats);
      } catch (error) {
        console.error('Failed to load tarot stats:', error);
      }
    };

    loadStats();
  }, []);

  // Memoized filtered cards for better performance
  const filteredCards = useMemo(() => {
    if (!searchQuery) return currentCards;
    
    const query = searchQuery.toLowerCase();
    return currentCards.filter(card => {
      return (
        card.name.toLowerCase().includes(query) ||
        card.nameKorean.includes(searchQuery) ||
        card.keywords.upright.some(k => k.toLowerCase().includes(query)) ||
        card.meaningShort.upright.toLowerCase().includes(query)
      );
    });
  }, [currentCards, searchQuery]);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            타로 카드 아카이브
          </h1>
          {stats ? (
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {stats.total}장의 타로 카드 각각의 깊은 의미와 상징을 탐험해보세요.
              메이저 아르카나 {stats.majorArcana}장과 마이너 아르카나 {stats.minorArcana}장으로 구성되어 있습니다.
            </p>
          ) : (
            <div className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          )}
          
          {/* 검색 바 */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="카드 이름, 키워드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
        </div>
        
        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-6 mb-8">
            <TabsTrigger value="major">메이저 아르카나</TabsTrigger>
            <TabsTrigger value="minor">마이너 아르카나</TabsTrigger>
            <TabsTrigger value="wands">완드</TabsTrigger>
            <TabsTrigger value="cups">컵</TabsTrigger>
            <TabsTrigger value="swords">소드</TabsTrigger>
            <TabsTrigger value="pentacles">펜타클</TabsTrigger>
          </TabsList>
          
          <TabsContent value="major" className="mt-8">
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                총 {filteredCards.length}장의 카드
              </p>
            </div>
            
            {/* 메이저 아르카나 여정 단계 */}
            {searchQuery === '' && journeyData.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-center mb-6">메이저 아르카나의 여정</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {journeyData.map((stage, idx) => (
                    <Card key={idx} className="p-6 bg-card">
                      <h3 className="font-semibold text-lg mb-2">{stage.stage}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{stage.description}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{stage.theme}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <TarotCardGrid cards={filteredCards} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="minor" className="mt-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-4">마이너 아르카나 (56장)</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                총 {filteredCards.length}장의 카드
                {stats && ` | 완드 ${stats.suits.wands}장 · 컵 ${stats.suits.cups}장 · 소드 ${stats.suits.swords}장 · 펜타클 ${stats.suits.pentacles}장`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">완드 (불)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">열정, 창조, 행동</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">컵 (물)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">감정, 직관, 관계</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">소드 (공기)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">정신, 갈등, 소통</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <h3 className="font-semibold text-green-600 dark:text-green-400">펜타클 (흙)</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">물질, 실용, 안정</p>
                </div>
              </div>
            </div>
            
            <TarotCardGrid cards={filteredCards} isLoading={isLoading} />
          </TabsContent>
          
          {/* 개별 수트 탭들 */}
          {(['wands', 'cups', 'swords', 'pentacles'] as const).map((suit) => (
            <TabsContent key={suit} value={suit} className="mt-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {suit === 'wands' && '완드 수트 (불의 원소)'}
                  {suit === 'cups' && '컵 수트 (물의 원소)'}
                  {suit === 'swords' && '소드 수트 (공기의 원소)'}
                  {suit === 'pentacles' && '펜타클 수트 (흙의 원소)'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  총 {filteredCards.length}장의 카드 · 
                  {suit === 'wands' && ' 열정, 창조력, 행동력을 나타내는 수트'}
                  {suit === 'cups' && ' 감정, 직감, 관계를 나타내는 수트'}
                  {suit === 'swords' && ' 정신, 갈등, 의사소통을 나타내는 수트'}
                  {suit === 'pentacles' && ' 물질, 실용성, 안정을 나타내는 수트'}
                </p>
              </div>
              
              <TarotCardGrid cards={filteredCards} isLoading={isLoading} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}