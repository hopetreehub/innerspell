'use server';

import { revalidatePath } from 'next/cache';
import { 
  BlogPost, 
  BlogPostFormData, 
  BlogPostFormSchema,
  BlogCategory
} from '@/types';

// URL 슬러그 생성 함수
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈 정리
    .trim();
}

// 블로그 포스트 생성
export async function createBlogPost(
  formData: BlogPostFormData,
  authorId: string = 'dev-admin-123'
) {
  try {
    // 폼 데이터 검증
    const validatedData = BlogPostFormSchema.parse(formData);
    
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    console.log('📝 블로그 포스트 생성 시작', {
      isDevelopment,
      title: validatedData.title,
      slug: validatedData.slug,
      status: validatedData.status
    });
    
    if (isDevelopment) {
      console.log('📁 개발 환경 - 파일 시스템 사용');
      const { writeJSON, readJSON } = await import('@/services/file-storage-service');
      
      // 슬러그 중복 검사
      const existingData = await readJSON<BlogPost[]>('blog-posts.json');
      const existingPosts = Array.isArray(existingData) ? existingData : [];
      const slugExists = existingPosts.some(post => post.slug === validatedData.slug);
      
      if (slugExists) {
        return { success: false, error: '이미 존재하는 URL 슬러그입니다.' };
      }
      
      // 블로그 포스트 데이터 생성
      const postData: BlogPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: validatedData.title,
        slug: validatedData.slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt || validatedData.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
        featuredImage: validatedData.featuredImage,
        author: {
          id: authorId,
          name: 'Developer User',
          email: 'dev-admin@innerspell.com'
        },
        categories: validatedData.categories,
        tags: validatedData.tags,
        status: validatedData.status,
        publishedAt: validatedData.status === 'published' ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        seoTitle: validatedData.seoTitle,
        seoDescription: validatedData.seoDescription
      };

      // 기존 포스트들 읽기
      const fileName = 'blog-posts.json';
      let posts = existingPosts;
      
      // 새 포스트 추가
      posts.unshift(postData);
      
      // 파일에 저장
      await writeJSON(fileName, posts);
      
      console.log('✅ 블로그 포스트가 파일 시스템에 저장되었습니다', {
        fileName,
        totalPosts: posts.length,
        newPostId: postData.id
      });
      
      revalidatePath('/admin');
      return { success: true, id: postData.id };
    }
    
    // 프로덕션 환경에서는 Firebase 사용
    console.log('🔥 프로덕션 환경 - Firebase 사용 시도');
    
    // Firebase Admin SDK 동적 import
    const { firestore } = await import('@/lib/firebase/admin');
    
    // Firestore 인스턴스 확인
    if (!firestore || typeof firestore.collection !== 'function') {
      console.error('❌ Firestore 인스턴스가 올바르지 않습니다:', firestore);
      throw new Error('데이터베이스 연결에 문제가 있습니다.');
    }
    
    // 블로그 포스트 데이터 생성
    const postData = {
      title: validatedData.title,
      slug: validatedData.slug,
      content: validatedData.content,
      excerpt: validatedData.excerpt || validatedData.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
      featuredImage: validatedData.featuredImage || null,
      authorId: authorId,
      categories: validatedData.categories,
      tags: validatedData.tags,
      status: validatedData.status,
      publishedAt: validatedData.status === 'published' ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      seoTitle: validatedData.seoTitle || null,
      seoDescription: validatedData.seoDescription || null
    };

    // Firestore에 저장
    const docRef = await firestore.collection('blog-posts').add(postData);
    
    console.log('✅ 블로그 포스트가 Firebase에 저장되었습니다:', docRef.id);
    
    revalidatePath('/admin');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('블로그 포스트 생성 오류:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

// 블로그 포스트 목록 조회
export async function getBlogPosts(
  pageSize: number = 20,
  status?: 'draft' | 'published' | 'archived',
  category?: string
) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON } = await import('@/services/file-storage-service');
      const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
      
      // 필터링
      let filteredPosts = Array.isArray(posts) ? posts : [];
      if (status) {
        filteredPosts = filteredPosts.filter(post => post.status === status);
      }
      if (category) {
        filteredPosts = filteredPosts.filter(post => post.categories && post.categories.includes(category));
      }
      
      // 최신순 정렬
      filteredPosts.sort((a, b) => 
        new Date(b.createdAt || b.publishedAt).getTime() - new Date(a.createdAt || a.publishedAt).getTime()
      );
      
      // 페이지네이션
      const paginatedPosts = filteredPosts.slice(0, pageSize);
      
      return {
        success: true,
        posts: paginatedPosts,
        hasMore: filteredPosts.length > pageSize
      };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    let query = firestore.collection('blog-posts')
      .orderBy('createdAt', 'desc')
      .limit(pageSize);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('categories', 'array-contains', category);
    }
    
    const snapshot = await query.get();
    const posts: BlogPost[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        author: {
          id: data.authorId,
          name: data.authorName || 'Unknown',
          email: data.authorEmail || ''
        },
        categories: data.categories || [],
        tags: data.tags || [],
        status: data.status,
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        viewCount: data.viewCount || 0,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      });
    });
    
    return {
      success: true,
      posts,
      hasMore: posts.length === pageSize
    };
  } catch (error) {
    console.error('블로그 포스트 목록 조회 오류:', error);
    return { success: false, error: '데이터를 불러오는데 실패했습니다.' };
  }
}

// 블로그 포스트 상태 변경
export async function togglePostStatus(
  postId: string,
  newStatus: 'draft' | 'published' | 'archived'
) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON, writeJSON } = await import('@/services/file-storage-service');
      const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
      
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) {
        return { success: false, error: '포스트를 찾을 수 없습니다.' };
      }
      
      // 상태 업데이트
      posts[postIndex].status = newStatus;
      posts[postIndex].updatedAt = new Date();
      
      // 게시 상태로 변경 시 게시일 설정
      if (newStatus === 'published' && !posts[postIndex].publishedAt) {
        posts[postIndex].publishedAt = new Date();
      }
      
      // 파일에 저장
      await writeJSON('blog-posts.json', posts);
      
      revalidatePath('/admin');
      return { success: true };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };
    
    // 게시 상태로 변경 시 게시일 설정
    if (newStatus === 'published') {
      updateData.publishedAt = new Date();
    }
    
    await firestore.collection('blog-posts').doc(postId).update(updateData);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('블로그 포스트 상태 변경 오류:', error);
    return { success: false, error: '상태 변경에 실패했습니다.' };
  }
}

// 블로그 포스트 수정
export async function updateBlogPost(
  postId: string,
  formData: Partial<BlogPostFormData>
) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON, writeJSON } = await import('@/services/file-storage-service');
      const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
      
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) {
        return { success: false, error: '포스트를 찾을 수 없습니다.' };
      }
      
      // 기존 포스트 데이터 업데이트
      posts[postIndex] = {
        ...posts[postIndex],
        ...formData,
        updatedAt: new Date(),
        // 게시 상태로 변경 시 게시일 설정
        publishedAt: formData.status === 'published' && !posts[postIndex].publishedAt 
          ? new Date() 
          : posts[postIndex].publishedAt
      };
      
      // 파일에 저장
      await writeJSON('blog-posts.json', posts);
      
      console.log('✅ 블로그 포스트가 수정되었습니다', {
        postId,
        title: formData.title
      });
      
      revalidatePath('/admin');
      revalidatePath('/blog');
      return { success: true };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    const updateData: any = {
      ...formData,
      updatedAt: new Date()
    };
    
    // 게시 상태로 변경 시 게시일 설정
    if (formData.status === 'published') {
      const doc = await firestore.collection('blog-posts').doc(postId).get();
      if (!doc.data()?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    await firestore.collection('blog-posts').doc(postId).update(updateData);
    
    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('블로그 포스트 수정 오류:', error);
    return { success: false, error: '포스트 수정에 실패했습니다.' };
  }
}

// 블로그 포스트 삭제
export async function deleteBlogPost(postId: string) {
  try {
    // 개발 환경 체크
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // 개발 환경에서는 파일 시스템 사용
      const { readJSON, writeJSON } = await import('@/services/file-storage-service');
      const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
      
      const filteredPosts = posts.filter(post => post.id !== postId);
      
      if (posts.length === filteredPosts.length) {
        return { success: false, error: '포스트를 찾을 수 없습니다.' };
      }
      
      // 파일에 저장
      await writeJSON('blog-posts.json', filteredPosts);
      
      revalidatePath('/admin');
      return { success: true };
    }
    
    // 프로덕션 환경 - Firebase 사용
    const { firestore } = await import('@/lib/firebase/admin');
    
    await firestore.collection('blog-posts').doc(postId).delete();
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('블로그 포스트 삭제 오류:', error);
    return { success: false, error: '포스트 삭제에 실패했습니다.' };
  }
}

// 기존 deprecated 함수 유지 (호환성을 위해)
/**
 * @deprecated Use createBlogPost instead
 */
export async function submitBlogPost(
  data: any,
): Promise<{ success: boolean; postId?: string; error?: string }> {
  console.warn("submitBlogPost function is deprecated. Use createBlogPost instead.");
  return { success: false, error: "This function is deprecated. Use createBlogPost instead." };
}
