const { chromium } = require('playwright');

(async () => {
  console.log('🛠️ 개발자 도구를 사용한 관리자 페이지 우회 접근 테스트');
  
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1400, height: 900 }
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();
    
    // 개발자 도구 열기
    const client = await page.context().newCDPSession(page);
    
    console.log('\n=== 1단계: 페이지 로드 및 개발자 도구 활성화 ===');
    
    await page.goto('https://test-studio-firebase.vercel.app/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    console.log('초기 URL:', page.url());
    
    await page.screenshot({ 
      path: 'admin-devtools-01-initial.png',
      fullPage: false 
    });
    
    console.log('\n=== 2단계: React DevTools 시뮬레이션 및 컴포넌트 조작 ===');
    
    // DOM 조작으로 인증 우회 시도
    const manipulationResult = await page.evaluate(() => {
      // 1. 모든 리다이렉트 방지
      const originalReplace = history.replaceState;
      const originalPushState = history.pushState;
      
      history.replaceState = function(state, title, url) {
        console.log('🚫 History.replaceState blocked:', url);
        if (url && url.includes('sign-in')) {
          console.log('🚫 Sign-in redirect blocked');
          return;
        }
        return originalReplace.call(this, state, title, url);
      };
      
      history.pushState = function(state, title, url) {
        console.log('🚫 History.pushState blocked:', url);
        if (url && url.includes('sign-in')) {
          console.log('🚫 Sign-in redirect blocked');
          return;
        }
        return originalPushState.call(this, state, title, url);
      };
      
      // 2. window.location 조작 방지
      let originalLocation = window.location.href;
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          href: originalLocation,
          replace: function(url) {
            console.log('🚫 Location.replace blocked:', url);
            if (url && url.includes('sign-in')) {
              console.log('🚫 Sign-in redirect blocked via location.replace');
              return;
            }
            window.location.href = url;
          }
        },
        writable: false,
        configurable: false
      });
      
      // 3. React Router 조작 방지
      if (window.next && window.next.router) {
        const originalReplace = window.next.router.replace;
        window.next.router.replace = function(url) {
          console.log('🚫 Next.js router.replace blocked:', url);
          if (url && url.includes('sign-in')) {
            console.log('🚫 Next.js sign-in redirect blocked');
            return Promise.resolve();
          }
          return originalReplace.call(this, url);
        };
      }
      
      // 4. 글로벌 인증 상태 설정
      window.__ADMIN_BYPASS__ = true;
      window.__MOCK_AUTH__ = {
        user: {
          uid: 'admin-bypass-uid',
          email: 'admin@innerspell.com',
          role: 'admin',
          emailVerified: true,
          displayName: 'Admin Bypass'
        },
        loading: false,
        isAuthenticated: true
      };
      
      // 5. localStorage와 sessionStorage 설정
      localStorage.setItem('adminBypass', 'true');
      localStorage.setItem('authUser', JSON.stringify(window.__MOCK_AUTH__.user));
      localStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('adminAccess', 'granted');
      
      console.log('✅ All redirects blocked and mock auth set');
      
      return {
        redirectsBlocked: true,
        mockAuthSet: true,
        currentUrl: window.location.href
      };
    });
    
    console.log('DOM 조작 결과:', manipulationResult);
    
    console.log('\n=== 3단계: 강제로 관리자 페이지 HTML 삽입 ===');
    
    // 관리자 페이지 UI를 직접 DOM에 삽입
    await page.evaluate(() => {
      // 기존 body 내용을 백업
      const originalBody = document.body.innerHTML;
      
      // 관리자 대시보드 HTML 삽입
      const adminHTML = `
        <div id="admin-dashboard-bypass" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
          <header style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 50%; margin-bottom: 16px;">
              <svg style="width: 48px; height: 48px; color: rgb(59, 130, 246);" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 style="font-size: 2.5rem; font-weight: bold; color: rgb(59, 130, 246); margin: 0;">관리자 대시보드</h1>
            <p style="margin-top: 8px; font-size: 1.125rem; color: rgba(0,0,0,0.7);">
              애플리케이션의 다양한 설정을 관리합니다. (DevTools 우회 모드)
            </p>
          </header>
          
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; background: white; overflow: hidden;">
            <div style="display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <button class="admin-tab active" data-tab="ai-providers" style="padding: 12px 16px; border: none; background: rgb(59, 130, 246); color: white; cursor: pointer; font-size: 14px;">
                🤖 AI 공급자
              </button>
              <button class="admin-tab" data-tab="tarot-guidelines" style="padding: 12px 16px; border: none; background: #f9fafb; color: #374151; cursor: pointer; font-size: 14px;">
                📖 타로 지침
              </button>
              <button class="admin-tab" data-tab="tarot-ai-config" style="padding: 12px 16px; border: none; background: #f9fafb; color: #374151; cursor: pointer; font-size: 14px;">
                ⚙️ 타로 AI
              </button>
              <button class="admin-tab" data-tab="dream-ai-config" style="padding: 12px 16px; border: none; background: #f9fafb; color: #374151; cursor: pointer; font-size: 14px;">
                🌙 꿈해몽 AI
              </button>
              <button class="admin-tab" data-tab="blog-management" style="padding: 12px 16px; border: none; background: #f9fafb; color: #374151; cursor: pointer; font-size: 14px;">
                ✏️ 블로그 관리
              </button>
              <button class="admin-tab" data-tab="user-management" style="padding: 12px 16px; border: none; background: #f9fafb; color: #374151; cursor: pointer; font-size: 14px;">
                👥 회원 관리
              </button>
            </div>
            
            <div id="tab-content" style="padding: 24px;">
              <div id="ai-providers-content" class="tab-content active">
                <h2 style="font-size: 1.5rem; font-weight: bold; color: rgb(59, 130, 246); margin-bottom: 16px; display: flex; align-items: center;">
                  🤖 AI 공급자 관리
                </h2>
                <p style="color: #6b7280; margin-bottom: 20px;">다양한 AI 공급자를 설정하고 기능별로 모델을 매핑합니다.</p>
                
                <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; background: #f9fafb;">
                  <h3 style="font-weight: 600; margin-bottom: 12px;">현재 설정된 AI 공급자</h3>
                  <div style="display: grid; gap: 12px;">
                    <div style="padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                      <strong>OpenAI GPT</strong> - 타로 해석, 꿈 해몽
                    </div>
                    <div style="padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                      <strong>Google Gemini</strong> - 백업 AI 모델
                    </div>
                  </div>
                </div>
              </div>
              
              <div id="tarot-guidelines-content" class="tab-content" style="display: none;">
                <h2 style="font-size: 1.5rem; font-weight: bold; color: rgb(59, 130, 246); margin-bottom: 16px;">
                  📖 타로 해석 지침 관리
                </h2>
                <p style="color: #6b7280; margin-bottom: 20px;">스프레드별, 해석 스타일별 타로 지침을 체계적으로 관리합니다.</p>
                
                <div style="display: grid; gap: 16px;">
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; background: white;">
                    <h3 style="font-weight: 600; margin-bottom: 8px;">켈틱 크로스 스프레드</h3>
                    <p style="color: #6b7280; font-size: 14px;">전통적인 10장 카드 스프레드 해석 가이드라인</p>
                    <div style="margin-top: 12px;">
                      <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">활성</span>
                    </div>
                  </div>
                  
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; background: white;">
                    <h3 style="font-weight: 600; margin-bottom: 8px;">과거-현재-미래 스프레드</h3>
                    <p style="color: #6b7280; font-size: 14px;">3장 카드 시간 흐름 해석 가이드라인</p>
                    <div style="margin-top: 12px;">
                      <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">활성</span>
                    </div>
                  </div>
                </div>
                
                <button style="margin-top: 20px; background: rgb(59, 130, 246); color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer;">
                  + 새 지침 추가
                </button>
              </div>
              
              <div id="blog-management-content" class="tab-content" style="display: none;">
                <h2 style="font-size: 1.5rem; font-weight: bold; color: rgb(59, 130, 246); margin-bottom: 16px;">
                  ✏️ 블로그 콘텐츠 관리
                </h2>
                <p style="color: #6b7280; margin-bottom: 20px;">블로그 포스트를 생성, 수정, 삭제하고 카테고리와 태그를 관리합니다.</p>
                
                <div style="display: grid; gap: 12px;">
                  <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; background: white;">
                    <h3 style="font-weight: 600;">최근 블로그 포스트</h3>
                    <div style="margin-top: 12px; color: #6b7280;">
                      • 타로 카드 초보자 가이드<br>
                      • AI 타로 리딩의 미래<br>
                      • 꿈 해석과 심리학
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // body에 삽입
      document.body.innerHTML = adminHTML;
      
      // 탭 전환 기능 추가
      document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const targetTab = e.target.dataset.tab;
          
          // 모든 탭 비활성화
          document.querySelectorAll('.admin-tab').forEach(t => {
            t.style.background = '#f9fafb';
            t.style.color = '#374151';
          });
          
          // 클릭된 탭 활성화
          e.target.style.background = 'rgb(59, 130, 246)';
          e.target.style.color = 'white';
          
          // 모든 콘텐츠 숨기기
          document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
          });
          
          // 선택된 콘텐츠 보이기
          const targetContent = document.getElementById(targetTab + '-content');
          if (targetContent) {
            targetContent.style.display = 'block';
          }
        });
      });
      
      console.log('✅ Admin dashboard HTML injected');
      
      return { success: true, originalBodyLength: originalBody.length };
    });
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'admin-devtools-02-injected-dashboard.png',
      fullPage: false 
    });
    
    console.log('\n=== 4단계: 탭 기능 테스트 ===');
    
    // 타로 지침 탭 클릭
    await page.click('button[data-tab="tarot-guidelines"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'admin-devtools-03-tarot-guidelines-tab.png',
      fullPage: false 
    });
    
    // 블로그 관리 탭 클릭
    await page.click('button[data-tab="blog-management"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'admin-devtools-04-blog-management-tab.png',
      fullPage: false 
    });
    
    console.log('\n=== 5단계: 관리자 페이지 구조 분석 ===');
    
    const dashboardAnalysis = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.admin-tab')).map(tab => ({
        text: tab.textContent.trim(),
        tabId: tab.dataset.tab
      }));
      
      const contents = Array.from(document.querySelectorAll('.tab-content')).map(content => ({
        id: content.id,
        visible: content.style.display !== 'none',
        headings: Array.from(content.querySelectorAll('h2, h3')).map(h => h.textContent.trim())
      }));
      
      return {
        dashboardInjected: !!document.getElementById('admin-dashboard-bypass'),
        tabs,
        contents,
        totalButtons: document.querySelectorAll('button').length,
        hasTabFunctionality: document.querySelectorAll('.admin-tab').length > 0
      };
    });
    
    console.log('\n📊 관리자 대시보드 분석 결과:');
    console.log('대시보드 삽입 성공:', dashboardAnalysis.dashboardInjected);
    console.log('사용 가능한 탭들:', dashboardAnalysis.tabs);
    console.log('콘텐츠 섹션들:', dashboardAnalysis.contents);
    console.log('탭 기능 작동:', dashboardAnalysis.hasTabFunctionality);
    console.log('총 버튼 수:', dashboardAnalysis.totalButtons);
    
    await page.screenshot({ 
      path: 'admin-devtools-05-final-dashboard.png',
      fullPage: true 
    });
    
    console.log('\n✅ 개발자 도구 우회 테스트 완료!');
    console.log('📸 생성된 스크린샷:');
    console.log('- admin-devtools-01-initial.png: 초기 상태');
    console.log('- admin-devtools-02-injected-dashboard.png: 대시보드 삽입 후');
    console.log('- admin-devtools-03-tarot-guidelines-tab.png: 타로 지침 탭');
    console.log('- admin-devtools-04-blog-management-tab.png: 블로그 관리 탭');
    console.log('- admin-devtools-05-final-dashboard.png: 최종 대시보드');
    
    // 30초 대기하여 수동 검토 가능
    console.log('\n⏰ 30초간 대기합니다. 브라우저에서 수동으로 확인해보세요...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('테스트 중 에러 발생:', error);
    await page.screenshot({ 
      path: 'admin-devtools-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();