'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment,
  runTransaction,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';
import { 
  ReadingExperience, 
  ReadingExperienceFormData, 
  ReadingExperienceFormSchema,
  CommentFormData,
  CommentFormSchema,
  ReadingComment,
  UserProfile
} from '@/types';

// 리딩 경험 생성
export async function createReadingExperience(
  formData: ReadingExperienceFormData,
  userId: string
) {
  try {
    // 폼 데이터 검증
    const validatedData = ReadingExperienceFormSchema.parse(formData);
    
    // 사용자 정보 조회
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const userData = userDoc.data() as UserProfile;
    
    // 리딩 경험 데이터 생성
    const experienceData = {
      title: validatedData.title,
      content: validatedData.content,
      authorId: userId,
      spreadType: validatedData.spreadType,
      cards: validatedData.cards,
      tags: validatedData.tags,
      likes: 0,
      commentsCount: 0,
      views: 0,
      isPublished: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Firestore에 저장
    const docRef = await addDoc(collection(db, 'reading-experiences'), experienceData);
    
    // 사용자 게시글 수 증가
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      transaction.update(userRef, {
        postsCount: increment(1),
        updatedAt: Timestamp.now()
      });
    });

    revalidatePath('/community/reading-share');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('리딩 경험 생성 오류:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

// 리딩 경험 목록 조회
export async function getReadingExperiences(
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot,
  sortBy: 'latest' | 'popular' | 'likes' | 'comments' = 'latest',
  filterTag?: string
) {
  try {
    let q = query(
      collection(db, 'reading-experiences'),
      where('isPublished', '==', true)
    );

    // 태그 필터링
    if (filterTag) {
      q = query(q, where('tags', 'array-contains', filterTag));
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('views', 'desc'));
        break;
      case 'likes':
        q = query(q, orderBy('likes', 'desc'));
        break;
      case 'comments':
        q = query(q, orderBy('commentsCount', 'desc'));
        break;
      default: // latest
        q = query(q, orderBy('createdAt', 'desc'));
    }

    // 페이지네이션
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const experiences: ReadingExperience[] = [];
    const authors: { [key: string]: UserProfile } = {};

    // 작성자 정보를 미리 조회
    const authorIds = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      authorIds.add(data.authorId);
    });

    // 작성자 정보 배치 조회
    const authorPromises = Array.from(authorIds).map(async (authorId) => {
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        authors[authorId] = userDoc.data() as UserProfile;
      }
    });
    await Promise.all(authorPromises);

    // 경험 데이터 구성
    querySnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const author = authors[data.authorId];
      
      experiences.push({
        id: docSnapshot.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        author: author ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
          level: author.level
        } : undefined,
        spreadType: data.spreadType,
        cards: data.cards || [],
        tags: data.tags || [],
        likes: data.likes || 0,
        commentsCount: data.commentsCount || 0,
        views: data.views || 0,
        isPublished: data.isPublished,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      });
    });

    return {
      success: true,
      experiences,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('리딩 경험 목록 조회 오류:', error);
    return { success: false, error: '데이터를 불러오는데 실패했습니다.' };
  }
}

// 특정 리딩 경험 조회
export async function getReadingExperience(experienceId: string, userId?: string) {
  try {
    const docRef = doc(db, 'reading-experiences', experienceId);
    const docSnapshot = await getDoc(docRef);
    
    if (!docSnapshot.exists()) {
      return { success: false, error: '게시글을 찾을 수 없습니다.' };
    }

    const data = docSnapshot.data();
    
    // 조회수 증가 (작성자 본인 제외)
    if (userId && userId !== data.authorId) {
      await updateDoc(docRef, {
        views: increment(1),
        updatedAt: Timestamp.now()
      });
    }

    // 작성자 정보 조회
    const userDoc = await getDoc(doc(db, 'users', data.authorId));
    let author = undefined;
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      author = {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        level: userData.level
      };
    }

    // 사용자별 좋아요/북마크 상태 조회
    let isLiked = false;
    let isBookmarked = false;
    
    if (userId) {
      const [likeQuery, bookmarkQuery] = await Promise.all([
        getDocs(query(
          collection(db, 'reading-likes'),
          where('postId', '==', experienceId),
          where('userId', '==', userId)
        )),
        getDocs(query(
          collection(db, 'bookmarks'),
          where('postId', '==', experienceId),
          where('userId', '==', userId)
        ))
      ]);
      
      isLiked = !likeQuery.empty;
      isBookmarked = !bookmarkQuery.empty;
    }

    const experience: ReadingExperience & { isLiked?: boolean, isBookmarked?: boolean } = {
      id: docSnapshot.id,
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      author,
      spreadType: data.spreadType,
      cards: data.cards || [],
      tags: data.tags || [],
      likes: data.likes || 0,
      commentsCount: data.commentsCount || 0,
      views: data.views || 0,
      isPublished: data.isPublished,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      isLiked,
      isBookmarked
    };

    return { success: true, experience };
  } catch (error) {
    console.error('리딩 경험 조회 오류:', error);
    return { success: false, error: '게시글을 불러오는데 실패했습니다.' };
  }
}

// 좋아요 토글
export async function toggleLike(experienceId: string, userId: string) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const experienceRef = doc(db, 'reading-experiences', experienceId);
      const experienceDoc = await transaction.get(experienceRef);
      
      if (!experienceDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      // 기존 좋아요 확인
      const likeQuery = query(
        collection(db, 'reading-likes'),
        where('postId', '==', experienceId),
        where('userId', '==', userId)
      );
      const likeSnapshot = await getDocs(likeQuery);

      if (likeSnapshot.empty) {
        // 좋아요 추가
        const likeRef = doc(collection(db, 'reading-likes'));
        transaction.set(likeRef, {
          postId: experienceId,
          userId: userId,
          createdAt: Timestamp.now()
        });
        
        // 좋아요 수 증가
        transaction.update(experienceRef, {
          likes: increment(1),
          updatedAt: Timestamp.now()
        });
        
        return { isLiked: true };
      } else {
        // 좋아요 제거
        const likeDoc = likeSnapshot.docs[0];
        transaction.delete(doc(db, 'reading-likes', likeDoc.id));
        
        // 좋아요 수 감소
        transaction.update(experienceRef, {
          likes: increment(-1),
          updatedAt: Timestamp.now()
        });
        
        return { isLiked: false };
      }
    });

    revalidatePath(`/community/reading-share/${experienceId}`);
    return { success: true, ...result };
  } catch (error) {
    console.error('좋아요 토글 오류:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

// 북마크 토글
export async function toggleBookmark(experienceId: string, userId: string) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // 기존 북마크 확인
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('postId', '==', experienceId),
        where('userId', '==', userId)
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);

      if (bookmarkSnapshot.empty) {
        // 북마크 추가
        const bookmarkRef = doc(collection(db, 'bookmarks'));
        transaction.set(bookmarkRef, {
          postId: experienceId,
          userId: userId,
          createdAt: Timestamp.now()
        });
        
        return { isBookmarked: true };
      } else {
        // 북마크 제거
        const bookmarkDoc = bookmarkSnapshot.docs[0];
        transaction.delete(doc(db, 'bookmarks', bookmarkDoc.id));
        
        return { isBookmarked: false };
      }
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('북마크 토글 오류:', error);
    return { success: false, error: '북마크 처리에 실패했습니다.' };
  }
}

// 댓글 작성
export async function createComment(
  experienceId: string,
  formData: CommentFormData,
  userId: string
) {
  try {
    const validatedData = CommentFormSchema.parse(formData);
    
    const result = await runTransaction(db, async (transaction) => {
      // 댓글 추가
      const commentRef = doc(collection(db, 'reading-comments'));
      transaction.set(commentRef, {
        postId: experienceId,
        authorId: userId,
        content: validatedData.content,
        likes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // 게시글 댓글 수 증가
      const experienceRef = doc(db, 'reading-experiences', experienceId);
      transaction.update(experienceRef, {
        commentsCount: increment(1),
        updatedAt: Timestamp.now()
      });

      return { commentId: commentRef.id };
    });

    revalidatePath(`/community/reading-share/${experienceId}`);
    return { success: true, ...result };
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    return { success: false, error: '댓글 작성에 실패했습니다.' };
  }
}

// 댓글 목록 조회
export async function getComments(experienceId: string) {
  try {
    const q = query(
      collection(db, 'reading-comments'),
      where('postId', '==', experienceId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const comments: ReadingComment[] = [];
    const authors: { [key: string]: UserProfile } = {};

    // 작성자 정보를 미리 조회
    const authorIds = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      authorIds.add(data.authorId);
    });

    // 작성자 정보 배치 조회
    const authorPromises = Array.from(authorIds).map(async (authorId) => {
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        authors[authorId] = userDoc.data() as UserProfile;
      }
    });
    await Promise.all(authorPromises);

    // 댓글 데이터 구성
    querySnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const author = authors[data.authorId];
      
      comments.push({
        id: docSnapshot.id,
        postId: data.postId,
        authorId: data.authorId,
        author: author ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar
        } : undefined,
        content: data.content,
        parentId: data.parentId,
        likes: data.likes || 0,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      });
    });

    return { success: true, comments };
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return { success: false, error: '댓글을 불러오는데 실패했습니다.' };
  }
}

// 리딩 경험 삭제
export async function deleteReadingExperience(experienceId: string, userId: string) {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const experienceRef = doc(db, 'reading-experiences', experienceId);
      const experienceDoc = await transaction.get(experienceRef);
      
      if (!experienceDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const data = experienceDoc.data();
      
      // 작성자 확인
      if (data.authorId !== userId) {
        throw new Error('삭제 권한이 없습니다.');
      }

      // 게시글 삭제
      transaction.delete(experienceRef);

      // 사용자 게시글 수 감소
      const userRef = doc(db, 'users', userId);
      transaction.update(userRef, {
        postsCount: increment(-1),
        updatedAt: Timestamp.now()
      });

      return { success: true };
    });

    // 관련 데이터 정리 (별도 트랜잭션으로)
    const [likesSnapshot, commentsSnapshot, bookmarksSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'reading-likes'), where('postId', '==', experienceId))),
      getDocs(query(collection(db, 'reading-comments'), where('postId', '==', experienceId))),
      getDocs(query(collection(db, 'bookmarks'), where('postId', '==', experienceId)))
    ]);

    // 관련 데이터 삭제
    const deletePromises = [];
    
    likesSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    commentsSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    bookmarksSnapshot.docs.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    revalidatePath('/community/reading-share');
    redirect('/community/reading-share');
  } catch (error) {
    console.error('리딩 경험 삭제 오류:', error);
    return { success: false, error: '게시글 삭제에 실패했습니다.' };
  }
}