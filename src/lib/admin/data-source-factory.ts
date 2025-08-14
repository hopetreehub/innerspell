import { DataSource, DataSourceOptions } from './types/data-source';
import { MockDataSource } from './data-sources/mock-data-source';
import { FirebaseDataSource } from './data-sources/firebase-data-source';

// 싱글톤 인스턴스 저장
let dataSourceInstance: DataSource | null = null;

// Firebase 설정 확인
function hasValidFirebaseConfig(): boolean {
  // 서버 사이드에서만 확인
  if (typeof window !== 'undefined') {
    return false;
  }

  // 일반 서비스 계정 키
  const hasServiceAccount = !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_KEY.includes('여기에') &&
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().length > 0
  );

  // Base64 인코딩된 서비스 계정 키
  const hasBase64ServiceAccount = !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 &&
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.trim().length > 0
  );

  const hasGoogleCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasAdminConfig = !!process.env.FIREBASE_ADMIN_SDK_CONFIG;
  
  // Application Default Credentials 확인
  const hasADC = !!(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT
  );
  
  // Firebase Admin SDK가 이미 초기화되었는지 확인
  let isFirebaseInitialized = false;
  try {
    const { getFirebaseStatus } = require('@/lib/firebase/admin');
    const status = getFirebaseStatus();
    isFirebaseInitialized = status.initialized && status.mode !== 'mock';
  } catch (error) {
    // Firebase admin 모듈 로드 실패는 무시
  }

  const hasConfig = hasServiceAccount || hasBase64ServiceAccount || hasGoogleCreds || hasAdminConfig || hasADC || isFirebaseInitialized;
  
  console.log('[DataSourceFactory] Firebase config check:', {
    hasServiceAccount,
    hasBase64ServiceAccount,
    hasGoogleCreds,
    hasAdminConfig,
    hasADC,
    isFirebaseInitialized,
    result: hasConfig
  });

  return hasConfig;
}

// 환경 확인
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL_ENV === 'production';
}

// 개발 모드 강제 활성화 확인
function isDevModeForced(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true';
}

// 데이터 소스 생성 또는 기존 인스턴스 반환
export function createDataSource(options?: Partial<DataSourceOptions>): DataSource {
  // 이미 생성된 인스턴스가 있으면 반환
  if (dataSourceInstance && dataSourceInstance.isConnected()) {
    return dataSourceInstance;
  }

  const environment = isProduction() ? 'production' : 'development';
  
  const defaultOptions: DataSourceOptions = {
    environment,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5분
    ...options
  };

  // 데이터 소스 결정 로직
  let useFirebase = false;

  // Vercel 환경이면서 Firebase 설정이 있으면 무조건 Firebase 사용
  if (process.env.VERCEL && hasValidFirebaseConfig()) {
    console.log('[DataSourceFactory] Vercel environment detected with Firebase config - forcing Firebase');
    useFirebase = true;
  } else if (isProduction() && !isDevModeForced() && hasValidFirebaseConfig()) {
    useFirebase = true;
  }

  // 강제로 특정 데이터 소스 사용 (테스트용)
  if (process.env.FORCE_DATA_SOURCE === 'firebase') {
    useFirebase = true;
  } else if (process.env.FORCE_DATA_SOURCE === 'mock') {
    useFirebase = false;
  }

  console.log('[DataSourceFactory] Creating data source:', {
    environment,
    useFirebase,
    hasFirebaseConfig: hasValidFirebaseConfig(),
    isDevModeForced: isDevModeForced()
  });

  if (useFirebase) {
    try {
      dataSourceInstance = new FirebaseDataSource(defaultOptions);
      console.log('[DataSourceFactory] Firebase data source created');
    } catch (error) {
      console.error('[DataSourceFactory] Failed to create Firebase data source:', error);
      console.log('[DataSourceFactory] Falling back to mock data source');
      dataSourceInstance = new MockDataSource(defaultOptions);
    }
  } else {
    dataSourceInstance = new MockDataSource(defaultOptions);
    console.log('[DataSourceFactory] Mock data source created');
  }

  return dataSourceInstance;
}

// 현재 데이터 소스 타입 확인
export function getCurrentDataSourceType(): 'firebase' | 'mock' {
  if (!dataSourceInstance) {
    return 'mock';
  }

  return dataSourceInstance instanceof FirebaseDataSource ? 'firebase' : 'mock';
}

// 데이터 소스 리셋 (테스트용)
export function resetDataSource(): void {
  dataSourceInstance = null;
}

// 폴백 처리를 포함한 안전한 데이터 소스 가져오기
export async function getDataSourceWithFallback(): Promise<DataSource> {
  const dataSource = createDataSource();

  // Firebase 데이터 소스인 경우 연결 확인
  if (dataSource instanceof FirebaseDataSource && !dataSource.isConnected()) {
    console.warn('[DataSourceFactory] Firebase not connected, using mock fallback');
    dataSourceInstance = new MockDataSource({
      environment: isProduction() ? 'production' : 'development',
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000
    });
    return dataSourceInstance;
  }

  return dataSource;
}