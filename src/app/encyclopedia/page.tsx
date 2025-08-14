export default function EncyclopediaPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">타로 백과사전</h1>
      
      <div className="prose prose-lg dark:prose-invert mx-auto max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">타로 카드란?</h2>
          <p className="text-muted-foreground leading-relaxed">
            타로는 78장의 카드로 구성된 점술 도구로, 수백 년 동안 사람들의 내면과 미래를 
            탐구하는 데 사용되어 왔습니다. 각 카드는 고유한 상징과 의미를 가지고 있으며, 
            이를 통해 질문자의 현재 상황, 내면의 갈등, 그리고 가능한 미래를 해석할 수 있습니다.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">메이저 아르카나 (Major Arcana)</h2>
            <p className="text-muted-foreground mb-4">
              22장의 메이저 아르카나는 인생의 주요 테마와 영적 여정을 나타냅니다.
            </p>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">0. 바보 (The Fool)</h3>
                <p className="text-sm text-muted-foreground">
                  새로운 시작, 순수함, 모험의 시작을 의미합니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">1. 마법사 (The Magician)</h3>
                <p className="text-sm text-muted-foreground">
                  의지력, 창조력, 실현 능력을 상징합니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">2. 여교황 (The High Priestess)</h3>
                <p className="text-sm text-muted-foreground">
                  직관, 내면의 지혜, 신비로운 지식을 나타냅니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">3. 여황제 (The Empress)</h3>
                <p className="text-sm text-muted-foreground">
                  풍요로움, 창조성, 모성애를 의미합니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">4. 황제 (The Emperor)</h3>
                <p className="text-sm text-muted-foreground">
                  권위, 안정성, 구조와 질서를 상징합니다.
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground italic">
                ... 그리고 17장의 추가 메이저 아르카나 카드들
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">마이너 아르카나 (Minor Arcana)</h2>
            <p className="text-muted-foreground mb-4">
              56장의 마이너 아르카나는 일상생활의 세부사항과 실용적인 조언을 제공합니다.
            </p>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🗡️ 소드 (Swords)</h3>
                <p className="text-sm text-muted-foreground">
                  사고, 소통, 갈등, 정신적 도전을 나타냅니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🏆 컵 (Cups)</h3>
                <p className="text-sm text-muted-foreground">
                  감정, 관계, 직감, 영적 연결을 의미합니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🌟 펜타클 (Pentacles)</h3>
                <p className="text-sm text-muted-foreground">
                  물질적 세계, 돈, 직업, 건강을 상징합니다.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🔥 완드 (Wands)</h3>
                <p className="text-sm text-muted-foreground">
                  열정, 창조성, 영감, 행동을 나타냅니다.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                각 수트는 에이스부터 킹까지 14장의 카드로 구성되어 있습니다:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc">
                <li>숫자 카드 (에이스-10): 기본적인 에너지와 상황</li>
                <li>궁정 카드 (페이지, 나이트, 퀸, 킹): 사람과 성격 유형</li>
              </ul>
            </div>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">타로 스프레드 (Tarot Spreads)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">🎯 원 카드 드로우</h3>
              <p className="text-sm text-muted-foreground mb-3">
                가장 간단한 형태의 리딩으로, 하나의 질문에 대한 직접적인 답변을 제공합니다.
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>일일 지침</li>
                <li>간단한 예/아니오 질문</li>
                <li>현재 상황의 핵심</li>
              </ul>
            </div>
            
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">🔮 쓰리 카드 스프레드</h3>
              <p className="text-sm text-muted-foreground mb-3">
                과거, 현재, 미래 또는 문제, 행동, 결과를 나타내는 3장의 카드 배치입니다.
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>과거 - 현재 - 미래</li>
                <li>상황 - 행동 - 결과</li>
                <li>몸 - 마음 - 영혼</li>
              </ul>
            </div>
            
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">✨ 켈틱 크로스</h3>
              <p className="text-sm text-muted-foreground mb-3">
                가장 포괄적인 10장 스프레드로, 복잡한 상황에 대한 심층적인 통찰을 제공합니다.
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside">
                <li>현재 상황과 도전</li>
                <li>숨겨진 영향과 과거</li>
                <li>가능한 미래와 결과</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">타로 리딩 가이드라인</h2>
          
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">효과적인 타로 리딩을 위한 팁</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">리딩 전 준비</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>명확한 질문 또는 의도 설정</li>
                  <li>조용하고 평화로운 환경 조성</li>
                  <li>마음을 차분하게 하는 명상</li>
                  <li>열린 마음가짐 유지</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">해석 시 주의사항</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>직관과 지식의 균형 유지</li>
                  <li>카드 간의 관계와 패턴 관찰</li>
                  <li>개인적 경험과 연결</li>
                  <li>긍정적 관점에서 접근</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">자주 묻는 질문</h2>
          
          <div className="space-y-4">
            <details className="bg-muted/30 p-4 rounded-lg">
              <summary className="font-medium cursor-pointer">타로 카드는 실제로 미래를 예측할 수 있나요?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                타로는 현재의 에너지와 경향을 바탕으로 가능한 미래를 제시합니다. 
                미래는 변화 가능하며, 타로는 자기 인식과 의사결정에 도움을 주는 도구입니다.
              </p>
            </details>
            
            <details className="bg-muted/30 p-4 rounded-lg">
              <summary className="font-medium cursor-pointer">타로 리딩은 얼마나 자주 받아야 하나요?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                개인의 필요에 따라 다르지만, 일반적으로 같은 질문에 대해서는 
                최소 1-2주 간격을 두는 것이 좋습니다. 상황이 크게 변화했을 때 새로운 리딩을 받으세요.
              </p>
            </details>
            
            <details className="bg-muted/30 p-4 rounded-lg">
              <summary className="font-medium cursor-pointer">부정적인 카드가 나왔을 때는 어떻게 해야 하나요?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                모든 타로 카드는 성장과 학습의 기회를 제공합니다. 
                소위 '부정적'인 카드도 필요한 변화나 주의할 점을 알려주는 
                중요한 메시지를 담고 있습니다.
              </p>
            </details>
          </div>
        </section>

        <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">타로의 여정을 시작해보세요</h3>
          <p className="text-muted-foreground mb-6">
            InnerSpell과 함께 당신의 내면을 탐험하고 삶의 지혜를 발견하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/reading" 
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              타로 리딩 시작하기
            </a>
            <a 
              href="/blog" 
              className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              타로 가이드 읽기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}