const https = require('https');
const fs = require('fs');

async function analyzeVercelDeployment() {
  console.log('🔍 VERCEL DEPLOYMENT ANALYSIS');
  
  // Vercel API를 통한 배포 정보 확인
  console.log('📡 1. Vercel 배포 상태 확인...');
  
  try {
    // 공개적으로 접근 가능한 정보만 확인
    const response = await fetch('https://innerspell.vercel.app/api/health');
    console.log(`Vercel API Health: ${response.status}`);
  } catch (error) {
    console.log(`Vercel API 접근 불가: ${error.message}`);
  }
  
  // 로컬과 Vercel의 차이점 분석
  console.log('\\n🔧 2. 로컬 환경 분석...');
  
  const localPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(`로컬 Next.js 버전: ${localPackageJson.dependencies.next}`);
  console.log(`로컬 React 버전: ${localPackageJson.dependencies.react}`);
  
  // 환경변수 차이 확인
  console.log('\\n🌍 3. 환경변수 차이 분석...');
  
  const localEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_FIREBASE_CONFIG',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID'
  ];
  
  const envDifferences = [];
  
  localEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      envDifferences.push(`❌ ${varName}: 설정되지 않음`);
    } else {
      envDifferences.push(`✅ ${varName}: 설정됨 (${value.length}자)`);
    }
  });
  
  console.log('환경변수 상태:');
  envDifferences.forEach(diff => console.log(`  ${diff}`));
  
  // 주요 파일들의 수정 시간 확인
  console.log('\\n📁 4. 주요 파일 수정 시간 확인...');
  
  const importantFiles = [
    './src/app/layout.tsx',
    './src/actions/userActions.ts',
    './package.json',
    './next.config.ts'
  ];
  
  importantFiles.forEach(file => {
    try {
      const stats = fs.statSync(file);
      console.log(`  ${file}: ${stats.mtime.toISOString()}`);
    } catch (error) {
      console.log(`  ${file}: 파일 없음`);
    }
  });
  
  // Git 상태 확인
  console.log('\\n🔄 5. Git 상태 분석...');
  
  const { execSync } = require('child_process');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('변경된 파일들:');
      console.log(gitStatus);
    } else {
      console.log('✅ 모든 변경사항이 커밋됨');
    }
    
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
    console.log(`마지막 커밋: ${lastCommit.trim()}`);
    
  } catch (error) {
    console.log(`Git 상태 확인 실패: ${error.message}`);
  }
  
  console.log('\\n📋 ANALYSIS SUMMARY:');
  console.log('='.repeat(50));
  
  // 문제 진단
  const diagnosis = [];
  
  if (envDifferences.some(diff => diff.includes('❌'))) {
    diagnosis.push('🔧 환경변수 누락으로 인한 기능 제한');
  }
  
  if (fs.existsSync('./src/app/layout.tsx')) {
    const layoutContent = fs.readFileSync('./src/app/layout.tsx', 'utf8');
    if (layoutContent.includes('/* Temporarily disabled dynamic components')) {
      diagnosis.push('⚠️ 동적 컴포넌트가 비활성화되어 있음');
    }
  }
  
  if (diagnosis.length === 0) {
    diagnosis.push('✅ 주요 설정 문제없음');
  }
  
  console.log('진단 결과:');
  diagnosis.forEach(item => console.log(`  ${item}`));
  
  console.log('\\n💡 RECOMMENDATIONS:');
  console.log('1. Vercel에서 정상 작동하는 환경변수 설정 확인');
  console.log('2. 로컬 환경변수를 Vercel과 동기화');
  console.log('3. 동적 컴포넌트 문제가 Vercel에서는 발생하지 않는지 확인');
  console.log('4. Firebase Timestamp 에러 수정사항을 Vercel에 배포');
  
  return {
    hasEnvIssues: envDifferences.some(diff => diff.includes('❌')),
    hasGitChanges: gitStatus && gitStatus.trim() !== '',
    hasDynamicComponents: layoutContent && layoutContent.includes('Temporarily disabled')
  };
}

// 실행
analyzeVercelDeployment()
  .then(result => {
    console.log('\\n🎯 FINAL RECOMMENDATION:');
    if (result.hasEnvIssues || result.hasDynamicComponents) {
      console.log('🔥 SYNC REQUIRED: Vercel과 로컬 환경 동기화 필요');
      console.log('1. Vercel 환경변수를 로컬로 가져오기');
      console.log('2. 또는 수정된 코드를 Vercel에 배포하기');
    } else {
      console.log('✅ ENVIRONMENTS ALIGNED: 환경 동기화 상태 양호');
    }
  })
  .catch(console.error);