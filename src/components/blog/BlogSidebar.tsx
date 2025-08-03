'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Calendar, Eye, Hash, ArrowRight } from 'lucide-react';
import { type BlogPost } from '@/lib/blog/posts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BlogSidebarProps {
  posts: BlogPost[];
}

export function BlogSidebar({ posts }: BlogSidebarProps) {
  // 인기 포스트 (조회수 기준, 없으면 최신순)
  const popularPosts = [...posts]
    .filter(post => post.published)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // 추천 포스트 (Featured 포스트)
  const featuredPosts = posts
    .filter(post => post.published && post.featured)
    .slice(0, 5);

  // 최신 포스트
  const recentPosts = [...posts]
    .filter(post => post.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  // 모든 태그 수집 및 빈도수 계산
  const tagFrequency = posts
    .filter(post => post.published)
    .flatMap(post => post.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const popularTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));

  // 카테고리 통계
  const categoryStats = posts
    .filter(post => post.published)
    .reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryStats).sort(([, a], [, b]) => b - a);

  return (
    <aside className="space-y-6">
      {/* 추천 포스트 */}
      {featuredPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-500" />
              추천 포스트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="block group">
                <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <time dateTime={new Date(post.publishedAt).toISOString()}>
                        {format(new Date(post.publishedAt), 'MM.dd', { locale: ko })}
                      </time>
                      {post.views && (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>{post.views.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 인기 포스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-red-500" />
            인기 포스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={new Date(post.publishedAt).toISOString()}>
                      {format(new Date(post.publishedAt), 'MM.dd', { locale: ko })}
                    </time>
                    {post.views && (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>{post.views.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* 최신 포스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-500" />
            최신 포스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPosts.slice(0, 5).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={new Date(post.publishedAt).toISOString()}>
                      {format(new Date(post.publishedAt), 'MM.dd', { locale: ko })}
                    </time>
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* 카테고리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-5 w-5 text-green-500" />
            카테고리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryEntries.map(([category, count]) => (
              <Link 
                key={category} 
                href={`/blog?category=${category}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <span className="font-medium group-hover:text-primary transition-colors">
                  {category}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 인기 태그 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-5 w-5 text-purple-500" />
            인기 태그
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(({ tag, count }) => (
              <Link key={tag} href={`/blog?search=${tag}`}>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag} ({count})
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 뉴스레터 구독 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📧 뉴스레터 구독</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            새로운 포스트와 영적 성장 팁을 이메일로 받아보세요.
          </p>
          <Button className="w-full" size="sm">
            구독하기
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}