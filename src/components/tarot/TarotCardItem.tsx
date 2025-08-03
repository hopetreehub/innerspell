'use client';

import { TarotCard } from '@/types/tarot';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';

interface TarotCardItemProps {
  card: TarotCard;
}

const TarotCardItem = memo(function TarotCardItem({ card }: TarotCardItemProps) {
  return (
    <Link href={`/tarot/${card.id}`}>
      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden bg-card">
        <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800">
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyymP5Wgkm0rIzNFKOWNgU0H7WjgSbP//Z"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center p-4">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mb-1">
                  {card.number !== null ? card.number.toString().padStart(2, '0') : '?'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.nameKorean}</p>
              </div>
            </div>
          )}
          
          {/* 카드 배지 */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {card.suit ? (
              <Badge className={`text-white backdrop-blur-sm ${
                card.suit === 'wands' ? 'bg-red-600/90' :
                card.suit === 'cups' ? 'bg-blue-600/90' :
                card.suit === 'swords' ? 'bg-yellow-600/90' :
                card.suit === 'pentacles' ? 'bg-green-600/90' :
                'bg-purple-900/90'
              }`}>
                {card.suit === 'wands' && '완드'}
                {card.suit === 'cups' && '컵'}
                {card.suit === 'swords' && '소드'}
                {card.suit === 'pentacles' && '펜타클'}
              </Badge>
            ) : (
              <Badge className="bg-purple-900/90 text-white backdrop-blur-sm">
                {card.number !== null ? card.number.toString().padStart(2, '0') : 'Major'}
              </Badge>
            )}
            
            {card.number !== null && card.suit && (
              <Badge className="bg-gray-900/90 text-white backdrop-blur-sm">
                {card.number}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
            {card.nameKorean}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {card.name}
          </p>
          
          {/* 주요 키워드 */}
          <div className="mt-2 flex flex-wrap gap-1">
            {card.keywords.upright.slice(0, 2).map((keyword, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs py-0 px-1">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
});

export default TarotCardItem;