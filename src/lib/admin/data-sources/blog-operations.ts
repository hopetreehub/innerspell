// 블로그 관련 데이터 작업을 위한 인터페이스 확장

import { BlogPost } from '@/lib/admin/types/data-source';

export interface BlogOperations {
  // 블로그 포스트 CRUD
  getAllPosts(): Promise<BlogPost[]>;
  getPostById(id: string): Promise<BlogPost | null>;
  getPostBySlug(slug: string): Promise<BlogPost | null>;
  createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost>;
  updatePost(id: string, post: Partial<BlogPost>): Promise<BlogPost>;
  deletePost(id: string): Promise<boolean>;
  
  // 블로그 포스트 검색 및 필터
  searchPosts(query: string): Promise<BlogPost[]>;
  getPostsByCategory(category: string): Promise<BlogPost[]>;
  getPostsByTag(tag: string): Promise<BlogPost[]>;
  getPublishedPosts(): Promise<BlogPost[]>;
  getDraftPosts(): Promise<BlogPost[]>;
  
  // 페이지네이션
  getPostsPaginated(page: number, limit: number): Promise<{
    posts: BlogPost[];
    total: number;
    pages: number;
  }>;
  
  // 통계
  getPostsCount(): Promise<number>;
  getPostsCountByCategory(): Promise<Record<string, number>>;
  getPostsCountByStatus(): Promise<{
    published: number;
    draft: number;
    archived: number;
  }>;
}