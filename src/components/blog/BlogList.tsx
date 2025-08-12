'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, User, Calendar, ArrowRight, Search } from 'lucide-react';
import { type BlogPost } from '@/lib/blog/posts';
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

const POSTS_PER_PAGE_OPTIONS = [5, 10, 20];
const DEFAULT_POSTS_PER_PAGE = 5;

interface BlogListProps {
  initialPosts: BlogPost[];
}

export function BlogList({ initialPosts }: BlogListProps) {
  const [posts] = useState<BlogPost[]>(initialPosts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [postsPerPage, setPostsPerPage] = useState(() => {
    // 로컬스토리지에서 저장된 값 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('blogPostsPerPage');
      return saved ? parseInt(saved) : DEFAULT_POSTS_PER_PAGE;
    }
    return DEFAULT_POSTS_PER_PAGE;
  });
  
  // posts가 undefined이거나 배열이 아닌 경우 안전하게 처리
  const safePosts = Array.isArray(posts) ? posts : [];
  
  // 카테고리별 필터링
  const filteredPosts = selectedCategory === 'all' 
    ? safePosts 
    : selectedCategory === '타로'
    ? safePosts.filter(post => post.category === '타로' || post.category === 'tarot')
    : safePosts.filter(post => post.category === selectedCategory);
  
  // 카테고리별 포스트 수 계산
  const categoryCounts = safePosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // 실제 카테고리 확인 (개발용)
  const uniqueCategories = [...new Set(safePosts.map(post => post.category))];
  console.log('실제 카테고리들:', uniqueCategories);
  console.log('카테고리별 수:', categoryCounts);
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // 페이지당 포스트 수 변경 핸들러
  const handlePostsPerPageChange = (value: number) => {
    setPostsPerPage(value);
    setCurrentPage(1); // 첫 페이지로 이동
    if (typeof window !== 'undefined') {
      localStorage.setItem('blogPostsPerPage', value.toString());
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      setShowSearch(true);
    }
  };

  const featuredPost = filteredPosts.find(post => post.featured);
  const popularPosts = filteredPosts
    .filter(post => !post.featured) // featured 포스트 제외
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

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

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
          >
            전체 ({safePosts.length})
          </Button>
          <Button
            variant={selectedCategory === '타로' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('타로');
              setCurrentPage(1);
            }}
          >
            타로 ({(categoryCounts['타로'] || 0) + (categoryCounts['tarot'] || 0)})
          </Button>
          <Button
            variant={selectedCategory === '영성' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('영성');
              setCurrentPage(1);
            }}
          >
            영성 ({categoryCounts['영성'] || 0})
          </Button>
          <Button
            variant={selectedCategory === '꿈해몽' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('꿈해몽');
              setCurrentPage(1);
            }}
          >
            꿈해몽 ({categoryCounts['꿈해몽'] || 0})
          </Button>
          <Button
            variant={selectedCategory === '라이프스타일' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('라이프스타일');
              setCurrentPage(1);
            }}
          >
            라이프스타일 ({categoryCounts['라이프스타일'] || 0})
          </Button>
          <Button
            variant={selectedCategory === '명상' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('명상');
              setCurrentPage(1);
            }}
          >
            명상 ({categoryCounts['명상'] || 0})
          </Button>
          <Button
            variant={selectedCategory === 'general' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('general');
              setCurrentPage(1);
            }}
          >
            일반 ({categoryCounts['general'] || 0})
          </Button>
        </div>

        {showSearch ? (
          <div className="mb-8">
            <BlogSearch 
              onClose={() => {
                setShowSearch(false);
                setQuickSearchQuery('');
              }}
              initialQuery={quickSearchQuery}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-3">

              {/* 페이지당 포스트 수 선택 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">전체 포스트</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">표시:</span>
                  <div className="flex gap-1">
                    {POSTS_PER_PAGE_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        variant={postsPerPage === option ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePostsPerPageChange(option)}
                      >
                        {option}개
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Posts - Horizontal Layout */}
              <div className="space-y-6">
              {currentPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section - Left Side on Desktop */}
                    <div className="md:w-1/3 lg:w-2/5">
                      <div className="aspect-video md:aspect-[4/3] lg:aspect-video h-full bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
                        <Image
                          src={post.featuredImage || post.image}
                          alt={post.title}
                          width={400}
                          height={300}
                          unoptimized
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/blog1.png';
                          }}
                          priority={false}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    
                    {/* Content Section - Right Side on Desktop */}
                    <div className="md:w-2/3 lg:w-3/5 p-6">
                      <div className="flex flex-col h-full">
                        {/* Meta Information */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                          <Clock className="w-4 h-4 ml-auto" />
                          <span>{post.readingTime}분</span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-headline font-bold text-xl lg:text-2xl leading-tight mb-3">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className="text-muted-foreground text-base mb-4 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                        
                        {/* Tags and Action */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{typeof post.author === 'object' ? post.author.name : post.author}</span>
                            </div>
                            <Link href={`/blog/${post.id}`}>
                              <Button variant="default" size="sm" className="gap-2">
                                읽어보기
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Posts - 인기 포스트를 위로 */}
            {popularPosts.length > 0 && (
              <div className="sticky top-4 z-10 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="font-headline font-bold text-lg">인기 포스트</h3>
                </div>
                <div className="p-6 pt-0">
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
                              unoptimized
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                              loading="lazy"
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
                </div>
              </div>
            )}
            
            {/* Featured Post in Sidebar - Only on first page - 주요 포스트를 아래로 */}
            {currentPage === 1 && featuredPost && (
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="font-headline font-bold text-lg">주요 포스트</h3>
                </div>
                <div className="p-6 pt-0">
                  <Link href={`/blog/${featuredPost.id}`}>
                    <div className="hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="aspect-video bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          width={300}
                          height={180}
                          unoptimized
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          loading="lazy"
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
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}