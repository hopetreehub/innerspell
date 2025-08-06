import { AlertCircle, WifiOff, Lock, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

function ErrorStateWrapper({ title, description, action, icon }: ErrorStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{description}</p>
          {action && <div className="flex justify-center gap-2">{action}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

// 네트워크 연결 오류
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorStateWrapper
      title="연결 문제가 발생했습니다"
      description="인터넷 연결을 확인한 후 다시 시도해주세요."
      icon={<WifiOff className="w-8 h-8 text-destructive" />}
      action={
        <>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          )}
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            새로고침
          </Button>
        </>
      }
    />
  );
}

// 권한 오류
export function PermissionError({ message, showLogin = true }: { message?: string; showLogin?: boolean }) {
  return (
    <ErrorStateWrapper
      title="접근 권한이 없습니다"
      description={message || "이 페이지에 접근하려면 로그인이 필요합니다."}
      icon={<Lock className="w-8 h-8 text-destructive" />}
      action={
        <>
          {showLogin && (
            <Button asChild>
              <Link href="/sign-in">로그인하기</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Link>
          </Button>
        </>
      }
    />
  );
}

// 페이지를 찾을 수 없음
export function NotFoundError({ 
  title = "페이지를 찾을 수 없습니다",
  description = "요청하신 페이지가 존재하지 않거나 이동되었습니다."
}: { title?: string; description?: string }) {
  return (
    <ErrorStateWrapper
      title={title}
      description={description}
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      action={
        <>
          <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </Button>
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Link>
          </Button>
        </>
      }
    />
  );
}

// 서버 오류
export function ServerError({ 
  title = "서버 오류가 발생했습니다",
  description = "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  onRetry
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void; 
}) {
  return (
    <ErrorStateWrapper
      title={title}
      description={description}
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      action={
        <>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          )}
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Link>
          </Button>
        </>
      }
    />
  );
}

// API 오류
export function APIError({ 
  message,
  statusCode,
  onRetry 
}: { 
  message?: string; 
  statusCode?: number;
  onRetry?: () => void; 
}) {
  const getErrorMessage = () => {
    switch (statusCode) {
      case 400:
        return "잘못된 요청입니다. 입력 정보를 확인해주세요.";
      case 401:
        return "인증이 필요합니다. 다시 로그인해주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 리소스를 찾을 수 없습니다.";
      case 429:
        return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.";
      case 500:
        return "서버 내부 오류가 발생했습니다.";
      case 503:
        return "서비스를 일시적으로 사용할 수 없습니다.";
      default:
        return message || "알 수 없는 오류가 발생했습니다.";
    }
  };

  return (
    <ErrorStateWrapper
      title={`오류 ${statusCode ? `(${statusCode})` : ''}`}
      description={getErrorMessage()}
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      action={
        <>
          {onRetry && statusCode !== 403 && statusCode !== 404 && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          )}
          {statusCode === 401 && (
            <Button asChild>
              <Link href="/sign-in">로그인하기</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Link>
          </Button>
        </>
      }
    />
  );
}

// 로딩 실패
export function LoadingError({ 
  resource = "데이터",
  onRetry 
}: { 
  resource?: string; 
  onRetry?: () => void; 
}) {
  return (
    <ErrorStateWrapper
      title={`${resource} 로딩에 실패했습니다`}
      description="네트워크 연결을 확인하고 다시 시도해주세요."
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      action={
        <>
          {onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 로딩
            </Button>
          )}
          <Button variant="outline" onClick={() => window.location.reload()}>
            페이지 새로고침
          </Button>
        </>
      }
    />
  );
}

// 타로 관련 오류
export function TarotError({ 
  type = "reading",
  onRetry 
}: { 
  type?: "reading" | "cards" | "interpretation"; 
  onRetry?: () => void; 
}) {
  const getTypeMessage = () => {
    switch (type) {
      case "reading":
        return {
          title: "타로 리딩에 실패했습니다",
          description: "AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        };
      case "cards":
        return {
          title: "타로 카드를 불러오지 못했습니다",
          description: "카드 데이터를 가져오는 중 문제가 발생했습니다."
        };
      case "interpretation":
        return {
          title: "해석 생성에 실패했습니다",
          description: "AI 해석을 생성하는 중 문제가 발생했습니다."
        };
      default:
        return {
          title: "타로 서비스 오류",
          description: "타로 서비스에 문제가 발생했습니다."
        };
    }
  };

  const { title, description } = getTypeMessage();

  return (
    <ErrorStateWrapper
      title={title}
      description={description}
      icon={<AlertCircle className="w-8 h-8 text-destructive" />}
      action={
        <>
          {onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/reading" className="flex items-center gap-2">
              새로운 리딩 시작
            </Link>
          </Button>
        </>
      }
    />
  );
}

// 인라인 에러 메시지
export function InlineError({ 
  message, 
  className = "" 
}: { 
  message: string; 
  className?: string; 
}) {
  return (
    <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}

// 토스트 스타일 에러 (toast hook과 함께 사용)
export function ErrorToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-destructive" />
      <span>{message}</span>
    </div>
  );
}