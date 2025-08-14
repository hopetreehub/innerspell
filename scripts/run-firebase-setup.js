#!/usr/bin/env node

// Firebase 구조 설정 실행 스크립트
console.log('🔧 Firebase Structure Setup Runner\n');

// 환경 변수 설정
process.env.NODE_ENV = 'production';
process.env.FORCE_DATA_SOURCE = 'firebase';

// TypeScript 지원
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
    moduleResolution: 'node',
    allowJs: true,
    esModuleInterop: true,
    paths: {
      '@/*': ['./src/*']
    }
  }
});

// tsconfig paths 설정
require('tsconfig-paths').register({
  baseUrl: './',
  paths: {
    '@/*': ['./src/*']
  }
});

// Firebase 구조 설정 스크립트 실행
require('./setup-firebase-structure.ts');