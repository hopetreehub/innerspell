
import { SignInForm } from '@/components/auth/SignInForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 - InnerSpell',
  description: 'InnerSpell 계정에 로그인하세요.',
};

export default function SignInPage() {
  return (
    // AuthLayout is applied via RootLayoutClient
    <SignInForm />
  );
}
