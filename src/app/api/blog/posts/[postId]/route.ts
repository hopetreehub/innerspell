import { NextRequest, NextResponse } from 'next/server';
import { getPostByIdServer, updatePostServer, deletePostServer } from '@/services/blog-service-server';

// 관리자 권한 확인 (Mock 버전)
async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  // 로컬 환경에서는 항상 admin으로 처리 (개발 및 테스트용)
  return { isAdmin: true, userId: 'mock-admin-id' };
}

// GET: 특정 포스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await getPostByIdServer(params.postId);
    
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '포스트를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 포스트 수정 (관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    console.log('📝 PUT /api/blog/posts/[postId] - 포스트 수정 시작');
    
    const { isAdmin } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    console.log('📋 받은 수정 데이터:', {
      postId: params.postId,
      title: updates.title,
      category: updates.category,
      published: updates.published,
      hasContent: !!updates.content,
      hasExcerpt: !!updates.excerpt
    });

    // 개발 모드에서는 Mock 업데이트
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
      (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
       process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');
    
    if (isDevelopmentMode) {
      console.log('✅ Mock 포스트 수정 완료:', params.postId);
      return NextResponse.json({ 
        success: true, 
        message: '포스트가 성공적으로 수정되었습니다. (개발 모드)'
      });
    }

    // 프로덕션 모드
    // 날짜 문자열 변환
    if (updates.publishedAt && typeof updates.publishedAt === 'string') {
      updates.publishedAt = new Date(updates.publishedAt);
    }

    // 읽기 시간 재계산
    if (updates.content) {
      const wordsPerMinute = 200;
      const words = updates.content.trim().split(/\s+/).length;
      updates.readingTime = Math.ceil(words / wordsPerMinute);
    }

    // image 필드 처리 (featuredImage로 오는 경우도 처리)
    if (updates.featuredImage) {
      updates.image = updates.featuredImage;
      delete updates.featuredImage;
    }

    await updatePostServer(params.postId, updates);

    return NextResponse.json({ 
      success: true, 
      message: '포스트가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    return NextResponse.json(
      { error: '포스트 수정에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: 포스트 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { isAdmin } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    await deletePostServer(params.postId);

    return NextResponse.json({ 
      success: true, 
      message: '포스트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '포스트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}