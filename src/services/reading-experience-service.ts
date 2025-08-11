'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ReadingExperience, UserProfile } from '@/types';

export class ReadingExperienceService {
  private static readonly COLLECTION_NAME = 'reading-experiences';
  private static readonly USERS_COLLECTION = 'users';
  private static readonly PAGE_SIZE = 20;

  /**
   * 개발 환경 여부 확인
   */
  private static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * 리딩 경험 목록을 가져옵니다 (클라이언트 사이드)
   */
  static async getExperiences(
    sortBy: 'latest' | 'popular' | 'likes' | 'comments' = 'latest',
    filterTag?: string,
    lastDoc?: DocumentSnapshot
  ) {
    try {
      // 개발 환경에서는 API 사용
      if (this.isDevelopment()) {
        const params = new URLSearchParams({
          sortBy,
          ...(filterTag && { tag: filterTag }),
          pageSize: this.PAGE_SIZE.toString()
        });

        const response = await fetch(`/api/reading-experiences?${params}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '데이터를 불러오는데 실패했습니다.');
        }

        // 날짜 문자열을 Date 객체로 변환
        const experiences = data.experiences.map((exp: any) => ({
          ...exp,
          createdAt: new Date(exp.createdAt),
          updatedAt: new Date(exp.updatedAt)
        }));

        return {
          success: true,
          experiences,
          lastDoc: null, // 파일 시스템에서는 사용하지 않음
          hasMore: data.hasMore
        };
      }

      // 프로덕션에서는 Firebase 사용
      // 인덱스 문제 해결을 위해 단순화된 쿼리 사용
      let q = query(collection(db, this.COLLECTION_NAME));

      // 페이지네이션
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(this.PAGE_SIZE * 2)); // 필터링을 고려하여 더 많이 가져옴

      const querySnapshot = await getDocs(q);
      const experiences: ReadingExperience[] = [];
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

      // 클라이언트 사이드에서 필터링
      let filteredExperiences = experiences.filter(exp => exp.isPublished);
      
      // 태그 필터링
      if (filterTag) {
        filteredExperiences = filteredExperiences.filter(exp => 
          exp.tags.includes(filterTag)
        );
      }

      // 정렬
      switch (sortBy) {
        case 'popular':
          filteredExperiences.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case 'likes':
          filteredExperiences.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'comments':
          filteredExperiences.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
          break;
        default: // latest
          filteredExperiences.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // 페이지 크기만큼 자르기
      const paginatedExperiences = filteredExperiences.slice(0, this.PAGE_SIZE);

      return {
        success: true,
        experiences: paginatedExperiences,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: filteredExperiences.length > this.PAGE_SIZE
      };
    } catch (error) {
      console.error('리딩 경험 목록 조회 오류:', error);
      return { 
        success: false, 
        error: '데이터를 불러오는데 실패했습니다.',
        experiences: [],
        lastDoc: null,
        hasMore: false
      };
    }
  }

  /**
   * 특정 리딩 경험을 가져옵니다
   */
  static async getExperience(experienceId: string) {
    try {
      // 개발 환경에서는 API 사용
      if (this.isDevelopment()) {
        const response = await fetch(`/api/reading-experiences/${experienceId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '게시글을 불러오는데 실패했습니다.');
        }

        // 날짜 문자열을 Date 객체로 변환
        const experience = {
          ...data.experience,
          createdAt: new Date(data.experience.createdAt),
          updatedAt: new Date(data.experience.updatedAt)
        };

        return { success: true, experience };
      }

      // 프로덕션에서는 Firebase 사용
      const docRef = doc(db, this.COLLECTION_NAME, experienceId);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return { success: false, error: '게시글을 찾을 수 없습니다.' };
      }

      const data = docSnapshot.data();
      
      // 작성자 정보 조회
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, data.authorId));
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

      const experience: ReadingExperience = {
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
        updatedAt: data.updatedAt.toDate()
      };

      return { success: true, experience };
    } catch (error) {
      console.error('리딩 경험 조회 오류:', error);
      return { success: false, error: '게시글을 불러오는데 실패했습니다.' };
    }
  }

  /**
   * 사용자별 좋아요/북마크 상태 확인
   */
  static async getUserInteractionStatus(experienceId: string, userId: string) {
    try {
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
      
      return {
        success: true,
        isLiked: !likeQuery.empty,
        isBookmarked: !bookmarkQuery.empty
      };
    } catch (error) {
      console.error('사용자 상호작용 상태 조회 오류:', error);
      return {
        success: false,
        isLiked: false,
        isBookmarked: false
      };
    }
  }

  /**
   * 태그별 게시글 수 조회 (인기 태그용)
   */
  static async getTagStats() {
    try {
      // 인덱스 문제 해결을 위해 단순화된 쿼리 사용
      const q = query(
        collection(db, this.COLLECTION_NAME),
        limit(200) // 최근 200개 게시글만 확인
      );

      const querySnapshot = await getDocs(q);
      const tagCounts: { [tag: string]: number } = {};

      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        // 공개된 게시글만 계산
        if (data.isPublished) {
          const tags = data.tags || [];
          tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // 인기 순으로 정렬
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      return { success: true, tagStats: sortedTags };
    } catch (error) {
      console.error('태그 통계 조회 오류:', error);
      return { success: false, tagStats: [] };
    }
  }

  /**
   * 관련 게시글 조회 (같은 태그 또는 같은 스프레드 타입)
   */
  static async getRelatedExperiences(
    currentExperienceId: string, 
    tags: string[], 
    spreadType: string,
    limitCount = 5
  ) {
    try {
      const relatedExperiences: ReadingExperience[] = [];

      // 1. 같은 태그를 가진 게시글 - 인덱스 문제 해결을 위해 단순화
      if (tags.length > 0) {
        const tagQuery = query(
          collection(db, this.COLLECTION_NAME),
          limit(50) // 더 많이 가져와서 클라이언트에서 필터링
        );

        const tagSnapshot = await getDocs(tagQuery);
        for (const docSnapshot of tagSnapshot.docs) {
          if (docSnapshot.id !== currentExperienceId) {
            const data = docSnapshot.data();
            // 공개된 게시글이고 같은 태그를 가진 경우만 추가
            if (data.isPublished && data.tags && data.tags.some((tag: string) => tags.includes(tag))) {
              relatedExperiences.push({
                id: docSnapshot.id,
                title: data.title,
                content: data.content,
                authorId: data.authorId,
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
            }
          }
        }
      }

      // 2. 같은 스프레드 타입 게시글 (태그로 찾지 못한 경우) - 인덱스 문제 해결을 위해 단순화
      if (relatedExperiences.length < limitCount) {
        const spreadQuery = query(
          collection(db, this.COLLECTION_NAME),
          limit(30)
        );

        const spreadSnapshot = await getDocs(spreadQuery);
        for (const docSnapshot of spreadSnapshot.docs) {
          if (docSnapshot.id !== currentExperienceId && 
              !relatedExperiences.find(exp => exp.id === docSnapshot.id)) {
            const data = docSnapshot.data();
            // 공개된 게시글이고 같은 스프레드 타입인 경우만 추가
            if (data.isPublished && data.spreadType === spreadType) {
              relatedExperiences.push({
                id: docSnapshot.id,
                title: data.title,
                content: data.content,
                authorId: data.authorId,
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
            }
          }
        }
      }

      return { 
        success: true, 
        experiences: relatedExperiences.slice(0, limitCount) 
      };
    } catch (error) {
      console.error('관련 게시글 조회 오류:', error);
      return { success: false, experiences: [] };
    }
  }

  /**
   * 검색 기능
   */
  static async searchExperiences(searchTerm: string, limitCount = 20) {
    try {
      // Firestore는 full-text search를 지원하지 않으므로
      // 제목에서 키워드를 포함하는 게시글을 찾는 방식을 사용
      // 실제 프로덕션에서는 Algolia 같은 검색 서비스를 사용하는 것이 좋습니다
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        limit(100) // 최근 100개에서 검색
      );

      const querySnapshot = await getDocs(q);
      const allExperiences: ReadingExperience[] = [];

      querySnapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        // 공개된 게시글만 추가
        if (data.isPublished) {
          allExperiences.push({
            id: docSnapshot.id,
            title: data.title,
            content: data.content,
            authorId: data.authorId,
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
        }
      });

      // 클라이언트 사이드에서 검색 필터링
      const filteredExperiences = allExperiences.filter(exp => 
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, limitCount);

      return { 
        success: true, 
        experiences: filteredExperiences 
      };
    } catch (error) {
      console.error('검색 오류:', error);
      return { success: false, experiences: [] };
    }
  }
}