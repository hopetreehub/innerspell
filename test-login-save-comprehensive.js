const { chromium } = require('playwright');
const path = require('path');

async function testLoginAndSaveComprehensive() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('=== 1단계: 로그인 페이지에서 관리자 로그인 버튼 확인 ===');
    await page.goto('https://test-studio-firebase.vercel.app/sign-in', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'comprehensive-01-signin-page.png'),
      fullPage: true 
    });

    // 관리자 로그인 버튼 찾기
    const adminLoginBtn = await page.locator('button:has-text("관리자로 로그인")').first();
    const isAdminBtnVisible = await adminLoginBtn.isVisible().catch(() => false);
    console.log(`관리자 로그인 버튼 표시: ${isAdminBtnVisible}`);

    if (!isAdminBtnVisible) {
      console.log('관리자 로그인 버튼이 아직 보이지 않습니다. 페이지 새로고침...');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'comprehensive-01b-signin-after-refresh.png'),
        fullPage: true 
      });
    }

    console.log('=== 2단계: 관리자 로그인 실행 ===');
    const adminBtn = await page.locator('button:has-text("관리자로 로그인")').first();
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
      console.log('관리자 로그인 버튼 클릭');
      await page.waitForTimeout(5000); // 로그인 처리 대기
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'comprehensive-02-after-login.png'),
        fullPage: true 
      });
    } else {
      console.log('❌ 관리자 로그인 버튼을 찾을 수 없습니다.');
      return;
    }

    console.log('=== 3단계: 로그인 상태 확인 및 타로리딩 페이지 이동 ===');
    // 타로리딩 페이지로 이동
    await page.click('text=타로리딩');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'comprehensive-03-reading-logged-in.png'),
      fullPage: true 
    });

    console.log('=== 4단계: 타로 카드 선택 ===');
    // 카드 덱 클릭하여 카드 선택 시작
    const deckCard = await page.locator('.cursor-pointer').first();
    if (await deckCard.isVisible()) {
      await deckCard.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'comprehensive-04-cards-spread.png'),
        fullPage: true 
      });

      // 개별 카드 3장 선택
      const individualCards = await page.locator('.cursor-pointer img[alt*="카드"]').all();
      console.log(`개별 카드 발견: ${individualCards.length}개`);
      
      if (individualCards.length >= 3) {
        for (let i = 0; i < 3; i++) {
          await individualCards[i].click();
          await page.waitForTimeout(1000);
          console.log(`카드 ${i + 1} 선택 완료`);
        }
        
        await page.screenshot({ 
          path: path.join(__dirname, 'screenshots', 'comprehensive-05-cards-selected.png'),
          fullPage: true 
        });
      }
    }

    console.log('=== 5단계: 리딩 보기 버튼 클릭 ===');
    const readingButton = await page.locator('button:has-text("리딩 보기")').first();
    if (await readingButton.isVisible()) {
      await readingButton.click();
      console.log('리딩 보기 버튼 클릭');
      await page.waitForTimeout(8000); // AI 응답 대기
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'comprehensive-06-reading-result.png'),
        fullPage: true 
      });
    }

    console.log('=== 6단계: 저장 버튼 찾기 및 클릭 ===');
    // 페이지의 모든 버튼 확인
    const allButtons = await page.locator('button').all();
    console.log(`페이지의 전체 버튼 수: ${allButtons.length}`);
    
    let saveButton = null;
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const isVisible = await allButtons[i].isVisible();
      console.log(`버튼 ${i}: "${text}" (visible: ${isVisible})`);
      
      if (text && (text.includes('저장') || text.includes('Save'))) {
        saveButton = allButtons[i];
        console.log(`✅ 저장 버튼 발견: "${text}"`);
        break;
      }
    }

    if (saveButton) {
      console.log('저장 버튼 클릭 중...');
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(__dirname, 'screenshots', 'comprehensive-07-after-save.png'),
        fullPage: true 
      });

      // 성공 메시지 확인
      const toastMessages = await page.locator('[data-sonner-toast], [role="alert"], .toast').all();
      for (const toast of toastMessages) {
        const toastText = await toast.textContent();
        if (toastText) {
          console.log(`📢 알림 메시지: ${toastText}`);
        }
      }
    } else {
      console.log('❌ 저장 버튼을 찾을 수 없습니다.');
    }

    console.log('=== 7단계: 대시보드에서 저장된 리딩 확인 ===');
    await page.click('text=대시보드');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'comprehensive-08-dashboard.png'),
      fullPage: true 
    });

    // 저장된 리딩 확인
    const recentReadingsSection = await page.locator('h3:has-text("최근 리딩")').isVisible().catch(() => false);
    console.log(`최근 리딩 섹션 표시: ${recentReadingsSection}`);
    
    if (recentReadingsSection) {
      const readingCards = await page.locator('.p-4.border, .border.rounded').all();
      console.log(`저장된 리딩 카드 수: ${readingCards.length}`);
      
      for (let i = 0; i < Math.min(readingCards.length, 3); i++) {
        const cardText = await readingCards[i].textContent();
        console.log(`리딩 카드 ${i + 1}: ${cardText?.substring(0, 100)}...`);
      }
    }

    console.log('=== 테스트 완료 ===');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'screenshots', 'comprehensive-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testLoginAndSaveComprehensive();