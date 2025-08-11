import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Global mock storage 확인
    const mockStorage = (global as any).mockStorage || {};
    
    // 전체 storage 내용
    const storageInfo = {
      hasStorage: !!(global as any).mockStorage,
      collections: Object.keys(mockStorage),
      communityPosts: mockStorage.communityPosts ? {
        count: Object.keys(mockStorage.communityPosts).length,
        posts: Object.values(mockStorage.communityPosts)
      } : null,
      allData: mockStorage
    };
    
    console.log('[API] Mock Storage Info:', JSON.stringify(storageInfo, null, 2));
    
    return NextResponse.json(storageInfo);
  } catch (error) {
    console.error('[API] Error checking storage:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      hasStorage: false 
    }, { status: 500 });
  }
}