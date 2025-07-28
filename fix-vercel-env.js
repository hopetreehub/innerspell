const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🚨 Vercel 환경변수 긴급 수정 - Firebase 설정 복구');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Firebase 환경변수 정보
    const firebaseEnvVars = {
        'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyDgZBb3PEMFe58TxXFyeEAh6pzpeG_P9lg',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'innerspell-an7ce.firebaseapp.com',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'innerspell-an7ce',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'innerspell-an7ce.firebasestorage.app',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '944680989471',
        'NEXT_PUBLIC_FIREBASE_APP_ID': '1:944680989471:web:bc817b811a6033017f362a'
    };
    
    try {
        // 1. Vercel 프로젝트 설정 페이지 접속
        console.log('\n1️⃣ Vercel 프로젝트 설정 페이지 접속...');
        const vercelSettingsUrl = 'https://vercel.com/johnsprojects/test-studio-firebase/settings/environment-variables';
        console.log(`🌐 접속 URL: ${vercelSettingsUrl}`);
        
        await page.goto(vercelSettingsUrl, {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `vercel-env-01-settings-page-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('✅ Vercel 설정 페이지 로드 완료');
        console.log('⏳ 로그인 및 페이지 로딩 대기...');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
            path: `vercel-env-02-after-login-${timestamp}.png`,
            fullPage: true
        });
        
        // 2. 기존 Firebase 환경변수 확인
        console.log('\n2️⃣ 기존 Firebase 환경변수 확인...');
        
        const existingVars = await page.evaluate(() => {
            const vars = [];
            const elements = document.querySelectorAll('[data-testid], .env-var, .variable');
            elements.forEach(el => {
                const text = el.textContent;
                if (text && text.includes('FIREBASE')) {
                    vars.push(text.trim());
                }
            });
            return vars;
        });
        
        console.log('📋 기존 Firebase 환경변수:', existingVars);
        
        // 3. 환경변수 추가 안내
        console.log('\n3️⃣ Firebase 환경변수 수동 추가 안내');
        console.log('=' .repeat(80));
        console.log('🔧 다음 환경변수들을 Vercel Dashboard에 추가하세요:');
        console.log('');
        
        Object.entries(firebaseEnvVars).forEach(([key, value], index) => {
            console.log(`${index + 1}. ${key}`);
            console.log(`   Value: ${value}`);
            console.log(`   Environment: Production, Preview, Development (모두 선택)`);
            console.log('');
        });
        
        console.log('=' .repeat(80));
        
        // 4. 환경변수 추가 버튼 찾기 및 강조
        console.log('\n4️⃣ 환경변수 추가 버튼 강조...');
        
        // "Add" 또는 "Add New" 버튼 강조
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, a');
            buttons.forEach(button => {
                const text = button.textContent || button.innerText;
                if (text && (text.includes('Add') || text.includes('New') || text.includes('Environment'))) {
                    button.style.border = '3px solid red';
                    button.style.backgroundColor = 'yellow';
                    button.style.fontSize = '18px';
                    button.scrollIntoView();
                }
            });
        });
        
        await page.screenshot({ 
            path: `vercel-env-03-add-button-highlighted-${timestamp}.png`,
            fullPage: true
        });
        
        // 5. 자동 추가 시도 (가능한 경우)
        console.log('\n5️⃣ 환경변수 자동 추가 시도...');
        
        let addedCount = 0;
        
        for (const [key, value] of Object.entries(firebaseEnvVars)) {
            try {
                console.log(`\n🔄 ${key} 추가 시도...`);
                
                // "Add" 버튼 찾기
                const addButtons = [
                    'button:has-text("Add")',
                    'button:has-text("Add New")',
                    'button:has-text("Add Environment Variable")',
                    '[data-testid="add-env-var"]'
                ];
                
                let addButton = null;
                for (const selector of addButtons) {
                    const element = page.locator(selector).first();
                    if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
                        addButton = element;
                        break;
                    }
                }
                
                if (addButton) {
                    await addButton.click();
                    await page.waitForTimeout(2000);
                    
                    // 이름 입력
                    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="key" i]').first();
                    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await nameInput.fill(key);
                        console.log(`   📝 이름 입력: ${key}`);
                    }
                    
                    // 값 입력
                    const valueInput = page.locator('input[name="value"], textarea[name="value"], input[placeholder*="value" i]').first();
                    if (await valueInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await valueInput.fill(value);
                        console.log(`   💾 값 입력: ${value.substring(0, 20)}...`);
                    }
                    
                    // 환경 선택 (모든 환경)
                    const prodCheckbox = page.locator('input[value="production"], [data-testid="production"]').first();
                    if (await prodCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await prodCheckbox.check();
                    }
                    
                    const previewCheckbox = page.locator('input[value="preview"], [data-testid="preview"]').first();
                    if (await previewCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await previewCheckbox.check();
                    }
                    
                    const devCheckbox = page.locator('input[value="development"], [data-testid="development"]').first();
                    if (await devCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await devCheckbox.check();
                    }
                    
                    // 저장 버튼 클릭
                    const saveButton = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first();
                    if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                        await saveButton.click();
                        console.log(`   ✅ ${key} 저장됨`);
                        addedCount++;
                        await page.waitForTimeout(2000);
                    }
                    
                } else {
                    console.log(`   ⚠️ ${key} - Add 버튼을 찾을 수 없음`);
                }
                
            } catch (error) {
                console.log(`   ❌ ${key} 추가 실패: ${error.message}`);
            }
        }
        
        await page.screenshot({ 
            path: `vercel-env-04-after-adding-${timestamp}.png`,
            fullPage: true
        });
        
        console.log(`\n📊 자동 추가 결과: ${addedCount}/${Object.keys(firebaseEnvVars).length}개 성공`);
        
        // 6. 재배포 트리거 안내
        console.log('\n6️⃣ 재배포 트리거 방법 안내');
        console.log('=' .repeat(60));
        console.log('🚀 환경변수 추가 완료 후 다음 명령어로 재배포하세요:');
        console.log('');
        console.log('git commit --allow-empty -m "trigger vercel redeploy with firebase env vars"');
        console.log('git push');
        console.log('');
        console.log('또는 Vercel Dashboard에서 "Redeploy" 버튼 클릭');
        console.log('=' .repeat(60));
        
        // 7. 검증 명령어 안내
        console.log('\n7️⃣ 배포 완료 후 검증 방법');
        console.log('⏳ 5-10분 후 다음 명령어로 검증:');
        console.log('node complete-admin-verification.js');
        
        console.log('\n📋 Vercel 환경변수 수정 작업 안내 완료');
        console.log('🔧 수동으로 누락된 환경변수들을 추가하세요.');
        
    } catch (error) {
        console.error('❌ Vercel 환경변수 수정 중 오류:', error.message);
        await page.screenshot({ 
            path: `vercel-env-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ Vercel Dashboard를 5분간 열어둡니다...');
        console.log('🔍 환경변수 추가 작업을 완료하세요.');
        
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 Vercel 환경변수 수정 작업 완료');
        }, 300000); // 5분
    }
})();