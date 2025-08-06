import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[API] Generate tarot interpretation request:', {
      question: body.question,
      cardSpread: body.cardSpread,
      spreadId: body.spreadId,
      styleId: body.styleId,
      isGuestUser: body.isGuestUser
    });

    // Validate required fields
    if (!body.question || !body.cardSpread || !body.cardInterpretations) {
      return NextResponse.json(
        { error: 'Missing required fields: question, cardSpread, cardInterpretations' },
        { status: 400 }
      );
    }

    // Call the AI interpretation function
    const result = await generateTarotInterpretation({
      question: body.question,
      cardSpread: body.cardSpread,
      cardInterpretations: body.cardInterpretations,
      isGuestUser: body.isGuestUser || false,
      spreadId: body.spreadId,
      styleId: body.styleId
    });

    console.log('[API] Interpretation generated successfully, length:', result.interpretation.length);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error generating tarot interpretation:', error);
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}