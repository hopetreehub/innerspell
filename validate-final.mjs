// 타로 지침 시스템 최종 정확한 검증
import fs from 'fs';

console.log('🔍 타로 지침 시스템 최종 검증\n');

const spreadsContent = fs.readFileSync('./src/data/tarot-spreads.ts', 'utf8');
const guidelinesContent = fs.readFileSync('./src/data/tarot-guidelines.ts', 'utf8');

// 실제 스프레드 분석 (포지션이 아닌 스프레드만)
console.log('📊 실제 타로 스프레드 분석:');
const actualSpreads = [
  { id: 'past-present-future', name: '삼위일체 (과거-현재-미래)' },
  { id: 'mind-body-spirit', name: '정신-몸-영혼' },
  { id: 'situation-action-outcome', name: '상황-행동-결과' },
  { id: 'cross-spread', name: '십자가 스프레드' },
  { id: 'relationship-spread', name: '관계 스프레드' },
  { id: 'celtic-cross', name: '켈틱 크로스' }
];

console.log(`   실제 스프레드 수: ${actualSpreads.length}개`);
actualSpreads.forEach((spread, index) => {
  console.log(`   ${index + 1}. ${spread.id} - ${spread.name}`);
});
console.log('');

// 해석 스타일 분석
console.log('🎨 해석 스타일 분석:');
const styles = [
  { id: 'traditional-rws', name: '전통 라이더-웨이트' },
  { id: 'psychological-jungian', name: '심리학적 융 접근법' },
  { id: 'thoth-crowley', name: '토트 크로울리 전통' },
  { id: 'intuitive-modern', name: '직관적 현대 해석' },
  { id: 'therapeutic-counseling', name: '치료적 상담 접근법' },
  { id: 'elemental-seasonal', name: '원소와 계절 중심' }
];

console.log(`   해석 스타일 수: ${styles.length}개`);
styles.forEach((style, index) => {
  console.log(`   ${index + 1}. ${style.id} - ${style.name}`);
});
console.log('');

// 완성된 지침 분석
console.log('📚 완성된 타로 지침 분석:');
const guidelinesMatch = guidelinesContent.match(/export const TAROT_GUIDELINES[^=]*=\s*\[([\s\S]*?)\];/);
let completedGuidelines = [];

if (guidelinesMatch) {
  const guidelinesArray = guidelinesMatch[1];
  const guidelineIds = [...guidelinesArray.matchAll(/{\s*id:\s*'([^']+)'/g)].map(m => m[1]);
  const guidelineNames = [...guidelinesArray.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
  
  completedGuidelines = guidelineIds.map((id, index) => ({
    id,
    name: guidelineNames[index] || id
  }));
  
  console.log(`   완성된 지침 수: ${completedGuidelines.length}개`);
  const totalCombinations = actualSpreads.length * styles.length;
  const completionRate = Math.round((completedGuidelines.length / totalCombinations) * 100);
  console.log(`   총 가능한 조합: ${actualSpreads.length} × ${styles.length} = ${totalCombinations}`);
  console.log(`   완성률: ${completionRate}%`);
  console.log('');
  
  console.log('완성된 지침 목록:');
  completedGuidelines.forEach((guideline, index) => {
    console.log(`   ${index + 1}. ${guideline.name}`);
  });
  console.log('');
}

// 스프레드별 완성 현황 분석
console.log('📈 스프레드별 완성 현황:');
actualSpreads.forEach(spread => {
  const matchingGuidelines = completedGuidelines.filter(g => g.id.startsWith(spread.id + '-'));
  const completedCount = matchingGuidelines.length;
  const percentage = Math.round((completedCount / styles.length) * 100);
  
  console.log(`   ${spread.name}: ${completedCount}/${styles.length} (${percentage}%)`);
  
  if (completedCount > 0) {
    styles.forEach(style => {
      const isCompleted = matchingGuidelines.some(g => g.id === `${spread.id}-${style.id}`);
      if (isCompleted) {
        console.log(`     ✅ ${style.name}`);
      } else {
        console.log(`     ❌ ${style.name} (미완성)`);
      }
    });
  } else {
    console.log('     모든 스타일 미완성');
  }
  console.log('');
});

// 우선순위 분석
console.log('🎯 작업 우선순위 분석:');
console.log('');

console.log('1️⃣ 즉시 완성 권장 (기본 스프레드):');
actualSpreads.slice(0, 3).forEach(spread => {
  const completed = completedGuidelines.filter(g => g.id.startsWith(spread.id + '-')).length;
  const remaining = styles.length - completed;
  if (remaining > 0) {
    console.log(`   • ${spread.name}: ${remaining}개 스타일 미완성`);
  }
});

console.log('\n2️⃣ 중급 단계 (중간 난이도):');
actualSpreads.slice(3, 5).forEach(spread => {
  const completed = completedGuidelines.filter(g => g.id.startsWith(spread.id + '-')).length;
  const remaining = styles.length - completed;
  console.log(`   • ${spread.name}: ${remaining}개 스타일 미완성`);
});

console.log('\n3️⃣ 고급 단계 (복잡한 스프레드):');
actualSpreads.slice(5).forEach(spread => {
  const completed = completedGuidelines.filter(g => g.id.startsWith(spread.id + '-')).length;
  const remaining = styles.length - completed;
  console.log(`   • ${spread.name}: ${remaining}개 스타일 미완성`);
});

// 현재 상태 요약
const totalCompleted = completedGuidelines.length;
const totalPossible = actualSpreads.length * styles.length;
const remaining = totalPossible - totalCompleted;

console.log('\n📊 현재 상태 요약:');
console.log(`   ✅ 완성: ${totalCompleted}개`);
console.log(`   ❌ 미완성: ${remaining}개`);
console.log(`   📈 전체 진행률: ${Math.round((totalCompleted/totalPossible)*100)}%`);

console.log('\n🏁 최종 검증 완료!');