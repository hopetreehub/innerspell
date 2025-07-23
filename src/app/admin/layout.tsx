import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/actions/userActions';
// import { auth } from '@/lib/firebase/admin';

export const metadata: Metadata = {
  title: '관리자 대시보드 - InnerSpell',
  description: 'InnerSpell 관리자 대시보드',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // This is a placeholder - in a real app, you'd get the current user's ID from the session
  // For now, we'll need to handle this client-side
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}