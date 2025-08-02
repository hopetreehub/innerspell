import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://test-studio-firebase.vercel.app';

test.describe('Performance & Optimization Tests', () => {
  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const metrics = await page.goto(VERCEL_URL).then(async () => {
        return await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });
      });

      console.log('Performance Metrics:', metrics);
      
      // Performance budgets
      expect(metrics.domInteractive).toBeLessThan(3000); // 3 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2 seconds
    });

    test('should lazy load images efficiently', async ({ page }) => {
      await page.goto(VERCEL_URL);
      
      // Get all images
      const images = await page.locator('img').all();
      console.log(`Found ${images.length} images on the page`);
      
      // Check for lazy loading attributes
      let lazyLoadedCount = 0;
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        if (loading === 'lazy') {
          lazyLoadedCount++;
        }
      }
      
      console.log(`${lazyLoadedCount} images are lazy loaded`);
    });
  });

  test.describe('Cache Performance', () => {
    test('should cache static assets properly', async ({ page }) => {
      const cachedResources: { url: string; cacheControl: string }[] = [];
      
      page.on('response', response => {
        const headers = response.headers();
        const cacheControl = headers['cache-control'];
        
        if (cacheControl && response.url().includes(VERCEL_URL)) {
          cachedResources.push({
            url: response.url(),
            cacheControl: cacheControl
          });
        }
      });
      
      await page.goto(VERCEL_URL);
      await page.waitForLoadState('networkidle');
      
      // Check static assets have proper cache headers
      const staticAssets = cachedResources.filter(r => 
        r.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/i)
      );
      
      console.log(`Found ${staticAssets.length} static assets with cache headers`);
      
      for (const asset of staticAssets.slice(0, 5)) { // Check first 5
        console.log(`Cache-Control for ${asset.url.split('/').pop()}: ${asset.cacheControl}`);
      }
    });

    test('should handle browser cache on navigation', async ({ page }) => {
      // First visit
      const firstVisitStart = Date.now();
      await page.goto(VERCEL_URL);
      const firstVisitTime = Date.now() - firstVisitStart;
      
      // Navigate to another page
      await page.goto(`${VERCEL_URL}/tarot`);
      
      // Navigate back
      const secondVisitStart = Date.now();
      await page.goto(VERCEL_URL);
      const secondVisitTime = Date.now() - secondVisitStart;
      
      console.log(`First visit: ${firstVisitTime}ms`);
      console.log(`Second visit (cached): ${secondVisitTime}ms`);
      
      // Second visit should be faster due to caching
      expect(secondVisitTime).toBeLessThan(firstVisitTime);
    });
  });

  test.describe('Bundle Size & Code Splitting', () => {
    test('should load JavaScript bundles efficiently', async ({ page }) => {
      const jsFiles: { url: string; size: number }[] = [];
      
      page.on('response', async response => {
        if (response.url().endsWith('.js') && response.ok()) {
          const buffer = await response.body();
          jsFiles.push({
            url: response.url(),
            size: buffer.length
          });
        }
      });
      
      await page.goto(VERCEL_URL);
      await page.waitForLoadState('networkidle');
      
      // Calculate total JS size
      const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
      
      console.log(`Total JavaScript: ${totalSizeMB}MB across ${jsFiles.length} files`);
      
      // Check if code splitting is working (multiple chunks)
      expect(jsFiles.length).toBeGreaterThan(1);
      
      // Total JS should be reasonable
      expect(totalSize).toBeLessThan(5 * 1024 * 1024); // 5MB limit
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have memory leaks on navigation', async ({ page }) => {
      await page.goto(VERCEL_URL);
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate through multiple pages
      const pages = ['/tarot', '/dream-interpretation', '/tarot-spread', '/'];
      
      for (const path of pages) {
        await page.goto(`${VERCEL_URL}${path}`);
        await page.waitForLoadState('networkidle');
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      // Check memory after navigation
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increasePercentage = (memoryIncrease / initialMemory) * 100;
        
        console.log(`Memory increase: ${increasePercentage.toFixed(2)}%`);
        
        // Memory increase should be reasonable
        expect(increasePercentage).toBeLessThan(50); // Less than 50% increase
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      let requestCount = 0;
      
      page.on('request', () => {
        requestCount++;
      });
      
      await page.goto(VERCEL_URL);
      await page.waitForLoadState('networkidle');
      
      console.log(`Total network requests: ${requestCount}`);
      
      // Should have reasonable number of requests
      expect(requestCount).toBeLessThan(100); // Less than 100 requests
    });

    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow 3G
      await page.context().route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto(VERCEL_URL);
      const loadTime = Date.now() - startTime;
      
      console.log(`Load time on slow network: ${loadTime}ms`);
      
      // Should still load within reasonable time
      expect(loadTime).toBeLessThan(15000); // 15 seconds on slow network
      
      // Check if loading indicators are shown
      const loadingIndicators = page.locator('.loading, [class*="loading"], .skeleton');
      if (await loadingIndicators.count() > 0) {
        console.log('Loading indicators displayed on slow network');
      }
    });
  });

  test.describe('Resource Optimization', () => {
    test('should optimize image formats and sizes', async ({ page }) => {
      const images: { src: string; size: number; format: string }[] = [];
      
      page.on('response', async response => {
        const url = response.url();
        if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) && response.ok()) {
          const buffer = await response.body();
          const format = url.split('.').pop()?.toLowerCase() || 'unknown';
          
          images.push({
            src: url,
            size: buffer.length,
            format: format
          });
        }
      });
      
      await page.goto(VERCEL_URL);
      await page.waitForLoadState('networkidle');
      
      // Check image optimization
      for (const img of images) {
        const sizeMB = (img.size / 1024 / 1024).toFixed(2);
        console.log(`Image: ${img.src.split('/').pop()} - ${sizeMB}MB (${img.format})`);
        
        // Images should be reasonably sized
        expect(img.size).toBeLessThan(2 * 1024 * 1024); // 2MB per image
      }
      
      // Check for modern formats
      const modernFormats = images.filter(img => ['webp', 'avif'].includes(img.format));
      if (modernFormats.length > 0) {
        console.log(`Using modern image formats: ${modernFormats.length} images`);
      }
    });

    test('should minimize CSS and JavaScript', async ({ page }) => {
      const resources: { url: string; minified: boolean }[] = [];
      
      page.on('response', async response => {
        const url = response.url();
        if (url.match(/\.(css|js)$/) && response.ok()) {
          const text = await response.text();
          
          // Simple minification check
          const hasNewlines = text.includes('\n\n');
          const hasComments = text.includes('/*') || text.includes('//');
          const minified = !hasNewlines && !hasComments;
          
          resources.push({
            url: url,
            minified: minified
          });
        }
      });
      
      await page.goto(VERCEL_URL);
      await page.waitForLoadState('networkidle');
      
      const minifiedCount = resources.filter(r => r.minified).length;
      console.log(`${minifiedCount}/${resources.length} resources are minified`);
      
      // Most resources should be minified
      expect(minifiedCount).toBeGreaterThan(resources.length * 0.8); // 80% minified
    });
  });

  test.describe('Accessibility Performance', () => {
    test('should meet accessibility performance standards', async ({ page }) => {
      await page.goto(VERCEL_URL);
      
      // Check for focus visible indicators
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (el) {
          const styles = window.getComputedStyle(el);
          return {
            hasOutline: styles.outline !== 'none',
            hasBorder: styles.borderStyle !== 'none',
            hasBoxShadow: styles.boxShadow !== 'none'
          };
        }
        return null;
      });
      
      if (focusedElement) {
        const hasFocusIndicator = 
          focusedElement.hasOutline || 
          focusedElement.hasBorder || 
          focusedElement.hasBoxShadow;
        
        expect(hasFocusIndicator).toBe(true);
        console.log('Focus indicators are properly implemented');
      }
      
      // Check color contrast
      const lowContrastElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const lowContrast: string[] = [];
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Simple contrast check (would need proper algorithm in production)
          if (color === backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
            lowContrast.push(el.tagName);
          }
        });
        
        return lowContrast;
      });
      
      console.log(`Found ${lowContrastElements.length} potential contrast issues`);
    });
  });
});

// After all tests complete
test.afterAll(async () => {
  console.log('\n=== Performance Test Suite Completed ===');
  console.log('All performance metrics have been evaluated');
});