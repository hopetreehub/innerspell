import { test } from '@playwright/test';

test('디버그 - 페이지 요소 확인', async ({ page }) => {
  // 페이지로 이동
  await page.goto('http://localhost:4000/community/reading-share/new');
  
  // 페이지 로드 대기
  await page.waitForLoadState('networkidle');
  
  // 스크린샷 저장
  await page.screenshot({ path: 'debug-page.png', fullPage: true });
  
  // 모든 input 요소 찾기
  const inputs = await page.locator('input').all();
  console.log(`찾은 input 개수: ${inputs.length}`);
  
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const id = await inputs[i].getAttribute('id');
    console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}", id="${id}"`);
  }
  
  // 모든 textarea 요소 찾기
  const textareas = await page.locator('textarea').all();
  console.log(`\n찾은 textarea 개수: ${textareas.length}`);
  
  for (let i = 0; i < textareas.length; i++) {
    const placeholder = await textareas[i].getAttribute('placeholder');
    const name = await textareas[i].getAttribute('name');
    const id = await textareas[i].getAttribute('id');
    console.log(`Textarea ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
  }
  
  // 모든 select 요소 찾기
  const selects = await page.locator('select').all();
  console.log(`\n찾은 select 개수: ${selects.length}`);
  
  // 모든 button 요소 찾기
  const buttons = await page.locator('button').all();
  console.log(`\n찾은 button 개수: ${buttons.length}`);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    console.log(`Button ${i}: "${text?.trim()}"`);
  }
  
  // h2 요소들 찾기 (섹션 제목)
  const h2s = await page.locator('h2').all();
  console.log(`\n찾은 h2 개수: ${h2s.length}`);
  
  for (let i = 0; i < h2s.length; i++) {
    const text = await h2s[i].textContent();
    console.log(`H2 ${i}: "${text?.trim()}"`);
  }
});