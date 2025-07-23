import { NextRequest, NextResponse } from 'next/server';
import { getAllAIProviderConfigs, saveAIProviderConfig } from '@/actions/aiProviderActions';

export async function GET(request: NextRequest) {
  try {
    const result = await getAllAIProviderConfigs();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    
    // 보안을 위해 API 키는 마스킹해서 반환
    const maskedConfigs = result.data?.map(config => ({
      ...config,
      apiKey: config.apiKey ? '••••••••••••••••' : '',
      apiKeyMasked: config.apiKey ? `${config.apiKey.substring(0, 6)}••••••••••••••••${config.apiKey.substring(config.apiKey.length - 4)}` : ''
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: maskedConfigs,
      count: maskedConfigs?.length || 0
    });
    
  } catch (error) {
    console.error('AI Provider API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI provider configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await saveAIProviderConfig(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });
    
  } catch (error) {
    console.error('AI Provider save error:', error);
    return NextResponse.json(
      { error: 'Failed to save AI provider configuration' },
      { status: 500 }
    );
  }
}