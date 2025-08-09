export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">우리의 서비스</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">타로 리딩</h2>
          <p className="text-muted-foreground mb-4">
            전문 타로 리더와 함께하는 깊이 있는 상담을 통해 
            당신의 미래를 밝혀보세요.
          </p>
          <a href="/tarot" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">꿈 해몽</h2>
          <p className="text-muted-foreground mb-4">
            AI 기반 꿈 해석 서비스로 당신의 꿈에 담긴 
            의미를 찾아보세요.
          </p>
          <a href="/community/dream" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">명상 가이드</h2>
          <p className="text-muted-foreground mb-4">
            일상의 스트레스를 해소하고 마음의 평화를 
            찾을 수 있는 명상 프로그램.
          </p>
          <a href="/blog?category=명상" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">영성 상담</h2>
          <p className="text-muted-foreground mb-4">
            삶의 의미와 방향을 찾고자 하는 분들을 위한 
            깊이 있는 영성 상담.
          </p>
          <a href="/blog?category=영성" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">커뮤니티</h2>
          <p className="text-muted-foreground mb-4">
            같은 관심사를 가진 사람들과 경험을 공유하고 
            함께 성장하세요.
          </p>
          <a href="/community" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">블로그</h2>
          <p className="text-muted-foreground mb-4">
            타로, 영성, 라이프스타일에 대한 유익한 정보와 
            인사이트를 제공합니다.
          </p>
          <a href="/blog" className="text-primary hover:underline">
            자세히 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}