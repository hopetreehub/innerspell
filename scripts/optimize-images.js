const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 이미지 최적화 설정
const CONFIG = {
  inputDirs: [
    'public/images/tarot',
    'public/images/tarot-spread',
    'public/images/blog'
  ],
  formats: {
    webp: { quality: 85 },
    original: { quality: 90 }
  },
  sizes: {
    // 타로 카드용 사이즈
    tarot: [
      { width: 140, suffix: 'sm' },  // 모바일
      { width: 240, suffix: 'md' },  // 태블릿
      { width: 400, suffix: 'lg' }   // 데스크톱
    ],
    // 블로그 이미지용 사이즈
    blog: [
      { width: 640, suffix: 'sm' },
      { width: 1024, suffix: 'md' },
      { width: 1920, suffix: 'lg' }
    ]
  }
};

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const ext = path.extname(inputPath).toLowerCase();
  
  // 이미지 타입 결정 (타로 또는 블로그)
  const isTarot = inputPath.includes('tarot');
  const sizes = isTarot ? CONFIG.sizes.tarot : CONFIG.sizes.blog;
  
  console.log(`🔄 최적화 중: ${filename}${ext}`);
  
  try {
    // 원본 이미지 최적화
    await sharp(inputPath)
      .jpeg({ quality: CONFIG.formats.original.quality })
      .toFile(path.join(outputDir, 'optimized', `${filename}${ext}`));
    
    // WebP 변환
    await sharp(inputPath)
      .webp(CONFIG.formats.webp)
      .toFile(path.join(outputDir, 'webp', `${filename}.webp`));
    
    // 반응형 사이즈 생성
    for (const size of sizes) {
      // 원본 포맷으로 리사이즈
      await sharp(inputPath)
        .resize(size.width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: CONFIG.formats.original.quality })
        .toFile(path.join(outputDir, 'responsive', `${filename}-${size.suffix}${ext}`));
      
      // WebP 포맷으로 리사이즈
      await sharp(inputPath)
        .resize(size.width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp(CONFIG.formats.webp)
        .toFile(path.join(outputDir, 'responsive', `${filename}-${size.suffix}.webp`));
    }
    
    console.log(`✅ 완료: ${filename}`);
  } catch (error) {
    console.error(`❌ 오류 (${filename}):`, error.message);
  }
}

async function ensureDirectories(baseDir) {
  const dirs = ['optimized', 'webp', 'responsive'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(baseDir, dir), { recursive: true });
  }
}

async function processDirectory(inputDir) {
  try {
    await fs.access(inputDir);
  } catch {
    console.log(`⚠️  디렉토리 없음: ${inputDir}`);
    return;
  }
  
  console.log(`\n📁 처리 중: ${inputDir}`);
  
  await ensureDirectories(inputDir);
  
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file) && !file.includes('-sm') && !file.includes('-md') && !file.includes('-lg')
  );
  
  console.log(`📸 이미지 ${imageFiles.length}개 발견`);
  
  for (const file of imageFiles) {
    await optimizeImage(path.join(inputDir, file), inputDir);
  }
}

async function main() {
  console.log('🚀 이미지 최적화 시작...\n');
  
  // sharp 설치 확인
  try {
    require.resolve('sharp');
  } catch {
    console.error('❌ sharp 패키지가 필요합니다. 다음 명령어로 설치해주세요:');
    console.error('npm install --save-dev sharp');
    process.exit(1);
  }
  
  for (const dir of CONFIG.inputDirs) {
    await processDirectory(dir);
  }
  
  console.log('\n✨ 이미지 최적화 완료!');
  console.log('\n📝 다음 단계:');
  console.log('1. OptimizedImage 컴포넌트 사용');
  console.log('2. next.config.js에 이미지 도메인 설정');
  console.log('3. 반응형 이미지 소스셋 적용');
}

main().catch(console.error);