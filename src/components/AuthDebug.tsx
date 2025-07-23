'use client';

import { useAuth } from '@/context/AuthContext';

export function AuthDebug() {
  const { user, loading } = useAuth();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>UID: {user?.uid || 'N/A'}</div>
      <div>Role: {user?.role || 'N/A'}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>USE_REAL_AUTH: {process.env.NEXT_PUBLIC_USE_REAL_AUTH || 'undefined'}</div>
    </div>
  );
}