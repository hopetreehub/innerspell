import { firestore } from '@/lib/firebase/admin';
import { FieldValue } from '@/lib/firebase/admin';
import { 
  TarotCardInstruction, 
  TarotCardInstructionFormData,
  TarotInstructionFilter,
  TarotInstructionBatchOperation,
  TarotInstructionTemplate
} from '@/types/tarot-instructions';
import { TarotCard } from '@/types/index';
import { tarotDeck } from '@/lib/tarot-data';
import { shouldUseDevelopmentFallback } from '@/lib/firebase/development-mode';

const TAROT_INSTRUCTIONS_COLLECTION = 'tarotCardInstructions';
const TAROT_TEMPLATES_COLLECTION = 'tarotInstructionTemplates';

/**
 * Service for managing tarot card interpretation instructions
 */
export class TarotInstructionsService {
  /**
   * Get all tarot card instructions with optional filtering
   */
  static async getInstructions(filter?: TarotInstructionFilter): Promise<TarotCardInstruction[]> {
    try {
      let query = firestore.collection(TAROT_INSTRUCTIONS_COLLECTION);

      // Apply filters
      if (filter?.cardId) {
        query = query.where('cardId', '==', filter.cardId);
      }
      if (filter?.interpretationMethod) {
        query = query.where('interpretationMethod', '==', filter.interpretationMethod);
      }
      if (filter?.isActive !== undefined) {
        query = query.where('isActive', '==', filter.isActive);
      }
      if (filter?.suit) {
        // We'll need to get cards first, then filter by suit
        const cardIds = tarotDeck.filter(card => card.suit === filter.suit).map(card => card.id);
        query = query.where('cardId', 'in', cardIds);
      }

      const snapshot = await query.orderBy('cardId').get();
      const instructions: TarotCardInstruction[] = [];
      
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        instructions.push({ ...data, id: doc.id } as TarotCardInstruction);
      });

      // Apply text search filter if provided
      if (filter?.searchText) {
        const searchText = filter.searchText.toLowerCase();
        return instructions.filter(instruction => 
          instruction.uprightInstruction.toLowerCase().includes(searchText) ||
          instruction.reversedInstruction.toLowerCase().includes(searchText) ||
          instruction.keywords.some(keyword => keyword.toLowerCase().includes(searchText))
        );
      }

      return instructions;
    } catch (error) {
      console.error('Error fetching tarot instructions:', error);
      throw new Error('Failed to fetch tarot card instructions');
    }
  }

  /**
   * Get instructions for a specific card
   */
  static async getInstructionsForCard(cardId: string): Promise<TarotCardInstruction[]> {
    try {
      const snapshot = await firestore
        .collection(TAROT_INSTRUCTIONS_COLLECTION)
        .where('cardId', '==', cardId)
        .where('isActive', '==', true)
        .orderBy('interpretationMethod')
        .get();
      
      const instructions: TarotCardInstruction[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        instructions.push({ ...data, id: doc.id } as TarotCardInstruction);
      });

      return instructions;
    } catch (error) {
      console.error(`Error fetching instructions for card ${cardId}:`, error);
      throw new Error(`Failed to fetch instructions for card ${cardId}`);
    }
  }

  /**
   * Get instruction for a specific card and interpretation method
   */
  static async getInstruction(cardId: string, interpretationMethod: string): Promise<TarotCardInstruction | null> {
    // Development fallback - 기본 지침 반환
    if (shouldUseDevelopmentFallback()) {
      const card = tarotDeck.find(c => c.id === cardId);
      if (!card) return null;
      
      // 스타일별 기본 지침 생성
      const styleSpecificText = {
        'traditional-rws': '전통적 웨이트 관점에서',
        'thoth-crowley': '토트 카발라 체계에서',
        'psychological-jungian': '융의 원형 심리학적 관점에서',
        'spiritual-growth': '영적 성장의 관점에서',
        'practical-action': '실용적 행동 중심으로',
        'shadow-work': '그림자 작업의 관점에서',
        'realistic-insight': '현실적이고 직설적으로'
      };
      
      const prefix = styleSpecificText[interpretationMethod] || '타로의 지혜로';
      
      return {
        id: `${cardId}-${interpretationMethod}`,
        cardId,
        interpretationMethod,
        uprightInstruction: `${prefix} ${card.meaningUpright}`,
        reversedInstruction: `${prefix} ${card.meaningReversed}`,
        keywords: card.keywords || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      } as TarotCardInstruction;
    }
    
    try {
      const snapshot = await firestore
        .collection(TAROT_INSTRUCTIONS_COLLECTION)
        .where('cardId', '==', cardId)
        .where('interpretationMethod', '==', interpretationMethod)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return { ...data, id: doc.id } as TarotCardInstruction;
    } catch (error) {
      console.error(`Error fetching instruction for card ${cardId} with method ${interpretationMethod}:`, error);
      
      // 에러 발생 시에도 기본 지침 반환
      const card = tarotDeck.find(c => c.id === cardId);
      if (!card) return null;
      
      return {
        id: `${cardId}-${interpretationMethod}`,
        cardId,
        interpretationMethod,
        uprightInstruction: card.meaningUpright,
        reversedInstruction: card.meaningReversed,
        keywords: card.keywords || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      } as TarotCardInstruction;
    }
  }

  /**
   * Save or update a tarot card instruction
   */
  static async saveInstruction(
    data: TarotCardInstructionFormData,
    userId: string,
    instructionId?: string
  ): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      // Verify the card exists
      const cardExists = tarotDeck.some(card => card.id === data.cardId);
      if (!cardExists) {
        return {
          success: false,
          message: `Card with ID ${data.cardId} does not exist`
        };
      }

      const instructionData: Partial<TarotCardInstruction> = {
        ...data,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      let docRef;
      if (instructionId) {
        // Update existing instruction
        docRef = firestore.collection(TAROT_INSTRUCTIONS_COLLECTION).doc(instructionId);
        await docRef.update(instructionData);
      } else {
        // Create new instruction
        instructionData.createdAt = new Date();
        instructionData.createdBy = userId;
        docRef = await firestore.collection(TAROT_INSTRUCTIONS_COLLECTION).add(instructionData);
      }

      return {
        success: true,
        message: `Instruction ${instructionId ? 'updated' : 'created'} successfully`,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error saving tarot instruction:', error);
      return {
        success: false,
        message: `Failed to save instruction: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete a tarot card instruction
   */
  static async deleteInstruction(instructionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await firestore.collection(TAROT_INSTRUCTIONS_COLLECTION).doc(instructionId).delete();

      return {
        success: true,
        message: 'Instruction deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting tarot instruction:', error);
      return {
        success: false,
        message: `Failed to delete instruction: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Perform batch operations on instructions
   */
  static async batchOperation(
    operation: TarotInstructionBatchOperation,
    userId: string
  ): Promise<{ success: boolean; message: string; processedCount: number }> {
    try {
      const batch = firestore.batch();
      let processedCount = 0;

      for (const instructionId of operation.instructionIds) {
        const docRef = firestore.collection(TAROT_INSTRUCTIONS_COLLECTION).doc(instructionId);
        
        switch (operation.operation) {
          case 'activate':
            batch.update(docRef, { 
              isActive: true, 
              updatedAt: new Date(), 
              updatedBy: userId 
            });
            break;
          case 'deactivate':
            batch.update(docRef, { 
              isActive: false, 
              updatedAt: new Date(), 
              updatedBy: userId 
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          case 'update-method':
            if (operation.newInterpretationMethod) {
              batch.update(docRef, { 
                interpretationMethod: operation.newInterpretationMethod,
                updatedAt: new Date(), 
                updatedBy: userId 
              });
            }
            break;
        }
        processedCount++;
      }

      await batch.commit();

      return {
        success: true,
        message: `Batch operation completed successfully on ${processedCount} instructions`,
        processedCount
      };
    } catch (error) {
      console.error('Error performing batch operation:', error);
      return {
        success: false,
        message: `Failed to perform batch operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processedCount: 0
      };
    }
  }

  /**
   * Import instructions from a template
   */
  static async importTemplate(
    template: TarotInstructionTemplate,
    userId: string,
    overwriteExisting: boolean = false
  ): Promise<{ success: boolean; message: string; importedCount: number; skippedCount: number }> {
    try {
      const batch = firestore.batch();
      let importedCount = 0;
      let skippedCount = 0;

      for (const cardInstruction of template.cards) {
        // Check if instruction already exists
        const existingSnapshot = await firestore
          .collection(TAROT_INSTRUCTIONS_COLLECTION)
          .where('cardId', '==', cardInstruction.cardId)
          .where('interpretationMethod', '==', cardInstruction.interpretationMethod)
          .limit(1)
          .get();

        if (!existingSnapshot.empty && !overwriteExisting) {
          skippedCount++;
          continue;
        }

        const instructionData: Partial<TarotCardInstruction> = {
          ...cardInstruction,
          createdAt: new Date(),
          createdBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
        };

        if (!existingSnapshot.empty) {
          // Update existing
          const docRef = existingSnapshot.docs[0].ref;
          batch.update(docRef, instructionData);
        } else {
          // Create new
          const docRef = firestore.collection(TAROT_INSTRUCTIONS_COLLECTION).doc();
          batch.set(docRef, instructionData);
        }

        importedCount++;
      }

      await batch.commit();

      // Save the template metadata
      await firestore.collection(TAROT_TEMPLATES_COLLECTION).add({
        ...template,
        createdAt: new Date(),
        importedBy: userId,
      });

      return {
        success: true,
        message: `Template imported successfully. ${importedCount} instructions imported, ${skippedCount} skipped.`,
        importedCount,
        skippedCount
      };
    } catch (error) {
      console.error('Error importing template:', error);
      return {
        success: false,
        message: `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        importedCount: 0,
        skippedCount: 0
      };
    }
  }

  /**
   * Export instructions as a template
   */
  static async exportTemplate(
    interpretationMethod: string,
    templateName: string,
    templateDescription: string,
    userId: string
  ): Promise<{ success: boolean; message: string; template?: TarotInstructionTemplate }> {
    try {
      const instructions = await this.getInstructions({ 
        interpretationMethod, 
        isActive: true 
      });

      if (instructions.length === 0) {
        return {
          success: false,
          message: `No active instructions found for method ${interpretationMethod}`
        };
      }

      const template: TarotInstructionTemplate = {
        name: templateName,
        description: templateDescription,
        interpretationMethod,
        author: userId,
        version: '1.0',
        cards: instructions.map(instruction => ({
          cardId: instruction.cardId,
          interpretationMethod: instruction.interpretationMethod,
          uprightInstruction: instruction.uprightInstruction,
          reversedInstruction: instruction.reversedInstruction,
          keywords: instruction.keywords,
          symbolism: instruction.symbolism,
          numerology: instruction.numerology,
          astrology: instruction.astrology,
          element: instruction.element,
          chakra: instruction.chakra,
          archetype: instruction.archetype,
          shadow: instruction.shadow,
          advice: instruction.advice,
          questionPrompts: instruction.questionPrompts,
          combinationNotes: instruction.combinationNotes,
          customPromptAddition: instruction.customPromptAddition,
          isActive: instruction.isActive,
        })),
        createdAt: new Date(),
      };

      return {
        success: true,
        message: `Template exported successfully with ${instructions.length} instructions`,
        template
      };
    } catch (error) {
      console.error('Error exporting template:', error);
      return {
        success: false,
        message: `Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get statistics about instructions
   */
  static async getInstructionStats(): Promise<{
    totalInstructions: number;
    activeInstructions: number;
    instructionsByMethod: Record<string, number>;
    instructionsByCard: Record<string, number>;
    completionPercentage: number;
  }> {
    try {
      const allInstructions = await this.getInstructions();
      const activeInstructions = allInstructions.filter(i => i.isActive);
      
      const instructionsByMethod: Record<string, number> = {};
      const instructionsByCard: Record<string, number> = {};
      
      allInstructions.forEach(instruction => {
        instructionsByMethod[instruction.interpretationMethod] = 
          (instructionsByMethod[instruction.interpretationMethod] || 0) + 1;
        instructionsByCard[instruction.cardId] = 
          (instructionsByCard[instruction.cardId] || 0) + 1;
      });

      // Calculate completion percentage (instructions vs total possible combinations)
      const totalPossibleCombinations = tarotDeck.length * 6; // 6 interpretation methods
      const completionPercentage = (activeInstructions.length / totalPossibleCombinations) * 100;

      return {
        totalInstructions: allInstructions.length,
        activeInstructions: activeInstructions.length,
        instructionsByMethod,
        instructionsByCard,
        completionPercentage
      };
    } catch (error) {
      console.error('Error getting instruction stats:', error);
      throw new Error('Failed to get instruction statistics');
    }
  }
}