const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔥 Firebase Console 직접 접속 - 수동 계정 생성');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Firebase Console Authentication 페이지 직접 접속
        console.log('\n1️⃣ Firebase Console Authentication 사용자 페이지 접속...');
        const firebaseUrl = 'https://console.firebase.google.com/project/innerspell-an7ce/authentication/users';
        console.log(`🌐 접속 URL: ${firebaseUrl}`);
        
        await page.goto(firebaseUrl, {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `firebase-manual-01-users-page-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('✅ Firebase Console 로드 완료');
        console.log('⏳ Google 로그인 및 페이지 로딩 대기 중...');
        await page.waitForTimeout(15000);
        
        await page.screenshot({ 
            path: `firebase-manual-02-after-login-${timestamp}.png`,
            fullPage: true
        });
        
        // 2. 기존 admin@innerspell.com 계정 확인
        console.log('\n2️⃣ 기존 admin@innerspell.com 계정 확인...');
        
        const existingAdmin = page.locator('text="admin@innerspell.com"');
        const adminExists = await existingAdmin.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (adminExists) {
            console.log('✅ admin@innerspell.com 계정이 이미 존재함');
            
            // 계정 클릭하여 상세 정보 확인
            await existingAdmin.click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: `firebase-manual-03-existing-account-${timestamp}.png`,
                fullPage: true
            });
            
            // UID 확인
            const uidElements = await page.locator('span, div, code').all();
            let foundUID = null;
            
            for (const element of uidElements) {
                const text = await element.textContent();
                if (text && text.length === 28 && /^[a-zA-Z0-9]+$/.test(text)) {
                    foundUID = text;
                    break;
                }
            }
            
            if (foundUID) {
                console.log(`🆔 발견된 UID: ${foundUID}`);
                if (foundUID === 'qdrcDKB0snXFawsAiaMNZW3nnRZ2') {
                    console.log('✅ UID가 일치함 - 기존 계정 사용 가능');
                } else {
                    console.log('⚠️ UID가 다름 - 새로운 UID로 권한 재설정 필요');
                    console.log(`새 UID: ${foundUID}`);
                }
            }
            
            // 계정 활성화 상태 확인
            const isDisabled = await page.locator('text="Disabled", text="비활성화"').isVisible({ timeout: 3000 }).catch(() => false);
            
            if (isDisabled) {
                console.log('🔧 계정이 비활성화됨 - 활성화 중...');
                const enableButton = page.locator('button:has-text("Enable"), button:has-text("활성화")');
                if (await enableButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await enableButton.click();
                    console.log('✅ 계정 활성화됨');
                    await page.waitForTimeout(2000);
                }
            } else {
                console.log('✅ 계정이 이미 활성화됨');
            }
            
        } else {
            console.log('❌ admin@innerspell.com 계정이 존재하지 않음');
            console.log('🔧 새 계정 생성 시작...');
            
            // 3. 새 계정 생성
            console.log('\n3️⃣ 새 관리자 계정 생성...');
            
            // "Add user" 버튼 찾기
            const addUserSelectors = [
                'button:has-text("Add user")',
                'button:has-text("사용자 추가")',
                '[data-testid="add-user-button"]',
                'button[aria-label*="Add"]'
            ];
            
            let addUserButton = null;
            for (const selector of addUserSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
                    addUserButton = element;
                    console.log(`✅ "사용자 추가" 버튼 발견: ${selector}`);
                    break;
                }
            }
            
            if (addUserButton) {
                await addUserButton.click();
                console.log('🔄 사용자 추가 버튼 클릭됨');
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: `firebase-manual-04-add-user-dialog-${timestamp}.png`,
                    fullPage: true
                });
                
                // 이메일 입력
                const emailInput = page.locator('input[type="email"], input[name="email"]').first();
                if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await emailInput.fill('admin@innerspell.com');
                    console.log('📧 이메일 입력: admin@innerspell.com');
                }
                
                // 비밀번호 입력
                const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
                if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await passwordInput.fill('admin123');
                    console.log('🔐 비밀번호 입력: admin123');
                }
                
                await page.screenshot({ 
                    path: `firebase-manual-05-form-filled-${timestamp}.png`,
                    fullPage: true
                });
                
                // 계정 생성 버튼 클릭
                const createSelectors = [
                    'button:has-text("Add user")',
                    'button:has-text("Create")',
                    'button:has-text("추가")',
                    'button[type="submit"]'
                ];
                
                let createButton = null;
                for (const selector of createSelectors) {
                    const element = page.locator(selector).first();
                    if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
                        createButton = element;
                        break;
                    }
                }
                
                if (createButton) {
                    await createButton.click();
                    console.log('✅ 계정 생성 버튼 클릭됨');
                    await page.waitForTimeout(5000);
                    
                    await page.screenshot({ 
                        path: `firebase-manual-06-after-creation-${timestamp}.png`,
                        fullPage: true
                    });
                    
                    // 생성된 계정 확인
                    const newAdmin = page.locator('text="admin@innerspell.com"');
                    if (await newAdmin.isVisible({ timeout: 10000 }).catch(() => false)) {
                        console.log('🎉 admin@innerspell.com 계정 생성 성공!');
                        
                        // 새 계정 클릭하여 UID 확인
                        await newAdmin.click();
                        await page.waitForTimeout(3000);
                        
                        await page.screenshot({ 
                            path: `firebase-manual-07-new-account-details-${timestamp}.png`,
                            fullPage: true
                        });
                        
                        // 새 UID 추출
                        const uidElements = await page.locator('span, div, code').all();
                        let newUID = null;
                        
                        for (const element of uidElements) {
                            const text = await element.textContent();
                            if (text && text.length === 28 && /^[a-zA-Z0-9]+$/.test(text)) {
                                newUID = text;
                                break;
                            }
                        }
                        
                        if (newUID) {
                            console.log(`🆔 새 계정 UID: ${newUID}`);
                            console.log('\n🚀 다음 명령어로 관리자 권한을 부여하세요:');
                            console.log(`node setup-admin-final.js ${newUID}`);
                        } else {
                            console.log('⚠️ UID를 자동으로 찾을 수 없음 - 페이지에서 수동으로 복사하세요');
                        }
                        
                    } else {
                        console.log('❌ 계정 생성 실패 또는 확인 불가');
                    }
                    
                } else {
                    console.log('❌ 계정 생성 버튼을 찾을 수 없음');
                }
                
            } else {
                console.log('❌ "사용자 추가" 버튼을 찾을 수 없음');
                console.log('💡 수동으로 Firebase Console에서 다음을 수행하세요:');
                console.log('   1. "Add user" 또는 "사용자 추가" 버튼 클릭');
                console.log('   2. 이메일: admin@innerspell.com');
                console.log('   3. 비밀번호: admin123');
                console.log('   4. "Add user" 버튼으로 계정 생성');
            }
        }
        
        // 4. 최종 안내
        console.log('\n📋 Firebase Console 수동 작업 완료');
        console.log('='.repeat(50));
        console.log('🔧 다음 단계를 수행하세요:');
        console.log('   1. 계정이 생성되었는지 확인');
        console.log('   2. 계정의 UID를 복사');
        console.log('   3. node setup-admin-final.js [UID] 실행');
        console.log('   4. Vercel에서 다시 로그인 테스트');
        console.log('');
        console.log('📧 계정 정보:');
        console.log('   이메일: admin@innerspell.com');
        console.log('   비밀번호: admin123');
        
    } catch (error) {
        console.error('❌ Firebase Console 작업 중 오류:', error.message);
        await page.screenshot({ 
            path: `firebase-manual-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ Firebase Console을 5분간 열어둡니다...');
        console.log('🔍 수동으로 계정 생성을 완료하세요.');
        
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 Firebase Console 작업 완료');
        }, 300000); // 5분
    }
})();