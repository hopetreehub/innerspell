import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, spread, cards } = body;
    
    // 개발용 Mock 해석
    const mockInterpretation = {
      overall: `${question}에 대한 타로 카드 해석입니다. 선택하신 ${spread} 스프레드를 통해 다음과 같은 통찰을 얻을 수 있습니다.`,
      cards: cards.map((card: any, index: number) => ({
        position: index,
        cardName: card.name,
        interpretation: `${card.name} 카드는 ${card.upright ? '정방향' : '역방향'}으로 나왔습니다. 이는 현재 상황에서 중요한 의미를 가집니다.`,
      })),
      advice: '카드들이 전하는 메시지를 종합해보면, 신중하게 접근하되 직관을 믿고 행동하는 것이 중요합니다.',
    };
    
    return NextResponse.json({
      success: true,
      interpretation: mockInterpretation,
    });
    
  } catch (error) {
    console.error('Mock tarot API error:', error);
    return NextResponse.json(
      { error: 'Mock interpretation failed' },
      { status: 500 }
    );
  }
}