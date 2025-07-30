// Direct API test for AI interpretation
const https = require('https');

async function testAIInterpretationAPI() {
    console.log('🔍 Testing AI Tarot Interpretation API directly...');
    console.log('📅 Test time:', new Date().toISOString());
    
    const testData = {
        question: "테스트 질문: 나의 미래는 어떻게 될까요? (해석 스타일: 전통 RWS (라이더-웨이트-스미스))",
        cardSpread: "3카드 (과거-현재-미래)",
        cardInterpretations: `1. The Fool (과거) (정방향): 새로운 시작, 순수함, 모험...
2. The World (현재) (역방향): 미완성, 지연, 좌절...
3. The Sun (미래) (정방향): 성공, 활력, 긍정적 에너지...`,
        isGuestUser: false,
        spreadId: "past-present-future",
        styleId: "traditional-rws"
    };
    
    const options = {
        hostname: 'test-studio-firebase.vercel.app',
        path: '/api/debug/test-tarot',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(testData))
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('\n📊 Response received:');
                console.log('Raw data length:', data.length);
                
                try {
                    const parsed = JSON.parse(data);
                    console.log('\n✅ Parsed response:');
                    console.log(JSON.stringify(parsed, null, 2));
                    
                    if (parsed.success) {
                        console.log('\n✅ SUCCESS: AI interpretation generated');
                        console.log('Interpretation length:', parsed.interpretation?.length || 0);
                    } else {
                        console.log('\n❌ FAILED:', parsed.error);
                    }
                } catch (error) {
                    console.log('\n❌ Failed to parse response:', error.message);
                    console.log('Raw response:', data.substring(0, 500));
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });
        
        req.write(JSON.stringify(testData));
        req.end();
    });
}

// Run the test
testAIInterpretationAPI().catch(console.error);