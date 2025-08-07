const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPNGUploadSimple() {
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
        // 기존 이미지 파일 사용 (프로젝트에 있는 이미지)
        console.log('📁 기존 PNG 이미지 찾기...');
        
        // 프로젝트 내 이미지 파일 찾기
        let testImagePath = null;
        const possibleImages = [
            '/mnt/e/project/test-studio-firebase/public/logo.png',
            '/mnt/e/project/test-studio-firebase/public/images/1ai.png',
            '/mnt/e/project/test-studio-firebase/public/images/blog1.png'
        ];
        
        for (const imgPath of possibleImages) {
            if (fs.existsSync(imgPath)) {
                testImagePath = imgPath;
                console.log(`✅ 테스트용 이미지 발견: ${imgPath}`);
                break;
            }
        }
        
        if (!testImagePath) {
            console.log('❌ 기존 PNG 이미지를 찾을 수 없습니다.');
            return;
        }
        
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
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-form-opened.png',
            fullPage: true 
        });
        
        console.log('📤 PNG 파일 업로드...');
        const fileInput = await page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testImagePath);
        
        console.log('⏳ 업로드 처리 대기 중 (10초)...');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-uploaded.png',
            fullPage: true 
        });
        
        console.log('📝 폼 필드 입력...');
        // 제목 입력
        const titleInput = await page.locator('input[placeholder*="제목"]').first();
        await titleInput.fill('PNG API 프록시 최종 테스트');
        
        // 요약 입력
        const summaryTextarea = await page.locator('textarea').first();
        await summaryTextarea.fill('PNG 이미지 업로드를 통한 API 프록시 기능 최종 테스트. CORS 문제 해결 여부 확인.');
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-form-filled.png',
            fullPage: true 
        });
        
        console.log('💾 저장 버튼 클릭...');
        const saveButton = await page.getByText('저장').first();
        await saveButton.click();
        
        console.log('⏳ 저장 처리 대기 중 (15초)...');
        await page.waitForTimeout(15000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-save-result.png',
            fullPage: true 
        });
        
        console.log('\n📊 최종 API 분석 결과...');
        
        // 업로드 API 요청 분석
        const uploadApiRequests = networkRequests.filter(req => 
            req.url.includes('/api/upload/image')
        );
        
        // Firebase Storage 요청 분석
        const storageRequests = networkRequests.filter(req => 
            req.url.includes('storage.googleapis.com') || 
            req.url.includes('firebasestorage.googleapis.com')
        );
        
        // 일반 업로드 요청
        const generalUploadRequests = networkRequests.filter(req => 
            req.url.includes('upload') && !req.url.includes('/api/upload/image')
        );
        
        console.log(`\n=== 🎯 API 프록시 테스트 결과 ===`);
        console.log(`📊 총 네트워크 요청: ${networkRequests.length}개`);
        console.log(`🎯 /api/upload/image 호출: ${uploadApiRequests.length}개`);
        console.log(`🔥 Firebase Storage 호출: ${storageRequests.length}개`);
        console.log(`📤 기타 업로드 호출: ${generalUploadRequests.length}개`);
        
        let testResult = '실패';
        
        if (uploadApiRequests.length > 0) {
            testResult = '성공';
            console.log(`\n✅ API 프록시 성공! /api/upload/image가 ${uploadApiRequests.length}번 호출됨`);
            
            uploadApiRequests.forEach((req, index) => {
                console.log(`\n📍 호출 ${index + 1}:`);
                console.log(`   URL: ${req.url}`);
                console.log(`   Method: ${req.method}`);
                console.log(`   시간: ${req.timestamp}`);
            });
        }
        
        if (storageRequests.length > 0) {
            console.log(`\n🔥 Firebase Storage API 직접 호출도 ${storageRequests.length}번 발생:`);
            storageRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.method} ${req.url.substring(0, 100)}...`);
            });
        }
        
        if (uploadApiRequests.length === 0 && storageRequests.length === 0) {
            console.log('\n❌ 업로드 관련 API 호출이 전혀 감지되지 않음');
        }
        
        // 로컬 API 호출 모두 출력
        const localApiRequests = networkRequests.filter(req => 
            req.url.includes('localhost:4000/api/')
        );
        
        console.log(`\n🏠 로컬 API 호출 (${localApiRequests.length}개):`);
        localApiRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url.replace('http://localhost:4000', '')}`);
        });
        
        console.log(`\n🏆 최종 테스트 결과: ${testResult}`);
        
        // 최종 확인을 위해 더 대기
        console.log('\n⏱️ 최종 상태 확인을 위해 25초 대기...');
        await page.waitForTimeout(25000);
        
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-final.png',
            fullPage: true 
        });
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
        await page.screenshot({ 
            path: '/mnt/e/project/test-studio-firebase/screenshots/simple-png-error.png',
            fullPage: true 
        });
    } finally {
        await browser.close();
        
        // 최종 결과 로그 저장
        const finalResult = {
            timestamp: new Date().toISOString(),
            testType: 'API Proxy Final Test - PNG Upload',
            testResult: networkRequests.filter(req => req.url.includes('/api/upload/image')).length > 0 ? 'SUCCESS' : 'FAILED',
            summary: {
                totalRequests: networkRequests.length,
                uploadApiCalls: networkRequests.filter(req => req.url.includes('/api/upload/image')).length,
                firebaseStorageCalls: networkRequests.filter(req => 
                    req.url.includes('storage.googleapis.com') || 
                    req.url.includes('firebasestorage.googleapis.com')
                ).length,
                localApiCalls: networkRequests.filter(req => req.url.includes('localhost:4000/api/')).length
            },
            uploadApiRequests: networkRequests.filter(req => req.url.includes('/api/upload/image')),
            firebaseStorageRequests: networkRequests.filter(req => 
                req.url.includes('storage.googleapis.com') || 
                req.url.includes('firebasestorage.googleapis.com')
            ),
            localApiRequests: networkRequests.filter(req => req.url.includes('localhost:4000/api/')),
            allRequests: networkRequests.slice(0, 50) // 처음 50개만 저장
        };
        
        fs.writeFileSync(
            '/mnt/e/project/test-studio-firebase/api-proxy-final-test-result.json',
            JSON.stringify(finalResult, null, 2)
        );
        
        console.log('\n📄 최종 테스트 결과가 api-proxy-final-test-result.json에 저장되었습니다.');
    }
}

testPNGUploadSimple();