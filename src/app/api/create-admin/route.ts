import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 관리자 계정 생성 API 호출됨');
    
    const adminEmail = 'admin@innerspell.com';
    const adminPassword = 'admin123';
    
    // 1. Firebase Auth에서 사용자 생성/확인
    let userRecord;
    try {
      // 기존 사용자 확인
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`✅ 기존 관리자 계정 발견: ${userRecord.uid}`);
      
      // 비밀번호 업데이트
      await auth.updateUser(userRecord.uid, {
        password: adminPassword
      });
      console.log('🔐 비밀번호 업데이트 완료');
      
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 새 관리자 계정 생성 중...');
        
        userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: '관리자',
        });
        
        console.log(`✅ 새 관리자 계정 생성: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    // 2. Firestore에 프로필 생성
    const userRef = db.collection('users').doc(userRecord.uid);
    const userProfile = {
      email: adminEmail,
      displayName: '관리자',
      role: 'admin',
      birthDate: '',
      sajuInfo: '',
      subscriptionStatus: 'premium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await userRef.set(userProfile, { merge: true });
    console.log('✅ Firestore 프로필 생성 완료');
    
    return NextResponse.json({
      success: true,
      message: '관리자 계정이 성공적으로 생성되었습니다',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: 'admin'
      },
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    });
    
  } catch (error: any) {
    console.error('❌ 관리자 계정 생성 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '관리자 계정 생성 실패',
      error: error.message
    }, { status: 500 });
  }
}