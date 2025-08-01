/**
 * Tarot Image Configuration
 * Centralizes the image source management for different tarot features
 */

export const TAROT_IMAGE_CONFIG = {
  // Base paths for different image sets
  basePaths: {
    original: '/images/tarot',      // Original images for menu/encyclopedia
    spread: '/images/tarot-spread', // New images for card reading/spreading
  },
  
  // Feature-specific image source selectors
  features: {
    // Tarot menu/encyclopedia uses original images
    encyclopedia: {
      basePath: '/images/tarot',
      cardBack: '/images/tarot/back.png',
    },
    
    // Card reading/spreading uses new images
    reading: {
      basePath: '/images/tarot-spread',
      cardBack: '/images/tarot-spread/back/back.png',
    },
  },
  
  // Helper function to get image path based on feature
  getImagePath(feature: 'encyclopedia' | 'reading', filename: string): string {
    const config = this.features[feature];
    
    // Handle card back specifically
    if (filename === 'back.png' || filename === 'back') {
      return config.cardBack;
    }
    
    // For regular card images
    return `${config.basePath}/${filename}`;
  },
  
  // Convert old path to new path for reading feature
  convertPathForReading(originalPath: string): string {
    // If it's already using the spread path, return as is
    if (originalPath.includes('/images/tarot-spread/')) {
      return originalPath;
    }
    
    // Convert from .jpg to .png for spread images
    if (originalPath.includes('/images/tarot/')) {
      const filename = originalPath.split('/').pop() || '';
      const newFilename = filename.replace('.jpg', '.png');
      return this.getImagePath('reading', newFilename);
    }
    
    return originalPath;
  },
  
  // Performance optimization settings
  imageOptimization: {
    // Sizes for Next.js Image optimization
    sizes: {
      reading: '(max-width: 640px) 140px, (max-width: 768px) 180px, 240px',
      encyclopedia: '(max-width: 640px) 200px, (max-width: 768px) 300px, 400px',
    },
    
    // Priority loading for first N cards
    priorityCount: {
      reading: 10,
      encyclopedia: 6,
    },
    
    // Lazy loading settings
    lazyLoading: {
      rootMargin: '50px',
      threshold: 0.01,
    },
  },
};

// Type-safe image path helper
export function getTarotImagePath(
  feature: 'encyclopedia' | 'reading',
  cardId: string,
  isCardBack: boolean = false
): string {
  if (isCardBack) {
    return TAROT_IMAGE_CONFIG.features[feature].cardBack;
  }
  
  // Map card IDs to filenames
  const filenameMap: Record<string, string> = {
    // Major Arcana
    'major-0': '00-TheFool',
    'major-1': '01-TheMagician',
    'major-2': '02-TheHighPriestess',
    'major-3': '03-TheEmpress',
    'major-4': '04-TheEmperor',
    'major-5': '05-TheHierophant',
    'major-6': '06-TheLovers',
    'major-7': '07-TheChariot',
    'major-8': '08-Strength',
    'major-9': '09-TheHermit',
    'major-10': '10-WheelOfFortune',
    'major-11': '11-Justice',
    'major-12': '12-TheHangedMan',
    'major-13': '13-Death',
    'major-14': '14-Temperance',
    'major-15': '15-TheDevil',
    'major-16': '16-TheTower',
    'major-17': '17-TheStar',
    'major-18': '18-TheMoon',
    'major-19': '19-TheSun',
    'major-20': '20-Judgement',
    'major-21': '21-TheWorld',
    
    // Minor Arcana - Wands
    'wands-1': 'Wands01',
    'wands-2': 'Wands02',
    'wands-3': 'Wands03',
    'wands-4': 'Wands04',
    'wands-5': 'Wands05',
    'wands-6': 'Wands06',
    'wands-7': 'Wands07',
    'wands-8': 'Wands08',
    'wands-9': 'Wands09',
    'wands-10': 'Wands10',
    'wands-page': 'Wands11',
    'wands-knight': 'Wands12',
    'wands-queen': 'Wands13',
    'wands-king': 'Wands14',
    
    // Minor Arcana - Cups
    'cups-1': 'Cups01',
    'cups-2': 'Cups02',
    'cups-3': 'Cups03',
    'cups-4': 'Cups04',
    'cups-5': 'Cups05',
    'cups-6': 'Cups06',
    'cups-7': 'Cups07',
    'cups-8': 'Cups08',
    'cups-9': 'Cups09',
    'cups-10': 'Cups10',
    'cups-page': 'Cups11',
    'cups-knight': 'Cups12',
    'cups-queen': 'Cups13',
    'cups-king': 'Cups14',
    
    // Minor Arcana - Swords
    'swords-1': 'Swords01',
    'swords-2': 'Swords02',
    'swords-3': 'Swords03',
    'swords-4': 'Swords04',
    'swords-5': 'Swords05',
    'swords-6': 'Swords06',
    'swords-7': 'Swords07',
    'swords-8': 'Swords08',
    'swords-9': 'Swords09',
    'swords-10': 'Swords10',
    'swords-page': 'Swords11',
    'swords-knight': 'Swords12',
    'swords-queen': 'Swords13',
    'swords-king': 'Swords14',
    
    // Minor Arcana - Pentacles
    'pentacles-1': 'Pentacles01',
    'pentacles-2': 'Pentacles02',
    'pentacles-3': 'Pentacles03',
    'pentacles-4': 'Pentacles04',
    'pentacles-5': 'Pentacles05',
    'pentacles-6': 'Pentacles06',
    'pentacles-7': 'Pentacles07',
    'pentacles-8': 'Pentacles08',
    'pentacles-9': 'Pentacles09',
    'pentacles-10': 'Pentacles10',
    'pentacles-page': 'Pentacles11',
    'pentacles-knight': 'Pentacles12',
    'pentacles-queen': 'Pentacles13',
    'pentacles-king': 'Pentacles14',
  };
  
  const filename = filenameMap[cardId];
  if (!filename) {
    console.warn(`[TAROT_IMAGE_CONFIG] Unknown card ID: ${cardId}`);
    return TAROT_IMAGE_CONFIG.features[feature].cardBack;
  }
  
  const extension = feature === 'reading' ? '.png' : '.jpg';
  return TAROT_IMAGE_CONFIG.getImagePath(feature, filename + extension);
}