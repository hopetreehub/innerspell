// Firebase Admin SDK를 사용하여 관리자 계정 생성
const admin = require('firebase-admin');

async function createAdminUser() {
  try {
    // Firebase Admin SDK 초기화 확인
    if (!admin.apps.length) {
      console.log('🔥 Firebase Admin SDK 초기화 시도...');
      
      // 환경 변수에서 Firebase 프로젝트 ID 가져오기
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'innerspell-an7ce';
      
      admin.initializeApp({
        projectId: projectId,
        // Admin SDK는 Google Cloud에서 자동으로 credentials를 감지합니다
      });
      
      console.log('✅ Firebase Admin SDK 초기화 완료');
    }
    
    console.log('\n=== 관리자 계정 생성 및 권한 부여 ===');
    
    const adminEmail = 'admin@innerspell.com';
    const adminPassword = 'Test123456!';
    
    try {
      // 기존 사용자 확인
      console.log(`🔍 기존 사용자 확인: ${adminEmail}`);
      let userRecord;
      
      try {
        userRecord = await admin.auth().getUserByEmail(adminEmail);
        console.log(`👤 기존 사용자 발견: ${userRecord.uid}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('👤 사용자가 존재하지 않음, 새로 생성...');
          
          // 새 사용자 생성
          userRecord = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            emailVerified: true,
            displayName: 'Administrator'
          });
          
          console.log(`✅ 새 사용자 생성 완료: ${userRecord.uid}`);
        } else {
          throw error;
        }
      }
      
      // 사용자 커스텀 클레임에 admin 권한 설정
      console.log(`🔐 관리자 권한 설정: ${userRecord.uid}`);
      
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'admin',
        isAdmin: true,
        adminLevel: 'super',
        permissions: ['read', 'write', 'delete', 'admin']
      });
      
      console.log('✅ 관리자 권한 설정 완료');
      
      // Firestore에도 사용자 문서 생성/업데이트
      const db = admin.firestore();
      
      const userDoc = {
        email: adminEmail,
        role: 'admin',
        isAdmin: true,
        adminLevel: 'super',
        displayName: 'Administrator',
        emailVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        permissions: ['read', 'write', 'delete', 'admin']
      };
      
      await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
      
      console.log('✅ Firestore 사용자 문서 생성/업데이트 완료');
      
      console.log('\n📝 관리자 계정 정보:');
      console.log('이메일:', adminEmail);
      console.log('비밀번호:', adminPassword);
      console.log('UID:', userRecord.uid);
      console.log('권한: admin (super level)');
      
      return {
        success: true,
        userRecord,
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      };
      
    } catch (error) {
      console.error('❌ 사용자 생성/업데이트 실패:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin 초기화 실패:', error);
    
    // Fallback: 로컬 Mock 데이터 생성
    console.log('\n🔄 Fallback: Mock 관리자 계정 정보 제공');
    return {
      success: false,
      error: error.message,
      mockCredentials: {
        email: 'admin@innerspell.com',
        password: 'Test123456!',
        note: 'Firebase Admin SDK 사용 불가, 수동 로그인 필요'
      }
    };
  }
}

// 실행
if (require.main === module) {
  createAdminUser()
    .then(result => {
      console.log('\n🎉 관리자 계정 설정 완료!');
      console.log('결과:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };