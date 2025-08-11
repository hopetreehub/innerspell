import { config } from 'dotenv';
config();

import '@/ai/flows/configure-ai-prompt-settings.ts';
import '@/ai/flows/generate-tarot-interpretation.ts';
import '@/ai/flows/configure-dream-prompt-settings.ts';
import '@/ai/flows/generate-dream-interpretation.ts';
import '@/ai/flows/generate-dream-clarification-questions.ts';
