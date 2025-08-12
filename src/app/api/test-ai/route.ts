import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const providers = {
    openai: {
      available: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'not set'
    },
    gemini: {
      available: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0,
      keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'not set'
    },
    google: {
      available: !!process.env.GOOGLE_API_KEY,
      keyLength: process.env.GOOGLE_API_KEY?.length || 0,
      keyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) || 'not set'
    },
    anthropic: {
      available: !!process.env.ANTHROPIC_API_KEY,
      keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
      keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not set'
    },
    openrouter: {
      available: !!process.env.OPENROUTER_API_KEY,
      keyLength: process.env.OPENROUTER_API_KEY?.length || 0,
      keyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'not set'
    },
    huggingface: {
      available: !!process.env.HUGGINGFACE_API_KEY,
      keyLength: process.env.HUGGINGFACE_API_KEY?.length || 0,
      keyPrefix: process.env.HUGGINGFACE_API_KEY?.substring(0, 10) || 'not set'
    }
  };

  console.log('[TEST-AI] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENABLE_FILE_STORAGE: process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE,
    NEXT_PUBLIC_USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH
  });

  console.log('[TEST-AI] Provider status:', providers);

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      fileStorageEnabled: process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true',
      mockAuthEnabled: process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false'
    },
    providers,
    summary: {
      totalProviders: Object.keys(providers).length,
      availableProviders: Object.values(providers).filter(p => p.available).length,
      availableNames: Object.entries(providers)
        .filter(([_, config]) => config.available)
        .map(([name, _]) => name)
    }
  });
}