# Tarot Image Optimization Strategy

## Overview
This document outlines the image optimization strategy for the tarot card application, ensuring optimal performance while maintaining separate image sets for different features.

## Image Sets Configuration

### 1. Original Images (/public/images/tarot/)
- **Purpose**: Used in the tarot encyclopedia/menu
- **Format**: JPG files
- **Size**: Original high-quality images
- **Features**: 
  - Card details page
  - Card browsing/encyclopedia
  - Card information display

### 2. New Images (/public/images/tarot-spread/)
- **Purpose**: Used in card reading/spreading functionality
- **Format**: PNG files (better for mystical/transparent effects)
- **Size**: Optimized for reading interface
- **Features**:
  - Card reading/spreading
  - Card selection
  - Reading results

## Performance Optimization Techniques

### 1. Next.js Image Optimization
```typescript
// Automatic format conversion and size optimization
<Image
  src={imagePath}
  alt={alt}
  width={275}
  height={475}
  sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 240px"
  quality={85}
  placeholder="empty"
  priority={index < 10} // Priority load first 10 cards
/>
```

### 2. Lazy Loading Strategy
- First 10 cards in reading spread: `priority=true`
- Encyclopedia first 6 cards per page: `priority=true`
- Remaining cards: Lazy loaded with intersection observer
- Root margin: 50px for early loading

### 3. Image Preloading
```typescript
// Preload cards that will be used soon
await preloadTarotImages('reading', ['major-0', 'major-1', 'major-2']);
```

### 4. Responsive Image Sizes
- Mobile (< 640px): 140px width
- Tablet (640-768px): 180px width
- Desktop (> 768px): 240px width

### 5. WebP Format Conversion
Next.js automatically serves WebP format to supported browsers, reducing file size by ~30%.

### 6. CDN and Caching
- Images served through Vercel's CDN
- Browser caching headers set to 1 year
- Immutable cache control for static assets

## Implementation Details

### 1. Configuration File
`/src/config/tarot-images.ts` - Centralized configuration for all image paths and optimization settings.

### 2. Custom Hook
`/src/hooks/useTarotImage.ts` - Manages image loading states and preloading.

### 3. Optimized Components
- `TarotCardImage.tsx` - Optimized image component with loading states
- `TarotCardDisplay.tsx` - Unified display component for both features

### 4. Migration Utility
`/src/utils/tarot-image-migration.ts` - Utilities for migrating between image sets.

## Performance Metrics

### Target Metrics
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Image load time: < 1s on 3G connection

### Monitoring
- Use Vercel Analytics for performance monitoring
- Regular Lighthouse audits
- User experience tracking

## Future Optimizations

1. **Progressive Image Loading**
   - Show low-quality placeholder first
   - Load high-quality image progressively

2. **Offline Support**
   - Cache card images in service worker
   - Enable offline card reading

3. **Dynamic Import**
   - Load card data on demand
   - Split bundles by card suit

4. **Image Sprite for Card Backs**
   - Combine multiple card back variations into sprite
   - Reduce HTTP requests

5. **AI-Powered Compression**
   - Use AI tools to optimize image quality vs size
   - Maintain visual quality at lower file sizes

## Maintenance Guidelines

1. **Adding New Cards**
   - Add images to both directories
   - Update `filenameMap` in configuration
   - Test both features after adding

2. **Image Updates**
   - Update in appropriate directory
   - Clear CDN cache if needed
   - Test loading performance

3. **Performance Testing**
   - Run Lighthouse tests monthly
   - Monitor user metrics
   - Optimize based on real usage data