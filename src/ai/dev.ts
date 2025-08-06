import { config } from 'dotenv';
config();

// import '@/ai/flows/configure-ai-prompt-settings.ts'; // 임시 비활성화
import '@/ai/flows/generate-tarot-interpretation.ts';
// import '@/ai/flows/configure-dream-prompt-settings.ts'; // 임시 비활성화
import '@/ai/flows/generate-dream-interpretation.ts';
import '@/ai/flows/generate-dream-clarification-questions.ts';
