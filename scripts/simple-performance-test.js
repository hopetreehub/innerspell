const lighthouse = require('lighthouse');
const fs = require('fs');
const path = require('path');

async function runSimpleLighthouseAudit() {
  const url = 'https://test-studio-firebase-ef4iv9ht9-johns-projects-bf5e60f3.vercel.app';
  
  console.log(`🔍 Running Lighthouse audit on: ${url}`);
  
  try {
    // Use lighthouse CLI approach
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const lighthouse = spawn('npx', [
        'lighthouse',
        url,
        '--output=json',
        '--quiet',
        '--chrome-flags="--headless --no-sandbox --disable-gpu"'
      ]);

      let output = '';
      let errorOutput = '';

      lighthouse.stdout.on('data', (data) => {
        output += data.toString();
      });

      lighthouse.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      lighthouse.on('close', (code) => {
        if (code !== 0) {
          console.error('Lighthouse stderr:', errorOutput);
          reject(new Error(`Lighthouse exited with code ${code}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          const lhr = result;
          
          // Extract key metrics
          const metrics = {
            performance: Math.round(lhr.categories.performance.score * 100),
            accessibility: Math.round(lhr.categories.accessibility.score * 100),
            bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
            seo: Math.round(lhr.categories.seo.score * 100),
            
            // Core Web Vitals
            fcp: lhr.audits['first-contentful-paint'].numericValue,
            lcp: lhr.audits['largest-contentful-paint'].numericValue,
            cls: lhr.audits['cumulative-layout-shift'].numericValue,
            tti: lhr.audits['interactive'].numericValue,
            tbt: lhr.audits['total-blocking-time'].numericValue,
            si: lhr.audits['speed-index'].numericValue,
            
            // Resource metrics
            totalByteWeight: lhr.audits['total-byte-weight'].numericValue,
            bootupTime: lhr.audits['bootup-time'].numericValue,
            
            // Other important metrics
            unusedCssRules: lhr.audits['unused-css-rules']?.details?.overallSavingsBytes || 0,
            unusedJavaScript: lhr.audits['unused-javascript']?.details?.overallSavingsBytes || 0,
            renderBlockingResources: lhr.audits['render-blocking-resources']?.details?.overallSavingsMs || 0,
          };

          // Convert milliseconds to seconds for readability
          const metricsFormatted = {
            ...metrics,
            fcp: (metrics.fcp / 1000).toFixed(2) + 's',
            lcp: (metrics.lcp / 1000).toFixed(2) + 's',
            tti: (metrics.tti / 1000).toFixed(2) + 's',
            tbt: metrics.tbt.toFixed(0) + 'ms',
            si: (metrics.si / 1000).toFixed(2) + 's',
            bootupTime: (metrics.bootupTime / 1000).toFixed(2) + 's',
            totalByteWeight: (metrics.totalByteWeight / 1024 / 1024).toFixed(2) + 'MB',
            unusedCssRules: (metrics.unusedCssRules / 1024).toFixed(0) + 'KB',
            unusedJavaScript: (metrics.unusedJavaScript / 1024).toFixed(0) + 'KB',
            renderBlockingResources: metrics.renderBlockingResources.toFixed(0) + 'ms'
          };

          // Generate report
          const report = `
# 🔍 Performance Audit Report
**URL**: ${url}
**Date**: ${new Date().toISOString()}

## 📊 Lighthouse Scores
- **Performance**: ${metrics.performance}/100
- **Accessibility**: ${metrics.accessibility}/100  
- **Best Practices**: ${metrics.bestPractices}/100
- **SEO**: ${metrics.seo}/100

## ⚡ Core Web Vitals
- **First Contentful Paint (FCP)**: ${metricsFormatted.fcp} (Target: <1.0s)
- **Largest Contentful Paint (LCP)**: ${metricsFormatted.lcp} (Target: <2.0s)
- **Cumulative Layout Shift (CLS)**: ${metrics.cls.toFixed(3)} (Target: <0.05)
- **Time to Interactive (TTI)**: ${metricsFormatted.tti} (Target: <3.0s)
- **Total Blocking Time (TBT)**: ${metricsFormatted.tbt}
- **Speed Index (SI)**: ${metricsFormatted.si}

## 📈 Resource Analysis
- **Total Bundle Size**: ${metricsFormatted.totalByteWeight}
- **Main Thread Bootup Time**: ${metricsFormatted.bootupTime}
- **Unused CSS**: ${metricsFormatted.unusedCssRules}
- **Unused JavaScript**: ${metricsFormatted.unusedJavaScript}
- **Render Blocking Resources**: ${metricsFormatted.renderBlockingResources}

## 🎯 Performance Goals Status
${metrics.performance >= 95 ? '✅' : '❌'} Lighthouse Score: ${metrics.performance}/100 (Target: 95+)
${metrics.fcp <= 1000 ? '✅' : '❌'} FCP: ${metricsFormatted.fcp} (Target: <1.0s)
${metrics.lcp <= 2000 ? '✅' : '❌'} LCP: ${metricsFormatted.lcp} (Target: <2.0s)
${metrics.cls <= 0.05 ? '✅' : '❌'} CLS: ${metrics.cls.toFixed(3)} (Target: <0.05)
${metrics.tti <= 3000 ? '✅' : '❌'} TTI: ${metricsFormatted.tti} (Target: <3.0s)

## 🚨 Top Opportunities
${lhr.audits['unused-css-rules']?.score < 1 ? `- Remove unused CSS (${metricsFormatted.unusedCssRules} savings)` : ''}
${lhr.audits['unused-javascript']?.score < 1 ? `- Remove unused JavaScript (${metricsFormatted.unusedJavaScript} savings)` : ''}
${lhr.audits['render-blocking-resources']?.score < 1 ? `- Eliminate render-blocking resources (${metricsFormatted.renderBlockingResources} savings)` : ''}
${lhr.audits['largest-contentful-paint-element'] ? `- Optimize LCP element: ${lhr.audits['largest-contentful-paint-element'].displayValue}` : ''}
${lhr.audits['total-byte-weight']?.score < 1 ? `- Reduce total bundle size (current: ${metricsFormatted.totalByteWeight})` : ''}

## 🔧 Recommendations
${metrics.performance < 95 ? '1. **Critical**: Improve overall performance score' : ''}
${metrics.fcp > 1000 ? '2. **High**: Optimize First Contentful Paint' : ''}
${metrics.lcp > 2000 ? '3. **High**: Optimize Largest Contentful Paint' : ''}
${metrics.cls > 0.05 ? '4. **High**: Reduce Cumulative Layout Shift' : ''}
${metrics.tti > 3000 ? '5. **Medium**: Improve Time to Interactive' : ''}
${metrics.unusedJavaScript > 50000 ? '6. **Medium**: Code splitting to reduce unused JavaScript' : ''}
${metrics.unusedCssRules > 20000 ? '7. **Medium**: Remove unused CSS rules' : ''}
`;

          console.log(report);
          
          // Save detailed report
          const reportsDir = path.join(__dirname, '..', 'reports');
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
          }
          
          fs.writeFileSync(
            path.join(reportsDir, `performance-audit-${Date.now()}.md`),
            report
          );
          
          // Save raw data
          fs.writeFileSync(
            path.join(reportsDir, `lighthouse-raw-${Date.now()}.json`),
            JSON.stringify(lhr, null, 2)
          );

          resolve(metrics);
        } catch (parseError) {
          reject(new Error(`Failed to parse Lighthouse output: ${parseError.message}`));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    throw error;
  }
}

// Run the audit
runSimpleLighthouseAudit()
  .then(metrics => {
    console.log('\n✅ Performance audit completed successfully!');
    console.log('📁 Reports saved to /reports directory');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Performance audit failed:', error);
    process.exit(1);
  });