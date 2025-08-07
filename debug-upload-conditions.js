const { chromium } = require('playwright');

async function debugUploadConditions() {
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🔍 환경 변수 및 업로드 조건 확인...');
        
        await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 브라우저에서 환경 변수 확인
        const envDebug = await page.evaluate(() => {
            return {
                NODE_ENV: process.env.NODE_ENV,
                NEXT_PUBLIC_ENABLE_DEV_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH,
                NEXT_PUBLIC_USE_REAL_AUTH: process.env.NEXT_PUBLIC_USE_REAL_AUTH,
                storageExists: !!window.firebase?.storage,
                developmentCheck: process.env.NODE_ENV === 'development',
                devAuthCheck: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true',
                realAuthCheck: process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false',
                finalCondition: process.env.NODE_ENV === 'development' && 
                               (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === 'true' || 
                                process.env.NEXT_PUBLIC_USE_REAL_AUTH === 'false')
            };
        });
        
        console.log('\n=== 🔍 환경 변수 디버그 ===');
        console.log('NODE_ENV:', envDebug.NODE_ENV);
        console.log('NEXT_PUBLIC_ENABLE_DEV_AUTH:', envDebug.NEXT_PUBLIC_ENABLE_DEV_AUTH);
        console.log('NEXT_PUBLIC_USE_REAL_AUTH:', envDebug.NEXT_PUBLIC_USE_REAL_AUTH);
        console.log('Storage 객체 존재 여부:', envDebug.storageExists);
        
        console.log('\n=== 📊 조건 분석 ===');
        console.log('developmentCheck:', envDebug.developmentCheck);
        console.log('devAuthCheck:', envDebug.devAuthCheck);
        console.log('realAuthCheck:', envDebug.realAuthCheck);
        console.log('최종 isDevelopmentMode:', envDebug.finalCondition);
        
        // 업로드 함수 내부 로직 시뮬레이션
        const shouldUseApiProxy = !envDebug.storageExists || envDebug.finalCondition;
        console.log('\n=== 🎯 업로드 경로 결정 ===');
        console.log('API 프록시 사용해야 하는가?', shouldUseApiProxy);
        console.log('이유:', !envDebug.storageExists ? 'storage 객체 없음' : 
                   envDebug.finalCondition ? 'development 모드' : 'Firebase 직접 사용');
        
        // Firebase 설정 확인
        const firebaseDebug = await page.evaluate(() => {
            try {
                const firebase = window.firebase;
                if (firebase) {
                    return {
                        appExists: !!firebase.app,
                        storageExists: !!firebase.storage,
                        authExists: !!firebase.auth,
                        firestoreExists: !!firebase.firestore,
                        config: firebase.app()?.options || 'No app config'
                    };
                }
                return { error: 'Firebase not found' };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        console.log('\n=== 🔥 Firebase 상태 ===');
        console.log('Firebase 디버그:', firebaseDebug);
        
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 디버그 중 오류:', error);
    } finally {
        await browser.close();
    }
}

debugUploadConditions();