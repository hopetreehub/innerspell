import { Suspense } from 'react';
import { getEducationInquiries } from '@/actions/educationInquiryActions';
import InquiryTable from './components/InquiryTable';
import StatusFilter from './components/StatusFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function EducationInquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const status = searchParams.status as 'pending' | 'contacted' | 'completed' | undefined;
  const page = parseInt(searchParams.page || '1', 10);

  // 데이터 조회
  const result = await getEducationInquiries(20, status);
  const inquiries = result.success ? result.inquiries : [];

  // 통계 계산
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(inq => inq.status === 'pending').length,
    contacted: inquiries.filter(inq => inq.status === 'contacted').length,
    completed: inquiries.filter(inq => inq.status === 'completed').length,
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            타로 교육 문의 관리
          </h1>
          <p className="text-muted-foreground">
            타로 교육 프로그램에 대한 문의사항을 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              총 접수된 문의 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              처리 대기중인 문의
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연락완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">
              연락이 완료된 문의
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              완료된 문의
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>문의 목록</CardTitle>
              <CardDescription>
                접수된 교육 문의를 확인하고 관리합니다.
              </CardDescription>
            </div>
            <StatusFilter currentStatus={status} />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <InquiryTable inquiries={inquiries} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}