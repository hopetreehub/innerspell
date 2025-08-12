require('dotenv').config({ path: '.env.local' });

console.log('=== 🚨 긴급 API 키 진단 ===\n');

// 1. 환경 변수 확인
console.log('1️⃣ 환경 변수 상태:');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 15)}...` : '❌ 미설정');
console.log('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? `${process.env.GOOGLE_API_KEY.substring(0, 15)}...` : '❌ 미설정');
console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 15)}...` : '❌ 미설정');
console.log('- HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 15)}...` : '❌ 미설정');

// 2. Gemini API 테스트 (여러 모델)
async function testGeminiModels() {
  console.log('\n2️⃣ Gemini API 모델 테스트:');
  
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
          })
        }
      );
      
      console.log(`- ${model}: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
      
      if (response.status !== 200) {
        const error = await response.text();
        console.log(`  오류: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`- ${model}: ❌ 요청 실패 - ${error.message}`);
    }
  }
}

// 3. OpenRouter API 테스트
async function testOpenRouter() {
  console.log('\n3️⃣ OpenRouter API 테스트:');
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('❌ OPENROUTER_API_KEY 미설정');
    return;
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'InnerSpell Tarot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    console.log(`- 상태: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('- 응답:', data.choices?.[0]?.message?.content || 'No response');
    } else {
      const error = await response.text();
      console.log('- 오류:', error.substring(0, 100));
    }
  } catch (error) {
    console.log(`❌ 요청 실패: ${error.message}`);
  }
}

// 4. HuggingFace API 테스트
async function testHuggingFace() {
  console.log('\n4️⃣ HuggingFace API 테스트:');
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log('❌ HUGGINGFACE_API_KEY 미설정');
    return;
  }
  
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Hello, I am',
          parameters: { max_length: 20 }
        })
      }
    );
    
    console.log(`- 상태: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('- 응답:', Array.isArray(data) ? data[0].generated_text : 'No response');
    } else {
      const error = await response.text();
      console.log('- 오류:', error.substring(0, 100));
    }
  } catch (error) {
    console.log(`❌ 요청 실패: ${error.message}`);
  }
}

// 실행
(async () => {
  await testGeminiModels();
  await testOpenRouter();
  await testHuggingFace();
  
  console.log('\n=== 📊 진단 완료 ===');
})();