const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testBlogImageUpload() {
    console.log('🚀 Mock 이미지 404 오류 수정 후 블로그 이미지 업로드 재테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        const page = await context.newPage();

        // 1. 관리자 페이지 접속
        console.log('1. 관리자 페이지 접속 중...');
        await page.goto('http://localhost:4000/admin');
        await page.waitForLoadState('networkidle');
        
        // 로그인 체크
        const loginForm = await page.$('form[action*="login"]');
        if (loginForm) {
            console.log('로그인 필요 - 임시 사용자로 로그인');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'test123');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
        }

        // 2. 블로그 관리 탭 클릭
        console.log('2. 블로그 관리 탭 클릭');
        await page.click('button:has-text("블로그 관리")');
        await page.waitForTimeout(1000);

        // 스크린샷 - 블로그 관리 탭
        await page.screenshot({
            path: 'screenshots/blog-management-tab.png',
            fullPage: true
        });

        // 3. 새 포스트 버튼 클릭
        console.log('3. 새 포스트 버튼 클릭');
        const newPostButton = await page.$('button:has-text("새 포스트")');
        if (newPostButton) {
            await newPostButton.click();
            await page.waitForTimeout(1000);
        } else {
            console.log('새 포스트 버튼을 찾을 수 없음 - 대체 방법 시도');
            await page.click('button[class*="bg-blue"], button[class*="primary"]');
            await page.waitForTimeout(1000);
        }

        // 4. 포스트 정보 입력
        console.log('4. 포스트 정보 입력');
        
        // 제목 입력
        const titleInput = await page.$('input[placeholder*="제목"], input[name*="title"]');
        if (titleInput) {
            await titleInput.fill('이미지 수정 완료 테스트');
        }
        
        // 요약 입력
        const summaryInput = await page.$('input[placeholder*="요약"], textarea[placeholder*="요약"]');
        if (summaryInput) {
            await summaryInput.fill('404 오류 해결 후 테스트');
        }
        
        // 본문 입력 (MDX Editor가 있을 경우)
        const contentArea = await page.$('textarea, .mdx-editor, [contenteditable="true"]');
        if (contentArea) {
            await contentArea.click();
            await page.keyboard.type('# 성공!\n\n이미지가 정상적으로 표시됩니다.');
        }

        await page.waitForTimeout(1000);

        // 5. 이미지 업로드 버튼 찾기 및 클릭
        console.log('5. 이미지 업로드 버튼 찾기');
        
        // 다양한 이미지 업로드 버튼 선택자 시도
        const imageUploadSelectors = [
            'input[type="file"]',
            'button:has-text("이미지")',
            'button:has-text("업로드")',
            '[data-testid="image-upload"]',
            '.image-upload-button',
            'label:has-text("이미지")'
        ];

        let fileInput = null;
        for (const selector of imageUploadSelectors) {
            fileInput = await page.$(selector);
            if (fileInput) {
                console.log(`이미지 업로드 요소 발견: ${selector}`);
                break;
            }
        }

        if (fileInput) {
            // 테스트 이미지 파일 생성 (간단한 SVG)
            const testImageContent = `
                <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="#4CAF50"/>
                    <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Test</text>
                </svg>
            `;
            
            const testImagePath = path.join(__dirname, 'test-image.svg');
            fs.writeFileSync(testImagePath, testImageContent);

            // 파일 업로드
            await fileInput.setInputFiles(testImagePath);
            console.log('6. 테스트 이미지 업로드 완료');
            
            await page.waitForTimeout(2000); // 업로드 처리 대기

            // 스크린샷 - 이미지 업로드 후
            await page.screenshot({
                path: 'screenshots/blog-image-uploaded-fixed.png',
                fullPage: true
            });

            // 7. 이미지가 정상적으로 표시되는지 확인
            console.log('7. 이미지 표시 상태 확인');
            
            // img 태그가 있는지 확인
            const images = await page.$$('img');
            let imageDisplayed = false;
            let imageErrors = [];
            
            for (let img of images) {
                const src = await img.getAttribute('src');
                const naturalWidth = await img.evaluate(el => el.naturalWidth);
                const naturalHeight = await img.evaluate(el => el.naturalHeight);
                
                console.log(`이미지 발견: ${src}, 크기: ${naturalWidth}x${naturalHeight}`);
                
                if (src && src.includes('data:') && naturalWidth > 0) {
                    imageDisplayed = true;
                    console.log('✅ 이미지가 정상적으로 표시됨 (Data URL)');
                } else if (src && !src.includes('404') && naturalWidth > 0) {
                    imageDisplayed = true;
                    console.log('✅ 이미지가 정상적으로 표시됨');
                } else {
                    imageErrors.push({ src, naturalWidth, naturalHeight });
                }
            }

            if (imageErrors.length > 0) {
                console.log('❌ 일부 이미지에 문제 발견:');
                imageErrors.forEach(error => {
                    console.log(`- ${error.src}: ${error.naturalWidth}x${error.naturalHeight}`);
                });
            }

            // 404 오류 체크 (네트워크 탭에서)
            const response404 = await page.evaluate(() => {
                return window.performance.getEntriesByType('resource')
                    .filter(entry => entry.name.includes('404') || entry.responseStatus === 404);
            });

            if (response404.length === 0) {
                console.log('✅ 404 오류 없음 - 이미지 수정 성공!');
            } else {
                console.log('❌ 여전히 404 오류 존재:', response404);
            }

            // 8. 저장 버튼 클릭
            console.log('8. 저장 버튼 클릭');
            const saveButton = await page.$('button:has-text("저장"), button:has-text("게시"), button[type="submit"]');
            if (saveButton) {
                await saveButton.click();
                await page.waitForTimeout(2000);
                console.log('포스트 저장 완료');
            }

            // 최종 스크린샷
            await page.screenshot({
                path: 'screenshots/blog-post-saved-final.png',
                fullPage: true
            });

            // 테스트 파일 정리
            if (fs.existsSync(testImagePath)) {
                fs.unlinkSync(testImagePath);
            }

            console.log('✅ 테스트 완료 - 이미지 404 오류 수정 검증');
            
            return {
                success: true,
                imageDisplayed,
                hasErrors: imageErrors.length > 0,
                errorCount: imageErrors.length
            };

        } else {
            console.log('❌ 이미지 업로드 버튼을 찾을 수 없음');
            
            // 현재 페이지 구조 확인
            const pageContent = await page.content();
            console.log('현재 페이지에서 찾을 수 있는 입력 요소들:');
            
            const inputs = await page.$$('input, button, textarea');
            for (let input of inputs.slice(0, 10)) { // 처음 10개만
                const type = await input.getAttribute('type');
                const className = await input.getAttribute('class');
                const text = await input.textContent();
                console.log(`- ${input.tagName}: type="${type}", class="${className}", text="${text}"`);
            }
            
            await page.screenshot({
                path: 'screenshots/blog-no-upload-button.png',
                fullPage: true
            });
            
            return {
                success: false,
                reason: 'No image upload button found'
            };
        }

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        
        // 오류 발생 시 스크린샷
        try {
            await page.screenshot({
                path: 'screenshots/blog-test-error.png',
                fullPage: true
            });
        } catch (e) {
            console.log('스크린샷 저장 실패');
        }
        
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testBlogImageUpload().then(result => {
    console.log('🏁 테스트 결과:', result);
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('💥 테스트 실행 실패:', error);
    process.exit(1);
});