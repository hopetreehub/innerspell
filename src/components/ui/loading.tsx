'use client';

import { cn } from "@/lib/utils";

// Spinner component for loading states
export function Spinner({ className, size = "md" }: { 
  className?: string; 
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

// Loading overlay for full page loading
export function LoadingOverlay({ 
  show, 
  message = "로딩 중...",
  className 
}: { 
  show: boolean; 
  message?: string;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="로딩 중"
    >
      <Spinner size="xl" />
      <p className="mt-4 text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

// Loading button state
export function LoadingButton({ 
  children, 
  loading, 
  disabled,
  className,
  ...props 
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "relative min-h-[44px] touch-manipulation active:scale-[0.98] transition-transform duration-150",
        loading && "cursor-not-allowed",
        className
      )}
      aria-busy={loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}
      <span className={cn(loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Blog post skeleton
export function BlogPostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-4">
        <div className="h-48 bg-muted rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

// Tarot card skeleton
export function TarotCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="aspect-[2/3] bg-muted rounded-lg border-2 border-muted-foreground/20">
        <div className="p-4 h-full flex flex-col justify-between">
          <div className="h-4 bg-muted-foreground/30 rounded w-2/3"></div>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-16 w-16 bg-muted-foreground/30 rounded-full"></div>
          </div>
          <div className="h-3 bg-muted-foreground/30 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// List skeleton (for navigation, etc.)
export function ListSkeleton({ 
  items = 5, 
  className 
}: { 
  items?: number; 
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  cols = 4, 
  className 
}: { 
  rows?: number; 
  cols?: number; 
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b bg-muted/30 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b last:border-b-0 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page loading with skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}