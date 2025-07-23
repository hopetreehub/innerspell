import { notFound } from 'next/navigation';
import { SharedTarotReadingView } from '@/components/reading/SharedTarotReadingView';
import { Metadata } from 'next';

interface PageProps {
  params: { shareId: string };
}

async function getSharedReading(shareId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000';
    const response = await fetch(`${baseUrl}/api/reading/share?id=${shareId}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.reading : null;
  } catch (error) {
    console.error('Error fetching shared reading:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const reading = await getSharedReading(params.shareId);
  
  if (!reading) {
    return {
      title: '공유된 타로 리딩을 찾을 수 없습니다 - InnerSpell',
      description: '요청하신 타로 리딩 공유 링크가 만료되었거나 존재하지 않습니다.',
    };
  }

  return {
    title: `공유된 타로 리딩: ${reading.question} - InnerSpell`,
    description: `${reading.spreadName} 스프레드로 진행된 AI 타로 리딩 결과를 확인해보세요.`,
    openGraph: {
      title: `🔮 공유된 타로 리딩`,
      description: `질문: ${reading.question}\n스프레드: ${reading.spreadName}`,
      type: 'website',
    },
  };
}

export default async function SharedReadingPage({ params }: PageProps) {
  const reading = await getSharedReading(params.shareId);

  if (!reading) {
    notFound();
  }

  return <SharedTarotReadingView reading={reading} />;
}