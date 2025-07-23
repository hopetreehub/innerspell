'use server';

import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';
import { UserProfile } from '@/types';

/**
 * 사용자 프로필 생성 또는 업데이트
 */
export async function createOrUpdateUserProfile(
  userId: string,
  userData: {
    email: string;
    name: string;
    avatar?: string;
  }
) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 새 사용자 프로필 생성
      const newUserProfile = {
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        level: 'beginner' as const,
        bio: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(userRef, newUserProfile);
      console.log(`새 사용자 프로필 생성: ${userId}`);
      
      return { 
        success: true, 
        isNewUser: true
      };
    } else {
      // 기존 사용자 프로필 업데이트 (이메일, 이름, 아바타만)
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      // 변경된 필드만 업데이트
      const currentData = userDoc.data();
      
      if (currentData.email !== userData.email) {
        updateData.email = userData.email;
      }
      
      if (currentData.name !== userData.name) {
        updateData.name = userData.name;
      }
      
      if (userData.avatar && currentData.avatar !== userData.avatar) {
        updateData.avatar = userData.avatar;
      }

      // 실제로 변경된 것이 있을 때만 업데이트
      if (Object.keys(updateData).length > 1) {
        await updateDoc(userRef, updateData);
        console.log(`사용자 프로필 업데이트: ${userId}`);
      }

      return { 
        success: true, 
        isNewUser: false
      };
    }
  } catch (error) {
    console.error('사용자 프로필 생성/업데이트 오류:', error);
    return { 
      success: false, 
      error: '프로필 처리 중 오류가 발생했습니다.' 
    };
  }
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: '사용자 프로필을 찾을 수 없습니다.' };
    }

    const data = userDoc.data();
    const profile: UserProfile = {
      id: userId,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      level: data.level || 'beginner',
      bio: data.bio || '',
      followersCount: data.followersCount || 0,
      followingCount: data.followingCount || 0,
      postsCount: data.postsCount || 0,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };

    return { success: true, profile };
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return { success: false, error: '프로필을 불러오는데 실패했습니다.' };
  }
}