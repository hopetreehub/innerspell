import Script from 'next/script';

interface BlogPostJsonLdProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    author: string;
    publishedAt: Date;
    updatedAt?: Date;
    readingTime: number;
    image: string;
    featured: boolean;
  };
}

export function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://innerspell.com${post.image}`,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://innerspell.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'InnerSpell',
      logo: {
        '@type': 'ImageObject',
        url: 'https://innerspell.com/logo.png',
      },
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://innerspell.com/blog/${post.id}`,
    },
    url: `https://innerspell.com/blog/${post.id}`,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readingTime}M`,
    keywords: post.tags.join(', '),
    about: [
      {
        '@type': 'Thing',
        name: '타로 카드',
        description: '타로 카드 해석과 영적 성장을 위한 도구',
      },
      {
        '@type': 'Thing',
        name: '자기계발',
        description: '개인 성장과 목표 달성을 위한 실전 전략',
      },
      {
        '@type': 'Thing',
        name: '영적 성장',
        description: '내면의 평화와 영적 발전을 위한 수행법',
      },
    ],
    audience: {
      '@type': 'Audience',
      name: '영적 성장과 자기계발에 관심 있는 사람들',
    },
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="blog-post-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BlogMainJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'InnerSpell 블로그',
    description: 'AI 시대 영적 성장과 자기계발을 위한 타로 카드 해석, 점술 지식, 꿈해몽 가이드, 실전 성공 전략을 제공합니다.',
    url: 'https://innerspell.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'InnerSpell',
      logo: {
        '@type': 'ImageObject',
        url: 'https://innerspell.com/logo.png',
      },
      url: 'https://innerspell.com',
    },
    about: [
      {
        '@type': 'Thing',
        name: '타로 카드',
        description: '타로 카드 해석과 영적 성장을 위한 도구',
      },
      {
        '@type': 'Thing',
        name: '자기계발',
        description: '개인 성장과 목표 달성을 위한 실전 전략',
      },
      {
        '@type': 'Thing',
        name: '꿈해몽',
        description: '꿈의 상징과 메시지를 통한 내면 탐구',
      },
      {
        '@type': 'Thing',
        name: '영적 성장',
        description: '내면의 평화와 영적 발전을 위한 수행법',
      },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: '블로그 카테고리',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Thing',
            name: '타로',
            description: '타로 카드 해석과 실전 활용법',
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Thing',
            name: '꿈해몽',
            description: '꿈의 상징과 메시지 해석',
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Thing',
            name: '영성',
            description: '명상과 영적 성장 수행법',
          },
        },
        {
          '@type': 'ListItem',
          position: 4,
          item: {
            '@type': 'Thing',
            name: '자기계발',
            description: '목표 달성과 개인 성장 전략',
          },
        },
      ],
    },
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="blog-main-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BlogTagJsonLd({ tag }: { tag: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag} 태그 포스트 | InnerSpell 블로그`,
    description: `${tag} 태그와 관련된 모든 포스트를 찾아보세요. AI 시대 영적 성장과 자기계발을 위한 인사이트를 제공합니다.`,
    url: `https://innerspell.com/blog/tag/${encodeURIComponent(tag)}`,
    isPartOf: {
      '@type': 'Blog',
      name: 'InnerSpell 블로그',
      url: 'https://innerspell.com/blog',
    },
    about: {
      '@type': 'Thing',
      name: tag,
      description: `${tag} 관련 콘텐츠`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'InnerSpell',
      logo: {
        '@type': 'ImageObject',
        url: 'https://innerspell.com/logo.png',
      },
      url: 'https://innerspell.com',
    },
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="blog-tag-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BlogCategoryJsonLd({ category }: { category: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category} 카테고리 | InnerSpell 블로그`,
    description: `${category} 카테고리의 모든 포스트를 찾아보세요. AI 시대 영적 성장과 자기계발을 위한 인사이트를 제공합니다.`,
    url: `https://innerspell.com/blog/category/${encodeURIComponent(category)}`,
    isPartOf: {
      '@type': 'Blog',
      name: 'InnerSpell 블로그',
      url: 'https://innerspell.com/blog',
    },
    about: {
      '@type': 'Thing',
      name: category,
      description: `${category} 관련 콘텐츠`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'InnerSpell',
      logo: {
        '@type': 'ImageObject',
        url: 'https://innerspell.com/logo.png',
      },
      url: 'https://innerspell.com',
    },
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="blog-category-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}