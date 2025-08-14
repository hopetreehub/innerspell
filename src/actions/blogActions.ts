'use server';

import { revalidatePath } from 'next/cache';
import { 
  BlogPost, 
  BlogPostFormData, 
  BlogPostFormSchema,
  BlogCategory
} from '@/types';
import { createDataSource } from '@/lib/admin';

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
    
    console.log('📝 블로그 포스트 생성 시작', {
      title: validatedData.title,
      slug: validatedData.slug,
      status: validatedData.status
    });
    
    // 데이터 소스 사용
    const dataSource = createDataSource();
    
    // 슬러그 중복 검사
    const existingPosts = await dataSource.getBlogPosts({ status: 'all' });
    const slugExists = existingPosts.some(post => post.slug === validatedData.slug);
    
    if (slugExists) {
      return { success: false, error: '이미 존재하는 URL 슬러그입니다.' };
    }
    
    // 블로그 포스트 데이터 생성
    const newPost = await dataSource.createBlogPost({
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
      seoTitle: validatedData.seoTitle,
      seoDescription: validatedData.seoDescription
    });
    
    console.log('✅ 블로그 포스트가 생성되었습니다:', newPost.id);
    
    revalidatePath('/admin');
    revalidatePath('/blog');
    return { success: true, id: newPost.id };
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
    // 데이터 소스 사용
    const dataSource = createDataSource();
    
    const posts = await dataSource.getBlogPosts({
      status: status as 'draft' | 'published' | 'all' || 'all',
      limit: pageSize
    });
    
    // 카테고리 필터링
    let filteredPosts = posts;
    if (category) {
      filteredPosts = posts.filter(post => post.categories && post.categories.includes(category));
    }
    
    return {
      success: true,
      posts: filteredPosts,
      hasMore: filteredPosts.length === pageSize
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
    // 데이터 소스 사용
    const dataSource = createDataSource();
    
    // 현재 포스트 가져오기
    const post = await dataSource.getBlogPost(postId);
    if (!post) {
      return { success: false, error: '포스트를 찾을 수 없습니다.' };
    }
    
    // 상태 업데이트
    await dataSource.updateBlogPost(postId, {
      status: newStatus,
      publishedAt: newStatus === 'published' && !post.publishedAt ? new Date() : post.publishedAt
    });
    
    revalidatePath('/admin');
    revalidatePath('/blog');
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
    // 데이터 소스 사용
    const dataSource = createDataSource();
    
    // 현재 포스트 가져오기
    const post = await dataSource.getBlogPost(postId);
    if (!post) {
      return { success: false, error: '포스트를 찾을 수 없습니다.' };
    }
    
    // 업데이트 데이터 준비
    const updateData: any = {
      ...formData,
      // 게시 상태로 변경 시 게시일 설정
      publishedAt: formData.status === 'published' && !post.publishedAt 
        ? new Date() 
        : post.publishedAt
    };
    
    // 포스트 업데이트
    await dataSource.updateBlogPost(postId, updateData);
    
    console.log('✅ 블로그 포스트가 수정되었습니다', {
      postId,
      title: formData.title
    });
    
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
    // 데이터 소스 사용
    const dataSource = createDataSource();
    
    // 포스트 존재 확인
    const post = await dataSource.getBlogPost(postId);
    if (!post) {
      return { success: false, error: '포스트를 찾을 수 없습니다.' };
    }
    
    // 포스트 삭제
    await dataSource.deleteBlogPost(postId);
    
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
