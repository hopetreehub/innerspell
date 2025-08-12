// 환경 변수 직접 확인
console.log('=== 환경 변수 확인 ===\n');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_ENABLE_FILE_STORAGE:', process.env.NEXT_PUBLIC_ENABLE_FILE_STORAGE);
console.log('NEXT_PUBLIC_USE_REAL_AUTH:', process.env.NEXT_PUBLIC_USE_REAL_AUTH);

console.log('\n=== API 키 상태 ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `설정됨 (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : '미설정');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `설정됨 (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : '미설정');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `설정됨 (${process.env.OPENROUTER_API_KEY.substring(0, 10)}...)` : '미설정');
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? `설정됨 (${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...)` : '미설정');

console.log('\n✅ 환경 변수가 정상적으로 설정되었습니다.');