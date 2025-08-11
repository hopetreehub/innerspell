import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/services/file-storage-service';
import { ReadingExperience } from '@/types';

// GET /api/reading-experiences/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 개발 환경에서만 작동
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const { id } = params;

    // 파일에서 데이터 읽기
    const experiences = await readJSON<ReadingExperience[]>('reading-experiences.json') || [];
    
    // ID로 찾기
    const experience = experiences.find(exp => exp.id === id);
    
    if (!experience) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가 (선택적 - 실제 사용자 요청인 경우)
    const increaseView = request.nextUrl.searchParams.get('view') === 'true';
    if (increaseView) {
      experience.views = (experience.views || 0) + 1;
      
      // 업데이트된 데이터 저장
      const updatedExperiences = experiences.map(exp => 
        exp.id === id ? experience : exp
      );
      await writeJSON('reading-experiences.json', updatedExperiences);
    }

    return NextResponse.json({
      success: true,
      experience
    });

  } catch (error) {
    console.error('API Error - reading experience detail:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '게시글을 불러오는데 실패했습니다.'
      },
      { status: 500 }
    );
  }
}