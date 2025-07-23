
import { SignUpForm } from '@/components/auth/SignUpForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 - InnerSpell',
  description: 'InnerSpell 계정을 만드세요.',
};

export default function SignUpPage() {
  return (
    // AuthLayout is applied via RootLayoutClient
    <SignUpForm />
  );
}
