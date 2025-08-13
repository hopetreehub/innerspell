import { firestore } from '@/lib/firebase/admin';
import type { User } from 'firebase/auth';

/**
 * 사용자 프로필이 Firestore에 존재하는지 확인하고, 없으면 생성합니다.
 */
export async function ensureUserProfile(user: User | { uid: string; email?: string | null; displayName?: string | null }) {
  try {
    const userRef = firestore.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log(`🔄 Creating user profile for ${user.uid}`);
      
      // 기본 사용자 프로필 생성
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '익명 사용자',
        photoURL: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        readingCount: 0,
        sharedCount: 0,
        bio: '',
        isActive: true,
      };
      
      await userRef.set(userData);
      console.log(`✅ User profile created for ${user.uid}`);
      
      return userData;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error(`❌ Error ensuring user profile for ${user.uid}:`, error);
    
    // 에러가 발생해도 기본 정보 반환
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '익명 사용자',
      photoURL: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      readingCount: 0,
      sharedCount: 0,
      bio: '',
      isActive: true,
    };
  }
}