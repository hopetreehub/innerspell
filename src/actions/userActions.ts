'use server';

import { db, FieldValue } from '@/lib/firebase/admin';
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
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // 새 사용자 프로필 생성
      // ADMIN_EMAILS 환경변수에 있는 이메일은 자동으로 관리자 권한 부여
      const adminEmails = (process.env.ADMIN_EMAILS || 'admin@innerspell.com').split(',').map(email => email.trim().replace(/\n/g, ''));
      const isAdmin = adminEmails.includes(userData.email);
      
      const newUserProfile = {
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        level: 'beginner' as const,
        bio: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        role: isAdmin ? 'admin' : 'user',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await userRef.set(newUserProfile);
      console.log(`새 사용자 프로필 생성: ${userId} (role: ${newUserProfile.role})`);
      
      return { 
        success: true, 
        isNewUser: true
      };
    } else {
      // 기존 사용자 프로필 업데이트 (이메일, 이름, 아바타만)
      const updateData: any = {
        updatedAt: FieldValue.serverTimestamp()
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
        await userRef.update(updateData);
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
 * 사용자 프로필 조회 (UserProfile 타입 반환)
 */
export async function getUserProfileData(userId: string) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
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
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };

    return { success: true, profile };
  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    return { success: false, error: '프로필을 불러오는데 실패했습니다.' };
  }
}

export interface AppUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  creationTime?: string;
  lastSignInTime?: string;
  role?: string;
  birthDate?: string;
  subscriptionStatus?: string;
  sajuInfo?: string;
}

/**
 * Firebase Auth 사용자 정보를 AppUser로 변환 (관리자 권한 포함)
 */
export async function getUserProfile(userId: string): Promise<AppUser | null> {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const data = userDoc.data();
    
    // 🔧 긴급 수정: 관리자 권한 로직 수정
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@innerspell.com,junsupark9999@gmail.com').split(',').map(email => email.trim().replace(/\n/g, ''));
    const isEnvAdmin = adminEmails.includes(data.email);
    
    // 환경변수 관리자 OR 데이터베이스 관리자 역할 존중
    const finalRole = isEnvAdmin ? 'admin' : (data.role || 'user');
    
    console.log(`🔍 권한 체크: ${data.email} - ENV_ADMIN: ${isEnvAdmin}, DB_ROLE: ${data.role}, FINAL: ${finalRole}`);
    console.log(`🔍 관리자 이메일 목록:`, adminEmails);
    console.log(`🔍 현재 사용자 이메일: "${data.email}" (길이: ${data.email?.length})`);
    
    const appUser: AppUser = {
      uid: userId,
      email: data.email || '',
      displayName: data.name || data.email || '',
      photoURL: data.avatar || '',
      role: finalRole,
      creationTime: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
      birthDate: data.birthDate || '',
      sajuInfo: data.sajuInfo || '',
      subscriptionStatus: data.subscriptionStatus || 'free'
    };
    
    return appUser;
  } catch (error) {
    console.error('getUserProfile 오류:', error);
    return null;
  }
}

/**
 * Firebase Authentication 사용자 목록 조회
 */
export async function listFirebaseUsers(maxResults: number = 100, nextPageToken?: string) {
  try {
    console.log('Simulating Firebase Admin listUsers...');
    
    // 개발 모드에서는 시뮬레이션 데이터 반환
    const mockUsers: AppUser[] = [
      {
        uid: 'mock-admin-uid-1',
        email: 'admin@innerspell.com',
        displayName: 'Admin User',
        role: 'admin',
        creationTime: new Date('2024-01-01').toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      {
        uid: 'mock-user-uid-1',
        email: 'user1@example.com',
        displayName: 'Test User 1',
        role: 'user',
        creationTime: new Date('2024-02-01').toISOString(),
        lastSignInTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        uid: 'mock-user-uid-2',
        email: 'user2@example.com',
        displayName: 'Test User 2',
        role: 'user',
        creationTime: new Date('2024-03-01').toISOString(),
        lastSignInTime: new Date(Date.now() - 172800000).toISOString(),
      }
    ];

    return {
      users: mockUsers,
      nextPageToken: undefined,
      error: null
    };
  } catch (error) {
    console.error('Firebase Admin 사용자 목록 조회 오류:', error);
    return {
      users: [],
      nextPageToken: undefined,
      error: 'Firebase Admin SDK가 설정되지 않았습니다. 개발 모드에서는 시뮬레이션 데이터를 사용합니다.'
    };
  }
}

/**
 * 사용자 역할 변경
 */
export async function changeUserRole(userId: string, newRole: string) {
  try {
    console.log(`Simulating role change: User ${userId} -> ${newRole}`);
    
    // 개발 모드에서는 시뮬레이션
    return {
      success: true,
      message: `사용자 역할이 ${newRole}로 변경되었습니다. (시뮬레이션 모드)`
    };
  } catch (error) {
    console.error('사용자 역할 변경 오류:', error);
    return {
      success: false,
      message: '역할 변경에 실패했습니다.'
    };
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string,
  updateData: {
    name?: string;
    bio?: string;
    avatar?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }
) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists) {
      return { success: false, error: '사용자 프로필을 찾을 수 없습니다.' };
    }

    const updateFields: any = {
      updatedAt: Timestamp.now()
    };

    // 변경된 필드만 업데이트
    if (updateData.name !== undefined) {
      updateFields.name = updateData.name;
    }
    if (updateData.bio !== undefined) {
      updateFields.bio = updateData.bio;
    }
    if (updateData.avatar !== undefined) {
      updateFields.avatar = updateData.avatar;
    }
    if (updateData.level !== undefined) {
      updateFields.level = updateData.level;
    }

    await updateDoc(userRef, updateFields);
    console.log(`사용자 프로필 업데이트 완료: ${userId}`);

    return { 
      success: true, 
      message: '프로필이 성공적으로 업데이트되었습니다.' 
    };
  } catch (error) {
    console.error('사용자 프로필 업데이트 오류:', error);
    return { 
      success: false, 
      error: '프로필 업데이트 중 오류가 발생했습니다.' 
    };
  }
}