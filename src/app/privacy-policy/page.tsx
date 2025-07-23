import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: '개인정보 처리방침 - InnerSpell',
  description: 'InnerSpell의 개인정보 처리방침에 대해 알아보세요.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "2024년 6월 24일"; // Static date

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <Shield className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">개인정보 처리방침</h1>
        <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
          최종 업데이트: {lastUpdated}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>개인정보 처리방침 안내</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>InnerSpell은 사용자의 개인정보를 소중히 다룹니다.</p>
          <p>이 페이지는 현재 준비 중입니다. 정식 서비스 런칭 시점에 맞춰 상세한 개인정보 처리방침이 게시될 예정입니다.</p>
          <h2>수집하는 개인정보 항목</h2>
          <p>서비스 제공을 위해 최소한의 개인정보를 수집할 수 있습니다. (예: 이메일, 닉네임)</p>
          <h2>개인정보의 수집 및 이용 목적</h2>
          <p>수집된 정보는 회원 식별, 서비스 제공, 고객 지원 등의 목적으로 사용됩니다.</p>
          <h2>개인정보의 보유 및 이용기간</h2>
          <p>법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
          <p>자세한 내용은 추후 업데이트될 예정입니다. 궁금한 점이 있으시면 문의해 주시기 바랍니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
