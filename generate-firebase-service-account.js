// Firebase Admin SDK Service Account Key Generator
// This script helps generate and configure the service account key

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase 서비스 계정 키 생성 도구');
console.log('========================================');

// Firebase 프로젝트 정보
const projectInfo = {
  projectId: 'innerspell-an7ce',
  consolePath: 'https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk'
};

console.log(`📋 프로젝트 ID: ${projectInfo.projectId}`);
console.log(`🔗 Console URL: ${projectInfo.consolePath}`);

// 서비스 계정 키 템플릿 생성
const serviceAccountTemplate = {
  "type": "service_account",
  "project_id": projectInfo.projectId,
  "private_key_id": "REPLACE_WITH_ACTUAL_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nREPLACE_WITH_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": `firebase-adminsdk-xxxxx@${projectInfo.projectId}.iam.gserviceaccount.com`,
  "client_id": "REPLACE_WITH_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40${projectInfo.projectId}.iam.gserviceaccount.com`
};

// 템플릿 파일 저장
const templatePath = path.join(__dirname, 'firebase-service-account-template.json');
fs.writeFileSync(templatePath, JSON.stringify(serviceAccountTemplate, null, 2));

console.log('\n📝 단계별 진행 가이드:');
console.log('=====================================');

console.log('\n1️⃣ Firebase Console 접속');
console.log(`   브라우저에서 다음 URL로 이동:`);
console.log(`   ${projectInfo.consolePath}`);

console.log('\n2️⃣ 새 비공개 키 생성');
console.log('   - "새 비공개 키 생성" 버튼 클릭');
console.log('   - "키 생성" 확인');
console.log('   - JSON 파일 자동 다운로드');

console.log('\n3️⃣ JSON 파일을 이 폴더에 복사');
console.log('   - 다운로드한 파일명을 "firebase-service-account-key.json"으로 변경');
console.log(`   - 파일을 ${__dirname}에 저장`);

console.log('\n4️⃣ 자동 처리 실행');
console.log('   이 스크립트를 다시 실행하면 자동으로 환경변수 설정');

// 실제 키 파일이 있는지 확인
const actualKeyPath = path.join(__dirname, 'firebase-service-account-key.json');
if (fs.existsSync(actualKeyPath)) {
  console.log('\n✅ 서비스 계정 키 파일 발견!');
  
  try {
    const keyData = JSON.parse(fs.readFileSync(actualKeyPath, 'utf8'));
    console.log(`📧 Service Account Email: ${keyData.client_email}`);
    console.log(`🔑 Private Key ID: ${keyData.private_key_id}`);
    
    // JSON을 한 줄로 변환
    const minifiedJson = JSON.stringify(keyData);
    
    // 환경변수 파일 업데이트
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // FIREBASE_SERVICE_ACCOUNT_KEY 추가 또는 업데이트
    const serviceAccountKeyLine = `FIREBASE_SERVICE_ACCOUNT_KEY='${minifiedJson}'`;
    
    if (envContent.includes('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
      // 기존 라인 교체
      envContent = envContent.replace(/FIREBASE_SERVICE_ACCOUNT_KEY=.*/g, serviceAccountKeyLine);
    } else {
      // 새 라인 추가
      envContent += `\n# Firebase Admin SDK Service Account\n${serviceAccountKeyLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n🎉 환경변수 설정 완료!');
    console.log('   .env.local 파일에 FIREBASE_SERVICE_ACCOUNT_KEY 추가됨');
    
    console.log('\n🔄 다음 단계:');
    console.log('   1. 로컬 서버 재시작: npm run dev');
    console.log('   2. 관리자 계정 생성: curl http://localhost:4000/api/create-admin');
    console.log('   3. Vercel 환경변수 설정 (프로덕션용)');
    
    // Vercel 환경변수 설정을 위한 명령어 출력
    console.log('\n📋 Vercel 환경변수 설정 명령어:');
    console.log('   vercel env add FIREBASE_SERVICE_ACCOUNT_KEY');
    console.log('   (값 입력 시 위의 minified JSON 사용)');
    
  } catch (error) {
    console.error('❌ 서비스 계정 키 파일 처리 실패:', error.message);
  }
} else {
  console.log(`\n⏳ 서비스 계정 키 파일 대기 중...`);
  console.log(`   파일명: firebase-service-account-key.json`);
  console.log(`   위치: ${__dirname}`);
  
  console.log(`\n📁 템플릿 파일 생성됨:`);
  console.log(`   ${templatePath}`);
}

console.log('\n🚨 보안 주의사항:');
console.log('   - 서비스 계정 키 파일을 GitHub에 커밋하지 마세요');
console.log('   - .gitignore에 firebase-service-account-key.json 추가됨');

// .gitignore 업데이트
const gitignorePath = path.join(__dirname, '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const ignoreEntry = 'firebase-service-account-key.json';
if (!gitignoreContent.includes(ignoreEntry)) {
  gitignoreContent += `\n# Firebase service account keys\n${ignoreEntry}\n*.json\n!package*.json\n!tsconfig*.json\n!firebase.json\n`;
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ .gitignore 업데이트 완료');
}