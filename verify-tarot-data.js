// 타로 지침 데이터 검증 스크립트
const fs = require('fs');
const path = require('path');

async function verifyTarotData() {
  try {
    console.log('=== 타로 지침 데이터 검증 시작 ===\n');
    
    // 타로 지침 파일 읽기
    const guidelinesPath = path.join(__dirname, 'src', 'data', 'tarot-guidelines.ts');
    const spreadsPath = path.join(__dirname, 'src', 'data', 'tarot-spreads.ts');
    
    if (!fs.existsSync(guidelinesPath)) {
      console.error('❌ 타로 지침 파일을 찾을 수 없습니다:', guidelinesPath);
      return;
    }
    
    if (!fs.existsSync(spreadsPath)) {
      console.error('❌ 타로 스프레드 파일을 찾을 수 없습니다:', spreadsPath);
      return;
    }
    
    console.log('✅ 파일 존재 확인 완료');
    
    // 파일 내용 분석
    const guidelinesContent = fs.readFileSync(guidelinesPath, 'utf8');
    const spreadsContent = fs.readFileSync(spreadsPath, 'utf8');
    
    // 지침 개수 확인
    const guidelineMatches = guidelinesContent.match(/{\s*id:/g) || [];
    const totalGuidelines = guidelineMatches.length;
    console.log(`\n📊 총 지침 개수: ${totalGuidelines}개`);
    
    // 스프레드 개수 확인
    const spreadMatches = spreadsContent.match(/{\s*id:/g) || [];
    const totalSpreads = spreadMatches.length;
    console.log(`📊 총 스프레드 개수: ${totalSpreads}개`);
    
    // 해석 스타일 개수 확인
    const styleMatches = spreadsContent.match(/{\s*id:\s*['"][^'"]*['"],\s*name:/g) || [];
    let totalStyles = 0;
    
    // INTERPRETATION_STYLES 섹션만 카운트
    const stylesSection = spreadsContent.match(/export const INTERPRETATION_STYLES[\s\S]*?(?=export|$)/);
    if (stylesSection) {
      const stylesText = stylesSection[0];
      const styleIdMatches = stylesText.match(/{\s*id:/g) || [];
      totalStyles = styleIdMatches.length;
    }
    console.log(`📊 총 해석 스타일 개수: ${totalStyles}개`);
    
    // 이론적 최대 조합 수
    const maxCombinations = totalSpreads * totalStyles;
    console.log(`📊 이론적 최대 조합: ${maxCombinations}개`);
    
    // 완성도 계산
    const completionRate = totalGuidelines > 0 ? Math.round((totalGuidelines / maxCombinations) * 100) : 0;
    console.log(`📊 현재 완성도: ${completionRate}%`);
    
    // 36개 목표 대비 진행률
    const targetGuidelines = 36;
    const targetProgress = Math.round((totalGuidelines / targetGuidelines) * 100);
    console.log(`📊 36개 목표 대비: ${targetProgress}% (${totalGuidelines}/${targetGuidelines})`);
    
    // 상세 분석
    console.log('\n=== 상세 분석 ===');
    
    // 스프레드별 지침 개수 분석
    const spreadIds = [];
    const spreadMatches2 = spreadsContent.match(/{\s*id:\s*['"]([^'"]+)['"]/g) || [];
    spreadMatches2.forEach(match => {
      const idMatch = match.match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        spreadIds.push(idMatch[1]);
      }
    });
    
    console.log('\n📋 발견된 스프레드 ID들:');
    spreadIds.slice(0, 10).forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });
    
    // 스타일별 지침 개수 분석
    const styleIds = [];
    if (stylesSection) {
      const stylesText = stylesSection[0];
      const styleIdMatches2 = stylesText.match(/{\s*id:\s*['"]([^'"]+)['"]/g) || [];
      styleIdMatches2.forEach(match => {
        const idMatch = match.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) {
          styleIds.push(idMatch[1]);
        }
      });
    }
    
    console.log('\n🎨 발견된 해석 스타일 ID들:');
    styleIds.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`);
    });
    
    // 지침에서 사용된 스프레드와 스타일 분석
    const usedSpreads = new Set();
    const usedStyles = new Set();
    
    const spreadIdMatches = guidelinesContent.match(/spreadId:\s*['"]([^'"]+)['"]/g) || [];
    spreadIdMatches.forEach(match => {
      const idMatch = match.match(/spreadId:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        usedSpreads.add(idMatch[1]);
      }
    });
    
    const styleIdMatches = guidelinesContent.match(/styleId:\s*['"]([^'"]+)['"]/g) || [];
    styleIdMatches.forEach(match => {
      const idMatch = match.match(/styleId:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        usedStyles.add(idMatch[1]);
      }
    });
    
    console.log(`\n📊 지침에서 사용된 스프레드: ${usedSpreads.size}개`);
    console.log(`📊 지침에서 사용된 스타일: ${usedStyles.size}개`);
    
    // 스프레드별 지침 분포
    console.log('\n📊 스프레드별 지침 분포:');
    const spreadDistribution = {};
    [...usedSpreads].forEach(spreadId => {
      const regex = new RegExp(`spreadId:\\s*['"]${spreadId}['"]`, 'g');
      const matches = guidelinesContent.match(regex) || [];
      spreadDistribution[spreadId] = matches.length;
      console.log(`  ${spreadId}: ${matches.length}개`);
    });
    
    // 결과 요약
    console.log('\n=== 최종 검증 결과 ===');
    
    if (totalGuidelines === 36) {
      console.log('✅ 36개 지침 완성 확인!');
    } else {
      console.log(`❌ 36개 목표 미달성: 현재 ${totalGuidelines}개 (${36 - totalGuidelines}개 부족)`);
    }
    
    if (completionRate === 100) {
      console.log('✅ 100% 완성도 달성!');
    } else {
      console.log(`❌ 100% 미달성: 현재 ${completionRate}%`);
    }
    
    // 각 스프레드별로 6개씩 있는지 확인
    const expectedPerSpread = 6;
    let allSpreadsSixEach = true;
    
    console.log('\n📊 스프레드별 6개씩 검증:');
    Object.entries(spreadDistribution).forEach(([spreadId, count]) => {
      if (count === expectedPerSpread) {
        console.log(`✅ ${spreadId}: ${count}개 (목표 달성)`);
      } else {
        console.log(`❌ ${spreadId}: ${count}개 (목표: ${expectedPerSpread}개)`);
        allSpreadsSixEach = false;
      }
    });
    
    if (allSpreadsSixEach && Object.keys(spreadDistribution).length === 6) {
      console.log('\n✅ 모든 스프레드가 6개씩 완성됨!');
    } else {
      console.log('\n❌ 스프레드별 6개씩 목표 미달성');
    }
    
  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
  }
}

verifyTarotData();