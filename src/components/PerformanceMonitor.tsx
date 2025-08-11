'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance/metrics';

export default function PerformanceMonitor() {
  useEffect(() => {
    // 프로덕션 환경에서만 성능 모니터링 활성화
    if (process.env.NODE_ENV === 'production') {
      initPerformanceMonitoring();
    }
  }, []);

  return null; // 렌더링하지 않는 컴포넌트
}