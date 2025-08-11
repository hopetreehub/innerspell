import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';
import { checkRateLimit, recordAIRequest } from '@/ai/services/ai-rate-limiter';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase/admin';

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

    // Get user ID from authorization header if available
    let userId: string | undefined;
    let isPremium = false;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        await initAdmin();
        const token = authHeader.split(' ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        userId = decodedToken.uid;
        // You can check premium status here if needed
        // isPremium = await checkUserPremiumStatus(userId);
      } catch (error) {
        console.log('[API] Auth token verification failed:', error);
        // Continue as guest user
      }
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit(userId || 'guest', isPremium);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitCheck.message,
          resetTime: rateLimitCheck.resetTime,
        },
        { status: 429 }
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

    // Record successful request for rate limiting
    recordAIRequest(userId || 'guest', isPremium);

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