// 타로 지침 데이터 구조 검증 (ES Module 방식)
import fs from 'fs';
import path from 'path';

console.log('🔍 타로 지침 데이터 구조 검증 시작...\n');

// TypeScript 파일을 읽어서 데이터 추출
function extractDataFromTS(filePath, variableName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // export const 패턴으로 시작하는 배열 찾기
    const regex = new RegExp(`export const ${variableName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
    const match = content.match(regex);
    
    if (match) {
      // 배열 내용을 간단히 파싱 (완전한 파싱은 아니지만 기본 정보 추출 가능)
      const arrayContent = match[1];
      const objectCount = (arrayContent.match(/{\s*id:/g) || []).length;
      return { count: objectCount, content: arrayContent };
    }
    return { count: 0, content: '' };
  } catch (error) {
    console.error(`파일 읽기 오류 (${filePath}):`, error.message);
    return { count: 0, content: '' };
  }
}

// 1. 스프레드 데이터 확인
console.log('📊 타로 스프레드 데이터 분석:');
const spreadsData = extractDataFromTS('./src/data/tarot-spreads.ts', 'TAROT_SPREADS');
console.log(`   총 ${spreadsData.count}개 스프레드 발견`);

// 스프레드 이름들 추출
const spreadNames = [];
const spreadMatches = spreadsData.content.matchAll(/name:\s*'([^']+)'/g);
for (const match of spreadMatches) {
  spreadNames.push(match[1]);
}
spreadNames.forEach((name, index) => {
  console.log(`   ${index + 1}. ${name}`);
});
console.log('');

// 2. 해석 스타일 데이터 확인
console.log('🎨 해석 스타일 데이터 분석:');
const stylesData = extractDataFromTS('./src/data/tarot-spreads.ts', 'INTERPRETATION_STYLES');
console.log(`   총 ${stylesData.count}개 스타일 발견`);

// 스타일 이름들 추출
const styleNames = [];
const styleMatches = stylesData.content.matchAll(/name:\s*'([^']+)'/g);
for (const match of styleMatches) {
  styleNames.push(match[1]);
}
styleNames.forEach((name, index) => {
  console.log(`   ${index + 1}. ${name}`);
});
console.log('');

// 3. 타로 지침 데이터 확인
console.log('📚 타로 지침 데이터 분석:');
const guidelinesData = extractDataFromTS('./src/data/tarot-guidelines.ts', 'TAROT_GUIDELINES');
console.log(`   총 ${guidelinesData.count}개 지침 완성`);

const totalCombinations = spreadsData.count * stylesData.count;
const completionRate = Math.round((guidelinesData.count / totalCombinations) * 100);
console.log(`   전체 조합 수: ${spreadsData.count} × ${stylesData.count} = ${totalCombinations}`);
console.log(`   완성률: ${completionRate}%`);
console.log('');

// 지침 이름들 추출
const guidelineNames = [];
const guidelineMatches = guidelinesData.content.matchAll(/name:\s*'([^']+)'/g);
for (const match of guidelineMatches) {
  guidelineNames.push(match[1]);
}

console.log('완성된 지침 목록:');
guidelineNames.forEach((name, index) => {
  console.log(`   ${index + 1}. ${name}`);
});
console.log('');

// 4. 프로그래스 매트릭스 생성
console.log('📈 스프레드 × 스타일 조합 매트릭스:');
console.log('   (완성된 조합은 ✅, 미완성은 ❌로 표시)\n');

// 간단한 ID 매칭으로 완성 여부 확인
const completedCombinations = new Set();
const idMatches = guidelinesData.content.matchAll(/id:\s*'([^']+)'/g);
for (const match of idMatches) {
  completedCombinations.add(match[1]);
}

// 매트릭스 출력 (간소화된 버전)
console.log('스프레드별 완성 현황:');
const spreadIds = ['past-present-future', 'mind-body-spirit', 'situation-action-outcome', 'cross-spread', 'relationship-spread', 'celtic-cross'];
const styleIds = ['traditional-rws', 'psychological-jungian', 'thoth-crowley', 'intuitive-modern', 'therapeutic-counseling', 'elemental-seasonal'];

spreadIds.forEach((spreadId, index) => {
  let completedCount = 0;
  styleIds.forEach(styleId => {
    const comboId = `${spreadId}-${styleId}`;
    if (completedCombinations.has(comboId)) {
      completedCount++;
    }
  });
  console.log(`   ${spreadNames[index] || spreadId}: ${completedCount}/${styleIds.length} (${Math.round((completedCount/styleIds.length)*100)}%)`);
});

console.log('');

// 5. 다음 단계 권장사항
console.log('🎯 다음 단계 권장사항:');
if (completionRate < 100) {
  console.log(`   • ${totalCombinations - guidelinesData.count}개 지침이 더 필요합니다`);
  console.log('   • 우선순위: 기본 스프레드(과거-현재-미래, 상황-행동-결과)의 모든 스타일 완성');
  console.log('   • 중급 단계: 십자가 스프레드와 정신-몸-영혼 스프레드 완성');
  console.log('   • 고급 단계: 관계 스프레드와 켈틱 크로스 완성');
} else {
  console.log('   🎉 모든 조합이 완성되었습니다!');
  console.log('   • 지침 품질 검토 및 개선');
  console.log('   • 실제 사용자 테스트 진행');
  console.log('   • 고급 기능 추가 (예시 리딩, 템플릿 등)');
}

console.log('\n🏁 데이터 구조 검증 완료!');