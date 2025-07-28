// .env.local에서 직접 환경변수를 읽어와서 관리자 권한 설정
const fs = require('fs');
const admin = require('firebase-admin');

console.log('🛠️ 관리자 권한 최종 설정 도구');
console.log('===============================');

function loadEnvFile() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
                const keyValue = line.split('FIREBASE_SERVICE_ACCOUNT_KEY=')[1];
                // 따옴표 제거
                return keyValue.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
            }
        }
        
        return null;
    } catch (error) {
        console.error('❌ .env.local 파일 읽기 실패:', error.message);
        return null;
    }
}

async function setupAdminRole(uid) {
    try {
        console.log('📄 .env.local에서 Firebase 서비스 계정 키 로드 중...');
        
        const serviceAccountKey = loadEnvFile();
        
        if (!serviceAccountKey) {
            console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY를 .env.local에서 찾을 수 없습니다');
            return;
        }
        
        const serviceAccount = JSON.parse(serviceAccountKey);
        console.log('✅ 서비스 계정 키 로드 완료');
        console.log(`📧 Service Account: ${serviceAccount.client_email}`);
        
        // Firebase Admin 초기화
        if (!admin.apps.length) {
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
        
        console.log('🎊 관리자 권한 설정 완료!');
        console.log('\n📋 관리자 계정 정보:');
        console.log('   이메일: admin@innerspell.com');
        console.log('   비밀번호: admin123');
        console.log('   권한: admin');
        console.log('   UID:', uid);
        
        console.log('\n🔗 테스트 링크:');
        console.log('   로그인: http://localhost:4000/auth/signin');
        console.log('   관리자: http://localhost:4000/admin');
        
        console.log('\n🎉 admin@innerspell.com 로그인 문제 완전 해결!');
        console.log('이제 로그인을 테스트해보세요.');
        
    } catch (error) {
        console.error('❌ 권한 설정 실패:', error.message);
        
        if (error.message.includes('PERMISSION_DENIED') || error.message.includes('permission')) {
            console.log('\n💡 Firebase Admin 권한 문제입니다.');
            console.log('🔄 Firestore Console에서 수동 설정:');
            console.log('\n📝 다음 단계:');
            console.log('1. https://console.firebase.google.com/project/innerspell-an7ce/firestore');  
            console.log('2. "users" 컬렉션 선택 (없으면 생성)');
            console.log(`3. 새 문서 ID: ${uid}`);
            console.log('4. 다음 필드들 추가:');
            console.log('   - email (string): "admin@innerspell.com"');
            console.log('   - role (string): "admin"');
            console.log('   - displayName (string): "관리자"');
            console.log('   - subscriptionStatus (string): "premium"');
            console.log('   - createdAt (string): "2025-07-28T11:00:00Z"');
            console.log('   - updatedAt (string): "2025-07-28T11:00:00Z"');
            console.log('\n설정 후 로그인 테스트 가능합니다.');
        }
    }
}

// UID 확인
const uid = process.argv[2] || 'qdrcDKB0snXFawsAiaMNZW3nnRZ2';

console.log(`📋 관리자 권한 설정 시작 - UID: ${uid}`);
setupAdminRole(uid);