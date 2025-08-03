
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostDetail } from '@/components/blog/BlogPostDetail';
import { MDXPostDetail } from '@/components/blog/MDXPostDetail';
import { loadBlogPostBySlug, loadFeaturedPosts } from '@/lib/blog/posts-loader';
import { loadMDXPostBySlug } from '@/lib/blog/mdx-loader';
import { BlogPostJsonLd } from '@/components/blog/BlogJsonLd';

// Use on-demand generation to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = false; // Disable ISR for now

// Disable static generation to prevent build timeout
// Pages will be generated on-demand
// export async function generateStaticParams() {
//   return [];
// }

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try MDX first, then fallback to regular posts
  let post = await loadMDXPostBySlug(slug);
  let isMDX = true;
  
  if (!post) {
    const regularPost = await loadBlogPostBySlug(slug);
    if (regularPost) {
      // Convert regular post to MDX-like structure for metadata
      post = {
        slug: regularPost.id,
        title: regularPost.title,
        excerpt: regularPost.excerpt,
        publishedAt: regularPost.publishedAt.toISOString(),
        tags: regularPost.tags,
        author: regularPost.author,
        image: regularPost.image,
        category: regularPost.category,
        featured: regularPost.featured,
        published: regularPost.published,
        readingTime: regularPost.readingTime,
        content: null as any // Not needed for metadata
      };
      isMDX = false;
    }
  }

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 | InnerSpell',
    };
  }

  const publishedTime = typeof post.publishedAt === 'string' 
    ? post.publishedAt 
    : post.publishedAt.toISOString();

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
      publishedTime,
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
  
  // Try MDX first, then fallback to regular posts
  const mdxPost = await loadMDXPostBySlug(slug);
  
  if (mdxPost) {
    return <MDXPostDetail post={mdxPost} />;
  }
  
  // Fallback to regular blog post
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
