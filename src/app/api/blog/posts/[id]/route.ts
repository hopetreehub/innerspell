import { NextRequest, NextResponse } from 'next/server';
import { getPostByIdServer, updatePostServer, deletePostServer } from '@/services/blog-service-server';

// 관리자 권한 확인 (Mock 버전)
async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  // 개발 환경에서는 항상 admin으로 처리
  if (process.env.NODE_ENV === 'development') {
    return { isAdmin: true, userId: 'mock-admin-id' };
  }
  
  return { isAdmin: false };
}

// GET: 개별 포스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const post = await getPostByIdServer(postId);
    
    if (!post) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '포스트를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 포스트 업데이트 (관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { id: postId } = await params;
    const updates = await request.json();
    
    // 날짜 문자열을 Date 객체로 변환
    if (updates.publishedAt && typeof updates.publishedAt === 'string') {
      updates.publishedAt = new Date(updates.publishedAt);
    }

    // 읽기 시간 재계산 (내용이 변경된 경우)
    if (updates.content) {
      const wordsPerMinute = 200;
      const words = updates.content.trim().split(/\s+/).length;
      updates.readingTime = Math.ceil(words / wordsPerMinute);
    }

    // 이미지 업데이트
    if (updates.featuredImage) {
      updates.image = updates.featuredImage;
    }

    await updatePostServer(postId, updates);

    return NextResponse.json({ 
      success: true,
      message: '포스트가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: '포스트 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 포스트 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { id: postId } = await params;
    await deletePostServer(postId);

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