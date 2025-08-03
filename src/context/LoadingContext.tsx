'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { LoadingOverlay } from '@/components/ui/loading';

interface LoadingContextType {
  // Global page loading
  isPageLoading: boolean;
  startPageLoading: (message?: string) => void;
  stopPageLoading: () => void;
  
  // Component loading states
  componentLoading: Record<string, boolean>;
  setComponentLoading: (component: string, loading: boolean) => void;
  isComponentLoading: (component: string) => boolean;
  
  // Async operations with loading
  withPageLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
  withComponentLoading: <T>(component: string, asyncFn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('로딩 중...');
  const [componentLoading, setComponentLoadingState] = useState<Record<string, boolean>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startPageLoading = useCallback((message: string = '로딩 중...') => {
    setLoadingMessage(message);
    setIsPageLoading(true);
    
    // Auto-stop after 30 seconds as fallback
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, 30000);
  }, []);

  const stopPageLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPageLoading(false);
  }, []);

  const setComponentLoading = useCallback((component: string, loading: boolean) => {
    setComponentLoadingState(prev => ({
      ...prev,
      [component]: loading
    }));
  }, []);

  const isComponentLoading = useCallback((component: string) => {
    return Boolean(componentLoading[component]);
  }, [componentLoading]);

  const withPageLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    message: string = '로딩 중...'
  ): Promise<T> => {
    startPageLoading(message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopPageLoading();
    }
  }, [startPageLoading, stopPageLoading]);

  const withComponentLoading = useCallback(async <T>(
    component: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setComponentLoading(component, true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setComponentLoading(component, false);
    }
  }, [setComponentLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value: LoadingContextType = {
    isPageLoading,
    startPageLoading,
    stopPageLoading,
    componentLoading,
    setComponentLoading,
    isComponentLoading,
    withPageLoading,
    withComponentLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay 
        show={isPageLoading} 
        message={loadingMessage}
      />
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
}