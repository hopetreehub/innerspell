import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, db as adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // 보안을 위해 특정 키가 필요
    const { secretKey } = await request.json();
    
    if (secretKey !== 'setup-innerspell-admin-2024') {
      return NextResponse.json(
        { error: '유효하지 않은 키입니다.' },
        { status: 401 }
      );
    }

    const adminEmail = 'admin@innerspell.com';
    const adminPassword = 'admin123';

    // 기존 사용자 확인
    try {
      const existingUser = await adminAuth.getUserByEmail(adminEmail);
      console.log('기존 관리자 계정 발견:', existingUser.uid);
      
      // 비밀번호 업데이트
      await adminAuth.updateUser(existingUser.uid, {
        password: adminPassword
      });
      
      // Firestore 프로필 업데이트
      await adminDb.collection('users').doc(existingUser.uid).set({
        email: adminEmail,
        displayName: 'Admin User',
        role: 'admin',
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      
      return NextResponse.json({
        success: true,
        message: '관리자 계정 비밀번호가 업데이트되었습니다.',
        email: adminEmail,
        password: adminPassword
      });
      
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 새 계정 생성
        const newUser = await adminAuth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'Admin User',
          emailVerified: true
        });
        
        // Firestore에 프로필 생성
        await adminDb.collection('users').doc(newUser.uid).set({
          uid: newUser.uid,
          email: adminEmail,
          displayName: 'Admin User',
          role: 'admin',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          birthDate: '',
          sajuInfo: '',
          subscriptionStatus: 'premium'
        });
        
        return NextResponse.json({
          success: true,
          message: '관리자 계정이 생성되었습니다.',
          email: adminEmail,
          password: adminPassword
        });
      }
      throw error;
    }
    
  } catch (error: any) {
    console.error('관리자 계정 설정 오류:', error);
    return NextResponse.json(
      { error: error.message || '관리자 계정 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}