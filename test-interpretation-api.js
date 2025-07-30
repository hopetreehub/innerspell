const testInterpretation = async () => {
  console.log('Testing enhanced tarot interpretation API...\n');

  const testData = {
    question: '오늘의 운세',
    cardSpread: '삼위일체 조망 (Trinity View)',
    cardInterpretations: `Page of Cups (컵 시종) (과거) (역방향): 감정적으로 미숙하거나, 현실을 외면하려는 경향
2 of Cups (컵 2) (현재) (역방향): 관계에서의 불협화음이나 소통 부족
10 of Pentacles (펜타클 10) (미래) (정방향): 물질적 풍요와 가족의 화합, 성취의 완성`,
    isGuestUser: false,
    spreadId: 'trinity-view',
    styleId: 'spiritual-growth-reflection'
  };

  try {
    // Test with the generate function directly
    const { generateTarotInterpretation } = await import('./src/ai/flows/generate-tarot-interpretation.ts');
    
    console.log('Input data:');
    console.log('- Question:', testData.question);
    console.log('- Spread:', testData.cardSpread);
    console.log('- Style ID:', testData.styleId);
    console.log('- Cards:', testData.cardInterpretations.substring(0, 100) + '...\n');
    
    console.log('Calling generateTarotInterpretation...');
    const result = await generateTarotInterpretation(testData);
    
    console.log('\n=== INTERPRETATION RESULT ===');
    console.log('Length:', result.interpretation.length, 'characters');
    console.log('\nContent Preview:');
    console.log(result.interpretation.substring(0, 500) + '...\n');
    
    // Check for guideline integration
    const interpretation = result.interpretation;
    const hasSpreadRef = interpretation.includes('삼위일체') || interpretation.includes('Trinity') || interpretation.includes('조망');
    const hasPositionRef = interpretation.includes('과거') && interpretation.includes('현재') && interpretation.includes('미래');
    const hasSpiritualRef = interpretation.includes('영적') || interpretation.includes('영혼') || interpretation.includes('성장');
    const hasDetailedAnalysis = interpretation.length > 500;
    
    console.log('=== GUIDELINE VERIFICATION ===');
    console.log('✅ Spread reference found:', hasSpreadRef);
    console.log('✅ Position references found:', hasPositionRef);
    console.log('✅ Spiritual growth elements:', hasSpiritualRef);
    console.log('✅ Detailed analysis (>500 chars):', hasDetailedAnalysis);
    
    if (hasSpreadRef && hasPositionRef && hasSpiritualRef && hasDetailedAnalysis) {
      console.log('\n🎉 SUCCESS: Rich guidelines are working properly!');
    } else {
      console.log('\n⚠️ WARNING: Some guideline elements may be missing');
    }
    
    console.log('\n=== FULL INTERPRETATION ===');
    console.log(result.interpretation);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testInterpretation();