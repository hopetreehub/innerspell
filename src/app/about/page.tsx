export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">InnerSpell 소개</h1>
      
      <div className="prose prose-lg dark:prose-invert mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">우리의 미션</h2>
          <p className="text-muted-foreground leading-relaxed">
            InnerSpell은 고대의 타로 지혜와 현대의 AI 기술을 결합하여, 
            당신의 내면을 탐험하고 삶의 방향을 찾을 수 있도록 돕습니다. 
            우리는 모든 사람이 자신만의 영적 여정을 통해 더 나은 삶을 
            살아갈 수 있다고 믿습니다.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">우리가 제공하는 가치</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-primary mr-2">✨</span>
              <span>전문가의 통찰력과 AI 기술의 정확성을 결합한 타로 리딩</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">🌙</span>
              <span>꿈의 의미를 해석하고 잠재의식을 이해하는 꿈 해몽 서비스</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">🧘</span>
              <span>일상의 스트레스를 해소하고 마음의 평화를 찾는 명상 가이드</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">💫</span>
              <span>같은 길을 걷는 사람들과 함께하는 따뜻한 커뮤니티</span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">우리의 철학</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            "당신의 답은 이미 당신 안에 있습니다. 우리는 단지 그것을 
            찾아내는 여정을 함께할 뿐입니다."
          </p>
          <p className="text-muted-foreground leading-relaxed">
            InnerSpell은 단순한 점술 서비스가 아닙니다. 우리는 각 개인이 
            자신의 내면을 탐험하고, 자아를 발견하며, 더 나은 미래를 
            창조할 수 있도록 돕는 영적 파트너입니다.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">함께하는 여정</h2>
          <p className="text-muted-foreground leading-relaxed">
            2024년부터 시작된 InnerSpell은 수천 명의 사용자들과 함께 
            성장해왔습니다. 앞으로도 더 많은 사람들이 자신의 내면을 
            발견하고 삶의 의미를 찾을 수 있도록 최선을 다하겠습니다.
          </p>
        </section>

        <div className="text-center mt-12">
          <a 
            href="/contact" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            문의하기
          </a>
        </div>
      </div>
    </div>
  );
}