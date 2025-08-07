const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogManagementWithAPIProxy() {
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1500,
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
    });
    
    // 콘솔 오류 모니터링
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`Console Error: ${msg.text()}`);
        }
    });
    
    try {
        console.log('1. 홈페이지 접속 중...');
        await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-home.png',
            fullPage: true 
        });
        
        console.log('2. 관리자 페이지로 이동 중...');
        await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-admin-main.png',
            fullPage: true 
        });
        
        console.log('3. 블로그 관리 탭 찾기...');
        // 블로그 관리 탭 찾기 (여러 방법으로 시도)
        let blogTab = null;
        
        // 방법 1: 텍스트로 찾기
        try {
            blogTab = await page.getByText('블로그 관리').first();
            if (await blogTab.isVisible()) {
                console.log('블로그 관리 탭을 텍스트로 찾음');
            }
        } catch (e) {
            console.log('텍스트로 블로그 관리 탭을 찾지 못함');
        }
        
        // 방법 2: 롤로 찾기
        if (!blogTab || !(await blogTab.isVisible())) {
            try {
                blogTab = await page.getByRole('tab', { name: /블로그|Blog/i }).first();
                if (await blogTab.isVisible()) {
                    console.log('블로그 관리 탭을 롤로 찾음');
                }
            } catch (e) {
                console.log('롤로 블로그 관리 탭을 찾지 못함');
            }
        }
        
        // 방법 3: 모든 탭 요소 검색
        if (!blogTab || !(await blogTab.isVisible())) {
            console.log('모든 탭 요소를 검색합니다...');
            const allTabs = await page.locator('[role="tab"], .tab, button[data-tab]').all();
            console.log(`찾은 탭 수: ${allTabs.length}`);
            
            for (let i = 0; i < allTabs.length; i++) {
                const tabText = await allTabs[i].textContent();
                console.log(`탭 ${i}: "${tabText}"`);
                if (tabText && (tabText.includes('블로그') || tabText.includes('Blog') || tabText.toLowerCase().includes('blog'))) {
                    blogTab = allTabs[i];
                    console.log(`블로그 관리 탭을 인덱스 ${i}에서 찾음: "${tabText}"`);
                    break;
                }
            }
        }
        
        if (blogTab && await blogTab.isVisible()) {
            console.log('4. 블로그 관리 탭 클릭...');
            await blogTab.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-blog-tab.png',
                fullPage: true 
            });
            
            console.log('5. 새 포스트 버튼 찾기...');
            // 새 포스트 버튼 찾기
            let newPostButton = null;
            
            // 여러 방법으로 새 포스트 버튼 찾기
            const buttonSelectors = [
                'text=새 포스트',
                'text=New Post',
                'text=포스트 작성',
                'text=글 작성',
                '[data-testid*="new-post"]',
                'button:has-text("새")',
                'button:has-text("포스트")',
                'button:has-text("작성")'
            ];
            
            for (const selector of buttonSelectors) {
                try {
                    newPostButton = page.locator(selector).first();
                    if (await newPostButton.isVisible()) {
                        console.log(`새 포스트 버튼을 찾음: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 계속 다음 selector 시도
                }
            }
            
            // 모든 버튼 검색
            if (!newPostButton || !(await newPostButton.isVisible())) {
                console.log('모든 버튼을 검색합니다...');
                const allButtons = await page.locator('button').all();
                console.log(`찾은 버튼 수: ${allButtons.length}`);
                
                for (let i = 0; i < allButtons.length; i++) {
                    const buttonText = await allButtons[i].textContent();
                    console.log(`버튼 ${i}: "${buttonText}"`);
                    if (buttonText && (
                        buttonText.includes('새') || 
                        buttonText.includes('포스트') || 
                        buttonText.includes('작성') ||
                        buttonText.includes('New') ||
                        buttonText.includes('Post')
                    )) {
                        newPostButton = allButtons[i];
                        console.log(`새 포스트 버튼을 인덱스 ${i}에서 찾음: "${buttonText}"`);
                        break;
                    }
                }
            }
            
            if (newPostButton && await newPostButton.isVisible()) {
                console.log('6. 새 포스트 버튼 클릭...');
                await newPostButton.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ 
                    path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-new-post-form.png',
                    fullPage: true 
                });
                
                console.log('7. 이미지 업로드 필드 찾기...');
                // 이미지 업로드 필드 찾기
                let imageUpload = null;
                const uploadSelectors = [
                    'input[type="file"]',
                    '[data-testid*="image"]',
                    '[data-testid*="upload"]',
                    'input[accept*="image"]'
                ];
                
                for (const selector of uploadSelectors) {
                    try {
                        imageUpload = page.locator(selector).first();
                        if (await imageUpload.isVisible({ timeout: 1000 })) {
                            console.log(`이미지 업로드 필드를 찾음: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        // 계속 다음 selector 시도
                    }
                }
                
                if (imageUpload && await imageUpload.isVisible()) {
                    console.log('8. 테스트 이미지 파일 생성...');
                    // 간단한 테스트 이미지 생성 (SVG)
                    const testImageContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#ff0000"/>
                        <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white">TEST</text>
                    </svg>`;
                    
                    const testImagePath = '/mnt/e/project/test-studio-firebase/test-image.svg';
                    fs.writeFileSync(testImagePath, testImageContent);
                    
                    console.log('9. 이미지 업로드 시도...');
                    await imageUpload.setInputFiles(testImagePath);
                    await page.waitForTimeout(3000); // 업로드 처리 대기
                    
                    await page.screenshot({ 
                        path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-image-uploaded.png',
                        fullPage: true 
                    });
                    
                    console.log('10. 포스트 정보 입력...');
                    // 제목 입력
                    const titleField = page.locator('input[placeholder*="제목"], input[name*="title"], input[id*="title"]').first();
                    if (await titleField.isVisible()) {
                        await titleField.fill('API 프록시 테스트 포스트');
                        console.log('제목 입력 완료');
                    }
                    
                    // 내용 입력 (textarea 또는 에디터)
                    const contentField = page.locator('textarea, [contenteditable="true"], .editor').first();
                    if (await contentField.isVisible()) {
                        await contentField.fill('API 프록시 테스트를 위한 포스트 내용입니다. 이미지 업로드가 성공적으로 작동하는지 확인합니다.');
                        console.log('내용 입력 완료');
                    }
                    
                    await page.screenshot({ 
                        path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-form-filled.png',
                        fullPage: true 
                    });
                    
                    console.log('11. 저장 버튼 찾기 및 클릭...');
                    // 저장 버튼 찾기
                    let saveButton = null;
                    const saveSelectors = [
                        'text=저장',
                        'text=Save',
                        'text=발행',
                        'text=Publish',
                        'button[type="submit"]'
                    ];
                    
                    for (const selector of saveSelectors) {
                        try {
                            saveButton = page.locator(selector).first();
                            if (await saveButton.isVisible()) {
                                console.log(`저장 버튼을 찾음: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            // 계속 다음 selector 시도
                        }
                    }
                    
                    if (saveButton && await saveButton.isVisible()) {
                        await saveButton.click();
                        await page.waitForTimeout(5000); // 저장 처리 대기
                        
                        await page.screenshot({ 
                            path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-save-result.png',
                            fullPage: true 
                        });
                        
                        console.log('12. API 호출 결과 확인...');
                        // 네트워크 요청 중 /api/upload/image 확인
                        const imageUploadRequests = networkRequests.filter(req => 
                            req.url.includes('/api/upload/image') || req.url.includes('upload')
                        );
                        
                        console.log('\n=== API 호출 결과 ===');
                        console.log(`총 네트워크 요청 수: ${networkRequests.length}`);
                        console.log(`이미지 업로드 관련 요청 수: ${imageUploadRequests.length}`);
                        
                        imageUploadRequests.forEach((req, index) => {
                            console.log(`\n이미지 업로드 요청 ${index + 1}:`);
                            console.log(`URL: ${req.url}`);
                            console.log(`Method: ${req.method}`);
                            console.log(`시간: ${req.timestamp}`);
                        });
                        
                        // 모든 네트워크 요청 로그
                        console.log('\n=== 전체 네트워크 요청 로그 ===');
                        networkRequests.forEach((req, index) => {
                            console.log(`${index + 1}. ${req.method} ${req.url}`);
                        });
                        
                    } else {
                        console.log('저장 버튼을 찾을 수 없음');
                    }
                } else {
                    console.log('이미지 업로드 필드를 찾을 수 없음');
                }
            } else {
                console.log('새 포스트 버튼을 찾을 수 없음');
            }
        } else {
            console.log('블로그 관리 탭을 찾을 수 없음');
        }
        
        // 최종 스크린샷
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-final.png',
            fullPage: true 
        });
        
        console.log('\n테스트 완료!');
        
    } catch (error) {
        console.error('테스트 중 오류 발생:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/blog-test-error.png',
            fullPage: true 
        });
    } finally {
        // 5초 대기 후 브라우저 종료
        await page.waitForTimeout(5000);
        await browser.close();
        
        // 네트워크 로그를 파일로 저장
        const logContent = {
            timestamp: new Date().toISOString(),
            totalRequests: networkRequests.length,
            imageUploadRequests: networkRequests.filter(req => 
                req.url.includes('/api/upload/image') || req.url.includes('upload')
            ),
            allRequests: networkRequests
        };
        
        fs.writeFileSync(
            '/mnt/e/project/test-studio-firebase/blog-api-test-log.json',
            JSON.stringify(logContent, null, 2)
        );
    }
}

testBlogManagementWithAPIProxy();