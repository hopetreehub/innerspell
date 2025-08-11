import { NextResponse } from 'next/server';
import { mockPosts } from '@/lib/blog/posts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log(`[/api/mock-posts] Returning ${mockPosts.length} posts`);
    
    const publishedPosts = mockPosts
      .filter(post => post.published)
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
    
    return NextResponse.json({
      success: true,
      posts: publishedPosts,
      total: publishedPosts.length,
      allTotal: mockPosts.length,
      timestamp: new Date().toISOString(),
      firstPost: publishedPosts[0]?.title || 'No posts'
    });
  } catch (error) {
    console.error('[/api/mock-posts] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mock posts' },
      { status: 500 }
    );
  }
}