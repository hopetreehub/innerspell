const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runPlaywrightPerformanceAudit() {
  const url = 'https://test-studio-firebase-ef4iv9ht9-johns-projects-bf5e60f3.vercel.app';
  
  console.log(`🔍 Running Performance audit with Playwright on: ${url}`);
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track performance metrics
  let metrics = {};
  let navigationTiming = {};
  let resourceLoadTimes = [];

  // Listen to console logs for Core Web Vitals
  page.on('console', msg => {
    if (msg.text().includes('Core Web Vitals')) {
      console.log('📊', msg.text());
    }
  });

  try {
    console.log('🚀 Starting navigation...');
    
    // Navigate to the page
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    
    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()}`);
    }

    console.log('✅ Page loaded successfully');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation timing
        navigationTiming: {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          domComplete: navigation.domComplete - navigation.fetchStart,
          responseTime: navigation.responseEnd - navigation.requestStart,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize
        },
        
        // Paint timing
        paintTiming: {
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        },
        
        // Resource timing
        resources: performance.getEntriesByType('resource').map(resource => ({
          name: resource.name,
          duration: resource.duration,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          type: resource.initiatorType
        }))
      };
    });

    // Get layout shift metrics using Web Vitals API if available
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        let resolved = false;
        
        // Try to get CLS from observer
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                  vitals.cls = (vitals.cls || 0) + entry.value;
                }
                if (entry.entryType === 'largest-contentful-paint') {
                  vitals.lcp = entry.startTime;
                }
              }
            });
            observer.observe({ entryTypes: ['layout-shift', 'largest-contentful-paint'] });
          } catch (e) {
            console.log('Performance Observer not available');
          }
        }
        
        // Fallback timeout
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(vitals);
          }
        }, 3000);
      });
    });

    // Get bundle size information
    const bundleInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const images = Array.from(document.querySelectorAll('img'));
      
      return {
        scripts: scripts.map(s => s.src),
        styles: styles.map(s => s.href),
        images: images.map(img => ({
          src: img.src,
          loading: img.loading,
          width: img.width,
          height: img.height
        }))
      };
    });

    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'performance-audit-screenshot.png',
      fullPage: true 
    });

    // Compile results
    const audit = {
      url,
      timestamp: new Date().toISOString(),
      metrics: {
        // Core Web Vitals (converted to seconds where appropriate)
        firstContentfulPaint: (performanceMetrics.paintTiming.firstContentfulPaint / 1000).toFixed(3),
        largestContentfulPaint: webVitals.lcp ? (webVitals.lcp / 1000).toFixed(3) : 'N/A',
        cumulativeLayoutShift: webVitals.cls ? webVitals.cls.toFixed(3) : 'N/A',
        
        // Navigation metrics (converted to seconds)
        domContentLoaded: (performanceMetrics.navigationTiming.domContentLoaded / 1000).toFixed(3),
        domInteractive: (performanceMetrics.navigationTiming.domInteractive / 1000).toFixed(3),
        domComplete: (performanceMetrics.navigationTiming.domComplete / 1000).toFixed(3),
        responseTime: (performanceMetrics.navigationTiming.responseTime / 1000).toFixed(3),
        
        // Size metrics (converted to MB/KB)
        transferSize: (performanceMetrics.navigationTiming.transferSize / 1024).toFixed(0) + 'KB',
        encodedBodySize: (performanceMetrics.navigationTiming.encodedBodySize / 1024).toFixed(0) + 'KB',
        decodedBodySize: (performanceMetrics.navigationTiming.decodedBodySize / 1024).toFixed(0) + 'KB'
      },
      
      resourceSummary: {
        totalResources: performanceMetrics.resources.length,
        scriptCount: bundleInfo.scripts.length,
        styleCount: bundleInfo.styles.length,
        imageCount: bundleInfo.images.length,
        
        // Resource breakdown by type
        byType: performanceMetrics.resources.reduce((acc, resource) => {
          acc[resource.type] = (acc[resource.type] || 0) + 1;
          return acc;
        }, {}),
        
        // Size breakdown
        totalTransferSize: performanceMetrics.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        averageResourceLoadTime: performanceMetrics.resources.reduce((sum, r) => sum + r.duration, 0) / performanceMetrics.resources.length
      },
      
      opportunities: []
    };

    // Analyze and add optimization opportunities
    if (parseFloat(audit.metrics.firstContentfulPaint) > 1.0) {
      audit.opportunities.push('🔴 First Contentful Paint is > 1.0s - Optimize critical rendering path');
    }
    
    if (audit.metrics.largestContentfulPaint !== 'N/A' && parseFloat(audit.metrics.largestContentfulPaint) > 2.0) {
      audit.opportunities.push('🔴 Largest Contentful Paint is > 2.0s - Optimize LCP element');
    }
    
    if (audit.metrics.cumulativeLayoutShift !== 'N/A' && parseFloat(audit.metrics.cumulativeLayoutShift) > 0.05) {
      audit.opportunities.push('🔴 Cumulative Layout Shift is > 0.05 - Fix layout shifts');
    }
    
    if (parseFloat(audit.metrics.domInteractive) > 3.0) {
      audit.opportunities.push('🟡 Time to Interactive is > 3.0s - Optimize JavaScript execution');
    }
    
    if (audit.resourceSummary.totalTransferSize > 2 * 1024 * 1024) { // 2MB
      audit.opportunities.push('🟡 Total transfer size > 2MB - Implement code splitting');
    }
    
    if (bundleInfo.images.some(img => !img.loading || img.loading === 'eager')) {
      audit.opportunities.push('🟡 Images not using lazy loading - Implement lazy loading');
    }

    // Generate comprehensive report
    const report = `
# 🔍 Performance Audit Report
**URL**: ${audit.url}
**Date**: ${audit.timestamp}

## ⚡ Core Web Vitals
- **First Contentful Paint (FCP)**: ${audit.metrics.firstContentfulPaint}s (Target: <1.0s)
- **Largest Contentful Paint (LCP)**: ${audit.metrics.largestContentfulPaint}s (Target: <2.0s)
- **Cumulative Layout Shift (CLS)**: ${audit.metrics.cumulativeLayoutShift} (Target: <0.05)

## 📊 Navigation Metrics
- **DOM Content Loaded**: ${audit.metrics.domContentLoaded}s
- **DOM Interactive**: ${audit.metrics.domInteractive}s
- **DOM Complete**: ${audit.metrics.domComplete}s
- **Response Time**: ${audit.metrics.responseTime}s

## 📈 Resource Analysis
- **Total Resources**: ${audit.resourceSummary.totalResources}
- **Scripts**: ${audit.resourceSummary.scriptCount}
- **Stylesheets**: ${audit.resourceSummary.styleCount}
- **Images**: ${audit.resourceSummary.imageCount}
- **Transfer Size**: ${audit.metrics.transferSize}
- **Encoded Body Size**: ${audit.metrics.encodedBodySize}
- **Decoded Body Size**: ${audit.metrics.decodedBodySize}
- **Average Resource Load Time**: ${audit.resourceSummary.averageResourceLoadTime.toFixed(0)}ms

## 🎯 Performance Goals Status
${parseFloat(audit.metrics.firstContentfulPaint) <= 1.0 ? '✅' : '❌'} FCP: ${audit.metrics.firstContentfulPaint}s (Target: <1.0s)
${audit.metrics.largestContentfulPaint !== 'N/A' && parseFloat(audit.metrics.largestContentfulPaint) <= 2.0 ? '✅' : '❌'} LCP: ${audit.metrics.largestContentfulPaint}s (Target: <2.0s)
${audit.metrics.cumulativeLayoutShift !== 'N/A' && parseFloat(audit.metrics.cumulativeLayoutShift) <= 0.05 ? '✅' : '❌'} CLS: ${audit.metrics.cumulativeLayoutShift} (Target: <0.05)
${parseFloat(audit.metrics.domInteractive) <= 3.0 ? '✅' : '❌'} TTI: ${audit.metrics.domInteractive}s (Target: <3.0s)

## 🚨 Optimization Opportunities
${audit.opportunities.map(opp => opp).join('\n')}
${audit.opportunities.length === 0 ? '✅ No major optimization opportunities detected!' : ''}

## 🔧 Next Steps
1. **Bundle Analysis**: Run \`npm run analyze\` to examine bundle composition
2. **Image Optimization**: Implement Next.js Image component with proper sizing
3. **Code Splitting**: Split large components and libraries
4. **Caching Strategy**: Implement proper caching headers
5. **Core Web Vitals Monitoring**: Set up real user monitoring
`;

    console.log(report);
    
    // Save reports
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportsDir, `playwright-performance-${Date.now()}.md`),
      report
    );
    
    fs.writeFileSync(
      path.join(reportsDir, `performance-data-${Date.now()}.json`),
      JSON.stringify(audit, null, 2)
    );

    return audit;

  } catch (error) {
    console.error('❌ Performance audit failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the audit
runPlaywrightPerformanceAudit()
  .then(audit => {
    console.log('\n✅ Performance audit completed successfully!');
    console.log('📁 Reports saved to /reports directory');
    console.log('📸 Screenshot saved as performance-audit-screenshot.png');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Performance audit failed:', error);
    process.exit(1);
  });