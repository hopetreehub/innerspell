import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsServer, createPostServer } from '@/services/blog-service-server';

// 관리자 권한 확인 (Mock 버전)
async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  // 개발 환경에서는 항상 admin으로 처리
  if (process.env.NODE_ENV === 'development') {
    return { isAdmin: true, userId: 'mock-admin-id' };
  }
  
  return { isAdmin: false };
}

// GET: 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const onlyPublished = searchParams.get('published') !== 'false';

    // Firestore에서 포스트 가져오기
    const posts = await getAllPostsServer(onlyPublished, category === 'all' ? undefined : category || undefined);
    
    let filteredPosts = [...posts];
    
    // 추가 필터링
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured);
    }
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) ||
        post.excerpt.toLowerCase().includes(lowerSearch) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return NextResponse.json({
      posts: filteredPosts,
      hasMore: false,
      lastDocId: null
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '포스트 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 포스트 생성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const postData = await request.json();
    
    // 날짜 문자열을 Date 객체로 변환
    if (postData.publishedAt && typeof postData.publishedAt === 'string') {
      postData.publishedAt = new Date(postData.publishedAt);
    } else {
      postData.publishedAt = new Date();
    }

    // 읽기 시간 계산 (단어 수 기준)
    const wordsPerMinute = 200;
    const words = postData.content.trim().split(/\s+/).length;
    postData.readingTime = Math.ceil(words / wordsPerMinute);

    // 작성자 정보 추가
    postData.author = 'InnerSpell Team';
    postData.authorId = userId;
    postData.image = postData.featuredImage || '/images/blog1.png';
    postData.views = 0;
    postData.likes = 0;

    // Firestore에 포스트 생성
    const postId = await createPostServer(postData);

    return NextResponse.json({ 
      success: true, 
      postId,
      message: '포스트가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: '포스트 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}