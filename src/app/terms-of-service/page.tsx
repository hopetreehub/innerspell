import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: '서비스 이용약관 - InnerSpell',
  description: 'InnerSpell의 서비스 이용약관을 확인하세요.',
};

export default function TermsOfServicePage() {
    const lastUpdated = "2024년 6월 24일"; // Static date

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <FileText className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">서비스 이용약관</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          최종 업데이트: {lastUpdated}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>서비스 이용약관 안내</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>InnerSpell 서비스를 이용해 주셔서 감사합니다.</p>
          <p>이 페이지는 현재 준비 중입니다. 정식 서비스 런칭 시점에 맞춰 상세한 이용약관이 게시될 예정입니다.</p>
          <h2>제1조 (목적)</h2>
          <p>본 약관은 InnerSpell이 제공하는 모든 서비스의 이용 조건 및 절차, 회원과 회사 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          <h2>제2조 (서비스의 제공 및 변경)</h2>
          <p>회사는 안정적인 서비스 제공을 위해 노력하며, 서비스의 내용 및 운영상, 기술상 필요에 따라 제공하고 있는 서비스의 전부 또는 일부를 변경할 수 있습니다.</p>
          <h2>제3조 (회원의 의무)</h2>
          <p>회원은 본 약관에서 규정하는 사항과 서비스 이용안내 또는 주의사항 등 회사가 공지하는 사항을 준수하여야 합니다.</p>
          <p>자세한 내용은 추후 업데이트될 예정입니다. 궁금한 점이 있으시면 문의해 주시기 바랍니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
