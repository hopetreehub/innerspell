import Script from 'next/script';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      strategy="beforeInteractive"
    />
  );
}

// 웹사이트 전체 구조화 데이터
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'InnerSpell',
  alternateName: '이너스펠',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://innerspell.com',
  description: 'AI 기반 타로 리딩, 꿈해몽, 영성 콘텐츠를 제공하는 현대적인 영적 플랫폼',
  publisher: {
    '@type': 'Organization',
    name: 'InnerSpell',
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// 타로 서비스 구조화 데이터
export const tarotServiceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: '온라인 타로 카드 리딩',
  provider: {
    '@type': 'Organization',
    name: 'InnerSpell',
  },
  name: 'AI 타로 카드 리딩 서비스',
  description: '인공지능 기반의 정확하고 개인화된 타로 카드 리딩 서비스',
  areaServed: {
    '@type': 'Country',
    name: '대한민국',
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/tarot`,
    serviceLocation: {
      '@type': 'VirtualLocation',
      name: 'InnerSpell 온라인 플랫폼',
    },
  },
};

// 블로그 구조화 데이터
export const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'InnerSpell 블로그',
  description: '타로, 영성, 명상에 관한 인사이트와 가이드',
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
  publisher: {
    '@type': 'Organization',
    name: 'InnerSpell',
  },
};