
import { HeroSection } from '@/components/home/HeroSection';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Compass, BookOpen } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InnerSpell - AI 타로와 함께 내면 탐험',
  description: 'AI 기반 타로 리딩, 타로 카드 백과사전, 영적 성장을 위한 블로그를 통해 당신의 내면을 발견하고 삶의 질문에 대한 깊이 있는 통찰을 얻으세요.',
  // OpenGraph and Twitter metadata will be inherited from layout.tsx and overridden if needed here.
  // It's often better to keep shared OG/Twitter data in layout.tsx and be specific here.
  openGraph: {
    title: 'InnerSpell - AI 타로와 함께 내면 탐험',
    description: 'AI 기반 타로 리딩으로 현대적인 영적 타로 서비스를 경험하세요.',
    // images will inherit from layout, or you can specify a unique one for the homepage
    // images: [
    //   {
    //     url: '/homepage-og.png', 
    //     width: 1200,
    //     height: 630,
    //     alt: 'InnerSpell 홈페이지',
    //   },
    // ],
  },
};


const features = [
  {
    icon: <Star className="w-10 h-10 text-accent" />,
    title: "AI 기반 통찰의 깊이",
    description: "단순한 키워드 나열을 넘어, 고도로 학습된 AI가 당신의 고유한 질문과 상황에 맞춰 맥락을 이해하고 다층적인 해석을 제공합니다. 마치 숙련된 타로 리더와 대화하는 듯한 경험을 선사하며, 표면 아래 숨겨진 의미와 가능성을 발견하도록 돕습니다. 복잡한 감정의 실타래를 풀고 명확한 방향을 제시받으세요.",
    imageSrc: "/images/1ai.png",
    dataAiHint: "AI technology brain"
  },
  {
    icon: <Compass className="w-10 h-10 text-accent" />,
    title: "당신의 길을 탐색하는 다양한 방법",
    description: "한 장의 카드로 얻는 즉각적인 영감부터, 과거-현재-미래를 잇는 3카드 스프레드, 혹은 복잡한 상황을 심층적으로 분석하는 켈틱 크로스까지. 다양한 스프레드를 통해 삶의 특정 영역이나 질문에 대한 맞춤형 조언을 구체적으로 얻을 수 있습니다. 각 스프레드는 고유한 관점을 제공하여 문제 해결의 실마리를 찾도록 지원합니다.",
    imageSrc: "/images/2road.png",
    dataAiHint: "tarot spread journey"
  },
  {
    icon: <BookOpen className="w-10 h-10 text-accent" />,
    title: "지혜의 보고, 타로 백과사전",
    description: "78장의 타로 카드 각각에 담긴 풍부한 상징, 키워드, 정방향 및 역방향의 의미, 그리고 관련된 점성학적 요소까지. 포괄적인 백과사전을 통해 타로에 대한 이해를 넓히고, 스스로 카드를 해석하는 능력을 키울 수 있습니다. 카드의 세계를 탐험하며 당신의 영적 지혜를 확장하세요.",
    imageSrc: "/images/3wisdom.png",
    dataAiHint: "ancient book wisdom"
  }
];


export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <HeroSection />
      
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-primary">왜 InnerSpell을 선택해야 할까요?</h2>
            <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto">
              InnerSpell은 고대의 타로 지혜와 현대 AI 기술을 결합하여, 당신의 내면을 탐험하고 삶의 질문에 대한 깊이 있는 통찰을 얻을 수 있도록 설계되었습니다. 우리는 단순한 점술 도구를 넘어, 당신의 영적 성장 여정에 함께하는 동반자가 되고자 합니다. 당신의 잠재력을 깨우고, 삶의 도전을 헤쳐나갈 지혜를 발견하세요.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-sm border-primary/10 animate-slide-up overflow-hidden flex flex-col group transform hover:-translate-y-1" 
                style={{animationDelay: `${index * 0.15}s`}}
              >
                {feature.imageSrc && (
                  <div className="relative w-full h-48 overflow-hidden"> {/* h-48 gives aspect ~3:2 for 300x200 */}
                    <Image
                      src={feature.imageSrc}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={feature.dataAiHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // More specific sizes
                    />
                  </div>
                )}
                <CardHeader className="items-center text-center pt-6">
                  <div className="p-3 bg-accent/10 rounded-full mb-4 inline-block border-2 border-accent/30 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl text-primary group-hover:text-accent transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <p className="text-foreground/75 text-base leading-relaxed px-2">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
