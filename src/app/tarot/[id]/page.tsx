import React from 'react';
import { notFound } from 'next/navigation';
import { TarotCardDetail } from '@/components/tarot/TarotCardDetail';
import { getMajorArcanaCardById, allMajorArcanaCards } from '@/data/all-major-arcana';
import { findCardById, allTarotCards } from '@/data/all-tarot-cards';
import { TarotCard } from '@/types/tarot';
import { adaptNewToOldCard } from '@/utils/tarot-card-adapter';

// Enable static generation for better performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface TarotCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 관련 카드 찾기 함수
function getRelatedCards(card: TarotCard): TarotCard[] {
  // 현재 카드의 관련 카드 ID들을 기반으로 실제 카드 객체들을 찾기
  const relatedCardIds = card.relatedCards || [];
  
  // 마이너 아르카나의 경우, 같은 슈트의 다른 카드들을 관련 카드로 표시
  if (card.arcana === 'minor' && card.suit) {
    const sameSuitCards = allTarotCards.filter(
      c => c.suit === card.suit && c.id !== card.id
    );
    return sameSuitCards.slice(0, 4);
  }
  
  // 메이저 아르카나의 경우 기존 로직 사용
  return relatedCardIds
    .map(id => findCardById(id))
    .filter((relatedCard): relatedCard is TarotCard => relatedCard !== undefined)
    .slice(0, 4); // 최대 4개까지만
}

export default async function TarotCardPage({ params }: TarotCardPageProps) {
  const { id } = await params;
  
  try {
    // 모든 카드(메이저 + 마이너)에서 찾기
    const card = findCardById(id);
    
    // 카드가 없으면 404
    if (!card) {
      console.log(`Card not found: ${id}`);
      notFound();
    }

    // 관련 카드 찾기 (에러 방지)
    let relatedCards: TarotCard[] = [];
    try {
      relatedCards = getRelatedCards(card);
    } catch (error) {
      console.warn('Failed to load related cards:', error);
      relatedCards = [];
    }

    // 카드 타입 변환
    const adaptedCard = adaptNewToOldCard(card);
    const adaptedRelatedCards = relatedCards.map(adaptNewToOldCard);

    return (
      <TarotCardDetail 
        card={adaptedCard} 
        relatedCards={adaptedRelatedCards}
        showBackButton={true}
      />
    );
  } catch (error) {
    console.error('Error loading tarot card page:', error);
    notFound();
  }
}

// Generate static params for all tarot cards
export async function generateStaticParams() {
  return allTarotCards.map((card) => ({
    id: card.id,
  }));
}

// 메타데이터 생성
export async function generateMetadata({ params }: TarotCardPageProps) {
  const { id } = await params;
  const card = findCardById(id);

  if (!card) {
    return {
      title: '카드를 찾을 수 없습니다',
      description: '요청하신 타로 카드를 찾을 수 없습니다.'
    };
  }

  return {
    title: `${card.nameKorean} (${card.name}) - 타로 카드 상세`,
    description: card.meaningShort.upright,
    keywords: [
      card.nameKorean,
      card.name,
      '타로카드',
      '타로',
      card.arcana === 'major' ? '메이저아르카나' : '마이너아르카나',
      ...card.keywords.upright,
      ...card.keywords.reversed
    ].join(', '),
    openGraph: {
      title: `${card.nameKorean} - 타로 카드`,
      description: card.meaningShort.upright,
      images: [
        {
          url: card.imageUrl || '/images/tarot/card-back.jpg',
          width: 400,
          height: 600,
          alt: card.nameKorean,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${card.nameKorean} - 타로 카드`,
      description: card.meaningShort.upright,
      images: [card.imageUrl || '/images/tarot/card-back.jpg'],
    },
  };
}