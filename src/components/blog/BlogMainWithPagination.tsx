'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, User, Calendar, ArrowRight, Search } from 'lucide-react';
import { mockPosts, type BlogPost } from '@/lib/blog/posts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BlogSearch } from './BlogSearch';
import { searchPosts } from '@/services/blog-service';

const POSTS_PER_PAGE = 6;

export function BlogMainWithPagination() {
  const [posts] = useState<BlogPost[]>(mockPosts);
  const [isLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      setShowSearch(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = posts.find(post => post.featured && post.id === 'tarot-basics-2025');
  const popularPosts = [
    posts.find(p => p.id === 'tarot-basics-2025'),
    posts.find(p => p.id === 'meditation-guide-2025'),
    posts.find(p => p.id === 'dream-interpretation-basics')
  ].filter(Boolean) as BlogPost[];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    
    // First page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show dots if current page is far from start
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show dots if current page is far from end
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
            InnerSpell 블로그
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            AI 시대 영적 성장과 자기계발을 위한 타로 카드 해석, 점술 지식, 꿈해몽 가이드, 
            실전 성공 전략을 제공합니다.
          </p>
          
          {/* 빠른 검색 */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleQuickSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="블로그 포스트 검색..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                {showSearch ? '목록으로' : '상세검색'}
              </Button>
            </form>
          </div>
        </div>

        {showSearch ? (
          <div className="mb-8">
            <BlogSearch onClose={() => setShowSearch(false)} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3">

              {/* All Posts Grid */}
              <div className="grid gap-6 md:grid-cols-2">
              {currentPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      priority={false}
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(post.publishedAt), 'M월 d일', { locale: ko })}</span>
                      <Clock className="w-4 h-4 ml-auto" />
                      <span>{post.readingTime}분</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg leading-tight">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            읽기
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Post in Sidebar - Only on first page */}
            {currentPage === 1 && featuredPost && (
              <Card className="sticky top-4">
                <CardHeader>
                  <h3 className="font-headline font-bold text-lg">주요 포스트</h3>
                </CardHeader>
                <CardContent>
                  <Link href={`/blog/${featuredPost.id}`}>
                    <div className="hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="aspect-video bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          width={300}
                          height={180}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Badge className="bg-accent text-accent-foreground text-xs">
                          주요 포스트
                        </Badge>
                      </div>
                      <h4 className="font-medium leading-tight line-clamp-2 mb-2">
                        {featuredPost.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {featuredPost.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {featuredPost.readingTime}분
                        </span>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
            
            {/* Popular Posts */}
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="font-headline font-bold text-lg">인기 포스트</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`}>
                      <div className="flex gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                        <div className="w-16 h-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded flex-shrink-0 overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium leading-tight line-clamp-2">
                            {post.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {post.views} 조회
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}