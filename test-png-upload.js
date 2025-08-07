const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

async function testPNGUpload() {
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
        if (request.url().includes('/api/') || request.url().includes('upload') || request.url().includes('storage')) {
            console.log(`🎯 중요 요청: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('upload') || response.url().includes('storage')) {
            console.log(`🎯 중요 응답: ${response.status()} ${response.url()}`);
        }
    });
    
    // 콘솔 로그 모니터링
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warn') {
            console.log(`⚠️  브라우저: [${msg.type()}] ${msg.text()}`);
        }
    });
    
    try {
        // PNG 이미지 생성 (Canvas 사용)
        console.log('🎨 PNG 이미지 생성 중...');
        const canvas = createCanvas(400, 300);
        const ctx = canvas.getContext('2d');
        
        // 배경
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 400, 300);
        
        // 원
        ctx.beginPath();
        ctx.arc(200, 150, 80, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // 텍스트
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('API 프록시', 200, 140);
        ctx.font = '18px Arial';
        ctx.fillText('PNG 테스트', 200, 170);
        
        const testImagePath = '/mnt/e/project/test-studio-firebase/test-image.png';
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(testImagePath, buffer);
        
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
        
        console.log('📤 PNG 파일 업로드...');
        const fileInput = await page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testImagePath);
        
        console.log('⏳ 업로드 처리 대기 중...');
        await page.waitForTimeout(8000); // 업로드 처리 대기
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/png-test-uploaded.png',
            fullPage: true 
        });
        
        console.log('📝 폼 필드 입력...');
        // 제목 입력
        const titleInput = await page.locator('input[placeholder*="제목"]').first();
        await titleInput.fill('PNG 이미지 API 프록시 테스트');
        
        // 요약 입력
        const summaryTextarea = await page.locator('textarea').first();
        await summaryTextarea.fill('PNG 형식 이미지를 통한 API 프록시 업로드 테스트. CORS 해결 확인.');
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/png-test-form-filled.png',
            fullPage: true 
        });
        
        console.log('💾 저장 버튼 클릭...');
        const saveButton = await page.getByText('저장').first();
        await saveButton.click();
        
        console.log('⏳ 저장 처리 대기 중...');
        await page.waitForTimeout(12000); // 저장 처리 대기
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/png-test-save-result.png',
            fullPage: true 
        });
        
        console.log('\n📊 상세 API 분석...');
        
        // /api/upload/image 관련 요청
        const uploadApiRequests = networkRequests.filter(req => 
            req.url.includes('/api/upload/image')
        );
        
        // Firebase Storage 관련 요청
        const storageRequests = networkRequests.filter(req => 
            req.url.includes('storage.googleapis.com') || 
            req.url.includes('firebasestorage.googleapis.com')
        );
        
        // 모든 업로드 관련 요청
        const allUploadRequests = networkRequests.filter(req => 
            req.url.includes('upload') || req.url.includes('storage')
        );
        
        console.log(`\n=== 🎯 업로드 API 분석 결과 ===`);
        console.log(`총 네트워크 요청: ${networkRequests.length}개`);
        console.log(`/api/upload/image 요청: ${uploadApiRequests.length}개`);
        console.log(`Firebase Storage 요청: ${storageRequests.length}개`);
        console.log(`전체 업로드 관련 요청: ${allUploadRequests.length}개`);
        
        if (uploadApiRequests.length > 0) {
            console.log('\n✅ /api/upload/image API 호출 감지:');
            uploadApiRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url}`);
                console.log(`   시간: ${req.timestamp}`);
                console.log(`   헤더: ${JSON.stringify(req.headers, null, 2)}`);
            });
        }
        
        if (storageRequests.length > 0) {
            console.log('\n🔥 Firebase Storage API 호출 감지:');
            storageRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url}`);
                console.log(`   시간: ${req.timestamp}`);
            });
        }
        
        if (allUploadRequests.length === 0) {
            console.log('\n❌ 업로드 관련 API 호출이 전혀 감지되지 않음');
            console.log('\n📋 전체 API 호출 목록:');
            const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
            apiRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url.replace('http://localhost:4000', '')}`);
            });
        }
        
        // 최종 확인 대기
        console.log('\n⏱️ 최종 결과 확인을 위해 20초 대기...');
        await page.waitForTimeout(20000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/png-test-final.png',
            fullPage: true 
        });
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/png-test-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        
        // 상세 로그 저장
        const logContent = {
            timestamp: new Date().toISOString(),
            testType: 'PNG Image Upload API Proxy Test',
            summary: {
                totalRequests: networkRequests.length,
                uploadApiRequests: networkRequests.filter(req => req.url.includes('/api/upload/image')).length,
                storageRequests: networkRequests.filter(req => 
                    req.url.includes('storage.googleapis.com') || 
                    req.url.includes('firebasestorage.googleapis.com')
                ).length,
                allUploadRequests: networkRequests.filter(req => 
                    req.url.includes('upload') || req.url.includes('storage')
                ).length
            },
            uploadApiRequests: networkRequests.filter(req => req.url.includes('/api/upload/image')),
            storageRequests: networkRequests.filter(req => 
                req.url.includes('storage.googleapis.com') || 
                req.url.includes('firebasestorage.googleapis.com')
            ),
            apiRequests: networkRequests.filter(req => req.url.includes('/api/')),
            allRequests: networkRequests
        };
        
        fs.writeFileSync(
            '/mnt/e/project/test-studio-firebase/png-upload-test-log.json',
            JSON.stringify(logContent, null, 2)
        );
        
        console.log('\n📄 상세 로그가 png-upload-test-log.json에 저장되었습니다.');
    }
}

testPNGUpload();