import { TAROT_GUIDELINES } from '../data/tarot-guidelines';
import { adminDb } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function seedGuidelinesData() {
  console.log('🌱 Starting guideline data seeding...');
  
  try {
    const batch = adminDb.batch();
    const guidelinesRef = adminDb.collection('tarot_guidelines');
    
    // Trinity View + Spiritual Growth guideline 찾기
    const trinityViewSpiritualGrowth = TAROT_GUIDELINES.find(
      g => g.id === 'trinity-view-spiritual-growth-reflection'
    );
    
    if (!trinityViewSpiritualGrowth) {
      console.error('❌ Trinity View + Spiritual Growth guideline not found!');
      return;
    }
    
    console.log('📝 Found guideline:', trinityViewSpiritualGrowth.name);
    
    // Firestore에 저장할 데이터 준비
    const guidelineData = {
      ...trinityViewSpiritualGrowth,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      isSystem: true,
      isActive: true,
    };
    
    // Document ID는 guideline ID 사용
    const docRef = guidelinesRef.doc(trinityViewSpiritualGrowth.id);
    batch.set(docRef, guidelineData);
    
    console.log('💾 Preparing to save guideline to Firestore...');
    
    // Batch commit
    await batch.commit();
    
    console.log('✅ Guideline successfully saved to Firestore!');
    console.log('📊 Summary:');
    console.log(`   - ID: ${trinityViewSpiritualGrowth.id}`);
    console.log(`   - Spread: ${trinityViewSpiritualGrowth.spreadId}`);
    console.log(`   - Style: ${trinityViewSpiritualGrowth.styleId}`);
    console.log(`   - Positions: ${trinityViewSpiritualGrowth.positionGuidelines?.length || 0}`);
    
    // 저장된 데이터 확인
    const savedDoc = await docRef.get();
    if (savedDoc.exists) {
      console.log('✅ Verification: Document exists in Firestore');
      const data = savedDoc.data();
      console.log('📋 Saved data preview:', {
        id: data?.id,
        spreadId: data?.spreadId,
        styleId: data?.styleId,
        name: data?.name?.substring(0, 50) + '...'
      });
    }
    
  } catch (error) {
    console.error('❌ Error seeding guidelines:', error);
  }
  
  process.exit(0);
}

// 실행
seedGuidelinesData().catch(console.error);