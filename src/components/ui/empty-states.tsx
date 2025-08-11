/**
 * Empty state components for better user experience when no data is available
 */

import React from 'react';
import { 
  Database, 
  BarChart3, 
  Users, 
  Activity, 
  FileX, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'info' | 'warning';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  variant = 'default' 
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border ${getVariantStyles()}`}>
      <div className="mb-4">
        {icon || <Database className="h-16 w-16 opacity-50" />}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <Button 
          variant="outline" 
          onClick={action.onClick}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{action.label}</span>
        </Button>
      )}
    </div>
  );
}

export function EmptyChartState({ 
  title, 
  description, 
  onRefresh,
  chartType = 'bar'
}: { 
  title: string; 
  description: string; 
  onRefresh?: () => void;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
}) {
  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-12 w-12 opacity-30" />;
      case 'pie':
        return <PieChart className="h-12 w-12 opacity-30" />;
      case 'area':
        return <TrendingUp className="h-12 w-12 opacity-30" />;
      default:
        return <BarChart3 className="h-12 w-12 opacity-30" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <div className="mb-4">
        {getChartIcon()}
      </div>
      <h4 className="text-base font-medium mb-2 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {onRefresh && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-3 w-3" />
          <span>새로고침</span>
        </Button>
      )}
    </div>
  );
}

export function EmptyUsageStats({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-16 w-16 text-purple-400 opacity-50" />}
      title="사용량 데이터가 없습니다"
      description="아직 수집된 사용량 통계가 없습니다. 사용자들이 서비스를 이용하기 시작하면 여기에 데이터가 표시됩니다."
      action={{
        label: "새로고침",
        onClick: onRefresh
      }}
      variant="info"
    />
  );
}

export function EmptyActivityLogs({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={<Activity className="h-16 w-16 text-blue-400 opacity-50" />}
      title="활동 기록이 없습니다"
      description="현재 실시간 사용자 활동이나 기록된 활동 로그가 없습니다. 사용자 활동이 시작되면 여기에 표시됩니다."
      action={{
        label: "새로고침",
        onClick: onRefresh
      }}
      variant="info"
    />
  );
}

export function EmptyUserData({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-16 w-16 text-green-400 opacity-50" />}
      title="사용자 데이터가 없습니다"
      description="등록된 사용자나 세션 정보가 없습니다. 사용자가 서비스에 가입하고 이용하기 시작하면 데이터가 수집됩니다."
      action={{
        label: "새로고침",
        onClick: onRefresh
      }}
      variant="info"
    />
  );
}

export function DataUnavailableState({ 
  title = "데이터를 사용할 수 없습니다",
  description = "현재 데이터베이스에 연결할 수 없거나 데이터를 가져올 수 없습니다.",
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry: () => void; 
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-red-400 opacity-50" />}
      title={title}
      description={description}
      action={{
        label: "다시 시도",
        onClick: onRetry
      }}
      variant="warning"
    />
  );
}

export function DevelopmentModeState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <Alert className="border-amber-500/20 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-200">
          현재 개발 모드로 실행 중입니다. 실제 프로덕션 데이터 대신 파일 기반 저장소를 사용하고 있습니다.
        </AlertDescription>
      </Alert>
      
      <EmptyState
        icon={<Database className="h-16 w-16 text-amber-400 opacity-50" />}
        title="개발 모드 - 데이터 없음"
        description="파일 기반 저장소에서 데이터를 찾을 수 없습니다. 실제 사용자 활동이 시작되거나 테스트 데이터를 생성하면 여기에 표시됩니다."
        action={{
          label: "새로고침",
          onClick: onRefresh
        }}
        variant="warning"
      />
    </div>
  );
}

// 카드형 빈 상태 컴포넌트
export function EmptyCard({ 
  title, 
  description, 
  icon,
  onRefresh 
}: { 
  title: string; 
  description: string; 
  icon?: React.ReactNode;
  onRefresh?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={<FileX className="h-8 w-8 opacity-40" />}
          title="데이터 없음"
          description={description}
          action={onRefresh ? {
            label: "새로고침",
            onClick: onRefresh
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}