#!/usr/bin/env node

/**
 * 블로그 API 응답 디버깅 스크립트
 * Vercel 배포된 API의 실제 응답을 확인
 */

const https = require('https');

// Vercel URL (실제 배포된 URL 사용)
const VERCEL_URL = 'https://test-studio-firebase.vercel.app';
const API_ENDPOINT = '/api/blog/posts';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, error: 'JSON Parse Error' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testBlogAPI() {
  try {
    console.log('🔍 블로그 API 테스트 시작...');
    console.log(`📡 URL: ${VERCEL_URL}${API_ENDPOINT}`);
    console.log('');
    
    const result = await makeRequest(`${VERCEL_URL}${API_ENDPOINT}`);
    
    console.log(`📊 응답 상태: ${result.status}`);
    console.log('');
    
    if (result.error) {
      console.log('❌ JSON 파싱 오류:');
      console.log(result.data);
      return;
    }
    
    if (result.data.posts) {
      console.log(`📝 총 블로그 포스트 수: ${result.data.posts.length}`);
      console.log('');
      console.log('📋 블로그 포스트 목록:');
      
      result.data.posts.forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title}`);
        console.log(`     ID: ${post.id}`);
        console.log(`     Featured: ${post.featured}`);
        console.log(`     Published: ${post.published}`);
        console.log(`     Date: ${post.publishedAt}`);
        console.log('');
      });
      
      // 새로 추가한 포스트 확인
      const newPosts = [
        'tarot-2025-new-year-goals',
        'ai-tarot-vs-traditional-guide',
        'dream-interpretation-complete-guide',
        'tarot-78-cards-complete-guide',
        'modern-spiritual-growth-guide'
      ];
      
      console.log('🆕 새로 추가한 포스트 확인:');
      newPosts.forEach(postId => {
        const found = result.data.posts.find(post => post.id === postId);
        if (found) {
          console.log(`  ✅ ${postId}: 발견됨`);
        } else {
          console.log(`  ❌ ${postId}: 누락됨`);
        }
      });
      
    } else {
      console.log('❌ posts 데이터가 없습니다:');
      console.log(JSON.stringify(result.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
  }
}

// 실행
testBlogAPI();