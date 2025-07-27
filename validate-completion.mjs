import { TAROT_SPREADS, INTERPRETATION_STYLES } from './src/data/tarot-spreads.js';
import { TAROT_GUIDELINES } from './src/data/tarot-guidelines.js';

console.log('🔍 타로 지침 완성도 검증');
console.log('==========================================');

// 스프레드 및 스타일 개수
console.log(`📊 기본 구성:`);
console.log(`   • 스프레드: ${TAROT_SPREADS.length}개`);
console.log(`   • 해석 스타일: ${INTERPRETATION_STYLES.length}개`);
console.log(`   • 총 가능 조합: ${TAROT_SPREADS.length * INTERPRETATION_STYLES.length}개`);
console.log(`   • 현재 지침: ${TAROT_GUIDELINES.length}개`);

// 완성도 계산
const totalCombinations = TAROT_SPREADS.length * INTERPRETATION_STYLES.length;
const completionRate = Math.round((TAROT_GUIDELINES.length / totalCombinations) * 100);

console.log(`\n🎯 완성도: ${completionRate}% (${TAROT_GUIDELINES.length}/${totalCombinations})`);

// 스프레드별 완성도 검사
console.log(`\n📋 스프레드별 완성도:`);
TAROT_SPREADS.forEach(spread => {
  const spreadGuidelines = TAROT_GUIDELINES.filter(g => g.spreadId === spread.id);
  const spreadCompletion = Math.round((spreadGuidelines.length / INTERPRETATION_STYLES.length) * 100);
  console.log(`   • ${spread.name}: ${spreadCompletion}% (${spreadGuidelines.length}/${INTERPRETATION_STYLES.length})`);
});

// 해석 스타일별 완성도 검사
console.log(`\n🎨 해석 스타일별 완성도:`);
INTERPRETATION_STYLES.forEach(style => {
  const styleGuidelines = TAROT_GUIDELINES.filter(g => g.styleId === style.id);
  const styleCompletion = Math.round((styleGuidelines.length / TAROT_SPREADS.length) * 100);
  console.log(`   • ${style.name}: ${styleCompletion}% (${styleGuidelines.length}/${TAROT_SPREADS.length})`);
});

// 누락된 조합 찾기
console.log(`\n🔍 누락된 조합 검사:`);
const missingCombinations = [];
TAROT_SPREADS.forEach(spread => {
  INTERPRETATION_STYLES.forEach(style => {
    const exists = TAROT_GUIDELINES.some(g => g.spreadId === spread.id && g.styleId === style.id);
    if (!exists) {
      missingCombinations.push(`${spread.name} × ${style.name}`);
    }
  });
});

if (missingCombinations.length === 0) {
  console.log(`   ✅ 모든 조합이 완성되었습니다!`);
} else {
  console.log(`   ❌ 누락된 조합 (${missingCombinations.length}개):`);
  missingCombinations.forEach(combo => {
    console.log(`      - ${combo}`);
  });
}

console.log(`\n🏆 결과: ${completionRate === 100 ? '완벽 완성!' : '미완성'}`);