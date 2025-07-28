// Firebase Admin을 직접 초기화하여 관리자 권한 설정
const admin = require('firebase-admin');

console.log('🛠️ 관리자 권한 직접 설정 도구');
console.log('===============================');

async function setupAdminRole(uid) {
    try {
        // Firebase Admin 초기화
        if (!admin.apps.length) {
            const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            
            if (!serviceAccountKey) {
                console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 설정되지 않았습니다');
                return;
            }
            
            const serviceAccount = JSON.parse(serviceAccountKey);
            
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: 'innerspell-an7ce'
            });
            
            console.log('✅ Firebase Admin SDK 초기화 완료');
        }
        
        const db = admin.firestore();
        
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
        
        await db.collection('users').doc(uid).set(adminProfile);
        
        console.log('✅ 관리자 권한 설정 완료!');
        console.log('\n📋 관리자 계정 정보:');
        console.log('   이메일: admin@innerspell.com');
        console.log('   비밀번호: admin123');
        console.log('   권한: admin');
        console.log('   UID:', uid);
        
        console.log('\n🔗 테스트 링크:');
        console.log('   로그인: http://localhost:4000/auth/signin');
        console.log('   관리자: http://localhost:4000/admin');
        
        console.log('\n🎉 설정 완료! 이제 로그인을 테스트해보세요.');
        
    } catch (error) {
        console.error('❌ 권한 설정 실패:', error.message);
        
        if (error.message.includes('permission')) {
            console.log('\n💡 권한 문제가 있지만 Firestore는 접근 가능할 수 있습니다.');
            console.log('Firebase Console에서 직접 Firestore 문서를 생성해보세요:');
            console.log('\n📝 Firestore에서 수동 설정:');
            console.log('1. https://console.firebase.google.com/project/innerspell-an7ce/firestore');  
            console.log('2. users 컬렉션 → 새 문서');
            console.log(`3. 문서 ID: ${uid}`);
            console.log('4. 필드 추가:');
            console.log('   - email: "admin@innerspell.com"');
            console.log('   - role: "admin"');
            console.log('   - displayName: "관리자"');
            console.log('   - subscriptionStatus: "premium"');
        }
    }
}

// UID 확인
const uid = process.argv[2];
if (!uid) {
    console.log('❌ UID가 제공되지 않았습니다');
    console.log('사용법: node setup-admin-role-direct.js [UID]');
    console.log(`예시: node setup-admin-role-direct.js qdrcDKB0snXFawsAiaMNZW3nnRZ2`);
    process.exit(1);
}

console.log(`📋 관리자 권한 설정 시작 - UID: ${uid}`);
setupAdminRole(uid);