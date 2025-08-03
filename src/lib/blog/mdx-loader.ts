import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export interface BlogPostMatter {
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  tags: string[];
  author: string;
  image: string;
  featured: boolean;
  published: boolean;
}

export interface MDXBlogPost extends BlogPostMatter {
  slug: string;
  content: MDXRemoteSerializeResult;
  readingTime: number;
}

const contentDirectory = path.join(process.cwd(), 'content/blog');

// 읽기 시간 계산 (평균 읽기 속도: 분당 200단어)
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// 슬러그에서 파일 경로 생성
function getPostPath(slug: string): string {
  return path.join(contentDirectory, `${slug}.mdx`);
}

// 모든 MDX 포스트의 슬러그 가져오기
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    if (!fs.existsSync(contentDirectory)) {
      return [];
    }
    
    const files = fs.readdirSync(contentDirectory);
    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''));
  } catch (error) {
    console.error('Error getting post slugs:', error);
    return [];
  }
}

// 슬러그로 포스트 로드
export async function loadMDXPostBySlug(slug: string): Promise<MDXBlogPost | null> {
  try {
    const postPath = getPostPath(slug);
    
    if (!fs.existsSync(postPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(postPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 발행되지 않은 포스트는 반환하지 않음
    if (!data.published) {
      return null;
    }
    
    // MDX 콘텐츠 시리얼라이즈
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
        development: process.env.NODE_ENV === 'development',
      },
    });
    
    return {
      slug,
      content: mdxSource,
      readingTime: calculateReadingTime(content),
      ...(data as BlogPostMatter),
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}

// 모든 발행된 포스트 로드 (메타데이터만)
export async function getAllMDXPosts(): Promise<Omit<MDXBlogPost, 'content'>[]> {
  try {
    const slugs = await getAllPostSlugs();
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const postPath = getPostPath(slug);
        
        if (!fs.existsSync(postPath)) {
          return null;
        }
        
        const fileContents = fs.readFileSync(postPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        // 발행되지 않은 포스트는 제외
        if (!data.published) {
          return null;
        }
        
        return {
          slug,
          readingTime: calculateReadingTime(content),
          ...(data as BlogPostMatter),
        };
      })
    );
    
    return posts
      .filter((post): post is Omit<MDXBlogPost, 'content'> => post !== null)
      .sort((a, b) => {
        // Featured 우선 + 날짜순 정렬
        if (a.featured !== b.featured) {
          return b.featured ? 1 : -1;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  } catch (error) {
    console.error('Error loading all posts:', error);
    return [];
  }
}

// 카테고리별 포스트 로드
export async function getMDXPostsByCategory(category: string): Promise<Omit<MDXBlogPost, 'content'>[]> {
  const allPosts = await getAllMDXPosts();
  return allPosts.filter(post => post.category === category);
}

// 태그별 포스트 로드
export async function getMDXPostsByTag(tag: string): Promise<Omit<MDXBlogPost, 'content'>[]> {
  const allPosts = await getAllMDXPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

// 관련 포스트 추천 (같은 카테고리 또는 태그)
export async function getRelatedMDXPosts(
  currentSlug: string, 
  category: string, 
  tags: string[], 
  limit = 3
): Promise<Omit<MDXBlogPost, 'content'>[]> {
  const allPosts = await getAllMDXPosts();
  
  // 현재 포스트 제외
  const otherPosts = allPosts.filter(post => post.slug !== currentSlug);
  
  // 관련도 점수 계산
  const scoredPosts = otherPosts.map(post => {
    let score = 0;
    
    // 같은 카테고리면 +3점
    if (post.category === category) {
      score += 3;
    }
    
    // 공통 태그 개수 × 1점
    const commonTags = post.tags.filter(tag => tags.includes(tag));
    score += commonTags.length;
    
    return { ...post, score };
  });
  
  // 점수순 정렬 후 상위 포스트 반환
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...post }) => post);
}