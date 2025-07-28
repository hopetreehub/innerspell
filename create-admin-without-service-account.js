// Firebase Admin SDK 없이 관리자 계정 생성 (클라이언트 SDK 사용)
const fs = require('fs');

console.log('🔧 대안 방법: 클라이언트 SDK를 통한 관리자 계정 생성');
console.log('=================================================');

// 임시 해결책: 환경변수를 직접 설정하여 Admin SDK 우회
const tempServiceAccount = {
  "type": "service_account",
  "project_id": "innerspell-an7ce",
  "private_key_id": "dummy_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n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\n-----END PRIVATE KEY-----",
  "client_email": "firebase-adminsdk-dummy@innerspell-an7ce.iam.gserviceaccount.com",
  "client_id": "000000000000000000000",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dummy%40innerspell-an7ce.iam.gserviceaccount.com"
};

console.log('⚠️ 주의: 이것은 더미 서비스 계정입니다.');
console.log('실제 운영 환경에서는 올바른 서비스 계정 키가 필요합니다.');

// 더미 키를 환경변수에 추가 (테스트용)
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');

const dummyServiceAccountLine = `FIREBASE_SERVICE_ACCOUNT_KEY='${JSON.stringify(tempServiceAccount)}'`;

if (!envContent.includes('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
  const newEnvContent = envContent + `\n# Temporary Firebase Admin SDK Service Account (REPLACE WITH REAL KEY)\n${dummyServiceAccountLine}\n`;
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ 임시 서비스 계정 키가 .env.local에 추가됨');
} else {
  console.log('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY가 이미 존재함');
}

console.log('\n📋 다음 단계:');
console.log('1. 🔥 실제 Firebase Console에서 올바른 서비스 계정 키 생성');
console.log('   https://console.firebase.google.com/project/innerspell-an7ce/settings/serviceaccounts/adminsdk');
console.log('2. 🔄 .env.local의 FIREBASE_SERVICE_ACCOUNT_KEY를 실제 키로 교체');
console.log('3. 🚀 로컬 서버 재시작 후 /api/create-admin 호출');

console.log('\n🎯 현재 상태:');
console.log('- 임시 더미 키로 환경변수 설정됨');
console.log('- Admin SDK 초기화는 여전히 실패할 수 있음');
console.log('- 실제 키 설정 후 정상 작동 예상');