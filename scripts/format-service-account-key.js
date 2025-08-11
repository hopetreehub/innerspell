#!/usr/bin/env node

/**
 * Firebase 서비스 계정 키 JSON을 Vercel 환경 변수용 한 줄로 변환하는 스크립트
 * 
 * 사용법:
 * 1. Firebase Console에서 서비스 계정 키 JSON 다운로드
 * 2. node scripts/format-service-account-key.js path/to/your-key.json
 * 3. 출력된 결과를 Vercel 환경 변수에 붙여넣기
 */

const fs = require('fs');
const path = require('path');

// 명령줄 인자 확인
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Firebase 서비스 계정 키 포맷터
==============================

사용법:
  node scripts/format-service-account-key.js <json-file-path>

예시:
  node scripts/format-service-account-key.js ~/Downloads/innerspell-firebase-key.json

설명:
  이 스크립트는 Firebase 서비스 계정 키 JSON 파일을 
  Vercel 환경 변수에 사용할 수 있는 한 줄 형태로 변환합니다.
  `);
  process.exit(1);
}

const filePath = path.resolve(args[0]);

// 파일 존재 확인
if (!fs.existsSync(filePath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
  process.exit(1);
}

try {
  // JSON 파일 읽기
  const jsonContent = fs.readFileSync(filePath, 'utf8');
  
  // JSON 파싱하여 유효성 검증
  const serviceAccount = JSON.parse(jsonContent);
  
  // 필수 필드 확인
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri'
  ];
  
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  if (missingFields.length > 0) {
    console.error(`❌ 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  
  // 프로젝트 ID 확인
  if (serviceAccount.project_id !== 'innerspell-an7ce') {
    console.warn(`⚠️  주의: 프로젝트 ID가 'innerspell-an7ce'가 아닙니다. 현재: ${serviceAccount.project_id}`);
  }
  
  // JSON을 한 줄로 변환
  const oneLineJson = JSON.stringify(serviceAccount);
  
  console.log('\n✅ 성공적으로 변환되었습니다!\n');
  console.log('아래 내용을 복사하여 Vercel 환경 변수에 붙여넣으세요:');
  console.log('========================================');
  console.log('\n변수명: FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('\n값:');
  console.log(oneLineJson);
  console.log('\n========================================');
  console.log('\n📋 Vercel 설정 방법:');
  console.log('1. https://vercel.com/dashboard 접속');
  console.log('2. test-studio-firebase 프로젝트 선택');
  console.log('3. Settings → Environment Variables');
  console.log('4. "Add New" 클릭');
  console.log('5. Name: FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('6. Value: 위의 JSON 전체 복사하여 붙여넣기');
  console.log('7. Environment: Production ✅');
  console.log('8. "Save" 클릭');
  console.log('\n⚠️  보안 주의: 이 키는 절대 GitHub에 커밋하지 마세요!');
  
} catch (error) {
  console.error(`❌ 오류 발생: ${error.message}`);
  process.exit(1);
}