
'use client';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  const { user } = useAuth();

  // Do not show ads to paid users.
  // Show ads to free users or users who are not logged in.
  if (user?.subscriptionStatus === 'paid') {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center h-48 w-full rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/30 text-muted-foreground", className)}>
      <div className="text-center">
        <p className="text-sm font-semibold">광고 영역</p>
        <p className="text-xs">이 공간에 광고가 표시됩니다.</p>
      </div>
    </div>
  );
}
