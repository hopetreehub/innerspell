import { NextRequest, NextResponse } from 'next/server';
import { BlogPost, BlogPostFormData } from '@/types/blog';
import { readJSON, writeJSON } from '@/services/file-storage-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 블로그 포스트 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log(`📝 PUT /api/blog/posts/${id} - 포스트 수정 요청`);
    
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'File storage is not enabled' },
        { status: 400 }
      );
    }

    // request body 읽기 (빈 body 처리)
    let formData: Partial<BlogPostFormData> = {};
    
    try {
      const text = await request.text();
      if (text) {
        formData = JSON.parse(text);
      }
    } catch (e) {
      console.error('❌ JSON 파싱 오류:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    console.log('📋 수정 데이터:', formData);

    // 블로그 포스트 데이터 읽기
    const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 포스트 업데이트
    posts[postIndex] = {
      ...posts[postIndex],
      ...formData,
      updatedAt: new Date(),
      publishedAt: formData.status === 'published' && !posts[postIndex].publishedAt 
        ? new Date() 
        : posts[postIndex].publishedAt,
      // featuredImage가 업데이트되면 image 필드도 동기화
      image: formData.featuredImage || posts[postIndex].featuredImage || posts[postIndex].image
    };

    await writeJSON('blog-posts.json', posts);
    
    console.log(`✅ 포스트 수정 완료: ${posts[postIndex].title}`);

    return NextResponse.json({ 
      success: true, 
      post: posts[postIndex],
      message: '포스트가 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    console.error('❌ 포스트 수정 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '포스트 수정에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}

// DELETE: 블로그 포스트 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log(`🗑️ DELETE /api/blog/posts/${id} - 포스트 삭제 요청`);
    
    const isDevelopment = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'File storage is not enabled' },
        { status: 400 }
      );
    }

    // 블로그 포스트 데이터 읽기
    const posts = await readJSON<BlogPost[]>('blog-posts.json') || [];
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 포스트 삭제
    const deletedPost = posts.splice(postIndex, 1)[0];
    await writeJSON('blog-posts.json', posts);
    
    console.log(`✅ 포스트 삭제 완료: ${deletedPost.title}`);

    return NextResponse.json({ 
      success: true, 
      message: '포스트가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 포스트 삭제 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '포스트 삭제에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}