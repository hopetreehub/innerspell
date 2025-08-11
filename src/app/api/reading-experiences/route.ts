import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/services/file-storage-service';
import { ReadingExperience } from '@/types';

// GET /api/reading-experiences
export async function GET(request: NextRequest) {
  try {
    // 개발 환경에서만 작동
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    // URL 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'latest';
    const filterTag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 파일에서 데이터 읽기
    const experiences = await readJSON<ReadingExperience[]>('reading-experiences.json') || [];

    // 필터링 - 공개된 게시물만
    let filtered = experiences.filter(exp => exp.isPublished !== false);

    // 태그 필터링
    if (filterTag) {
      filtered = filtered.filter(exp => 
        exp.tags && exp.tags.includes(filterTag)
      );
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'comments':
        filtered.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
        break;
      default: // latest
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
    }

    // 페이지네이션
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    // 응답
    return NextResponse.json({
      success: true,
      experiences: paginated,
      total: filtered.length,
      page,
      pageSize,
      hasMore: endIndex < filtered.length
    });

  } catch (error) {
    console.error('API Error - reading experiences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '데이터를 불러오는데 실패했습니다.',
        experiences: []
      },
      { status: 500 }
    );
  }
}