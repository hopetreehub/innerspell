'use client';

import { BlogPost, getAllPosts } from '@/lib/blog/posts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { useAuth } from '@/context/AuthContext';

interface BlogPostDetailProps {
  post: BlogPost;
}

export function BlogPostDetail({ post }: BlogPostDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      const allPosts = await getAllPosts();
      const related = allPosts
        .filter(p => p.id !== post.id)
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
    };

    fetchRelatedPosts();
    
    // 블로그 조회 활동 기록
    const recordBlogView = async () => {
      try {
        await fetch('/api/admin/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid || 'guest',
            action: 'blog_view',
            details: {
              postId: post.id,
              postTitle: post.title,
              category: post.category
            }
          })
        });
      } catch (error) {
        console.error('Failed to record blog view:', error);
      }
    };
    
    recordBlogView();
  }, [post, user]);

  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${post.id}`;
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

  // 마크다운 스타일 텍스트를 HTML로 변환 (개선된 변환)
  const formatContent = (content: string) => {
    // 먼저 줄바꿈을 통일
    let formatted = content.replace(/\r\n/g, '\n');
    
    // 코드 블록 보호
    const codeBlocks: string[] = [];
    formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });
    
    // 인라인 코드 보호
    const inlineCodes: string[] = [];
    formatted = formatted.replace(/`[^`]+`/g, (match) => {
      inlineCodes.push(match);
      return `__INLINE_CODE_${inlineCodes.length - 1}__`;
    });
    
    // 헤더 변환
    formatted = formatted
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 mt-5">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mb-2 mt-3">$1</h4>');
    
    // 리스트 변환
    formatted = formatted
      .replace(/^[\*\-] (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 mb-1 list-decimal">$1</li>')
      .replace(/(<li class="ml-6[^"]*">[^<]+<\/li>\n?)+/g, (match) => {
        const isOrdered = match.includes('list-decimal');
        const tag = isOrdered ? 'ol' : 'ul';
        return `<${tag} class="mb-4">${match}</${tag}>`;
      });
    
    // 굵은 글씨와 이탤릭
    formatted = formatted
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 문단 처리
    const lines = formatted.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        if (!inList) processedLines.push('</p><p class="mb-4">');
        inList = false;
      } else if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol')) {
        processedLines.push(line);
        inList = line.startsWith('<ul') || line.startsWith('<ol');
      } else if (!line.startsWith('<')) {
        if (!inList) {
          processedLines.push(line);
        }
        inList = false;
      } else {
        processedLines.push(line);
      }
    }
    
    formatted = '<p class="mb-4">' + processedLines.join('\n') + '</p>';
    
    // 빈 문단 제거
    formatted = formatted
      .replace(/<p class="mb-4">\s*<\/p>/g, '')
      .replace(/<p class="mb-4">\s*<h/g, '<h')
      .replace(/<\/h([1-6])>\s*<\/p>/g, '</h$1>')
      .replace(/<p class="mb-4">\s*<ul/g, '<ul')
      .replace(/<\/ul>\s*<\/p>/g, '</ul>')
      .replace(/<p class="mb-4">\s*<ol/g, '<ol')
      .replace(/<\/ol>\s*<\/p>/g, '</ol>');
    
    // 코드 블록 복원
    codeBlocks.forEach((block, i) => {
      const code = block.replace(/```(\w*)\n([\s\S]*?)```/, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4"><code>$2</code></pre>');
      formatted = formatted.replace(`__CODE_BLOCK_${i}__`, code);
    });
    
    // 인라인 코드 복원
    inlineCodes.forEach((code, i) => {
      const inlineCode = code.replace(/`([^`]+)`/, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
      formatted = formatted.replace(`__INLINE_CODE_${i}__`, inlineCode);
    });
    
    return formatted;
  };

  return (
    <>
      <BlogPostJsonLd post={post} />
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
                {format(post.publishedAt, 'yyyy년 M월 d일', { locale: ko })}
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
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
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

          {/* 포스트 컨텐츠 */}
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div 
                className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-headline prose-headings:text-primary prose-p:text-foreground dark:prose-p:text-white prose-strong:text-primary dark:prose-strong:text-white prose-li:text-foreground dark:prose-li:text-white leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />
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

          {/* 관련 포스트 섹션 - 간단한 리스트 형태 */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-headline font-bold text-primary mb-6">
                관련 포스트
              </h3>
              <div className="space-y-3">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    href={`/blog/${relatedPost.id}`}
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
                            {format(relatedPost.publishedAt, 'M월 d일', { locale: ko })}
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
          <BlogComments postId={post.id} />
          </div>
          
          {/* 사이드바 - 추천 포스트 */}
          <RecommendedPostsSidebar currentPostId={post.id} />
        </div>
      </div>
      </div>
    </>
  );
}