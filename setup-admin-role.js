// Firebase Console에서 수동 생성한 계정에 관리자 권한 부여
const { db } = require('./src/lib/firebase/admin.ts');

console.log('🛠️ 관리자 권한 설정 도구');
console.log('===============================');

async function setupAdminRole() {
  try {
    // 1. admin@innerspell.com 사용자 UID 찾기
    console.log('🔍 admin@innerspell.com 계정 검색 중...');
    
    // Firebase Console에서 생성한 사용자의 UID를 여기에 입력하세요
    const adminEmail = 'admin@innerspell.com';
    
    // 2. Firestore에서 사용자 검색
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', adminEmail).get();
    
    if (querySnapshot.empty) {
      console.log('📝 새 관리자 프로필 생성...');
      
      // 수동으로 UID를 입력받아야 함 (Firebase Console에서 확인)
      console.log('⚠️ Firebase Console에서 다음 정보 확인 필요:');
      console.log('1. https://console.firebase.google.com/project/innerspell-an7ce/authentication/users');
      console.log('2. admin@innerspell.com 사용자의 UID 복사');
      console.log('3. 아래 코드에서 ADMIN_UID 값을 실제 UID로 교체');
      
      const ADMIN_UID = 'YOUR_ADMIN_UID_HERE'; // Firebase Console에서 확인한 UID로 교체
      
      if (ADMIN_UID === 'YOUR_ADMIN_UID_HERE') {
        console.log('❌ ADMIN_UID를 실제 값으로 설정해주세요');
        return;
      }
      
      const adminProfile = {
        email: adminEmail,
        displayName: '관리자',
        role: 'admin',
        birthDate: '',
        sajuInfo: '',
        subscriptionStatus: 'premium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.collection('users').doc(ADMIN_UID).set(adminProfile);
      console.log('✅ 관리자 프로필 생성 완료');
      
    } else {
      console.log('🔄 기존 관리자 프로필 업데이트...');
      
      querySnapshot.forEach(async (doc) => {
        await doc.ref.update({
          role: 'admin',
          subscriptionStatus: 'premium',
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ 관리자 권한 업데이트 완료: ${doc.id}`);
      });
    }
    
    console.log('\n🎉 설정 완료!');
    console.log('📋 관리자 계정 정보:');
    console.log('   이메일: admin@innerspell.com');
    console.log('   비밀번호: admin123');
    console.log('   권한: admin');
    
    console.log('\n🔗 테스트 링크:');
    console.log('   로그인: http://localhost:4000/auth/signin');
    console.log('   관리자: http://localhost:4000/admin');
    
  } catch (error) {
    console.error('❌ 설정 실패:', error);
    
    if (error.message.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
      console.log('\n💡 해결책:');
      console.log('1. Firebase Console에서 수동으로 계정 생성');
      console.log('2. 권한 문제가 해결된 후 이 스크립트 재실행');
    }
  }
}

// UID 수동 설정용 함수
function setAdminRoleWithUID(uid) {
  console.log(`🎯 UID ${uid}에 관리자 권한 부여 중...`);
  
  const adminProfile = {
    email: 'admin@innerspell.com',
    displayName: '관리자',
    role: 'admin',
    birthDate: '',
    sajuInfo: '',
    subscriptionStatus: 'premium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return db.collection('users').doc(uid).set(adminProfile)
    .then(() => {
      console.log('✅ 관리자 권한 설정 완료');
      console.log('🔗 로그인 테스트: http://localhost:4000/auth/signin');
    })
    .catch(error => {
      console.error('❌ 권한 설정 실패:', error);
    });
}

// 명령행 인수로 UID 전달 가능
if (process.argv[2]) {
  const uid = process.argv[2];
  console.log(`📋 UID를 통한 직접 설정: ${uid}`);
  setAdminRoleWithUID(uid);
} else {
  setupAdminRole();
}

console.log('\n📞 사용법:');
console.log('기본: node setup-admin-role.js');
console.log('UID 직접 설정: node setup-admin-role.js [UID]');