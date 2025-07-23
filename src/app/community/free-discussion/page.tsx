
import { getCommunityPosts } from '@/actions/communityActions';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import { MessageSquare, PlusCircle, MessageCircle, Eye, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostWithComments } from '@/components/community/PostWithComments';


export const metadata: Metadata = {
  title: '자유 토론 - InnerSpell 커뮤니티',
  description: '타로, 명상, 꿈 등 영적인 주제에 대해 자유롭게 이야기를 나누세요.',
};

type FreeDiscussionPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function FreeDiscussionPage({ searchParams }: FreeDiscussionPageProps) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const { posts, totalPages } = await getCommunityPosts('free-discussion', page);
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <div className="inline-flex items-center gap-3 mb-3">
             <MessageSquare className="h-10 w-10 text-primary" />
             <h1 className="font-headline text-4xl font-bold text-primary">자유 토론</h1>
          </div>
          <p className="mt-2 text-lg text-foreground/80 max-w-2xl">
            타로, 꿈, 명상 등 영적인 주제에 대해 자유롭게 이야기를 나누고 다른 사람들의 경험과 통찰을 공유하세요.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/community/free-discussion/new">
             <PlusCircle className="mr-2 h-5 w-5"/>
            새 글 작성하기
          </Link>
        </Button>
      </header>

      <div className="space-y-3">
        {posts.length > 0 ? posts.map(post => (
          <PostWithComments key={post.id} post={post} />
        )) : (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">아직 게시물이 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 번째 글을 작성해보세요!</p>
            <Button asChild>
              <Link href="/community/free-discussion/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                새 글 작성하기
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={page > 1 ? `/community/free-discussion?page=${page - 1}` : undefined} aria-disabled={page <= 1}/>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink href={`/community/free-discussion?page=${p}`} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < totalPages ? `/community/free-discussion?page=${page + 1}` : undefined} aria-disabled={page >= totalPages}/>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
}
