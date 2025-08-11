'use client';

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useLazyLoading<T extends Element = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseLazyLoadingOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Intersection Observer가 지원되지 않는 경우 즉시 로드
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
          
          // triggerOnce가 true이면 한 번만 실행 후 observer 해제
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return {
    ref,
    isIntersecting,
    hasIntersected,
    shouldLoad: triggerOnce ? hasIntersected : isIntersecting
  };
}

// 이미지 지연 로딩 전용 훅
export function useImageLazyLoading<T extends Element = HTMLDivElement>(
  options: UseLazyLoadingOptions = {}
) {
  const { ref, shouldLoad, hasIntersected } = useLazyLoading<T>({
    rootMargin: '100px', // 이미지는 더 일찍 로드
    ...options
  });

  return {
    ref,
    shouldLoad,
    hasIntersected
  };
}

// 컴포넌트 지연 로딩 전용 훅
export function useComponentLazyLoading<T extends Element = HTMLDivElement>(
  options: UseLazyLoadingOptions = {}
) {
  const { ref, shouldLoad, isIntersecting } = useLazyLoading<T>({
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });

  return {
    ref,
    shouldLoad,
    isVisible: isIntersecting
  };
}