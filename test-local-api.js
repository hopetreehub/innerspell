const fetch = require('node-fetch');

const testLocalInterpretation = async () => {
  console.log('Testing local tarot interpretation API...\n');

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
    console.log('Sending request to local API...');
    console.log('URL: http://localhost:4000/api/generate-tarot-interpretation');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:4000/api/generate-tarot-interpretation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      timeout: 60000
    });

    console.log('\nResponse status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n=== INTERPRETATION RESULT ===');
    console.log('Length:', result.interpretation?.length || 0, 'characters');
    
    if (result.interpretation) {
      console.log('\nContent Preview:');
      console.log(result.interpretation.substring(0, 500) + '...\n');
      
      // Check for guideline integration
      const interpretation = result.interpretation;
      const hasSpreadRef = interpretation.includes('삼위일체') || interpretation.includes('Trinity') || interpretation.includes('조망');
      const hasPositionRef = interpretation.includes('과거') && interpretation.includes('현재') && interpretation.includes('미래');
      const hasSpiritualRef = interpretation.includes('영적') || interpretation.includes('영혼') || interpretation.includes('성장');
      const hasDetailedAnalysis = interpretation.length > 500;
      const hasPositionSpecific = interpretation.includes('씨앗') || interpretation.includes('거울') || interpretation.includes('꽃피움');
      
      console.log('=== GUIDELINE VERIFICATION ===');
      console.log('✅ Spread reference found:', hasSpreadRef);
      console.log('✅ Position references found:', hasPositionRef);  
      console.log('✅ Spiritual growth elements:', hasSpiritualRef);
      console.log('✅ Detailed analysis (>500 chars):', hasDetailedAnalysis);
      console.log('✅ Position-specific guidance:', hasPositionSpecific);
      
      if (hasSpreadRef && hasPositionRef && hasSpiritualRef && hasDetailedAnalysis) {
        console.log('\n🎉 SUCCESS: Rich guidelines are working properly!');
      } else {
        console.log('\n⚠️ WARNING: Some guideline elements may be missing');
      }
      
      console.log('\n=== FULL INTERPRETATION ===');
      console.log(result.interpretation);
    } else {
      console.log('No interpretation in response:', result);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
};

testLocalInterpretation();