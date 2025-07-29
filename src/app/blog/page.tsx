import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '블로그 | InnerSpell - 타로, 점술, 꿈해몽, 자기계발 전문 블로그',
  description: 'AI 시대 영적 성장과 자기계발을 위한 타로 카드 해석, 점술 지식, 꿈해몽 가이드, 실전 성공 전략을 제공합니다.',
  keywords: [
    '타로', '점술', '꿈해몽', '자기계발', '타로카드', '운세', '영성', '명상',
    'InnerSpell', '목표설정', '성공전략', 'AI시대', '직관력', '생산성',
    '영적성장', '현실창조', '무의식', '습관형성', '2025년', '개인성장',
    '타로 자기계발', '꿈해몽 목표달성', '영성 생산성', '30분루틴'
  ],
  openGraph: {
    title: 'InnerSpell 블로그 - 영적 성장과 자기계발의 완벽한 조화',
    description: 'AI 시대에 필요한 직관력 개발부터 실전 성공 전략까지. 타로, 꿈해몽, 자기계발을 통합한 혁신적 콘텐츠를 만나보세요.',
    type: 'website',
    url: 'https://innerspell.com/blog',
    images: [
      {
        url: '/images/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'InnerSpell 블로그 - 영적 성장과 자기계발',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnerSpell 블로그 - 영적 성장 × 자기계발',
    description: 'AI 시대 직관력 개발과 실전 성공 전략',
    images: ['/images/blog-og-image.jpg'],
  },
  alternates: {
    canonical: 'https://innerspell.com/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { BlogMainServer } from '@/components/blog/BlogMainServer';
import { mockPosts } from '@/lib/blog/posts';

// 정적 생성으로 변경하여 성능 최적화
export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간마다 재검증

type SearchParams = Promise<{
  page?: string;
  category?: string;
  search?: string;
}>;

interface BlogPageProps {
  searchParams: SearchParams;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const category = params.category;
  const search = params.search;
  
  // 필터링 로직
  let filteredPosts = mockPosts.filter(post => post.published);
  
  if (category && category !== '전체') {
    filteredPosts = filteredPosts.filter(post => post.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Featured 우선 + 날짜순 이중 정렬
  filteredPosts.sort((a, b) => {
    // 1순위: Featured 여부 (featured가 true인 것이 먼저)
    if (a.featured !== b.featured) {
      return b.featured ? 1 : -1;
    }
    
    // 2순위: 발행 날짜 (최신순)
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  return <BlogMainServer initialPosts={filteredPosts} currentPage={currentPage} />;
}