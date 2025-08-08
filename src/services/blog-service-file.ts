import { BlogPost } from '@/types/blog';
import * as fileStorage from './file-storage-service';

const BLOG_POSTS_FILE = 'blog-posts.json';

interface BlogPostsData {
  posts: BlogPost[];
  lastUpdated?: string;
  version?: string;
}

/**
 * 블로그 포스트 파일 초기화 (빈 배열로 시작)
 */
async function initializeBlogPostsFile(): Promise<void> {
  const exists = await fileStorage.fileExists(BLOG_POSTS_FILE);
  
  if (!exists) {
    console.log('📝 Initializing empty blog posts file...');
    
    const initialData: BlogPostsData = {
      posts: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(BLOG_POSTS_FILE, initialData, false);
    console.log('✅ Blog posts file initialized (empty)');
  }
}

/**
 * 모든 포스트 가져오기
 */
export async function getAllPostsFromFile(): Promise<BlogPost[]> {
  if (!fileStorage.isFileStorageEnabled) {
    return [];
  }

  try {
    await initializeBlogPostsFile();
    
    const data = await fileStorage.readJSON<BlogPostsData>(BLOG_POSTS_FILE);
    if (!data || !data.posts) {
      console.warn('⚠️ No posts found in file, returning empty array');
      return [];
    }
    
    // Date 객체로 변환
    const posts = data.posts.map(post => ({
      ...post,
      publishedAt: new Date(post.publishedAt),
      updatedAt: new Date(post.updatedAt),
      createdAt: new Date(post.createdAt)
    }));
    
    console.log(`📚 Loaded ${posts.length} posts from file`);
    return posts;
  } catch (error) {
    console.error('❌ Error loading posts from file:', error);
    return [];
  }
}

/**
 * 포스트 ID로 찾기
 */
export async function getPostByIdFromFile(id: string): Promise<BlogPost | null> {
  const posts = await getAllPostsFromFile();
  return posts.find(post => post.id === id) || null;
}

/**
 * 새 포스트 생성
 */
export async function createPostInFile(postData: Partial<BlogPost>): Promise<string> {
  if (!fileStorage.isFileStorageEnabled) {
    console.log('📝 File storage disabled, returning mock ID');
    return `mock-post-${Date.now()}`;
  }

  try {
    const posts = await getAllPostsFromFile();
    
    // 새 포스트 생성
    const newPost: BlogPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: postData.title || '제목 없음',
      excerpt: postData.excerpt || '',
      content: postData.content || '',
      category: postData.category || 'tarot',
      tags: postData.tags || [],
      author: postData.author || 'InnerSpell Team',
      authorId: postData.authorId || 'system',
      publishedAt: postData.publishedAt || new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      readingTime: postData.readingTime || Math.ceil((postData.content || '').split(/\s+/).length / 200),
      image: postData.image || postData.featuredImage || '/images/blog1.png',
      featured: postData.featured || false,
      published: postData.published || false,
      views: 0,
      likes: 0,
    };
    
    // 포스트 추가
    posts.unshift(newPost); // 최신 포스트를 앞에 추가
    
    // 파일에 저장
    const data: BlogPostsData = {
      posts,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(BLOG_POSTS_FILE, data);
    
    console.log('✅ Created new post:', newPost.id);
    return newPost.id;
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
}

/**
 * 포스트 업데이트
 */
export async function updatePostInFile(
  id: string,
  updates: Partial<BlogPost>
): Promise<void> {
  if (!fileStorage.isFileStorageEnabled) {
    console.log('📝 File storage disabled, mock update');
    return;
  }

  try {
    const posts = await getAllPostsFromFile();
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) {
      throw new Error(`Post not found: ${id}`);
    }
    
    // 업데이트
    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date(),
      // featuredImage를 image로 매핑
      image: updates.image || updates.featuredImage || posts[index].image
    };
    
    // 파일에 저장
    const data: BlogPostsData = {
      posts,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(BLOG_POSTS_FILE, data);
    
    console.log('✅ Updated post:', id);
  } catch (error) {
    console.error('❌ Error updating post:', error);
    throw error;
  }
}

/**
 * 포스트 삭제
 */
export async function deletePostFromFile(id: string): Promise<void> {
  if (!fileStorage.isFileStorageEnabled) {
    console.log('📝 File storage disabled, mock delete');
    return;
  }

  try {
    const posts = await getAllPostsFromFile();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) {
      throw new Error(`Post not found: ${id}`);
    }
    
    // 파일에 저장
    const data: BlogPostsData = {
      posts: filteredPosts,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    await fileStorage.writeJSON(BLOG_POSTS_FILE, data);
    
    console.log('✅ Deleted post:', id);
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    throw error;
  }
}

/**
 * 조건에 맞는 포스트 필터링
 */
export async function getFilteredPosts(
  options: {
    category?: string;
    search?: string;
    featured?: boolean;
    published?: boolean;
    limit?: number;
  } = {}
): Promise<BlogPost[]> {
  let posts = await getAllPostsFromFile();
  
  // published 필터
  if (options.published !== undefined) {
    posts = posts.filter(post => post.published === options.published);
  }
  
  // category 필터
  if (options.category && options.category !== 'all') {
    posts = posts.filter(post => post.category === options.category);
  }
  
  // featured 필터
  if (options.featured !== undefined) {
    posts = posts.filter(post => post.featured === options.featured);
  }
  
  // search 필터
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // 날짜순 정렬 (최신 먼저)
  posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // limit 적용
  if (options.limit && options.limit > 0) {
    posts = posts.slice(0, options.limit);
  }
  
  return posts;
}

/**
 * 조회수 증가
 */
export async function incrementPostViews(id: string): Promise<void> {
  if (!fileStorage.isFileStorageEnabled) {
    return;
  }

  try {
    const posts = await getAllPostsFromFile();
    const post = posts.find(p => p.id === id);
    
    if (post) {
      post.views = (post.views || 0) + 1;
      
      const data: BlogPostsData = {
        posts,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await fileStorage.writeJSON(BLOG_POSTS_FILE, data);
    }
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
  }
}