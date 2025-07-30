const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./innerspell-an7ce-firebase-adminsdk-fbsvc-146460f64e.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'innerspell-an7ce'
  });
}

// Import the function we want to test
async function testTarotInterpretation() {
  try {
    console.log('🧪 Testing AI Tarot Interpretation with Fixed Configuration...');
    
    // Import the function dynamically
    const { generateTarotInterpretation } = await import('./src/ai/flows/generate-tarot-interpretation.ts');
    
    const testInput = {
      question: "직장에서의 성장 가능성이 궁금합니다.",
      cardSpread: "3-card (과거, 현재, 미래)",
      cardInterpretations: `과거: 별 (정방향) - 희망과 영감, 큰 꿈을 품었던 시기
현재: 검의 7 (정방향) - 전략적 사고, 신중한 계획이 필요한 상황
미래: 컵의 에이스 (정방향) - 새로운 감정적 시작, 창의적 기회`,
      isGuestUser: false,
      spreadId: '3-card-spread',
      styleId: 'traditional-style'
    };
    
    console.log('📝 Test Input:', testInput);
    console.log('\n🚀 Calling generateTarotInterpretation...');
    
    const result = await generateTarotInterpretation(testInput);
    
    console.log('\n✅ Function completed successfully!');
    console.log('📄 Result:');
    console.log('---');
    console.log(result.interpretation);
    console.log('---');
    console.log('\n📊 Result metadata:');
    console.log('- Length:', result.interpretation.length, 'characters');
    console.log('- Contains "AI 해석 오류":', result.interpretation.includes('AI 해석 오류'));
    console.log('- Success:', !result.interpretation.includes('AI 해석 오류'));
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  } finally {
    process.exit(0);
  }
}

testTarotInterpretation();