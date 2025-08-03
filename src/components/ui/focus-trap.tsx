'use client';

import React, { useRef, useEffect } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export function FocusTrap({ 
  children, 
  active = true, 
  restoreFocus = true,
  className 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors))
        .filter((element) => {
          const htmlElement = element as HTMLElement;
          return htmlElement.offsetParent !== null && 
                 getComputedStyle(htmlElement).display !== 'none' &&
                 getComputedStyle(htmlElement).visibility !== 'hidden';
        }) as HTMLElement[];
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously active element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, restoreFocus]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef} 
      className={className}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// Skip link for keyboard navigation
export function SkipLink({ href = "#main-content", children = "메인 콘텐츠로 바로가기" }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// Live region for announcements
export function LiveRegion({ 
  children, 
  level = 'polite' as 'polite' | 'assertive' | 'off',
  atomic = true 
}: {
  children: React.ReactNode;
  level?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}) {
  return (
    <div
      aria-live={level}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}