
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <AlertTriangle className="w-24 h-24 text-destructive mb-8" />
      <h1 className="text-5xl font-bold text-primary mb-4 font-headline">404 - 페이지를 찾을 수 없습니다</h1>
      <p className="text-xl text-foreground/80 mb-8 max-w-md">
        요청하신 페이지가 존재하지 않거나, 다른 주소로 이동했을 수 있습니다.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
