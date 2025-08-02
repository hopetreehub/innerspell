
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostDetail } from '@/components/blog/BlogPostDetail';
import { loadBlogPostBySlug, loadFeaturedPosts } from '@/lib/blog/posts-loader';
import { BlogPostJsonLd } from '@/components/blog/BlogJsonLd';

// Dynamic generation for better build performance
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1시간마다 재검증

// Only pre-generate featured posts to speed up build
export async function generateStaticParams() {
  // Only generate static pages for featured posts
  const featuredPosts = await loadFeaturedPosts();
  return featuredPosts
    .slice(0, 5) // Limit to 5 featured posts
    .map((post) => ({
      slug: post.id,
    }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadBlogPostBySlug(slug);

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
      publishedTime: post.publishedAt.toISOString(),
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
  const post = await loadBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <BlogPostJsonLd post={post} />
      <BlogPostDetail post={post} />
    </>
  );
}
