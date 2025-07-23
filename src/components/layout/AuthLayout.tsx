
import type React from 'react';
import Image from 'next/image'; // Added for logo
import Link from 'next/link';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
             {/* Assuming logo is placed in public/logo.png */}
            <Image src="/logo.png" alt="InnerSpell 로고" width={40} height={40} className="h-10 w-10" />
            <h1 className="font-headline text-4xl font-bold text-primary">InnerSpell</h1>
          </Link>
        </div>
        <div className="bg-card p-6 sm:p-8 shadow-2xl rounded-xl border border-primary/20">
          {children}
        </div>
      </div>
    </div>
  );
}
