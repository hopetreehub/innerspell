'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorType: 'auth' | 'network' | 'unknown';
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Determine error type based on error message
    let errorType: 'auth' | 'network' | 'unknown' = 'unknown';
    
    if (error.message.includes('auth') || 
        error.message.includes('permission') || 
        error.message.includes('unauthorized')) {
      errorType = 'auth';
    } else if (error.message.includes('network') || 
               error.message.includes('fetch') ||
               error.message.includes('Failed to fetch')) {
      errorType = 'network';
    }

    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorType: 'unknown' });
    // Clear any stale auth data
    localStorage.removeItem('user-logged-out');
    localStorage.removeItem('mock-user-logged-in');
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive" className="border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>인증 오류가 발생했습니다</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.errorType === 'auth' && (
                  <span>로그인 세션이 만료되었거나 인증에 문제가 발생했습니다.</span>
                )}
                {this.state.errorType === 'network' && (
                  <span>네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.</span>
                )}
                {this.state.errorType === 'unknown' && (
                  <span>예기치 않은 오류가 발생했습니다.</span>
                )}
              </AlertDescription>
            </Alert>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert variant="default" className="bg-muted">
                <AlertTitle className="text-sm">개발자 정보</AlertTitle>
                <AlertDescription className="mt-1 text-xs font-mono">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              {this.state.errorType === 'auth' ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/sign-in">
                      <LogIn className="mr-2 h-4 w-4" />
                      다시 로그인
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleReset}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    페이지 새로고침
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={this.handleReset}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
              )}
              
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}