import { TarotCard } from '@/types/tarot';

// Cache for loaded data
let majorArcanaCache: TarotCard[] | null = null;
let minorArcanaCache: Record<string, TarotCard[]> = {};
let allCardsCache: TarotCard[] | null = null;

export interface TarotStats {
  total: number;
  majorArcana: number;
  minorArcana: number;
  suits: Record<string, number>;
}

// Lazy load major arcana cards
export async function loadMajorArcanaCards(): Promise<TarotCard[]> {
  if (majorArcanaCache) {
    return majorArcanaCache;
  }

  const { allMajorArcanaCards } = await import('@/data/all-major-arcana');
  majorArcanaCache = allMajorArcanaCards;
  return majorArcanaCache;
}

// Lazy load minor arcana by suit
export async function loadMinorArcanaBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): Promise<TarotCard[]> {
  if (minorArcanaCache[suit]) {
    return minorArcanaCache[suit];
  }

  let suitCards: TarotCard[];
  
  switch (suit) {
    case 'wands':
      const { wandsCards } = await import('@/data/minor-arcana-wands');
      suitCards = wandsCards;
      break;
    case 'cups':
      const { cupsCards } = await import('@/data/minor-arcana-cups');
      suitCards = cupsCards;
      break;
    case 'swords':
      const { swordsCards } = await import('@/data/minor-arcana-swords');
      suitCards = swordsCards;
      break;
    case 'pentacles':
      const { pentaclesCards } = await import('@/data/minor-arcana-pentacles');
      suitCards = pentaclesCards;
      break;
  }

  minorArcanaCache[suit] = suitCards;
  return suitCards;
}

// Lazy load all minor arcana cards
export async function loadAllMinorArcanaCards(): Promise<TarotCard[]> {
  const [wands, cups, swords, pentacles] = await Promise.all([
    loadMinorArcanaBySuit('wands'),
    loadMinorArcanaBySuit('cups'),
    loadMinorArcanaBySuit('swords'),
    loadMinorArcanaBySuit('pentacles'),
  ]);

  return [...wands, ...cups, ...swords, ...pentacles];
}

// Lazy load all cards
export async function loadAllTarotCards(): Promise<TarotCard[]> {
  if (allCardsCache) {
    return allCardsCache;
  }

  const [majorCards, minorCards] = await Promise.all([
    loadMajorArcanaCards(),
    loadAllMinorArcanaCards(),
  ]);

  allCardsCache = [...majorCards, ...minorCards];
  return allCardsCache;
}

// Load major arcana journey data
export async function loadMajorArcanaJourney() {
  const { majorArcanaJourney } = await import('@/data/all-major-arcana');
  return majorArcanaJourney;
}

// Get tarot stats
export async function getTarotStats(): Promise<TarotStats> {
  const [majorCards, wands, cups, swords, pentacles] = await Promise.all([
    loadMajorArcanaCards(),
    loadMinorArcanaBySuit('wands'),
    loadMinorArcanaBySuit('cups'),
    loadMinorArcanaBySuit('swords'),
    loadMinorArcanaBySuit('pentacles'),
  ]);

  return {
    total: majorCards.length + wands.length + cups.length + swords.length + pentacles.length,
    majorArcana: majorCards.length,
    minorArcana: wands.length + cups.length + swords.length + pentacles.length,
    suits: {
      wands: wands.length,
      cups: cups.length,
      swords: swords.length,
      pentacles: pentacles.length,
    },
  };
}

// Find card by ID (with optimized loading)
export async function findCardById(id: string): Promise<TarotCard | undefined> {
  // Try to find in cache first
  if (allCardsCache) {
    return allCardsCache.find(card => card.id === id);
  }

  // Load data incrementally
  const majorCards = await loadMajorArcanaCards();
  const foundInMajor = majorCards.find(card => card.id === id);
  if (foundInMajor) {
    return foundInMajor;
  }

  // Try each suit
  for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
    const suitCards = await loadMinorArcanaBySuit(suit);
    const foundInSuit = suitCards.find(card => card.id === id);
    if (foundInSuit) {
      return foundInSuit;
    }
  }

  return undefined;
}

// Clear cache (useful for development)
export function clearTarotDataCache() {
  majorArcanaCache = null;
  minorArcanaCache = {};
  allCardsCache = null;
}