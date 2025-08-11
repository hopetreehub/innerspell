import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[DEBUG TAROT] Testing tarot interpretation flow...');
    console.log('[DEBUG TAROT] Input:', {
      questionLength: body.question?.length || 0,
      cardSpread: body.cardSpread,
      cardInterpretationsLength: body.cardInterpretations?.length || 0,
      isGuestUser: body.isGuestUser
    });
    
    const testInput = {
      question: body.question || "내 미래는 어떻게 될까요?",
      cardSpread: body.cardSpread || "3-card",
      cardInterpretations: body.cardInterpretations || `
1. 과거 - 마법사 (정방향): 의지력과 창조력을 나타냅니다.
2. 현재 - 여황제 (역방향): 창조성의 막힘과 불안정을 의미합니다.
3. 미래 - 태양 (정방향): 성공과 행복, 긍정적인 에너지를 상징합니다.
      `,
      isGuestUser: body.isGuestUser || false
    };
    
    console.log('[DEBUG TAROT] Starting interpretation generation...');
    const result = await generateTarotInterpretation(testInput);
    
    console.log('[DEBUG TAROT] Result:', {
      success: !!result,
      interpretationLength: result?.interpretation?.length || 0,
      interpretationPreview: result?.interpretation?.substring(0, 100) || 'No interpretation'
    });
    
    return NextResponse.json({
      success: true,
      result: result,
      testInput: testInput
    });
    
  } catch (error) {
    console.error('[DEBUG TAROT] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Use POST to test tarot interpretation",
    example: {
      question: "내 미래는 어떻게 될까요?",
      cardSpread: "3-card",
      cardInterpretations: "1. 과거 - 마법사 (정방향)...",
      isGuestUser: false
    }
  });
}