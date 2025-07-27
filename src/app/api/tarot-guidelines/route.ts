import { NextRequest, NextResponse } from 'next/server';

// 타로 지침 데이터를 동적으로 import
async function loadTarotData() {
  try {
    const { TAROT_GUIDELINES } = await import('@/data/tarot-guidelines');
    const { TAROT_SPREADS } = await import('@/data/tarot-spreads');
    
    return {
      guidelines: TAROT_GUIDELINES,
      spreads: TAROT_SPREADS
    };
  } catch (error) {
    console.error('Error loading tarot data:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const data = await loadTarotData();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Failed to load tarot data' },
        { status: 500 }
      );
    }

    // CORS 헤더 추가
    const response = NextResponse.json({
      guidelines: data.guidelines,
      spreads: data.spreads,
      total: data.guidelines.length,
      styles: [
        { id: 'traditional-rws', name: '전통 라이더-웨이트' },
        { id: 'psychological-jungian', name: '심리학적 융 접근' },
        { id: 'thoth-crowley', name: '토트 크로울리' },
        { id: 'intuitive-modern', name: '직관적 현대' },
        { id: 'therapeutic-counseling', name: '치료적 상담' },
        { id: 'elemental-seasonal', name: '원소 계절' }
      ]
    });

    // 캐시 제어
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
    
    return response;
  } catch (error) {
    console.error('Failed to process tarot guidelines request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}