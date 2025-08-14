
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostDetail } from '@/components/blog/BlogPostDetail';
import { getAllPostsFromFile } from '@/services/blog-service-file';
import { BlogPostJsonLd } from '@/components/blog/BlogJsonLd';
import { mockPosts } from '@/lib/blog/posts';

type Props = {
  params: Promise<{ slug: string }>;
};

// generateStaticParams 추가 - 모든 블로그 포스트의 정적 페이지 생성
export async function generateStaticParams() {
  console.log('generateStaticParams: Generating static params for blog posts');
  
  // Mock 데이터를 우선 사용, fallback으로 file storage 시도
  let posts = mockPosts;
  
  try {
    const filePosts = await getAllPostsFromFile();
    if (filePosts.length > 0) {
      posts = filePosts;
      console.log(`generateStaticParams: Using ${filePosts.length} posts from file storage`);
    } else {
      console.log(`generateStaticParams: Using ${mockPosts.length} mock posts as fallback`);
    }
  } catch (error) {
    console.log('generateStaticParams: File storage failed, using mock posts');
  }
  
  const params = posts
    .filter(post => post.published) // published 포스트만
    .map((post) => ({
      slug: post.slug || post.id, // slug 우선, fallback으로 id
    }));
  
  console.log('generateStaticParams: Generated params for:', params.map(p => p.slug));
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  console.log('generateMetadata: Looking for slug:', slug);
  
  // Mock 데이터를 우선 사용, fallback으로 file storage 시도
  let posts = mockPosts;
  
  try {
    const filePosts = await getAllPostsFromFile();
    if (filePosts.length > 0) {
      posts = filePosts;
      console.log('generateMetadata: Using file storage posts');
    } else {
      console.log('generateMetadata: Using mock posts as fallback');
    }
  } catch (error) {
    console.log('generateMetadata: File storage failed, using mock posts');
  }
  
  console.log('generateMetadata: Found', posts.length, 'posts');
  console.log('generateMetadata: Available posts:', posts.map(p => ({ id: p.id, slug: p.slug })));
  
  const post = posts.find(p => p.slug === slug || p.id === slug); // slug로 먼저 찾고, 없으면 id로 찾기
  console.log('generateMetadata: Found post:', post ? post.title : 'NOT FOUND');

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 | InnerSpell',
    };
  }

  return {
    title: `${post.title} | InnerSpell 블로그`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://innerspell.com/blog/${post.slug || slug}`,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : new Date(post.publishedAt).toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  console.log('BlogPostPage: Looking for slug:', slug);
  
  // Mock 데이터를 우선 사용, fallback으로 file storage 시도
  let posts = mockPosts;
  
  try {
    const filePosts = await getAllPostsFromFile();
    if (filePosts.length > 0) {
      posts = filePosts;
      console.log('BlogPostPage: Using file storage posts');
    } else {
      console.log('BlogPostPage: Using mock posts as fallback');
    }
  } catch (error) {
    console.log('BlogPostPage: File storage failed, using mock posts');
  }
  
  console.log('BlogPostPage: Found', posts.length, 'posts');
  console.log('BlogPostPage: Available posts:', posts.map(p => ({ id: p.id, slug: p.slug })));
  
  const post = posts.find(p => p.slug === slug || p.id === slug); // slug로 먼저 찾고, 없으면 id로 찾기
  console.log('BlogPostPage: Found post:', post ? post.title : 'NOT FOUND');

  if (!post) {
    console.log('BlogPostPage: Calling notFound() for slug:', slug);
    notFound();
  }

  return (
    <>
      <BlogPostJsonLd post={post} />
      <BlogPostDetail post={post} />
    </>
  );
}
