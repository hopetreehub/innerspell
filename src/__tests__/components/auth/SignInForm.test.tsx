import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '@/components/auth/SignInForm';
import { auth } from '@/lib/firebase/client';

// Mock the auth module
jest.mock('@/lib/firebase/client');

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign in form correctly', () => {
    render(<SignInForm />);
    
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // Invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식이 아닙니다/i)).toBeInTheDocument();
    });
  });

  it('requires password', async () => {
    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    // Valid email but no password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockSignIn = auth.signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockResolvedValue({ user: { uid: '123' } });
    
    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
    });
  });

  it('handles login error', async () => {
    const mockSignIn = auth.signInWithEmailAndPassword as jest.Mock;
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<SignInForm />);
    
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/로그인에 실패했습니다/i)).toBeInTheDocument();
    });
  });
});