import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '타로 지침 가이드 - InnerSpell',
  description: '6개 스프레드 × 6개 해석 스타일로 구성된 36개 전문 타로 지침',
};

export default function TarotGuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}