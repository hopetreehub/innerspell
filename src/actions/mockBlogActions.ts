'use server';

import { mockPosts } from '@/lib/blog/posts';

export async function getMockPosts() {
  console.log(`[mockBlogActions] Returning ${mockPosts.length} mock posts`);
  
  // 게시된 포스트만 필터링하고 날짜순 정렬
  const publishedPosts = mockPosts
    .filter(post => post.published)
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  
  return {
    success: true,
    posts: publishedPosts,
    total: publishedPosts.length,
    timestamp: new Date().toISOString()
  };
}

export async function getMockPostById(id: string) {
  const post = mockPosts.find(p => p.id === id);
  
  if (!post) {
    return {
      success: false,
      error: 'Post not found'
    };
  }
  
  return {
    success: true,
    post
  };
}

export async function debugMockPosts() {
  return {
    total: mockPosts.length,
    published: mockPosts.filter(p => p.published).length,
    titles: mockPosts.slice(0, 5).map(p => p.title),
    timestamp: new Date().toISOString()
  };
}