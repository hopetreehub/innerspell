import { NextRequest, NextResponse } from 'next/server';
import { getAllAIProviderConfigs } from '@/actions/aiProviderActions';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // 실제 저장된 AI 설정 확인
    const result = await getAllAIProviderConfigs();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    
    // OpenAI 설정만 찾기
    const openAIConfig = result.data?.find(config => config.provider === 'openai');
    
    if (openAIConfig && openAIConfig.apiKey) {
      try {
        // 암호화된 키 복호화 시도
        const decryptedKey = decrypt(openAIConfig.apiKey);
        
        return NextResponse.json({
          provider: 'openai',
          hasApiKey: true,
          apiKeyPreview: decryptedKey.substring(0, 10) + '...' + decryptedKey.substring(decryptedKey.length - 4),
          keyLength: decryptedKey.length,
          startsWithSk: decryptedKey.startsWith('sk-'),
          actualPrefix: decryptedKey.substring(0, 20),
          isPlaceholder: decryptedKey.includes('your-') || decryptedKey.includes('here'),
          fullKey: decryptedKey // 디버그용 - 프로덕션에서는 제거
        });
      } catch (error) {
        return NextResponse.json({
          provider: 'openai',
          hasApiKey: true,
          decryptError: error instanceof Error ? error.message : 'Unknown decryption error',
          encryptedKeyLength: openAIConfig.apiKey.length
        });
      }
    }
    
    // 환경 변수 확인
    const envKey = process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      openAIConfigExists: !!openAIConfig,
      envKeyExists: !!envKey,
      envKeyPreview: envKey ? envKey.substring(0, 20) + '...' : null,
      envKeyIsPlaceholder: envKey?.includes('your-') || envKey?.includes('here'),
      configCount: result.data?.length || 0
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Failed to debug AI configuration' },
      { status: 500 }
    );
  }
}