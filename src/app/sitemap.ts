import { MetadataRoute } from 'next'
import { getAllMDXPosts } from '@/lib/blog/mdx-loader'
import { getAllPosts } from '@/lib/blog/posts'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test-studio-firebase.vercel.app';
  
  // Get all blog posts
  const [mdxPosts, regularPosts] = await Promise.all([
    getAllMDXPosts(),
    getAllPosts()
  ]);
  
  // Blog post URLs
  const mdxPostUrls = mdxPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  const regularPostUrls = regularPosts.map(post => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.publishedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  // Blog category URLs
  const categories = ['타로-가이드', '점술-지식', '꿈해몽-정보', '영성-힐링', '자기계발', '성공전략', '직관력-개발'];
  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  // Blog tag URLs - get unique tags from both MDX and regular posts
  const allTags = new Set<string>();
  mdxPosts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));
  regularPosts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));
  
  const tagUrls = Array.from(allTags).map(tag => ({
    url: `${baseUrl}/blog/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/reading`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tarot`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community/reading-share`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community/free-discussion`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    // Add all blog post URLs
    ...mdxPostUrls,
    ...regularPostUrls,
    // Add blog category URLs
    ...categoryUrls,
    // Add blog tag URLs
    ...tagUrls,
  ]
}