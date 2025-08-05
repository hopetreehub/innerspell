'use client';

import { MDXBlogPost } from '@/lib/blog/mdx-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { BlogComments } from './BlogComments';
import { RecommendedPostsSidebar } from './RecommendedPostsSidebar';
import { BlogPostJsonLd } from './BlogJsonLd';
import { MDXRenderer } from './MDXRenderer';
// import { getAllMDXPosts } from '@/lib/blog/mdx-loader'; // Moved to API

interface MDXPostDetailProps {
  post: MDXBlogPost;
}

export function MDXPostDetail({ post }: MDXPostDetailProps) {
  const { toast } = useToast();
  const [relatedPosts, setRelatedPosts] = useState<Omit<MDXBlogPost, 'content'>[]>([]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch('/api/blog/mdx-posts');
        if (!response.ok) {
          console.error('Failed to fetch MDX posts');
          return;
        }
        
        const data = await response.json();
        const allPosts = data.posts || [];
        
        const related = allPosts
          .filter(p => p.slug !== post.slug)
          .filter(p => 
            p.category === post.category || 
            p.tags.some(tag => post.tags.includes(tag))
          )
          .sort((a, b) => {
            const aScore = (a.category === post.category ? 2 : 0) +
                          a.tags.filter(tag => post.tags.includes(tag)).length;
            const bScore = (b.category === post.category ? 2 : 0) +
                          b.tags.filter(tag => post.tags.includes(tag)).length;
            return bScore - aScore;
          })
          .slice(0, 5);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [post]);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const title = post.title;
    const text = post.excerpt;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // 사용자가 취소한 경우 에러 무시
      }
    } else {
      // 브라우저가 Web Share API를 지원하지 않는 경우
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: '링크가 복사되었습니다',
          description: '클립보드에 포스트 링크가 복사되었습니다.',
        });
      } catch (error) {
        toast({
          title: '링크 복사 실패',
          description: '링크를 복사하는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    }
  };

  // BlogPost 타입으로 변환 (기존 컴포넌트와 호환성을 위해)
  const legacyPost = {
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: '', // MDX는 별도 렌더링
    publishedAt: new Date(post.publishedAt),
    category: post.category,
    tags: post.tags,
    author: post.author,
    image: post.image,
    featured: post.featured,
    readingTime: post.readingTime,
    published: post.published
  };

  return (
    <>
      <BlogPostJsonLd post={legacyPost} />
      <div className="min-h-screen bg-background">
        {/* 상단 네비게이션 */}
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              블로그로 돌아가기
            </Button>
          </Link>
        </div>

        {/* 메인 컨텐츠 - 사이드바와 함께 */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 메인 포스트 영역 */}
            <div className="lg:flex-1">
              {/* 헤더 이미지 */}
              <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                  priority
                />
                {post.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 text-primary-foreground">
                      추천 포스트
                    </Badge>
                  </div>
                )}
              </div>

              {/* 포스트 헤더 */}
              <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold text-primary mb-4">
                  {post.title}
                </h1>
                
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* 메타 정보 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.publishedAt), 'yyyy년 M월 d일', { locale: ko })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime}분 읽기
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                </div>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <Button onClick={handleShare} variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    공유하기
                  </Button>
                </div>
              </div>

              <Separator className="mb-8" />

              {/* MDX 포스트 컨텐츠 */}
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <MDXRenderer content={post.content} />
                </CardContent>
              </Card>

              {/* 포스트 하단 */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      이 포스트가 도움이 되었다면 다른 분들과 공유해보세요.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleShare} variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      공유하기
                    </Button>
                    <Link href="/blog">
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        더 많은 포스트 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 관련 포스트 섹션 */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-6">
                    관련 포스트
                  </h3>
                  <div className="space-y-3">
                    {relatedPosts.map((relatedPost) => (
                      <Link 
                        key={relatedPost.slug} 
                        href={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(relatedPost.publishedAt), 'M월 d일', { locale: ko })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {relatedPost.readingTime}분
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {relatedPost.category}
                              </Badge>
                            </div>
                          </div>
                          <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 댓글 섹션 */}
              <BlogComments postId={post.slug} />
            </div>
            
            {/* 사이드바 - 추천 포스트 */}
            <RecommendedPostsSidebar currentPostId={post.slug} />
          </div>
        </div>
      </div>
    </>
  );
}