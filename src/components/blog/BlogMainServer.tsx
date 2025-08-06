import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar, ArrowRight, Search } from 'lucide-react';
import { type BlogPost } from '@/lib/blog/posts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BlogPagination } from './BlogPagination';
import { BlogSearchClient } from './BlogSearchClient';
import { BlogSidebar } from './BlogSidebar';

interface BlogMainServerProps {
  initialPosts: BlogPost[];
  currentPage?: number;
  allPosts?: BlogPost[]; // 사이드바에서 사용할 전체 포스트
}

const POSTS_PER_PAGE = 6;

export function BlogMainServer({ initialPosts, currentPage = 1, allPosts }: BlogMainServerProps) {
  const totalPages = Math.ceil(initialPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = initialPosts.slice(startIndex, endIndex);
  
  // Featured와 일반 포스트 분리
  const featuredPosts = currentPosts.filter(post => post.featured);
  const regularPosts = currentPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 헤더 섹션 - 전체 너비 */}
        <header className="mb-12 text-center lg:col-span-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
            InnerSpell 블로그
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            AI 시대의 영적 성장과 자기계발을 위한 실용적인 가이드. 
            타로, 꿈해몽, 그리고 현실 창조의 지혜를 만나보세요.
          </p>
          
          {/* 검색 섹션 - 클라이언트 컴포넌트 */}
          <BlogSearchClient />
        </header>

        {/* 카테고리 필터 - 전체 너비 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 lg:col-span-4">
          {['전체', '타로', '꿈해몽', '자기계발', '영성'].map((category) => (
            <Link
              key={category}
              href={category === '전체' ? '/blog' : `/blog?category=${category}`}
              className="inline-block"
            >
              <Badge 
                variant={category === '전체' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              >
                {category}
              </Badge>
            </Link>
          ))}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <main className="lg:col-span-3">
          {/* Featured 포스트 섹션 */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-primary">🌟 주요 포스트</h2>
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Featured
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground hidden md:block">
                {featuredPosts.length}개의 추천 포스트
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post, index) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.id}`}>
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary/20 hover:border-primary/40">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAgEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                          ⭐ 추천
                        </Badge>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={new Date(post.publishedAt).toISOString()}>
                            {format(new Date(post.publishedAt), 'PPP', { locale: ko })}
                          </time>
                        </div>
                        <h2 className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readingTime}분
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 일반 포스트 섹션 */}
        {regularPosts.length > 0 && (
          <section className="mb-12">
            {featuredPosts.length > 0 && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-primary">📝 모든 포스트</h2>
                </div>
                <p className="text-sm text-muted-foreground hidden md:block">
                  {regularPosts.length}개의 포스트
                </p>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {regularPosts.map((post, index) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.id}`}>
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAgEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={new Date(post.publishedAt).toISOString()}>
                            {format(new Date(post.publishedAt), 'PPP', { locale: ko })}
                          </time>
                        </div>
                        <h2 className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readingTime}분
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

          {/* 포스트가 없는 경우 */}
          {currentPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                아직 게시된 포스트가 없습니다
              </h3>
              <p className="text-muted-foreground mb-6">
                곧 영적 성장과 자기계발을 위한 좋은 콘텐츠로 찾아뵙겠습니다.
              </p>
              <Button asChild variant="outline">
                <Link href="/">
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <BlogPagination 
              currentPage={currentPage} 
              totalPages={totalPages}
            />
          )}
        </main>

        {/* 사이드바 */}
        <aside className="lg:col-span-1 mt-8 lg:mt-0">
          <BlogSidebar posts={allPosts || initialPosts} />
        </aside>
      </div>
    </div>
  );
}