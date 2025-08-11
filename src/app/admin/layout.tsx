import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/actions/userActions';
// import { auth } from '@/lib/firebase/admin';

export const metadata: Metadata = {
  title: '관리자 대시보드 - InnerSpell',
  description: 'InnerSpell 관리자 대시보드',
  // EMERGENCY: Prevent caching of admin pages
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // This is a placeholder - in a real app, you'd get the current user's ID from the session
  // For now, we'll need to handle this client-side
  
  return (
    <>
      {/* EMERGENCY CACHE BUSTING META TAGS */}
      <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      <meta name="cache-control" content="no-cache" />
      <meta name="expires" content="0" />
      <meta name="pragma" content="no-cache" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </>
  );
}