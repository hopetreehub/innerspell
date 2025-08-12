import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/ai/flows/generate-tarot-interpretation';
import { checkRateLimit, recordAIRequest } from '@/ai/services/ai-rate-limiter';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  // 🔴 Vercel 환경 정보 로깅
  console.log('[API] ========== TAROT INTERPRETATION REQUEST START ==========');
  console.log('[API] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    timestamp: new Date().toISOString()
  });
  
  console.log('[API] API Keys Status:', {
    hasGoogleKey: !!process.env.GOOGLE_API_KEY,
    googleKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
    encryptionKeyLength: process.env.ENCRYPTION_KEY?.length || 0
  });
  
  try {
    const body = await request.json();
    
    console.log('[API] Generate tarot interpretation request:', {
      question: body.question,
      cardSpread: body.cardSpread,
      spreadId: body.spreadId,
      styleId: body.styleId,
      isGuestUser: body.isGuestUser,
      requestHeaders: Object.fromEntries(request.headers.entries())
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
    console.error('[API] ========== ERROR GENERATING TAROT INTERPRETATION ==========');
    console.error('[API] Error type:', error?.constructor?.name);
    console.error('[API] Error message:', error?.message);
    console.error('[API] Error stack:', error?.stack);
    console.error('[API] Full error object:', JSON.stringify(error, null, 2));
    
    // 상세한 에러 응답 (프로덕션에서도 디버깅을 위해)
    const errorResponse = {
      error: 'Failed to generate interpretation',
      message: error?.message || 'Unknown error',
      type: error?.constructor?.name || 'UnknownError',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        hasGoogleKey: !!process.env.GOOGLE_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY
      }
    };
    
    console.error('[API] Sending error response:', errorResponse);
    console.log('[API] ========== REQUEST END (ERROR) ==========');
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint only accepts POST requests' },
    { status: 405 }
  );
}