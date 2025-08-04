const fs = require('fs');

// package.json 읽기
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('🗑️  불필요한 의존성 제거\n');

// 확실히 사용하지 않는 의존성들
const unusedDeps = {
  dependencies: [
    '@delorenj/taskmaster',  // 사용하지 않음
    'wav',                   // 오디오 처리 - 사용하지 않음
    'critters',             // CSS 인라인 최적화 - 과도한 최적화
    'dotenv',               // Next.js에서 자동 처리
    'patch-package'         // 패치 없음
  ],
  devDependencies: [
    '@types/wav',
    '@testing-library/jest-dom',      // 테스트 코드 없음
    '@testing-library/react',         // 테스트 코드 없음  
    '@testing-library/user-event',    // 테스트 코드 없음
    '@types/jest',                    // 테스트 코드 없음
    'jest',                           // 테스트 코드 없음
    'jest-environment-jsdom',         // 테스트 코드 없음
    '@opentelemetry/exporter-jaeger', // 복잡한 모니터링 - 과도한 설정
    'lighthouse',                     // 수동 성능 측정 - 개발에서 불필요
    'chrome-launcher',                // lighthouse 의존성
    'audit-ci'                        // CI에서 사용하지 않음
  ]
};

// 제거 실행
console.log('제거할 의존성들:');

unusedDeps.dependencies.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    console.log(`  ✅ ${dep} (prod) 제거됨`);
  }
});

unusedDeps.devDependencies.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
    console.log(`  ✅ ${dep} (dev) 제거됨`);
  }
});

// package.json 저장
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('\n📦 정리된 의존성 통계:');
console.log(`  - 프로덕션 의존성: ${Object.keys(packageJson.dependencies).length}개`);
console.log(`  - 개발 의존성: ${Object.keys(packageJson.devDependencies).length}개`);
console.log(`  - 총 의존성: ${Object.keys(packageJson.dependencies).length + Object.keys(packageJson.devDependencies).length}개`);

console.log('\n⚠️  다음 단계: npm install을 실행하여 의존성을 업데이트하세요');