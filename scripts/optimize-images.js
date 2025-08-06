const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 이미지 최적화 설정
const IMAGE_QUALITY = {
  webp: 85,
  avif: 80,
  jpg: 90
};

const SIZES = {
  tarot: [
    { width: 150, suffix: '-thumb' },
    { width: 300, suffix: '-small' },
    { width: 600, suffix: '-medium' },
    { width: 1200, suffix: '-large' }
  ],
  general: [
    { width: 640, suffix: '-sm' },
    { width: 1024, suffix: '-md' },
    { width: 1920, suffix: '-lg' }
  ]
};

async function optimizeImage(inputPath, outputDir, sizes, prefix = '') {
  try {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${filename}`);
    
    // WebP 변환
    for (const size of sizes) {
      if (metadata.width > size.width) {
        const outputPath = path.join(outputDir, `${prefix}${filename}${size.suffix}.webp`);
        await image
          .resize(size.width, null, { withoutEnlargement: true })
          .webp({ quality: IMAGE_QUALITY.webp })
          .toFile(outputPath);
        console.log(`  ✓ Created: ${path.basename(outputPath)}`);
      }
    }
    
    // 원본 크기 WebP
    const fullWebpPath = path.join(outputDir, `${prefix}${filename}.webp`);
    await sharp(inputPath)
      .webp({ quality: IMAGE_QUALITY.webp })
      .toFile(fullWebpPath);
    console.log(`  ✓ Created: ${path.basename(fullWebpPath)}`);
    
    // 파일 크기 비교
    const originalStats = await fs.stat(inputPath);
    const webpStats = await fs.stat(fullWebpPath);
    const reduction = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
    console.log(`  📊 Size reduction: ${reduction}% (${(originalStats.size / 1024).toFixed(1)}KB → ${(webpStats.size / 1024).toFixed(1)}KB)`);
    
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function optimizeTarotCards() {
  // 1. tarot-spread 폴더 (reading용 - PNG 파일)
  const spreadDir = path.join(__dirname, '../public/images/tarot-spread');
  const spreadOutputDir = path.join(__dirname, '../public/images/optimized/tarot-spread');
  
  // 출력 디렉토리 생성
  await fs.mkdir(spreadOutputDir, { recursive: true });
  
  // tarot-spread 폴더의 모든 PNG 파일 찾기 (재귀적)
  const spreadFiles = await findImageFiles(spreadDir, '.png');
  console.log(`\n🎴 Optimizing ${spreadFiles.length} tarot spread images (reading)...\n`);
  
  for (const file of spreadFiles) {
    const relativePath = path.relative(spreadDir, file);
    const outputSubDir = path.join(spreadOutputDir, path.dirname(relativePath));
    await fs.mkdir(outputSubDir, { recursive: true });
    await optimizeImage(file, outputSubDir, SIZES.tarot);
  }
  
  // 2. tarot 폴더 (encyclopedia용 - JPG/PNG 파일)
  const tarotDir = path.join(__dirname, '../public/images/tarot');
  const tarotOutputDir = path.join(__dirname, '../public/images/optimized/tarot');
  
  await fs.mkdir(tarotOutputDir, { recursive: true });
  
  // tarot 폴더의 이미지 파일들
  const tarotFiles = await fs.readdir(tarotDir);
  const tarotImageFiles = tarotFiles.filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
  );
  
  console.log(`\n📚 Optimizing ${tarotImageFiles.length} tarot encyclopedia images...\n`);
  
  for (const file of tarotImageFiles) {
    const inputPath = path.join(tarotDir, file);
    await optimizeImage(inputPath, tarotOutputDir, SIZES.tarot);
  }
}

// 재귀적으로 이미지 파일 찾기
async function findImageFiles(dir, extension) {
  const files = [];
  
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

async function optimizeGeneralImages() {
  const imagesDir = path.join(__dirname, '../public/images');
  const outputDir = path.join(__dirname, '../public/images/optimized');
  
  // 출력 디렉토리 생성
  await fs.mkdir(outputDir, { recursive: true });
  
  // 일반 이미지 처리 (루트 디렉토리의 이미지들)
  const files = await fs.readdir(imagesDir);
  const imageFiles = files.filter(file => 
    (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) &&
    !file.includes('tarot') // 타로 카드 제외
  );
  
  console.log(`\n🖼️  Optimizing ${imageFiles.length} general images...\n`);
  
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    await optimizeImage(inputPath, outputDir, SIZES.general);
  }
}

async function generateImageManifest() {
  const optimizedDir = path.join(__dirname, '../public/images/optimized');
  const manifest = {};
  
  async function scanDirectory(dir, basePath = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await scanDirectory(path.join(dir, entry.name), path.join(basePath, entry.name));
      } else if (entry.name.endsWith('.webp')) {
        const relativePath = path.join(basePath, entry.name);
        const stats = await fs.stat(path.join(dir, entry.name));
        
        // 원본 이미지 이름 추출
        const match = entry.name.match(/^(.+?)(-thumb|-small|-medium|-large|-sm|-md|-lg)?\.webp$/);
        if (match) {
          const originalName = match[1];
          if (!manifest[originalName]) {
            manifest[originalName] = {
              sizes: {},
              formats: ['webp']
            };
          }
          
          const sizeKey = match[2] ? match[2].substring(1) : 'original';
          manifest[originalName].sizes[sizeKey] = {
            path: `/images/optimized/${relativePath}`,
            size: stats.size
          };
        }
      }
    }
  }
  
  await scanDirectory(optimizedDir);
  
  // manifest.json 저장
  const manifestPath = path.join(__dirname, '../public/images/optimized/manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('\n📋 Generated image manifest');
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  
  const startTime = Date.now();
  
  try {
    // 타로 카드 최적화
    await optimizeTarotCards();
    
    // 일반 이미지 최적화
    await optimizeGeneralImages();
    
    // 이미지 매니페스트 생성
    await generateImageManifest();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Image optimization completed in ${duration}s`);
    
    // 최적화 결과 요약
    const tarotOriginalSize = await calculateDirectorySize(path.join(__dirname, '../public/images/tarot'));
    const tarotOptimizedSize = await calculateDirectorySize(path.join(__dirname, '../public/images/optimized/tarot'));
    const reduction = ((1 - tarotOptimizedSize / tarotOriginalSize) * 100).toFixed(1);
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   Original tarot images: ${(tarotOriginalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Optimized tarot images: ${(tarotOptimizedSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Total reduction: ${reduction}%`);
    
  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
}

async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  
  async function scan(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // 디렉토리가 없을 수 있음
    }
  }
  
  await scan(dirPath);
  return totalSize;
}

// 스크립트 실행
main();