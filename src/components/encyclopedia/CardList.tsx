
'use client';

import type { TarotCard } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WandIcon } from '@/components/icons/WandIcon';
import { CupIcon } from '@/components/icons/CupIcon';
import { SwordIcon } from '@/components/icons/SwordIcon';
import { PentacleIcon } from '@/components/icons/PentacleIcon';
import { Star, ChevronLeft, ChevronRight, BookOpenText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AdBanner } from '../ads/AdBanner';
import { ScrollArea } from '../ui/scroll-area';

interface CardListProps {
  cards: TarotCard[];
  sidebarData: {
    majorArcana: TarotCard[];
    otherSuits: TarotCard[];
  }
}

const SuitIcon = ({ suit, className }: { suit: TarotCard['suit'], className?: string }) => {
  const props = { className: className || "w-3 h-3" };
  switch (suit) {
    case 'wands': return <WandIcon {...props} />;
    case 'cups': return <CupIcon {...props} />;
    case 'swords': return <SwordIcon {...props} />;
    case 'pentacles': return <PentacleIcon {...props} />;
    case 'major': return <Star {...props} />;
    default: return null;
  }
};

const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24];

function CardGrid({ cards }: { cards: TarotCard[]}) {
  if (!cards || cards.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full">표시할 카드가 없습니다.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8">
        {cards.map((card) => (
          <Link key={card.id} href={`/encyclopedia/${card.id}`} className="block group max-w-2xl lg:max-w-3xl mx-auto w-full">
              <Card className="flex flex-col md:flex-row h-full overflow-hidden shadow-lg hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer border border-transparent bg-card/90 backdrop-blur-sm">
                <div className="md:w-48 w-full shrink-0 bg-primary/5 relative aspect-[275/475] md:aspect-auto md:h-auto rounded-t-lg md:rounded-l-lg md:rounded-r-none overflow-hidden">
                  <Image
                    src={card.imageSrc}
                    alt={card.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                    data-ai-hint={card.dataAiHint}
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
                  <CardHeader className="p-0 pb-2 sm:pb-3">
                    <CardTitle className="font-headline text-xl md:text-2xl text-primary group-hover:text-accent transition-colors mb-1.5 line-clamp-2">
                      {card.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant={card.suit === 'major' ? 'default' : 'secondary'} className="capitalize text-[11px] px-2 py-0.5">
                        <SuitIcon suit={card.suit} className="w-3 h-3 mr-1.5" />
                        {card.suit === 'major' ? '메이저' : card.suit}
                      </Badge>
                      {(card.number !== undefined) && (
                         <span className="font-mono text-xs">
                           No. {card.suit === 'major' ? card.number : (typeof card.number === 'string' ? card.number.charAt(0).toUpperCase() + card.number.slice(1) : card.number)}
                         </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 mt-2 sm:mt-3 flex-grow space-y-2">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-0.5">정방향 키워드:</h4>
                      <p className="text-sm text-foreground/80 line-clamp-3">
                        {card.keywordsUpright.join(', ')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mt-1.5 mb-0.5">역방향 키워드:</h4>
                      <p className="text-sm text-foreground/80 line-clamp-3">
                        {card.keywordsReversed.join(', ')}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/20">
                    <Button variant="link" asChild className="text-accent p-0 hover:text-accent/80 text-sm ml-auto">
                      <span>자세히 보기 &rarr;</span>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
          </Link>
        ))}
      </div>
  )
}

export function CardList({ cards, sidebarData }: CardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(ITEMS_PER_PAGE_OPTIONS[0]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value === 'all' ? 'all' : parseInt(value, 10));
    setCurrentPage(1);
  };

  const cardsToDisplay = itemsPerPage === 'all' ? cards : cards.slice((currentPage - 1) * (itemsPerPage as number), currentPage * (itemsPerPage as number));
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(cards.length / (itemsPerPage as number));

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  
  return (
    <div className="mt-8">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-y py-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="items-per-page-select" className="text-sm font-medium text-muted-foreground">페이지당 카드 수:</Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger id="items-per-page-select" className="w-[120px] h-9 text-sm">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(option => (
                <SelectItem key={option} value={option.toString()}>{option}장</SelectItem>
              ))}
              <SelectItem value="all">모두 보기</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">이전</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages} 페이지
            </span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              <span className="mr-1">다음</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
            <CardGrid cards={cardsToDisplay} />
        </main>
        
        <aside className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-20 self-start">
           <Card className="shadow-md border-primary/10">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary flex items-center">
                <Sparkles className="mr-2 h-5 w-5"/>전체 카드 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="pr-4">
                  <h3 className="font-semibold text-lg text-primary/90 mb-2">메이저 아르카나</h3>
                  <ul className="space-y-1.5 mb-4">
                    {sidebarData.majorArcana.map(card => (
                      <li key={card.id}>
                        <Link href={`/encyclopedia/${card.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {card.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <h3 className="font-semibold text-lg text-primary/90 mb-2">마이너 아르카나</h3>
                   <ul className="space-y-1.5">
                    {sidebarData.otherSuits.map(card => (
                      <li key={card.id}>
                        <Link href={`/encyclopedia/${card.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                           {card.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <AdBanner />
        </aside>
      </div>

      {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">이전</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages} 페이지
            </span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              <span className="mr-1">다음</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
    </div>
  );
}
