'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BlogPost, getAllPosts } from '@/lib/blog/posts';

interface RecommendedPostsSidebarProps {
  currentPostId?: string;
}

export function RecommendedPostsSidebar({ currentPostId }: RecommendedPostsSidebarProps) {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        const allPosts = await getAllPosts();
        
        // 현재 포스트 제외
        const filteredPosts = currentPostId 
          ? allPosts.filter(post => post.id !== currentPostId)
          : allPosts;

        // 전체 포스트를 조회수 순으로 정렬
        const sortedByViews = [...filteredPosts].sort((a, b) => (b.views || 0) - (a.views || 0));
        // 전체 포스트를 최신순으로 정렬  
        const sortedByDate = [...filteredPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        // 주요 포스트: 조회수 기준 상위 2개
        const featured = sortedByViews.slice(0, 2);
        
        // 인기 포스트: 최신 포스트 중에서 주요 포스트와 겹치지 않는 3개
        const featuredIds = new Set(featured.map(post => post.id));
        const popular = sortedByDate.filter(post => !featuredIds.has(post.id)).slice(0, 3);

        // 성공적으로 겹침 제거 완료
        
        setFeaturedPosts(featured);
        setPopularPosts(popular);
      } catch (error) {
        console.error('추천 포스트 로딩 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPosts();
  }, [currentPostId]);

  if (loading) {
    return (
      <div className="lg:w-80 shrink-0">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-80 shrink-0">
      <div className="sticky top-8 space-y-8">
        {/* 추천 포스트 섹션 */}
        {featuredPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              주요 포스트
            </h3>
            <div className="space-y-4">
              {featuredPosts.map((post, index) => (
                <Card key={post.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
                        주요
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}분
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        읽기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 인기 포스트 섹션 */}
        {popularPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              인기 포스트
            </h3>
            <div className="space-y-3">
              {popularPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 relative overflow-hidden rounded-md shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}분
                      </div>
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="ghost" size="sm" className="w-full text-xs h-6 px-2">
                          읽기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 전체 블로그 보기 버튼 */}
        <Card className="p-4 text-center bg-gradient-to-r from-primary/5 to-accent/5">
          <h4 className="font-medium mb-2">더 많은 컨텐츠</h4>
          <p className="text-sm text-muted-foreground mb-3">
            타로, 꿈해몽, 영성에 관한 다양한 글들을 만나보세요
          </p>
          <Link href="/blog">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              전체 블로그 보기
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}