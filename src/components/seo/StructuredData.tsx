'use client';

import Script from 'next/script';

interface WebsiteStructuredDataProps {
  url: string;
  name: string;
  description: string;
}

export function WebsiteStructuredData({ url, name, description }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "InnerSpell",
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/logo.png`
      }
    }
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

interface OrganizationStructuredDataProps {
  url: string;
}

export function OrganizationStructuredData({ url }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "InnerSpell",
    "url": url,
    "logo": `${url}/logo.png`,
    "description": "AI 기반 타로 해석과 영적 성장을 위한 현대적인 타로 서비스",
    "foundingDate": "2024",
    "specialty": ["타로 카드 리딩", "AI 타로 해석", "영적 상담", "타로 교육"],
    "serviceType": "타로 및 영적 상담 서비스",
    "areaServed": {
      "@type": "Country",
      "name": "대한민국"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Korean"
    }
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

interface BlogStructuredDataProps {
  url: string;
  posts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    author: string;
    tags: string[];
  }>;
}

export function BlogStructuredData({ url, posts }: BlogStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "InnerSpell 블로그",
    "description": "AI 타로, 영적 성장, 타로 카드 해석에 관한 통찰과 가이드",
    "url": `${url}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "InnerSpell"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `${url}/blog/${post.slug}`,
      "description": post.excerpt,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "keywords": post.tags.join(", "),
      "publisher": {
        "@type": "Organization",
        "name": "InnerSpell"
      }
    }))
  };

  return (
    <Script
      id="blog-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

interface TarotServiceStructuredDataProps {
  url: string;
}

export function TarotServiceStructuredData({ url }: TarotServiceStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI 타로 카드 리딩",
    "description": "인공지능 AI 기반 타로 카드 해석 및 영적 상담 서비스",
    "url": `${url}/reading`,
    "provider": {
      "@type": "Organization",
      "name": "InnerSpell"
    },
    "serviceType": "타로 카드 리딩",
    "category": "영적 상담",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW",
      "availability": "https://schema.org/InStock",
      "description": "무료 AI 타로 카드 리딩 서비스"
    },
    "areaServed": {
      "@type": "Country",
      "name": "대한민국"
    },
    "availableLanguage": "Korean"
  };

  return (
    <Script
      id="tarot-service-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}