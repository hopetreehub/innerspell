import { promises as fs } from 'fs';
import path from 'path';

// 환경 변수 로드 (서버 사이드에서만)
if (typeof window === 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv 없으면 무시
  }
}

/**
 * 파일 시스템 기반 JSON 저장소 서비스
 * 개발 환경에서 데이터 영속성을 제공합니다.
 */

// 데이터 디렉토리 경로
const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// 파일 저장소 활성화 조건
export const isFileStorageEnabled = process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true' ||
   process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
   process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false');

// 파일 잠금을 위한 Map
const fileLocks = new Map<string, Promise<void>>();

/**
 * 디렉토리가 존재하는지 확인하고 없으면 생성
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 파일 잠금 처리를 위한 유틸리티
 */
async function withFileLock<T>(
  filePath: string,
  operation: () => Promise<T>
): Promise<T> {
  const existingLock = fileLocks.get(filePath);
  
  const currentOperation = (async () => {
    if (existingLock) {
      await existingLock;
    }
    return operation();
  })();
  
  fileLocks.set(filePath, currentOperation.then(() => {}));
  
  try {
    return await currentOperation;
  } finally {
    // 작업 완료 후 잠금 해제
    setTimeout(() => {
      if (fileLocks.get(filePath) === currentOperation.then(() => {})) {
        fileLocks.delete(filePath);
      }
    }, 100);
  }
}

/**
 * JSON 파일 읽기
 */
export async function readJSON<T>(fileName: string): Promise<T | null> {
  const filePath = path.join(DATA_DIR, fileName);
  
  try {
    await ensureDirectory(DATA_DIR);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`📄 File not found: ${fileName}, returning null`);
      return null;
    }
    console.error(`❌ Error reading ${fileName}:`, error);
    throw error;
  }
}

/**
 * JSON 파일 쓰기 (자동 백업 포함)
 */
export async function writeJSON<T>(
  fileName: string,
  data: T,
  createBackup: boolean = true
): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  
  await withFileLock(filePath, async () => {
    try {
      await ensureDirectory(DATA_DIR);
      
      // 백업 생성
      if (createBackup) {
        await createBackupFile(fileName);
      }
      
      // 임시 파일에 먼저 쓰기 (원자성 보장)
      const tempPath = `${filePath}.tmp`;
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(tempPath, jsonData, 'utf-8');
      
      // 원자적으로 파일 교체
      await fs.rename(tempPath, filePath);
      
      console.log(`✅ Successfully wrote ${fileName}`);
    } catch (error) {
      console.error(`❌ Error writing ${fileName}:`, error);
      throw error;
    }
  });
}

/**
 * 백업 파일 생성
 */
async function createBackupFile(fileName: string): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  
  try {
    // 원본 파일이 존재하는지 확인
    await fs.access(filePath);
    
    await ensureDirectory(BACKUP_DIR);
    
    // 타임스탬프를 포함한 백업 파일명 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${path.basename(fileName, '.json')}_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // 파일 복사
    await fs.copyFile(filePath, backupPath);
    
    // 오래된 백업 파일 정리 (최근 10개만 유지)
    await cleanupOldBackups(fileName);
    
    console.log(`📦 Backup created: ${backupFileName}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('❌ Backup creation failed:', error);
    }
  }
}

/**
 * 오래된 백업 파일 정리
 */
async function cleanupOldBackups(fileName: string): Promise<void> {
  const baseName = path.basename(fileName, '.json');
  
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith(baseName + '_') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    // 최근 10개를 제외한 나머지 삭제
    const filesToDelete = backupFiles.slice(10);
    
    for (const file of filesToDelete) {
      await fs.unlink(path.join(BACKUP_DIR, file));
      console.log(`🗑️ Deleted old backup: ${file}`);
    }
  } catch (error) {
    console.error('❌ Backup cleanup failed:', error);
  }
}

/**
 * 파일 존재 여부 확인
 */
export async function fileExists(fileName: string): Promise<boolean> {
  const filePath = path.join(DATA_DIR, fileName);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(fileName: string): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  
  try {
    // 삭제 전 백업 생성
    await createBackupFile(fileName);
    await fs.unlink(filePath);
    console.log(`🗑️ Deleted file: ${fileName}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`❌ Error deleting ${fileName}:`, error);
      throw error;
    }
  }
}

/**
 * 백업 파일 목록 가져오기
 */
export async function getBackupList(fileName: string): Promise<string[]> {
  const baseName = path.basename(fileName, '.json');
  
  try {
    await ensureDirectory(BACKUP_DIR);
    const files = await fs.readdir(BACKUP_DIR);
    
    return files
      .filter(f => f.startsWith(baseName + '_') && f.endsWith('.json'))
      .sort()
      .reverse();
  } catch (error) {
    console.error('❌ Error listing backups:', error);
    return [];
  }
}

/**
 * 백업 파일 복원
 */
export async function restoreFromBackup(
  fileName: string,
  backupFileName: string
): Promise<void> {
  const filePath = path.join(DATA_DIR, fileName);
  const backupPath = path.join(BACKUP_DIR, backupFileName);
  
  try {
    // 현재 파일 백업
    await createBackupFile(fileName);
    
    // 백업 파일 복원
    await fs.copyFile(backupPath, filePath);
    
    console.log(`✅ Restored from backup: ${backupFileName}`);
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

/**
 * 초기화 함수 - 서버 시작 시 실행
 */
export async function initializeFileStorage(): Promise<void> {
  try {
    await ensureDirectory(DATA_DIR);
    await ensureDirectory(BACKUP_DIR);
    console.log('✅ File storage service initialized');
  } catch (error) {
    console.error('❌ File storage initialization failed:', error);
    throw error;
  }
}


console.log('📁 File storage service loaded. Enabled:', isFileStorageEnabled);