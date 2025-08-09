// 클라이언트 사이드에서 안전하게 사용할 수 있는 블로그 서비스 함수들
import { BlogPost } from '@/types/blog';

// 검색 기능 - API 라우트를 통해서만 작동
export async function searchPosts(searchTerm: string): Promise<BlogPost[]> {
  try {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    params.append('published', 'true');
    
    // 클라이언트 사이드에서는 상대 경로 사용
    const url = `/api/blog/posts?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to search posts');
    }
    
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}