
import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import RootLayoutClient from './RootLayoutClient';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'InnerSpell - 당신의 내면을 탐험하세요',
    template: '%s - InnerSpell',
  },
  description: 'AI 기반 타로 해석과 함께 현대적인 영적 타로 서비스를 경험하세요. 타로 카드 리딩, 카드 백과사전, 영적 성장 블로그를 제공합니다.',
  keywords: ['타로', 'AI 타로', '타로카드', '운세', '점성술', '영적 성장', '명상', 'InnerSpell', '인공지능 타로', '타로 리딩', '타로 해석'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: 'InnerSpell',
    title: {
      default: 'InnerSpell - 당신의 내면을 탐험하세요',
      template: '%s - InnerSpell',
    },
    description: 'AI 기반 타로 해석, 타로 카드 백과사전, 영적 성장 블로그를 통해 당신의 내면을 발견하세요.',
    images: [
      {
        url: '/logo-og.png', 
        width: 1200,
        height: 630,
        alt: 'InnerSpell 로고',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'InnerSpell - 당신의 내면을 탐험하세요',
      template: '%s - InnerSpell',
    },
    description: 'AI 기반 타로 해석, 타로 카드 백과사전, 영적 성장 블로그를 통해 당신의 내면을 발견하세요.',
    images: [`${siteUrl}/logo-og.png`],
  },
  icons: null,
};

export const viewport: Viewport = {
  themeColor: [ 
    { media: '(prefers-color-scheme: light)', color: '#F3E5F5' },
    { media: '(prefers-color-scheme: dark)', color: '#221C2E' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="InnerSpell" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <AuthErrorBoundary>
              <AuthProvider>
                <RootLayoutClient>{children}</RootLayoutClient>
                <Toaster />
                <ServiceWorkerRegistration />
                <PerformanceMonitor />
                {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                  <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
                )}
              </AuthProvider>
            </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
