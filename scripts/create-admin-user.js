#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
  console.log('✅ Service Account Key 파일 발견');
} catch (error) {
  console.log('⚠️ Service Account Key 파일이 없습니다. 환경변수로 초기화 시도...');
  
  // Vercel 환경변수 사용
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/\n/g, '');
  if (!projectId) {
    console.error('❌ Firebase Project ID가 없습니다.');
    process.exit(1);
  }
  
  serviceAccount = {
    projectId: projectId
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.projectId
  });
}

const auth = admin.auth();

async function createAdminUser() {
  const adminEmail = 'admin@innerspell.com';
  const adminPassword = 'admin123';
  
  try {
    console.log('🔧 관리자 계정 생성 시작...');
    
    // 기존 계정 확인
    try {
      const existingUser = await auth.getUserByEmail(adminEmail);
      console.log(`✅ 관리자 계정이 이미 존재합니다: ${existingUser.uid}`);
      
      // 비밀번호 업데이트
      await auth.updateUser(existingUser.uid, {
        password: adminPassword
      });
      console.log('🔐 관리자 비밀번호 업데이트 완료');
      
      return existingUser;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 새 관리자 계정 생성 중...');
        
        // 새 계정 생성
        const userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: '관리자'
        });
        
        console.log(`✅ 관리자 계정 생성 완료: ${userRecord.uid}`);
        return userRecord;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error.message);
    throw error;
  }
}

async function createUserProfile(userRecord) {
  try {
    console.log('📄 Firestore에 사용자 프로필 생성 중...');
    
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userRecord.uid);
    
    const userProfile = {
      email: userRecord.email,
      displayName: userRecord.displayName || '관리자',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      birthDate: '',
      sajuInfo: '',
      subscriptionStatus: 'premium'
    };
    
    await userRef.set(userProfile, { merge: true });
    console.log('✅ Firestore 프로필 생성 완료');
    
  } catch (error) {
    console.error('❌ Firestore 프로필 생성 실패:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 InnerSpell 관리자 계정 설정 시작');
    console.log('📧 이메일:', 'admin@innerspell.com');
    console.log('🔐 비밀번호:', 'admin123');
    console.log('');
    
    const userRecord = await createAdminUser();
    await createUserProfile(userRecord);
    
    console.log('');
    console.log('🎉 관리자 계정 설정 완료!');
    console.log('');
    console.log('✅ 이제 다음 정보로 로그인할 수 있습니다:');
    console.log('   이메일: admin@innerspell.com');
    console.log('   비밀번호: admin123');
    console.log('');
    console.log('🔗 로그인 페이지: https://test-studio-firebase.vercel.app/sign-in');
    
  } catch (error) {
    console.error('💥 설정 실패:', error.message);
    process.exit(1);
  }
}

main();