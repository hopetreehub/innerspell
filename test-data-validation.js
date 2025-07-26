// 타로 지침 데이터 구조 검증
console.log('🔍 타로 지침 데이터 구조 검증 시작...\n');

// 1. 스프레드 데이터 확인
const { TAROT_SPREADS } = require('./src/data/tarot-spreads.ts');
console.log('📊 타로 스프레드 데이터:');
console.log(`   총 ${TAROT_SPREADS.length}개 스프레드`);
TAROT_SPREADS.forEach((spread, index) => {
  console.log(`   ${index + 1}. ${spread.name} (${spread.cardCount}장) - ${spread.difficulty}`);
});
console.log('');

// 2. 해석 스타일 데이터 확인
const { INTERPRETATION_STYLES } = require('./src/data/tarot-spreads.ts');
console.log('🎨 해석 스타일 데이터:');
console.log(`   총 ${INTERPRETATION_STYLES.length}개 스타일`);
INTERPRETATION_STYLES.forEach((style, index) => {
  console.log(`   ${index + 1}. ${style.name} (${style.approach})`);
});
console.log('');

// 3. 타로 지침 데이터 확인
const { TAROT_GUIDELINES } = require('./src/data/tarot-guidelines.ts');
console.log('📚 타로 지침 데이터:');
console.log(`   총 ${TAROT_GUIDELINES.length}개 지침 완성`);
console.log(`   전체 조합 수: ${TAROT_SPREADS.length} × ${INTERPRETATION_STYLES.length} = ${TAROT_SPREADS.length * INTERPRETATION_STYLES.length}`);
console.log(`   완성률: ${Math.round((TAROT_GUIDELINES.length / (TAROT_SPREADS.length * INTERPRETATION_STYLES.length)) * 100)}%`);
console.log('');

TAROT_GUIDELINES.forEach((guideline, index) => {
  const spread = TAROT_SPREADS.find(s => s.id === guideline.spreadId);
  const style = INTERPRETATION_STYLES.find(s => s.id === guideline.styleId);
  console.log(`   ${index + 1}. ${spread?.name} × ${style?.name}`);
  console.log(`      난이도: ${guideline.difficulty}, 소요시간: ${guideline.estimatedTime}분`);
  console.log(`      포지션 지침: ${guideline.positionGuidelines?.length || 0}개`);
  console.log(`      해석 팁: ${guideline.interpretationTips?.length || 0}개`);
  console.log(`      주의사항: ${guideline.commonPitfalls?.length || 0}개`);
  console.log('');
});

// 4. 조합별 특별 지침 확인
const { SPREAD_STYLE_COMBINATIONS } = require('./src/data/tarot-guidelines.ts');
console.log('🔗 조합별 특별 지침:');
console.log(`   총 ${SPREAD_STYLE_COMBINATIONS.length}개 조합 지침`);
SPREAD_STYLE_COMBINATIONS.forEach((combo, index) => {
  const spread = TAROT_SPREADS.find(s => s.id === combo.spreadId);
  const style = INTERPRETATION_STYLES.find(s => s.id === combo.styleId);
  console.log(`   ${index + 1}. ${spread?.name} × ${style?.name}`);
  console.log(`      추천대상: ${combo.recommendedFor?.length || 0}개 그룹`);
  console.log(`      비추천대상: ${combo.notRecommendedFor?.length || 0}개 그룹`);
});
console.log('');

// 5. 데이터 품질 검증
console.log('✅ 데이터 품질 검증:');

let hasErrors = false;

// 지침별 필수 필드 검증
TAROT_GUIDELINES.forEach((guideline, index) => {
  const errors = [];
  
  if (!guideline.spreadId) errors.push('spreadId 누락');
  if (!guideline.styleId) errors.push('styleId 누락'); 
  if (!guideline.name) errors.push('name 누락');
  if (!guideline.description) errors.push('description 누락');
  if (!guideline.positionGuidelines || guideline.positionGuidelines.length === 0) {
    errors.push('positionGuidelines 누락');
  }
  if (!guideline.generalApproach) errors.push('generalApproach 누락');
  
  if (errors.length > 0) {
    console.log(`   ❌ 지침 ${index + 1}: ${errors.join(', ')}`);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('   🎉 모든 지침이 필수 필드를 포함하고 있습니다!');
}

console.log('\n🏁 데이터 구조 검증 완료!');