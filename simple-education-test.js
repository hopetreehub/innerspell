const { chromium } = require('playwright');
const { readFileSync } = require('fs');
const { join } = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 교육 페이지로 이동...');
    await page.goto('http://localhost:4000/community/tarot-education');
    await page.waitForLoadState('networkidle');
    console.log('   ✓ 페이지 로드 완료');
    
    console.log('\n2. 폼 작성...');
    // 이름 입력
    await page.fill('input[name="name"]', '김철수');
    console.log('   ✓ 이름 입력');
    
    // 이메일 입력
    await page.fill('input[name="email"]', 'kimcs@example.com');
    console.log('   ✓ 이메일 입력');
    
    // 연락처 입력
    await page.fill('input[name="phone"]', '010-5555-6666');
    console.log('   ✓ 연락처 입력');
    
    // 관심 과정 선택 (전문가 과정)
    await page.click('label[for="professional"]');
    console.log('   ✓ 관심 과정 선택 (전문가 과정)');
    
    // 타로 경험 선택 (취미로 공부한 적 있음)
    await page.click('label[for="hobby"]');
    console.log('   ✓ 타로 경험 선택 (취미로 공부)');
    
    // 수강 목적 입력
    await page.fill('textarea[name="purpose"]', '프로페셔널 타로 리더가 되어 상담소를 운영하고 싶습니다');
    console.log('   ✓ 수강 목적 입력');
    
    // 궁금한 점 입력
    await page.fill('textarea[name="questions"]', '수료 후 실습 기회가 제공되나요?');
    console.log('   ✓ 궁금한 점 입력');
    
    // 스크린샷
    await page.screenshot({ path: 'education-form-filled.png', fullPage: true });
    console.log('   ✓ 폼 작성 스크린샷 저장');
    
    console.log('\n3. 상담 신청하기 버튼 클릭...');
    await page.click('button:has-text("상담 신청하기")');
    
    console.log('\n4. 성공 메시지 확인...');
    await page.waitForSelector('text=/신청이 완료되었습니다/i', { timeout: 5000 });
    console.log('   ✓ 성공 메시지 표시됨');
    
    // 성공 스크린샷
    await page.screenshot({ path: 'education-success.png', fullPage: true });
    console.log('   ✓ 성공 스크린샷 저장');
    
    console.log('\n5. 3초 대기...');
    await page.waitForTimeout(3000);
    
    console.log('\n6. 저장된 데이터 확인...');
    const dataPath = join(process.cwd(), 'data', 'education-inquiries.json');
    let inquiries = [];
    
    try {
      const fileContent = readFileSync(dataPath, 'utf-8');
      inquiries = JSON.parse(fileContent);
      console.log('   ✓ 데이터 파일 읽기 성공');
    } catch (error) {
      console.log('   ! 파일을 읽을 수 없습니다:', error.message);
    }
    
    console.log('\n7. 저장된 데이터 출력...');
    console.log('   총 문의 건수:', inquiries.length);
    
    // 최신 문의 찾기
    const latestInquiry = inquiries.find(inquiry => 
      inquiry.email === 'kimcs@example.com' && 
      inquiry.name === '김철수'
    );
    
    if (latestInquiry) {
      console.log('\n   === 최신 문의 내용 ===');
      console.log('   - ID:', latestInquiry.id);
      console.log('   - 이름:', latestInquiry.name);
      console.log('   - 이메일:', latestInquiry.email);
      console.log('   - 연락처:', latestInquiry.phone);
      console.log('   - 관심 과정:', latestInquiry.course);
      console.log('   - 타로 경험:', latestInquiry.experience);
      console.log('   - 수강 목적:', latestInquiry.purpose);
      console.log('   - 궁금한 점:', latestInquiry.questions);
      console.log('   - 생성일시:', latestInquiry.createdAt);
      console.log('\n   ✓ 데이터가 정상적으로 저장되었습니다!');
    } else {
      console.log('   ! 제출한 문의를 찾을 수 없습니다.');
    }
    
    console.log('\n=== 테스트 완료 ===');
    
    // 브라우저 열어둔 채로 5초 대기
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();