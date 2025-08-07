const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testImageUploadFocused() {
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 2000,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('request', request => {
        networkRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            timestamp: new Date().toISOString()
        });
        console.log(`→ ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        console.log(`← ${response.status()} ${response.url()}`);
        if (response.url().includes('/api/upload') || response.url().includes('upload')) {
            console.log(`🎯 업로드 API 응답: ${response.status()} ${response.url()}`);
        }
    });
    
    // 콘솔 로그 모니터링
    page.on('console', msg => {
        console.log(`브라우저 콘솔: [${msg.type()}] ${msg.text()}`);
    });
    
    // 에러 모니터링
    page.on('pageerror', error => {
        console.log(`페이지 에러: ${error.message}`);
    });
    
    try {
        console.log('1. 관리자 페이지 직접 접속...');
        await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('2. 블로그 관리 탭 클릭...');
        const blogTab = await page.getByText('블로그 관리').first();
        await blogTab.click();
        await page.waitForTimeout(2000);
        
        console.log('3. 새 포스트 버튼 클릭...');
        const newPostButton = await page.getByText('새 포스트').first();
        await newPostButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-form-opened.png',
            fullPage: true 
        });
        
        console.log('4. 이미지 교체 버튼 찾기...');
        // 이미지 교체 버튼 클릭
        const imageChangeButton = await page.getByText('이미지 교체').first();
        await imageChangeButton.click();
        await page.waitForTimeout(1000);
        
        console.log('5. 파일 입력 필드 찾기...');
        // 파일 입력 필드가 나타나는지 확인
        const fileInput = await page.locator('input[type="file"]').first();
        
        if (await fileInput.isVisible()) {
            console.log('✅ 파일 입력 필드를 찾았습니다!');
            
            // 테스트 이미지 생성
            console.log('6. 테스트 이미지 생성...');
            const testImageContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#4ade80"/>
                <circle cx="100" cy="100" r="50" fill="#ffffff"/>
                <text x="100" y="110" text-anchor="middle" font-size="20" fill="#000000">API TEST</text>
            </svg>`;
            
            const testImagePath = '/mnt/e/project/test-studio-firebase/test-image-api.svg';
            fs.writeFileSync(testImagePath, testImageContent);
            
            console.log('7. 이미지 파일 선택...');
            await fileInput.setInputFiles(testImagePath);
            await page.waitForTimeout(5000); // 업로드 처리 대기
            
            await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-image-selected.png',
                fullPage: true 
            });
            
            console.log('8. 폼 데이터 입력...');
            // 제목 입력
            const titleField = await page.locator('input[placeholder*="제목"]').first();
            if (await titleField.isVisible()) {
                await titleField.fill('API 프록시 테스트 - 이미지 업로드');
            }
            
            // 요약 입력
            const summaryField = await page.locator('textarea').first();
            if (await summaryField.isVisible()) {
                await summaryField.fill('API 프록시를 통한 이미지 업로드 기능 테스트입니다.');
            }
            
            await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-form-filled.png',
                fullPage: true 
            });
            
            console.log('9. 저장 버튼 클릭...');
            const saveButton = await page.getByText('저장').first();
            if (await saveButton.isVisible()) {
                await saveButton.click();
                await page.waitForTimeout(8000); // 저장 처리 대기
                
                await page.screenshot({ 
                    path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-save-result.png',
                    fullPage: true 
                });
                
                console.log('10. 업로드 API 호출 분석...');
                // /api/upload/image 관련 요청 필터링
                const uploadRequests = networkRequests.filter(req => 
                    req.url.includes('/api/upload') || 
                    req.url.includes('upload') ||
                    req.url.includes('storage')
                );
                
                console.log('\n=== 🎯 업로드 API 호출 결과 ===');
                console.log(`총 네트워크 요청: ${networkRequests.length}개`);
                console.log(`업로드 관련 요청: ${uploadRequests.length}개`);
                
                if (uploadRequests.length > 0) {
                    uploadRequests.forEach((req, index) => {
                        console.log(`\n업로드 요청 ${index + 1}:`);
                        console.log(`  URL: ${req.url}`);
                        console.log(`  Method: ${req.method}`);
                        console.log(`  시간: ${req.timestamp}`);
                    });
                    
                    console.log('\n✅ 업로드 API가 호출되었습니다!');
                } else {
                    console.log('\n❌ 업로드 API 호출이 감지되지 않았습니다.');
                }
                
                // Firebase Storage 관련 요청도 확인
                const firebaseRequests = networkRequests.filter(req => 
                    req.url.includes('firebase') || 
                    req.url.includes('googleapis.com')
                );
                
                console.log(`\nFirebase/Google APIs 요청: ${firebaseRequests.length}개`);
                firebaseRequests.forEach((req, index) => {
                    console.log(`  ${index + 1}. ${req.method} ${req.url}`);
                });
                
            } else {
                console.log('❌ 저장 버튼을 찾을 수 없습니다.');
            }
            
        } else {
            console.log('❌ 파일 입력 필드를 찾을 수 없습니다.');
        }
        
        // 최종 개발자 도구 체크를 위해 잠시 대기
        console.log('\n11. 최종 확인을 위해 10초 대기...');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-final.png',
            fullPage: true 
        });
        
    } catch (error) {
        console.error('테스트 중 오류:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/focused-test-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        
        // 네트워크 로그 저장
        const logContent = {
            timestamp: new Date().toISOString(),
            testType: 'Image Upload API Proxy Test',
            totalRequests: networkRequests.length,
            uploadRequests: networkRequests.filter(req => 
                req.url.includes('/api/upload') || 
                req.url.includes('upload') ||
                req.url.includes('storage')
            ),
            firebaseRequests: networkRequests.filter(req => 
                req.url.includes('firebase') || 
                req.url.includes('googleapis.com')
            ),
            allRequests: networkRequests
        };
        
        fs.writeFileSync(
            '/mnt/e/project/test-studio-firebase/focused-api-test-log.json',
            JSON.stringify(logContent, null, 2)
        );
        
        console.log('\n📊 테스트 완료! 로그가 저장되었습니다.');
    }
}

testImageUploadFocused();