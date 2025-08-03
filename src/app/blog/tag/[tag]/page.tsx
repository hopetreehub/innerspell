import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogMainServer } from '@/components/blog/BlogMainServer';
import { BlogTagJsonLd } from '@/components/blog/BlogJsonLd';
import { mockPosts } from '@/lib/blog/posts';

// 정적 생성으로 변경하여 성능 최적화
export const dynamic = 'force-static';
export const revalidate = 3600; // 1시간마다 재검증

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

// 사용 가능한 모든 태그 수집
export async function generateStaticParams() {
  const allTags = new Set<string>();
  
  mockPosts.forEach(post => {
    post.tags.forEach(tag => {
      allTags.add(encodeURIComponent(tag));
    });
  });
  
  return Array.from(allTags).map((tag) => ({
    tag,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  // 태그가 실제로 사용되는지 확인
  const hasPostsWithTag = mockPosts.some(post => 
    post.published && post.tags.includes(decodedTag)
  );
  
  if (!hasPostsWithTag) {
    return {
      title: '태그를 찾을 수 없습니다 | InnerSpell',
    };
  }

  const description = `${decodedTag} 태그 관련 콘텐츠를 확인하세요. AI 시대 영적 성장과 자기계발을 위한 전문 가이드를 제공합니다.`;

  return {
    title: `${decodedTag} | InnerSpell 블로그`,
    description,
    keywords: [
      decodedTag,
      '타로', '점술', '꿈해몽', '자기계발',
      'InnerSpell', '영성', '직관력', '성공전략'
    ],
    openGraph: {
      title: `${decodedTag} - InnerSpell 블로그`,
      description,
      type: 'website',
      url: `https://innerspell.com/blog/tag/${tag}`,
      images: [
        {
          url: '/images/blog-tag-og.jpg',
          width: 1200,
          height: 630,
          alt: `${decodedTag} - InnerSpell`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedTag} - InnerSpell`,
      description,
      images: ['/images/blog-tag-og.jpg'],
    },
    alternates: {
      canonical: `https://innerspell.com/blog/tag/${tag}`,
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

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page, search } = await searchParams;
  
  const decodedTag = decodeURIComponent(tag);
  const currentPage = parseInt(page || '1', 10);
  
  // 태그별 포스트 필터링
  let filteredPosts = mockPosts.filter(post => 
    post.published && post.tags.includes(decodedTag)
  );
  
  if (filteredPosts.length === 0) {
    notFound();
  }
  
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
      <BlogTagJsonLd tag={decodedTag} />
      <BlogMainServer 
        initialPosts={filteredPosts} 
        currentPage={currentPage}
        selectedTag={decodedTag}
        pageTitle={`"${decodedTag}" 태그 포스트`}
      />
    </>
  );
}