import { NextRequest, NextResponse } from 'next/server';
import { TAROT_GUIDELINES } from '@/data/tarot-guidelines';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('[SEED] Starting guideline data seeding...');
  
  try {
    const batch = adminDb.batch();
    const guidelinesRef = adminDb.collection('tarot_guidelines');
    
    // Trinity View + Spiritual Growth guideline 찾기
    const trinityViewSpiritualGrowth = TAROT_GUIDELINES.find(
      g => g.id === 'trinity-view-spiritual-growth-reflection'
    );
    
    if (!trinityViewSpiritualGrowth) {
      console.error('[SEED] Trinity View + Spiritual Growth guideline not found!');
      return NextResponse.json(
        { error: 'Trinity View + Spiritual Growth guideline not found' },
        { status: 404 }
      );
    }
    
    console.log('[SEED] Found guideline:', trinityViewSpiritualGrowth.name);
    
    // Firestore에 저장할 데이터 준비
    const guidelineData = {
      ...trinityViewSpiritualGrowth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystem: true,
      isActive: true,
    };
    
    // Document ID는 guideline ID 사용
    const docRef = guidelinesRef.doc(trinityViewSpiritualGrowth.id);
    batch.set(docRef, guidelineData);
    
    console.log('[SEED] Preparing to save guideline to Firestore...');
    
    // Batch commit
    await batch.commit();
    
    console.log('[SEED] Guideline successfully saved to Firestore!');
    
    // 저장된 데이터 확인
    const savedDoc = await docRef.get();
    if (savedDoc.exists) {
      console.log('[SEED] Verification: Document exists in Firestore');
      const data = savedDoc.data();
      
      return NextResponse.json({
        success: true,
        message: 'Guideline successfully seeded to Firestore',
        data: {
          id: data?.id,
          spreadId: data?.spreadId,
          styleId: data?.styleId,
          name: data?.name,
          positionsCount: data?.positions?.length || 0
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Document not found after saving'
    }, { status: 500 });
    
  } catch (error) {
    console.error('[SEED] Error seeding guidelines:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed guidelines',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed guidelines'
  });
}