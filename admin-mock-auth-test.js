const { chromium } = require('playwright');

(async () => {
  console.log('🔐 관리자 페이지 Mock 인증 테스트 시작...');
  
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1400, height: 900 }
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    console.log('\n=== 1단계: 관리자 페이지 직접 접속 ===');
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    console.log('초기 URL:', page.url());
    
    await page.screenshot({ 
      path: 'admin-mock-01-initial-redirect.png',
      fullPage: false 
    });
    
    console.log('\n=== 2단계: 브라우저 콘솔에서 인증 상태 조작 ===');
    
    // React DevTools 없이 컴포넌트 상태 조작
    await page.evaluate(() => {
      // Firebase Auth 모킹
      if (window.firebase && window.firebase.auth) {
        const mockUser = {
          uid: 'mock-admin-uid-123',
          email: 'admin@innerspell.com',
          emailVerified: true,
          displayName: 'Mock Admin',
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        };
        
        // Firebase currentUser 모킹
        Object.defineProperty(window.firebase.auth(), 'currentUser', {
          get: () => mockUser,
          configurable: true
        });
        
        console.log('🔥 Firebase currentUser mocked:', mockUser);
      }
      
      // AuthContext 전역 상태 조작
      window.mockAuthState = {
        user: {
          uid: 'mock-admin-uid-123',
          email: 'admin@innerspell.com',
          role: 'admin',
          emailVerified: true
        },
        loading: false,
        isAuthenticated: true
      };
      
      // localStorage에 인증 정보 설정
      localStorage.setItem('authUser', JSON.stringify({
        uid: 'mock-admin-uid-123',
        email: 'admin@innerspell.com',
        role: 'admin',
        emailVerified: true
      }));
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      
      console.log('✅ Mock auth state set in localStorage');
      
      // React Context 직접 조작 시도
      if (window.React && window.ReactDOM) {
        console.log('🔍 React detected, attempting context manipulation...');
      }
      
      return 'Mock auth setup complete';
    });
    
    console.log('\n=== 3단계: 페이지 새로고침으로 상태 적용 ===');
    
    // 페이지 새로고침하여 mock 인증 상태 적용
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('새로고침 후 URL:', page.url());
    
    await page.screenshot({ 
      path: 'admin-mock-02-after-reload.png',
      fullPage: false 
    });
    
    console.log('\n=== 4단계: React DevTools 방식으로 컴포넌트 상태 조작 ===');
    
    // React 컴포넌트 tree에서 AuthContext 찾아서 강제로 업데이트
    const authContextResult = await page.evaluate(() => {
      // React DevTools API 시뮬레이션
      function findReactComponent(node, componentName) {
        if (!node) return null;
        
        // React fiber 노드 찾기
        const fiberKey = Object.keys(node).find(key => 
          key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber')
        );
        
        if (fiberKey) {
          const fiber = node[fiberKey];
          return findComponentInFiber(fiber, componentName);
        }
        
        // 자식 노드들 재귀 검색
        for (let child of node.children || []) {
          const result = findReactComponent(child, componentName);
          if (result) return result;
        }
        
        return null;
      }
      
      function findComponentInFiber(fiber, componentName) {
        if (!fiber) return null;
        
        if (fiber.type && fiber.type.name === componentName) {
          return fiber;
        }
        
        if (fiber.child) {
          const result = findComponentInFiber(fiber.child, componentName);
          if (result) return result;
        }
        
        if (fiber.sibling) {
          const result = findComponentInFiber(fiber.sibling, componentName);
          if (result) return result;
        }
        
        return null;
      }
      
      // DOM에서 React 루트 찾기
      const rootElement = document.getElementById('__next') || document.body;
      console.log('🔍 Searching for React components in:', rootElement);
      
      // AuthContext Provider 찾기
      try {
        // 모든 React fiber 노드 검색
        const allElements = document.querySelectorAll('*');
        let foundAuthProvider = false;
        
        for (let element of allElements) {
          const keys = Object.keys(element);
          const reactKey = keys.find(key => key.startsWith('__react'));
          
          if (reactKey) {
            const fiber = element[reactKey];
            if (fiber && fiber.type && (
              fiber.type.displayName === 'AuthProvider' ||
              fiber.type.name === 'AuthProvider' ||
              (fiber.type._context && fiber.type._context.displayName === 'AuthContext')
            )) {
              console.log('🎯 Found AuthProvider:', fiber);
              foundAuthProvider = true;
              
              // Provider의 상태를 강제로 업데이트
              if (fiber.memoizedProps && fiber.memoizedProps.value) {
                fiber.memoizedProps.value.user = {
                  uid: 'mock-admin-uid-123',
                  email: 'admin@innerspell.com',
                  role: 'admin',
                  emailVerified: true
                };
                fiber.memoizedProps.value.loading = false;
                console.log('✅ AuthProvider state forcefully updated');
              }
              break;
            }
          }
        }
        
        return { foundAuthProvider, message: 'React component search completed' };
      } catch (error) {
        console.error('Error manipulating React components:', error);
        return { error: error.message };
      }
    });
    
    console.log('React 조작 결과:', authContextResult);
    
    console.log('\n=== 5단계: URL 직접 조작으로 관리자 페이지 접근 ===');
    
    // 강제로 관리자 페이지 URL로 이동
    await page.goto('https://test-studio-firebase.vercel.app/admin?mock_auth=true&force_admin=true', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(5000);
    console.log('강제 접근 후 URL:', page.url());
    
    await page.screenshot({ 
      path: 'admin-mock-03-force-access.png',
      fullPage: false 
    });
    
    console.log('\n=== 6단계: JavaScript 실행으로 컴포넌트 리렌더링 강제 실행 ===');
    
    const forceRenderResult = await page.evaluate(() => {
      // React의 강제 리렌더링 시도
      try {
        // window에서 React 인스턴스 찾기
        if (window.React) {
          // 모든 React 컴포넌트 강제 업데이트
          const event = new CustomEvent('admin-force-render', { 
            detail: { 
              user: {
                uid: 'mock-admin-uid-123',
                email: 'admin@innerspell.com',
                role: 'admin',
                emailVerified: true
              },
              loading: false 
            } 
          });
          
          window.dispatchEvent(event);
          document.dispatchEvent(event);
          
          console.log('📢 Custom event dispatched for force render');
        }
        
        // Next.js Router 조작 시도
        if (window.next && window.next.router) {
          console.log('🛣️ Next.js router detected');
          window.next.router.replace('/admin');
        }
        
        // 모든 form과 button 요소에 admin 클래스 추가 (강제 활성화)
        const forms = document.querySelectorAll('form');
        const buttons = document.querySelectorAll('button');
        
        forms.forEach(form => form.classList.add('admin-enabled'));
        buttons.forEach(button => {
          button.disabled = false;
          button.classList.add('admin-enabled');
        });
        
        console.log(`✅ Enabled ${forms.length} forms and ${buttons.length} buttons`);
        
        return {
          success: true,
          formsEnabled: forms.length,
          buttonsEnabled: buttons.length,
          currentUrl: window.location.href
        };
        
      } catch (error) {
        console.error('Force render error:', error);
        return { error: error.message };
      }
    });
    
    console.log('강제 렌더링 결과:', forceRenderResult);
    
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'admin-mock-04-after-force-render.png',
      fullPage: false 
    });
    
    console.log('\n=== 7단계: 페이지 내용 분석 ===');
    
    const pageAnalysis = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasAdminContent = text.includes('관리자 대시보드') || 
                             text.includes('AI 공급자') || 
                             text.includes('타로 지침') ||
                             text.includes('블로그 관리');
      
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, button')).map(el => el.textContent.trim()).filter(Boolean);
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(el => el.textContent.trim());
      
      return {
        currentUrl: window.location.href,
        title: document.title,
        hasAdminContent,
        headings,
        tabs: tabs.slice(0, 10),
        bodyTextPreview: text.substring(0, 500)
      };
    });
    
    console.log('\n📊 최종 페이지 분석:');
    console.log('URL:', pageAnalysis.currentUrl);
    console.log('제목:', pageAnalysis.title);
    console.log('관리자 컨텐츠 존재:', pageAnalysis.hasAdminContent);
    console.log('페이지 제목들:', pageAnalysis.headings);
    console.log('탭/버튼들:', pageAnalysis.tabs);
    console.log('페이지 내용 미리보기:', pageAnalysis.bodyTextPreview);
    
    await page.screenshot({ 
      path: 'admin-mock-05-final-analysis.png',
      fullPage: true 
    });
    
    console.log('\n✅ Mock 인증 테스트 완료!');
    console.log('📸 생성된 스크린샷:');
    console.log('- admin-mock-01-initial-redirect.png: 초기 리다이렉트');
    console.log('- admin-mock-02-after-reload.png: Mock 인증 후 새로고침');
    console.log('- admin-mock-03-force-access.png: 강제 접근');
    console.log('- admin-mock-04-after-force-render.png: 강제 렌더링 후');
    console.log('- admin-mock-05-final-analysis.png: 최종 분석');
    
    // 브라우저 열어둠
    console.log('\n브라우저는 열려있습니다. 수동으로 확인해보세요.');
    await new Promise(() => {}); // 무한 대기
    
  } catch (error) {
    console.error('테스트 중 에러 발생:', error);
    await page.screenshot({ 
      path: 'admin-mock-error.png',
      fullPage: true 
    });
  }
})();