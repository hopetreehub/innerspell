export default function TarotPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            타로 카드 아카이브
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            78장의 타로 카드 각각의 깊은 의미와 상징을 탐험해보세요.
            각 카드는 인생의 다른 측면과 영적 여정을 나타냅니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">메이저 아르카나</h3>
            <p className="text-muted-foreground">22장의 주요 카드들</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">마이너 아르카나</h3>
            <p className="text-muted-foreground">56장의 보조 카드들</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">카드 해석</h3>
            <p className="text-muted-foreground">상세한 의미 설명</p>
          </div>
        </div>
      </div>
    </div>
  );
}