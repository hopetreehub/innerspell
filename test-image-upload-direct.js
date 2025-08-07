const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testImageUploadDirect() {
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
        if (request.url().includes('/api/') || request.url().includes('upload')) {
            console.log(`🎯 API 요청: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('upload')) {
            console.log(`🎯 API 응답: ${response.status()} ${response.url()}`);
        }
    });
    
    // 콘솔 로그 모니터링 (에러만)
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ 브라우저 에러: ${msg.text()}`);
        }
    });
    
    // 페이지 에러 모니터링
    page.on('pageerror', error => {
        console.log(`❌ 페이지 에러: ${error.message}`);
    });
    
    try {
        console.log('🚀 관리자 페이지 접속...');
        await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('📝 블로그 관리 탭 클릭...');
        const blogTab = await page.getByText('블로그 관리').first();
        await blogTab.click();
        await page.waitForTimeout(2000);
        
        console.log('➕ 새 포스트 버튼 클릭...');
        const newPostButton = await page.getByText('새 포스트').first();
        await newPostButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-form-opened.png',
            fullPage: true 
        });
        
        console.log('🔍 파일 입력 필드 모든 방법으로 찾기...');
        
        // 방법 1: 모든 input[type="file"] 찾기
        const allFileInputs = await page.locator('input[type="file"]').all();
        console.log(`파일 입력 필드 개수: ${allFileInputs.length}`);
        
        for (let i = 0; i < allFileInputs.length; i++) {
            const isVisible = await allFileInputs[i].isVisible();
            const isEnabled = await allFileInputs[i].isEnabled();
            console.log(`파일 입력 ${i + 1}: visible=${isVisible}, enabled=${isEnabled}`);
        }
        
        // 방법 2: 숨겨진 파일 입력 필드도 찾기 (display:none, visibility:hidden 포함)
        const hiddenFileInputs = await page.locator('input[type="file"]').all();
        console.log(`전체 파일 입력 필드 개수 (숨겨진 것 포함): ${hiddenFileInputs.length}`);
        
        if (hiddenFileInputs.length > 0) {
            console.log('📎 숨겨진 파일 입력 필드를 이용한 이미지 업로드 시도...');
            
            // 테스트 이미지 생성
            const testImageContent = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="300" height="300" fill="#3b82f6"/>
                <circle cx="150" cy="150" r="80" fill="#ffffff"/>
                <text x="150" y="160" text-anchor="middle" font-size="24" font-family="Arial" fill="#000000">API 프록시</text>
                <text x="150" y="190" text-anchor="middle" font-size="16" font-family="Arial" fill="#000000">테스트</text>
            </svg>`;
            
            const testImagePath = '/mnt/e/project/test-studio-firebase/test-image-direct.svg';
            fs.writeFileSync(testImagePath, testImageContent);
            
            console.log('📤 파일 업로드 시도...');
            await hiddenFileInputs[0].setInputFiles(testImagePath);
            await page.waitForTimeout(5000); // 업로드 처리 대기
            
            await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-image-uploaded.png',
                fullPage: true 
            });
            
            console.log('📝 폼 필드 입력...');
            // 제목 입력
            const titleInput = await page.locator('input[placeholder*="제목"]').first();
            if (await titleInput.isVisible()) {
                await titleInput.fill('API 프록시 직접 테스트');
                console.log('✅ 제목 입력됨');
            }
            
            // 요약 입력
            const summaryTextarea = await page.locator('textarea').first();
            if (await summaryTextarea.isVisible()) {
                await summaryTextarea.fill('API 프록시를 통한 직접 이미지 업로드 테스트입니다. CORS 문제 해결을 확인합니다.');
                console.log('✅ 요약 입력됨');
            }
            
            await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-form-filled.png',
                fullPage: true 
            });
            
            console.log('💾 저장 버튼 클릭...');
            const saveButton = await page.getByText('저장').first();
            if (await saveButton.isVisible()) {
                await saveButton.click();
                console.log('✅ 저장 버튼 클릭됨');
                
                // 저장 처리 대기 (더 길게)
                await page.waitForTimeout(10000);
                
                await page.screenshot({ 
                    path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-save-result.png',
                    fullPage: true 
                });
                
            } else {
                console.log('❌ 저장 버튼을 찾을 수 없음');
            }
            
        } else {
            console.log('❌ 파일 입력 필드를 찾을 수 없음');
            
            // 다른 방법: 이미지 영역 직접 클릭
            console.log('🖱️ 이미지 영역 직접 클릭 시도...');
            try {
                // 이미지 컨테이너 클릭
                const imageContainer = await page.locator('.cursor-pointer, [role="button"]').first();
                if (await imageContainer.isVisible()) {
                    await imageContainer.click();
                    await page.waitForTimeout(2000);
                    
                    // 클릭 후 파일 입력 필드가 나타나는지 다시 확인
                    const newFileInputs = await page.locator('input[type="file"]').all();
                    console.log(`클릭 후 파일 입력 필드 개수: ${newFileInputs.length}`);
                    
                    if (newFileInputs.length > 0) {
                        console.log('✅ 클릭 후 파일 입력 필드 생성됨');
                        // 업로드 재시도...
                    }
                }
            } catch (e) {
                console.log('이미지 영역 클릭 실패:', e.message);
            }
        }
        
        console.log('\n📊 API 호출 분석...');
        // 업로드 관련 요청 분석
        const uploadRequests = networkRequests.filter(req => 
            req.url.includes('/api/upload') || 
            req.url.includes('upload') ||
            req.url.includes('storage.googleapis.com') ||
            req.url.includes('firebasestorage.googleapis.com')
        );
        
        console.log(`\n=== 🎯 네트워크 요청 분석 ===`);
        console.log(`총 요청: ${networkRequests.length}개`);
        console.log(`업로드 관련 요청: ${uploadRequests.length}개`);
        
        if (uploadRequests.length > 0) {
            console.log('\n✅ 업로드 관련 API 호출 발견:');
            uploadRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url}`);
                console.log(`   시간: ${req.timestamp}`);
            });
        } else {
            console.log('\n❌ 업로드 관련 API 호출이 감지되지 않음');
        }
        
        // Firebase 관련 요청
        const firebaseRequests = networkRequests.filter(req => 
            req.url.includes('firebase') || 
            req.url.includes('googleapis.com')
        );
        
        console.log(`\n🔥 Firebase/Google API 요청: ${firebaseRequests.length}개`);
        
        // 로컬 API 요청
        const localApiRequests = networkRequests.filter(req => 
            req.url.includes('localhost:4000/api/')
        );
        
        console.log(`🏠 로컬 API 요청: ${localApiRequests.length}개`);
        localApiRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url.replace('http://localhost:4000', '')}`);
        });
        
        // 최종 대기
        console.log('\n⏱️ 최종 확인을 위해 15초 대기...');
        await page.waitForTimeout(15000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-final.png',
            fullPage: true 
        });
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/direct-test-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        
        // 상세 로그 저장
        const logContent = {
            timestamp: new Date().toISOString(),
            testType: 'Direct Image Upload API Test',
            summary: {
                totalRequests: networkRequests.length,
                uploadRequests: networkRequests.filter(req => 
                    req.url.includes('/api/upload') || 
                    req.url.includes('upload') ||
                    req.url.includes('storage.googleapis.com')
                ).length,
                localApiRequests: networkRequests.filter(req => 
                    req.url.includes('localhost:4000/api/')
                ).length,
                firebaseRequests: networkRequests.filter(req => 
                    req.url.includes('firebase') || 
                    req.url.includes('googleapis.com')
                ).length
            },
            uploadRequests: networkRequests.filter(req => 
                req.url.includes('/api/upload') || 
                req.url.includes('upload') ||
                req.url.includes('storage.googleapis.com')
            ),
            localApiRequests: networkRequests.filter(req => 
                req.url.includes('localhost:4000/api/')
            ),
            allRequests: networkRequests
        };
        
        fs.writeFileSync(
            '/mnt/e/project/test-studio-firebase/direct-api-test-log.json',
            JSON.stringify(logContent, null, 2)
        );
        
        console.log('\n📄 상세 로그가 direct-api-test-log.json에 저장되었습니다.');
    }
}

testImageUploadDirect();