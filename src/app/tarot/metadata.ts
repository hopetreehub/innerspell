import type { Metadata } from 'next';

export const tarotMetadata: Metadata = {
  title: '타로 카드 리딩',
  description: '무료 AI 타로카드 리딩 서비스. 연애운, 금전운, 직업운 등 다양한 주제로 정확한 타로 해석을 받아보세요. 1장 리딩부터 켈틱 크로스까지 다양한 스프레드 제공.',
  keywords: ['타로카드', '무료타로', 'AI타로', '타로리딩', '연애타로', '오늘의타로', '타로점', '타로해석', '켈틱크로스', '3카드스프레드'],
  openGraph: {
    title: '무료 AI 타로카드 리딩 - InnerSpell',
    description: 'AI가 해석하는 정확한 타로 리딩. 연애, 직업, 금전운 등 모든 고민에 대한 통찰을 얻으세요.',
    images: [
      {
        url: '/images/tarot-og.png',
        width: 1200,
        height: 630,
        alt: 'InnerSpell 타로 카드 리딩',
      },
    ],
  },
};