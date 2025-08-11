import { Metadata } from 'next';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { LazyUserDashboard } from '@/components/DynamicComponents';

export const metadata: Metadata = {
  title: '대시보드 | InnerSpell - 나의 타로 여정 추적',
  description: '개인화된 타로 리딩 기록, 성장 인사이트, 목표 달성 현황을 한눈에 확인하세요.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">나의 타로 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          개인화된 인사이트와 성장 기록을 확인해보세요
        </p>
      </div>
      
      <UserDashboard />
    </div>
  );
}