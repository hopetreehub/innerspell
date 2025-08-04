const fs = require('fs');
const path = require('path');

// package.json 읽기
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('📦 의존성 분석\n');

// 사용하지 않을 수 있는 의존성들
const suspiciousDeps = {
  // AI/ML 관련 (Genkit 등)
  ai: [
    '@genkit-ai/firebase',
    '@genkit-ai/googleai', 
    '@genkit-ai/next',
    'genkit',
    'genkitx-anthropic',
    'genkitx-openai',
    'genkit-cli'
  ],
  
  // 테스트 관련 (현재 사용하지 않음)
  testing: [
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    '@types/jest',
    'jest',
    'jest-environment-jsdom'
  ],
  
  // 개발 도구 (필요에 따라)
  devTools: [
    '@next/bundle-analyzer',
    '@opentelemetry/exporter-jaeger',
    '@opentelemetry/winston-transport',
    'lighthouse',
    'chrome-launcher',
    'audit-ci',
    'puppeteer'
  ],
  
  // 미디어/파일 처리
  media: [
    'browser-image-compression',
    'wav',
    '@types/wav'
  ],
  
  // 알림/푸시
  notifications: [
    'web-push',
    '@types/web-push'
  ],
  
  // MDX (블로그에서 사용 중일 수 있음)
  mdx: [
    '@mdx-js/loader',
    '@mdx-js/react', 
    '@next/mdx',
    'mdx-components',
    'next-mdx-remote',
    'react-markdown',
    'remark-gfm',
    'rehype-highlight',
    'gray-matter'
  ],
  
  // 기타
  others: [
    '@delorenj/taskmaster',
    'critters',
    'node-fetch',
    'nodemailer',
    '@types/nodemailer',
    'patch-package',
    'dotenv'
  ]
};

console.log('🔍 잠재적으로 불필요한 의존성들:\n');

Object.entries(suspiciousDeps).forEach(([category, deps]) => {
  console.log(`📂 ${category.toUpperCase()}:`);
  deps.forEach(dep => {
    const isDev = packageJson.devDependencies && packageJson.devDependencies[dep];
    const isProd = packageJson.dependencies && packageJson.dependencies[dep];
    
    if (isDev || isProd) {
      console.log(`  ❓ ${dep} ${isDev ? '(dev)' : '(prod)'}`);
    }
  });
  console.log('');
});

// 필수 의존성들
const essentialDeps = [
  'next',
  'react',
  'react-dom',
  'typescript',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'tailwindcss',
  'postcss',
  'firebase',
  'firebase-admin',
  'lucide-react',
  'framer-motion',
  'zod'
];

console.log('✅ 필수 의존성들:');
essentialDeps.forEach(dep => {
  const isDev = packageJson.devDependencies && packageJson.devDependencies[dep];
  const isProd = packageJson.dependencies && packageJson.dependencies[dep];
  
  if (isDev || isProd) {
    console.log(`  ✓ ${dep} ${isDev ? '(dev)' : '(prod)'}`);
  }
});

console.log('\n📊 의존성 통계:');
console.log(`  - 프로덕션 의존성: ${Object.keys(packageJson.dependencies).length}개`);
console.log(`  - 개발 의존성: ${Object.keys(packageJson.devDependencies).length}개`);
console.log(`  - 총 의존성: ${Object.keys(packageJson.dependencies).length + Object.keys(packageJson.devDependencies).length}개`);