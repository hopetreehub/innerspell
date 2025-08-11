
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostDetail } from '@/components/blog/BlogPostDetail';
import { getAllPostsFromFile } from '@/services/blog-service-file';
import { BlogPostJsonLd } from '@/components/blog/BlogJsonLd';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  console.log('generateMetadata: Looking for slug:', slug);
  
  const posts = await getAllPostsFromFile();
  console.log('generateMetadata: Found', posts.length, 'posts');
  console.log('generateMetadata: Post IDs:', posts.map(p => p.id));
  
  const post = posts.find(p => p.id === slug);
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
      url: `https://innerspell.com/blog/${slug}`,
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
  
  const posts = await getAllPostsFromFile();
  console.log('BlogPostPage: Found', posts.length, 'posts');
  console.log('BlogPostPage: Post IDs:', posts.map(p => p.id));
  
  const post = posts.find(p => p.id === slug);
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
