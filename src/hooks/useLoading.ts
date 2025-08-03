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

// Multiple loading states hook
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    minLoadingTime: number = 300
  ): Promise<T> => {
    startLoading(key);
    const startTime = Date.now();
    
    try {
      const result = await asyncFn();
      
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    withLoading
  };
}

// Page transition loading hook
export function usePageLoading() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startPageLoading = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsPageLoading(true);
    
    // Auto-stop after 10 seconds as fallback
    timeoutRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, 10000);
  }, []);

  const stopPageLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPageLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isPageLoading,
    startPageLoading,
    stopPageLoading
  };
}