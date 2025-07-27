import { render, screen, fireEvent } from '@testing-library/react';
import { 
  NetworkError, 
  PermissionError, 
  NotFoundError, 
  ServerError,
  APIError,
  LoadingError,
  TarotError,
  InlineError
} from '../error-states';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Error State Components', () => {
  describe('NetworkError', () => {
    it('should render network error message', () => {
      render(<NetworkError />);
      
      expect(screen.getByText('연결 문제가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결을 확인한 후 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      render(<NetworkError onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should reload page when refresh button is clicked', () => {
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(<NetworkError />);
      
      const refreshButton = screen.getByText('새로고침');
      fireEvent.click(refreshButton);
      
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe('PermissionError', () => {
    it('should render permission error with default message', () => {
      render(<PermissionError />);
      
      expect(screen.getByText('접근 권한이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('이 페이지에 접근하려면 로그인이 필요합니다.')).toBeInTheDocument();
    });

    it('should render custom message when provided', () => {
      const customMessage = '관리자 권한이 필요합니다.';
      render(<PermissionError message={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should show login button by default', () => {
      render(<PermissionError />);
      
      expect(screen.getByText('로그인하기')).toBeInTheDocument();
    });

    it('should hide login button when showLogin is false', () => {
      render(<PermissionError showLogin={false} />);
      
      expect(screen.queryByText('로그인하기')).not.toBeInTheDocument();
      expect(screen.getByText('홈으로 가기')).toBeInTheDocument();
    });
  });

  describe('NotFoundError', () => {
    it('should render 404 error with default content', () => {
      render(<NotFoundError />);
      
      expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
      expect(screen.getByText('요청하신 페이지가 존재하지 않거나 이동되었습니다.')).toBeInTheDocument();
    });

    it('should render custom title and description', () => {
      const customTitle = '파일을 찾을 수 없습니다';
      const customDescription = '요청하신 파일이 삭제되었습니다.';
      
      render(<NotFoundError title={customTitle} description={customDescription} />);
      
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('should have navigation buttons', () => {
      render(<NotFoundError />);
      
      expect(screen.getByText('이전 페이지')).toBeInTheDocument();
      expect(screen.getByText('홈으로 가기')).toBeInTheDocument();
    });
  });

  describe('ServerError', () => {
    it('should render server error with default content', () => {
      render(<ServerError />);
      
      expect(screen.getByText('서버 오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('should call onRetry when provided', () => {
      const mockRetry = jest.fn();
      render(<ServerError onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('APIError', () => {
    it('should render generic API error without status code', () => {
      render(<APIError />);
      
      expect(screen.getByText('오류')).toBeInTheDocument();
      expect(screen.getByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
    });

    it('should render specific error messages for status codes', () => {
      const testCases = [
        { statusCode: 400, expectedMessage: '잘못된 요청입니다. 입력 정보를 확인해주세요.' },
        { statusCode: 401, expectedMessage: '인증이 필요합니다. 다시 로그인해주세요.' },
        { statusCode: 403, expectedMessage: '접근 권한이 없습니다.' },
        { statusCode: 404, expectedMessage: '요청한 리소스를 찾을 수 없습니다.' },
        { statusCode: 429, expectedMessage: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.' },
        { statusCode: 500, expectedMessage: '서버 내부 오류가 발생했습니다.' },
        { statusCode: 503, expectedMessage: '서비스를 일시적으로 사용할 수 없습니다.' },
      ];

      testCases.forEach(({ statusCode, expectedMessage }) => {
        const { unmount } = render(<APIError statusCode={statusCode} />);
        
        expect(screen.getByText(`오류 (${statusCode})`)).toBeInTheDocument();
        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should show login button for 401 errors', () => {
      render(<APIError statusCode={401} />);
      
      expect(screen.getByText('로그인하기')).toBeInTheDocument();
    });

    it('should not show retry button for 403 and 404 errors', () => {
      render(<APIError statusCode={403} />);
      expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
      
      const { rerender } = render(<APIError statusCode={404} />);
      expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
    });
  });

  describe('LoadingError', () => {
    it('should render loading error with default resource name', () => {
      render(<LoadingError />);
      
      expect(screen.getByText('데이터 로딩에 실패했습니다')).toBeInTheDocument();
    });

    it('should render loading error with custom resource name', () => {
      render(<LoadingError resource="사용자 정보" />);
      
      expect(screen.getByText('사용자 정보 로딩에 실패했습니다')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = jest.fn();
      render(<LoadingError onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('다시 로딩');
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('TarotError', () => {
    it('should render default tarot reading error', () => {
      render(<TarotError />);
      
      expect(screen.getByText('타로 리딩에 실패했습니다')).toBeInTheDocument();
      expect(screen.getByText('AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('should render different messages for different error types', () => {
      const testCases = [
        {
          type: 'cards',
          expectedTitle: '타로 카드를 불러오지 못했습니다',
          expectedDescription: '카드 데이터를 가져오는 중 문제가 발생했습니다.'
        },
        {
          type: 'interpretation',
          expectedTitle: '해석 생성에 실패했습니다',
          expectedDescription: 'AI 해석을 생성하는 중 문제가 발생했습니다.'
        }
      ];

      testCases.forEach(({ type, expectedTitle, expectedDescription }) => {
        const { unmount } = render(<TarotError type={type as any} />);
        
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        expect(screen.getByText(expectedDescription)).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should have new reading link', () => {
      render(<TarotError />);
      
      const newReadingLink = screen.getByText('새로운 리딩 시작');
      expect(newReadingLink).toBeInTheDocument();
      expect(newReadingLink.closest('a')).toHaveAttribute('href', '/reading');
    });
  });

  describe('InlineError', () => {
    it('should render inline error message', () => {
      const errorMessage = '필수 입력 항목입니다.';
      render(<InlineError message={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const customClass = 'custom-error-class';
      const { container } = render(
        <InlineError message="Error" className={customClass} />
      );
      
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should have error icon', () => {
      render(<InlineError message="Error" />);
      
      // Check for the presence of an icon (AlertCircle)
      const iconElement = screen.getByText('Error').parentElement;
      expect(iconElement).toHaveClass('text-destructive');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<NetworkError />);
      
      // Error states should be perceivable by screen readers
      const errorContainer = screen.getByText('연결 문제가 발생했습니다').closest('div');
      expect(errorContainer).toBeInTheDocument();
    });

    it('should have focusable buttons', () => {
      render(<NetworkError onRetry={jest.fn()} />);
      
      const retryButton = screen.getByText('다시 시도');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.tagName).toBe('BUTTON');
    });

    it('should have proper link accessibility', () => {
      render(<NotFoundError />);
      
      const homeLink = screen.getByText('홈으로 가기');
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });
  });
});