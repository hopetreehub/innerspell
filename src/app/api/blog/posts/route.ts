import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsServer, createPostServer } from '@/services/blog-service-server';

// 관리자 권한 확인 (Mock 버전)
async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  // 로컬 환경에서는 항상 admin으로 처리 (개발 및 테스트용)
  return { isAdmin: true, userId: 'mock-admin-id' };
}

// GET: 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Route 시작 - 직접 Mock 데이터 반환 모드');
    console.log('📅 API 호출 시간:', new Date().toISOString());
    
    // 직접 Mock 데이터 가져오기 (서비스 함수 우회)
    const { mockPosts } = await import('@/lib/blog/posts');
    console.log(`📊 Direct mockPosts 수: ${mockPosts.length}`);
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const onlyPublished = searchParams.get('published') !== 'false';
    
    console.log('🔍 쿼리 파라미터:', { category, search, featured, onlyPublished });

    let filteredPosts = [...mockPosts];
    
    // published 필터링
    if (onlyPublished) {
      filteredPosts = filteredPosts.filter(post => post.published);
      console.log(`📝 published 필터 후: ${filteredPosts.length}개`);
    }
    
    // 추가 필터링
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured);
      console.log(`⭐ featured 필터 후: ${filteredPosts.length}개`);
    }
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) ||
        post.excerpt.toLowerCase().includes(lowerSearch) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
      console.log(`🔍 검색 필터 후: ${filteredPosts.length}개`);
    }
    
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === category);
      console.log(`🏷️ 카테고리 필터 후: ${filteredPosts.length}개`);
    }
    
    // 날짜순 정렬
    filteredPosts.sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    const finalPosts = filteredPosts.slice(0, 20);
    console.log(`✅ 최종 반환: ${finalPosts.length}개 포스트`);
    console.log('🎯 첫 3개 제목:', finalPosts.slice(0, 3).map(p => p.title));

    const response = {
      posts: finalPosts,
      hasMore: false,
      lastDocId: null,
      debug: {
        timestamp: new Date().toISOString(),
        totalMockPosts: mockPosts.length,
        finalCount: finalPosts.length
      }
    };
    
    console.log('📤 API 응답 전송 완료');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ API Route 에러:', error);
    return NextResponse.json(
      { error: '포스트 목록을 불러올 수 없습니다.', debug: error.message },
      { status: 500 }
    );
  }
}

// POST: 새 포스트 생성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/blog/posts - 포스트 생성 시작');
    
    const { isAdmin, userId } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    const postData = await request.json();
    console.log('📋 받은 포스트 데이터:', {
      title: postData.title,
      category: postData.category,
      published: postData.published,
      hasContent: !!postData.content,
      hasExcerpt: !!postData.excerpt
    });
    
    // 개발 모드에서는 Mock 저장
    const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
      (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
       process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');
    
    if (isDevelopmentMode) {
      // Mock 포스트 생성
      const mockPostId = `mock-post-${Date.now()}`;
      const now = new Date();
      
      const newPost = {
        id: mockPostId,
        title: postData.title || '제목 없음',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        category: postData.category || 'tarot',
        tags: postData.tags || [],
        author: postData.author || 'InnerSpell Team',
        authorId: userId,
        image: postData.image || '/images/blog1.png',
        featured: postData.featured || false,
        published: postData.published || false,
        publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : now,
        createdAt: now,
        updatedAt: now,
        readingTime: Math.ceil((postData.content || '').trim().split(/\s+/).length / 200),
        views: 0,
        likes: 0
      };
      
      console.log('✅ Mock 포스트 생성 완료:', {
        id: mockPostId,
        title: newPost.title,
        published: newPost.published
      });
      
      // Mock 저장소에 추가 (실제로는 메모리에만 저장)
      // 다음 요청 시 mockPosts에 포함되도록 처리 필요
      
      return NextResponse.json({ 
        success: true, 
        postId: mockPostId,
        message: '포스트가 성공적으로 생성되었습니다. (개발 모드)'
      });
    }
    
    // 프로덕션 모드
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
    postData.author = postData.author || 'InnerSpell Team';
    postData.authorId = userId;
    postData.image = postData.image || postData.featuredImage || '/images/blog1.png';
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
    console.error('❌ Error creating post:', error);
    return NextResponse.json(
      { error: '포스트 생성에 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}