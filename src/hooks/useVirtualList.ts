import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  overscan?: number;
  estimatedItemHeight?: number;
}

export function useVirtualList<T>(
  items: T[],
  containerHeight: number,
  options: UseVirtualListOptions
) {
  const { itemHeight, overscan = 3, estimatedItemHeight = itemHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / estimatedItemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / estimatedItemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
    };
  }, [scrollTop, items, containerHeight, estimatedItemHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollElementRef,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  };
}