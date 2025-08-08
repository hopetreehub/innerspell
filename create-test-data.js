const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// 테스트 데이터 생성
const testInquiry = {
  id: `inq_${Date.now()}_test123`,
  name: '김철수',
  email: 'kimcs@example.com',
  phone: '010-5555-6666',
  course: 'professional',
  experience: 'hobby',
  purpose: '프로페셔널 타로 리더가 되어 상담소를 운영하고 싶습니다',
  questions: '수료 후 실습 기회가 제공되나요?',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 파일 경로
const dataPath = join(process.cwd(), 'data', 'education-inquiries.json');

try {
  // 기존 데이터 읽기
  let inquiries = [];
  try {
    const fileContent = readFileSync(dataPath, 'utf-8');
    inquiries = JSON.parse(fileContent);
  } catch (e) {
    console.log('기존 파일이 없거나 빈 배열입니다.');
  }
  
  // 새 문의 추가
  inquiries.unshift(testInquiry);
  
  // 파일에 저장
  writeFileSync(dataPath, JSON.stringify(inquiries, null, 2), 'utf-8');
  
  console.log('✅ 테스트 데이터가 생성되었습니다!');
  console.log('\n=== 생성된 데이터 ===');
  console.log(JSON.stringify(testInquiry, null, 2));
  
  console.log('\n총 문의 건수:', inquiries.length);
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}