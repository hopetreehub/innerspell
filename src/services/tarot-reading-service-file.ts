import { SavedReading } from '@/types';
import * as fileStorage from './file-storage-service';
import * as path from 'path';

const READINGS_DIR = 'tarot-readings';
const ALL_READINGS_FILE = 'all-readings.json';

interface ReadingFileData {
  id: string;
  userId: string;
  question: string;
  spreadName: string;
  spreadNumCards: number;
  drawnCards: Array<{
    id: string;
    name?: string;
    imageSrc?: string;
    isReversed: boolean;
    position?: string;
  }>;
  interpretationText: string;
  interpretationStyle?: string;
  createdAt: string;
  tags?: string[];
  note?: string;
}

interface AllReadingsIndex {
  readings: Array<{
    id: string;
    userId: string;
    createdAt: string;
    spreadName: string;
    question: string;
  }>;
  totalCount: number;
  lastUpdated: string;
}

interface UserReadingsIndex {
  userId: string;
  readings: ReadingFileData[];
  totalCount: number;
  lastUpdated: string;
}

/**
 * 사용자별 리딩 디렉토리 경로 생성
 */
function getUserReadingsPath(userId: string): string {
  return path.join(READINGS_DIR, `user-${userId}`);
}

/**
 * 리딩 파일 경로 생성
 */
function getReadingFilePath(userId: string, readingId: string): string {
  return path.join(getUserReadingsPath(userId), `${readingId}.json`);
}

/**
 * 사용자별 인덱스 파일 경로
 */
function getUserIndexPath(userId: string): string {
  return path.join(getUserReadingsPath(userId), 'index.json');
}

/**
 * 전체 리딩 인덱스 초기화
 */
async function initializeAllReadingsIndex(): Promise<void> {
  const indexPath = path.join(READINGS_DIR, ALL_READINGS_FILE);
  const exists = await fileStorage.fileExists(indexPath);
  
  if (!exists) {
    const initialIndex: AllReadingsIndex = {
      readings: [],
      totalCount: 0,
      lastUpdated: new Date().toISOString()
    };
    
    await fileStorage.writeJSON(indexPath, initialIndex);
    console.log('📚 Initialized all readings index');
  }
}

/**
 * 사용자별 인덱스 초기화
 */
async function initializeUserIndex(userId: string): Promise<void> {
  const indexPath = getUserIndexPath(userId);
  const exists = await fileStorage.fileExists(indexPath);
  
  if (!exists) {
    const initialIndex: UserReadingsIndex = {
      userId,
      readings: [],
      totalCount: 0,
      lastUpdated: new Date().toISOString()
    };
    
    await fileStorage.writeJSON(indexPath, initialIndex);
    console.log(`📚 Initialized user index for ${userId}`);
  }
}

/**
 * 새로운 리딩 저장
 */
export async function saveReadingToFile(
  userId: string,
  readingData: Omit<SavedReading, 'id' | 'createdAt'>
): Promise<{ success: boolean; readingId?: string; error?: string }> {
  if (!fileStorage.isFileStorageEnabled) {
    return { success: false, error: 'File storage is not enabled' };
  }

  try {
    // 인덱스 초기화
    await initializeAllReadingsIndex();
    await initializeUserIndex(userId);
    
    // 리딩 ID 생성
    const readingId = `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    // 리딩 데이터 준비
    const reading: ReadingFileData = {
      id: readingId,
      userId,
      question: readingData.question,
      spreadName: readingData.spreadName,
      spreadNumCards: readingData.spreadNumCards,
      drawnCards: readingData.drawnCards,
      interpretationText: readingData.interpretationText,
      interpretationStyle: readingData.interpretationStyle,
      createdAt,
      tags: readingData.tags,
      note: readingData.note
    };
    
    // 리딩 파일 저장
    const readingPath = getReadingFilePath(userId, readingId);
    await fileStorage.writeJSON(readingPath, reading);
    
    // 사용자 인덱스 업데이트
    const userIndexPath = getUserIndexPath(userId);
    const userIndex = await fileStorage.readJSON<UserReadingsIndex>(userIndexPath);
    
    if (userIndex) {
      userIndex.readings.unshift(reading);
      userIndex.totalCount = userIndex.readings.length;
      userIndex.lastUpdated = createdAt;
      await fileStorage.writeJSON(userIndexPath, userIndex);
    }
    
    // 전체 인덱스 업데이트
    const allIndexPath = path.join(READINGS_DIR, ALL_READINGS_FILE);
    const allIndex = await fileStorage.readJSON<AllReadingsIndex>(allIndexPath);
    
    if (allIndex) {
      allIndex.readings.unshift({
        id: readingId,
        userId,
        createdAt,
        spreadName: readingData.spreadName,
        question: readingData.question.substring(0, 100) // 요약
      });
      allIndex.totalCount = allIndex.readings.length;
      allIndex.lastUpdated = createdAt;
      await fileStorage.writeJSON(allIndexPath, allIndex);
    }
    
    console.log(`✅ Saved reading ${readingId} for user ${userId}`);
    return { success: true, readingId };
    
  } catch (error) {
    console.error('❌ Error saving reading:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 사용자의 모든 리딩 가져오기
 */
export async function getUserReadingsFromFile(
  userId: string,
  limit?: number
): Promise<SavedReading[]> {
  if (!fileStorage.isFileStorageEnabled) {
    return [];
  }

  try {
    // 먼저 전체 인덱스에서 사용자의 리딩을 찾습니다
    const allIndexPath = path.join(READINGS_DIR, ALL_READINGS_FILE);
    const allIndex = await fileStorage.readJSON<AllReadingsIndex>(allIndexPath);
    
    if (allIndex && allIndex.readings) {
      // 사용자의 리딩만 필터링
      const userReadings = allIndex.readings.filter(r => r.userId === userId);
      
      // 각 리딩의 상세 정보를 읽습니다
      const detailedReadings: SavedReading[] = [];
      
      for (const summary of userReadings) {
        // 먼저 개별 파일을 시도
        const readingPath = getReadingFilePath(userId, summary.id);
        const reading = await fileStorage.readJSON<ReadingFileData>(readingPath);
        
        if (reading) {
          detailedReadings.push({
            id: reading.id,
            userId: reading.userId,
            question: reading.question,
            spreadName: reading.spreadName,
            spreadNumCards: reading.spreadNumCards,
            drawnCards: reading.drawnCards.map(card => ({
              id: card.id,
              name: card.name || card.id,
              imageSrc: card.imageSrc || `/images/tarot/${card.id}.png`,
              isReversed: card.isReversed,
              position: card.position
            })),
            interpretationText: reading.interpretationText,
            createdAt: new Date(reading.createdAt),
            tags: reading.tags,
            note: reading.note
          });
        } else {
          // 개별 파일이 없으면 요약 정보만이라도 반환
          detailedReadings.push({
            id: summary.id,
            userId: summary.userId,
            question: summary.question,
            spreadName: summary.spreadName,
            spreadNumCards: 0, // 기본값
            drawnCards: [], // 빈 배열
            interpretationText: '', // 빈 문자열
            createdAt: new Date(summary.createdAt),
            tags: [],
            note: ''
          });
        }
      }
      
      // 최신 순으로 정렬
      detailedReadings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return limit ? detailedReadings.slice(0, limit) : detailedReadings;
    }
    
    // fallback: 사용자별 인덱스 파일 확인
    const userIndexPath = getUserIndexPath(userId);
    const userIndex = await fileStorage.readJSON<UserReadingsIndex>(userIndexPath);
    
    if (!userIndex || !userIndex.readings) {
      return [];
    }
    
    // ReadingFileData를 SavedReading으로 변환
    const readings = userIndex.readings.map(reading => ({
      id: reading.id,
      userId: reading.userId,
      question: reading.question,
      spreadName: reading.spreadName,
      spreadNumCards: reading.spreadNumCards,
      drawnCards: reading.drawnCards.map(card => ({
        id: card.id,
        name: card.name || card.id,
        imageSrc: card.imageSrc || `/images/tarot/${card.id}.png`,
        isReversed: card.isReversed,
        position: card.position
      })),
      interpretationText: reading.interpretationText,
      createdAt: new Date(reading.createdAt),
      tags: reading.tags,
      note: reading.note
    }));
    
    return limit ? readings.slice(0, limit) : readings;
    
  } catch (error) {
    console.error(`❌ Error getting readings for user ${userId}:`, error);
    return [];
  }
}

/**
 * 특정 리딩 가져오기
 */
export async function getReadingByIdFromFile(
  userId: string,
  readingId: string
): Promise<SavedReading | null> {
  if (!fileStorage.isFileStorageEnabled) {
    return null;
  }

  try {
    const readingPath = getReadingFilePath(userId, readingId);
    const reading = await fileStorage.readJSON<ReadingFileData>(readingPath);
    
    if (!reading) {
      return null;
    }
    
    return {
      id: reading.id,
      userId: reading.userId,
      question: reading.question,
      spreadName: reading.spreadName,
      spreadNumCards: reading.spreadNumCards,
      drawnCards: reading.drawnCards.map(card => ({
        id: card.id,
        name: card.name || card.id,
        imageSrc: card.imageSrc || `/images/tarot/${card.id}.png`,
        isReversed: card.isReversed,
        position: card.position
      })),
      interpretationText: reading.interpretationText,
      createdAt: new Date(reading.createdAt),
      tags: reading.tags,
      note: reading.note
    };
    
  } catch (error) {
    console.error(`❌ Error getting reading ${readingId}:`, error);
    return null;
  }
}

/**
 * 리딩 삭제
 */
export async function deleteReadingFromFile(
  userId: string,
  readingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!fileStorage.isFileStorageEnabled) {
    return { success: false, error: 'File storage is not enabled' };
  }

  try {
    // 리딩 파일 삭제
    const readingPath = getReadingFilePath(userId, readingId);
    await fileStorage.deleteFile(readingPath);
    
    // 사용자 인덱스 업데이트
    const userIndexPath = getUserIndexPath(userId);
    const userIndex = await fileStorage.readJSON<UserReadingsIndex>(userIndexPath);
    
    if (userIndex) {
      userIndex.readings = userIndex.readings.filter(r => r.id !== readingId);
      userIndex.totalCount = userIndex.readings.length;
      userIndex.lastUpdated = new Date().toISOString();
      await fileStorage.writeJSON(userIndexPath, userIndex);
    }
    
    // 전체 인덱스 업데이트
    const allIndexPath = path.join(READINGS_DIR, ALL_READINGS_FILE);
    const allIndex = await fileStorage.readJSON<AllReadingsIndex>(allIndexPath);
    
    if (allIndex) {
      allIndex.readings = allIndex.readings.filter(r => r.id !== readingId);
      allIndex.totalCount = allIndex.readings.length;
      allIndex.lastUpdated = new Date().toISOString();
      await fileStorage.writeJSON(allIndexPath, allIndex);
    }
    
    console.log(`✅ Deleted reading ${readingId}`);
    return { success: true };
    
  } catch (error) {
    console.error(`❌ Error deleting reading ${readingId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 전체 리딩 통계 가져오기
 */
export async function getReadingStatistics(): Promise<{
  totalReadings: number;
  totalUsers: number;
  popularSpreads: Array<{ spreadName: string; count: number }>;
  recentReadings: Array<{ id: string; userId: string; createdAt: string; spreadName: string }>;
}> {
  if (!fileStorage.isFileStorageEnabled) {
    return {
      totalReadings: 0,
      totalUsers: 0,
      popularSpreads: [],
      recentReadings: []
    };
  }

  try {
    const allIndexPath = path.join(READINGS_DIR, ALL_READINGS_FILE);
    const allIndex = await fileStorage.readJSON<AllReadingsIndex>(allIndexPath);
    
    if (!allIndex) {
      return {
        totalReadings: 0,
        totalUsers: 0,
        popularSpreads: [],
        recentReadings: []
      };
    }
    
    // 사용자 수 계산
    const uniqueUsers = new Set(allIndex.readings.map(r => r.userId));
    
    // 인기 스프레드 계산
    const spreadCounts = allIndex.readings.reduce((acc, reading) => {
      acc[reading.spreadName] = (acc[reading.spreadName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularSpreads = Object.entries(spreadCounts)
      .map(([spreadName, count]) => ({ spreadName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // 최근 리딩
    const recentReadings = allIndex.readings.slice(0, 10);
    
    return {
      totalReadings: allIndex.totalCount,
      totalUsers: uniqueUsers.size,
      popularSpreads,
      recentReadings
    };
    
  } catch (error) {
    console.error('❌ Error getting reading statistics:', error);
    return {
      totalReadings: 0,
      totalUsers: 0,
      popularSpreads: [],
      recentReadings: []
    };
  }
}