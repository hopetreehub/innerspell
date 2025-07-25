import { db, initAdmin } from '@/lib/firebase/admin';
import { BlogPost, BlogCategory, BlogComment } from '@/types/blog';

const POSTS_COLLECTION = 'blog_posts';
const CATEGORIES_COLLECTION = 'blog_categories';
const COMMENTS_COLLECTION = 'blog_comments';

// Mock 저장소 (서버용)
const mockBlogPosts = new Map<string, any>();

// 서버 초기화
let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    await initAdmin();
    isInitialized = true;
  }
}

// BlogPost 데이터 변환
const convertToPost = (data: any, id: string): BlogPost => {
  return {
    id,
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'tarot',
    tags: data.tags || [],
    author: data.author || 'InnerSpell Team',
    authorId: data.authorId,
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt : new Date(data.publishedAt || Date.now()),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt || Date.now()),
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt || Date.now()),
    readingTime: data.readingTime || 5,
    image: data.image || '/images/blog1.png',
    featured: data.featured || false,
    published: data.published || false,
    views: data.views || 0,
    likes: data.likes || 0,
  };
};

// 포스트 목록 가져오기 (서버용)
export async function getAllPostsServer(
  onlyPublished: boolean = true,
  categoryFilter?: string
): Promise<BlogPost[]> {
  try {
    // Mock 환경에서는 Mock API 사용
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      let posts = Array.from(mockBlogPosts.values()).map(data => convertToPost(data, data.id));
      
      // 필터링 적용
      if (onlyPublished) {
        posts = posts.filter((post: BlogPost) => post.published);
      }
      
      if (categoryFilter && categoryFilter !== 'all') {
        posts = posts.filter((post: BlogPost) => post.category === categoryFilter);
      }
      
      // 정렬
      posts.sort((a: BlogPost, b: BlogPost) => {
        const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
        const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      return posts.slice(0, 10);
    }

    // 실제 Firestore 환경
    await ensureInitialized();
    
    if (!db) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    // 간단한 쿼리로 시작 (인덱스 문제 해결을 위해)
    const snapshot = await db.collection(POSTS_COLLECTION).get();
    let posts = snapshot.docs.map(doc => convertToPost(doc.data(), doc.id));

    // Firestore에 데이터가 없으면 Mock 데이터 사용 (fallback)
    if (posts.length === 0) {
      console.log('🔄 Firestore에 블로그 데이터가 없어 Mock 데이터 사용');
      const { mockPosts } = await import('@/lib/blog/posts');
      posts = mockPosts.map(post => ({ ...post }));
    }

    // 클라이언트 사이드에서 필터링 및 정렬
    if (onlyPublished) {
      posts = posts.filter(post => post.published);
    }
    if (categoryFilter && categoryFilter !== 'all') {
      posts = posts.filter(post => post.category === categoryFilter);
    }

    // 날짜순 정렬
    posts.sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return posts.slice(0, 20); // 더 많은 포스트 반환
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// 단일 포스트 가져오기 (서버용)
export async function getPostByIdServer(postId: string): Promise<BlogPost | null> {
  try {
    // Mock 환경에서는 Mock API 사용
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const data = mockBlogPosts.get(postId);
      if (!data) {
        return null;
      }
      return convertToPost(data, postId);
    }

    // 실제 Firestore 환경
    await ensureInitialized();
    
    if (!db) {
      console.error('Firebase Admin not initialized');
      return null;
    }

    const doc = await db.collection(POSTS_COLLECTION).doc(postId).get();
    
    if (!doc.exists) {
      return null;
    }

    return convertToPost(doc.data(), doc.id);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// 포스트 생성 (서버용)
export async function createPostServer(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = new Date();
    const postData = {
      ...post,
      createdAt: now,
      updatedAt: now,
      publishedAt: post.publishedAt || now,
      views: 0,
      likes: 0,
    };

    // Mock 환경에서는 Mock API 사용
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const docId = `mock-post-${Date.now()}`;
      const docData = { ...postData, id: docId };
      mockBlogPosts.set(docId, docData);
      console.log('🔥 Mock Firestore Server: Post created with ID:', docId);
      return docId;
    }

    // 실제 Firestore 환경
    await ensureInitialized();
    
    if (!db) {
      throw new Error('Firebase Admin not initialized');
    }

    const docRef = await db.collection(POSTS_COLLECTION).add({
      ...postData,
      publishedAt: postData.publishedAt,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('포스트 생성에 실패했습니다.');
  }
}

// 포스트 업데이트 (서버용)
export async function updatePostServer(postId: string, updates: Partial<BlogPost>): Promise<void> {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Mock 환경에서는 Mock API 사용
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      const existing = mockBlogPosts.get(postId) || {};
      mockBlogPosts.set(postId, { ...existing, ...updateData });
      console.log('🔥 Mock Firestore Server: Post updated with ID:', postId);
      return;
    }

    // 실제 Firestore 환경
    await ensureInitialized();
    
    if (!db) {
      throw new Error('Firebase Admin not initialized');
    }

    await db.collection(POSTS_COLLECTION).doc(postId).update(updateData);
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('포스트 업데이트에 실패했습니다.');
  }
}

// 포스트 삭제 (서버용)
export async function deletePostServer(postId: string): Promise<void> {
  try {
    // Mock 환경에서는 Mock API 사용
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_REAL_AUTH !== 'true') {
      mockBlogPosts.delete(postId);
      console.log('🔥 Mock Firestore Server: Post deleted with ID:', postId);
      return;
    }

    // 실제 Firestore 환경
    await ensureInitialized();
    
    if (!db) {
      throw new Error('Firebase Admin not initialized');
    }

    await db.collection(POSTS_COLLECTION).doc(postId).delete();
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('포스트 삭제에 실패했습니다.');
  }
}