'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 리포팅 (Firebase Analytics 또는 다른 서비스로 전송)
    if (typeof window !== 'undefined') {
      // 프로덕션 환경에서만 에러 리포팅
      if (process.env.NODE_ENV === 'production') {
        // Firebase Analytics나 Sentry 등으로 에러 전송
        console.error('Production error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }
    }

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-headline">문제가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-muted p-3 rounded-md text-sm">
              <summary className="cursor-pointer font-medium mb-2">개발자 정보</summary>
              <pre className="whitespace-pre-wrap text-xs overflow-auto">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={resetError} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              페이지 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;