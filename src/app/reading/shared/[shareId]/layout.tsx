import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  
  return {
    title: '공유된 타로 리딩 - InnerSpell',
    description: 'AI가 해석한 타로 리딩 결과를 확인해보세요.',
    openGraph: {
      title: '🔮 공유된 타로 리딩',
      description: 'AI 타로 리딩 결과를 공유합니다.',
      type: 'website',
    },
  };
}

export default function SharedReadingLayout({ children }: LayoutProps) {
  return children;
}