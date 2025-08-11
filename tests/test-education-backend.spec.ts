import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { join } from 'path';

test.describe('타로 교육 문의 백엔드 테스트', () => {
  test('교육 상담 신청 폼 제출 및 데이터 저장 확인', async ({ page }) => {
    // 1. 교육 페이지로 이동
    await page.goto('http://localhost:4000/community/tarot-education');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 2. 교육 상담 신청 폼 작성
    // 이름 입력
    await page.fill('input[name="name"]', '김철수');
    
    // 이메일 입력
    await page.fill('input[name="email"]', 'kimcs@example.com');
    
    // 연락처 입력
    await page.fill('input[name="phone"]', '010-5555-6666');
    
    // 관심 과정 선택 (전문가 과정) - RadioGroup 사용
    await page.click('label[for="professional"]');
    
    // 타로 경험 선택 (취미로 공부한 적 있음) - RadioGroup 사용
    await page.click('label[for="hobby"]');
    
    // 수강 목적 입력
    await page.fill('textarea[name="purpose"]', '프로페셔널 타로 리더가 되어 상담소를 운영하고 싶습니다');
    
    // 궁금한 점 입력
    await page.fill('textarea[name="questions"]', '수료 후 실습 기회가 제공되나요?');
    
    // 스크린샷 (폼 작성 완료 상태)
    await page.screenshot({ path: 'test-education-form-filled.png', fullPage: true });
    
    // 3. 상담 신청하기 버튼 클릭
    await page.click('button:has-text("상담 신청하기")');
    
    // 4. 성공 메시지 확인
    const successMessage = page.locator('text=/신청이 완료되었습니다/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 스크린샷 (성공 메시지 표시)
    await page.screenshot({ path: 'test-education-success-message.png', fullPage: true });
    
    // 5. 3초 대기
    await page.waitForTimeout(3000);
    
    // 6. education-inquiries.json 파일 읽기
    const dataPath = join(process.cwd(), 'public', 'data', 'education-inquiries.json');
    let inquiries = [];
    
    try {
      const fileContent = await readFile(dataPath, 'utf-8');
      inquiries = JSON.parse(fileContent);
    } catch (error) {
      console.log('파일을 읽을 수 없습니다. 새로운 파일이 생성될 수 있습니다.');
    }
    
    // 7. 저장된 데이터 확인 및 출력
    console.log('\n=== 저장된 교육 문의 데이터 ===');
    console.log('총 문의 건수:', inquiries.length);
    
    // 최신 문의 찾기 (방금 제출한 것)
    const latestInquiry = inquiries.find(inquiry => 
      inquiry.email === 'kimcs@example.com' && 
      inquiry.name === '김철수'
    );
    
    if (latestInquiry) {
      console.log('\n최신 문의 내용:');
      console.log('- ID:', latestInquiry.id);
      console.log('- 이름:', latestInquiry.name);
      console.log('- 이메일:', latestInquiry.email);
      console.log('- 연락처:', latestInquiry.phone);
      console.log('- 관심 과정:', latestInquiry.course);
      console.log('- 타로 경험:', latestInquiry.experience);
      console.log('- 수강 목적:', latestInquiry.purpose);
      console.log('- 궁금한 점:', latestInquiry.questions);
      console.log('- 생성일시:', latestInquiry.createdAt);
      
      // 데이터 검증
      expect(latestInquiry.name).toBe('김철수');
      expect(latestInquiry.email).toBe('kimcs@example.com');
      expect(latestInquiry.phone).toBe('010-5555-6666');
      expect(latestInquiry.course).toBe('professional');
      expect(latestInquiry.experience).toBe('hobby');
      expect(latestInquiry.purpose).toBe('프로페셔널 타로 리더가 되어 상담소를 운영하고 싶습니다');
      expect(latestInquiry.questions).toBe('수료 후 실습 기회가 제공되나요?');
    } else {
      throw new Error('제출한 문의를 찾을 수 없습니다.');
    }
    
    console.log('\n=== 테스트 완료 ===');
  });
});