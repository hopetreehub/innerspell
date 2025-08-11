import { z } from 'zod';
import { TarotInterpretationMethod } from './index';

// Schema for card-specific interpretation instructions
export const TarotCardInstructionSchema = z.object({
  id: z.string(),
  cardId: z.string(), // References the TarotCard id
  interpretationMethod: z.string(), // TarotInterpretationMethod
  uprightInstruction: z.string().min(1, 'Upright instruction is required'),
  reversedInstruction: z.string().min(1, 'Reversed instruction is required'),
  keywords: z.array(z.string()).default([]),
  symbolism: z.object({
    primary: z.array(z.string()).default([]),
    secondary: z.array(z.string()).default([]),
  }).optional(),
  numerology: z.string().optional(),
  astrology: z.string().optional(),
  element: z.string().optional(),
  chakra: z.string().optional(),
  archetype: z.string().optional(),
  shadow: z.string().optional(),
  advice: z.object({
    general: z.string().optional(),
    love: z.string().optional(),
    career: z.string().optional(),
    spiritual: z.string().optional(),
  }).optional(),
  questionPrompts: z.array(z.string()).default([]),
  combinationNotes: z.record(z.string(), z.string()).optional(), // cardId -> combination meaning
  customPromptAddition: z.string().optional(), // Additional prompt text for this specific card
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});
export type TarotCardInstruction = z.infer<typeof TarotCardInstructionSchema>;

// Bulk instruction template for importing/exporting
export const TarotInstructionTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  interpretationMethod: z.string(),
  author: z.string().optional(),
  version: z.string().default('1.0'),
  cards: z.array(TarotCardInstructionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  })),
  globalPromptTemplate: z.string().optional(),
  createdAt: z.date().optional(),
});
export type TarotInstructionTemplate = z.infer<typeof TarotInstructionTemplateSchema>;

// Form schemas for UI
export const TarotCardInstructionFormSchema = TarotCardInstructionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});
export type TarotCardInstructionFormData = z.infer<typeof TarotCardInstructionFormSchema>;

// Search/Filter schema
export const TarotInstructionFilterSchema = z.object({
  cardId: z.string().optional(),
  interpretationMethod: z.string().optional(),
  searchText: z.string().optional(),
  isActive: z.boolean().optional(),
  suit: z.enum(['major', 'wands', 'cups', 'swords', 'pentacles']).optional(),
});
export type TarotInstructionFilter = z.infer<typeof TarotInstructionFilterSchema>;

// Batch operation schema
export const TarotInstructionBatchOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'update-method']),
  instructionIds: z.array(z.string()).min(1, 'At least one instruction must be selected'),
  newInterpretationMethod: z.string().optional(), // For update-method operation
});
export type TarotInstructionBatchOperation = z.infer<typeof TarotInstructionBatchOperationSchema>;