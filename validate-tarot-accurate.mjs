// 타로 지침 데이터 정확한 검증
import fs from 'fs';

console.log('🔍 타로 지침 시스템 정확한 데이터 검증\n');

// 1. 스프레드 데이터 정확히 분석
console.log('📊 타로 스프레드 정확한 분석:');
const spreadsContent = fs.readFileSync('./src/data/tarot-spreads.ts', 'utf8');

// TAROT_SPREADS 배열에서 실제 스프레드 객체만 추출
const spreadsMatch = spreadsContent.match(/export const TAROT_SPREADS[^=]*=\s*\[([\s\S]*?)\];/);
if (spreadsMatch) {
  const spreadsArray = spreadsMatch[1];
  // 각 스프레드는 고유한 id를 가지고 있음
  const spreadIds = [...spreadsArray.matchAll(/{\s*id:\s*'([^']+)'/g)].map(m => m[1]);
  const spreadNames = [...spreadsArray.matchAll(/name:\s*'([^']+)'/g)];
  
  console.log(`   실제 스프레드 수: ${spreadIds.length}개`);
  spreadIds.forEach((id, index) => {
    const name = spreadNames[index]?.[1] || id;
    console.log(`   ${index + 1}. ${id} - ${name}`);
  });
  console.log('');
}

// 2. 해석 스타일 정확히 분석  
console.log('🎨 해석 스타일 정확한 분석:');
const stylesMatch = spreadsContent.match(/export const INTERPRETATION_STYLES[^=]*=\s*\[([\s\S]*?)\];/);
if (stylesMatch) {
  const stylesArray = stylesMatch[1];
  const styleIds = [...stylesArray.matchAll(/{\s*id:\s*'([^']+)'/g)].map(m => m[1]);
  const styleNames = [...stylesArray.matchAll(/name:\s*'([^']+)'/g)];
  
  console.log(`   실제 해석 스타일 수: ${styleIds.length}개`);
  styleIds.forEach((id, index) => {
    const name = styleNames[index]?.[1] || id;
    console.log(`   ${index + 1}. ${id} - ${name}`);
  });
  console.log('');
  
  // 3. 타로 지침 정확히 분석
  console.log('📚 타로 지침 정확한 분석:');
  const guidelinesContent = fs.readFileSync('./src/data/tarot-guidelines.ts', 'utf8');
  const guidelinesMatch = guidelinesContent.match(/export const TAROT_GUIDELINES[^=]*=\s*\[([\s\S]*?)\];/);
  
  if (guidelinesMatch) {
    const guidelinesArray = guidelinesMatch[1];
    const guidelineIds = [...guidelinesArray.matchAll(/{\s*id:\s*'([^']+)'/g)].map(m => m[1]);
    const guidelineNames = [...guidelinesArray.matchAll(/name:\s*'([^']+)'/g)];
    
    console.log(`   실제 완성된 지침 수: ${guidelineIds.length}개`);
    const totalCombinations = spreadIds.length * styleIds.length;
    const completionRate = Math.round((guidelineIds.length / totalCombinations) * 100);
    console.log(`   총 가능한 조합: ${spreadIds.length} × ${styleIds.length} = ${totalCombinations}`);
    console.log(`   완성률: ${completionRate}%`);
    console.log('');
    
    // 완성된 지침들 상세 분석
    console.log('완성된 지침 목록:');
    guidelineIds.forEach((id, index) => {
      const name = guidelineNames[index]?.[1] || id;
      console.log(`   ${index + 1}. ${id}`);
      console.log(`      이름: ${name}`);
    });
    console.log('');
    
    // 스프레드별 완성 현황
    console.log('📈 스프레드별 완성 현황:');
    spreadIds.forEach(spreadId => {
      const matchingGuidelines = guidelineIds.filter(gId => gId.startsWith(spreadId + '-'));
      const completedStyles = matchingGuidelines.length;
      const spreadName = spreadNames.find(([_, name], i) => spreadIds[i] === spreadId)?.[1] || spreadId;
      console.log(`   ${spreadName}: ${completedStyles}/${styleIds.length} (${Math.round((completedStyles/styleIds.length)*100)}%)`);
      
      if (completedStyles > 0) {
        matchingGuidelines.forEach(gId => {
          const styleId = gId.replace(spreadId + '-', '');
          const styleName = styleNames.find(([_, name], i) => styleIds[i] === styleId)?.[1] || styleId;
          console.log(`     ✅ ${styleName}`);
        });
      }
    });
    console.log('');
    
    // 미완성 조합 분석
    console.log('🎯 미완성 조합 분석:');
    let missingCount = 0;
    spreadIds.forEach(spreadId => {
      styleIds.forEach(styleId => {
        const comboId = `${spreadId}-${styleId}`;
        if (!guidelineIds.includes(comboId)) {
          missingCount++;
          if (missingCount <= 10) { // 처음 10개만 표시
            const spreadName = spreadNames.find(([_, name], i) => spreadIds[i] === spreadId)?.[1] || spreadId;
            const styleName = styleNames.find(([_, name], i) => styleIds[i] === styleId)?.[1] || styleId;
            console.log(`   ❌ ${spreadName} × ${styleName}`);
          }
        }
      });
    });
    
    if (missingCount > 10) {
      console.log(`   ... 총 ${missingCount}개 조합이 미완성`);
    }
    console.log('');
    
    // 우선순위 권장사항
    console.log('🚀 다음 작업 우선순위:');
    console.log('   1. 기본 스프레드 완성:');
    console.log('      • 삼위일체 (과거-현재-미래) - 3/6 완성');
    console.log('      • 상황-행동-결과 - 3/6 완성');
    console.log('   2. 중급 스프레드:');
    console.log('      • 정신-몸-영혼 - 2/6 완성');
    console.log('      • 십자가 스프레드 - 0/6 완성');
    console.log('   3. 고급 스프레드:');
    console.log('      • 관계 스프레드 - 1/6 완성');
    console.log('      • 켈틱 크로스 - 0/6 완성');
  }
}

console.log('\n🏁 정확한 데이터 검증 완료!');