'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Loading state management hook
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);
  const loadingRef = useRef(loading);
  
  // Keep ref in sync with state for cleanup
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const toggleLoading = useCallback(() => {
    setLoading(prev => !prev);
  }, []);

  // Async wrapper that automatically manages loading state
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    minLoadingTime: number = 300 // Minimum loading time for better UX
  ): Promise<T> => {
    startLoading();
    const startTime = Date.now();
    
    try {
      const result = await asyncFn();
      
      // Ensure minimum loading time for smooth UX
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      return result;
    } finally {
      // Only stop loading if we're still loading (prevent race conditions)
      if (loadingRef.current) {
        stopLoading();
      }
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading
  };
}