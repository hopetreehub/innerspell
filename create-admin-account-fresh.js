const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log('🔥 Firebase Console에서 관리자 계정 새로 생성');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        // 1. Firebase Authentication 사용자 페이지 접속
        console.log('\n1️⃣ Firebase Authentication 사용자 페이지 접속...');
        await page.goto('https://console.firebase.google.com/project/innerspell-an7ce/authentication/users', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        
        await page.screenshot({ 
            path: `create-admin-fresh-01-users-page-${timestamp}.png`,
            fullPage: true
        });
        
        console.log('⏳ Firebase Console 로그인 및 페이지 로딩 대기...');
        await page.waitForTimeout(15000);
        
        // 2. 기존 admin@innerspell.com 계정 확인 및 삭제
        console.log('\n2️⃣ 기존 admin@innerspell.com 계정 확인...');
        
        const existingAdmin = page.locator('text="admin@innerspell.com"');
        if (await existingAdmin.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('🗑️ 기존 admin@innerspell.com 계정 발견 - 삭제 중...');
            
            // 계정 클릭
            await existingAdmin.click();
            await page.waitForTimeout(2000);
            
            // 삭제 버튼 찾기
            const deleteButton = page.locator('button:has-text("Delete"), button:has-text("삭제"), [aria-label="Delete user"]');
            if (await deleteButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
                await deleteButton.first().click();
                await page.waitForTimeout(1000);
                
                // 삭제 확인
                const confirmDelete = page.locator('button:has-text("Delete"), button:has-text("확인")');
                if (await confirmDelete.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                    await confirmDelete.first().click();
                    console.log('✅ 기존 계정 삭제됨');
                    await page.waitForTimeout(3000);
                }
            }
        } else {
            console.log('📝 기존 admin@innerspell.com 계정 없음');
        }
        
        // 3. 새 사용자 추가
        console.log('\n3️⃣ 새 관리자 계정 생성...');
        
        // "사용자 추가" 버튼 찾기
        const addUserButton = page.locator('button:has-text("사용자 추가"), button:has-text("Add user"), [data-testid="add-user-button"]');
        
        if (await addUserButton.first().isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log('✅ "사용자 추가" 버튼 발견');
            await addUserButton.first().click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: `create-admin-fresh-02-add-user-dialog-${timestamp}.png`,
                fullPage: true
            });
            
            // 이메일 입력 필드 찾기
            const emailFields = [
                'input[type="email"]',
                'input[name="email"]',
                'input[placeholder*="email" i]',
                'input[placeholder*="이메일"]',
                '[data-testid="email-input"]'
            ];
            
            let emailFieldFound = false;
            for (const selector of emailFields) {
                const emailField = page.locator(selector);
                if (await emailField.first().isVisible({ timeout: 2000 }).catch(() => false)) {
                    await emailField.first().fill('admin@innerspell.com');
                    console.log('📧 이메일 입력: admin@innerspell.com');
                    emailFieldFound = true;
                    break;
                }
            }
            
            if (!emailFieldFound) {
                console.log('⚠️ 이메일 입력 필드를 찾을 수 없음 - 수동으로 입력해주세요');
            }
            
            // 비밀번호 입력 필드 찾기
            const passwordFields = [
                'input[type="password"]',
                'input[name="password"]',
                'input[placeholder*="password" i]',
                'input[placeholder*="비밀번호"]',
                '[data-testid="password-input"]'
            ];
            
            let passwordFieldFound = false;
            for (const selector of passwordFields) {
                const passwordField = page.locator(selector);
                if (await passwordField.first().isVisible({ timeout: 2000 }).catch(() => false)) {
                    await passwordField.first().fill('admin123');
                    console.log('🔐 비밀번호 입력: admin123');
                    passwordFieldFound = true;
                    break;
                }
            }
            
            if (!passwordFieldFound) {
                console.log('⚠️ 비밀번호 입력 필드를 찾을 수 없음 - 수동으로 입력해주세요');
            }
            
            await page.screenshot({ 
                path: `create-admin-fresh-03-form-filled-${timestamp}.png`,
                fullPage: true
            });
            
            // 사용자 추가 버튼 클릭
            const createButtons = [
                'button:has-text("사용자 추가")',
                'button:has-text("Add user")',
                'button:has-text("추가")',
                'button:has-text("Create")',
                'button[type="submit"]',
                '[data-testid="create-user-button"]'
            ];
            
            let userCreated = false;
            for (const selector of createButtons) {
                const createButton = page.locator(selector);
                if (await createButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
                    await createButton.first().click();
                    console.log('✅ 사용자 생성 버튼 클릭');
                    userCreated = true;
                    await page.waitForTimeout(5000);
                    break;
                }
            }
            
            if (!userCreated) {
                console.log('⚠️ 사용자 생성 버튼을 찾을 수 없음 - 수동으로 클릭해주세요');
            }
            
            await page.screenshot({ 
                path: `create-admin-fresh-04-after-creation-${timestamp}.png`,
                fullPage: true
            });
            
            // 4. 생성된 사용자 확인
            console.log('\n4️⃣ 생성된 관리자 계정 확인...');
            
            await page.waitForTimeout(3000);
            
            const newAdminUser = page.locator('text="admin@innerspell.com"');
            if (await newAdminUser.isVisible({ timeout: 10000 }).catch(() => false)) {
                console.log('🎉 admin@innerspell.com 계정 생성 성공!');
                
                // 새로 생성된 사용자 클릭하여 UID 확인
                await newAdminUser.click();
                await page.waitForTimeout(3000);
                
                await page.screenshot({ 
                    path: `create-admin-fresh-05-user-details-${timestamp}.png`,
                    fullPage: true
                });
                
                // UID 추출 시도
                const uidElements = await page.locator('text=/^[a-zA-Z0-9]{28}$/, code, [data-testid*="uid"]').all();
                let newUID = null;
                
                for (const element of uidElements) {
                    const text = await element.textContent();
                    if (text && text.length === 28 && /^[a-zA-Z0-9]+$/.test(text)) {
                        newUID = text;
                        break;
                    }
                }
                
                if (newUID) {
                    console.log(`🆔 새 UID 발견: ${newUID}`);
                    
                    // 5. Firestore에 관리자 권한 설정
                    console.log('\n5️⃣ 새 계정에 관리자 권한 부여...');
                    
                    // 새 창에서 Node.js 스크립트 실행을 위해 UID 출력
                    console.log(`\n🚀 다음 명령어로 관리자 권한 부여:`);
                    console.log(`node setup-admin-final.js ${newUID}`);
                    
                } else {
                    console.log('⚠️ UID를 자동으로 찾을 수 없음');
                    console.log('💡 페이지에서 UID를 수동으로 복사하여 다음 명령어 실행:');
                    console.log('node setup-admin-final.js [복사한_UID]');
                }
                
            } else {
                console.log('❌ admin@innerspell.com 계정 생성 실패');
                console.log('💡 수동으로 계정을 생성해주세요:');
                console.log('   이메일: admin@innerspell.com');
                console.log('   비밀번호: admin123');
            }
            
        } else {
            console.log('❌ "사용자 추가" 버튼을 찾을 수 없음');
            console.log('💡 Firebase Console에서 수동으로 사용자를 추가해주세요');
        }
        
        console.log('\n📋 Firebase Console이 열려있습니다');
        console.log('🔧 필요시 수동으로 계정을 생성하거나 수정하세요');
        console.log('📞 계정 생성 후 UID를 알려주시면 권한 설정을 완료하겠습니다');
        
    } catch (error) {
        console.error('❌ 계정 생성 중 오류:', error.message);
        await page.screenshot({ 
            path: `create-admin-fresh-error-${timestamp}.png`,
            fullPage: true 
        });
    } finally {
        console.log('\n⏳ Firebase Console을 3분간 열어둡니다...');
        setTimeout(async () => {
            await browser.close();
            console.log('\n🔒 브라우저 종료');
        }, 180000);
    }
})();