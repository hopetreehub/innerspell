import { NextRequest, NextResponse } from 'next/server';
import { getAllAIProviderConfigsForGenkit } from '@/actions/aiProviderActions';
import { decrypt } from '@/lib/encryption';
import { getActiveAIModels } from '@/ai/services/ai-provider-service';
import { getTarotPromptConfig } from '@/ai/services/prompt-service';
import { getAI } from '@/ai/genkit';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Fetching AI provider configs...');
    
    const result = await getAllAIProviderConfigsForGenkit();
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.message,
        success: false 
      }, { status: 500 });
    }
    
    const configs = result.data || [];
    
    // Decrypt and format for debugging
    const debugConfigs = configs.map(config => {
      try {
        const decryptedApiKey = decrypt(config.apiKey);
        return {
          provider: config.provider,
          isActive: config.isActive,
          hasApiKey: !!config.apiKey,
          apiKeyLength: config.apiKey?.length || 0,
          decryptedApiKeyLength: decryptedApiKey?.length || 0,
          decryptedApiKeyPreview: decryptedApiKey ? `${decryptedApiKey.substring(0, 10)}...` : 'none',
          modelsCount: config.models?.length || 0,
          models: config.models?.map(m => ({
            id: m.id,
            name: m.name,
            provider: m.provider,
            capabilities: m.capabilities
          })) || [],
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        };
      } catch (decryptError) {
        return {
          provider: config.provider,
          isActive: config.isActive,
          hasApiKey: !!config.apiKey,
          apiKeyLength: config.apiKey?.length || 0,
          decryptionError: decryptError instanceof Error ? decryptError.message : 'Unknown decryption error',
          modelsCount: config.models?.length || 0,
          models: config.models?.map(m => ({
            id: m.id,
            name: m.name,
            provider: m.provider,
            capabilities: m.capabilities
          })) || [],
          createdAt: config.createdAt,
          updatedAt: config.updatedAt
        };
      }
    });
    
    // Test active models service
    let activeModels: any[] = [];
    try {
      activeModels = await getActiveAIModels();
    } catch (error) {
      console.error('[DEBUG] Error getting active models:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test prompt config service
    let promptConfig = null;
    try {
      promptConfig = await getTarotPromptConfig();
    } catch (error) {
      console.error('[DEBUG] Error getting prompt config:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Test AI instance
    let aiInstanceStatus = null;
    try {
      const ai = await getAI();
      aiInstanceStatus = 'initialized';
    } catch (error) {
      console.error('[DEBUG] Error initializing AI:', error instanceof Error ? error.message : 'Unknown error');
      aiInstanceStatus = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return NextResponse.json({
      success: true,
      totalConfigs: configs.length,
      configs: debugConfigs,
      activeModels: activeModels,
      promptConfig: promptConfig,
      aiInstanceStatus: aiInstanceStatus,
      envVars: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasGoogle: !!process.env.GOOGLE_API_KEY,
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
        openaiLength: process.env.OPENAI_API_KEY?.length || 0,
        googleLength: process.env.GOOGLE_API_KEY?.length || 0,
        geminiLength: process.env.GEMINI_API_KEY?.length || 0,
        anthropicLength: process.env.ANTHROPIC_API_KEY?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[DEBUG] Error fetching AI provider configs:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}

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
    
    // Import here to avoid circular dependency
    const { generateTarotInterpretation } = await import('@/ai/flows/generate-tarot-interpretation');
    
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
    console.error('[DEBUG TAROT] Error:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false,
      stack: error.stack
    }, { status: 500 });
  }
}