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

interface BlogCategoryJsonLdProps {
  category: string;
}

export function BlogCategoryJsonLd({ category }: BlogCategoryJsonLdProps) {
  const categoryDescriptions: Record<string, string> = {
    '타로 가이드': '타로 카드 의미 해석, 스프레드 활용법, 초보자를 위한 타로 입문 가이드',
    '점술 지식': '사주팔자, 동양 점술, 점술 역사와 문화에 대한 전문 지식',
    '꿈해몽 정보': '꿈 상징 해석, 자주 꾸는 꿈의 의미, 꿈 기록 및 분석 팁',
    '영성 및 힐링': '명상, 마음챙김, 차크라, 에너지 워크, 스트레스 관리',
    '자기계발': 'AI 시대 개인 성장, 목표 달성, 성공 전략, 생산성 향상',
    '성공 전략': '실전 성공 전략, 목표 설정, 습관 형성, 현실 창조',
    '직관력 개발': '직감 향상, 감정 지능, 창의적 사고, 내면 지혜 개발'
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category} - InnerSpell 블로그`,
    description: categoryDescriptions[category] || `${category} 관련 전문 콘텐츠를 확인하세요.`,
    url: `https://innerspell.com/blog/category/${encodeURIComponent(category)}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${category} 포스트 목록`,
      description: `${category} 카테고리의 블로그 포스트들`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': 'https://innerspell.com',
            name: 'InnerSpell'
          }
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': 'https://innerspell.com/blog',
            name: '블로그'
          }
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@id': `https://innerspell.com/blog/category/${encodeURIComponent(category)}`,
            name: category
          }
        }
      ]
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

interface BlogTagJsonLdProps {
  tag: string;
}

export function BlogTagJsonLd({ tag }: BlogTagJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `"${tag}" 태그 - InnerSpell 블로그`,
    description: `${tag} 태그 관련 콘텐츠를 확인하세요. AI 시대 영적 성장과 자기계발을 위한 전문 가이드를 제공합니다.`,
    url: `https://innerspell.com/blog/tag/${encodeURIComponent(tag)}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `"${tag}" 태그 포스트 목록`,
      description: `${tag} 태그가 포함된 블로그 포스트들`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@id': 'https://innerspell.com',
            name: 'InnerSpell'
          }
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@id': 'https://innerspell.com/blog',
            name: '블로그'
          }
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@id': `https://innerspell.com/blog/tag/${encodeURIComponent(tag)}`,
            name: `"${tag}" 태그`
          }
        }
      ]
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
    keywords: [tag, '타로', '점술', '꿈해몽', '자기계발', 'InnerSpell'],
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