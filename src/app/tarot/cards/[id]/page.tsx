import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TarotCardDetail } from '@/components/tarot/TarotCardDetail';
import { allTarotCards, findCardById } from '@/data/tarot-cards';

interface TarotCardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return allTarotCards.map((card) => ({
    id: card.id,
  }));
}

export async function generateMetadata({ params }: TarotCardPageProps): Promise<Metadata> {
  const { id } = await params;
  const card = findCardById(id);
  
  if (!card) {
    return {
      title: '카드를 찾을 수 없습니다 | InnerSpell',
    };
  }

  return {
    title: `${card.name} (${card.nameEn}) 타로 카드 해석 | InnerSpell`,
    description: `${card.name} 타로 카드의 정방향, 역방향 의미와 연애, 사업, 건강 운세를 상세히 해석합니다. ${card.keywords.join(', ')} 등의 키워드로 당신의 상황을 해석해보세요.`,
    keywords: [
      card.name,
      card.nameEn,
      '타로카드',
      '타로해석',
      ...card.keywords,
      '정방향',
      '역방향',
      '연애운',
      '사업운',
      '건강운'
    ],
    openGraph: {
      title: `${card.name} 타로 카드 완전 해석`,
      description: `${card.description.slice(0, 160)}...`,
      type: 'article',
      url: `https://innerspell.com/tarot/cards/${card.id}`,
      images: [
        {
          url: card.image,
          width: 800,
          height: 1200,
          alt: card.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.name} 타로 카드 해석`,
      description: `${card.upright.meaning}`,
      images: [card.image],
    },
  };
}

export default async function TarotCardPage({ params }: TarotCardPageProps) {
  const { id } = await params;
  const card = findCardById(id);

  if (!card) {
    notFound();
  }

  return <TarotCardDetail card={card} allCards={allTarotCards} />;
}