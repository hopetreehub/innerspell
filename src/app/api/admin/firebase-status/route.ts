import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseStatus, checkFirebaseConnection } from '@/lib/firebase/admin';
import { createDataSource, getCurrentDataSourceType } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Firebase Admin SDK 상태
    const firebaseStatus = getFirebaseStatus();
    
    // Firebase 연결 테스트
    const connectionTest = await checkFirebaseConnection();
    
    // 데이터 소스 정보
    const dataSourceType = getCurrentDataSourceType();
    const dataSource = createDataSource();
    
    // 환경 변수 확인 (민감한 정보는 마스킹)
    const envCheck = {
      hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      hasBase64Key: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      isVercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      forceDataSource: process.env.FORCE_DATA_SOURCE
    };
    
    // 테스트 쿼리 실행
    let testResults = {
      canReadStats: false,
      canWriteTest: false,
      error: null as string | null
    };
    
    if (dataSourceType === 'firebase' && connectionTest.connected) {
      try {
        // 읽기 테스트
        const stats = await dataSource.getAdminStats();
        testResults.canReadStats = true;
        
        // 쓰기 테스트 (테스트 컬렉션에만)
        // 실제로는 쓰기 테스트는 생략하거나 별도 컬렉션 사용
      } catch (error) {
        testResults.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    return NextResponse.json({
      success: true,
      status: {
        firebase: firebaseStatus,
        connection: connectionTest,
        dataSource: {
          type: dataSourceType,
          isConnected: dataSource.isConnected()
        },
        environment: envCheck,
        tests: testResults
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Firebase status check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}