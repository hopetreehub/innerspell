/**
 * 커뮤니티 파일 스토리지 서비스
 * 개발 환경에서 Firebase 없이 커뮤니티 기능을 테스트하기 위한 파일 기반 스토리지
 */

import { readJSON, writeJSON } from './file-storage-service';
import type { CommunityPost, CommunityPostCategory } from '@/types';
import { developmentLog } from '@/lib/firebase/development-mode';

const COMMUNITY_POSTS_FILE = 'community-posts.json';
const POSTS_PER_PAGE = 15;

interface StoredPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  title: string;
  content: string;
  imageUrl: string | null;
  viewCount: number;
  commentCount: number;
  category: CommunityPostCategory;
  createdAt: string;
  updatedAt: string;
}

// 초기 Mock 데이터
const INITIAL_POSTS: StoredPost[] = [
  {
    id: 'mock-post-1',
    authorId: 'dev-user-1',
    authorName: '개발자1',
    authorPhotoURL: '',
    title: '타로 카드 해석에 대한 질문이 있습니다',
    content: '안녕하세요. 타로 카드를 처음 시작하는데, 카드 해석이 너무 어려워요. 어떻게 공부하면 좋을까요?',
    imageUrl: null,
    viewCount: 45,
    commentCount: 3,
    category: 'free-discussion',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'mock-post-2',
    authorId: 'dev-user-2',
    authorName: '타로초보',
    authorPhotoURL: '',
    title: '첫 타로 리딩 경험 공유합니다',
    content: '오늘 처음으로 타로 리딩을 받았는데 정말 신기했어요. 제가 고민하던 부분을 정확히 짚어주시더라구요.',
    imageUrl: null,
    viewCount: 128,
    commentCount: 7,
    category: 'reading-share',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'mock-post-3',
    authorId: 'dev-user-3',
    authorName: '영성탐구자',
    authorPhotoURL: '',
    title: '꿈에서 본 타로 카드의 의미',
    content: '어젯밤 꿈에서 The Tower 카드를 보았는데, 이게 무슨 의미일까요? 실제로 큰 변화가 올 예정인가요?',
    imageUrl: null,
    viewCount: 67,
    commentCount: 5,
    category: 'free-discussion',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

// 파일에서 커뮤니티 포스트 가져오기
export async function getCommunityPostsFromFile(
  category: CommunityPostCategory,
  page: number = 1
): Promise<{ posts: CommunityPost[]; totalPages: number }> {
  try {
    developmentLog('Community', `Getting posts from file for category: ${category}, page: ${page}`);
    
    // 파일에서 포스트 읽기
    let allPosts = await readJSON<StoredPost[]>(COMMUNITY_POSTS_FILE);
    
    // 파일이 없거나 빈 경우 초기 데이터 사용
    if (!allPosts || allPosts.length === 0) {
      developmentLog('Community', 'No posts found, using initial mock data');
      allPosts = INITIAL_POSTS;
      await writeJSON(COMMUNITY_POSTS_FILE, allPosts);
    }
    
    // 카테고리별 필터링
    const categoryPosts = allPosts.filter(post => post.category === category);
    
    // 정렬 (최신순)
    categoryPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // 페이지네이션
    const totalPages = Math.ceil(categoryPosts.length / POSTS_PER_PAGE);
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = categoryPosts.slice(startIndex, endIndex);
    
    // StoredPost를 CommunityPost로 변환
    const posts: CommunityPost[] = paginatedPosts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
    
    developmentLog('Community', `Found ${posts.length} posts for category ${category}`);
    
    return { posts, totalPages };
  } catch (error) {
    developmentLog('Community', `Error reading posts: ${error}`);
    return { posts: [], totalPages: 1 };
  }
}

// 커뮤니티 포스트 ID로 가져오기
export async function getCommunityPostByIdFromFile(postId: string): Promise<CommunityPost | null> {
  try {
    const allPosts = await readJSON<StoredPost[]>(COMMUNITY_POSTS_FILE) || INITIAL_POSTS;
    const post = allPosts.find(p => p.id === postId);
    
    if (!post) {
      return null;
    }
    
    // 조회수 증가
    post.viewCount += 1;
    await writeJSON(COMMUNITY_POSTS_FILE, allPosts);
    
    return {
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    };
  } catch (error) {
    developmentLog('Community', `Error getting post by ID: ${error}`);
    return null;
  }
}

// 새 커뮤니티 포스트 생성
export async function createCommunityPostInFile(
  postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const allPosts = await readJSON<StoredPost[]>(COMMUNITY_POSTS_FILE) || INITIAL_POSTS;
    
    const newPost: StoredPost = {
      ...postData,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allPosts.unshift(newPost); // 최신 포스트를 앞에 추가
    await writeJSON(COMMUNITY_POSTS_FILE, allPosts);
    
    developmentLog('Community', `Created new post: ${newPost.id}`);
    return newPost.id;
  } catch (error) {
    developmentLog('Community', `Error creating post: ${error}`);
    throw error;
  }
}

// 커뮤니티 포스트 삭제
export async function deleteCommunityPostFromFile(postId: string): Promise<boolean> {
  try {
    const allPosts = await readJSON<StoredPost[]>(COMMUNITY_POSTS_FILE) || [];
    const filteredPosts = allPosts.filter(p => p.id !== postId);
    
    if (filteredPosts.length === allPosts.length) {
      return false; // 포스트를 찾지 못함
    }
    
    await writeJSON(COMMUNITY_POSTS_FILE, filteredPosts);
    developmentLog('Community', `Deleted post: ${postId}`);
    return true;
  } catch (error) {
    developmentLog('Community', `Error deleting post: ${error}`);
    return false;
  }
}

// 최근 커뮤니티 활동 가져오기
export async function getRecentCommunityActivityFromFile(limit: number = 5): Promise<CommunityPost[]> {
  try {
    const allPosts = await readJSON<StoredPost[]>(COMMUNITY_POSTS_FILE) || INITIAL_POSTS;
    
    // 최신순 정렬
    allPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // 상위 N개 가져오기
    const recentPosts = allPosts.slice(0, limit);
    
    return recentPosts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
  } catch (error) {
    developmentLog('Community', `Error getting recent activity: ${error}`);
    return [];
  }
}