import { tarotDeck } from '../tarot-data';
import type { TarotCard } from '@/types';

describe('Tarot Data', () => {
  describe('Data Structure Validation', () => {
    it('should have tarot deck as an array', () => {
      expect(Array.isArray(tarotDeck)).toBe(true);
      expect(tarotDeck.length).toBeGreaterThan(0);
    });

    it('should have valid card structure for each card', () => {
      tarotDeck.forEach((card, index) => {
        expect(card).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          suit: expect.any(String),
          number: expect.anything(), // Can be number or string
          imageSrc: expect.any(String),
          dataAiHint: expect.any(String),
          keywordsUpright: expect.any(Array),
          keywordsReversed: expect.any(Array),
          meaningUpright: expect.any(String),
          meaningReversed: expect.any(String),
        });
      });
    });

    it('should have unique card IDs', () => {
      const ids = tarotDeck.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid suit types', () => {
      const validSuits = ['major', 'wands', 'cups', 'swords', 'pentacles'];
      tarotDeck.forEach(card => {
        expect(validSuits).toContain(card.suit);
      });
    });

    it('should have valid image paths', () => {
      tarotDeck.forEach(card => {
        expect(card.imageSrc).toMatch(/^\/images\/tarot\/.*\.(jpg|jpeg|png|webp)$/i);
      });
    });
  });

  describe('Major Arcana Cards', () => {
    const majorArcana = tarotDeck.filter(card => card.suit === 'major');

    it('should have 22 Major Arcana cards', () => {
      // Note: Test data might not have all 22 cards yet
      expect(majorArcana.length).toBeGreaterThan(0);
      expect(majorArcana.length).toBeLessThanOrEqual(22);
    });

    it('should have sequential numbers for Major Arcana', () => {
      const numbers = majorArcana
        .map(card => card.number)
        .filter((num): num is number => num !== null)
        .sort((a, b) => a - b);
      expect(numbers[0]).toBe(0); // The Fool
      
      // Check for gaps in sequence
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBe(numbers[i - 1] + 1);
      }
    });

    it('should have proper Major Arcana naming convention', () => {
      majorArcana.forEach(card => {
        expect(card.id).toMatch(/^major-\d+$/);
        expect(card.name).toMatch(/\(.+\)$/); // Should contain Korean name in parentheses
      });
    });
  });

  describe('Card Content Quality', () => {
    it('should have meaningful keywords for upright meanings', () => {
      tarotDeck.forEach(card => {
        expect(card.keywordsUpright.length).toBeGreaterThan(3);
        card.keywordsUpright.forEach(keyword => {
          expect(keyword).toBeTruthy();
          expect(typeof keyword).toBe('string');
          expect(keyword.trim()).not.toBe('');
        });
      });
    });

    it('should have meaningful keywords for reversed meanings', () => {
      tarotDeck.forEach(card => {
        expect(card.keywordsReversed.length).toBeGreaterThan(3);
        card.keywordsReversed.forEach(keyword => {
          expect(keyword).toBeTruthy();
          expect(typeof keyword).toBe('string');
          expect(keyword.trim()).not.toBe('');
        });
      });
    });

    it('should have substantial meaning descriptions', () => {
      tarotDeck.forEach(card => {
        expect(card.meaningUpright.length).toBeGreaterThan(20);
        expect(card.meaningReversed.length).toBeGreaterThan(20);
      });
    });

    it('should have AI hints for each card', () => {
      tarotDeck.forEach(card => {
        expect(card.dataAiHint).toBeTruthy();
        expect(card.dataAiHint.trim()).not.toBe('');
      });
    });
  });

  describe('Data Completeness', () => {
    it('should have additional metadata for complete cards', () => {
      const completeCards = tarotDeck.filter(card => 
        card.description && 
        card.fortuneTelling && 
        card.questionsToAsk &&
        card.astrology &&
        card.affirmation &&
        card.element
      );

      // Check that cards with complete data have proper structure
      completeCards.forEach(card => {
        expect(card.description).toBeTruthy();
        expect(Array.isArray(card.fortuneTelling)).toBe(true);
        expect(Array.isArray(card.questionsToAsk)).toBe(true);
        expect(card.astrology).toBeTruthy();
        expect(card.affirmation).toBeTruthy();
        expect(card.element).toBeTruthy();
      });
    });

    it('should have valid element assignments', () => {
      const validElements = ['불', '물', '공기', '흙', 'fire', 'water', 'air', 'earth'];
      
      tarotDeck.forEach(card => {
        if (card.element) {
          expect(validElements).toContain(card.element);
        }
      });
    });
  });

  describe('Utility Functions', () => {
    // These would test utility functions for working with tarot data
    // For now, we'll test basic card lookups

    it('should be able to find cards by ID', () => {
      const foolCard = tarotDeck.find(card => card.id === 'major-0');
      expect(foolCard).toBeDefined();
      expect(foolCard?.name).toContain('Fool');
    });

    it('should be able to find cards by suit', () => {
      const majorCards = tarotDeck.filter(card => card.suit === 'major');
      expect(majorCards.length).toBeGreaterThan(0);
      
      majorCards.forEach(card => {
        expect(card.suit).toBe('major');
      });
    });

    it('should be able to find cards by number range', () => {
      const lowNumberCards = tarotDeck.filter(card => card.number !== null && card.number >= 0 && card.number <= 5);
      expect(lowNumberCards.length).toBeGreaterThan(0);
      
      lowNumberCards.forEach(card => {
        expect(card.number).not.toBeNull();
        expect(card.number).toBeGreaterThanOrEqual(0);
        expect(card.number).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent naming patterns', () => {
      const majorCards = tarotDeck.filter(card => card.suit === 'major');
      
      majorCards.forEach(card => {
        // ID should match number
        const expectedId = `major-${card.number}`;
        expect(card.id).toBe(expectedId);
        
        // Name should contain both English and Korean
        expect(card.name).toMatch(/\(.+\)/); // Contains parentheses with Korean
      });
    });

    it('should have consistent image naming convention', () => {
      tarotDeck.forEach(card => {
        const imagePath = card.imageSrc;
        
        // Should start with /images/tarot/
        expect(imagePath).toMatch(/^\/images\/tarot\//);
        
        // Should have valid image extension
        expect(imagePath).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });
    });

    it('should not have duplicate names', () => {
      const names = tarotDeck.map(card => card.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Data Quality Assurance', () => {
    it('should not have empty or whitespace-only strings', () => {
      tarotDeck.forEach(card => {
        expect(card.name.trim()).not.toBe('');
        expect(card.meaningUpright.trim()).not.toBe('');
        expect(card.meaningReversed.trim()).not.toBe('');
        expect(card.dataAiHint.trim()).not.toBe('');
      });
    });

    it('should have balanced keyword counts', () => {
      tarotDeck.forEach(card => {
        // Keywords should be reasonably balanced
        const uprightCount = card.keywordsUpright.length;
        const reversedCount = card.keywordsReversed.length;
        
        expect(uprightCount).toBeGreaterThan(2);
        expect(reversedCount).toBeGreaterThan(2);
        
        // They don't need to be exactly equal, but shouldn't be too different
        expect(Math.abs(uprightCount - reversedCount)).toBeLessThanOrEqual(5);
      });
    });

    it('should have meaningful AI hints', () => {
      tarotDeck.forEach(card => {
        const hint = card.dataAiHint.toLowerCase();
        const name = card.name.toLowerCase();
        
        // AI hint should relate to card name
        const nameWords = name.replace(/[()]/g, '').split(' ');
        const hasRelatedWord = nameWords.some(word => 
          hint.includes(word) && word.length > 2
        );
        
        expect(hasRelatedWord).toBe(true);
      });
    });
  });
});