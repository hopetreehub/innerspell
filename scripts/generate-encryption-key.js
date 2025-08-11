#!/usr/bin/env node

/**
 * 보안 암호화 키 생성 스크립트
 * 실행: node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');

// 32바이트 (256비트) 암호화 키 생성
const encryptionKey = crypto.randomBytes(32).toString('base64');

console.log('🔐 새로운 암호화 키가 생성되었습니다:');
console.log('='.repeat(60));
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);
console.log('='.repeat(60));
console.log('\n⚠️  중요: 이 키를 안전한 곳에 보관하고 .env.local 파일에 추가하세요.');
console.log('⚠️  이 키는 한 번만 생성하고 절대 변경하지 마세요 (기존 데이터 복호화 불가).');
console.log('⚠️  Git에 커밋하지 마세요!');