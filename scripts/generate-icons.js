const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/logo.png');
  const outputDir = path.join(__dirname, '../public/icons');

  try {
    // 디렉토리 확인
    await fs.mkdir(outputDir, { recursive: true });

    // 각 크기별로 아이콘 생성
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 139, g: 92, b: 246, alpha: 0 } // 보라색 배경
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Created icon: ${outputPath}`);
    }

    // Maskable 아이콘 생성 (더 많은 여백을 가진 버전)
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(Math.round(size * 0.8), Math.round(size * 0.8), {
          fit: 'contain',
          background: { r: 139, g: 92, b: 246, alpha: 1 } // 불투명 보라색 배경
        })
        .extend({
          top: Math.round(size * 0.1),
          bottom: Math.round(size * 0.1),
          left: Math.round(size * 0.1),
          right: Math.round(size * 0.1),
          background: { r: 139, g: 92, b: 246, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Created maskable icon: ${outputPath}`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// sharp가 설치되어 있는지 확인
try {
  require.resolve('sharp');
  generateIcons();
} catch (e) {
  console.log('Sharp is not installed. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install sharp', { stdio: 'inherit' });
  console.log('Sharp installed. Run this script again to generate icons.');
}