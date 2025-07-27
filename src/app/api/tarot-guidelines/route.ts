import { NextResponse } from 'next/server';
import { TAROT_GUIDELINES } from '@/data/tarot-guidelines';
import { TAROT_SPREADS } from '@/data/tarot-spreads';

export async function GET() {
  try {
    // 타로 지침 데이터와 스프레드 정보를 함께 반환
    return NextResponse.json({
      guidelines: TAROT_GUIDELINES,
      spreads: TAROT_SPREADS,
      total: TAROT_GUIDELINES.length,
      styles: [
        { id: 'traditional-rws', name: '전통 라이더-웨이트' },
        { id: 'psychological-jungian', name: '심리학적 융 접근' },
        { id: 'thoth-crowley', name: '토트 크로울리' },
        { id: 'intuitive-modern', name: '직관적 현대' },
        { id: 'therapeutic-counseling', name: '치료적 상담' },
        { id: 'elemental-seasonal', name: '원소 계절' }
      ]
    });
  } catch (error) {
    console.error('Failed to load tarot guidelines:', error);
    return NextResponse.json(
      { error: 'Failed to load tarot guidelines' },
      { status: 500 }
    );
  }
}