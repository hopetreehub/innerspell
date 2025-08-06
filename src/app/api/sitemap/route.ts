import { NextResponse } from 'next/server';
import { mockPosts } from '@/lib/blog/posts';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://innerspell.com';
  
  // 정적 페이지들
  const staticPages = [
    '',
    '/tarot',
    '/reading',
    '/dream-interpretation',
    '/blog',
    '/community',
    '/profile',
    '/privacy-policy',
    '/terms-of-service'
  ];
  
  // 블로그 포스트들
  const blogPosts = mockPosts
    .filter(post => post.published)
    .map(post => ({
      url: `/blog/${post.id}`,
      lastmod: post.updatedAt || post.publishedAt,
      changefreq: 'monthly',
      priority: 0.7
    }));
  
  // XML 생성
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // 정적 페이지 추가
  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${page}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  // 블로그 포스트 추가
  blogPosts.forEach(post => {
    xml += `  <url>\n`;
    xml += `    <loc>${siteUrl}${post.url}</loc>\n`;
    xml += `    <lastmod>${new Date(post.lastmod).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${post.changefreq}</changefreq>\n`;
    xml += `    <priority>${post.priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  
  xml += '</urlset>';
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}