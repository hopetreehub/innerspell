'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { searchPosts } from '@/services/blog-service';
import { BlogPost } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';

interface BlogSearchProps {
  onClose?: () => void;
}

export function BlogSearch({ onClose }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchPosts(searchQuery);
      setResults(searchResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: '검색 실패',
        description: '검색 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // 디바운스 효과를 위한 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 검색 입력 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="블로그 포스트를 검색해보세요... (제목, 내용, 태그)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          autoFocus
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 검색 상태 */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm">검색 중...</p>
        </div>
      )}

      {/* 검색 결과 */}
      {!isSearching && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              &ldquo;{query}&rdquo; 검색 결과 ({results.length}개)
            </h3>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-muted-foreground text-sm">
                  다른 키워드로 다시 검색해보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={`/blog/${post.id}`} onClick={onClose}>
                      <div className="flex gap-4 cursor-pointer">
                        <div className="w-24 h-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={post.image}
                            alt={post.title}
                            width={96}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg leading-tight mb-2 line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                            <span>
                              {format(new Date(post.publishedAt), 'yyyy년 M월 d일', { locale: ko })}
                            </span>
                            <span>•</span>
                            <span>{post.readingTime}분 읽기</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 검색 안내 */}
      {!hasSearched && !query && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              블로그 포스트 검색
            </h3>
            <p className="text-muted-foreground text-sm">
              제목, 내용, 태그를 기반으로 포스트를 검색할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}