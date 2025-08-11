import React, { Suspense, lazy } from 'react';
import { Spinner } from '@/components/ui/spinner';

const AIProviderManagement = lazy(() => import('./AIProviderManagement').then(mod => ({ default: mod.AIProviderManagement })));
const BlogManagement = lazy(() => import('./BlogManagement').then(mod => ({ default: mod.BlogManagement })));
const TarotGuidelineManagement = lazy(() => import('./TarotGuidelineManagement').then(mod => ({ default: mod.TarotGuidelineManagement })));
const AIPromptConfigForm = lazy(() => import('./AIPromptConfigForm').then(mod => ({ default: mod.AIPromptConfigForm })));
const DreamInterpretationConfigForm = lazy(() => import('./DreamInterpretationConfigForm').then(mod => ({ default: mod.DreamInterpretationConfigForm })));
const UserManagement = lazy(() => import('./UserManagement').then(mod => ({ default: mod.UserManagement })));
const SystemManagement = lazy(() => import('./SystemManagement').then(mod => ({ default: mod.SystemManagement })));
const UsageStatsCharts = lazy(() => import('./UsageStatsCharts').then(mod => ({ default: mod.UsageStatsCharts })));
const RealTimeMonitoringDashboard = lazy(() => import('./RealTimeMonitoringDashboard').then(mod => ({ default: mod.RealTimeMonitoringDashboard })));

interface AdminTabContentProps {
  activeTab: string;
}

const LoadingSpinner = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="large" />
      <p className="text-muted-foreground">컴포넌트 로딩 중...</p>
    </div>
  </div>
);

export function AdminTabContent({ activeTab }: AdminTabContentProps) {
  switch (activeTab) {
    case 'ai-providers':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AIProviderManagement />
        </Suspense>
      );
    case 'blog-management':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <BlogManagement />
        </Suspense>
      );
    case 'tarot-guidelines':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <TarotGuidelineManagement />
        </Suspense>
      );
    case 'tarot-ai-config':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AIPromptConfigForm />
        </Suspense>
      );
    case 'dream-ai-config':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <DreamInterpretationConfigForm />
        </Suspense>
      );
    case 'user-management':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <UserManagement />
        </Suspense>
      );
    case 'system-management':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <SystemManagement />
        </Suspense>
      );
    case 'usage-stats':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <UsageStatsCharts />
        </Suspense>
      );
    case 'real-time-monitoring':
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <RealTimeMonitoringDashboard />
        </Suspense>
      );
    default:
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <TarotGuidelineManagement />
        </Suspense>
      );
  }
}