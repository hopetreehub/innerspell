'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);

          // 업데이트 체크
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: '새로운 버전 사용 가능',
                    description: '페이지를 새로고침하여 최신 버전을 사용하세요.',
                    action: (
                      <button
                        onClick={() => {
                          newWorker.postMessage({ type: 'SKIP_WAITING' });
                          window.location.reload();
                        }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        새로고침
                      </button>
                    ),
                  });
                }
              });
            }
          });

          // 설치 프롬프트 이벤트 처리
          let deferredPrompt: any;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // 설치 가능할 때 토스트 표시
            toast({
              title: 'InnerSpell 앱 설치',
              description: '홈 화면에 추가하여 더 빠르게 접속하세요.',
              action: (
                <button
                  onClick={async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      console.log(`User response to install prompt: ${outcome}`);
                      deferredPrompt = null;
                    }
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  설치하기
                </button>
              ),
              duration: 10000,
            });
          });

          // 앱 설치 성공 이벤트
          window.addEventListener('appinstalled', () => {
            toast({
              title: '설치 완료!',
              description: 'InnerSpell이 홈 화면에 추가되었습니다.',
            });
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  return null;
}