'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ReadingComment, UserProfile } from '@/types';

export class ReadingCommentService {
  private static readonly COMMENTS_COLLECTION = 'reading-comments';
  private static readonly USERS_COLLECTION = 'users';

  /**
   * 특정 게시글의 댓글 목록을 가져옵니다
   */
  static async getComments(experienceId: string) {
    try {
      const q = query(
        collection(db, this.COMMENTS_COLLECTION),
        where('postId', '==', experienceId),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const comments: ReadingComment[] = [];
      const authors: { [key: string]: UserProfile } = {};

      // 작성자 정보를 미리 조회
      const authorIds = new Set<string>();
      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        authorIds.add(data.authorId);
      });

      // 작성자 정보 배치 조회
      const authorPromises = Array.from(authorIds).map(async (authorId) => {
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, authorId));
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
      return { success: false, error: '댓글을 불러오는데 실패했습니다.', comments: [] };
    }
  }

  /**
   * 댓글 좋아요 상태 확인
   */
  static async getCommentLikeStatus(commentIds: string[], userId: string) {
    try {
      const likeStatuses: { [commentId: string]: boolean } = {};

      const promises = commentIds.map(async (commentId) => {
        const likeQuery = query(
          collection(db, 'comment-likes'),
          where('commentId', '==', commentId),
          where('userId', '==', userId),
          limit(1)
        );
        
        const likeSnapshot = await getDocs(likeQuery);
        likeStatuses[commentId] = !likeSnapshot.empty;
      });

      await Promise.all(promises);

      return { success: true, likeStatuses };
    } catch (error) {
      console.error('댓글 좋아요 상태 조회 오류:', error);
      return { success: false, likeStatuses: {} };
    }
  }

  /**
   * 특정 사용자의 최근 댓글 조회
   */
  static async getUserRecentComments(userId: string, limitCount = 10) {
    try {
      const q = query(
        collection(db, this.COMMENTS_COLLECTION),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const comments: ReadingComment[] = [];

      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        comments.push({
          id: docSnapshot.id,
          postId: data.postId,
          authorId: data.authorId,
          content: data.content,
          parentId: data.parentId,
          likes: data.likes || 0,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });

      return { success: true, comments };
    } catch (error) {
      console.error('사용자 댓글 조회 오류:', error);
      return { success: false, error: '댓글을 불러오는데 실패했습니다.', comments: [] };
    }
  }

  /**
   * 댓글 통계 조회 (관리자용)
   */
  static async getCommentStats(experienceId?: string) {
    try {
      let q = query(collection(db, this.COMMENTS_COLLECTION));
      
      if (experienceId) {
        q = query(q, where('postId', '==', experienceId));
      }

      const querySnapshot = await getDocs(q);
      const totalComments = querySnapshot.size;
      
      // 날짜별 댓글 수 계산
      const dailyStats: { [date: string]: number } = {};
      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        const date = data.createdAt.toDate().toISOString().split('T')[0];
        dailyStats[date] = (dailyStats[date] || 0) + 1;
      });

      return { 
        success: true, 
        stats: {
          totalComments,
          dailyStats
        }
      };
    } catch (error) {
      console.error('댓글 통계 조회 오류:', error);
      return { 
        success: false, 
        stats: {
          totalComments: 0,
          dailyStats: {}
        }
      };
    }
  }

  /**
   * 인기 댓글 조회 (좋아요 수 기준)
   */
  static async getPopularComments(experienceId: string, limitCount = 3) {
    try {
      const q = query(
        collection(db, this.COMMENTS_COLLECTION),
        where('postId', '==', experienceId),
        orderBy('likes', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const comments: ReadingComment[] = [];
      const authors: { [key: string]: UserProfile } = {};

      // 작성자 정보를 미리 조회
      const authorIds = new Set<string>();
      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data.likes > 0) { // 좋아요가 있는 댓글만
          authorIds.add(data.authorId);
        }
      });

      // 작성자 정보 배치 조회
      const authorPromises = Array.from(authorIds).map(async (authorId) => {
        const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, authorId));
        if (userDoc.exists()) {
          authors[authorId] = userDoc.data() as UserProfile;
        }
      });
      await Promise.all(authorPromises);

      // 댓글 데이터 구성 (좋아요가 있는 댓글만)
      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data.likes > 0) {
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
        }
      });

      return { success: true, comments };
    } catch (error) {
      console.error('인기 댓글 조회 오류:', error);
      return { success: false, comments: [] };
    }
  }
}