export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 서버 사이드에서만 실행
    console.log('🚀 Initializing server instrumentation...');
    
    // 파일 스토리지 초기화
    const { initializeFileStorage } = await import('./services/file-storage-service');
    await initializeFileStorage();
    
    console.log('✅ Server instrumentation completed');
  }
}