import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogMainServer } from '@/components/blog/BlogMainServer';
import { BlogCategoryJsonLd } from '@/components/blog/BlogJsonLd';
import { mockPosts } from '@/lib/blog/posts';

// 정적 생성으로 변경하여 성능 최적화
export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간마다 재검증

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

// 유효한 카테고리 목록
const validCategories = [
  '타로-가이드', 
  '점술-지식', 
  '꿈해몽-정보', 
  '영성-힐링',
  '자기계발',
  '성공전략',
  '직관력-개발'
];

// 카테고리 한글 매핑
const categoryMap: Record<string, string> = {
  '타로-가이드': '타로 가이드',
  '점술-지식': '점술 지식',
  '꿈해몽-정보': '꿈해몽 정보',
  '영성-힐링': '영성 및 힐링',
  '자기계발': '자기계발',
  '성공전략': '성공 전략',
  '직관력-개발': '직관력 개발'
};

export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  
  if (!validCategories.includes(category)) {
    return {
      title: '카테고리를 찾을 수 없습니다 | InnerSpell',
    };
  }

  const categoryName = categoryMap[category] || category;
  const description = `${categoryName} 관련 전문 콘텐츠를 확인하세요. AI 시대 영적 성장과 자기계발을 위한 실전 가이드를 제공합니다.`;

  return {
    title: `${categoryName} | InnerSpell 블로그`,
    description,
    keywords: [
      categoryName,
      '타로', '점술', '꿈해몽', '자기계발',
      'InnerSpell', '영성', '직관력', '성공전략'
    ],
    openGraph: {
      title: `${categoryName} - InnerSpell 블로그`,
      description,
      type: 'website',
      url: `https://innerspell.com/blog/category/${category}`,
      images: [
        {
          url: `/images/category-${category}-og.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryName} - InnerSpell`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} - InnerSpell`,
      description,
      images: [`/images/category-${category}-og.jpg`],
    },
    alternates: {
      canonical: `https://innerspell.com/blog/category/${category}`,
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
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page, search } = await searchParams;
  
  if (!validCategories.includes(category)) {
    notFound();
  }

  const currentPage = parseInt(page || '1', 10);
  const categoryName = categoryMap[category] || category;
  
  // 카테고리별 포스트 필터링
  let filteredPosts = mockPosts.filter(post => 
    post.published && post.category === categoryName
  );
  
  // 검색 필터링
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
    // 1순위: Featured 여부
    if (a.featured !== b.featured) {
      return b.featured ? 1 : -1;
    }
    
    // 2순위: 발행 날짜 (최신순)
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <>
      <BlogCategoryJsonLd category={categoryName} />
      <BlogMainServer 
        initialPosts={filteredPosts} 
        currentPage={currentPage}
        selectedCategory={categoryName}
        pageTitle={`${categoryName} 포스트`}
      />
    </>
  );
}