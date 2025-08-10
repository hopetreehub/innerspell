import { redirect } from 'next/navigation';

export default function NewReadingPage() {
  // 기존 리딩 페이지로 리다이렉트
  redirect('/reading');
}