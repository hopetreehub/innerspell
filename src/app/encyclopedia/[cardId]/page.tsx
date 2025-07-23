
import { getCardById, tarotDeck, getPreviousCard, getNextCard } from '@/lib/tarot-data';
import type { TarotCard as TarotCardType } from '@/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WandIcon } from '@/components/icons/WandIcon';
import { CupIcon } from '@/components/icons/CupIcon';
import { SwordIcon } from '@/components/icons/SwordIcon';
import { PentacleIcon } from '@/components/icons/PentacleIcon';
import { Star, Sparkles, Users, Brain, Anchor, Zap, BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Script from 'next/script'; // For JSON-LD

type Props = {
  params: Promise<{ cardId: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { cardId } = await params;
  const card = getCardById(cardId);

  if (!card) {
    return {
      title: '카드를 찾을 수 없습니다',
      description: '요청하신 타로 카드를 찾을 수 없습니다.',
    };
  }

  const cardName = card.name;
  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = card.imageSrc.startsWith('http') ? card.imageSrc : `${siteUrl}${card.imageSrc}`;

  return {
    title: `${cardName} - 타로 백과사전`,
    description: `${cardName} 카드의 의미, 키워드 (정방향: ${card.keywordsUpright.slice(0,3).join(', ')}) 및 그림 해석. InnerSpell 타로 백과사전에서 더 알아보세요.`,
    alternates: {
      canonical: `${siteUrl}/encyclopedia/${card.id}`,
    },
    openGraph: {
      title: `${cardName} - InnerSpell 타로 카드 의미`,
      description: card.meaningUpright.substring(0, 150) + '...',
      url: `${siteUrl}/encyclopedia/${card.id}`,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 330, // Updated width for OG
          height: 570, // Updated height for OG
          alt: cardName,
        },
        ...previousImages
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cardName} - 타로 카드 의미`,
      description: card.meaningUpright.substring(0,150) + '...',
      images: [imageUrl],
    }
  };
}

export async function generateStaticParams() {
  return tarotDeck.map((card) => ({
    cardId: card.id,
  }));
}

const SuitIconDetail = ({ suit, className }: { suit: TarotCardType['suit'], className?: string }) => {
  const props = { className: className || "w-5 h-5" };
  switch (suit) {
    case 'wands': return <WandIcon {...props} />;
    case 'cups': return <CupIcon {...props} />;
    case 'swords': return <SwordIcon {...props} />;
    case 'pentacles': return <PentacleIcon {...props} />;
    case 'major': return <Star {...props} />;
    default: return null;
  }
};

const DetailSection: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
  <div>
    <h3 className="font-headline text-xl text-primary mb-2 flex items-center">
      {icon} <span className="ml-2">{title}</span>
    </h3>
    <div className="text-foreground/80 space-y-1">{children}</div>
  </div>
);


export default async function CardDetailPage({ params }: Props) {
  const { cardId } = await params;
  const card = getCardById(cardId);

  if (!card) {
    notFound();
  }

  const previousCard = getPreviousCard(cardId);
  const nextCard = getNextCard(cardId);
  const imageUrl = card.imageSrc.startsWith('http') ? card.imageSrc : `${siteUrl}${card.imageSrc}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: card.name,
    description: card.description || card.meaningUpright.substring(0, 160) + "...",
    image: imageUrl,
    keywords: [...card.keywordsUpright, ...card.keywordsReversed].join(', '),
    url: `${siteUrl}/encyclopedia/${card.id}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'InnerSpell 타로 백과사전',
      url: `${siteUrl}/encyclopedia`,
    }
  };

  return (
    <>
      <Script
        id="tarot-card-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Card className="overflow-hidden shadow-xl border-primary/10">
          <div className="grid md:grid-cols-7 gap-6 sm:gap-8"> {/* Changed to 7 columns */}
            <div className="md:col-span-3 p-4 sm:p-6 bg-primary/5 flex justify-center items-center"> {/* Image takes 3 columns */}
              <Image
                src={card.imageSrc}
                alt={card.name}
                width={330} // Increased width
                height={570} // Increased height (maintaining aspect ratio)
                className="rounded-lg shadow-lg object-contain" // Removed max-h and w-auto
                data-ai-hint={card.dataAiHint}
                priority
                sizes="(max-width: 768px) 90vw, 330px" // Updated sizes
              />
            </div>
            <div className="md:col-span-4 p-6 sm:p-8"> {/* Text content takes 4 columns */}
              <CardHeader className="p-0 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={card.suit === 'major' ? 'default' : 'secondary'} className="capitalize text-sm px-2 py-1">
                    <SuitIconDetail suit={card.suit} className="w-4 h-4 mr-1.5" />
                    {card.suit} 아르카나
                  </Badge>
                  {card.number !== undefined && (
                    <span className="font-mono text-lg text-primary font-semibold">
                      {card.suit === 'major' ? card.number : typeof card.number === 'string' ? card.number.charAt(0).toUpperCase() + card.number.slice(1) : card.number}
                    </span>
                  )}
                </div>
                <CardTitle className="font-headline text-4xl text-primary">{card.name}</CardTitle>
                {card.description && <CardDescription className="text-md text-foreground/70 mt-2">{card.description}</CardDescription>}
              </CardHeader>

              <Separator className="my-6 bg-primary/20" />

              <CardContent className="p-0 space-y-6">
                <DetailSection title="키워드" icon={<Sparkles className="w-5 h-5 text-accent" />}>
                  <div>
                    <h4 className="font-semibold text-primary/90">정방향:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {card.keywordsUpright.map(keyword => <Badge key={keyword} variant="outline" className="bg-accent/5 border-accent/30 text-accent">{keyword}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary/90">역방향:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {card.keywordsReversed.map(keyword => <Badge key={keyword} variant="outline" className="bg-muted/50 border-muted-foreground/30 text-muted-foreground">{keyword}</Badge>)}
                    </div>
                  </div>
                </DetailSection>

                <Separator className="my-4 bg-primary/10" />

                <DetailSection title="의미" icon={<BookOpenText className="w-5 h-5 text-accent" />}>
                  <div>
                    <h4 className="font-semibold text-primary/90">정방향:</h4>
                    <p className="leading-relaxed">{card.meaningUpright}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary/90">역방향:</h4>
                    <p className="leading-relaxed">{card.meaningReversed}</p>
                  </div>
                </DetailSection>

                {card.fortuneTelling && card.fortuneTelling.length > 0 && (
                  <>
                    <Separator className="my-4 bg-primary/10" />
                    <DetailSection title="점괘" icon={<Zap className="w-5 h-5 text-accent" />}>
                      <ul className="list-disc list-inside space-y-1">
                        {card.fortuneTelling.map((fortune, i) => <li key={i}>{fortune}</li>)}
                      </ul>
                    </DetailSection>
                  </>
                )}

                {card.questionsToAsk && card.questionsToAsk.length > 0 && (
                  <>
                    <Separator className="my-4 bg-primary/10" />
                    <DetailSection title="질문해볼 것들" icon={<Brain className="w-5 h-5 text-accent" />}>
                       <ul className="list-disc list-inside space-y-1">
                        {card.questionsToAsk.map((question, i) => <li key={i}>{question}</li>)}
                      </ul>
                    </DetailSection>
                  </>
                )}

                {(card.astrology || card.element) && (
                  <>
                    <Separator className="my-4 bg-primary/10" />
                    <DetailSection title="상응 관계" icon={<Anchor className="w-5 h-5 text-accent" />}>
                      {card.astrology && <p><span className="font-semibold">점성술:</span> {card.astrology}</p>}
                      {card.element && <p><span className="font-semibold">원소:</span> {card.element}</p>}
                    </DetailSection>
                  </>
                )}

                {card.affirmation && (
                   <>
                    <Separator className="my-4 bg-primary/10" />
                    <DetailSection title="확언" icon={<Users className="w-5 h-5 text-accent" />}>
                      <p className="italic">&quot;{card.affirmation}&quot;</p>
                    </DetailSection>
                  </>
                )}

              </CardContent>
            </div>
          </div>
        </Card>

        <nav className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4" aria-label="카드 탐색">
          {previousCard ? (
            <Button asChild variant="outline" size="sm" className="group hover:bg-primary/5 w-full sm:w-auto">
              <Link href={`/encyclopedia/${previousCard.id}`}>
                <span className="flex items-center justify-center">
                  <ChevronLeft className="mr-1 h-4 w-4 group-hover:text-primary transition-colors" />
                  이전 카드
                </span>
              </Link>
            </Button>
          ) : (
            <div className="w-full sm:w-auto" />
          )}

          <Button asChild variant="outline" className="group hover:bg-primary/5 w-full sm:w-auto">
            <Link href="/encyclopedia">
               <span className="flex items-center justify-center">
                백과사전으로 돌아가기
              </span>
            </Link>
          </Button>

          {nextCard ? (
            <Button asChild variant="outline" size="sm" className="group hover:bg-primary/5 w-full sm:w-auto">
              <Link href={`/encyclopedia/${nextCard.id}`}>
                <span className="flex items-center justify-center">
                  다음 카드
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:text-primary transition-colors" />
                </span>
              </Link>
            </Button>
          ) : (
            <div className="w-full sm:w-auto" />
          )}
        </nav>
      </div>
    </>
  );
}
