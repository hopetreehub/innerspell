#!/usr/bin/env node

/**
 * AI API 설정 도우미 스크립트
 * 실행: node scripts/setup-ai.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🤖 InnerSpell AI 설정 도우미\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('어떤 AI 제공자를 설정하시겠습니까?\n');
  console.log('1. OpenAI (GPT-3.5/GPT-4)');
  console.log('2. Anthropic (Claude)');
  console.log('3. Google AI (Gemini)');
  console.log('4. 모두 설정');
  console.log('5. 건너뛰기\n');
  
  const choice = await question('선택 (1-5): ');
  
  let updates = {};
  
  if (choice === '1' || choice === '4') {
    const openaiKey = await question('\nOpenAI API 키 (sk-...): ');
    if (openaiKey && openaiKey.startsWith('sk-')) {
      updates.OPENAI_API_KEY = openaiKey;
      console.log('✅ OpenAI 키 설정됨');
    }
  }
  
  if (choice === '2' || choice === '4') {
    const anthropicKey = await question('\nAnthropic API 키 (sk-ant-...): ');
    if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
      updates.ANTHROPIC_API_KEY = anthropicKey;
      console.log('✅ Anthropic 키 설정됨');
    }
  }
  
  if (choice === '3' || choice === '4') {
    const googleKey = await question('\nGoogle AI API 키 (AIza...): ');
    if (googleKey && googleKey.startsWith('AIza')) {
      updates.GOOGLE_API_KEY = googleKey;
      updates.GEMINI_API_KEY = googleKey;
      console.log('✅ Google AI 키 설정됨');
    }
  }
  
  if (Object.keys(updates).length > 0) {
    // 기존 .env.local 읽기
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // 업데이트
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    // 저장
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    console.log('\n✅ .env.local 파일이 업데이트되었습니다!');
    console.log('\n다음 단계:');
    console.log('1. 개발 서버 재시작: npm run dev');
    console.log('2. Admin 패널에서 AI 제공자 활성화: http://localhost:4000/admin');
  }
  
  rl.close();
}

main().catch(console.error);