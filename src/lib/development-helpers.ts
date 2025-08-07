/**
 * Development mode helpers
 */

export function shouldUseDevelopmentFallback(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const fileStorageEnabled = process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE === 'true';
  const useMockAuth = process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false';
  
  return isDevelopment && fileStorageEnabled && useMockAuth;
}

export function developmentLog(category: string, message: string): void {
  if (shouldUseDevelopmentFallback()) {
    console.log(`🔧 [DEV-FALLBACK] ${category}: ${message}`);
  }
}