// Google Cloud Console을 통한 서비스 계정 키 생성
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Google Cloud CLI를 통한 서비스 계정 키 생성');
console.log('================================================');

const projectId = 'innerspell-an7ce';
const serviceAccountEmail = `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`;
const keyFileName = 'firebase-service-account-key.json';

// gcloud CLI 설치 확인
exec('gcloud --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Google Cloud CLI가 설치되지 않음');
    console.log('\n📋 수동 생성 방법:');
    console.log('1. 브라우저에서 Firebase Console 접속:');
    console.log(`   https://console.firebase.google.com/project/${projectId}/settings/serviceaccounts/adminsdk`);
    console.log('2. "새 비공개 키 생성" 클릭');
    console.log('3. 다운로드한 JSON 파일을 다음 이름으로 저장:');
    console.log(`   ${path.join(__dirname, keyFileName)}`);
    console.log('4. 다시 generate-firebase-service-account.js 실행');
    return;
  }

  console.log('✅ Google Cloud CLI 발견');
  console.log(stdout);

  // 프로젝트 설정
  exec(`gcloud config set project ${projectId}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ 프로젝트 설정 실패:', error.message);
      return;
    }

    console.log(`✅ 프로젝트 설정: ${projectId}`);

    // 서비스 계정 키 생성
    const keyPath = path.join(__dirname, keyFileName);
    const createKeyCommand = `gcloud iam service-accounts keys create ${keyPath} --iam-account=${serviceAccountEmail}`;

    console.log(`🔑 서비스 계정 키 생성 중...`);
    console.log(`명령어: ${createKeyCommand}`);

    exec(createKeyCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 서비스 계정 키 생성 실패:', error.message);
        console.log('\n🔄 대안 방법:');
        console.log('1. Firebase Console에서 수동 생성');
        console.log('2. 기존 서비스 계정 확인');
        
        // 기존 서비스 계정 목록 확인
        exec(`gcloud iam service-accounts list --filter="email:*firebase*"`, (listError, listStdout) => {
          if (!listError && listStdout) {
            console.log('\n📋 Firebase 서비스 계정 목록:');
            console.log(listStdout);
          }
        });
        return;
      }

      console.log('🎉 서비스 계정 키 생성 성공!');
      console.log(stdout);

      // 자동으로 환경변수 설정 스크립트 실행
      exec('node generate-firebase-service-account.js', (envError, envStdout) => {
        if (envError) {
          console.error('❌ 환경변수 설정 실패:', envError.message);
        } else {
          console.log('✅ 환경변수 자동 설정 완료');
          console.log(envStdout);
        }
      });
    });
  });
});